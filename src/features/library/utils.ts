import { getStoryWorldPreset } from '@/data/storyWorlds';
import { imageAssets } from '@/data/image-assets';
import type { StoryWorldId } from '@/types/storyWorlds';
import type { LibraryFilter, LibrarySeasonItem, LibrarySort } from './types';

function inferStoryWorldId(season: LibrarySeasonItem): StoryWorldId | null {
  if (season.worldId) return season.worldId as StoryWorldId;
  const label = `${season.worldLabel || ''} ${season.title || ''}`.toLowerCase();

  if (
    label.includes('academy') ||
    label.includes('академ') ||
    label.includes('school') ||
    label.includes('школ')
  ) {
    return 'magical_academy';
  }

  if (
    label.includes('space') ||
    label.includes('star harbor') ||
    label.includes('косм') ||
    label.includes('робот') ||
    label.includes('планет')
  ) {
    return 'star_harbor';
  }

  if (
    label.includes('museum') ||
    label.includes('музе') ||
    label.includes('exhibit') ||
    label.includes('экспонат')
  ) {
    return 'museum_of_living_wonders';
  }

  if (
    label.includes('town') ||
    label.includes('city') ||
    label.includes('город') ||
    label.includes('steampunk') ||
    label.includes('сон')
  ) {
    return 'mystery_town';
  }

  if (
    label.includes('isle') ||
    label.includes('island') ||
    label.includes('pirate') ||
    label.includes('остров') ||
    label.includes('пират') ||
    label.includes('dragon')
  ) {
    return 'creature_rescue_isles';
  }

  if (
    label.includes('forest') ||
    label.includes('эльф') ||
    label.includes('гном') ||
    label.includes('маг') ||
    label.includes('викинг') ||
    label.includes('дракон')
  ) {
    return 'whispering_forest';
  }

  return null;
}

export function seasonProgressPercent(season: LibrarySeasonItem): number {
  if (season.totalEpisodes <= 0) return 0;
  return Math.round((season.completedEpisodes / season.totalEpisodes) * 100);
}

export function seasonCoverUrl(season: LibrarySeasonItem): string {
  if (season.coverImageUrl) return season.coverImageUrl;
  const preset = getStoryWorldPreset(inferStoryWorldId(season));
  if (preset?.imagePath) return preset.imagePath;
  return imageAssets.home.activeSeason;
}

export function seasonPrimaryHref(season: LibrarySeasonItem): string {
  if (season.storybookAvailable !== false) {
    return `/seasons/${season.id}/storybook`;
  }
  return `/seasons/${season.id}`;
}

export function seasonStorybookHref(season: LibrarySeasonItem): string {
  return `/seasons/${season.id}/storybook`;
}

export function seasonProgressHref(season: LibrarySeasonItem): string {
  return `/parent-space?seasonId=${season.id}`;
}

/** 1-based season index by creation time across the full library. */
export function buildSeasonNumberMap(seasons: LibrarySeasonItem[]): Map<string, number> {
  const ordered = [...seasons].sort(
    (a, b) =>
      new Date(a.createdAt || a.updatedAt || 0).getTime() -
      new Date(b.createdAt || b.updatedAt || 0).getTime(),
  );
  return new Map(ordered.map((season, index) => [season.id, index + 1]));
}

export function formatRelativeDate(iso?: string, locale = 'en'): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return locale === 'ru' ? 'сегодня' : 'today';
  if (diffDays === 1) return locale === 'ru' ? 'вчера' : 'yesterday';
  if (diffDays < 7) return locale === 'ru' ? `${diffDays} дн. назад` : `${diffDays}d ago`;

  return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
}

export function filterSeasons(seasons: LibrarySeasonItem[], filter: LibraryFilter): LibrarySeasonItem[] {
  if (filter === 'all') return seasons;
  return seasons.filter((season) => season.status === filter);
}

export function searchSeasons(seasons: LibrarySeasonItem[], query: string): LibrarySeasonItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return seasons;

  return seasons.filter((season) => {
    const haystack = [season.title, season.worldLabel, season.currentEpisodeTitle]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function sortSeasons(seasons: LibrarySeasonItem[], sort: LibrarySort): LibrarySeasonItem[] {
  const list = [...seasons];

  switch (sort) {
    case 'oldest':
      return list.sort(
        (a, b) =>
          new Date(a.createdAt || a.updatedAt || 0).getTime() -
          new Date(b.createdAt || b.updatedAt || 0).getTime(),
      );
    case 'progress':
      return list.sort((a, b) => seasonProgressPercent(b) - seasonProgressPercent(a));
    case 'az':
      return list.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
    case 'recent':
    default:
      return list.sort(
        (a, b) =>
          new Date(b.lastActivityAt || b.updatedAt || b.createdAt || 0).getTime() -
          new Date(a.lastActivityAt || a.updatedAt || a.createdAt || 0).getTime(),
      );
  }
}
