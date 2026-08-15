import Image from 'next/image';
import Link from 'next/link';
import { imageAssets } from '@/data/image-assets';
import { SidebarSeasonDisplay } from '@/data/home-display';
import { useUiLanguage } from '@/lib/use-ui-language';
import { getHomeWithSeasonsCopy } from './home-with-seasons-copy';

type SeasonSidebarCardProps = {
  season: SidebarSeasonDisplay;
};

const SEASON_IMAGES = [imageAssets.home.hero, imageAssets.home.activeSeason, imageAssets.home.features.storybook] as const;

function seasonImageFor(season: SidebarSeasonDisplay): string {
  if (season.coverImageUrl) {
    return season.coverImageUrl;
  }
  const index = Math.max(0, season.seasonNumber - 1);
  return SEASON_IMAGES[index % SEASON_IMAGES.length] ?? imageAssets.home.hero;
}

export default function SeasonSidebarCard({ season }: SeasonSidebarCardProps) {
  const copy = getHomeWithSeasonsCopy(useUiLanguage());
  const fadeFrom = '#ffffff';
  const imageSrc = seasonImageFor(season);

  const inner = (
    <div
      className={`relative flex min-h-[71px] overflow-hidden rounded-[var(--sh-radius)] border ${
        season.isActive
          ? 'border-sh-forest bg-white shadow-[0_0_0_1px_rgba(5,150,105,0.12)]'
          : 'border-sh-border bg-white transition-colors hover:border-sh-forest/40'
      }`}
    >
      <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center py-2.5 pl-3 pr-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-sh-foreground">{copy.seasonLabel(season.seasonNumber)}</p>
          {season.isActive && (
            <span className="shrink-0 rounded border border-sh-forest/30 bg-sh-forest-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-sh-forest">
              {copy.activeBadge}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm font-semibold leading-snug text-sh-foreground">{season.title}</p>
        <p className="mt-0.5 truncate text-[11px] text-sh-muted">
          {copy.episodeLine(season.episodeNumber)}
        </p>
      </div>

      <div className="relative min-h-[71px] w-[34%] max-w-[88px] shrink-0 self-stretch">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover object-center"
          sizes="88px"
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-10"
          style={{ background: `linear-gradient(to right, ${fadeFrom}, transparent)` }}
          aria-hidden
        />
      </div>
    </div>
  );

  return (
    <Link href={season.href} className="block min-h-0 flex-1">
      {inner}
    </Link>
  );
}
