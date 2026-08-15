import type { UiLanguage } from '@/lib/ui-language';

export type HomeWithSeasonsCopy = {
  greeting: (childName: string) => string;
  subtitle: string;
  continueTitle: string;
  activeSeason: string;
  continueCta: string;
  mySeasons: string;
  createSeason: string;
  viewAllSeasons: string;
  seasonLabel: (seasonNumber: number) => string;
  episodeLine: (episodeNumber: number) => string;
  activeBadge: string;
  todayTitle: string;
  spellingTitle: string;
  spellingMetric: (count: number) => string;
  spellingCaptionAvailable: string;
  spellingCaptionUnavailable: string;
  spellingCta: string;
  speakingTitle: string;
  speakingMetric: (count: number) => string;
  speakingCaptionAvailable: string;
  speakingCaptionUnavailable: string;
  speakingCta: string;
  rewardsTitle: string;
  rewardsMetric: (count: number) => string;
  rewardsCaption: string;
  rewardsCta: string;
  rewardsAvailable: (count: number) => string;
  parentTitle: string;
  weeklyTime: string;
  episodes: string;
  newWords: string;
  speaking: string;
  minutesLabel: (minutes: number) => string;
  episodesLabel: (count: number) => string;
  wordsLabel: (count: number) => string;
  practicesLabel: (count: number) => string;
  parentCtaTitle: string;
  parentCtaBody: string;
  parentCta: string;
  parentEmpty: string;
  openRewards: string;
  rewardsPageTitle: string;
  rewardsPageBody: string;
  rewardsPageHint: string;
  rewardsInvite: string;
  rewardsOpenReferral: string;
  rewardsOpenSettings: string;
};

function pluralRu(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return few;
  }

  return many;
}

const RU: HomeWithSeasonsCopy = {
  greeting: (childName) => `Привет, ${childName}!`,
  subtitle: 'Продолжим ваше приключение?',
  continueTitle: 'Продолжить историю',
  activeSeason: 'Активный сезон',
  continueCta: 'Продолжить',
  mySeasons: 'Мои сезоны',
  createSeason: 'Создать сезон',
  viewAllSeasons: 'Смотреть все',
  seasonLabel: (seasonNumber) => `Сезон ${seasonNumber}`,
  episodeLine: (episodeNumber) => `Эпизод ${episodeNumber}`,
  activeBadge: 'Активный',
  todayTitle: 'Сегодня в StoryHop',
  spellingTitle: 'Словарный диктант',
  spellingMetric: (count) => `${count} ${pluralRu(count, 'слово', 'слова', 'слов')}`,
  spellingCaptionAvailable: 'доступно для тренировки',
  spellingCaptionUnavailable: 'Пока нет слов для тренировки',
  spellingCta: 'Тренировать',
  speakingTitle: 'Разговорная практика',
  speakingMetric: (count) => `${count} ${pluralRu(count, 'фраза', 'фразы', 'фраз')}`,
  speakingCaptionAvailable: 'доступно для практики',
  speakingCaptionUnavailable: 'Пока нет фраз для практики',
  speakingCta: 'Практиковать',
  rewardsTitle: 'Rewards',
  rewardsMetric: (count) => `${count} ${pluralRu(count, 'награда', 'награды', 'наград')}`,
  rewardsCaption: 'доступно',
  rewardsCta: 'Открыть',
  rewardsAvailable: (count) => `${count} ${pluralRu(count, 'награда', 'награды', 'наград')} доступно`,
  parentTitle: 'Для родителей',
  weeklyTime: 'Время за неделю',
  episodes: 'Эпизоды',
  newWords: 'Новые слова',
  speaking: 'Speaking',
  minutesLabel: (minutes) => {
    const hours = Math.floor(minutes / 60);
    const restMinutes = minutes % 60;
    if (hours <= 0) {
      return `${restMinutes} мин`;
    }
    return `${hours} ч ${restMinutes.toString().padStart(2, '0')} мин`;
  },
  episodesLabel: (count) => `${count} просмотрено`,
  wordsLabel: (count) => `${count} выучено`,
  practicesLabel: (count) => `${count} практик`,
  parentCtaTitle: 'Отслеживайте прогресс',
  parentCtaBody: 'Смотрите подробную статистику и успехи ребёнка',
  parentCta: 'Открыть панель',
  parentEmpty: 'Данные появятся после первых занятий',
  openRewards: 'Открыть rewards',
  rewardsPageTitle: 'Rewards',
  rewardsPageBody: 'Здесь будут кристаллы, badges и другие награды ребёнка.',
  rewardsPageHint: 'Пока в MVP можно следить за балансом кристаллов и получать новые награды за чтение, speaking и приглашения друзей.',
  rewardsInvite: 'Пригласить друга',
  rewardsOpenReferral: 'Открыть приглашения',
  rewardsOpenSettings: 'Настройки',
};

const EN: HomeWithSeasonsCopy = {
  greeting: (childName) => `Hi, ${childName}!`,
  subtitle: 'Shall we continue the adventure?',
  continueTitle: 'Continue the story',
  activeSeason: 'Active season',
  continueCta: 'Continue',
  mySeasons: 'My seasons',
  createSeason: 'Create season',
  viewAllSeasons: 'View all seasons',
  seasonLabel: (seasonNumber) => `Season ${seasonNumber}`,
  episodeLine: (episodeNumber) => `Episode ${episodeNumber}`,
  activeBadge: 'Active',
  todayTitle: 'Today in StoryHop',
  spellingTitle: 'Spelling test',
  spellingMetric: (count) => `${count} words`,
  spellingCaptionAvailable: 'available to practice',
  spellingCaptionUnavailable: 'No words to practice yet',
  spellingCta: 'Practice',
  speakingTitle: 'Speaking practice',
  speakingMetric: (count) => `${count} phrases`,
  speakingCaptionAvailable: 'available to practice',
  speakingCaptionUnavailable: 'No phrases to practice yet',
  speakingCta: 'Practice',
  rewardsTitle: 'Rewards',
  rewardsMetric: (count) => `${count} rewards`,
  rewardsCaption: 'available',
  rewardsCta: 'Open',
  rewardsAvailable: (count) => `${count} rewards available`,
  parentTitle: 'For parents',
  weeklyTime: 'Time this week',
  episodes: 'Episodes',
  newWords: 'New words',
  speaking: 'Speaking',
  minutesLabel: (minutes) => {
    const hours = Math.floor(minutes / 60);
    const restMinutes = minutes % 60;
    if (hours <= 0) {
      return `${restMinutes} min`;
    }
    return `${hours} h ${restMinutes} min`;
  },
  episodesLabel: (count) => `${count} completed`,
  wordsLabel: (count) => `${count} learned`,
  practicesLabel: (count) => `${count} practices`,
  parentCtaTitle: 'Track progress',
  parentCtaBody: 'See detailed learning stats and your child\'s progress',
  parentCta: 'Open dashboard',
  parentEmpty: 'Data will appear after the first activities',
  openRewards: 'Open rewards',
  rewardsPageTitle: 'Rewards',
  rewardsPageBody: 'This screen will hold crystals, badges, and future rewards.',
  rewardsPageHint: 'For MVP, you can track crystals here and use referrals to earn more rewards.',
  rewardsInvite: 'Invite a friend',
  rewardsOpenReferral: 'Open referrals',
  rewardsOpenSettings: 'Settings',
};

export function getHomeWithSeasonsCopy(language: UiLanguage): HomeWithSeasonsCopy {
  return language === 'russian' ? RU : EN;
}
