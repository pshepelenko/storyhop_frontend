import type { UiLanguage } from '@/lib/ui-language';
import type { LibraryFilter, LibrarySort } from './types';

export type LibraryCopy = {
  title: string;
  mobileTitle?: string;
  subtitle: string;
  createSeason: string;
  searchPlaceholder: string;
  continue: string;
  continueStorybook: string;
  open: string;
  storybook: string;
  parentReport: string;
  archive: string;
  unarchive: string;
  more: string;
  filters: Record<LibraryFilter, string>;
  sorts: Record<LibrarySort, string>;
  status: Record<'active' | 'completed' | 'archived', string>;
  emptyTitle: string;
  emptyText: string;
  createFirst: string;
  tryDemo: string;
  errorTitle: string;
  errorText: string;
  tryAgain: string;
  lastActivity: string;
  episodeProgress: (current: number) => string;
  episodeOfTotal: (current: number) => string;
  episodesShort: (completed: number) => string;
  words: (count: number) => string;
  wordsLearned: (count: number) => string;
  speakingTasks: (count: number) => string;
  speakingMoments: (count: number) => string;
  continueBlockTitle: string;
  seasonLabel: (index: number) => string;
  noResults: string;
  sortLabel: string;
  titlePending: string;
};

const COPY: Record<UiLanguage, LibraryCopy> = {
  english: {
    title: 'Library',
    mobileTitle: 'My Library',
    subtitle: 'All your story seasons in one place',
    createSeason: 'Create season',
    searchPlaceholder: 'Search seasons',
    continue: 'Continue',
    continueStorybook: 'Continue storybook',
    open: 'Open',
    storybook: 'Open storybook',
    parentReport: 'Progress',
    archive: 'Archive',
    unarchive: 'Restore',
    more: 'More',
    filters: { all: 'All', active: 'Active', completed: 'Completed', archived: 'Archived' },
    sorts: { recent: 'Most recent', oldest: 'Oldest', progress: 'By progress', az: 'A-Z' },
    status: { active: 'Active', completed: 'Completed', archived: 'Archived' },
    emptyTitle: 'No seasons yet',
    emptyText: 'Create your first season to start a personalized English adventure.',
    createFirst: 'Create first season',
    tryDemo: 'Try demo story',
    errorTitle: 'Something went wrong',
    errorText: "We couldn't load your library.",
    tryAgain: 'Try again',
    lastActivity: 'Last activity',
    episodeProgress: (current) => `Episode ${current}`,
    episodeOfTotal: (current) => `Episode ${current}`,
    episodesShort: (completed) => `${completed} episodes completed`,
    words: (count) => `${count} words`,
    wordsLearned: (count) => `${count} words learned`,
    speakingTasks: (count) => `${count} speaking`,
    speakingMoments: (count) => `${count} speaking moments`,
    continueBlockTitle: 'Continue current season',
    seasonLabel: (index) => `Season ${index}`,
    noResults: 'No seasons match your filters.',
    sortLabel: 'Sort seasons',
    titlePending: 'Your new season',
  },
  russian: {
    title: 'Библиотека',
    mobileTitle: 'Моя библиотека',
    subtitle: 'Все сезоны вашего ребёнка в одном месте',
    createSeason: 'Создать сезон',
    searchPlaceholder: 'Поиск сезонов',
    continue: 'Продолжить',
    continueStorybook: 'Продолжить историю',
    open: 'Открыть',
    storybook: 'Открыть альбом',
    parentReport: 'Прогресс',
    archive: 'В архив',
    unarchive: 'Вернуть',
    more: 'Ещё',
    filters: { all: 'Все', active: 'Активные', completed: 'Завершённые', archived: 'Архив' },
    sorts: { recent: 'Сначала новые', oldest: 'Сначала старые', progress: 'По прогрессу', az: 'По алфавиту' },
    status: { active: 'Активный', completed: 'Завершён', archived: 'Архив' },
    emptyTitle: 'Пока нет сезонов',
    emptyText: 'Создайте первый сезон и начните персональное приключение на английском.',
    createFirst: 'Создать первый сезон',
    tryDemo: 'Открыть демо-историю',
    errorTitle: 'Что-то пошло не так',
    errorText: 'Не удалось загрузить библиотеку.',
    tryAgain: 'Повторить',
    lastActivity: 'Последняя активность',
    episodeProgress: (current) => `Эпизод ${current}`,
    episodeOfTotal: (current) => `Эпизод ${current}`,
    episodesShort: (completed) => `${completed} эпизодов пройдено`,
    words: (count) => `${count} слов`,
    wordsLearned: (count) => `${count} слов изучено`,
    speakingTasks: (count) => `${count} speaking`,
    speakingMoments: (count) => `${count} speaking-моментов`,
    continueBlockTitle: 'Продолжить текущий сезон',
    seasonLabel: (index) => `Сезон ${index}`,
    noResults: 'Нет сезонов по выбранным фильтрам.',
    sortLabel: 'Сортировка',
    titlePending: 'Ваш новый сезон',
  },
};

export function getLibraryCopy(lang: UiLanguage): LibraryCopy {
  return COPY[lang];
}
