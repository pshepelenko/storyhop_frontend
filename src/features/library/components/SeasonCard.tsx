import Link from 'next/link';
import { Button, Card, ProgressBar } from '@/components/ui';
import type { LibraryCopy } from '../library-copy';
import type { LibrarySeasonItem } from '../types';
import {
  seasonProgressPercent,
  seasonProgressHref,
  seasonStorybookHref,
} from '../utils';
import SeasonCardActions from './SeasonCardActions';
import SeasonCoverImage from './SeasonCoverImage';
import SeasonLearningIndicators from './SeasonLearningIndicators';
import SeasonStatusBadge from './SeasonStatusBadge';

type Props = {
  season: LibrarySeasonItem;
  copy: LibraryCopy;
  seasonNumber?: number;
  onArchive: (seasonId: string) => void;
  onUnarchive: (seasonId: string) => void;
  archiving?: boolean;
};

function ChevronIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[2.2]">
      <path d="M7 4.5 12.5 10 7 15.5" />
    </svg>
  );
}

export default function SeasonCard({
  season,
  copy,
  seasonNumber,
  onArchive,
  onUnarchive,
  archiving,
}: Props) {
  const storybookHref = seasonStorybookHref(season);
  const progressHref = seasonProgressHref(season);
  const current = season.currentEpisodeNumber || season.completedEpisodes || 0;
  const seasonTitle = season.title || copy.titlePending;
  const progress = seasonProgressPercent(season);

  return (
    <Card
      padding="none"
      className="overflow-hidden rounded-[22px] border-[#ece6dc] bg-white shadow-[0_10px_32px_rgba(42,64,50,0.06)] focus-within:ring-2 focus-within:ring-sh-forest/30"
    >
      {/* Mobile list row */}
      <Link
        href={storybookHref}
        className="flex items-center gap-3 p-3.5 md:hidden"
      >
        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[16px] bg-[#f5efe4]">
          <SeasonCoverImage season={season} alt={seasonTitle} className="h-full w-full object-cover" />
          <div className="absolute left-1.5 top-1.5">
            <SeasonStatusBadge status={season.status} copy={copy} compact />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 font-story text-lg font-bold leading-tight text-sh-foreground">
            {seasonTitle}
          </h3>
          <p className="mt-0.5 text-xs text-sh-foreground/70">
            {copy.episodeOfTotal(current || 1)}
          </p>
        </div>
        <span className="shrink-0 text-sh-muted" aria-hidden>
          <ChevronIcon />
        </span>
      </Link>

      {/* Desktop season row */}
      <div className="hidden items-center gap-5 p-4 md:flex">
        <Link href={storybookHref} className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[18px] bg-sh-forest-soft">
          <SeasonCoverImage season={season} alt={seasonTitle} className="h-full w-full object-cover" />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-sh-forest/80">
              {seasonNumber != null ? copy.seasonLabel(seasonNumber) : null}
            </p>
            <SeasonStatusBadge status={season.status} copy={copy} compact />
          </div>
          <Link href={storybookHref}>
            <h3 className="line-clamp-1 font-story text-[25px] font-bold leading-tight text-sh-foreground">
              {seasonTitle}
            </h3>
          </Link>
          {season.worldLabel ? <p className="mt-1 text-sm text-sh-muted">{season.worldLabel}</p> : null}
          <ProgressBar value={progress} className="mt-3 max-w-[390px]" showValue={false} />
          <div className="mt-2">
            <SeasonLearningIndicators season={season} copy={copy} />
          </div>
        </div>

        <div className="flex w-[184px] shrink-0 flex-col gap-2">
            <Button
              href={storybookHref}
              variant="secondary"
              className="min-h-[42px] w-full rounded-[14px] px-3 text-sm"
            >
              {copy.storybook}
              <ChevronIcon />
            </Button>
            <Button
              href={progressHref}
              variant="secondary"
              className="min-h-[42px] w-full rounded-[14px] px-3 text-sm"
            >
              {copy.parentReport}
              <ChevronIcon />
            </Button>
        </div>
        <SeasonCardActions
          season={season}
          copy={copy}
          compact
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          archiving={archiving}
        />
      </div>
    </Card>
  );
}
