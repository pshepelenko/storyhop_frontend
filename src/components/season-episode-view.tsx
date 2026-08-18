import React, { useEffect, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import EpisodeReaderHeader from '@/components/episode/EpisodeReaderHeader';
import { useReadingTextSize } from '@/lib/use-reading-text-size';
import { useUiLanguage } from '@/lib/use-ui-language';
import { imageAssets } from '@/data/image-assets';
import {
  Button,
  Card,
  EpisodeAudioPlayer,
  EpisodeChoiceCard,
  VocabHighlightText,
  VocabPracticeRow,
} from '@/components/ui';

interface AudioChunk {
  chunkId: string;
  type: string;
  choiceId?: string | null;
  partIndex?: number | null;
  text?: string;
  status: string;
  audioUrl?: string | null;
  durationSeconds?: number | null;
}

interface VocabWord {
  term: string;
  translationRu?: string;
}

interface Choice {
  id: string;
  text: string;
  translationRu?: string;
  choiceType?: string;
  crystalReward?: number;
}

interface EpisodeIllustration {
  title: string;
  summary: string;
  status?: string;
  imageUrl?: string | null;
  unlockCost?: number;
  hasEnoughCrystals?: boolean;
  phase?: 'generating' | 'insufficient_crystals' | 'unlockable' | 'failed';
}

interface StoryIntro {
  eyebrow?: string;
  title: string;
  text: string;
  imageUrl?: string | null;
}

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
  stop?: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const INLINE_SPEAKING_COPY = {
  english: {
    label: 'Speaking',
    instruction: 'Say this line from the story:',
    start: 'Start speaking',
    listening: 'Listening now...',
    checking: 'Checking...',
    listeningHelp: 'Start speaking now. The line will be sent automatically when we hear you.',
    checkingHelp: 'Got it. Checking your phrase...',
    heard: 'Heard:',
    unsupported: 'Speech recognition is not available in this browser.',
  },
  russian: {
    label: 'Говорим',
    instruction: 'Повтори фразу из истории:',
    start: 'Начать говорить',
    listening: 'Слушаем...',
    checking: 'Проверяем...',
    listeningHelp: 'Говорите сейчас. Мы автоматически проверим фразу, когда услышим её.',
    checkingHelp: 'Поняли. Проверяем фразу...',
    heard: 'Система распознала:',
    unsupported: 'Распознавание речи недоступно в этом браузере.',
  },
} as const;

function MicrophoneIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </svg>
  );
}

interface SeasonEpisodeViewProps {
  seasonId?: string;
  episodeId?: string;
  episodeNumber: number;
  miniArcNumber: number;
  title: string;
  chapterText: string;
  speakingPrompt?: string;
  bonusPracticeLauncher?: ReactNode;
  introOptionsPhrase: string;
  highlightedVocabulary?: VocabWord[];
  storyIntro?: StoryIntro | null;
  episodeIllustration?: EpisodeIllustration | null;
  storybookHref?: string | null;
  backHref?: string;
  confirmLabel?: string;
  illustrationPlaceholderCopy?: {
    generatingTitle: string;
    generatingBody: string;
    insufficientTitle: string;
    insufficientBody: string;
    unlockableTitle: string;
    unlockableBody: string;
    failedTitle: string;
    failedBody: string;
    openStorybook: string;
    inviteFriend: string;
    createIllustration: string;
    creatingIllustration: string;
  } | null;
  onOpenInviteFriend: () => void;
  onCreateIllustration: () => void;
  illustrationLoading?: boolean;
  showManualIllustrationCreate?: boolean;
  choices: Choice[];
  audioChunks: AudioChunk[];
  generationStatus: string;
  onPrev: () => void;
  onNext: () => void;
  onSelectChoice: (choiceId: string) => void;
  onVoiceAttempt: (targetPhrase: string, transcript?: string) => void;
  voiceFeedback?: {
    tone: 'neutral' | 'success' | 'error';
    text: string;
  } | null;
  selectedChoiceId: string | null;
  voiceLoadingPhrase?: string | null;
  choiceLoading: boolean;
  choiceResumeHint?: string | null;
  resumeChoiceLabel?: string | null;
  onResumeStuckChoice?: () => void;
  onProcessAudio: () => void;
  pendingAudioCount: number;
  hasPrev: boolean;
  hasNext: boolean;
}

const SeasonEpisodeView: React.FC<SeasonEpisodeViewProps> = ({
  seasonId,
  episodeId,
  episodeNumber,
  title,
  chapterText,
  speakingPrompt,
  bonusPracticeLauncher,
  introOptionsPhrase,
  highlightedVocabulary,
  storyIntro,
  episodeIllustration,
  storybookHref,
  backHref,
  illustrationPlaceholderCopy,
  onOpenInviteFriend,
  onCreateIllustration,
  illustrationLoading = false,
  showManualIllustrationCreate = false,
  choices,
  audioChunks,
  confirmLabel,
  onPrev,
  onNext,
  onSelectChoice,
  onVoiceAttempt,
  voiceFeedback,
  selectedChoiceId,
  voiceLoadingPhrase,
  choiceLoading,
  choiceResumeHint,
  resumeChoiceLabel,
  onResumeStuckChoice,
  onProcessAudio,
  pendingAudioCount,
  hasPrev,
  hasNext,
}) => {
  const readingTextSize = useReadingTextSize();
  const uiLanguage = useUiLanguage();
  const inlineSpeakingCopy = INLINE_SPEAKING_COPY[uiLanguage];
  const [confirmingChoiceId, setConfirmingChoiceId] = useState<string | null>(null);
  const [chapterAutoplayToken, setChapterAutoplayToken] = useState<string | null>(null);
  const [speechPhase, setSpeechPhase] = useState<'idle' | 'listening' | 'checking' | 'unsupported'>('idle');
  const [heardTranscript, setHeardTranscript] = useState('');
  const displayedSpeakingPrompt = speakingPrompt
    ?.trim()
    .replace(/^[\"“]+|[\"”]+$/g, '')
    .trim();
  const findChunk = useCallback(
    (type: string, choiceId?: string) =>
      audioChunks?.find((c) => c.type === type && (choiceId === undefined || c.choiceId === choiceId)),
    [audioChunks],
  );

  const chapterChunks = (audioChunks || [])
    .filter((c) => c.type === 'chapter')
    .sort((a, b) => (Number(a.partIndex ?? 0) - Number(b.partIndex ?? 0)));
  const chapterPartsReady =
    chapterChunks.length > 0 && chapterChunks.every((chunk) => Boolean(chunk.audioUrl));
  const chapterUrls = chapterPartsReady
    ? chapterChunks
        .map((chunk) => chunk.audioUrl)
        .filter((url): url is string => Boolean(url))
    : [];
  const chapterChunk = chapterChunks[0];
  const chapterAudioUrl = chapterUrls[0] || null;
  const chapterFollowUrls = chapterUrls.slice(1);
  const chapterStatus = chapterPartsReady
    ? chapterChunk?.status || 'ready'
    : chapterChunks.find((chunk) => !chunk.audioUrl)?.status || chapterChunk?.status || 'missing';
  const storyIntroChunk = findChunk('story_intro');
  const introChunk = findChunk('intro_options');
  const optionAudioUrls = choices
    .map((choice) => findChunk('choice', choice.id)?.audioUrl)
    .filter((url): url is string => Boolean(url));
  // Chapter player timeline = chapter parts only (correct total duration).
  // Intro/options are played after chapter ends via a short follow-up queue.
  const chapterOnlyFollowUrls = chapterFollowUrls;
  const afterChapterAutoUrls = [introChunk?.audioUrl].filter((url): url is string => Boolean(url));
  const afterChapterManualUrls = [introChunk?.audioUrl, ...optionAudioUrls].filter(
    (url): url is string => Boolean(url),
  );
  const manualPlayNextUrls = chapterPartsReady
    ? [...chapterOnlyFollowUrls, ...afterChapterManualUrls]
    : [];
  const autoPlayNextUrls = chapterPartsReady
    ? [...chapterOnlyFollowUrls, ...afterChapterAutoUrls]
    : [];
  const chapterAutoplayReadyToken = chapterPartsReady
    ? `chapter:${episodeNumber}:${chapterUrls.join('|')}`
    : `waiting:${episodeNumber}:parts`;

  const startVoiceAttempt = (targetPhrase: string) => {
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
      setHeardTranscript('');
      setSpeechPhase('listening');
    };
    recognition.onresult = (event: SpeechRecognitionResultEventLike) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || '';
      setHeardTranscript(transcript);
      setSpeechPhase('checking');
      onVoiceAttempt(targetPhrase, transcript);
    };
    recognition.onerror = () => {
      setSpeechPhase('idle');
    };
    recognition.onend = () => {
      setSpeechPhase((current) => (current === 'listening' ? 'idle' : current));
    };
    recognition.start();
  };

  useEffect(() => {
    if (pendingAudioCount > 0) {
      onProcessAudio();
    }
    setChapterAutoplayToken(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeNumber]);

  useEffect(() => {
    setSpeechPhase('idle');
    setHeardTranscript('');
  }, [episodeId]);

  useEffect(() => {
    if (speechPhase === 'checking' && !voiceLoadingPhrase) {
      setSpeechPhase('idle');
    }
  }, [speechPhase, voiceLoadingPhrase]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const hasStoryIntroBlock = Boolean(storyIntro);
  const shouldDeferChapterAutoplay = hasStoryIntroBlock && Boolean(storyIntroChunk);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <EpisodeReaderHeader
        episodeNumber={episodeNumber}
        title={title}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={onPrev}
        onNext={onNext}
        storybookHref={storybookHref}
        backHref={backHref}
      />

      {storyIntro && (
        <Card className="mb-6 overflow-hidden p-0">
          {storyIntro.imageUrl && (
            <img
              src={storyIntro.imageUrl}
              alt={storyIntro.title}
              className="aspect-[4/3] w-full bg-sh-forest-soft object-cover"
            />
          )}
          <div className="px-5 py-4">
            {storyIntro.eyebrow && (
              <div className="text-xs font-semibold uppercase tracking-wide text-sh-forest">{storyIntro.eyebrow}</div>
            )}
            <div className="mt-1 text-lg font-semibold text-sh-foreground font-story">{storyIntro.title}</div>
            <div className="mt-2 text-sm leading-relaxed text-sh-muted whitespace-pre-line">{storyIntro.text}</div>
            <EpisodeAudioPlayer
              variant="inline"
              audioUrl={storyIntroChunk?.audioUrl || null}
              status={storyIntroChunk?.status || 'missing'}
              label={storyIntro.title}
              autoPlayOnMount
              autoPlayToken={`story-intro:${episodeNumber}:${storyIntroChunk?.audioUrl || 'pending'}`}
              seasonId={seasonId}
              episodeId={episodeId}
              onEnded={() => {
                setChapterAutoplayToken(`intro-done:${episodeNumber}`);
              }}
            />
          </div>
        </Card>
      )}

      <EpisodeAudioPlayer
        variant="inline"
        audioUrl={chapterAudioUrl}
        status={chapterStatus}
        label={`Chapter ${episodeNumber}`}
        playNextUrls={manualPlayNextUrls}
        timelineUrls={chapterOnlyFollowUrls}
        timelineDurations={chapterChunks.map((chunk) => chunk.durationSeconds)}
        autoPlayNextUrls={autoPlayNextUrls}
        autoPlayOnMount
        autoPlayBlocked={
          !chapterPartsReady || (shouldDeferChapterAutoplay && !chapterAutoplayToken)
        }
        autoPlayToken={
          shouldDeferChapterAutoplay && !chapterAutoplayToken
            ? `waiting:${episodeNumber}:intro`
            : chapterAutoplayReadyToken
        }
        seasonId={seasonId}
        episodeId={episodeId}
      />

      {pendingAudioCount > 0 && (
        <div className="mb-4 px-4 py-2 rounded-[var(--sh-radius)] bg-amber-50 border border-amber-200 text-sm text-amber-800">
          {pendingAudioCount} audio chunk(s) being processed...
        </div>
      )}

      <div className="mb-6">
        <p className={`font-story leading-relaxed whitespace-pre-line text-sh-foreground ${readingTextSize === 'small' ? 'text-sm' : readingTextSize === 'large' ? 'text-lg' : 'text-base'}`}>
          <VocabHighlightText text={chapterText} vocabulary={highlightedVocabulary} />
        </p>

        {displayedSpeakingPrompt && (
          <Card className="mt-5 border-[color:var(--sh-lavender)]/20 bg-[color:var(--sh-lavender)]/5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--sh-lavender)]">{inlineSpeakingCopy.label}</div>
                <div className="mt-2 text-sm text-sh-foreground">{inlineSpeakingCopy.instruction}</div>
                <div className="mt-2 text-base font-semibold text-sh-foreground">&quot;{displayedSpeakingPrompt}&quot;</div>
              </div>
              <Button
                variant="accent"
                className="h-16 w-16 shrink-0 rounded-full !px-0 sm:h-[72px] sm:w-[72px]"
                onClick={() => startVoiceAttempt(displayedSpeakingPrompt)}
                disabled={voiceLoadingPhrase === displayedSpeakingPrompt || speechPhase === 'listening' || speechPhase === 'checking'}
                aria-label={speechPhase === 'listening' ? inlineSpeakingCopy.listening : speechPhase === 'checking' || voiceLoadingPhrase === displayedSpeakingPrompt ? inlineSpeakingCopy.checking : inlineSpeakingCopy.start}
                title={inlineSpeakingCopy.start}
              >
                <MicrophoneIcon className="h-7 w-7 sm:h-8 sm:w-8" />
              </Button>
            </div>
            {speechPhase === 'listening' && (
              <div className="mt-3 text-xs text-[color:var(--sh-lavender)]">{inlineSpeakingCopy.listeningHelp}</div>
            )}
            {speechPhase === 'checking' && (
              <div className="mt-3 text-xs text-[color:var(--sh-lavender)]">{inlineSpeakingCopy.checkingHelp}</div>
            )}
            {heardTranscript && (
              <div className="ph-sensitive mt-2 text-xs text-sh-muted">{inlineSpeakingCopy.heard} &quot;{heardTranscript}&quot;</div>
            )}
            {speechPhase === 'unsupported' && (
              <div className="mt-3 text-xs text-red-600">{inlineSpeakingCopy.unsupported}</div>
            )}
            {voiceFeedback && (
              <div className={`mt-2 text-xs ${voiceFeedback.tone === 'success' ? 'text-[color:var(--sh-lavender)]' : voiceFeedback.tone === 'error' ? 'text-red-600' : 'text-sh-muted'}`}>
                {voiceFeedback.text}
              </div>
            )}
          </Card>
        )}

        {bonusPracticeLauncher}
      </div>

      {highlightedVocabulary && highlightedVocabulary.length > 0 && (
        <VocabPracticeRow words={highlightedVocabulary} className="mb-6" />
      )}

      {episodeIllustration && (
        <div className="mb-6 overflow-hidden rounded-[var(--sh-radius-lg)] border border-sh-border bg-white">
          {episodeIllustration.imageUrl ? (
            <img
              src={episodeIllustration.imageUrl}
              alt={episodeIllustration.title}
              className="aspect-[4/3] w-full bg-sh-forest-soft object-cover"
            />
          ) : (
            (() => {
              const phase = episodeIllustration.phase || 'insufficient_crystals';
              const copy = illustrationPlaceholderCopy;
              const panelTitle =
                phase === 'generating'
                  ? copy?.generatingTitle || 'Creating illustration'
                  : phase === 'failed'
                    ? copy?.failedTitle || 'Could not create illustration'
                    : phase === 'unlockable'
                      ? copy?.unlockableTitle || 'Illustration ready to create'
                      : copy?.insufficientTitle || 'Not enough crystals';
              const body =
                phase === 'generating'
                  ? copy?.generatingBody || 'Please wait while we paint the scene for this chapter.'
                  : phase === 'failed'
                    ? copy?.failedBody || 'Try again in a moment.'
                    : phase === 'unlockable'
                      ? copy?.unlockableBody || 'Tap Create to paint the scene for this chapter.'
                      : copy?.insufficientBody || '';
              const panelClass =
                phase === 'generating'
                  ? 'border-b border-sh-border bg-sky-50 px-4 py-5 text-sm text-sky-950'
                  : phase === 'failed'
                    ? 'border-b border-sh-border bg-red-50 px-4 py-5 text-sm text-red-950'
                    : 'border-b border-sh-border bg-amber-50 px-4 py-5 text-sm text-amber-900';
              const placeholderImageSrc =
                phase === 'insufficient_crystals'
                  ? imageAssets.states.notEnoughCrystals
                  : phase === 'unlockable'
                    ? imageAssets.states.lockedStory
                    : null;

              return (
                <div className={panelClass}>
                  {placeholderImageSrc && (
                    <img
                      src={placeholderImageSrc}
                      alt={panelTitle}
                      className="mb-4 aspect-[4/3] w-full rounded-[var(--sh-radius-md)] border border-sh-border/70 object-cover"
                    />
                  )}
                  <div className="font-semibold">{panelTitle}</div>
                  <div className="mt-1">{body}</div>
                  {phase === 'generating' && (
                    <div className="mt-3 h-5 w-5 animate-spin rounded-full border-2 border-sh-forest border-t-transparent" />
                  )}
                  {((phase === 'unlockable' && episodeIllustration.hasEnoughCrystals && showManualIllustrationCreate) ||
                    (phase !== 'generating' && episodeIllustration.hasEnoughCrystals && storybookHref)) && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {phase === 'unlockable' && episodeIllustration.hasEnoughCrystals && showManualIllustrationCreate && (
                        <Button
                          variant="primary"
                          className="!min-h-[36px] h-9 py-0 px-4 text-xs"
                          onClick={onCreateIllustration}
                          disabled={illustrationLoading}
                        >
                          {illustrationLoading
                            ? illustrationPlaceholderCopy?.creatingIllustration || 'Creating...'
                            : illustrationPlaceholderCopy?.createIllustration || 'Create'}
                        </Button>
                      )}
                      {episodeIllustration.hasEnoughCrystals && storybookHref && (
                        <Button
                          href={storybookHref}
                          variant="secondary"
                          className="!min-h-[36px] h-9 py-0 px-4 text-xs"
                        >
                          {illustrationPlaceholderCopy?.openStorybook || 'Open Storybook'}
                        </Button>
                      )}
                    </div>
                  )}
                  {phase === 'insufficient_crystals' && !episodeIllustration.hasEnoughCrystals && (
                    <Button
                      variant="primary"
                      className="mt-3 !min-h-[36px] h-9 py-0 px-4 text-xs"
                      onClick={onOpenInviteFriend}
                    >
                      {illustrationPlaceholderCopy?.inviteFriend || 'Invite a friend'}
                    </Button>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}

      {introOptionsPhrase && (
        <p className="text-sm text-sh-muted mb-4">{introOptionsPhrase}</p>
      )}

      {choiceResumeHint && onResumeStuckChoice && resumeChoiceLabel && (
        <div className="mb-4 rounded-[var(--sh-radius-lg)] border border-sh-forest/30 bg-sh-forest-soft/40 p-4 text-center">
          <p className="text-sm text-sh-muted mb-3">{choiceResumeHint}</p>
          <Button
            variant="primary"
            className="!min-h-[40px]"
            onClick={onResumeStuckChoice}
            disabled={choiceLoading}
          >
            {resumeChoiceLabel}
          </Button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        {choices.map((choice) => {
          const choiceChunk = findChunk('choice', choice.id);
          const resumeThisChoice = Boolean(choiceResumeHint && selectedChoiceId === choice.id);
          return (
            <EpisodeChoiceCard
              key={choice.id}
              choiceId={choice.id}
              text={choice.text}
              audioUrl={choiceChunk?.audioUrl || null}
              isSelected={selectedChoiceId === choice.id}
              isConfirming={confirmingChoiceId === choice.id}
              onRequestConfirm={(choiceId) => {
                if (resumeThisChoice) {
                  setConfirmingChoiceId(null);
                  onSelectChoice(choiceId);
                  return;
                }
                setConfirmingChoiceId(choiceId);
              }}
              onSelect={(choiceId) => {
                setConfirmingChoiceId(null);
                onSelectChoice(choiceId);
              }}
              disabled={choiceLoading}
              confirmLabel={confirmLabel}
            />
          );
        })}
      </div>

      {choiceLoading && (
        <div className="text-center py-4 text-sh-muted">
          <div className="animate-spin w-6 h-6 border-2 border-sh-forest border-t-transparent rounded-full mx-auto mb-2" />
          Loading next episode...
        </div>
      )}

      {!choiceLoading && choiceResumeHint && !onResumeStuckChoice && (
        <p className="text-center py-3 text-sm text-sh-muted">{choiceResumeHint}</p>
      )}
    </div>
  );
};

export default SeasonEpisodeView;
