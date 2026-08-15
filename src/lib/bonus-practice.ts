import type { UiLanguage } from '@/lib/ui-language';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export type PracticeOrigin = 'story' | 'home';
export type PracticeType = 'speaking_single' | 'speaking_recap' | 'spelling_test';
export type PracticeMode = 'audio' | 'translation';
export type PracticeLaunchMode = 'intro' | 'direct';

export type BonusPracticeHomeSummary = {
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

export type BonusPracticeSeasonSummary = {
  speaking: {
    single: {
      available: boolean;
      phraseText: string | null;
      episodeId: string | null;
      episodeNumber: number | null;
      reward: number;
    };
    recap: {
      available: boolean;
      pendingCount: number;
      maxReward: number;
    };
  };
  writing: {
    available: boolean;
    active: boolean;
    wordCount: number;
    maxReward: number;
  };
  storyLaunch: {
    speakingType: PracticeType | null;
    speakingAvailable: boolean;
    writingAvailable: boolean;
    writingPromptAvailable: boolean;
  };
};

export type SpeakingPracticePayload = {
  origin: PracticeOrigin;
  type: PracticeType | null;
  rewardPerSuccess?: number;
  maxReward?: number;
  phraseText?: string;
  episodeId?: string;
  episodeNumber?: number;
  pendingCount?: number;
  items?: {
    itemId: string;
    phraseText: string;
    episodeId: string;
    episodeNumber: number;
    stepIndex: number;
  }[];
};

export type WritingChallengePayload = {
  challengeId: string;
  status: 'active' | 'completed';
  currentIndex: number;
  wordCount: number;
  completedWords: number;
  totalReward: number;
  maxReward?: number;
  currentWord: {
    term: string;
    translationRu: string;
    meaningInContext: string;
    firstLetter: string;
    hintsUsed: ('first_letter' | 'translation')[];
    revealed: boolean;
    rewardEligible?: boolean;
  } | null;
  words: {
    term: string;
    translationRu: string;
    completed: boolean;
    reward: number;
    hintsUsed: ('first_letter' | 'translation')[];
    rewardEligible?: boolean;
  }[];
};

export type WritingPracticePayload = {
  origin: PracticeOrigin;
  type: PracticeType;
  available: boolean;
  wordCount: number;
  maxReward: number;
  challenge: WritingChallengePayload | null;
};

export function practiceCopy(language: UiLanguage) {
  if (language === 'russian') {
    return {
      bonus: 'Бонус',
      back: 'Назад',
      skip: 'Пропустить',
      start: 'Начать',
      continueStory: 'Продолжить историю',
      returnToStory: 'Вернуться к истории',
      returnHome: 'На главную',
      close: 'Закрыть',
      repeat: 'Повторить фразу',
      newPhrases: 'Новые фразы',
      loadingPractice: 'Загружаем фразы...',
      skipForNow: 'Пропустить пока',
      listen: 'Послушай фразу',
      listening: 'Слушаем...',
      sayNow: 'Начинай говорить',
      checking: 'Проверяем...',
      unsupported: 'В этом браузере нет поддержки распознавания речи.',
      transcript: 'Система услышала',
      next: 'Дальше',
      check: 'Проверить',
      audioMode: 'По аудио',
      translationMode: 'По переводу',
      firstLetter: 'Первая буква',
      showTranslation: 'Показать перевод',
      showAnswer: 'Показать ответ',
      writePlaceholder: 'Напиши слово...',
      goodJob: 'Отлично!',
      attemptAccepted: 'Попытка засчитана',
      speakingHomeCompleteTitle: 'Разговорная практика завершена',
      speakingHomeCompleteSubtitle: (count: number) => `Повторено фраз: ${count}`,
      wordsPracticed: (count: number) => `${count} слова потренировано`,
      crystalsEarned: (count: number) => `Получено: +${count} кристалл${count === 1 ? '' : count < 5 ? 'а' : 'ов'}`,
      tryAgain: 'Попробуй еще раз',
      speakIntroTitle: 'Разговорная практика',
      speakIntroBodySingle: 'Повтори одну фразу из этой главы и получи +1 кристалл за успешную попытку.',
      speakIntroBodyRecap: 'Повтори 3 пропущенные фразы. За каждую успешную фразу начисляется +1 кристалл.',
      speakPromptTitle: 'Послушай и повтори фразу',
      speakingReward: '+1 кристалл за засчитанную фразу',
      writingIntroTitle: 'Словарный диктант',
      writingIntroBody: 'Проверь, как хорошо ты запоминаешь английские слова из этого сезона.',
      writingReward: 'До +4 кристаллов',
      writingPrompt: 'Слушай и напиши слово',
      writingPromptTranslation: 'Прочитай перевод и напиши слово',
      lineAccepted: 'Фраза засчитана',
      lineNotMatched: 'Мы услышали тебя, но фраза совпала недостаточно точно.',
      pendingUnavailable: 'Сейчас бонусная практика недоступна.',
    };
  }

  return {
    bonus: 'Bonus',
    back: 'Back',
    skip: 'Skip',
    start: 'Start',
    continueStory: 'Continue story',
    returnToStory: 'Return to story',
    returnHome: 'Back to home',
    close: 'Close',
    repeat: 'Repeat phrase',
    newPhrases: 'New phrases',
    loadingPractice: 'Loading phrases...',
    skipForNow: 'Skip for now',
    listen: 'Listen',
    listening: 'Listening...',
    sayNow: 'Start speaking now',
    checking: 'Checking...',
    unsupported: 'Speech recognition is not supported in this browser.',
    transcript: 'Heard',
    next: 'Next',
    check: 'Check',
    audioMode: 'By audio',
    translationMode: 'By translation',
    firstLetter: 'First letter',
    showTranslation: 'Show translation',
    showAnswer: 'Show answer',
    writePlaceholder: 'Type the word...',
    goodJob: 'Great job!',
    attemptAccepted: 'Attempt accepted',
    speakingHomeCompleteTitle: 'Speaking practice complete',
    speakingHomeCompleteSubtitle: (count: number) => `${count} ${count === 1 ? 'phrase' : 'phrases'} repeated`,
    wordsPracticed: (count: number) => `${count} words practiced`,
    crystalsEarned: (count: number) => `Earned: +${count} crystals`,
    tryAgain: 'Try again',
    speakIntroTitle: 'Speaking practice',
    speakIntroBodySingle: 'Repeat one phrase from this chapter and earn +1 crystal for a successful attempt.',
    speakIntroBodyRecap: 'Repeat 3 skipped phrases. Each successful phrase earns +1 crystal.',
    speakPromptTitle: 'Listen and repeat the phrase',
    speakingReward: '+1 crystal for each accepted phrase',
    writingIntroTitle: 'Spelling test',
    writingIntroBody: 'Check how well you remember the English words from this season.',
    writingReward: 'Up to +4 crystals',
    writingPrompt: 'Listen and write the word',
    writingPromptTranslation: 'Read the translation and write the word',
    lineAccepted: 'The phrase was accepted',
    lineNotMatched: 'We heard you, but the phrase did not match closely enough.',
    pendingUnavailable: 'Bonus practice is not available right now.',
  };
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}
