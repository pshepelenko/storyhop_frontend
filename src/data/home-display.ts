export type SidebarSeasonDisplay = {
  seasonId: string | null;
  seasonNumber: number;
  title: string;
  episodesLabel: string;
  locked: boolean;
  href?: string;
};

export type ActiveSeasonDisplay = {
  seasonId: string;
  seasonTitle: string;
  episodeLine: string;
  chapterLine: string;
  progressPercent: number;
  readyEpisode: number;
  totalEpisodes: number;
  readiness: {
    nextEpisodePreparing: boolean;
    audioReady: boolean;
    illustrationReady: boolean;
    allReady: boolean;
  };
};

const DEMO_LOCKED: Omit<SidebarSeasonDisplay, 'seasonId'>[] = [
  { seasonNumber: 2, title: 'Secrets of the Ocean', episodesLabel: '0 / 12 episodes', locked: true },
  { seasonNumber: 3, title: 'The Sky Isles', episodesLabel: '0 / 12 episodes', locked: true },
];

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
    theme: string;
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
    theme: string;
    currentEpisodeNumber: number;
    progressPercent: number;
  }[];
};

export function mapActiveSeasonDisplay(active: HomeSummaryInput['activeSeason']): ActiveSeasonDisplay {
  const total = active.totalEpisodes || 12;
  const ep = active.currentEpisodeNumber;
  return {
    seasonId: active.seasonId,
    seasonTitle: truncateText(active.theme, 48),
    episodeLine: `Episode ${ep} of ${total}`,
    chapterLine: truncateText(active.currentEpisodeTitle || 'Continue the story', 56),
    progressPercent: active.progressPercent,
    readyEpisode: ep,
    totalEpisodes: total,
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
  const activeIndex = Math.max(0, seasons.findIndex((s) => s.seasonId === activeSeasonId));
  const active = seasons[activeIndex];
  const total = 12;

  const rows: SidebarSeasonDisplay[] = [];

  if (active) {
    rows.push({
      seasonId: active.seasonId,
      seasonNumber: activeIndex + 1,
      title: truncateText(active.theme, 40),
      episodesLabel: `${active.currentEpisodeNumber} / ${total} episodes`,
      locked: false,
      href: `/seasons/${active.seasonId}`,
    });
  }

  const others = seasons.filter((s) => s.seasonId !== activeSeasonId);
  others.slice(0, 2).forEach((s, i) => {
    rows.push({
      seasonId: s.seasonId,
      seasonNumber: rows.length + 1,
      title: truncateText(s.theme, 40),
      episodesLabel: `${s.currentEpisodeNumber} / ${total} episodes`,
      locked: true,
    });
  });

  while (rows.length < 3) {
    const demo = DEMO_LOCKED[rows.length - 1];
    if (!demo) break;
    rows.push({ ...demo, seasonId: null });
  }

  return rows.slice(0, 3);
}
