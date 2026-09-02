export type SpeechRecognitionErrorCode =
  | 'unsupported'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'network'
  | 'no-speech'
  | 'audio-capture'
  | 'aborted'
  | 'language-not-supported'
  | 'start-failed'
  | 'unknown';

type SpeechRecognitionResultEventLike = {
  results?: {
    [index: number]: {
      [index: number]: {
        transcript?: string;
      };
    };
  };
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart?: (() => void) | null;
  onend?: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event?: { error?: string }) => void) | null;
  start: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type BrowserSpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type StartEnglishSpeechRecognitionOptions = {
  onStart: () => void;
  onResult: (transcript: string) => void;
  onError: (code: SpeechRecognitionErrorCode) => void;
  onEnd: () => void;
  onDiagnostic?: (diagnostic: SpeechRecognitionDiagnostic) => void;
};

export type SpeechRecognitionDiagnostic = {
  engine: 'standard' | 'webkit' | 'unsupported';
  microphonePermission: 'granted' | 'denied' | 'unavailable' | 'error';
};

const SUPPORTED_ERROR_CODES = new Set<SpeechRecognitionErrorCode>([
  'not-allowed',
  'service-not-allowed',
  'network',
  'no-speech',
  'audio-capture',
  'aborted',
  'language-not-supported',
]);

export function normalizeSpeechRecognitionError(error?: string): SpeechRecognitionErrorCode {
  const normalized = String(error || '').trim().toLowerCase();
  if (SUPPORTED_ERROR_CODES.has(normalized as SpeechRecognitionErrorCode)) {
    return normalized as SpeechRecognitionErrorCode;
  }
  return 'unknown';
}

export function getSpeechRecognitionErrorMessage(
  code: SpeechRecognitionErrorCode,
  language: 'russian' | 'english',
): string {
  const russian: Record<SpeechRecognitionErrorCode, string> = {
    unsupported: 'Распознавание речи недоступно в этом браузере.',
    'not-allowed': 'Разрешите доступ к микрофону в Safari и попробуйте ещё раз.',
    'service-not-allowed': 'Распознавание речи сейчас недоступно в Safari. Попробуйте позже.',
    network: 'Для распознавания речи нужен интернет. Проверьте соединение и попробуйте ещё раз.',
    'no-speech': 'Мы ничего не услышали. Нажмите микрофон и попробуйте ещё раз.',
    'audio-capture': 'Safari не смог получить доступ к микрофону. Проверьте разрешение и попробуйте ещё раз.',
    aborted: 'Голосовой ввод был остановлен. Нажмите микрофон, чтобы попробовать ещё раз.',
    'language-not-supported': 'Распознавание английской речи недоступно в этом браузере.',
    'start-failed': 'Не удалось запустить микрофон. Проверьте разрешение Safari и попробуйте ещё раз.',
    unknown: 'Не удалось запустить распознавание речи. Попробуйте ещё раз.',
  };
  const english: Record<SpeechRecognitionErrorCode, string> = {
    unsupported: 'Speech recognition is not available in this browser.',
    'not-allowed': 'Allow microphone access in Safari, then try again.',
    'service-not-allowed': 'Speech recognition is unavailable in Safari right now. Please try again later.',
    network: 'Speech recognition needs an internet connection. Check it and try again.',
    'no-speech': 'We did not hear anything. Tap the microphone and try again.',
    'audio-capture': 'Safari could not use the microphone. Check microphone access and try again.',
    aborted: 'Speaking was stopped. Tap the microphone to try again.',
    'language-not-supported': 'English speech recognition is not available in this browser.',
    'start-failed': 'Could not start the microphone. Check Safari permissions and try again.',
    unknown: 'Could not start speech recognition. Please try again.',
  };
  return (language === 'russian' ? russian : english)[code];
}

function getMicrophonePermissionErrorCode(error: unknown): SpeechRecognitionErrorCode {
  const name = String((error as { name?: string } | null)?.name || '').toLowerCase();
  if (name === 'notallowederror' || name === 'securityerror') {
    return 'not-allowed';
  }
  if (name === 'notfounderror' || name === 'notreadableerror' || name === 'aborterror') {
    return 'audio-capture';
  }
  return 'start-failed';
}

async function requestMicrophonePermission(): Promise<
  { status: 'granted' } | { status: 'denied' | 'error'; code: SpeechRecognitionErrorCode } | { status: 'unavailable' }
> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { status: 'unavailable' };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return { status: 'granted' };
  } catch (error) {
    const code = getMicrophonePermissionErrorCode(error);
    return { status: code === 'not-allowed' ? 'denied' : 'error', code };
  }
}

/** Makes browser-owned Web Speech failures visible to the calling interface. */
export async function startEnglishSpeechRecognition({
  onStart,
  onResult,
  onError,
  onEnd,
  onDiagnostic,
}: StartEnglishSpeechRecognitionOptions): Promise<void> {
  if (typeof window === 'undefined') {
    onDiagnostic?.({ engine: 'unsupported', microphonePermission: 'unavailable' });
    onError('unsupported');
    return;
  }

  const browserWindow = window as BrowserSpeechRecognitionWindow;
  const Recognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
  if (!Recognition) {
    onDiagnostic?.({ engine: 'unsupported', microphonePermission: 'unavailable' });
    onError('unsupported');
    return;
  }

  const engine = browserWindow.SpeechRecognition ? 'standard' : 'webkit';
  const microphonePermission = await requestMicrophonePermission();
  onDiagnostic?.({ engine, microphonePermission: microphonePermission.status });
  if (microphonePermission.status === 'denied' || microphonePermission.status === 'error') {
    onError(microphonePermission.code);
    return;
  }

  try {
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = onStart;
    recognition.onresult = (event) => onResult(event?.results?.[0]?.[0]?.transcript || '');
    recognition.onerror = (event) => onError(normalizeSpeechRecognitionError(event?.error));
    recognition.onend = onEnd;
    recognition.start();
  } catch {
    onError('start-failed');
  }
}
