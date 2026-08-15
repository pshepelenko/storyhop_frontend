import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import LanguageSelector from '@/components/home/LanguageSelector';
import ParentStatePanel from '@/components/parent/ParentStatePanel';
import Spinner from '@/components/spinner';
import { formatParentLabel } from '@/data/home-display';
import { apiFetchAsGuest } from '@/lib/api-client';
import { getUiLanguage } from '@/lib/ui-language';
import { useUiLanguage } from '@/lib/use-ui-language';
import { getParentSpaceProgress } from './api/parentSpaceApi';
import ListeningCard from './components/ListeningCard';
import ParentFooterBanner from './components/ParentFooterBanner';
import ParentSpaceHeader from './components/ParentSpaceHeader';
import SeasonProgressSection from './components/SeasonProgressSection';
import SpeakingCard from './components/SpeakingCard';
import SummaryRow from './components/SummaryRow';
import VocabularyCard from './components/VocabularyCard';
import { getParentSpaceCopy } from './parent-space-copy';
import type { ParentSpaceRange, ParentSpaceView } from './types';

export default function ParentSpacePage() {
  const router = useRouter();
  const lang = useUiLanguage();
  const copy = getParentSpaceCopy(lang);
  const seasonIdQuery =
    typeof router.query.seasonId === 'string' ? router.query.seasonId : null;

  const [range, setRange] = useState<ParentSpaceRange>('week');
  const [data, setData] = useState<ParentSpaceView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasSeasons, setHasSeasons] = useState(true);
  const [parentLabel, setParentLabel] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [progress, homeRes] = await Promise.all([
        getParentSpaceProgress(range, seasonIdQuery),
        apiFetchAsGuest('/users/me/home-summary'),
      ]);
      setData(progress);
      if (homeRes.ok) {
        const home = await homeRes.json();
        setHasSeasons(Boolean(home?.activeSeason || home?.hasSeasons || (home?.seasonsCount ?? 0) > 0));
        const active = home.activeSeason;
        setParentLabel(active?.childName ? formatParentLabel(active.childName) : null);
      }
    } catch (e) {
      console.error(e);
      setData(null);
      setError(getParentSpaceCopy(getUiLanguage()).errorLoad);
    } finally {
      setLoading(false);
    }
  }, [range, seasonIdQuery]);

  useEffect(() => {
    if (!router.isReady) return;
    load();
  }, [router.isReady, load]);

  const noActivity =
    data &&
    !data.listening.hasActivity &&
    !data.speaking.hasActivity &&
    !data.vocabulary.hasActivity &&
    !data.spelling.hasActivity;

  return (
    <AppShell
      showBottomNav
      hasSeasons={hasSeasons}
      maxWidth="wide"
      parentLabel={parentLabel}
      headerRight={<LanguageSelector />}
      shellVariant="framed"
      plainBackground
    >
      <ParentSpaceHeader
        copy={copy}
        seasonTitle={data?.activeSeasonTitle || null}
        range={range}
        onRangeChange={setRange}
      />

      {loading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      )}

      {!loading && error && (
        <div className="mb-4 rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => load()}
            className="mt-3 rounded-full bg-sh-forest px-4 py-2 text-xs font-semibold text-white"
          >
            {copy.tryAgain}
          </button>
        </div>
      )}

      {!loading && !error && noActivity && (
        <ParentStatePanel
          variant="no-activity"
          title={copy.emptyTitle}
          message={copy.emptyBody}
          primaryAction={{ label: copy.emptyPrimary, href: '/' }}
        />
      )}

      {!loading && !error && data && !noActivity && (
        <div>
          {!data.listeningTrackingFull && (
            <p className="mb-4 rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {copy.trackingHint}
            </p>
          )}

          <SummaryRow data={data} copy={copy} />

          <div className="grid gap-4 lg:grid-cols-3">
            <ListeningCard data={data.listening} copy={copy} />
            <SpeakingCard data={data.speaking} copy={copy} />
            <VocabularyCard vocabulary={data.vocabulary} spelling={data.spelling} copy={copy} />
          </div>

          <SeasonProgressSection seasons={data.seasons} copy={copy} />
          <ParentFooterBanner copy={copy} />
        </div>
      )}

      {!loading && !error && data && noActivity && data.seasons.length > 0 && (
        <>
          <SeasonProgressSection seasons={data.seasons} copy={copy} />
          <ParentFooterBanner copy={copy} />
        </>
      )}
    </AppShell>
  );
}
