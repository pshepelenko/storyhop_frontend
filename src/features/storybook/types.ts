export type StorybookTab = 'all' | 'favorites' | 'recent';
export type StorybookSort = 'episode' | 'episode_desc';

export type StorybookMoment = {
  storybookEntryId: string;
  episodeId: string | null;
  illustrationId: string | null;
  title: string;
  summary: string;
  status: string;
  unlockCost: number;
  episodeNumber: number | null;
  episodeTitle: string | null;
  favorited: boolean;
  favoritedAt: string | null;
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type StorybookSeasonView = {
  seasonId: string;
  title: string;
  coverImageUrl: string | null;
  status: string;
  libraryStatus: 'active' | 'completed' | 'archived';
  momentsUnlocked: number;
  crystalBalance: number;
  moments: StorybookMoment[];
};
