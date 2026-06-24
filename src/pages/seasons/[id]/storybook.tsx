import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Spinner from '@/components/spinner';

type EpisodeData = {
  episodeId: string;
  episodeNumber: number;
  title: string;
  illustrationCandidate?: {
    shouldGenerate?: boolean;
    moment?: string;
    unlockCost?: number;
  };
};

type StorybookEntry = {
  storybookEntryId: string;
  episodeId: string | null;
  illustrationId: string | null;
  entryType: string;
  title: string;
  summary: string;
  status: string;
  unlockCost: number;
};

type Illustration = {
  illustrationId: string;
  episodeId: string | null;
  title: string;
  status: string;
  imageUrl: string | null;
};

type SeasonStorybookData = {
  seasonId: string;
  framework: {
    seasonPremise: string;
  };
  crystalWallet?: {
    balance: number;
  };
  episodes?: EpisodeData[];
  generationJobs?: Array<{
    jobType: string;
    status: string;
    payload?: {
      illustrationId?: string;
      storybookEntryId?: string;
      episodeId?: string;
      promptPayload?: {
        episodeNumber?: number;
      };
    };
  }>;
  storybook?: {
    entries: StorybookEntry[];
    illustrations: Illustration[];
  };
};

const ILLUSTRATION_UNLOCK_COST = 3;
const ILLUSTRATION_GENERATING_STATUSES = new Set(['queued', 'pending', 'processing']);

const getInterfaceLanguage = (): 'russian' | 'english' => {
  if (typeof window === 'undefined') {
    return 'english';
  }

  const saved = localStorage.getItem('uiLanguage') as 'russian' | 'english' | null;
  return saved === 'russian' ? 'russian' : 'english';
};

const isIllustrationGenerating = (input: {
  entryStatus?: string;
  illustrationStatus?: string;
  isLoading: boolean;
  hasActiveImageJob: boolean;
}) => {
  if (input.isLoading) {
    return true;
  }
  if (input.hasActiveImageJob) {
    return true;
  }
  return (
    ILLUSTRATION_GENERATING_STATUSES.has(input.entryStatus || '') ||
    ILLUSTRATION_GENERATING_STATUSES.has(input.illustrationStatus || '')
  );
};

export default function SeasonStorybookPage() {
  const router = useRouter();
  const { id } = router.query;
  const [season, setSeason] = useState<SeasonStorybookData | null>(null);
  const [loadingEpisodeId, setLoadingEpisodeId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [interfaceLanguage, setInterfaceLanguage] = useState<'russian' | 'english'>('english');

  useEffect(() => {
    setInterfaceLanguage(getInterfaceLanguage());
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }

    fetchStorybook(String(id)).catch((fetchError) => {
      console.error(fetchError);
      setError('Could not load storybook.');
    });
  }, [id]);

  const fetchStorybook = async (seasonId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}/storybook`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    setSeason(data);
  };

  const unlockIllustration = async (episodeId: string) => {
    if (!id) {
      return;
    }

    setLoadingEpisodeId(episodeId);
    setError('');

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
    } catch (unlockError) {
      console.error(unlockError);
      setError('Could not start illustration generation.');
    } finally {
      setLoadingEpisodeId(null);
    }
  };

  if (!season) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fff7e8_0%,#ffe4ef_100%)]">
        <Spinner />
      </div>
    );
  }

  const storybookEpisodes = (season.episodes || []).filter((episode) => episode.illustrationCandidate?.shouldGenerate);
  const ui = interfaceLanguage === 'russian'
    ? {
        generatingTitle: 'Создаём иллюстрацию',
        generatingBody: 'Подождите немного — рисуем сцену для этой главы.',
        failedTitle: 'Не удалось создать иллюстрацию',
        failedBody: 'Попробуйте создать ещё раз чуть позже.',
        lockedTitle: 'Нужно больше кристаллов',
        lockedBody: (cost: number, balance: number) =>
          `Чтобы открыть иллюстрацию, нужно ${cost} кристалла. У вас ${balance}. Их можно получить за прохождение главы, голосовую практику и приглашение друга.`,
        notEnoughCrystals: 'Кристаллов пока не хватает.',
        tryAgain: 'Попробовать снова',
        starting: 'Создаём...',
        generate: 'Создать иллюстрацию',
        generateAgain: 'Создать снова',
      }
    : {
        generatingTitle: 'Creating illustration',
        generatingBody: 'Please wait while we paint the scene for this chapter.',
        failedTitle: 'Could not create illustration',
        failedBody: 'Try again in a moment.',
        lockedTitle: 'Not enough crystals',
        lockedBody: (cost: number, balance: number) =>
          `Unlocking this illustration costs ${cost} crystals. You have ${balance}. Earn them by finishing chapters, voice practice, and inviting a friend.`,
        notEnoughCrystals: 'Not enough crystals yet.',
        tryAgain: 'Try again',
        starting: 'Starting...',
        generate: 'Generate illustration',
        generateAgain: 'Generate again',
      };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7e8_0%,#ffe4ef_100%)] text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <header className="mb-6 flex items-center justify-between gap-4">
          <Link href={`/seasons/${season.seasonId}`} className="rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-medium">
            Back to episode
          </Link>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            {season.crystalWallet?.balance || 0} crystals
          </span>
        </header>

        <section className="mb-6 rounded-2xl bg-white/85 p-4 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-rose-500 mb-1">Storybook</div>
          <h1 className="text-lg font-semibold">{season.framework.seasonPremise}</h1>
          <div className="mt-1 text-sm text-slate-500">Unlocked and unlockable illustrations for this season.</div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="grid gap-3">
            {storybookEpisodes.map((episode) => {
              const entry = season.storybook?.entries?.find((item) => item.episodeId === episode.episodeId && item.entryType === 'episode_illustration');
              const unlockCost = ILLUSTRATION_UNLOCK_COST;
              const balance = season.crystalWallet?.balance || 0;
              const canUnlock = balance >= unlockCost;
              const illustration = entry
                ? season.storybook?.illustrations?.find((item) => item.illustrationId === entry.illustrationId)
                : null;
              const hasActiveImageJob = Boolean(
                season.generationJobs?.some((job) =>
                  job.jobType === 'image_generation' &&
                  (job.status === 'pending' || job.status === 'processing') &&
                  (
                    job.payload?.illustrationId === entry?.illustrationId ||
                    job.payload?.storybookEntryId === entry?.storybookEntryId ||
                    job.payload?.episodeId === episode.episodeId
                  ),
                ),
              );
              const generating = isIllustrationGenerating({
                entryStatus: entry?.status,
                illustrationStatus: illustration?.status,
                isLoading: loadingEpisodeId === episode.episodeId,
                hasActiveImageJob,
              });
              const isReady = entry?.status === 'ready' && illustration?.imageUrl;

              return (
                <div key={episode.episodeId} className="rounded-xl bg-slate-50 p-3">
                  <div className="text-sm font-semibold">Episode {episode.episodeNumber}: {episode.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{entry?.summary || episode.illustrationCandidate?.moment || 'A personal illustration for this chapter.'}</div>
                  {isReady && (
                    <img src={illustration.imageUrl!} alt={entry?.title || episode.title} className="mt-3 aspect-[4/3] w-full rounded-xl bg-slate-100 object-cover" />
                  )}
                  {!isReady && (
                    <div
                      className={`mt-3 rounded-xl border border-dashed p-4 text-sm ${
                        generating
                          ? 'border-sky-300 bg-sky-50 text-sky-950'
                          : entry?.status === 'failed'
                            ? 'border-rose-300 bg-rose-50 text-rose-950'
                            : 'border-amber-300 bg-amber-50 text-amber-900'
                      }`}
                    >
                      {generating ? (
                        <>
                          <div className="font-semibold">{ui.generatingTitle}</div>
                          <div className="mt-1">{ui.generatingBody}</div>
                        </>
                      ) : entry?.status === 'failed' ? (
                        <>
                          <div className="font-semibold">{ui.failedTitle}</div>
                          <div className="mt-1">{ui.failedBody}</div>
                          <button
                            type="button"
                            onClick={() => unlockIllustration(episode.episodeId)}
                            disabled={!canUnlock || loadingEpisodeId === episode.episodeId}
                            className="mt-3 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            {loadingEpisodeId === episode.episodeId ? ui.starting : ui.tryAgain}
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="font-semibold">{ui.lockedTitle}</div>
                          <div className="mt-1">{ui.lockedBody(unlockCost, balance)}</div>
                          {!canUnlock && (
                            <div className="mt-2 text-xs">{ui.notEnoughCrystals}</div>
                          )}
                          <button
                            type="button"
                            onClick={() => unlockIllustration(episode.episodeId)}
                            disabled={!canUnlock || loadingEpisodeId === episode.episodeId}
                            className="mt-3 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            {loadingEpisodeId === episode.episodeId
                              ? ui.starting
                              : entry
                                ? ui.generateAgain
                                : ui.generate}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {error && <p className="mt-3 text-center text-xs text-rose-600">{error}</p>}
        </section>
      </div>
    </div>
  );
}
