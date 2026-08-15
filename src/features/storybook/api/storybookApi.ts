import { getApiBaseUrl } from '@/lib/api-base-url';
import type { StorybookMoment, StorybookSeasonView } from '../types';

const ILLUSTRATION_UNLOCK_COST = 3;

type RawSeason = {
  seasonId: string;
  status?: string;
  storyState?: { archived?: boolean };
  seasonSetup?: { seasonCoverImageUrl?: string | null; seasonTitle?: string };
  framework?: { seasonPremise?: string; title?: string };
  crystalWallet?: { balance?: number };
  storybook?: {
    entries?: Array<{
      storybookEntryId: string;
      episodeId: string | null;
      illustrationId: string | null;
      entryType?: string;
      title: string;
      summary: string;
      status: string;
      unlockCost: number;
      episodeNumber?: number | null;
      episodeTitle?: string | null;
      favorited?: boolean;
      favoritedAt?: string | null;
      imageUrl?: string | null;
      metadata?: Record<string, unknown>;
      createdAt?: string;
      updatedAt?: string;
    }>;
    illustrations?: Array<{
      illustrationId: string;
      episodeId: string | null;
      status: string;
      imageUrl: string | null;
      promptPayload?: { episodeNumber?: number; episodeTitle?: string; moment?: string };
    }>;
  };
};

function mapLibraryStatus(raw: RawSeason): 'active' | 'completed' | 'archived' {
  if (raw.storyState?.archived) return 'archived';
  if (raw.status === 'season_complete') return 'completed';
  return 'active';
}

function mapMoment(
  entry: {
    storybookEntryId: string;
    episodeId: string | null;
    illustrationId: string | null;
    title: string;
    summary: string;
    status: string;
    unlockCost: number;
    episodeNumber?: number | null;
    episodeTitle?: string | null;
    favorited?: boolean;
    favoritedAt?: string | null;
    imageUrl?: string | null;
    metadata?: Record<string, unknown>;
    createdAt?: string;
    updatedAt?: string;
  },
  illustrations: Array<{
    illustrationId: string;
    episodeId?: string | null;
    status?: string;
    imageUrl?: string | null;
    promptPayload?: { episodeNumber?: number; episodeTitle?: string; moment?: string };
  }> = [],
): StorybookMoment {
  const illustration = entry.illustrationId
    ? illustrations.find((item) => item.illustrationId === entry.illustrationId)
    : null;
  const episodeNumber =
    entry.episodeNumber ??
    (Number(entry.metadata?.episodeNumber) ||
      illustration?.promptPayload?.episodeNumber ||
      null);
  const imageUrl =
    entry.imageUrl ||
    ((entry.status === 'ready' || entry.status === 'ready_dry_run') ? illustration?.imageUrl : null) ||
    null;

  return {
    storybookEntryId: entry.storybookEntryId,
    episodeId: entry.episodeId,
    illustrationId: entry.illustrationId,
    title: entry.title,
    summary: entry.summary,
    status: entry.status,
    unlockCost: entry.unlockCost ?? ILLUSTRATION_UNLOCK_COST,
    episodeNumber: episodeNumber ? Number(episodeNumber) : null,
    episodeTitle: entry.episodeTitle || illustration?.promptPayload?.episodeTitle || null,
    favorited: Boolean(entry.favorited ?? entry.metadata?.favorited),
    favoritedAt: entry.favoritedAt || (entry.metadata?.favoritedAt as string) || null,
    imageUrl,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

export function mapSeasonToStorybookView(raw: RawSeason): StorybookSeasonView {
  const illustrations = raw.storybook?.illustrations || [];
  const moments = (raw.storybook?.entries || [])
    .filter((entry) => !entry.entryType || entry.entryType === 'episode_illustration')
    .map((entry) => mapMoment(entry, illustrations));

  const readyWithImage = moments.filter((moment) => Boolean(moment.imageUrl));

  const title =
    raw.seasonSetup?.seasonTitle ||
    raw.framework?.title ||
    '';

  return {
    seasonId: raw.seasonId,
    title: String(title).trim(),
    coverImageUrl: raw.seasonSetup?.seasonCoverImageUrl || readyWithImage[0]?.imageUrl || null,
    status: raw.status || 'episode_ready',
    libraryStatus: mapLibraryStatus(raw),
    momentsUnlocked: readyWithImage.length,
    crystalBalance: raw.crystalWallet?.balance || 0,
    moments,
  };
}

export async function getStorybookSeason(seasonId: string): Promise<StorybookSeasonView> {
  const response = await fetch(`${getApiBaseUrl()}/seasons/${seasonId}/storybook`);
  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) detail = String(body.message);
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  const raw = await response.json();
  return mapSeasonToStorybookView(raw);
}

export async function toggleStorybookFavorite(
  seasonId: string,
  entryId: string,
  favorited: boolean,
): Promise<StorybookSeasonView> {
  const response = await fetch(
    `${getApiBaseUrl()}/seasons/${seasonId}/storybook/${entryId}/favorite`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorited }),
    },
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const raw = await response.json();
  return mapSeasonToStorybookView(raw);
}
