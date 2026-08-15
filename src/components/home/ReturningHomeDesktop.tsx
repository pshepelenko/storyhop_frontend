import Link from 'next/link';
import ActiveSeasonCard from './ActiveSeasonCard';
import ExploreStoryHopRow from './ExploreStoryHopRow';
import MySeasonsHeader from './MySeasonsHeader';
import ParentDashboardPromo from './ParentDashboardPromo';
import SeasonSidebarCard from './SeasonSidebarCard';
import { HomePracticeCards } from '@/components/practice/PracticeOpportunityCards';
import {
  ActiveSeasonDisplay,
  BonusPracticeHomeDisplay,
  SidebarSeasonDisplay,
} from '@/data/home-display';

type ReturningHomeDesktopProps = {
  activeDisplay: ActiveSeasonDisplay;
  sidebarSeasons: SidebarSeasonDisplay[];
  seasonIndex: number;
  bonusPractice?: BonusPracticeHomeDisplay | null;
};

export default function ReturningHomeDesktop({
  activeDisplay,
  sidebarSeasons,
  seasonIndex,
  bonusPractice,
}: ReturningHomeDesktopProps) {
  const visibleSeasons = sidebarSeasons.slice(0, 3);

  return (
    <div className="hidden lg:block space-y-3">
      <div className="grid grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] gap-5 items-stretch">
        <section className="rounded-[var(--sh-radius-lg)] border border-sh-border bg-white p-4 shadow-[var(--sh-shadow-card)] flex flex-col min-w-0 min-h-0">
          <h2 className="text-sm font-semibold text-sh-foreground mb-2.5 shrink-0">Continue where you left off</h2>
          <div className="flex-1 min-h-[220px] flex flex-col">
            <ActiveSeasonCard
              variant="desktop"
              seasonId={activeDisplay.seasonId}
              seasonIndex={seasonIndex}
              display={activeDisplay}
              hideHeading
              fillHeight
            />
          </div>
        </section>

        <aside className="rounded-[var(--sh-radius-lg)] border border-sh-border bg-white p-4 shadow-[var(--sh-shadow-card)] flex flex-col min-h-0">
          <MySeasonsHeader />
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            {visibleSeasons.map((season) => (
              <SeasonSidebarCard key={season.seasonId} season={season} />
            ))}
          </div>
          <Link
            href="/library"
            className="mt-3 flex w-full items-center justify-center rounded-[var(--sh-radius)] border border-sh-border bg-white px-4 py-2 text-sm font-medium text-sh-foreground hover:border-sh-forest/40 hover:text-sh-forest transition-colors shrink-0"
          >
            View all seasons
          </Link>
        </aside>
      </div>

      <ExploreStoryHopRow layout="desktop-full" />
      {bonusPractice && (
        <section>
          <HomePracticeCards seasonId={activeDisplay.seasonId} summary={bonusPractice} />
        </section>
      )}
      <ParentDashboardPromo layout="desktop" />
    </div>
  );
}
