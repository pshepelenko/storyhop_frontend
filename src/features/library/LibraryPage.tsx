import { useCallback, useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import LanguageSelector from '@/components/home/LanguageSelector';
import { formatParentLabel } from '@/data/home-display';
import { apiFetchAsGuest } from '@/lib/api-client';
import { useUiLanguage } from '@/lib/use-ui-language';
import { archiveSeason, getLibrarySeasons, unarchiveSeason } from './api/libraryApi';
import { getLibraryCopy } from './library-copy';
import type { LibraryFilter, LibrarySort, LibraryViewModel } from './types';
import { filterSeasons, searchSeasons, sortSeasons } from './utils';
import CurrentSeasonCard from './components/CurrentSeasonCard';
import LibraryEmptyState from './components/LibraryEmptyState';
import LibraryErrorState from './components/LibraryErrorState';
import LibraryFilters from './components/LibraryFilters';
import LibraryHeader from './components/LibraryHeader';
import LibraryLoadingSkeleton from './components/LibraryLoadingSkeleton';
import LibrarySearch from './components/LibrarySearch';
import LibrarySortDropdown from './components/LibrarySortDropdown';
import SeasonList from './components/SeasonList';

export default function LibraryPage() {
  const lang = useUiLanguage();
  const copy = getLibraryCopy(lang);

  const [data, setData] = useState<LibraryViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [sort, setSort] = useState<LibrarySort>('recent');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [crystalBalance, setCrystalBalance] = useState<number | null>(null);
  const [parentLabel, setParentLabel] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [library, homeRes] = await Promise.all([
        getLibrarySeasons(),
        apiFetchAsGuest('/users/me/home-summary'),
      ]);
      setData(library);
      if (homeRes.ok) {
        const home = await homeRes.json();
        setCrystalBalance(home.crystalBalance ?? null);
        const active = home.activeSeason;
        setParentLabel(active?.childName ? formatParentLabel(active.childName) : null);
      }
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleArchive = async (seasonId: string) => {
    setArchivingId(seasonId);
    try {
      await archiveSeason(seasonId);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setArchivingId(null);
    }
  };

  const handleUnarchive = async (seasonId: string) => {
    setArchivingId(seasonId);
    try {
      await unarchiveSeason(seasonId);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setArchivingId(null);
    }
  };

  const seasons = useMemo(() => data?.seasons ?? [], [data]);
  const hasSeasons = seasons.length > 0;

  const visibleSeasons = useMemo(() => {
    const filtered = filterSeasons(seasons, filter);
    const searched = searchSeasons(filtered, debouncedSearch);
    return sortSeasons(searched, sort);
  }, [seasons, filter, debouncedSearch, sort]);

  const showContinue =
    data?.currentSeason &&
    data.currentSeason.status === 'active' &&
    (filter === 'all' || filter === 'active') &&
    !debouncedSearch.trim();

  return (
    <AppShell
      showBottomNav
      hasSeasons={hasSeasons}
      maxWidth="wide"
      crystalBalance={crystalBalance}
      parentLabel={parentLabel}
      headerRight={<LanguageSelector />}
      shellVariant={hasSeasons ? 'framed' : 'default'}
      plainBackground
    >
      {loading && <LibraryLoadingSkeleton />}

      {!loading && error && <LibraryErrorState copy={copy} onRetry={load} />}

      {!loading && !error && !hasSeasons && <LibraryEmptyState copy={copy} />}

      {!loading && !error && hasSeasons && (
        <>
          <div className="md:hidden">
            <LibraryHeader copy={copy} compact />
            {showContinue && data?.currentSeason && (
              <CurrentSeasonCard season={data.currentSeason} copy={copy} />
            )}
            <div className="mb-5 flex flex-col gap-3">
              <LibraryFilters value={filter} onChange={setFilter} copy={copy} />
              <LibrarySearch value={search} onChange={setSearch} copy={copy} />
              <LibrarySortDropdown value={sort} onChange={setSort} copy={copy} />
            </div>
          </div>

          <div className="hidden md:block">
            <LibraryHeader copy={copy} />
            {showContinue && data?.currentSeason && (
              <CurrentSeasonCard season={data.currentSeason} copy={copy} />
            )}
            <div className="mb-7 grid grid-cols-[auto_minmax(220px,1fr)_220px] items-center gap-4">
              <div className="min-w-0">
                <LibraryFilters value={filter} onChange={setFilter} copy={copy} />
              </div>
              <div className="min-w-0">
                <LibrarySearch value={search} onChange={setSearch} copy={copy} />
              </div>
              <LibrarySortDropdown value={sort} onChange={setSort} copy={copy} />
            </div>
          </div>

          <SeasonList
            seasons={visibleSeasons}
            allSeasons={seasons}
            copy={copy}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
            archivingId={archivingId}
          />
        </>
      )}
    </AppShell>
  );
}
