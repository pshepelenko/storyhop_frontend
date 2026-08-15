import type { UiLanguage } from '@/lib/ui-language';
import type { ParentSpaceRange } from './types';

export type ParentSpaceCopy = {
  title: string;
  subtitle: string;
  seasonSubtitle: (title: string) => string;
  ranges: Record<ParentSpaceRange, string>;
  rangeLabel: string;
  summaryListening: string;
  summarySpeaking: string;
  summaryVocab: string;
  vsLastPeriod: (percent: number) => string;
  listeningTitle: string;
  listeningSubtitle: string;
  completionRate: string;
  daysListened: (n: number) => string;
  listeningBanner: string;
  listeningEmpty: string;
  speakingTitle: string;
  speakingSubtitle: string;
  attempted: string;
  successful: string;
  accuracy: string;
  speakingBanner: string;
  speakingEmpty: string;
  vocabTitle: string;
  vocabSubtitle: string;
  wordsTotal: string;
  wordsSuccessful: string;
  attemptsTotal: string;
  attemptsSuccessful: string;
  topWords: string;
  wordCol: string;
  translationCol: string;
  attemptsCol: string;
  successCol: string;
  spellingTitle: string;
  spellingAnswers: (n: number) => string;
  spellingCorrect: (n: number) => string;
  vocabEmpty: string;
  seasonsTitle: string;
  seeAllSeasons: string;
  seasonEpisodes: (done: number) => string;
  seasonMeta: (n: number) => string;
  wordsPracticed: (n: number) => string;
  speakingCount: (n: number) => string;
  viewProgress: string;
  statusActive: string;
  statusCompleted: string;
  statusArchived: string;
  footerTitle: string;
  footerBody: string;
  emptyTitle: string;
  emptyBody: string;
  emptyPrimary: string;
  tryAgain: string;
  errorLoad: string;
  trackingHint: string;
};

const COPY: Record<UiLanguage, ParentSpaceCopy> = {
  english: {
    title: "Your Child's English Progress",
    subtitle: 'A simple view of listening, speaking, and word practice.',
    seasonSubtitle: (title) => `Season: ${title}`,
    ranges: { week: 'This week', '30days': 'Last 30 days' },
    rangeLabel: 'Date range',
    summaryListening: 'English audio listened',
    summarySpeaking: 'Speaking phrases',
    summaryVocab: 'Word practice',
    vsLastPeriod: (percent) =>
      percent === 0 ? 'Same as last period' : `${percent > 0 ? '↑' : '↓'} ${Math.abs(percent)}% vs last period`,
    listeningTitle: 'Listening',
    listeningSubtitle: 'English audio minutes',
    completionRate: 'Completion rate',
    daysListened: (n) => `${n} days listened this period`,
    listeningBanner: 'Great listening habit! Keep it up!',
    listeningEmpty: 'Listening minutes appear after your child plays English audio.',
    speakingTitle: 'Speaking',
    speakingSubtitle: 'English phrases',
    attempted: 'Attempted',
    successful: 'Successful',
    accuracy: 'Accuracy',
    speakingBanner: 'Speaking is becoming more confident!',
    speakingEmpty: 'Speaking practice grows as your child says lines from the story.',
    vocabTitle: 'Word practice',
    vocabSubtitle: 'How many words and spelling answers',
    wordsTotal: 'Words total',
    wordsSuccessful: 'Words with a correct answer',
    attemptsTotal: 'Attempts total',
    attemptsSuccessful: 'Successful',
    topWords: 'Words this period',
    wordCol: 'Word',
    translationCol: 'Translation',
    attemptsCol: 'Attempts',
    successCol: 'OK',
    spellingTitle: 'Spelling practice',
    spellingAnswers: (n) => `${n} answers`,
    spellingCorrect: (n) => `${n}% correct`,
    vocabEmpty: 'Word stats appear after reading and spelling practice.',
    seasonsTitle: 'Progress by season',
    seeAllSeasons: 'See all seasons',
    seasonEpisodes: (done) => `${done} episodes completed`,
    seasonMeta: (n) => `Season ${n}`,
    wordsPracticed: (n) => `${n} words`,
    speakingCount: (n) => `${n} speaking`,
    viewProgress: 'View progress',
    statusActive: 'Active',
    statusCompleted: 'Completed',
    statusArchived: 'Archived',
    footerTitle: 'Learning that stays with your child',
    footerBody: 'All listening, speaking, and word practice happens inside meaningful stories.',
    emptyTitle: 'No learning activity yet',
    emptyBody:
      'Listening minutes appear after English audio. Speaking and words grow as chapters and practice happen.',
    emptyPrimary: 'Go to home',
    tryAgain: 'Try again',
    errorLoad: 'Could not load parent progress.',
    trackingHint: 'Listening minutes will appear after your child plays chapter audio in the app.',
  },
  russian: {
    title: 'Прогресс английского вашего ребёнка',
    subtitle: 'Listening, Speaking и изучение слов — кратко и по делу.',
    seasonSubtitle: (title) => `Сезон: ${title}`,
    ranges: { week: 'Эта неделя', '30days': 'Последние 30 дней' },
    rangeLabel: 'Период',
    summaryListening: 'Listening — минуты аудио',
    summarySpeaking: 'Speaking — удачные фразы',
    summaryVocab: 'Изучение слов',
    vsLastPeriod: (percent) =>
      percent === 0
        ? 'Как в прошлом периоде'
        : `${percent > 0 ? '↑' : '↓'} ${Math.abs(percent)}% к прошлому периоду`,
    listeningTitle: 'Listening',
    listeningSubtitle: 'Минуты английского аудио',
    completionRate: 'Дослушано',
    daysListened: (n) => `${n} дней со слушанием за период`,
    listeningBanner: 'Отличная привычка слушать! Так держать!',
    listeningEmpty: 'Минуты появятся, когда ребёнок включит английскую озвучку.',
    speakingTitle: 'Speaking',
    speakingSubtitle: 'Английские фразы вслух',
    attempted: 'Попыток',
    successful: 'Удачных',
    accuracy: 'Точность',
    speakingBanner: 'Speaking даётся всё увереннее!',
    speakingEmpty: 'Прогресс Speaking появится, когда ребёнок произнесёт реплики из истории.',
    vocabTitle: 'Изучение слов',
    vocabSubtitle: 'Сколько слов и сколько ответов верно',
    wordsTotal: 'Всего слов',
    wordsSuccessful: 'С верным ответом',
    attemptsTotal: 'Всего попыток',
    attemptsSuccessful: 'Успешных',
    topWords: 'Слова за период',
    wordCol: 'Слово',
    translationCol: 'Перевод',
    attemptsCol: 'Попыток',
    successCol: 'Верно',
    spellingTitle: 'Правописание',
    spellingAnswers: (n) => `${n} ответов`,
    spellingCorrect: (n) => `${n}% верно`,
    vocabEmpty: 'Цифры появятся после чтения и практики правописания.',
    seasonsTitle: 'Прогресс по сезонам',
    seeAllSeasons: 'Все сезоны',
    seasonEpisodes: (done) => `${done} эпизодов пройдено`,
    seasonMeta: (n) => `Сезон ${n}`,
    wordsPracticed: (n) => `${n} слов`,
    speakingCount: (n) => `${n} Speaking`,
    viewProgress: 'Смотреть прогресс',
    statusActive: 'Активный',
    statusCompleted: 'Завершён',
    statusArchived: 'Архив',
    footerTitle: 'Знания, которые остаются с ребёнком',
    footerBody: 'Listening, Speaking и изучение слов — внутри настоящей истории.',
    emptyTitle: 'Пока нет учебной активности',
    emptyBody:
      'Минуты Listening появятся после озвучки. Speaking и слова — по ходу глав и практики.',
    emptyPrimary: 'На главную',
    tryAgain: 'Попробовать снова',
    errorLoad: 'Не удалось загрузить прогресс.',
    trackingHint: 'Минуты Listening появятся, когда ребёнок включит аудио главы в приложении.',
  },
};

export function getParentSpaceCopy(lang: UiLanguage): ParentSpaceCopy {
  return COPY[lang];
}

export function formatAudioDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h <= 0) return `${m}m`;
  if (m <= 0) return `${h}h`;
  return `${h}h ${m}m`;
}
