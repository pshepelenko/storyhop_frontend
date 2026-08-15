import { apiFetchAsGuest } from '@/lib/api-client';
import type { ParentSpaceRange, ParentSpaceView } from '../types';

export async function getParentSpaceProgress(
  range: ParentSpaceRange,
  seasonId?: string | null,
): Promise<ParentSpaceView> {
  const params = new URLSearchParams({ range });
  if (seasonId) params.set('seasonId', seasonId);
  const response = await apiFetchAsGuest(`/users/me/learning-progress?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const raw = await response.json();
  const words = (raw.vocabulary?.words || []).map((word: Record<string, unknown>) => ({
    word: String(word.word || ''),
    translationRu: String(word.translationRu || ''),
    exposureCount: Number(word.exposureCount || 0),
    attempts: Number(word.attempts || 0),
    successes: Number(word.successes || 0),
    lastPracticedAt: (word.lastPracticedAt as string | null) || null,
  }));

  return {
    ownerUserId: raw.ownerUserId,
    range: raw.range || range,
    seasonId: raw.seasonId || null,
    activeSeasonTitle: raw.activeSeasonTitle || null,
    overview: {
      englishAudioListenedMinutes: raw.overview?.englishAudioListenedMinutes || 0,
      activeLearningDays: raw.overview?.activeLearningDays || 0,
      vocabularyLearned: raw.overview?.vocabularyLearned || 0,
      vocabularyPracticed:
        raw.vocabulary?.totalAttempts ??
        raw.overview?.vocabularyPracticed ??
        raw.vocabulary?.practiced ??
        0,
      speakingSuccessful: raw.overview?.speakingSuccessful || 0,
    },
    deltas: {
      audioListenedPercent: raw.deltas?.audioListenedPercent || 0,
      speakingSuccessfulPercent: raw.deltas?.speakingSuccessfulPercent || 0,
      vocabularyPracticedPercent: raw.deltas?.vocabularyPracticedPercent || 0,
    },
    listening: {
      weeklyMinutes: raw.listening?.weeklyMinutes || [],
      completionRatePercent: raw.listening?.completionRatePercent || 0,
      completedSessions: raw.listening?.completedSessions || 0,
      consistencyDays: raw.listening?.consistencyDays || 0,
      hasActivity: Boolean(raw.listening?.hasActivity),
    },
    speaking: {
      attemptedPhrases: raw.speaking?.attemptedPhrases || 0,
      successfulPhrases: raw.speaking?.successfulPhrases || 0,
      accuracyPercent: raw.speaking?.accuracyPercent || 0,
      trend: raw.speaking?.trend || [],
      hasActivity: Boolean(raw.speaking?.hasActivity),
      nextGoal: raw.speaking?.nextGoal || null,
    },
    vocabulary: {
      totalWords: raw.vocabulary?.totalWords ?? words.length,
      successfulWords: raw.vocabulary?.successfulWords ?? words.filter((w: { successes: number }) => w.successes > 0).length,
      totalAttempts: raw.vocabulary?.totalAttempts ?? raw.spelling?.answers ?? 0,
      successfulAttempts: raw.vocabulary?.successfulAttempts ?? 0,
      words,
      hasActivity: Boolean(raw.vocabulary?.hasActivity) || words.length > 0,
    },
    spelling: {
      answers: raw.spelling?.answers || 0,
      correctPercent: raw.spelling?.correctPercent || 0,
      hasActivity: Boolean(raw.spelling?.hasActivity),
    },
    seasons: raw.seasons || [],
    listeningTrackingFull: Boolean(raw.listeningTrackingFull),
  };
}
