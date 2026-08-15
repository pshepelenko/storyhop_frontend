import Image from 'next/image';
import { imageAssets } from '@/data/image-assets';
import { ActiveSeasonDisplay } from '@/data/home-display';
import { useUiLanguage } from '@/lib/use-ui-language';
import Button from '../ui/Button';
import { getHomeWithSeasonsCopy } from './home-with-seasons-copy';

type ActiveSeasonCardProps = {
  seasonId: string;
  variant?: 'mobile' | 'desktop';
  display: ActiveSeasonDisplay;
  seasonIndex?: number;
  hideHeading?: boolean;
  fillHeight?: boolean;
};

export default function ActiveSeasonCard({
  seasonId,
  seasonIndex = 1,
  variant = 'mobile',
  display,
  hideHeading = false,
  fillHeight = false,
}: ActiveSeasonCardProps) {
  const isDesktop = variant === 'desktop';
  const copy = getHomeWithSeasonsCopy(useUiLanguage());
  const heightClass = isDesktop && fillHeight ? 'min-h-[220px] h-full flex-1' : isDesktop ? 'min-h-[220px]' : '';

  const card = (
    <div
      className={`relative flex overflow-hidden rounded-[var(--sh-radius-lg)] border border-sh-border bg-white ${
        isDesktop ? heightClass : 'min-h-[168px]'
      }`}
    >
      <div
        className={`relative z-10 flex flex-1 min-w-0 flex-col justify-between ${
          isDesktop ? 'px-5 pb-[30px] pr-4 pt-5' : 'p-4 pb-4 pr-2 pt-4'
        }`}
      >
        <div>
          <span className="inline-block w-fit rounded-full bg-sh-forest-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sh-forest">
            {copy.activeSeason}
          </span>
          <h3 className={`mt-2 font-bold leading-snug text-sh-foreground ${isDesktop ? 'text-lg' : 'text-base'}`}>
            {copy.seasonLabel(seasonIndex)}: {display.seasonTitle}
          </h3>
          <p className="mt-1 text-sm text-sh-muted">{copy.episodeLine(display.episodeNumber)}</p>
          <p className="mt-0.5 truncate text-sm font-medium text-sh-foreground">{display.chapterLine}</p>
        </div>
        <div className={`space-y-3 ${isDesktop ? 'mt-4' : 'mt-3'}`}>
          <Button
            href={`/seasons/${seasonId}`}
            className={`w-fit rounded-[var(--sh-radius)] px-4 py-2 ${isDesktop ? '' : 'text-sm'} min-h-[36px]`}
          >
            <span className="inline-flex items-center gap-1.5 text-sm">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/25 text-[8px]">▶</span>
              {copy.continueCta}
            </span>
          </Button>
        </div>
      </div>

      <div
        className={`relative shrink-0 self-stretch ${
          isDesktop ? 'w-[48%] min-w-[160px] max-w-[280px]' : 'w-[38%] min-w-[108px] max-w-[140px]'
        }`}
      >
        <Image
          src={display.coverImageUrl || imageAssets.home.hero}
          alt=""
          fill
          className="object-cover object-center"
          sizes={isDesktop ? '280px' : '140px'}
          priority
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent sm:w-20"
          aria-hidden
        />
      </div>
    </div>
  );

  if (hideHeading) return card;

  return (
    <section>
      <h2 className="mb-2.5 text-sm font-semibold text-sh-foreground">{copy.continueTitle}</h2>
      {card}
    </section>
  );
}
