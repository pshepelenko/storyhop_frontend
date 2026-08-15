import { Button, ProgressBar } from '@/components/ui';
import type { LibraryCopy } from '../library-copy';
import type { LibrarySeasonItem } from '../types';
import { seasonPrimaryHref, seasonProgressPercent } from '../utils';
import SeasonCoverImage from './SeasonCoverImage';
import SeasonStatusBadge from './SeasonStatusBadge';

type Props = {
  season: LibrarySeasonItem;
  copy: LibraryCopy;
};

export default function CurrentSeasonCard({ season, copy }: Props) {
  const seasonTitle = season.title || copy.titlePending;
  const current = season.currentEpisodeNumber || season.completedEpisodes || 1;
  const progress = seasonProgressPercent(season);
  const episodeLine = season.currentEpisodeTitle
    ? `${copy.episodeOfTotal(current)} • ${season.currentEpisodeTitle}`
    : copy.episodeOfTotal(current);

  return (
    <section className="mb-6 md:mb-8" aria-labelledby="library-continue-heading">
      <h2
        id="library-continue-heading"
        className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-sh-forest md:mb-4"
      >
        {copy.continueBlockTitle}
      </h2>

      <div className="overflow-hidden rounded-[28px] border border-sh-border bg-white shadow-[0_18px_48px_rgba(33,57,43,0.08)]">
        {/* Mobile: thumb left, text right, full-width CTA */}
        <div className="flex flex-col gap-4 p-4 md:hidden">
          <div className="flex gap-3">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[18px] bg-[#f5efe4]">
              <SeasonCoverImage season={season} alt={seasonTitle} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h3 className="font-story text-xl font-bold leading-tight text-sh-foreground">
                  {seasonTitle}
                </h3>
                <SeasonStatusBadge status={season.status} copy={copy} compact />
              </div>
              <p className="line-clamp-2 text-sm text-sh-foreground/75">{episodeLine}</p>
              <ProgressBar value={progress} className="mt-3" showValue={false} />
            </div>
          </div>
          <Button
            href={seasonPrimaryHref(season)}
            className="min-h-[48px] w-full rounded-full px-6 text-base"
          >
            {copy.continueStorybook}
          </Button>
        </div>

        {/* Desktop wide banner */}
        <div className="hidden min-h-[286px] md:grid md:grid-cols-[minmax(0,1fr)_42%]">
          <div className="flex min-w-0 flex-col justify-center px-9 py-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h3 className="font-story text-[clamp(2rem,3vw,2.8rem)] font-bold leading-[1.04] text-sh-foreground">
                {seasonTitle}
              </h3>
              <SeasonStatusBadge status={season.status} copy={copy} />
            </div>
            <p className="text-[15px] text-sh-foreground/80">{episodeLine}</p>
            <ProgressBar value={progress} className="mt-7 max-w-[360px]" showValue={false} />
            <div className="pt-5">
              <Button
                href={seasonPrimaryHref(season)}
                className="min-h-[50px] rounded-full px-6 text-base"
              >
                {copy.continueStorybook}
                <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[2]">
                  <path d="M4 5.5h8.5a2 2 0 0 1 2 2V14" />
                  <path d="M6.5 3.5 4 5.5l2.5 2" />
                  <path d="M10 16.5h6" />
                </svg>
              </Button>
            </div>
          </div>
          <div className="relative min-w-0 bg-sh-forest-soft/40">
            <SeasonCoverImage
              season={season}
              alt={seasonTitle}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white/80 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
