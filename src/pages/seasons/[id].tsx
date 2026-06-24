import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import Spinner from '@/components/spinner';
import SeasonEpisodeView from '@/components/season-episode-view';

type HeroData = {
  heroProfile: {
    name: string;
    shortDescription: string;
    personality: string[];
    motivation: string;
    strength: string;
    gentleWeakness: string;
    companion: {
      name: string;
      type: string;
      personality: string;
    };
    relationshipToSeasonProblem: string;
  };
  heroVisualBrief: {
    speciesOrType: string;
    silhouette: string;
    outfit: string;
    signatureAccessory: string;
    mainColors: string[];
    consistencyNotes: string[];
  };
  heroReferenceImageUrl: string | null;
  generationStatus: string;
  heroPreferences?: {
    preferredName?: string;
    heroType?: string;
    traits?: string[];
    companion?: string;
    favoriteColor?: string;
    accessory?: string;
  };
};

type EpisodeData = {
  episodeId: string;
  episodeNumber: number;
  miniArcNumber: number;
  title: string;
  chapterText: string;
  speakingPrompt?: string;
  introOptionsPhrase: string;
  highlightedVocabulary: {
    term: string;
    translationRu: string;
    meaningInContext: string;
    exposureType: string;
  }[];
  choices: {
    id: string;
    text: string;
    translationRu: string;
    choiceType: string;
    crystalReward: number;
    expectedStateDiff?: {
      seasonProgress?: string;
    };
  }[];
  illustrationCandidate: {
    shouldGenerate?: boolean;
    moment?: string;
    unlockCost?: number;
  };
  audioChunks: {
    chunkId: string;
    type: string;
    choiceId: string | null;
    status: string;
    audioUrl: string | null;
  }[];
  generationStatus: string;
};

type GenerationJob = {
  jobId: string;
  jobType: string;
  status: string;
  payload: {
    illustrationId?: string | null;
    storybookEntryId?: string | null;
    promptPayload?: {
      episodeNumber?: number;
    };
    metadata?: {
      chunkType?: string;
      choiceId?: string | null;
    };
  };
};

type SeasonData = {
  seasonId: string;
  childProfile: {
    childName: string;
    childAge: string;
    languageLevel: string;
  };
  seasonSetup: {
    theme: string;
    world: string;
    vocabularyFocus: string[];
    preferredTone: string;
    comments: string;
  };
  framework: {
    seasonPremise: string;
    centralProblem: string;
    dramaticQuestion: string;
    externalStakes: string;
    emotionalStakes: string;
    heroWant: string;
    heroNeed: string;
    incitingIncident: string;
    midpointReversal: string;
    lowPoint: string;
    finalChallenge: string;
    resolution: string;
    miniArcPlan?: {
      arcNumber: number;
      episodesRange: string;
      localGoal: string;
      storyFunction: string;
    }[];
  };
  seasonBible: {
    vocabularyPlan?: {
      coreWords?: string[];
      actionPhrases?: string[];
    };
  };
  episodeOutline: {
    episodes?: {
      episodeNumber: number;
      title: string;
      conflict: string;
      storyPurpose: string;
    }[];
  };
  hero: HeroData | null;
  heroDraftDefaults?: {
    preferredName?: string;
    heroType?: string;
    traits?: string[];
    companion?: string;
    favoriteColor?: string;
    accessory?: string;
  };
  currentEpisode: EpisodeData | null;
  episodes?: EpisodeData[];
  generationJobs: GenerationJob[];
  storyState: {
    seasonProgress?: {
      currentEpisodeNumber?: number;
      centralProblemStatus?: string;
      dramaticQuestionProgress?: string;
    };
    heroState?: {
      emotionalState?: string;
      activeWant?: string;
      activeNeed?: string;
    };
    wizardCompletedAt?: string;
    pendingHeroPreferences?: Record<string, unknown> | null;
    flags?: string[];
  };
  selectedChoices: {
    choiceRecordId: string;
    episodeNumber: number;
    choiceId: string;
    choicePayload?: {
      text?: string;
    };
  }[];
  crystalWallet?: {
    walletId: string;
    balance: number;
  };
  storybook?: {
    entries: {
      storybookEntryId: string;
      seasonId: string;
      episodeId: string | null;
      illustrationId: string | null;
      entryType: string;
      title: string;
      summary: string;
      status: string;
      unlockCost: number;
      metadata?: {
        episodeNumber?: number;
      };
    }[];
    illustrations: {
      illustrationId: string;
      episodeId: string | null;
      entryType: string;
      title: string;
      status: string;
      imageUrl: string | null;
    }[];
  };
  preparedNext?: {
    preparedEpisodeId: string;
    sourceEpisodeId: string;
    sourceEpisodeNumber: number;
    choiceId: string;
    nextEpisodeNumber: number;
    status: string;
    payload?: {
      sourceChoice?: {
        id?: string;
        text?: string;
        choiceType?: string;
      };
      episodeContent?: {
        title?: string;
      };
      preparedAudioChunks?: {
        chunkId: string;
        type: string;
        status: string;
        audioUrl?: string | null;
      }[];
    };
  }[];
};

const emptyHeroPreferences = {
  preferredName: '',
  heroType: 'young explorer',
  traits: 'curious, kind, brave',
  companion: 'tiny lantern bird',
  favoriteColor: 'gold',
  accessory: 'satchel',
};
const ILLUSTRATION_UNLOCK_COST = 3;
const ILLUSTRATION_GENERATING_STATUSES = new Set(['queued', 'pending', 'processing']);

type IllustrationPlaceholderPhase = 'generating' | 'insufficient_crystals' | 'unlockable' | 'failed';

const getIllustrationPlaceholderPhase = (input: {
  status?: string;
  hasEnoughCrystals: boolean;
  hasActiveImageJob: boolean;
}): IllustrationPlaceholderPhase => {
  const status = input.status || 'locked';
  if (status === 'failed') {
    return 'failed';
  }
  if (input.hasActiveImageJob || ILLUSTRATION_GENERATING_STATUSES.has(status)) {
    return 'generating';
  }
  if (!input.hasEnoughCrystals && status === 'locked') {
    return 'insufficient_crystals';
  }
  return 'unlockable';
};

const getInterfaceLanguage = (): 'russian' | 'english' => {
  if (typeof window === 'undefined') {
    return 'english';
  }

  const saved = localStorage.getItem('uiLanguage') as 'russian' | 'english' | null;
  if (saved === 'russian' || saved === 'english') {
    return saved;
  }

  return window.navigator.language.toLowerCase().startsWith('ru') ? 'russian' : 'english';
};

export default function SeasonPage() {
  const router = useRouter();
  const { id } = router.query;
  const [interfaceLanguage, setInterfaceLanguage] = useState<'russian' | 'english'>('english');
  const [season, setSeason] = useState<SeasonData | null>(null);
  const [heroPreferences, setHeroPreferences] = useState(emptyHeroPreferences);
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroError, setHeroError] = useState('');
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [episodeError, setEpisodeError] = useState('');
  const [choiceLoadingId, setChoiceLoadingId] = useState<string | null>(null);
  const [choiceError, setChoiceError] = useState('');
  const [navigatedEpisodeNumber, setNavigatedEpisodeNumber] = useState<number | null>(null);
  const [heroImageOpen, setHeroImageOpen] = useState(false);
  const [voiceLoadingPhrase, setVoiceLoadingPhrase] = useState<string | null>(null);
  const [voiceFeedback, setVoiceFeedback] = useState<{ tone: 'neutral' | 'success' | 'error'; text: string } | null>(null);
  const [illustrationLoadingEpisodeId, setIllustrationLoadingEpisodeId] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const ui = interfaceLanguage === 'russian'
      ? {
        inviteFriend: 'Пригласить друга',
        inviteTitle: 'Пригласить друга',
        inviteBody: 'Перешли другу эту ссылку-приглашение целиком. Важно отправить именно эту ссылку, чтобы приглашение засчиталось.',
        inviteInputLabel: 'Ссылка для друга',
        createInviteLink: 'Создать ссылку',
        inviteLoading: 'Готовим ссылку...',
        copyLink: 'Скопировать ссылку',
        copiedLink: 'Ссылка скопирована',
        close: 'Закрыть',
        inviteHint: 'За приглашенного друга начисляется 10 кристаллов.',
        inviteError: 'Не удалось создать ссылку приглашения.',
        illustrationGeneratingTitle: 'Создаём иллюстрацию',
        illustrationGeneratingBody: 'Подождите немного — рисуем сцену для этой главы.',
        illustrationInsufficientTitle: 'Нужно больше кристаллов',
        illustrationInsufficientBody: (cost: number) =>
          `Чтобы открыть иллюстрацию, нужно ${cost} кристалла. Их можно получить за прохождение главы, голосовую практику и приглашение друга.`,
        illustrationUnlockableTitle: 'Можно создать иллюстрацию',
        illustrationUnlockableBody: 'Нажмите «Создать», чтобы нарисовать сцену этой главы.',
        illustrationFailedTitle: 'Не удалось создать иллюстрацию',
        illustrationFailedBody: 'Попробуйте создать ещё раз чуть позже.',
        openStorybook: 'Открыть альбом',
        createIllustration: 'Создать',
        creatingIllustration: 'Создаем...',
        confirmChoice: 'Подтвердить',
      }
    : {
        inviteFriend: 'Invite a friend',
        inviteTitle: 'Invite a friend',
        inviteBody: 'Forward this full magic link to a friend so the referral can be tracked correctly.',
        inviteInputLabel: 'Link for your friend',
        createInviteLink: 'Create magic link',
        inviteLoading: 'Preparing link...',
        copyLink: 'Copy link',
        copiedLink: 'Copied',
        close: 'Close',
        inviteHint: 'Inviting a friend gives you 10 crystals.',
        inviteError: 'Could not create an invite link.',
        illustrationGeneratingTitle: 'Creating illustration',
        illustrationGeneratingBody: 'Please wait while we paint the scene for this chapter.',
        illustrationInsufficientTitle: 'Not enough crystals',
        illustrationInsufficientBody: (cost: number) =>
          `Unlocking this illustration costs ${cost} crystals. Earn them by finishing chapters, voice practice, and inviting a friend.`,
        illustrationUnlockableTitle: 'Illustration ready to create',
        illustrationUnlockableBody: 'Tap Create to paint the scene for this chapter.',
        illustrationFailedTitle: 'Could not create illustration',
        illustrationFailedBody: 'Try again in a moment.',
        openStorybook: 'Open Storybook',
        createIllustration: 'Create',
        creatingIllustration: 'Creating...',
        confirmChoice: 'Confirm',
      };

  const fetchSeason = useCallback(async (seasonId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    setSeason(data);
    if (
      data.status === 'framework_ready' &&
      (data.storyState?.wizardCompletedAt || data.storyState?.pendingHeroPreferences)
    ) {
      router.push(`/seasons/${seasonId}/creating`);
      return data;
    }
    setHeroPreferences({
      preferredName: data.hero?.heroPreferences?.preferredName || data.heroDraftDefaults?.preferredName || data.childProfile?.childName || '',
      heroType: data.hero?.heroPreferences?.heroType || data.heroDraftDefaults?.heroType || emptyHeroPreferences.heroType,
      traits: (data.hero?.heroPreferences?.traits || data.heroDraftDefaults?.traits || emptyHeroPreferences.traits.split(', ')).join(', '),
      companion: data.hero?.heroPreferences?.companion || data.heroDraftDefaults?.companion || emptyHeroPreferences.companion,
      favoriteColor: data.hero?.heroPreferences?.favoriteColor || data.heroDraftDefaults?.favoriteColor || emptyHeroPreferences.favoriteColor,
      accessory: data.hero?.heroPreferences?.accessory || data.heroDraftDefaults?.accessory || emptyHeroPreferences.accessory,
    });
    return data;
  }, [router]);

  useEffect(() => {
    setInterfaceLanguage(getInterfaceLanguage());

    if (!id) {
      return;
    }

    fetchSeason(String(id)).catch((error) => {
      console.error(error);
    });
  }, [id, fetchSeason]);

  const updateHeroPreference = (field: keyof typeof heroPreferences, value: string) => {
    setHeroPreferences((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const generateHero = async () => {
    if (!id) {
      return;
    }

    setHeroLoading(true);
    setHeroError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${id}/hero`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferredName: heroPreferences.preferredName,
          heroType: heroPreferences.heroType,
          traits: heroPreferences.traits.split(',').map((trait) => trait.trim()).filter(Boolean),
          companion: heroPreferences.companion,
          favoriteColor: heroPreferences.favoriteColor,
          accessory: heroPreferences.accessory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setSeason(data);
    } catch (error) {
      console.error(error);
      setHeroError('Could not generate hero.');
    } finally {
      setHeroLoading(false);
    }
  };

  const generateFirstEpisode = async () => {
    if (!id) {
      return;
    }

    setEpisodeLoading(true);
    setEpisodeError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${id}/episodes/first`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setSeason(data);
    } catch (error) {
      console.error(error);
      setEpisodeError('Could not generate first episode.');
    } finally {
      setEpisodeLoading(false);
    }
  };

  const processAudioJobs = async () => {
    if (!id) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${id}/jobs/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 8,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setSeason(data.season);
    } catch (error) {
      console.error(error);
    }
  };

  const applyChoice = async (episodeId: string, choiceId: string) => {
    if (!id) {
      return;
    }

    setChoiceLoadingId(choiceId);
    setChoiceError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${id}/episodes/${episodeId}/choices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          choiceId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setSeason(data);
    } catch (error) {
      console.error(error);
      setChoiceError('Could not apply this choice.');
    } finally {
      setChoiceLoadingId(null);
    }
  };

  const recordVoiceAttempt = async (episodeId: string | undefined, targetPhrase: string, transcript?: string) => {
    if (!id || !targetPhrase) {
      return;
    }

    setVoiceLoadingPhrase(targetPhrase);
    setVoiceFeedback(null);

    try {
      const previousBalance = season?.crystalWallet?.balance || 0;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${id}/voice-attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          episodeId,
          targetPhrase,
          transcript,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setSeason(data.season || data);
      const attempt = data.voiceAttempt;
      const refreshedSeason = await fetchSeason(String(id));
      const refreshedBalance = refreshedSeason?.crystalWallet?.balance || 0;

      if (attempt?.status === 'awarded' && refreshedBalance > previousBalance) {
        setVoiceFeedback({
          tone: 'success',
          text: interfaceLanguage === 'russian'
            ? `Отлично! Фраза засчитана, +1 кристалл.`
            : 'Great job! The line was accepted and you earned 1 crystal.',
        });
      } else if (attempt?.status === 'awarded') {
        setVoiceFeedback({
          tone: 'error',
          text: interfaceLanguage === 'russian'
            ? 'Фраза засчитана, но баланс не обновился. Я уже перезагрузил сезонные данные.'
            : 'The line was accepted, but the balance did not update. I refreshed the season data.',
        });
      } else if (attempt?.status === 'already_awarded') {
        setVoiceFeedback({
          tone: 'neutral',
          text: interfaceLanguage === 'russian'
            ? 'Эта фраза уже была засчитана раньше.'
            : 'This line was already rewarded earlier.',
        });
      } else if (attempt?.status === 'not_matched') {
        setVoiceFeedback({
          tone: 'error',
          text: interfaceLanguage === 'russian'
            ? 'Фраза распознана, но совпала недостаточно точно. Попробуй еще раз.'
            : 'We heard you, but the line did not match closely enough. Try again.',
        });
      } else if (refreshedBalance > previousBalance) {
        setVoiceFeedback({
          tone: 'success',
          text: interfaceLanguage === 'russian'
            ? `Отлично! +1 кристалл.`
            : 'Great job! +1 crystal.',
        });
      }
      return attempt;
    } catch (error) {
      console.error(error);
      setVoiceFeedback({
        tone: 'error',
        text: interfaceLanguage === 'russian'
          ? 'Не удалось проверить фразу. Попробуй еще раз.'
          : 'Could not check the line. Please try again.',
      });
    } finally {
      setVoiceLoadingPhrase(null);
    }
  };

  const openInviteFriendModal = async () => {
    setInviteModalOpen(true);
    setInviteCopied(false);
    setInviteError('');

    if (inviteLink) {
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setInviteError(ui.inviteError);
      return;
    }

    setInviteLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setInviteLink(data.inviteLink || '');
    } catch (error) {
      console.error(error);
      setInviteError(ui.inviteError);
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      setInviteCopied(true);
      setInviteError('');
    } catch (error) {
      console.error(error);
      setInviteError(ui.inviteError);
    }
  };

  const startIllustrationGeneration = useCallback(async (episodeId: string) => {
    if (!id) {
      return;
    }

    setIllustrationLoadingEpisodeId(episodeId);
    setChoiceError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${id}/storybook/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ episodeId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const seasonData = await response.json();
      setSeason(seasonData);

      const processResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${id}/jobs/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 1,
          jobType: 'image_generation',
        }),
      });

      if (processResponse.ok) {
        const processData = await processResponse.json();
        setSeason(processData.season);
      }
    } catch (error) {
      console.error(error);
      setChoiceError(interfaceLanguage === 'russian' ? 'Не удалось запустить генерацию иллюстрации.' : 'Could not start illustration generation.');
    } finally {
      setIllustrationLoadingEpisodeId(null);
    }
  }, [id, interfaceLanguage]);

  useEffect(() => {
    if (!season) {
      return;
    }

    const currentEpisode = season.currentEpisode;
    const generatedEpisodes = season.episodes || (currentEpisode ? [currentEpisode] : []);
    const displayEpisodeNumber =
      navigatedEpisodeNumber ??
      season.currentEpisode?.episodeNumber ??
      season.storyState?.seasonProgress?.currentEpisodeNumber ??
      1;
    const activeEpisode =
      generatedEpisodes.find((episode) => episode.episodeNumber === displayEpisodeNumber) ||
      currentEpisode;

    if (!activeEpisode?.episodeId) {
      return;
    }

    const activeStorybookEntry =
      season.storybook?.entries?.find((entry) => entry.episodeId === activeEpisode.episodeId && entry.entryType === 'episode_illustration') || null;
    const activeIllustration =
      activeStorybookEntry
        ? season.storybook?.illustrations?.find((illustration) => illustration.illustrationId === activeStorybookEntry.illustrationId) || null
        : null;
    const shouldGenerate = Boolean(activeEpisode.illustrationCandidate?.shouldGenerate || activeStorybookEntry);
    const unlockCost = ILLUSTRATION_UNLOCK_COST;
    const hasEnoughCrystals = (season.crystalWallet?.balance || 0) >= unlockCost;
    const visitKey = `storyhop:episode-illustration-visit:${season.seasonId}:${activeEpisode.episodeId}`;

    if (localStorage.getItem(visitKey) === '1') {
      return;
    }

    localStorage.setItem(visitKey, '1');

    if (shouldGenerate && !activeIllustration?.imageUrl && hasEnoughCrystals) {
      void startIllustrationGeneration(activeEpisode.episodeId);
    }
  }, [season, navigatedEpisodeNumber, startIllustrationGeneration]);

  useEffect(() => {
    if (!season || !id) {
      return;
    }

    const currentEpisode = season.currentEpisode;
    const generatedEpisodes = season.episodes || (currentEpisode ? [currentEpisode] : []);
    const displayEpisodeNumber =
      navigatedEpisodeNumber ??
      season.currentEpisode?.episodeNumber ??
      season.storyState?.seasonProgress?.currentEpisodeNumber ??
      1;
    const activeEpisode =
      generatedEpisodes.find((episode) => episode.episodeNumber === displayEpisodeNumber) ||
      currentEpisode;

    if (!activeEpisode?.episodeId) {
      return;
    }

    const activeStorybookEntry =
      season.storybook?.entries?.find((entry) => entry.episodeId === activeEpisode.episodeId && entry.entryType === 'episode_illustration') || null;
    const activeIllustration =
      activeStorybookEntry
        ? season.storybook?.illustrations?.find((illustration) => illustration.illustrationId === activeStorybookEntry.illustrationId) || null
        : null;
    const activeImageJob =
      season.generationJobs.find((job) =>
        job.jobType === 'image_generation' &&
        (job.status === 'pending' || job.status === 'processing') &&
        (
          job.payload?.illustrationId === activeStorybookEntry?.illustrationId ||
          job.payload?.storybookEntryId === activeStorybookEntry?.storybookEntryId ||
          job.payload?.promptPayload?.episodeNumber === activeEpisode.episodeNumber
        ),
      ) || null;

    const shouldPollIllustration =
      !activeIllustration?.imageUrl &&
      Boolean(
        activeImageJob ||
        (activeStorybookEntry && ['queued', 'pending', 'processing'].includes(activeStorybookEntry.status)) ||
        (activeIllustration && ['queued', 'pending', 'processing'].includes(activeIllustration.status)),
      );

    if (!shouldPollIllustration) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      fetchSeason(String(id)).catch((error) => {
        console.error(error);
      });
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [season, id, navigatedEpisodeNumber, fetchSeason]);

  if (!season) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sh-background">
        <div className="text-center"><Spinner /></div>
      </div>
    );
  }

  const currentEpisode = season.currentEpisode;
  const generatedEpisodes = season.episodes || (currentEpisode ? [currentEpisode] : []);
  const totalEpisodes = season.episodeOutline?.episodes?.length || 0;
  const displayEpisodeNumber = navigatedEpisodeNumber ?? season.currentEpisode?.episodeNumber ?? season.storyState?.seasonProgress?.currentEpisodeNumber ?? 1;
  const activeEpisode =
    generatedEpisodes.find((episode) => episode.episodeNumber === displayEpisodeNumber) ||
    currentEpisode;
  const selectedChoiceForActiveEpisode =
    activeEpisode
      ? season.selectedChoices.find((choice) => choice.episodeNumber === activeEpisode.episodeNumber)?.choiceId || null
      : null;
  const pendingTtsJobs = season.generationJobs.filter((job) => job.jobType === 'tts_chunk' && job.status === 'pending').length;
  const storybookEpisodes = generatedEpisodes.filter((episode) => episode.illustrationCandidate?.shouldGenerate);
  const activeStorybookEntry =
    activeEpisode
      ? season.storybook?.entries?.find((entry) => entry.episodeId === activeEpisode.episodeId && entry.entryType === 'episode_illustration') || null
      : null;
  const activeIllustration =
    activeStorybookEntry
      ? season.storybook?.illustrations?.find((illustration) => illustration.illustrationId === activeStorybookEntry.illustrationId) || null
      : null;
  const activeImageJob =
    season.generationJobs.find((job) =>
      job.jobType === 'image_generation' &&
      (job.status === 'pending' || job.status === 'processing') &&
      (
        job.payload?.illustrationId === activeStorybookEntry?.illustrationId ||
        job.payload?.storybookEntryId === activeStorybookEntry?.storybookEntryId ||
        job.payload?.promptPayload?.episodeNumber === activeEpisode?.episodeNumber
      ),
    ) || null;
  const hasEnoughCrystalsForIllustration = (season.crystalWallet?.balance || 0) >= ILLUSTRATION_UNLOCK_COST;
  const illustrationStatus = activeIllustration?.status || activeStorybookEntry?.status || 'locked';
  const activeEpisodeIllustration =
    activeEpisode?.illustrationCandidate?.shouldGenerate || activeStorybookEntry
      ? {
          title: activeStorybookEntry?.title || `Episode ${displayEpisodeNumber} illustration`,
          summary: activeStorybookEntry?.summary || activeEpisode?.illustrationCandidate?.moment || 'A personal illustration for this chapter.',
          status: illustrationStatus,
          imageUrl: activeIllustration?.imageUrl || null,
          unlockCost: ILLUSTRATION_UNLOCK_COST,
          hasEnoughCrystals: hasEnoughCrystalsForIllustration,
          phase: getIllustrationPlaceholderPhase({
            status: illustrationStatus,
            hasEnoughCrystals: hasEnoughCrystalsForIllustration,
            hasActiveImageJob: Boolean(activeImageJob),
          }),
        }
      : null;
  const episodeVisitStorageKey =
    activeEpisode?.episodeId ? `storyhop:episode-illustration-visit:${season.seasonId}:${activeEpisode.episodeId}` : null;
  const hasVisitedEpisodeIllustration =
    typeof window !== 'undefined' && episodeVisitStorageKey
      ? localStorage.getItem(episodeVisitStorageKey) === '1'
      : false;
  const shouldShowManualCreateButton = Boolean(
    activeEpisode &&
    activeEpisodeIllustration &&
    !activeEpisodeIllustration.imageUrl &&
    activeEpisodeIllustration.hasEnoughCrystals &&
    hasVisitedEpisodeIllustration,
  );
  const storyIntro =
    displayEpisodeNumber === 1 && season.hero
      ? {
          eyebrow: 'Welcome to the story',
          title: `${season.hero.heroProfile.name} and the world of ${season.seasonSetup.theme}`,
          text: [
            `This story begins in ${season.seasonSetup.world}. ${season.framework.seasonPremise}`,
            `${season.hero.heroProfile.name} is ${season.hero.heroProfile.shortDescription}. ${season.hero.heroProfile.name} wants ${season.hero.heroProfile.motivation.toLowerCase()}, and is joined by ${season.hero.heroProfile.companion.name}, a ${season.hero.heroProfile.companion.type}.`,
            `But something is already changing: ${season.framework.centralProblem}`,
          ].join('\n\n'),
          imageUrl: season.hero.heroReferenceImageUrl,
        }
      : null;

  return (
    <div className="min-h-screen bg-sh-background text-sh-foreground">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <header className="mb-6 flex items-center justify-between gap-4">
          <Link href="/" className="rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-medium">
            ← Back
          </Link>
          <div className="flex items-center gap-3">
            {storybookEpisodes.length > 0 && (
              <a
                href={`/seasons/${season.seasonId}/storybook`}
                className="rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-medium"
              >
                📖 Storybook
              </a>
            )}
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              💎 {season.crystalWallet?.balance || 0}
            </span>
          </div>
        </header>

        <section className="mb-6 rounded-2xl bg-white/85 p-4 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-rose-500 mb-1">Season</div>
          <h1 className="text-lg font-semibold">{season.framework.seasonPremise}</h1>
          <div className="mt-1 text-sm text-slate-500">
            {season.childProfile.childName}, {season.childProfile.childAge}, {season.childProfile.languageLevel}
          </div>
        </section>

        {!season.storyState?.wizardCompletedAt && (!season.hero || season.hero.generationStatus !== 'ready') ? (
          <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Hero setup</h2>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-sm font-medium">
                  Name
                  <input className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" value={heroPreferences.preferredName} onChange={(e) => updateHeroPreference('preferredName', e.target.value)} />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Type
                  <input className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" value={heroPreferences.heroType} onChange={(e) => updateHeroPreference('heroType', e.target.value)} />
                </label>
              </div>
              <label className="grid gap-1 text-sm font-medium">
                Traits
                <input className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" value={heroPreferences.traits} onChange={(e) => updateHeroPreference('traits', e.target.value)} />
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className="grid gap-1 text-sm font-medium">
                  Companion
                  <input className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" value={heroPreferences.companion} onChange={(e) => updateHeroPreference('companion', e.target.value)} />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Color
                  <input className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" value={heroPreferences.favoriteColor} onChange={(e) => updateHeroPreference('favoriteColor', e.target.value)} />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Accessory
                  <input className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" value={heroPreferences.accessory} onChange={(e) => updateHeroPreference('accessory', e.target.value)} />
                </label>
              </div>
              {heroError && <p className="text-xs text-rose-600">{heroError}</p>}
              <button className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60" onClick={generateHero} disabled={heroLoading}>
                {heroLoading ? 'Generating...' : 'Generate hero'}
              </button>
            </div>
          </section>
        ) : season.hero ? (
          <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
              {season.hero.heroReferenceImageUrl && (
                <button type="button" onClick={() => setHeroImageOpen(true)} className="shrink-0">
                  <img src={season.hero.heroReferenceImageUrl} alt={season.hero.heroProfile.name} className="w-16 h-16 rounded-2xl bg-rose-50 object-cover" />
                </button>
              )}
              <div>
                <div className="text-lg font-semibold">{season.hero.heroProfile.name}</div>
                <div className="text-xs text-slate-500">{season.hero.heroProfile.companion.name} · {season.hero.heroVisualBrief.signatureAccessory}</div>
              </div>
            </div>
          </section>
        ) : null}

        {heroImageOpen && season.hero?.heroReferenceImageUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" role="dialog" aria-modal="true">
            <button type="button" className="absolute inset-0" onClick={() => setHeroImageOpen(false)} aria-label="Close hero image" />
            <div className="relative w-full max-w-md">
              <img src={season.hero.heroReferenceImageUrl} alt={season.hero.heroProfile.name} className="w-full rounded-2xl bg-white object-cover" />
              <button type="button" onClick={() => setHeroImageOpen(false)} className="mt-3 w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900">
                Close
              </button>
            </div>
          </div>
        )}

        {!currentEpisode ? (
          <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm text-center">
            <h2 className="text-lg font-semibold mb-3">First episode</h2>
            {episodeError && <p className="text-xs text-rose-600 mb-3">{episodeError}</p>}
            <button className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60" onClick={generateFirstEpisode} disabled={episodeLoading}>
              {episodeLoading ? 'Generating...' : 'Generate first episode'}
            </button>
          </section>
        ) : (
          <section className="mb-6">
            <SeasonEpisodeView
              seasonId={season.seasonId}
              episodeId={activeEpisode?.episodeId || currentEpisode.episodeId}
              episodeNumber={displayEpisodeNumber}
              miniArcNumber={activeEpisode?.miniArcNumber || currentEpisode.miniArcNumber}
              title={activeEpisode?.title || currentEpisode.title}
              chapterText={activeEpisode?.chapterText || currentEpisode.chapterText}
              speakingPrompt={activeEpisode?.speakingPrompt || currentEpisode.speakingPrompt}
              introOptionsPhrase={activeEpisode?.introOptionsPhrase || currentEpisode.introOptionsPhrase}
              highlightedVocabulary={activeEpisode?.highlightedVocabulary || currentEpisode.highlightedVocabulary}
              storyIntro={storyIntro}
              episodeIllustration={
                activeEpisodeIllustration
                  ? {
                      ...activeEpisodeIllustration,
                      phase:
                        illustrationLoadingEpisodeId === activeEpisode?.episodeId
                          ? 'generating'
                          : activeEpisodeIllustration.phase,
                    }
                  : null
              }
              storybookHref={`/seasons/${season.seasonId}/storybook`}
              confirmLabel={ui.confirmChoice}
              illustrationPlaceholderCopy={{
                generatingTitle: ui.illustrationGeneratingTitle,
                generatingBody: ui.illustrationGeneratingBody,
                insufficientTitle: ui.illustrationInsufficientTitle,
                insufficientBody: ui.illustrationInsufficientBody(ILLUSTRATION_UNLOCK_COST),
                unlockableTitle: ui.illustrationUnlockableTitle,
                unlockableBody: ui.illustrationUnlockableBody,
                failedTitle: ui.illustrationFailedTitle,
                failedBody: ui.illustrationFailedBody,
                openStorybook: ui.openStorybook,
                inviteFriend: ui.inviteFriend,
                createIllustration: ui.createIllustration,
                creatingIllustration: ui.creatingIllustration,
              }}
              onOpenInviteFriend={openInviteFriendModal}
              onCreateIllustration={() => activeEpisode && startIllustrationGeneration(activeEpisode.episodeId)}
              illustrationLoading={illustrationLoadingEpisodeId === activeEpisode?.episodeId}
              showManualIllustrationCreate={shouldShowManualCreateButton}
              choices={activeEpisode?.choices || currentEpisode.choices}
              audioChunks={activeEpisode?.audioChunks || currentEpisode.audioChunks}
              generationStatus={activeEpisode?.generationStatus || currentEpisode.generationStatus}
              totalEpisodes={totalEpisodes}
              hasPrev={displayEpisodeNumber > 1}
              hasNext={currentEpisode !== null && displayEpisodeNumber < currentEpisode.episodeNumber}
              onPrev={() => setNavigatedEpisodeNumber(Math.max(1, displayEpisodeNumber - 1))}
              onNext={() => setNavigatedEpisodeNumber(Math.min(currentEpisode.episodeNumber, displayEpisodeNumber + 1))}
              onSelectChoice={(choiceId) => {
                if (!activeEpisode || activeEpisode.episodeId !== currentEpisode.episodeId || selectedChoiceForActiveEpisode) {
                  return;
                }
                applyChoice(activeEpisode.episodeId, choiceId);
              }}
              onVoiceAttempt={(term, transcript) => recordVoiceAttempt(activeEpisode?.episodeId, term, transcript)}
              voiceFeedback={voiceFeedback}
              selectedChoiceId={choiceLoadingId || selectedChoiceForActiveEpisode}
              voiceLoadingPhrase={voiceLoadingPhrase}
              choiceLoading={choiceLoadingId !== null || activeEpisode?.episodeId !== currentEpisode.episodeId || Boolean(selectedChoiceForActiveEpisode)}
              onProcessAudio={processAudioJobs}
              pendingAudioCount={pendingTtsJobs}
            />
            {choiceError && <p className="mt-3 text-center text-xs text-rose-600">{choiceError}</p>}
          </section>
        )}

        {inviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 sm:items-center" role="dialog" aria-modal="true">
            <button type="button" className="absolute inset-0" aria-label={ui.close} onClick={() => setInviteModalOpen(false)} />
            <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-5 shadow-xl">
              <div className="text-lg font-semibold text-slate-900">{ui.inviteTitle}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{ui.inviteBody}</p>
              <div className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-900">{ui.inviteHint}</div>
              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {ui.inviteInputLabel}
                <input
                  readOnly
                  value={inviteLink}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700"
                />
              </label>
              {inviteError && <p className="mt-3 text-xs text-rose-600">{inviteError}</p>}
              <div className="mt-4 flex flex-col gap-2">
                {!inviteLink && (
                  <button
                    type="button"
                    onClick={openInviteFriendModal}
                    disabled={inviteLoading}
                    className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {inviteLoading ? ui.inviteLoading : ui.createInviteLink}
                  </button>
                )}
                {inviteLink && (
                  <button
                    type="button"
                    onClick={copyInviteLink}
                    className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                  >
                    {inviteCopied ? ui.copiedLink : ui.copyLink}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  {ui.close}
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="text-center text-xs text-slate-400 pb-8">
          Season {season.seasonId.slice(0, 8)}
        </footer>
      </div>
    </div>
  );
}
