import Link from 'next/link';
import type {
  ActiveSeasonDisplay,
  ParentSnapshotDisplay,
  SidebarSeasonDisplay,
  TodayActionsDisplay,
} from '@/data/home-display';
import ActiveSeasonCard from './ActiveSeasonCard';
import HomeGreeting from './HomeGreeting';
import MobileHomeBottomLandscape from './MobileHomeBottomLandscape';
import MySeasonsHeader from './MySeasonsHeader';
import ParentSnapshotSection from './ParentSnapshotSection';
import SeasonSidebarCard from './SeasonSidebarCard';
import TodayActionsSection from './TodayActionsSection';
import { useUiLanguage } from '@/lib/use-ui-language';
import { getHomeWithSeasonsCopy } from './home-with-seasons-copy';

type HomeWithSeasonsProps = {
  childName: string;
  activeDisplay: ActiveSeasonDisplay;
  sidebarSeasons: SidebarSeasonDisplay[];
  seasonIndex: number;
  todayActions: TodayActionsDisplay;
  parentSnapshot: ParentSnapshotDisplay;
};

export default function HomeWithSeasons({
  childName,
  activeDisplay,
  sidebarSeasons,
  seasonIndex,
  todayActions,
  parentSnapshot,
}: HomeWithSeasonsProps) {
  const copy = getHomeWithSeasonsCopy(useUiLanguage());
  const visibleSeasons = sidebarSeasons.slice(0, 3);

  return (
    <>
      <div className="hidden space-y-5 lg:block">
        <HomeGreeting childName={childName} />

        <div className="grid grid-cols-[minmax(0,1fr)_300px] items-stretch gap-5">
          <section className="flex min-h-0 min-w-0 flex-col rounded-[var(--sh-radius-lg)] border border-sh-border bg-white p-4 shadow-[var(--sh-shadow-card)]">
            <h2 className="mb-2.5 shrink-0 text-sm font-semibold text-sh-foreground">{copy.continueTitle}</h2>
            <div className="flex min-h-[220px] flex-1 flex-col">
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

          <aside className="flex min-h-0 flex-col rounded-[var(--sh-radius-lg)] border border-sh-border bg-white p-4 shadow-[var(--sh-shadow-card)]">
            <MySeasonsHeader />
            <div className="flex flex-1 flex-col gap-2">
              {visibleSeasons.map((season) => (
                <SeasonSidebarCard key={season.seasonId} season={season} />
              ))}
            </div>
            <Link
              href="/library"
              className="mt-3 flex w-full items-center justify-center rounded-[var(--sh-radius)] border border-sh-border bg-white px-4 py-2 text-sm font-medium text-sh-foreground transition-colors hover:border-sh-forest/40 hover:text-sh-forest"
            >
              {copy.viewAllSeasons}
            </Link>
          </aside>
        </div>

        <TodayActionsSection seasonId={activeDisplay.seasonId} actions={todayActions} />
        <ParentSnapshotSection snapshot={parentSnapshot} />
      </div>

      <div className="space-y-5 lg:hidden">
        <HomeGreeting childName={childName} />

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
            className="mt-3 flex w-full items-center justify-center rounded-[var(--sh-radius)] border border-sh-border bg-white px-4 py-2.5 text-sm font-medium text-sh-foreground transition-colors hover:border-sh-forest/40 hover:text-sh-forest"
          >
            {copy.viewAllSeasons}
          </Link>
        </section>

        <TodayActionsSection seasonId={activeDisplay.seasonId} actions={todayActions} />
        <ParentSnapshotSection snapshot={parentSnapshot} />
        <MobileHomeBottomLandscape />
      </div>
    </>
  );
}
