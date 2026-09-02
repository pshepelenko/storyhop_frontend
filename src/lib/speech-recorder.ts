import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetchAsGuest } from './api-client';
import { captureAnalyticsEvent } from './analytics';

export type SpeechRecorderPhase = 'idle' | 'requesting' | 'recording' | 'checking';
export type SpeechRecorderError =
  | 'unsupported'
  | 'not-allowed'
  | 'audio-capture'
  | 'empty'
  | 'network'
  | 'rate-limited'
  | 'transcription-failed';

export class SpeechRecorderRequestError extends Error {
  constructor(public readonly code: SpeechRecorderError) {
    super(code);
  }
}

type RecordedAudio = { blob: Blob; durationMs: number };
type Options = {
  source: 'inline' | 'story' | 'home';
  onRecordedAudio: (audio: RecordedAudio) => Promise<void>;
  maxDurationMs?: number;
};

const MIME_CANDIDATES = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];

function recorderError(error: unknown): SpeechRecorderError {
  const name = String((error as { name?: string } | null)?.name || '').toLowerCase();
  if (name === 'notallowederror' || name === 'securityerror') return 'not-allowed';
  if (name === 'notfounderror' || name === 'notreadableerror' || name === 'aborterror') return 'audio-capture';
  return 'transcription-failed';
}

export function getSpeechRecorderErrorMessage(error: SpeechRecorderError, language: 'russian' | 'english') {
  const russian: Record<SpeechRecorderError, string> = {
    unsupported: 'Запись голоса недоступна в этом браузере.',
    'not-allowed': 'Разрешите доступ к микрофону в Safari и попробуйте ещё раз.',
    'audio-capture': 'Не получилось использовать микрофон. Проверьте доступ и попробуйте ещё раз.',
    empty: 'Мы ничего не записали. Нажмите микрофон и скажите фразу ещё раз.',
    network: 'Для проверки фразы нужен интернет. Проверьте соединение и попробуйте ещё раз.',
    'rate-limited': 'Сделайте небольшую паузу и попробуйте ещё раз.',
    'transcription-failed': 'Не удалось проверить фразу. Попробуйте ещё раз.',
  };
  const english: Record<SpeechRecorderError, string> = {
    unsupported: 'Voice recording is not available in this browser.',
    'not-allowed': 'Allow microphone access in Safari, then try again.',
    'audio-capture': 'We could not use the microphone. Check access and try again.',
    empty: 'We did not record anything. Tap the microphone and say the line again.',
    network: 'Checking your phrase needs an internet connection. Try again when you are online.',
    'rate-limited': 'Please wait a moment, then try again.',
    'transcription-failed': 'We could not check the phrase. Please try again.',
  };
  return (language === 'russian' ? russian : english)[error];
}

export async function transcribeSpeakingAudio(seasonId: string, audio: RecordedAudio): Promise<string> {
  const form = new FormData();
  const extension = audio.blob.type.includes('webm') ? 'webm' : 'm4a';
  form.append('audio', audio.blob, `speaking.${extension}`);
  form.append('durationMs', String(Math.round(audio.durationMs)));
  let response: Response;
  try {
    response = await apiFetchAsGuest(`/seasons/${seasonId}/bonus-practice/speaking/transcribe`, {
      method: 'POST',
      body: form,
    });
  } catch {
    throw new SpeechRecorderRequestError('network');
  }
  if (!response.ok) {
    if (response.status === 429) throw new SpeechRecorderRequestError('rate-limited');
    if (response.status >= 500) throw new SpeechRecorderRequestError('transcription-failed');
    throw new SpeechRecorderRequestError('audio-capture');
  }
  const payload = await response.json();
  const transcript = String(payload?.transcript || '').trim();
  if (!transcript) throw new SpeechRecorderRequestError('transcription-failed');
  return transcript;
}

export function useSpeechRecorder({ source, onRecordedAudio, maxDurationMs = 12000 }: Options) {
  const [phase, setPhase] = useState<SpeechRecorderPhase>('idle');
  const [error, setError] = useState<SpeechRecorderError | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const startingRef = useRef(false);
  const abortedRef = useRef(false);
  const onRecordedAudioRef = useRef(onRecordedAudio);
  onRecordedAudioRef.current = onRecordedAudio;

  const release = useCallback(() => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder?.state === 'recording') recorder.stop();
  }, []);

  const start = useCallback(async () => {
    if (phase !== 'idle' || startingRef.current) return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('unsupported');
      captureAnalyticsEvent('speaking_record_failed', { source, error_code: 'unsupported' });
      return;
    }

    startingRef.current = true;
    abortedRef.current = false;
    setError(null);
    setPhase('requesting');
    captureAnalyticsEvent('speaking_record_requested', { source });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MIME_CANDIDATES.find((candidate) => MediaRecorder.isTypeSupported(candidate));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstart = () => {
        startedAtRef.current = Date.now();
        setPhase('recording');
        captureAnalyticsEvent('speaking_record_started', { source, format: recorder.mimeType || 'browser-default' });
        timeoutRef.current = window.setTimeout(stop, maxDurationMs);
      };
      recorder.onerror = () => {
        abortedRef.current = true;
        setError('audio-capture');
        setPhase('idle');
        release();
        captureAnalyticsEvent('speaking_record_failed', { source, error_code: 'audio-capture' });
      };
      recorder.onstop = async () => {
        const durationMs = Math.max(Date.now() - startedAtRef.current, 0);
        const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/mp4' });
        release();
        if (abortedRef.current) return;
        if (!blob.size) {
          setError('empty');
          setPhase('idle');
          captureAnalyticsEvent('speaking_record_failed', { source, error_code: 'empty' });
          return;
        }
        setPhase('checking');
        captureAnalyticsEvent('speaking_record_stopped', { source, duration_ms: durationMs, audio_bytes: blob.size });
        try {
          await onRecordedAudioRef.current({ blob, durationMs });
          captureAnalyticsEvent('speaking_transcription_succeeded', { source, duration_ms: durationMs });
        } catch (cause) {
          const code = cause instanceof SpeechRecorderRequestError ? cause.code : recorderError(cause);
          setError(code);
          captureAnalyticsEvent('speaking_transcription_failed', { source, error_code: code });
        } finally {
          setPhase('idle');
        }
      };
      recorderRef.current = recorder;
      recorder.start();
    } catch (cause) {
      const code = recorderError(cause);
      release();
      setError(code);
      setPhase('idle');
      captureAnalyticsEvent('speaking_record_failed', { source, error_code: code });
    } finally {
      startingRef.current = false;
    }
  }, [maxDurationMs, phase, release, source, stop]);

  useEffect(() => release, [release]);

  return { phase, error, start, stop, clearError: () => setError(null) };
}
