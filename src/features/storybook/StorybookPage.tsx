import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import LanguageSelector from '@/components/home/LanguageSelector';
import Spinner from '@/components/spinner';
import { formatParentLabel } from '@/data/home-display';
import { apiFetchAsGuest } from '@/lib/api-client';
import { getUiLanguage } from '@/lib/ui-language';
import { useUiLanguage } from '@/lib/use-ui-language';
import { getStorybookSeason } from './api/storybookApi';
import MomentGrid from './components/MomentGrid';
import StorybookHero from './components/StorybookHero';
import StorybookSortDropdown from './components/StorybookSortDropdown';
import { getStorybookCopy } from './storybook-copy';
import type { StorybookSeasonView, StorybookSort } from './types';

export default function StorybookPage() {
  const router = useRouter();
  const { id } = router.query;
  const lang = useUiLanguage();
  const copy = getStorybookCopy(lang);

  const [data, setData] = useState<StorybookSeasonView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<StorybookSort>('episode');
  const [parentLabel, setParentLabel] = useState<string | null>(null);
  const [hasSeasons, setHasSeasons] = useState(true);
  const loadRequestIdRef = useRef(0);

  const load = useCallback(async (seasonId: string) => {
    const requestId = ++loadRequestIdRef.current;
    setLoading(true);
    setError('');
    try {
      const [storybook, homeRes] = await Promise.all([
        getStorybookSeason(seasonId),
        apiFetchAsGuest('/users/me/home-summary'),
      ]);
      if (requestId !== loadRequestIdRef.current) return;
      setData(storybook);
      if (homeRes.ok) {
        const home = await homeRes.json();
        if (requestId !== loadRequestIdRef.current) return;
        setHasSeasons(Boolean(home?.activeSeason || home?.hasSeasons || (home?.seasonsCount ?? 1) > 0));
        const active = home.activeSeason;
        setParentLabel(active?.childName ? formatParentLabel(active.childName) : null);
      }
    } catch (e) {
      if (requestId !== loadRequestIdRef.current) return;
      console.error(e);
      const detail = e instanceof Error && e.message ? ` (${e.message})` : '';
      setError(`${getStorybookCopy(getUiLanguage()).errorLoad}${detail}`);
      setData(null);
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    load(id);
  }, [id, load]);

  const visibleMoments = useMemo(() => {
    if (!data) return [];
    return [...data.moments].sort((a, b) => {
      const left = a.episodeNumber || 0;
      const right = b.episodeNumber || 0;
      return sort === 'episode_desc' ? right - left : left - right;
    });
  }, [data, sort]);
  const seasonTitle = data?.title || copy.titlePending;

  return (
    <AppShell
      showBottomNav
      hasSeasons={hasSeasons}
      maxWidth="wide"
      crystalBalance={data?.crystalBalance ?? null}
      parentLabel={parentLabel}
      headerRight={<LanguageSelector />}
      shellVariant="framed"
      plainBackground
    >
      {loading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      )}

      {!loading && (
        <>
          <div className="mb-5">
            <Link
              href="/library"
              className="inline-flex items-center gap-2 text-sm font-medium text-sh-forest hover:underline"
            >
              <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[2]">
                <path d="M12.5 4.5 7 10l5.5 5.5" />
              </svg>
              {copy.backToSeasons}
            </Link>
            <h1 className="mt-3 font-story text-[34px] font-bold leading-none text-sh-forest lg:text-[48px]">
              {data ? `${seasonTitle} - ${copy.eyebrow}` : copy.eyebrow}
            </h1>
            <p className="mt-2 text-sm text-sh-foreground/80 lg:text-[15px]">{copy.subtitle}</p>
          </div>

          {error && (
            <div className="mb-4 rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <p>{error}</p>
              {typeof id === 'string' && (
                <button
                  type="button"
                  onClick={() => load(id)}
                  className="mt-3 rounded-full bg-sh-forest px-4 py-2 text-xs font-semibold text-white"
                >
                  {copy.tryAgain}
                </button>
              )}
            </div>
          )}

          {data && (
            <>
              <StorybookHero data={{ ...data, title: seasonTitle }} copy={copy} />

              <div className="mb-5 flex justify-end lg:mb-6">
                <StorybookSortDropdown value={sort} onChange={setSort} copy={copy} />
              </div>

              <MomentGrid
                moments={visibleMoments}
                seasonId={data.seasonId}
                copy={copy}
                emptyText={copy.emptyAll}
              />
            </>
          )}
        </>
      )}
    </AppShell>
  );
}
