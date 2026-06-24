import Image from 'next/image';
import Link from 'next/link';
import { imageAssets } from '@/data/image-assets';
import { SidebarSeasonDisplay } from '@/data/home-display';

type SeasonSidebarCardProps = {
  season: SidebarSeasonDisplay;
};

const SEASON_IMAGES = [
  imageAssets.home.hero,
  imageAssets.home.activeSeason,
  imageAssets.home.features.storybook,
] as const;

function seasonImageFor(season: SidebarSeasonDisplay): string {
  if (season.locked) return imageAssets.states.lockedStory;
  const index = Math.max(0, season.seasonNumber - 1);
  return SEASON_IMAGES[index % SEASON_IMAGES.length] ?? imageAssets.home.hero;
}

export default function SeasonSidebarCard({ season }: SeasonSidebarCardProps) {
  const fadeFrom = season.locked ? '#fafafa' : '#ffffff';
  const imageSrc = seasonImageFor(season);

  const inner = (
    <div
      className={`relative rounded-[var(--sh-radius)] border overflow-hidden flex min-h-[76px] ${
        season.locked
          ? 'bg-[#fafafa] border-sh-border'
          : 'bg-white border-sh-forest shadow-[0_0_0_1px_rgba(5,150,105,0.12)]'
      }`}
    >
      <div className="relative z-10 flex-1 min-w-0 py-2.5 pl-3 pr-2 flex flex-col justify-center">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-xs font-medium ${season.locked ? 'text-sh-muted' : 'text-sh-foreground'}`}>
            Season {season.seasonNumber}
          </p>
          {season.locked && (
            <span className="text-[9px] font-bold uppercase tracking-wide text-sh-muted border border-sh-border bg-white px-1.5 py-0.5 rounded shrink-0">
              Locked
            </span>
          )}
        </div>
        <p
          className={`text-sm font-semibold leading-snug mt-0.5 truncate ${
            season.locked ? 'text-sh-muted' : 'text-sh-foreground'
          }`}
        >
          {season.title}
        </p>
      </div>

      <div className="relative w-[34%] max-w-[88px] shrink-0 self-stretch min-h-[76px]">
        <Image
          src={imageSrc}
          alt=""
          fill
          className={`object-cover object-center ${season.locked ? 'grayscale opacity-80' : ''}`}
          sizes="88px"
        />
        <div
          className="absolute inset-y-0 left-0 w-10 pointer-events-none"
          style={{ background: `linear-gradient(to right, ${fadeFrom}, transparent)` }}
          aria-hidden
        />
        {season.locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
            <svg className="w-4 h-4 text-white drop-shadow" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-3 0H10V7a2 2 0 1 1 4 0v2Z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  if (season.locked || !season.href) {
    return <div className="flex-1 min-h-0">{inner}</div>;
  }

  return (
    <Link href={season.href} className="block flex-1 min-h-0">
      {inner}
    </Link>
  );
}
