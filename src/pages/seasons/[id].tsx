import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import LanguageSelector from '@/components/home/LanguageSelector';
import { StoryPracticeLaunchers } from '@/components/practice/PracticeOpportunityCards';
import WritingPracticePrompt from '@/components/practice/WritingPracticePrompt';
import SpeakingPracticeFlow from '@/components/practice/SpeakingPracticeFlow';
import WritingPracticeFlow from '@/components/practice/WritingPracticeFlow';
import Spinner from '@/components/spinner';
import SeasonEpisodeView from '@/components/season-episode-view';
import { Button, Card, ModalOverlay, SectionHeader } from '@/components/ui';
import { formatParentLabel } from '@/data/home-display';
import type { BonusPracticeSeasonSummary } from '@/lib/bonus-practice';
import { apiFetchAsGuest } from '@/lib/api-client';
import { captureAnalyticsEvent } from '@/lib/analytics';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
    partIndex?: number | null;
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
    nextEpisodeNumber?: number;
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
  bonusPracticeSummary?: BonusPracticeSeasonSummary;
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
  if (status === 'skipped_insufficient_crystals') {
    return 'insufficient_crystals';
  }
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
  const [voiceFeedback, setVoiceFeedback] = useState<{ episodeId: string; tone: 'neutral' | 'success' | 'error'; text: string } | null>(null);
  const [illustrationLoadingEpisodeId, setIllustrationLoadingEpisodeId] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [homeSummary, setHomeSummary] = useState<{ crystalBalance: number; hasSeasons: boolean } | null>(null);
  const [writingPromptOpen, setWritingPromptOpen] = useState(false);
  const practiceModal = router.query.practice === 'speaking' || router.query.practice === 'writing'
    ? String(router.query.practice)
    : null;

  useEffect(() => {
    const raw = router.query.episode;
    if (typeof raw !== 'string') return;
    const episode = Number(raw);
    if (!Number.isFinite(episode) || episode < 1) return;
    setNavigatedEpisodeNumber(Math.floor(episode));
  }, [router.query.episode]);

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

  const fetchSeason = useCallback(async (seasonId: string, episodeNumber?: number) => {
    const query = episodeNumber ? `?episodeNumber=${encodeURIComponent(episodeNumber)}` : '';
    const response = await fetch(`${API_BASE_URL}/seasons/${seasonId}${query}`);
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

    if (!id || !router.isReady) {
      return;
    }

    const rawEpisode = router.query.episode;
    const parsedEpisode =
      typeof rawEpisode === 'string' ? Number(rawEpisode) : NaN;
    const episodeNumber =
      Number.isFinite(parsedEpisode) && parsedEpisode >= 1
        ? Math.floor(parsedEpisode)
        : undefined;
    if (episodeNumber) {
      setNavigatedEpisodeNumber(episodeNumber);
    }

    fetchSeason(String(id), episodeNumber).catch((error) => {
      console.error(error);
      setEpisodeError(
        interfaceLanguage === 'russian'
          ? 'Не удалось загрузить сезон.'
          : 'Could not load this season.',
      );
    });

    const loadSummary = async () => {
      try {
        const res = await apiFetchAsGuest('/users/me/home-summary');
        if (res.ok) {
          const data = await res.json();
          setHomeSummary({
            crystalBalance: data.crystalBalance ?? 0,
            hasSeasons: data.hasSeasons ?? false,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };
    void loadSummary();
  }, [id, fetchSeason, interfaceLanguage, router.isReady, router.query.episode]);

  const goToEpisode = useCallback(
    async (episodeNumber: number) => {
      if (!id) {
        return;
      }
      const target = Math.max(1, Math.floor(episodeNumber));
      setEpisodeError('');
      setEpisodeLoading(true);
      try {
        await fetchSeason(String(id), target);
        setNavigatedEpisodeNumber(target);
        if (router.isReady) {
          void router.replace(
            {
              pathname: router.pathname,
              query: { ...router.query, episode: String(target) },
            },
            undefined,
            { shallow: true },
          );
        }
      } catch (error) {
        console.error(error);
        setEpisodeError(
          interfaceLanguage === 'russian'
            ? 'Не удалось загрузить эпизод.'
            : 'Could not load this episode.',
        );
      } finally {
        setEpisodeLoading(false);
      }
    },
    [id, fetchSeason, router, interfaceLanguage],
  );

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
      const response = await fetch(`${API_BASE_URL}/seasons/${id}/hero`, {
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
      const response = await fetch(`${API_BASE_URL}/seasons/${id}/episodes/first`, {
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
      const response = await fetch(`${API_BASE_URL}/seasons/${id}/jobs/process`, {
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
      if (navigatedEpisodeNumber) {
        await fetchSeason(String(id), navigatedEpisodeNumber);
      }
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
    captureAnalyticsEvent('episode_choice_confirmed', { choice_id: choiceId });

    try {
      const response = await fetch(`${API_BASE_URL}/seasons/${id}/episodes/${episodeId}/choices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          choiceId,
        }),
      });

      if (!response.ok) {
        let message = `HTTP error ${response.status}`;
        try {
          const errorBody = await response.json();
          message = errorBody?.message || message;
        } catch {
          // ignore parse errors
        }
        throw new Error(message);
      }

      const data = await response.json();
      setSeason(data);
      setNavigatedEpisodeNumber(null);
      captureAnalyticsEvent('episode_choice_applied', { choice_id: choiceId });
    } catch (error) {
      captureAnalyticsEvent('episode_choice_failed', { choice_id: choiceId });
      console.error(error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Could not apply this choice.';
      setChoiceError(message);
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
      const feedbackEpisodeId = episodeId || '';
      const response = await fetch(`${API_BASE_URL}/seasons/${id}/voice-attempts`, {
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
      const refreshedSeason = await fetchSeason(
        String(id),
        navigatedEpisodeNumber ?? undefined,
      );
      const refreshedBalance = refreshedSeason?.crystalWallet?.balance || 0;

      if (attempt?.status === 'awarded' && refreshedBalance > previousBalance) {
        setVoiceFeedback({
          episodeId: feedbackEpisodeId,
          tone: 'success',
          text: interfaceLanguage === 'russian'
            ? `Отлично! Фраза засчитана, +1 кристалл.`
            : 'Great job! The line was accepted and you earned 1 crystal.',
        });
      } else if (attempt?.status === 'awarded') {
        setVoiceFeedback({
          episodeId: feedbackEpisodeId,
          tone: 'error',
          text: interfaceLanguage === 'russian'
            ? 'Фраза засчитана, но баланс не обновился. Я уже перезагрузил сезонные данные.'
            : 'The line was accepted, but the balance did not update. I refreshed the season data.',
        });
      } else if (attempt?.status === 'already_awarded') {
        setVoiceFeedback({
          episodeId: feedbackEpisodeId,
          tone: 'neutral',
          text: interfaceLanguage === 'russian'
            ? 'Эта фраза уже была засчитана раньше.'
            : 'This line was already rewarded earlier.',
        });
      } else if (attempt?.status === 'not_matched') {
        setVoiceFeedback({
          episodeId: feedbackEpisodeId,
          tone: 'error',
          text: interfaceLanguage === 'russian'
            ? 'Фраза распознана, но совпала недостаточно точно. Попробуй еще раз.'
            : 'We heard you, but the line did not match closely enough. Try again.',
        });
      } else if (refreshedBalance > previousBalance) {
        setVoiceFeedback({
          episodeId: feedbackEpisodeId,
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
        episodeId: episodeId || '',
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
      const response = await fetch(`${API_BASE_URL}/referrals`, {
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
    captureAnalyticsEvent('illustration_requested');

    try {
      const response = await fetch(`${API_BASE_URL}/seasons/${id}/storybook/unlock`, {
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

      const processResponse = await fetch(`${API_BASE_URL}/seasons/${id}/jobs/process`, {
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
      captureAnalyticsEvent('illustration_generation_started');

      if (navigatedEpisodeNumber) {
        await fetchSeason(String(id), navigatedEpisodeNumber);
      }
    } catch (error) {
      captureAnalyticsEvent('illustration_request_failed');
      console.error(error);
      setChoiceError(interfaceLanguage === 'russian' ? 'Не удалось запустить генерацию иллюстрации.' : 'Could not start illustration generation.');
    } finally {
      setIllustrationLoadingEpisodeId(null);
    }
  }, [id, interfaceLanguage, navigatedEpisodeNumber, fetchSeason]);

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
    const activePreparedImageJob =
      season.generationJobs.find((job) =>
        job.jobType === 'prepared_image_generation' &&
        (job.status === 'pending' || job.status === 'processing') &&
        (
          job.payload?.nextEpisodeNumber === activeEpisode.episodeNumber ||
          job.payload?.promptPayload?.episodeNumber === activeEpisode.episodeNumber
        ),
      ) || null;
    const shouldGenerate = Boolean(activeEpisode.illustrationCandidate?.shouldGenerate || activeStorybookEntry);
    const unlockCost = ILLUSTRATION_UNLOCK_COST;
    const hasEnoughCrystals = (season.crystalWallet?.balance || 0) >= unlockCost;
    const visitKey = `storyhop:episode-illustration-visit:${season.seasonId}:${activeEpisode.episodeId}`;

    if (localStorage.getItem(visitKey) === '1') {
      return;
    }

    localStorage.setItem(visitKey, '1');

    if (shouldGenerate && !activeIllustration?.imageUrl && !activePreparedImageJob && hasEnoughCrystals) {
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
    const activePreparedImageJob =
      season.generationJobs.find((job) =>
        job.jobType === 'prepared_image_generation' &&
        (job.status === 'pending' || job.status === 'processing') &&
        (
          job.payload?.nextEpisodeNumber === activeEpisode.episodeNumber ||
          job.payload?.promptPayload?.episodeNumber === activeEpisode.episodeNumber
        ),
      ) || null;
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
        activePreparedImageJob ||
        activeImageJob ||
        (activeStorybookEntry && ['queued', 'pending', 'processing'].includes(activeStorybookEntry.status)) ||
        (activeIllustration && ['queued', 'pending', 'processing'].includes(activeIllustration.status)),
      );

    if (!shouldPollIllustration) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      fetchSeason(String(id), displayEpisodeNumber).catch((error) => {
        console.error(error);
      });
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [season, id, navigatedEpisodeNumber, fetchSeason]);

  useEffect(() => {
    if (practiceModal || !season?.bonusPracticeSummary?.storyLaunch.writingPromptAvailable) {
      return;
    }
    setWritingPromptOpen(true);
  }, [practiceModal, season?.bonusPracticeSummary?.storyLaunch.writingPromptAvailable]);

  const dismissWritingPrompt = useCallback(async () => {
    setWritingPromptOpen(false);
    if (!season?.seasonId) return;

    try {
      await fetch(`${API_BASE_URL}/seasons/${season.seasonId}/bonus-practice/writing/prompt-shown`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Could not record writing practice prompt', error);
    }
  }, [season?.seasonId]);

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

    const hasPendingAudio = Boolean(
      activeEpisode.audioChunks?.some(
        (chunk) => ['pending', 'queued', 'processing'].includes(chunk.status) && !chunk.audioUrl,
      ),
    );
    const activeStorybookEntry =
      season.storybook?.entries?.find((entry) => entry.episodeId === activeEpisode.episodeId && entry.entryType === 'episode_illustration') || null;
    const activeIllustration =
      activeStorybookEntry
        ? season.storybook?.illustrations?.find((illustration) => illustration.illustrationId === activeStorybookEntry.illustrationId) || null
        : null;
    const hasRecoverableIllustrationGap = Boolean(
      activeEpisode.illustrationCandidate?.shouldGenerate &&
      (season.crystalWallet?.balance || 0) >= ILLUSTRATION_UNLOCK_COST &&
      (!activeIllustration?.imageUrl || ['failed', 'pending', 'queued', 'processing'].includes(String(activeIllustration?.status || activeStorybookEntry?.status || ''))),
    );

    if (!hasPendingAudio && !hasRecoverableIllustrationGap) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetch(`${API_BASE_URL}/seasons/${id}/jobs/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit: 6 }),
      }).catch((error) => {
        console.error(error);
      });
    }, 1200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [season, id, navigatedEpisodeNumber]);

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

    const hasPendingAudio = Boolean(
      activeEpisode?.audioChunks?.some(
        (chunk) => ['pending', 'queued', 'processing'].includes(chunk.status) && !chunk.audioUrl,
      ),
    );

    if (!activeEpisode?.episodeId || !hasPendingAudio) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      fetchSeason(String(id), displayEpisodeNumber).catch((error) => {
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
        <div className="px-6 text-center">
          {episodeError ? (
            <>
              <p className="mb-4 text-sm text-rose-700">{episodeError}</p>
              <Button
                onClick={() => {
                  if (!id) return;
                  setEpisodeError('');
                  fetchSeason(String(id), navigatedEpisodeNumber ?? undefined).catch((error) => {
                    console.error(error);
                    setEpisodeError(
                      interfaceLanguage === 'russian'
                        ? 'Не удалось загрузить сезон.'
                        : 'Could not load this season.',
                    );
                  });
                }}
              >
                {interfaceLanguage === 'russian' ? 'Попробовать снова' : 'Try again'}
              </Button>
            </>
          ) : (
            <Spinner />
          )}
        </div>
      </div>
    );
  }

  const currentEpisode = season.currentEpisode;
  const generatedEpisodes = season.episodes || (currentEpisode ? [currentEpisode] : []);
  const displayEpisodeNumber = navigatedEpisodeNumber ?? season.currentEpisode?.episodeNumber ?? season.storyState?.seasonProgress?.currentEpisodeNumber ?? 1;
  const activeEpisode =
    generatedEpisodes.find((episode) => episode.episodeNumber === displayEpisodeNumber) ||
    currentEpisode;
  const selectedChoiceForActiveEpisode =
    activeEpisode
      ? season.selectedChoices.find((choice) => choice.episodeNumber === activeEpisode.episodeNumber)?.choiceId || null
      : null;
  const pendingTtsJobs =
    activeEpisode?.audioChunks?.filter(
      (chunk) => ['pending', 'queued', 'processing'].includes(chunk.status) && !chunk.audioUrl,
    ).length || 0;
  const activeStorybookEntry =
    activeEpisode
      ? season.storybook?.entries?.find((entry) => entry.episodeId === activeEpisode.episodeId && entry.entryType === 'episode_illustration') || null
      : null;
  const activeIllustration =
    activeStorybookEntry
      ? season.storybook?.illustrations?.find((illustration) => illustration.illustrationId === activeStorybookEntry.illustrationId) || null
      : null;
  const activePreparedImageJob =
    season.generationJobs.find((job) =>
      job.jobType === 'prepared_image_generation' &&
      (job.status === 'pending' || job.status === 'processing') &&
      (
        job.payload?.nextEpisodeNumber === activeEpisode?.episodeNumber ||
        job.payload?.promptPayload?.episodeNumber === activeEpisode?.episodeNumber
      ),
    ) || null;
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
            hasActiveImageJob: Boolean(activePreparedImageJob || activeImageJob),
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

  const isReading = Boolean(currentEpisode);
  const crystalBalance = season.crystalWallet?.balance ?? homeSummary?.crystalBalance ?? 0;
  const parentLabel = formatParentLabel(season.childProfile.childName);
  const isStuckAfterChoice = Boolean(
    selectedChoiceForActiveEpisode &&
      currentEpisode &&
      activeEpisode?.episodeId === currentEpisode.episodeId &&
      displayEpisodeNumber === currentEpisode.episodeNumber &&
      !generatedEpisodes.some((episode) => episode.episodeNumber === displayEpisodeNumber + 1),
  );
  const choiceResumeHint =
    isStuckAfterChoice
      ? interfaceLanguage === 'russian'
        ? 'Следующий эпизод не был создан из-за сбоя. Нажмите кнопку ниже, чтобы продолжить.'
        : 'The next episode was not created due to an error. Use the button below to continue.'
      : null;
  const resumeChoiceLabel =
    isStuckAfterChoice
      ? interfaceLanguage === 'russian'
        ? `Продолжить к эпизоду ${displayEpisodeNumber + 1}`
        : `Continue to episode ${displayEpisodeNumber + 1}`
      : null;

  const openPracticeModal = (type: 'speaking' | 'writing') => {
    if (!router.isReady) {
      return;
    }
    void router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, practice: type },
      },
      undefined,
      { shallow: true },
    );
  };
  const closePracticeModal = () => {
    if (!router.isReady) {
      return;
    }
    const nextQuery = { ...router.query };
    delete nextQuery.practice;
    void router.replace(
      {
        pathname: router.pathname,
        query: nextQuery,
      },
      undefined,
      { shallow: true },
    );
  };

  const startWritingFromPrompt = async () => {
    await dismissWritingPrompt();
    openPracticeModal('writing');
  };

  return (
    <AppShell
      showBottomNav
      hasSeasons={homeSummary?.hasSeasons ?? true}
      shellVariant="framed"
      maxWidth="full"
      plainBackground
      desktopBottomNav
      crystalBalance={crystalBalance}
      parentLabel={parentLabel}
      headerRight={
        <span className="hidden lg:inline-flex">
          <LanguageSelector />
        </span>
      }
    >
      {isReading ? (
        <>
          <SeasonEpisodeView
            key={activeEpisode?.episodeId || currentEpisode!.episodeId}
            seasonId={season.seasonId}
            episodeId={activeEpisode?.episodeId || currentEpisode!.episodeId}
            episodeNumber={displayEpisodeNumber}
            miniArcNumber={activeEpisode?.miniArcNumber || currentEpisode!.miniArcNumber}
            title={activeEpisode?.title || currentEpisode!.title}
            chapterText={activeEpisode?.chapterText || currentEpisode!.chapterText}
            speakingPrompt={activeEpisode?.speakingPrompt || currentEpisode!.speakingPrompt}
            bonusPracticeLauncher={
              season.bonusPracticeSummary
                ? (
                  <StoryPracticeLaunchers
                    summary={season.bonusPracticeSummary}
                    onOpen={openPracticeModal}
                  />
                )
                : null
            }
            introOptionsPhrase={activeEpisode?.introOptionsPhrase || currentEpisode!.introOptionsPhrase}
            highlightedVocabulary={activeEpisode?.highlightedVocabulary || currentEpisode!.highlightedVocabulary}
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
            backHref={`/seasons/${season.seasonId}/storybook`}
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
            choices={activeEpisode?.choices || currentEpisode!.choices}
            audioChunks={activeEpisode?.audioChunks || currentEpisode!.audioChunks}
            generationStatus={activeEpisode?.generationStatus || currentEpisode!.generationStatus}
            hasPrev={displayEpisodeNumber > 1}
            hasNext={currentEpisode !== null && displayEpisodeNumber < currentEpisode.episodeNumber}
            onPrev={() => {
              if (episodeLoading) return;
              void goToEpisode(Math.max(1, displayEpisodeNumber - 1));
            }}
            onNext={() => {
              if (episodeLoading || !currentEpisode) return;
              void goToEpisode(Math.min(currentEpisode.episodeNumber, displayEpisodeNumber + 1));
            }}
            onSelectChoice={(choiceId) => {
              if (!activeEpisode) {
                return;
              }
              if (isStuckAfterChoice) {
                if (selectedChoiceForActiveEpisode && selectedChoiceForActiveEpisode !== choiceId) {
                  return;
                }
                applyChoice(activeEpisode.episodeId, choiceId);
                return;
              }
              if (activeEpisode.episodeId !== currentEpisode!.episodeId) {
                return;
              }
              if (selectedChoiceForActiveEpisode) {
                return;
              }
              applyChoice(activeEpisode.episodeId, choiceId);
            }}
            onVoiceAttempt={(term, transcript) => recordVoiceAttempt(activeEpisode?.episodeId, term, transcript)}
            voiceFeedback={
              voiceFeedback?.episodeId === (activeEpisode?.episodeId || currentEpisode!.episodeId)
                ? voiceFeedback
                : null
            }
            selectedChoiceId={choiceLoadingId || selectedChoiceForActiveEpisode}
            voiceLoadingPhrase={voiceLoadingPhrase}
            choiceLoading={choiceLoadingId !== null}
            choiceResumeHint={choiceResumeHint}
            resumeChoiceLabel={resumeChoiceLabel}
            onResumeStuckChoice={
              isStuckAfterChoice && activeEpisode && selectedChoiceForActiveEpisode
                ? () => applyChoice(activeEpisode.episodeId, selectedChoiceForActiveEpisode)
                : undefined
            }
            onProcessAudio={processAudioJobs}
            pendingAudioCount={pendingTtsJobs}
          />
          {choiceError && <p className="mt-3 text-center text-xs text-red-600">{choiceError}</p>}
        </>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <SectionHeader
            title={season.framework.seasonPremise}
            subtitle={`${season.childProfile.childName}, ${season.childProfile.childAge}, ${season.childProfile.languageLevel}`}
            subtitleClassName="ph-sensitive"
          />

          {!season.storyState?.wizardCompletedAt && (!season.hero || season.hero.generationStatus !== 'ready') ? (
            <Card padding="lg">
              <h2 className="text-lg font-semibold mb-3">Hero setup</h2>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1 text-sm font-medium">
                    Name
                    <input className="rounded-[var(--sh-radius)] border border-sh-border bg-white px-3 py-2 text-sm" value={heroPreferences.preferredName} onChange={(e) => updateHeroPreference('preferredName', e.target.value)} />
                  </label>
                  <label className="grid gap-1 text-sm font-medium">
                    Type
                    <input className="rounded-[var(--sh-radius)] border border-sh-border bg-white px-3 py-2 text-sm" value={heroPreferences.heroType} onChange={(e) => updateHeroPreference('heroType', e.target.value)} />
                  </label>
                </div>
                <label className="grid gap-1 text-sm font-medium">
                  Traits
                  <input className="rounded-[var(--sh-radius)] border border-sh-border bg-white px-3 py-2 text-sm" value={heroPreferences.traits} onChange={(e) => updateHeroPreference('traits', e.target.value)} />
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="grid gap-1 text-sm font-medium">
                    Companion
                    <input className="rounded-[var(--sh-radius)] border border-sh-border bg-white px-3 py-2 text-sm" value={heroPreferences.companion} onChange={(e) => updateHeroPreference('companion', e.target.value)} />
                  </label>
                  <label className="grid gap-1 text-sm font-medium">
                    Color
                    <input className="rounded-[var(--sh-radius)] border border-sh-border bg-white px-3 py-2 text-sm" value={heroPreferences.favoriteColor} onChange={(e) => updateHeroPreference('favoriteColor', e.target.value)} />
                  </label>
                  <label className="grid gap-1 text-sm font-medium">
                    Accessory
                    <input className="rounded-[var(--sh-radius)] border border-sh-border bg-white px-3 py-2 text-sm" value={heroPreferences.accessory} onChange={(e) => updateHeroPreference('accessory', e.target.value)} />
                  </label>
                </div>
                {heroError && <p className="text-xs text-red-600">{heroError}</p>}
                <Button onClick={generateHero} disabled={heroLoading}>
                  {heroLoading ? 'Generating...' : 'Generate hero'}
                </Button>
              </div>
            </Card>
          ) : season.hero ? (
            <Card>
              <div className="flex items-center gap-4">
                {season.hero.heroReferenceImageUrl && (
                  <button type="button" onClick={() => setHeroImageOpen(true)} className="shrink-0">
                    <img src={season.hero.heroReferenceImageUrl} alt={season.hero.heroProfile.name} className="w-16 h-16 rounded-[var(--sh-radius-lg)] bg-sh-forest-soft object-cover" />
                  </button>
                )}
                <div>
                  <div className="text-lg font-semibold">{season.hero.heroProfile.name}</div>
                  <div className="text-xs text-sh-muted">{season.hero.heroProfile.companion.name} · {season.hero.heroVisualBrief.signatureAccessory}</div>
                </div>
              </div>
            </Card>
          ) : null}

          <Card padding="lg" className="text-center">
            <h2 className="text-lg font-semibold mb-3">First episode</h2>
            {episodeError && <p className="text-xs text-red-600 mb-3">{episodeError}</p>}
            <Button onClick={generateFirstEpisode} disabled={episodeLoading}>
              {episodeLoading ? 'Generating...' : 'Generate first episode'}
            </Button>
          </Card>
        </div>
      )}

      {heroImageOpen && season.hero?.heroReferenceImageUrl && (
        <ModalOverlay className="items-center justify-center" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0" onClick={() => setHeroImageOpen(false)} aria-label="Close hero image" />
          <div className="relative w-full max-w-md">
            <img src={season.hero.heroReferenceImageUrl} alt={season.hero.heroProfile.name} className="w-full rounded-[var(--sh-radius-lg)] bg-white object-cover" />
            <Button variant="secondary" fullWidth className="mt-3" onClick={() => setHeroImageOpen(false)}>
              Close
            </Button>
          </div>
        </ModalOverlay>
      )}

      {inviteModalOpen && (
        <ModalOverlay className="items-end justify-center sm:items-center" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0" aria-label={ui.close} onClick={() => setInviteModalOpen(false)} />
          <Card className="relative z-10 w-full max-w-md">
            <div className="text-lg font-semibold text-sh-foreground">{ui.inviteTitle}</div>
            <p className="mt-2 text-sm leading-relaxed text-sh-muted">{ui.inviteBody}</p>
            <div className="mt-3 rounded-[var(--sh-radius)] bg-amber-50 px-3 py-2 text-xs text-amber-900">{ui.inviteHint}</div>
            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-sh-muted">
              {ui.inviteInputLabel}
              <input
                readOnly
                value={inviteLink}
                className="mt-2 w-full rounded-[var(--sh-radius)] border border-sh-border bg-white px-3 py-3 text-sm text-sh-foreground"
              />
            </label>
            {inviteError && <p className="mt-3 text-xs text-red-600">{inviteError}</p>}
            <div className="mt-4 flex flex-col gap-2">
              {!inviteLink && (
                <Button onClick={openInviteFriendModal} disabled={inviteLoading} fullWidth>
                  {inviteLoading ? ui.inviteLoading : ui.createInviteLink}
                </Button>
              )}
              {inviteLink && (
                <Button onClick={copyInviteLink} fullWidth>
                  {inviteCopied ? ui.copiedLink : ui.copyLink}
                </Button>
              )}
              <Button variant="secondary" fullWidth onClick={() => setInviteModalOpen(false)}>
                {ui.close}
              </Button>
            </div>
          </Card>
        </ModalOverlay>
      )}

      {practiceModal && (
        <ModalOverlay className="items-end justify-center sm:items-center" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0" aria-label={ui.close} onClick={closePracticeModal} />
          <div className="relative z-10 w-full max-w-2xl">
            {practiceModal === 'speaking' ? (
              <SpeakingPracticeFlow
                seasonId={season.seasonId}
                origin="story"
                crystalBalance={crystalBalance}
                onClose={closePracticeModal}
                onSeasonRefresh={() =>
                  fetchSeason(String(id), navigatedEpisodeNumber ?? undefined)
                }
              />
            ) : (
              <WritingPracticeFlow
                seasonId={season.seasonId}
                origin="story"
                crystalBalance={crystalBalance}
                onClose={closePracticeModal}
                onSeasonRefresh={() =>
                  fetchSeason(String(id), navigatedEpisodeNumber ?? undefined)
                }
              />
            )}
          </div>
        </ModalOverlay>
      )}

      <WritingPracticePrompt
        open={writingPromptOpen && !practiceModal}
        wordCount={season.bonusPracticeSummary?.writing.wordCount || 4}
        maxReward={season.bonusPracticeSummary?.writing.maxReward || 4}
        onStart={startWritingFromPrompt}
        onDismiss={() => void dismissWritingPrompt()}
      />
    </AppShell>
  );
}
