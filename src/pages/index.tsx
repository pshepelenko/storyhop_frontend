import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import HomeEmptyState from '@/components/home/empty/HomeEmptyState';
import HomeWithSeasons from '@/components/home/HomeWithSeasons';
import LanguageSelector from '@/components/home/LanguageSelector';
import type { BonusPracticeHomeSummary } from '@/lib/bonus-practice';
import {
  formatParentLabel,
  mapActiveSeasonDisplay,
  mapSidebarSeasons,
  type ParentSnapshotDisplay,
  type TodayActionsDisplay,
} from '@/data/home-display';
import { apiFetchAsGuest } from '@/lib/api-client';

type HomeSummary = {
  hasSeasons: boolean;
  crystalBalance: number;
  activeSeason: {
    seasonId: string;
    childName: string;
    title?: string;
    theme: string;
    coverImageUrl?: string | null;
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
    bonusPractice?: BonusPracticeHomeSummary;
  } | null;
  seasons: {
    seasonId: string;
    childName: string;
    title?: string;
    theme: string;
    coverImageUrl?: string | null;
    progressPercent: number;
    currentEpisodeNumber: number;
    totalEpisodes: number;
    status: string;
  }[];
  bonusPractice?: BonusPracticeHomeSummary;
  todayActions?: TodayActionsDisplay;
  parentSnapshot?: ParentSnapshotDisplay;
};

export default function Home() {
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {
        const res = await apiFetchAsGuest('/users/me/home-summary', {
          signal: controller.signal,
        });
        if (!res.ok) {
          setLoadError(`Не удалось загрузить сезоны (HTTP ${res.status}).`);
          return;
        }
        setSummary(await res.json());
        setLoadError(null);
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
          setLoadError('Сервер StoryHop не ответил вовремя. Попробуйте обновить страницу.');
        } else {
          console.error(e);
          setLoadError('Не удалось связаться с сервером StoryHop. Попробуйте обновить страницу.');
        }
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };
    load();
  }, []);

  const hasSeasons = summary?.hasSeasons ?? false;
  const active = summary?.activeSeason;
  const parentLabel = active ? formatParentLabel(active.childName) : null;
  const seasonIndex = Math.max(1, (summary?.seasons.findIndex((s) => s.seasonId === active?.seasonId) ?? 0) + 1);
  const activeDisplay = active ? mapActiveSeasonDisplay(active) : null;
  const sidebarSeasons = active && summary ? mapSidebarSeasons(summary.seasons, active.seasonId) : [];

  return (
    <AppShell
      crystalBalance={hasSeasons ? (summary?.crystalBalance ?? 0) : undefined}
      showBottomNav
      hasSeasons={hasSeasons}
      emptyHomeLayout={!hasSeasons}
      maxWidth="full"
      plainBackground
      shellVariant={hasSeasons ? 'framed' : 'default'}
      headerRight={<LanguageSelector />}
      parentLabel={parentLabel}
    >
      {loading && <p className="text-sh-muted text-center py-12">Загрузка...</p>}

      {!loading && loadError && (
        <div className="max-w-lg mx-auto rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center">
          <p className="font-semibold text-sh-foreground">Не удалось загрузить данные</p>
          <p className="text-sm text-sh-muted mt-2 leading-relaxed">{loadError}</p>
        </div>
      )}

      {!loading && !loadError && !hasSeasons && <HomeEmptyState />}

      {!loading && !loadError && hasSeasons && active && summary && activeDisplay && parentLabel && summary.todayActions && summary.parentSnapshot && (
        <HomeWithSeasons
          childName={active.childName}
          activeDisplay={activeDisplay}
          sidebarSeasons={sidebarSeasons}
          seasonIndex={seasonIndex}
          todayActions={summary.todayActions}
          parentSnapshot={summary.parentSnapshot}
        />
      )}
    </AppShell>
  );
}
