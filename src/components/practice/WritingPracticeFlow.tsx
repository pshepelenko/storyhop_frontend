import Image from 'next/image';
import { getPlaybackRate } from '@/lib/playback-preference';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, ModalOverlay } from '@/components/ui';
import { imageAssets } from '@/data/image-assets';
import {
  apiGet,
  apiPost,
  practiceCopy,
  type PracticeLaunchMode,
  type PracticeOrigin,
  type WritingChallengePayload,
  type WritingPracticePayload,
} from '@/lib/bonus-practice';
import { getUiLanguage } from '@/lib/ui-language';
import { captureAnalyticsEvent } from '@/lib/analytics';
import PracticeScaffold from './PracticeScaffold';

type WritingPracticeFlowProps = {
  seasonId: string;
  origin: PracticeOrigin;
  launchMode?: PracticeLaunchMode;
  crystalBalance?: number;
  onClose: () => void;
  onSeasonRefresh?: () => Promise<void> | void;
};

type ReviewState = {
  entered: string;
  correctAnswer: string;
  isCorrect: boolean;
  reward: number;
  nextChallenge: WritingChallengePayload | null;
  completed: boolean;
};

export default function WritingPracticeFlow({
  seasonId,
  origin,
  launchMode = 'intro',
  crystalBalance,
  onClose,
  onSeasonRefresh,
}: WritingPracticeFlowProps) {
  const language = getUiLanguage();
  const copy = practiceCopy(language);
  const isRussian = language === 'russian';
  const [payload, setPayload] = useState<WritingPracticePayload | null>(null);
  const [phase, setPhase] = useState<'intro' | 'practice' | 'result'>('intro');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completedChallenge, setCompletedChallenge] = useState<WritingChallengePayload | null>(null);
  const [reviewState, setReviewState] = useState<ReviewState | null>(null);

  const challenge = payload?.challenge || null;
  const currentWord = challenge?.currentWord || null;
  const resultChallenge = completedChallenge || challenge;
  const progressSlots = useMemo(() => Array.from({ length: challenge?.wordCount || 4 }), [challenge?.wordCount]);
  const possibleReward = challenge?.maxReward ?? payload?.maxReward ?? 4;
  const writingRewardLabel = isRussian ? `До +${possibleReward} кристаллов` : `Up to +${possibleReward} crystals`;
  const revealAnswerLabel = isRussian ? 'Показать ответ - 0 кристаллов' : 'Show answer - 0 crystals';
  const skipNote = isRussian ? 'Можно пропустить и продолжить историю' : 'You can skip this and continue the story';
  const translationLabel = isRussian ? 'Перевод' : 'Translation';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiGet<WritingPracticePayload>(`/seasons/${seasonId}/bonus-practice/writing?origin=${origin}`);
        setPayload(data);
        captureAnalyticsEvent('writing_practice_opened', { origin, available: data.available });

        if (!data.available && origin === 'home') {
          onClose();
          return;
        }

        const shouldOpenDirectly = origin === 'home' && launchMode === 'direct';
        const existingChallenge = data.challenge;
        setPhase(shouldOpenDirectly || (existingChallenge && existingChallenge.completedWords > 0) ? 'practice' : 'intro');
      } catch (error) {
        console.error(error);
        setFeedback(copy.pendingUnavailable);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [copy.pendingUnavailable, launchMode, onClose, origin, seasonId]);

  const reload = async () => {
    const data = await apiGet<WritingPracticePayload>(`/seasons/${seasonId}/bonus-practice/writing?origin=${origin}`);
    setPayload(data);
    return data.challenge;
  };

  const playWord = () => {
    if (!currentWord || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentWord.term);
    utterance.lang = 'en-US';
    utterance.rate = getPlaybackRate();
    window.speechSynthesis.speak(utterance);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);
      const submittedAnswer = answer.trim();
      const reward = currentWord && currentWord.hintsUsed.length === 0 && !currentWord.revealed && currentWord.rewardEligible !== false ? 1 : 0;
      const result = await apiPost<{
        correct: boolean;
        completed?: boolean;
        challenge: WritingChallengePayload | null;
      }>(`/seasons/${seasonId}/bonus-practice/writing/attempt`, {
        answer: submittedAnswer,
        mode: 'audio',
      });

      if (result.correct) {
        captureAnalyticsEvent('writing_answer_checked', { origin, correct: true, crystals_awarded: reward });
        setAnswer('');
        setReviewState({
          entered: submittedAnswer,
          correctAnswer: currentWord?.term || submittedAnswer,
          isCorrect: true,
          reward,
          nextChallenge: result.challenge,
          completed: Boolean(result.completed),
        });
      } else {
        captureAnalyticsEvent('writing_answer_checked', { origin, correct: false, crystals_awarded: 0 });
        setPayload((current) => (current ? { ...current, challenge: result.challenge } : current));
        setReviewState({
          entered: submittedAnswer,
          correctAnswer: currentWord?.term || '',
          isCorrect: false,
          reward: 0,
          nextChallenge: null,
          completed: false,
        });
      }
    } catch (error) {
      console.error(error);
      setFeedback(copy.tryAgain);
    } finally {
      setSubmitting(false);
    }
  };

  const continueAfterReview = async () => {
    if (!reviewState) {
      return;
    }

    try {
      setSubmitting(true);

      if (reviewState.isCorrect) {
        if (reviewState.completed) {
          setCompletedChallenge(reviewState.nextChallenge);
          setPayload((current) => (current ? { ...current, challenge: reviewState.nextChallenge } : current));
          if (origin === 'story' && onSeasonRefresh) {
            await onSeasonRefresh();
          }
          setReviewState(null);
          setPhase('result');
          captureAnalyticsEvent('writing_practice_completed', {
            origin,
            crystals_earned: reviewState.nextChallenge?.totalReward || 0,
          });
          return;
        }

        if (reviewState.nextChallenge) {
          setPayload((current) => (current ? { ...current, challenge: reviewState.nextChallenge } : current));
        } else {
          await reload();
        }
        setReviewState(null);
        setFeedback(null);
        return;
      }

      const result = await apiPost<{ revealed: string; completed: boolean; challenge: WritingChallengePayload | null }>(
        `/seasons/${seasonId}/bonus-practice/writing/reveal`,
      );
      setPayload((current) => (current ? { ...current, challenge: result.challenge } : current));
      setReviewState(null);
      setAnswer('');
      captureAnalyticsEvent('writing_answer_revealed', { origin });
      setFeedback(null);
      if (result.completed) {
        setCompletedChallenge(result.challenge);
        if (origin === 'story' && onSeasonRefresh) {
          await onSeasonRefresh();
        }
        setPhase('result');
        return;
      }
      await reload();
    } catch (error) {
      console.error(error);
      setFeedback(copy.tryAgain);
    } finally {
      setSubmitting(false);
    }
  };

  const revealAnswer = async () => {
    try {
      const result = await apiPost<{ revealed: string; completed: boolean; challenge: WritingChallengePayload | null }>(
        `/seasons/${seasonId}/bonus-practice/writing/reveal`,
      );
      setAnswer('');
      setFeedback(result.revealed);
      setPayload((current) => (current ? { ...current, challenge: result.challenge } : current));
      if (result.completed) {
        setCompletedChallenge(result.challenge);
        if (origin === 'story' && onSeasonRefresh) {
          await onSeasonRefresh();
        }
        setPhase('result');
        return;
      }
      await reload();
    } catch (error) {
      console.error(error);
    }
  };

  const skip = async () => {
    captureAnalyticsEvent('writing_practice_skipped', { origin });
    try {
      await apiPost(`/seasons/${seasonId}/bonus-practice/writing/skip`);
    } catch (error) {
      console.error(error);
    }
    onClose();
  };

  if (loading) {
    return <div className="py-10 text-center text-sm text-sh-muted">{copy.loadingPractice}</div>;
  }

  if (phase === 'result' && !resultChallenge) {
    if (origin === 'home') {
      onClose();
      return null;
    }
    return <div className="py-10 text-center text-sm text-sh-muted">{copy.pendingUnavailable}</div>;
  }

  if ((!payload?.available || !challenge || !currentWord) && phase !== 'result') {
    return <div className="py-10 text-center text-sm text-sh-muted">{copy.pendingUnavailable}</div>;
  }

  const activeChallenge = challenge as WritingChallengePayload;
  const activeWord = currentWord as NonNullable<WritingChallengePayload['currentWord']>;
  const countSuffix = isRussian ? `из ${activeChallenge.wordCount} слов` : `of ${activeChallenge.wordCount} words`;
  const rewardCap = isRussian ? `До +${activeChallenge.wordCount}` : `Up to +${activeChallenge.wordCount}`;

  const SpeakerIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M5 9v6h4l5 4V5L9 9H5Z" />
      <path d="M17 9.5a4.5 4.5 0 0 1 0 5" />
      <path d="M19.5 7a8 8 0 0 1 0 10" />
    </svg>
  );

  const WaveStrip = () => (
    <div className="flex items-center justify-center gap-1.5 text-sh-border">
      {Array.from({ length: 19 }).map((_, index) => {
        const heights = [10, 14, 18, 24, 30, 24, 18, 14, 10];
        const height = heights[index % heights.length];
        return <span key={index} className="w-1 rounded-full bg-sh-forest/18" style={{ height }} />;
      })}
    </div>
  );

  if (phase === 'intro') {
    return (
      <PracticeScaffold
        badge={copy.bonus}
        accent="green"
        backLabel={copy.back}
        title={copy.writingIntroTitle}
        subtitle={copy.writingIntroBody}
        width="narrow"
        crystals={crystalBalance}
        onBack={onClose}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button fullWidth onClick={() => setPhase('practice')}>{copy.start}</Button>
            <Button variant="secondary" fullWidth onClick={skip}>{copy.skip}</Button>
          </div>
        }
        note={skipNote}
      >
        <div className="space-y-5">
          <div className="mx-auto inline-flex rounded-full bg-sh-forest-soft px-4 py-2 text-sm font-semibold text-sh-forest">
            💎 {writingRewardLabel}
          </div>
          <div className="flex justify-center">
            <div className="relative h-40 w-40 sm:h-48 sm:w-48">
              <Image src={imageAssets.referral.chest} alt="" fill className="object-contain" sizes="192px" priority />
            </div>
          </div>
          <ul className="mx-auto max-w-sm space-y-2 text-sm leading-6 text-sh-foreground sm:text-base">
            <li>• 4 words</li>
            <li>• {isRussian ? 'Слушай слово и смотри перевод' : 'Listen to the word and see the translation'}</li>
            <li>• {isRussian ? 'Пиши ответ и получай кристаллы' : 'Write the answer and earn crystals'}</li>
            <li>• {revealAnswerLabel}</li>
          </ul>
        </div>
      </PracticeScaffold>
    );
  }

  if (phase === 'result') {
    return (
      <PracticeScaffold
        badge={copy.bonus}
        accent="green"
        backLabel={copy.back}
        title={copy.goodJob}
        subtitle={copy.wordsPracticed(resultChallenge?.wordCount || 4)}
        width="narrow"
        crystals={crystalBalance}
        onBack={onClose}
        footer={
          <div className="flex flex-col gap-3">
            <Button fullWidth onClick={onClose}>{copy.continueStory}</Button>
            <Button variant="secondary" fullWidth onClick={onClose}>
              {isRussian ? 'На главную' : 'Go home'}
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
          <div className="mx-auto inline-flex items-center rounded-[18px] bg-sh-forest-soft px-5 py-3 text-xl font-semibold text-sh-forest">
            💎 +{resultChallenge?.totalReward || 0} {isRussian ? 'кристаллов' : 'crystals'}
          </div>
        </div>
      </PracticeScaffold>
    );
  }

  return (
    <>
      <PracticeScaffold
      badge=""
      accent="green"
      backLabel={copy.back}
      title=""
      subtitle={undefined}
      crystals={crystalBalance}
      onBack={onClose}
      headerVariant="compact"
      width="regular"
      compactMobile
    >
      <div className="space-y-3 sm:space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-sh-foreground">
            {activeChallenge.currentIndex + 1} {countSuffix}
          </div>
          <div className="inline-flex rounded-full bg-sh-forest-soft px-3 py-1.5 text-sm font-semibold text-sh-forest">
            💎 {rewardCap}
          </div>
        </div>

        <div className="text-center text-sm font-medium text-sh-foreground">
          {isRussian ? 'Послушай слово, посмотри перевод и напиши его по-английски' : 'Listen to the word, check the translation, then write it in English'}
        </div>

        <div className="rounded-[16px] border border-sh-forest/15 bg-sh-forest-soft/70 px-4 py-2.5 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-sh-forest">{translationLabel}</div>
          <div className="mt-1 text-lg font-semibold text-sh-foreground">{activeWord.translationRu}</div>
        </div>

        <Card className="relative flex min-h-[112px] items-center justify-center overflow-hidden rounded-[18px] border-sh-border/70 px-4 py-3 text-center shadow-none sm:min-h-[148px] sm:py-5">
          <div className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 opacity-80"><WaveStrip /></div>
          <button
            type="button"
            onClick={playWord}
            className="relative z-10 inline-flex h-16 w-16 items-center justify-center rounded-full border border-sh-forest/15 bg-white text-sh-forest shadow-[var(--sh-shadow)] transition-colors hover:bg-sh-forest-soft"
            aria-label={isRussian ? 'Прослушать слово' : 'Play word'}
          >
            <SpeakerIcon className="h-7 w-7" />
          </button>
        </Card>

        <input
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder={copy.writePlaceholder}
          disabled={Boolean(reviewState)}
          className="w-full rounded-[var(--sh-radius)] border border-sh-border bg-white px-4 py-3 text-base text-sh-foreground outline-none focus:border-sh-forest"
        />

        <div>
          <Button
            variant="secondary"
            fullWidth
            onClick={revealAnswer}
            disabled={Boolean(reviewState)}
            className="border-[color:var(--sh-amber)] bg-[color:var(--sh-amber)]/10 text-[color:var(--sh-amber)] hover:bg-[color:var(--sh-amber)]/16"
          >
            {revealAnswerLabel}
          </Button>
        </div>

        {feedback && (
          <div className="rounded-[16px] bg-sh-border-subtle/60 px-4 py-3 text-sm text-sh-muted">
            {feedback}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-1">
          {progressSlots.map((_, index) => (
            <span
              key={index}
              className={`h-3 w-3 rounded-full border ${
                index < activeChallenge.completedWords
                  ? 'border-sh-forest bg-sh-forest'
                  : index === activeChallenge.currentIndex
                    ? 'border-sh-forest bg-sh-forest-soft'
                    : 'border-sh-border bg-white'
              }`}
            />
          ))}
        </div>

        <Button fullWidth onClick={submitAnswer} disabled={submitting || !answer.trim() || Boolean(reviewState)}>
          {copy.check}
        </Button>
      </div>
      </PracticeScaffold>

      {reviewState && (
        <ModalOverlay className="items-center justify-center" role="dialog" aria-modal="true">
          <Card
            className={`w-full max-w-[30rem] rounded-[24px] border bg-sh-border-subtle/95 px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.28)] sm:px-6 ${
              reviewState.isCorrect
                ? 'border-sh-forest/20'
                : 'border-[color:var(--sh-coral)]/30'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`text-xl font-semibold ${reviewState.isCorrect ? 'text-sh-forest' : 'text-[color:var(--sh-coral)]'}`}>
                    {reviewState.isCorrect ? (isRussian ? 'Правильно!' : 'Correct!') : isRussian ? 'Пока неточно' : 'Not quite'}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-sh-foreground">
                    {reviewState.isCorrect
                      ? isRussian ? 'Слово засчитано.' : 'The word was accepted.'
                      : isRussian ? 'Сравни свой вариант с правильным ответом.' : 'Compare your answer with the correct spelling.'}
                  </p>
                </div>
                <div className={`inline-flex shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${reviewState.reward > 0 ? 'bg-white text-sh-forest' : 'bg-[color:var(--sh-amber)]/15 text-[color:var(--sh-amber)]'}`}>
                  {reviewState.reward > 0 ? `💎 +${reviewState.reward}` : isRussian ? '💎 0 кристаллов' : '💎 0 crystals'}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[16px] bg-white/90 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-sh-muted">{isRussian ? 'Твой ответ' : 'Your answer'}</div>
                  <div className="ph-sensitive mt-1.5 break-words text-base font-semibold text-sh-foreground">{reviewState.entered}</div>
                </div>
                <div className="rounded-[16px] bg-white/90 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-sh-muted">{isRussian ? 'Правильный ответ' : 'Correct answer'}</div>
                  <div className="mt-1.5 break-words text-base font-semibold text-sh-foreground">{reviewState.correctAnswer}</div>
                </div>
              </div>

              <Button fullWidth onClick={continueAfterReview} disabled={submitting}>
                {isRussian ? 'Продолжить' : 'Continue'}
              </Button>
            </div>
          </Card>
        </ModalOverlay>
      )}
    </>
  );
}
