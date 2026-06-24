import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import ActiveSeasonCard from '@/components/home/ActiveSeasonCard';
import EmptySeasonsBlock from '@/components/home/EmptySeasonsBlock';
import ExploreStoryHopRow from '@/components/home/ExploreStoryHopRow';
import FirstVisitHero from '@/components/home/FirstVisitHero';
import { HOME_FEATURES } from '@/components/home/home-features';
import HomeGreeting from '@/components/home/HomeGreeting';
import { HomeFeatureList, HomeFeatureSimpleCard } from '@/components/home/HomeFeatureRow';
import LanguageSelector from '@/components/home/LanguageSelector';
import ParentDashboardPromo from '@/components/home/ParentDashboardPromo';
import QuickPeekSection from '@/components/home/QuickPeekSection';
import ReturningHomeDesktop from '@/components/home/ReturningHomeDesktop';
import SeasonListItem from '@/components/home/SeasonListItem';
import { Button } from '@/components/ui';
import { formatParentLabel, mapActiveSeasonDisplay, mapSidebarSeasons } from '@/data/home-display';
import { imageAssets } from '@/data/image-assets';
import { getChannelUserId } from '@/lib/ui-language';

type HomeSummary = {
  hasSeasons: boolean;
  crystalBalance: number;
  activeSeason: {
    seasonId: string;
    childName: string;
    theme: string;
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
  } | null;
  seasons: {
    seasonId: string;
    childName: string;
    theme: string;
    progressPercent: number;
    currentEpisodeNumber: number;
  }[];
};

function TrustFooterRow() {
  const items = [
    { title: 'For children', desc: 'Age-appropriate stories, audio, and speaking.', img: imageAssets.home.features.audio },
    { title: 'For parents', desc: 'Clear progress without overwhelming analytics.', img: imageAssets.parent.shareWithParents },
    { title: 'Privacy first', desc: 'Safe, ad-free, and transparent about data.', img: imageAssets.home.features.privacy },
  ];
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.title} className="bg-white rounded-2xl border border-sh-border p-4 flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border border-sh-border">
            <Image src={item.img} alt="" fill className="object-cover" sizes="56px" />
          </div>
          <div>
            <p className="font-semibold text-sm">{item.title}</p>
            <p className="text-xs text-sh-muted mt-0.5 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MySeasonsSidebarMobile({
  seasons,
  activeSeasonId,
}: {
  seasons: HomeSummary['seasons'];
  activeSeasonId: string;
}) {
  const visible = seasons.slice(0, 3);
  return (
    <aside className="space-y-2">
      <h2 className="text-base font-semibold text-sh-foreground mb-3">My seasons</h2>
      {visible.map((s, index) => {
        const isActive = s.seasonId === activeSeasonId;
        return (
          <SeasonListItem
            key={s.seasonId}
            seasonId={s.seasonId}
            seasonLabel={`Season ${index + 1}: ${s.theme}`}
            subtitle={s.childName}
            progressPercent={s.progressPercent}
            locked={!isActive}
            episodeLabel={isActive ? `Episode ${s.currentEpisodeNumber} · Active` : 'Unlock by continuing Season 1'}
          />
        );
      })}
      {seasons.length > 3 && (
        <Link href="/library" className="block text-center text-xs text-sh-forest font-medium py-2">
          View all seasons →
        </Link>
      )}
    </aside>
  );
}

export default function Home() {
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const userId = getChannelUserId();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/home-summary`);
        if (res.ok) setSummary(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
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
      maxWidth="full"
      plainBackground
      desktopBottomNav
      shellVariant={hasSeasons ? 'framed' : 'default'}
      headerRight={<LanguageSelector />}
      parentLabel={parentLabel}
    >
      {loading && <p className="text-sh-muted text-center py-12">Loading...</p>}

      {!loading && !hasSeasons && (
        <div className="space-y-8 max-w-6xl mx-auto">
          <FirstVisitHero />
          <EmptySeasonsBlock showCta />

          <div className="lg:hidden">
            <h2 className="text-base font-semibold text-sh-foreground mb-3">Discover what StoryHop offers</h2>
            <HomeFeatureList features={HOME_FEATURES} />
          </div>

          <div className="hidden lg:block">
            <h2 className="text-base font-semibold text-sh-foreground mb-3">Why families love StoryHop</h2>
            <div className="grid grid-cols-3 gap-3">
              {HOME_FEATURES.map((f) => (
                <HomeFeatureSimpleCard key={f.key} feature={f} />
              ))}
            </div>
          </div>

          <QuickPeekSection />
          <div className="hidden lg:block">
            <TrustFooterRow />
          </div>

          <div className="bg-sh-border-subtle rounded-2xl border border-sh-border px-6 py-8 text-center">
            <p className="font-semibold text-xl text-sh-foreground">Ready to begin?</p>
            <p className="text-sm text-sh-muted mt-2">Create your child&apos;s first season in less than a minute.</p>
            <Button href="/seasons/new" className="mt-5 rounded-xl">
              Create first season ✨
            </Button>
          </div>
        </div>
      )}

      {!loading && hasSeasons && active && summary && activeDisplay && (
        <>
          <div className="lg:hidden space-y-5 max-w-lg mx-auto">
            <HomeGreeting childName={active.childName} variant="mobile" />
            <ActiveSeasonCard
              seasonId={active.seasonId}
              theme={active.theme}
              seasonIndex={seasonIndex}
              currentEpisodeNumber={active.currentEpisodeNumber}
              currentEpisodeTitle={active.currentEpisodeTitle}
              totalEpisodes={active.totalEpisodes || 96}
              progressPercent={active.progressPercent}
              readiness={active.readiness}
            />
            <MySeasonsSidebarMobile seasons={summary.seasons} activeSeasonId={active.seasonId} />
            <ExploreStoryHopRow />
            <ParentDashboardPromo layout="mobile" />
            <Button href="/seasons/new" variant="ghost" fullWidth className="text-sh-forest text-sm">
              + New season
            </Button>
          </div>

          <ReturningHomeDesktop
            childName={active.childName}
            activeDisplay={activeDisplay}
            sidebarSeasons={sidebarSeasons}
            seasonIndex={seasonIndex}
          />
        </>
      )}
    </AppShell>
  );
}
