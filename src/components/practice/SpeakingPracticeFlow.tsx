import Image from 'next/image';
import { getPlaybackRate } from '@/lib/playback-preference';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card } from '@/components/ui';
import { imageAssets } from '@/data/image-assets';
import {
  apiGet,
  apiPost,
  practiceCopy,
  type PracticeLaunchMode,
  type PracticeOrigin,
  type SpeakingPracticePayload,
} from '@/lib/bonus-practice';
import { getUiLanguage } from '@/lib/ui-language';
import { captureAnalyticsEvent } from '@/lib/analytics';
import PracticeScaffold from './PracticeScaffold';

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

type SpeakingPracticeFlowProps = {
  seasonId: string;
  origin: PracticeOrigin;
  launchMode?: PracticeLaunchMode;
  crystalBalance?: number;
  onClose: () => void;
  onSeasonRefresh?: () => Promise<void> | void;
};

export default function SpeakingPracticeFlow({
  seasonId,
  origin,
  launchMode = 'intro',
  crystalBalance,
  onClose,
  onSeasonRefresh,
}: SpeakingPracticeFlowProps) {
  const language = getUiLanguage();
  const copy = practiceCopy(language);
  const isRussian = language === 'russian';
  const [payload, setPayload] = useState<SpeakingPracticePayload | null>(null);
  const [phase, setPhase] = useState<'intro' | 'practice' | 'result'>('intro');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [speechPhase, setSpeechPhase] = useState<'idle' | 'listening' | 'checking' | 'unsupported'>('idle');
  const [heardTranscript, setHeardTranscript] = useState('');
  const [earned, setEarned] = useState(0);
  const [successfulSteps, setSuccessfulSteps] = useState<number[]>([]);
  const [loadingNextPractice, setLoadingNextPractice] = useState(false);

  const activeItem = useMemo(() => {
    if (!payload) return null;
    if (payload.type === 'speaking_recap') {
      return payload.items?.[activeIndex] || null;
    }
    return payload.phraseText
      ? {
          itemId: '',
          phraseText: payload.phraseText,
          episodeId: payload.episodeId || '',
          episodeNumber: payload.episodeNumber || 0,
          stepIndex: 0,
        }
      : null;
  }, [activeIndex, payload]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiGet<SpeakingPracticePayload>(`/seasons/${seasonId}/bonus-practice/speaking?origin=${origin}`);
        setPayload(data);
        const shouldOpenDirectly = origin === 'home' && launchMode === 'direct';
        setPhase(shouldOpenDirectly ? 'practice' : 'intro');
        captureAnalyticsEvent('speaking_practice_opened', { origin, practice_type: data.type });
      } catch (loadError) {
        console.error(loadError);
        setError(copy.pendingUnavailable);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [copy.pendingUnavailable, launchMode, origin, seasonId]);

  const speakPhrase = () => {
    if (!activeItem?.phraseText || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeItem.phraseText);
    utterance.lang = 'en-US';
    utterance.rate = getPlaybackRate();
    window.speechSynthesis.speak(utterance);
  };

  const moveToNext = async (stepReward: number) => {
    const isRecap = payload?.type === 'speaking_recap';
    setEarned((current) => current + stepReward);
    setSuccessfulSteps((current) => (current.includes(activeIndex) ? current : [...current, activeIndex]));
    if (isRecap && payload?.items && activeIndex < payload.items.length - 1) {
      setActiveIndex((current) => current + 1);
      setSpeechPhase('idle');
      setHeardTranscript('');
      return;
    }
    if (origin === 'story' && onSeasonRefresh) {
      await onSeasonRefresh();
    }
    setPhase('result');
  };

  const startRecognition = () => {
    const browserWindow = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setSpeechPhase('unsupported');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setSpeechPhase('listening');
      setHeardTranscript('');
      setError(null);
    };
    recognition.onerror = () => {
      setSpeechPhase('idle');
      setError(copy.tryAgain);
    };
    recognition.onend = () => {
      setSpeechPhase((current) => (current === 'listening' ? 'idle' : current));
    };
    recognition.onresult = async (event: SpeechRecognitionResultEventLike) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || '';
      setHeardTranscript(transcript);
      setSpeechPhase('checking');
      try {
        const result = await apiPost<{
          success: boolean;
          status: string;
          crystalsAwarded: number;
        }>(`/seasons/${seasonId}/bonus-practice/speaking/attempt`, {
          origin,
          itemId: activeItem?.itemId || undefined,
          episodeId: activeItem?.episodeId || undefined,
          targetPhrase: activeItem?.phraseText || '',
          transcript,
        });
        if (result.status === 'awarded' || result.status === 'already_awarded') {
          captureAnalyticsEvent('speaking_practice_succeeded', {
            origin,
            crystals_awarded: result.crystalsAwarded || 0,
          });
          await moveToNext(result.crystalsAwarded || 0);
        } else {
          captureAnalyticsEvent('speaking_practice_not_matched', { origin });
          setSpeechPhase('idle');
          setError(copy.lineNotMatched);
        }
      } catch (submitError) {
        console.error(submitError);
        setSpeechPhase('idle');
        setError(copy.tryAgain);
      }
    };
    recognition.start();
  };

  const skip = async () => {
    captureAnalyticsEvent('speaking_practice_skipped', { origin, practice_type: payload?.type });
    try {
      await apiPost(`/seasons/${seasonId}/bonus-practice/speaking/skip`, {
        origin,
        type: payload?.type,
        itemId: activeItem?.itemId || undefined,
        episodeId: activeItem?.episodeId || undefined,
        targetPhrase: activeItem?.phraseText || undefined,
      });
    } catch (skipError) {
      console.error(skipError);
    }
    onClose();
  };

  if (loading) {
    return <div className="py-10 text-center text-sm text-sh-muted">{copy.loadingPractice}</div>;
  }

  if (!payload?.type || !activeItem) {
    if (origin === 'home') {
      onClose();
      return null;
    }
    return <div className="py-10 text-center text-sm text-sh-muted">{copy.pendingUnavailable}</div>;
  }

  const progressSlots = payload.type === 'speaking_recap' ? payload.items?.length || 3 : 1;
  const completedPhraseCount = payload.type === 'speaking_recap' ? payload.items?.length || 3 : 1;

  const loadNextPractice = async () => {
    try {
      setLoadingNextPractice(true);
      setError(null);
      const nextPayload = await apiGet<SpeakingPracticePayload>(
        `/seasons/${seasonId}/bonus-practice/speaking?origin=${origin}`,
      );

      if (!nextPayload?.type || (nextPayload.type === 'speaking_recap' && !nextPayload.items?.length)) {
        onClose();
        return;
      }

      setPayload(nextPayload);
      setActiveIndex(0);
      setEarned(0);
      setSuccessfulSteps([]);
      setHeardTranscript('');
      setSpeechPhase('idle');
      setPhase('practice');
    } catch (loadError) {
      console.error(loadError);
      setError(copy.tryAgain);
    } finally {
      setLoadingNextPractice(false);
    }
  };

  const MicIcon = ({ className = 'h-8 w-8' }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </svg>
  );

  const SpeakerIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M5 9v6h4l5 4V5L9 9H5Z" />
      <path d="M17 9.5a4.5 4.5 0 0 1 0 5" />
      <path d="M19.5 7a8 8 0 0 1 0 10" />
    </svg>
  );

  const WaveStrip = ({ accent = 'purple' }: { accent?: 'purple' | 'green' }) => (
    <div className="flex items-center justify-center gap-1.5 text-sh-border">
      {Array.from({ length: 19 }).map((_, index) => {
        const heights = [10, 14, 18, 24, 30, 24, 18, 14, 10];
        const height = heights[index % heights.length];
        return (
          <span
            key={index}
            className={`w-1 rounded-full ${accent === 'purple' ? 'bg-[color:var(--sh-lavender)]/20' : 'bg-sh-forest/20'}`}
            style={{ height }}
          />
        );
      })}
    </div>
  );

  if (phase === 'intro') {
    return (
      <PracticeScaffold
        badge={copy.bonus}
        accent="purple"
        backLabel={copy.back}
        title={copy.speakIntroTitle}
        subtitle={isRussian ? 'Повтори фразу из этой главы' : 'Repeat a phrase from this chapter'}
        width="narrow"
        crystals={crystalBalance}
        onBack={onClose}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              fullWidth
              className="bg-[color:var(--sh-lavender)] shadow-[0_12px_28px_rgba(139,92,246,0.28)] hover:bg-[color:var(--sh-lavender)]/90"
              onClick={() => setPhase('practice')}
            >
              {copy.start}
            </Button>
            <Button
              variant="ghost"
              fullWidth
              className="!text-sh-muted hover:!bg-transparent hover:!text-sh-foreground"
              onClick={skip}
            >
              {copy.skipForNow}
            </Button>
          </div>
        }
        note={isRussian ? 'Можно пропустить и продолжить историю' : 'You can skip this and continue the story'}
      >
        <div className="space-y-5">
          <div className="mx-auto inline-flex rounded-full bg-[color:var(--sh-lavender)]/10 px-4 py-2 text-sm font-semibold text-[color:var(--sh-lavender)]">
            💎 {copy.speakingReward}
          </div>
          <div className="flex justify-center">
            <div className="relative h-40 w-40 sm:h-48 sm:w-48">
              <Image src={imageAssets.referral.chest} alt="" fill className="object-contain" sizes="192px" priority />
            </div>
          </div>
          <ul className="mx-auto max-w-sm space-y-2 text-sm leading-6 text-sh-foreground sm:text-base">
            <li>• {copy.listen}</li>
            <li>• {isRussian ? 'Повтори её вслух' : 'Repeat it out loud'}</li>
            <li>• {isRussian ? 'Получи кристалл' : 'Earn a crystal'}</li>
          </ul>
        </div>
      </PracticeScaffold>
    );
  }

  if (phase === 'result') {
    return (
      <PracticeScaffold
        badge={copy.bonus}
        accent="purple"
        backLabel={copy.back}
        title={origin === 'home' ? copy.speakingHomeCompleteTitle : copy.goodJob}
        subtitle={origin === 'home' ? copy.speakingHomeCompleteSubtitle(completedPhraseCount) : copy.attemptAccepted}
        width="narrow"
        crystals={crystalBalance}
        onBack={onClose}
        footer={
          <div className="flex flex-col gap-3">
            <Button variant="accent" fullWidth onClick={onClose}>
              {origin === 'home' ? copy.returnHome : copy.returnToStory}
            </Button>
            <Button
              variant="secondary"
              fullWidth
              className="!border-sh-lavender !text-sh-lavender hover:!bg-sh-lavender/10"
              onClick={loadNextPractice}
              disabled={loadingNextPractice}
            >
              {loadingNextPractice ? copy.loadingPractice : copy.newPhrases}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="relative h-40 w-40 sm:h-48 sm:w-48">
              <Image src={imageAssets.referral.chest} alt="" fill className="object-contain" sizes="192px" priority />
            </div>
          </div>
          <div className="mx-auto inline-flex items-center rounded-[18px] bg-[color:var(--sh-lavender)]/10 px-5 py-3 text-xl font-semibold text-[color:var(--sh-lavender)]">
            💎 +{earned} {isRussian ? 'кристалл' : 'crystal'}
          </div>
        </div>
      </PracticeScaffold>
    );
  }

  return (
    <PracticeScaffold
      badge=""
      accent="purple"
      backLabel={copy.back}
      title=""
      subtitle={undefined}
      width="regular"
      crystals={crystalBalance}
      onBack={onClose}
      headerVariant="compact"
      compactMobile
    >
      <div className="space-y-4 sm:space-y-6">
        {payload.type === 'speaking_recap' && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: progressSlots }).map((_, index) => (
              <span
                key={index}
                className={`h-2.5 w-2.5 rounded-full ${
                  successfulSteps.includes(index)
                    ? 'bg-[color:var(--sh-lavender)]'
                    : index === activeIndex
                      ? 'bg-[color:var(--sh-lavender)]/55'
                      : 'bg-sh-border'
                }`}
              />
            ))}
          </div>
        )}

        <div className="text-center">
          <div className="mx-auto inline-flex rounded-full bg-[color:var(--sh-lavender)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--sh-lavender)]">
            {isRussian ? 'Фраза из главы' : 'Phrase from chapter'}
          </div>
          <p className="mt-2 text-base font-semibold text-sh-foreground sm:mt-4 sm:text-lg">{copy.speakPromptTitle}</p>
        </div>

        <Card className="border-[color:var(--sh-lavender)]/15 px-4 py-4 text-center shadow-none sm:px-8 sm:py-6">
          <div className="text-[1.5rem] font-semibold leading-tight text-sh-foreground sm:text-[2.25rem]">{activeItem.phraseText}</div>
          <div className="mt-3 flex justify-center sm:mt-4">
            <button
              type="button"
              onClick={speakPhrase}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--sh-lavender)]/20 bg-[color:var(--sh-lavender)]/8 text-[color:var(--sh-lavender)] transition-colors hover:bg-[color:var(--sh-lavender)]/14"
            >
              <SpeakerIcon />
            </button>
          </div>
        </Card>

        <div className="grid gap-4">
          <WaveStrip accent="purple" />

          <div className="flex justify-center">
            <button
              type="button"
              className="group relative inline-flex h-24 w-24 items-center justify-center rounded-full bg-[color:var(--sh-lavender)] text-white shadow-[0_20px_50px_rgba(139,92,246,0.32)] transition-transform hover:scale-[1.01] disabled:scale-100 disabled:opacity-70 sm:h-28 sm:w-28"
              onClick={startRecognition}
              disabled={speechPhase === 'listening' || speechPhase === 'checking'}
            >
              <span className="absolute inset-[-16px] rounded-full border border-[color:var(--sh-lavender)]/20" />
              <span className="absolute inset-[-36px] rounded-full border border-[color:var(--sh-lavender)]/10" />
              <MicIcon className="h-11 w-11" />
            </button>
          </div>

          <p className="text-center text-sm font-medium text-sh-foreground">
            {speechPhase === 'listening'
              ? copy.listening
              : speechPhase === 'checking'
                ? copy.checking
                : isRussian
                  ? 'Нажми и говори'
                  : 'Tap and speak'}
          </p>

          <div className="hidden gap-2 rounded-[20px] border border-sh-border bg-[#faf9ff] p-4 text-center text-xs text-sh-muted sm:grid sm:grid-cols-3 sm:text-sm">
            <div>{isRussian ? 'Слушай внимательно' : 'Listen carefully'}</div>
            <div>{isRussian ? 'Говори четко и не спеши' : 'Speak clearly and slowly'}</div>
            <div>{isRussian ? 'Можно повторить еще раз' : 'You can listen again'}</div>
          </div>
        </div>

        <div className="min-h-[76px]" aria-live="polite">
          {(heardTranscript || error || speechPhase === 'unsupported') && (
            <div className="space-y-2 rounded-[18px] border border-sh-border bg-sh-border-subtle/60 px-4 py-3 text-sm">
              {heardTranscript && (
                <p className="ph-sensitive text-sh-muted">
                  {copy.transcript}: &quot;{heardTranscript}&quot;
                </p>
              )}
              {speechPhase === 'unsupported' && <p className="text-red-600">{copy.unsupported}</p>}
              {error && <p className="text-red-600">{error}</p>}
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            className="!text-sh-muted hover:!bg-transparent hover:!text-sh-foreground"
            onClick={skip}
          >
            {copy.skipForNow}
          </Button>
        </div>
      </div>
    </PracticeScaffold>
  );
}
