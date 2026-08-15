export type ParentSpaceRange = 'week' | '30days';

export type ParentSpaceSeasonCard = {
  seasonId: string;
  title: string;
  coverImageUrl: string | null;
  status: 'active' | 'completed' | 'archived' | string;
  seasonNumber: number;
  completedEpisodes: number;
  totalEpisodes: number;
  wordsPracticed: number;
  speakingCompleted: number;
};

export type ParentSpaceWordRow = {
  word: string;
  translationRu: string;
  exposureCount: number;
  attempts: number;
  successes: number;
  lastPracticedAt?: string | null;
};

export type ParentSpaceView = {
  ownerUserId: string;
  range: string;
  seasonId: string | null;
  activeSeasonTitle: string | null;
  overview: {
    englishAudioListenedMinutes: number;
    activeLearningDays: number;
    vocabularyLearned: number;
    vocabularyPracticed?: number;
    speakingSuccessful: number;
  };
  deltas: {
    audioListenedPercent: number;
    speakingSuccessfulPercent: number;
    vocabularyPracticedPercent: number;
  };
  listening: {
    weeklyMinutes: { label: string; minutes: number }[];
    completionRatePercent: number;
    completedSessions: number;
    consistencyDays: number;
    hasActivity: boolean;
  };
  speaking: {
    attemptedPhrases: number;
    successfulPhrases: number;
    accuracyPercent: number;
    trend: { label: string; percent: number }[];
    hasActivity: boolean;
    nextGoal: string | null;
  };
  vocabulary: {
    totalWords: number;
    successfulWords: number;
    totalAttempts: number;
    successfulAttempts: number;
    words: ParentSpaceWordRow[];
    hasActivity: boolean;
  };
  spelling: {
    answers: number;
    correctPercent: number;
    hasActivity: boolean;
  };
  seasons: ParentSpaceSeasonCard[];
  listeningTrackingFull: boolean;
};
