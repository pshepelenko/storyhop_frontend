export type SeasonStatus = 'active' | 'completed' | 'archived';

export type LibraryFilter = 'all' | SeasonStatus;

export type LibrarySort = 'recent' | 'oldest' | 'progress' | 'az';

export interface LibrarySeasonItem {
  id: string;
  title: string;
  worldId?: string | null;
  worldLabel?: string;
  coverImageUrl?: string | null;
  status: SeasonStatus;
  totalEpisodes: number;
  completedEpisodes: number;
  currentEpisodeNumber?: number;
  currentEpisodeTitle?: string;
  nextEpisodeId?: string | null;
  lastActivityAt?: string;
  updatedAt?: string;
  createdAt?: string;
  wordsCount?: number;
  wordsTrainedCount?: number;
  speakingTasksCount?: number;
  speakingTasksCompletedCount?: number;
  storybookAvailable?: boolean;
  parentReportAvailable?: boolean;
}

export interface LibraryViewModel {
  currentSeason?: LibrarySeasonItem | null;
  seasons: LibrarySeasonItem[];
}
