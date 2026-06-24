import Link from 'next/link';
import React, { useEffect, useCallback, useState } from 'react';
import SeasonChapterAudio from './season-chapter-audio';
import SeasonOptionAudio from './season-option-audio';

interface AudioChunk {
  chunkId: string;
  type: string;
  choiceId?: string | null;
  text?: string;
  status: string;
  audioUrl?: string | null;
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

const highlightVocab = (text: string, vocab: VocabWord[] = []): React.ReactNode[] => {
  if (!vocab.length) return [text];
  const terms = vocab.map((v) => v.term.toLowerCase()).filter(Boolean);
  if (!terms.length) return [text];

  const pattern = terms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length)
    .join('|');

  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const matchedWord = match[0];
    const vocabEntry = vocab.find((v) => v.term.toLowerCase() === matchedWord.toLowerCase());
    parts.push(
      <span
        key={`hl-${match.index}`}
        className="inline bg-emerald-100 text-emerald-800 font-medium rounded px-0.5 cursor-help"
        title={vocabEntry?.translationRu ? `${matchedWord} — ${vocabEntry.translationRu}` : matchedWord}
      >
        {matchedWord}
      </span>,
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
};

interface SeasonEpisodeViewProps {
  seasonId?: string;
  episodeId?: string;
  episodeNumber: number;
  miniArcNumber: number;
  title: string;
  chapterText: string;
  speakingPrompt?: string;
  introOptionsPhrase: string;
  highlightedVocabulary?: VocabWord[];
  storyIntro?: StoryIntro | null;
  episodeIllustration?: EpisodeIllustration | null;
  storybookHref?: string | null;
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
  totalEpisodes: number;
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
  onProcessAudio: () => void;
  pendingAudioCount: number;
  hasPrev: boolean;
  hasNext: boolean;
}

const SeasonEpisodeView: React.FC<SeasonEpisodeViewProps> = ({
  seasonId,
  episodeId,
  episodeNumber,
  miniArcNumber,
  title,
  chapterText,
  speakingPrompt,
  introOptionsPhrase,
  highlightedVocabulary,
  storyIntro,
  episodeIllustration,
  storybookHref,
  illustrationPlaceholderCopy,
  onOpenInviteFriend,
  onCreateIllustration,
  illustrationLoading = false,
  showManualIllustrationCreate = false,
  choices,
  audioChunks,
  totalEpisodes,
  confirmLabel,
  onPrev,
  onNext,
  onSelectChoice,
  onVoiceAttempt,
  voiceFeedback,
  selectedChoiceId,
  voiceLoadingPhrase,
  choiceLoading,
  onProcessAudio,
  pendingAudioCount,
  hasPrev,
  hasNext,
}) => {
  const [confirmingChoiceId, setConfirmingChoiceId] = useState<string | null>(null);
  const [isIntroSpeaking, setIsIntroSpeaking] = useState(false);
  const [speechPhase, setSpeechPhase] = useState<'idle' | 'listening' | 'checking' | 'unsupported'>('idle');
  const [heardTranscript, setHeardTranscript] = useState('');
  const findChunk = useCallback(
    (type: string, choiceId?: string) =>
      audioChunks?.find((c) => c.type === type && (choiceId === undefined || c.choiceId === choiceId)),
    [audioChunks],
  );

  const chapterChunk = findChunk('chapter');
  const introChunk = findChunk('intro_options');
  const optionAudioUrls = choices
    .map((choice) => findChunk('choice', choice.id)?.audioUrl)
    .filter((url): url is string => Boolean(url));
  const manualPlayNextUrls = [
    introChunk?.audioUrl,
    ...optionAudioUrls,
  ].filter((url): url is string => Boolean(url));
  const autoPlayNextUrls = [introChunk?.audioUrl].filter((url): url is string => Boolean(url));

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeNumber]);

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

  const toggleIntroSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !storyIntro?.text) {
      return;
    }

    if (isIntroSpeaking) {
      window.speechSynthesis.cancel();
      setIsIntroSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${storyIntro.title}. ${storyIntro.text}`);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onend = () => setIsIntroSpeaking(false);
    utterance.onerror = () => setIsIntroSpeaking(false);
    setIsIntroSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="px-3 py-1.5 rounded-full text-sm border border-slate-200 disabled:opacity-30"
        >
          ← Prev
        </button>
        <div className="text-center">
          <div className="text-xs text-slate-400">Episode {episodeNumber} of {totalEpisodes}</div>
          <div className="text-sm font-semibold text-slate-600">Mini-arc {miniArcNumber}</div>
        </div>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="px-3 py-1.5 rounded-full text-sm border border-slate-200 disabled:opacity-30"
        >
          Next →
        </button>
      </div>

      <h2 className="text-2xl font-bold text-sh-foreground mb-4 font-story">{title}</h2>

      {storyIntro && (
        <section className="mb-6 overflow-hidden rounded-2xl border border-rose-200 bg-white">
          {storyIntro.imageUrl && (
            <img
              src={storyIntro.imageUrl}
              alt={storyIntro.title}
              className="aspect-[4/3] w-full bg-rose-50 object-cover"
            />
          )}
          <div className="px-5 py-4">
            {storyIntro.eyebrow && (
              <div className="text-xs font-semibold uppercase tracking-wide text-rose-500">{storyIntro.eyebrow}</div>
            )}
            <div className="mt-1 text-lg font-semibold text-slate-900">{storyIntro.title}</div>
            <div className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-line">{storyIntro.text}</div>
            <button
              type="button"
              onClick={toggleIntroSpeech}
              className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
            >
              {isIntroSpeaking ? 'Pause intro' : 'Listen to intro'}
            </button>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-2 mb-4">
        <SeasonChapterAudio
          audioUrl={chapterChunk?.audioUrl || null}
          status={chapterChunk?.status || 'missing'}
          title={`Chapter ${episodeNumber}`}
          label="Listen to chapter and options"
          playNextUrls={manualPlayNextUrls}
          autoPlayNextUrls={autoPlayNextUrls}
          autoPlayOnMount
          autoPlayToken={`${episodeNumber}:${chapterChunk?.audioUrl || 'pending'}`}
          seasonId={seasonId}
          episodeId={episodeId}
        />
        <SeasonChapterAudio
          audioUrl={introChunk?.audioUrl || null}
          status={introChunk?.status || 'missing'}
          title="What will you do?"
          label="Listen to options"
          seasonId={seasonId}
          episodeId={episodeId}
        />
      </div>

      {pendingAudioCount > 0 && (
        <div className="mb-4 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
          ⏳ {pendingAudioCount} audio chunk(s) being processed...
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <div className="text-base leading-relaxed whitespace-pre-line text-slate-700">{highlightVocab(chapterText, highlightedVocabulary)}</div>

        {speakingPrompt && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Speaking</div>
            <div className="mt-2 text-sm text-slate-800">Say this line from the story:</div>
            <div className="mt-2 text-base font-semibold text-emerald-900">&quot;{speakingPrompt}&quot;</div>
            <button
              type="button"
              onClick={() => startVoiceAttempt(speakingPrompt)}
              disabled={voiceLoadingPhrase === speakingPrompt || speechPhase === 'listening' || speechPhase === 'checking'}
              className="mt-3 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {speechPhase === 'listening'
                ? 'Listening now...'
                : speechPhase === 'checking' || voiceLoadingPhrase === speakingPrompt
                  ? 'Checking...'
                  : 'Say the line'}
            </button>
            {speechPhase === 'listening' && (
              <div className="mt-2 text-xs text-emerald-700">Start speaking now. The line will be sent automatically when we hear you.</div>
            )}
            {speechPhase === 'checking' && (
              <div className="mt-2 text-xs text-emerald-700">Got it. Checking your phrase...</div>
            )}
            {heardTranscript && (
              <div className="mt-2 text-xs text-slate-600">Heard: &quot;{heardTranscript}&quot;</div>
            )}
            {speechPhase === 'unsupported' && (
              <div className="mt-2 text-xs text-rose-600">Speech recognition is not available in this browser.</div>
            )}
            {voiceFeedback && (
              <div className={`mt-2 text-xs ${voiceFeedback.tone === 'success' ? 'text-emerald-700' : voiceFeedback.tone === 'error' ? 'text-rose-600' : 'text-slate-600'}`}>
                {voiceFeedback.text}
              </div>
            )}
          </div>
        )}

        {highlightedVocabulary && highlightedVocabulary.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {highlightedVocabulary.map((v, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                {v.term}
                {v.translationRu && <span className="text-emerald-400">{v.translationRu}</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {episodeIllustration && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {episodeIllustration.imageUrl ? (
            <img
              src={episodeIllustration.imageUrl}
              alt={episodeIllustration.title}
              className="aspect-[4/3] w-full bg-slate-100 object-cover"
            />
          ) : (
            (() => {
              const phase = episodeIllustration.phase || 'insufficient_crystals';
              const copy = illustrationPlaceholderCopy;
              const title =
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
                  ? 'border-b border-slate-200 bg-sky-50 px-4 py-5 text-sm text-sky-950'
                  : phase === 'failed'
                    ? 'border-b border-slate-200 bg-rose-50 px-4 py-5 text-sm text-rose-950'
                    : 'border-b border-slate-200 bg-amber-50 px-4 py-5 text-sm text-amber-900';

              return (
            <div className={panelClass}>
              <div className="font-semibold">{title}</div>
              <div className="mt-1">{body}</div>
              {phase === 'generating' && (
                <div className="mt-3 h-5 w-5 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
              )}
              {phase === 'unlockable' && episodeIllustration.hasEnoughCrystals && showManualIllustrationCreate && (
                <button
                  type="button"
                  onClick={onCreateIllustration}
                  disabled={illustrationLoading}
                  className="mt-3 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {illustrationLoading
                    ? illustrationPlaceholderCopy?.creatingIllustration || 'Creating...'
                    : illustrationPlaceholderCopy?.createIllustration || 'Create'}
                </button>
              )}
              {phase !== 'generating' && episodeIllustration.hasEnoughCrystals && storybookHref && (
                <Link
                  href={storybookHref}
                  className="mt-3 ml-0 inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  {illustrationPlaceholderCopy?.openStorybook || 'Open Storybook'}
                </Link>
              )}
              {phase === 'insufficient_crystals' && !episodeIllustration.hasEnoughCrystals && (
                <button
                  type="button"
                  onClick={onOpenInviteFriend}
                  className="mt-3 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  {illustrationPlaceholderCopy?.inviteFriend || 'Invite a friend'}
                </button>
              )}
            </div>
              );
            })()
          )}
        </div>
      )}

      {introOptionsPhrase && (
        <p className="text-sm text-slate-500 italic mb-3">{introOptionsPhrase}</p>
      )}

      <div className="flex flex-col gap-3 mb-6">
        {choices.map((choice) => {
          const choiceChunk = findChunk('choice', choice.id);
          return (
            <SeasonOptionAudio
              key={choice.id}
              audioUrl={choiceChunk?.audioUrl || null}
              audioStatus={choiceChunk?.status || 'missing'}
              text={choice.text}
              choiceId={choice.id}
              isSelected={selectedChoiceId === choice.id}
              isConfirming={confirmingChoiceId === choice.id}
              onRequestConfirm={(choiceId) => setConfirmingChoiceId(choiceId)}
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
        <div className="text-center py-4 text-slate-500">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
          Loading next episode...
        </div>
      )}
    </div>
  );
};

export default SeasonEpisodeView;
