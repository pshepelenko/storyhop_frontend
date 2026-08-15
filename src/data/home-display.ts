export type SidebarSeasonDisplay = {
  seasonId: string;
  seasonNumber: number;
  title: string;
  episodeNumber: number;
  totalEpisodes: number;
  episodesLabel: string;
  isActive: boolean;
  href: string;
  coverImageUrl?: string | null;
};

export type ActiveSeasonDisplay = {
  seasonId: string;
  seasonTitle: string;
  episodeNumber: number;
  totalEpisodes: number;
  episodeLine: string;
  chapterLine: string;
  progressPercent: number;
  readyEpisode: number;
  coverImageUrl?: string | null;
  readiness: {
    nextEpisodePreparing: boolean;
    audioReady: boolean;
    illustrationReady: boolean;
    allReady: boolean;
  };
};

export type BonusPracticeHomeDisplay = {
  speakingRecap: {
    available: boolean;
    count: number;
    maxReward: number;
  };
  writing: {
    available: boolean;
    active?: boolean;
    wordCount: number;
    maxReward: number;
  };
};

export type TodayActionsDisplay = {
  spellingAvailableWordsCount: number;
  speakingAvailablePhrasesCount: number;
  rewardsCount: number;
};

export type ParentSnapshotDisplay = {
  weeklyListeningMinutes: number;
  completedEpisodesThisWeek: number;
  newWordsCount: number;
  speakingPracticeCount: number;
};

export function formatParentLabel(childName: string): string {
  const cleaned = childName
    .replace(/[^\p{L}\p{N}\s'-]/gu, '')
    .trim()
    .split(/\s+/)[0];
  const name = cleaned || 'Your child';
  return `${name}'s parent`;
}

export function truncateText(text: string, max = 42): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

type HomeSummaryInput = {
  activeSeason: {
    seasonId: string;
    childName: string;
    title?: string;
    theme: string;
    coverImageUrl?: string | null;
    currentEpisodeNumber: number;
    currentEpisodeTitle: string;
    progressPercent: number;
    totalEpisodes: number;
    readiness: {
      nextEpisodePreparing: boolean;
      audioReady: boolean;
      illustrationReady?: boolean;
      allReady: boolean;
    };
  };
  seasons: {
    seasonId: string;
    title?: string;
    theme: string;
    coverImageUrl?: string | null;
    currentEpisodeNumber: number;
    totalEpisodes?: number;
    progressPercent: number;
  }[];
};

export function mapActiveSeasonDisplay(active: HomeSummaryInput['activeSeason']): ActiveSeasonDisplay {
  const total = active.totalEpisodes || 1;
  const episodeNumber = active.currentEpisodeNumber;
  return {
    seasonId: active.seasonId,
    seasonTitle: truncateText(active.title || 'Your new season', 48),
    episodeNumber,
    totalEpisodes: total,
    episodeLine: `Episode ${episodeNumber}`,
    chapterLine: truncateText(active.currentEpisodeTitle || 'Continue the story', 56),
    progressPercent: active.progressPercent,
    readyEpisode: episodeNumber,
    coverImageUrl: active.coverImageUrl || null,
    readiness: {
      nextEpisodePreparing: active.readiness.nextEpisodePreparing,
      audioReady: active.readiness.audioReady,
      illustrationReady: active.readiness.illustrationReady ?? !active.readiness.nextEpisodePreparing,
      allReady: active.readiness.allReady,
    },
  };
}

export function mapSidebarSeasons(
  seasons: HomeSummaryInput['seasons'],
  activeSeasonId: string,
): SidebarSeasonDisplay[] {
  return seasons.map((season, index) => {
    const total = season.totalEpisodes || 1;
    return {
      seasonId: season.seasonId,
      seasonNumber: index + 1,
      title: truncateText(season.title || 'Your new season', 40),
      episodeNumber: season.currentEpisodeNumber,
      totalEpisodes: total,
      episodesLabel: `Episode ${season.currentEpisodeNumber}`,
      isActive: season.seasonId === activeSeasonId,
      href: `/seasons/${season.seasonId}`,
      coverImageUrl: season.coverImageUrl || null,
    };
  });
}
