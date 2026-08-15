import Link from 'next/link';
import ActiveSeasonCard from './ActiveSeasonCard';
import ExploreStoryHopRow from './ExploreStoryHopRow';
import HomeGreeting from './HomeGreeting';
import MobileHomeBottomLandscape from './MobileHomeBottomLandscape';
import MySeasonsHeader from './MySeasonsHeader';
import ParentDashboardPromo from './ParentDashboardPromo';
import SeasonSidebarCard from './SeasonSidebarCard';
import { HomePracticeCards } from '@/components/practice/PracticeOpportunityCards';
import { ActiveSeasonDisplay, BonusPracticeHomeDisplay, SidebarSeasonDisplay } from '@/data/home-display';

type ReturningHomeMobileProps = {
  parentLabel: string;
  activeDisplay: ActiveSeasonDisplay;
  sidebarSeasons: SidebarSeasonDisplay[];
  seasonIndex: number;
  bonusPractice?: BonusPracticeHomeDisplay | null;
};

export default function ReturningHomeMobile({
  parentLabel,
  activeDisplay,
  sidebarSeasons,
  seasonIndex,
  bonusPractice,
}: ReturningHomeMobileProps) {
  const visibleSeasons = sidebarSeasons.slice(0, 3);

  return (
    <div className="lg:hidden space-y-5">
      <HomeGreeting parentLabel={parentLabel} />

      <ActiveSeasonCard
        variant="mobile"
        seasonId={activeDisplay.seasonId}
        seasonIndex={seasonIndex}
        display={activeDisplay}
      />

      <section>
        <MySeasonsHeader />
        <div className="space-y-2">
          {visibleSeasons.map((season) => (
            <SeasonSidebarCard key={season.seasonId} season={season} />
          ))}
        </div>
        <Link
          href="/library"
          className="mt-3 flex w-full items-center justify-center rounded-[var(--sh-radius)] border border-sh-border bg-white px-4 py-2.5 text-sm font-medium text-sh-foreground hover:border-sh-forest/40 hover:text-sh-forest transition-colors"
        >
          View all seasons
        </Link>
      </section>

      <ExploreStoryHopRow />
      {bonusPractice && <HomePracticeCards seasonId={activeDisplay.seasonId} summary={bonusPractice} />}
      <ParentDashboardPromo layout="mobile" />
      <MobileHomeBottomLandscape />
    </div>
  );
}
