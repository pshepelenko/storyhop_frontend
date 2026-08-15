import type { UiLanguage } from '@/lib/ui-language';
import type { StorybookSort, StorybookTab } from './types';

export type StorybookCopy = {
  backToSeasons: string;
  eyebrow: string;
  subtitle: string;
  momentsUnlocked: (count: number) => string;
  tabs: Record<StorybookTab, string>;
  sorts: Record<StorybookSort, string>;
  sortLabel: string;
  favorite: string;
  unfavorite: string;
  emptyAll: string;
  emptyFavorites: string;
  emptyRecent: string;
  tryAgain: string;
  episodeLabel: (n: number) => string;
  statusActive: string;
  statusCompleted: string;
  errorLoad: string;
  errorFavorite: string;
  titlePending: string;
};

const COPY: Record<UiLanguage, StorybookCopy> = {
  english: {
    backToSeasons: 'Back to seasons',
    eyebrow: 'Storybook',
    subtitle: 'Story moments from this season.',
    momentsUnlocked: (count) => `${count} moments with art`,
    tabs: {
      all: 'All moments',
      favorites: 'Favorites',
      recent: 'Recent',
    },
    sorts: {
      episode: 'Oldest first',
      episode_desc: 'Newest first',
    },
    sortLabel: 'Sort moments',
    favorite: 'Add to favorites',
    unfavorite: 'Remove from favorites',
    emptyAll: 'No moments yet. Finish chapters to collect them here.',
    emptyFavorites: 'No favorites yet. Tap the heart on a moment.',
    emptyRecent: 'No recent moments yet.',
    tryAgain: 'Try again',
    episodeLabel: (n) => `Ep. ${n}`,
    statusActive: 'Active',
    statusCompleted: 'Completed',
    errorLoad: 'Could not load storybook.',
    errorFavorite: 'Could not update favorite.',
    titlePending: 'Your story',
  },
  russian: {
    backToSeasons: 'К сезонам',
    eyebrow: 'Альбом',
    subtitle: 'Моменты этой истории.',
    momentsUnlocked: (count) => `${count} моментов с иллюстрацией`,
    tabs: {
      all: 'Все моменты',
      favorites: 'Избранное',
      recent: 'Недавние',
    },
    sorts: {
      episode: 'Сначала старые',
      episode_desc: 'Сначала новые',
    },
    sortLabel: 'Сортировка',
    favorite: 'В избранное',
    unfavorite: 'Убрать из избранного',
    emptyAll: 'Пока нет моментов. Проходите главы — они появятся здесь.',
    emptyFavorites: 'В избранном пусто. Нажмите сердечко на моменте.',
    emptyRecent: 'Пока нет недавних моментов.',
    tryAgain: 'Попробовать снова',
    episodeLabel: (n) => `Эп. ${n}`,
    statusActive: 'Активный',
    statusCompleted: 'Завершён',
    errorLoad: 'Не удалось загрузить альбом.',
    errorFavorite: 'Не удалось обновить избранное.',
    titlePending: 'Ваша история',
  },
};

export function getStorybookCopy(lang: UiLanguage): StorybookCopy {
  return COPY[lang];
}
