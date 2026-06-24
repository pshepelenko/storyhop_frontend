import Image from 'next/image';
import { imageAssets } from '@/data/image-assets';
import { ActiveSeasonDisplay } from '@/data/home-display';
import Button from '../ui/Button';
import ReadinessPills from './ReadinessPills';

type ActiveSeasonCardProps = {
  seasonId: string;
  variant?: 'mobile' | 'desktop';
  display?: ActiveSeasonDisplay;
  theme?: string;
  seasonIndex?: number;
  currentEpisodeNumber?: number;
  currentEpisodeTitle?: string;
  totalEpisodes?: number;
  progressPercent?: number;
  readiness?: {
    nextEpisodePreparing: boolean;
    audioReady: boolean;
    illustrationReady?: boolean;
    allReady: boolean;
  };
  hideHeading?: boolean;
};

export default function ActiveSeasonCard({
  seasonId,
  theme,
  seasonIndex = 1,
  currentEpisodeNumber,
  currentEpisodeTitle,
  totalEpisodes,
  progressPercent,
  readiness,
  variant = 'mobile',
  display,
  hideHeading = false,
}: ActiveSeasonCardProps) {
  if (variant === 'desktop' && display) {
    const card = (
      <div className="relative bg-white rounded-[var(--sh-radius-lg)] border border-sh-border overflow-hidden min-h-[260px]">
        <div className="relative z-10 flex min-h-[260px]">
          <div className="flex-1 min-w-0 p-5 pr-4 flex flex-col justify-between">
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-sh-forest bg-sh-forest-soft px-2 py-0.5 rounded-full w-fit">
                Active season
              </span>
              <h3 className="text-lg font-bold mt-2 text-sh-foreground leading-snug">
                Season {seasonIndex}: {display.seasonTitle}
              </h3>
              <p className="text-sm text-sh-muted mt-1">{display.episodeLine}</p>
              <p className="text-sm text-sh-foreground mt-0.5 font-medium truncate">{display.chapterLine}</p>
            </div>
            <div className="mt-4 space-y-3">
              <div className="max-w-[220px]">
                <p className="text-[11px] text-sh-muted mb-1">{display.progressPercent}% complete</p>
                <div className="h-1.5 rounded-full bg-[#d1d5db] overflow-hidden">
                  <div
                    className="h-full bg-sh-forest rounded-full transition-all"
                    style={{ width: `${display.progressPercent}%` }}
                  />
                </div>
              </div>
              <Button href={`/seasons/${seasonId}`} className="rounded-[var(--sh-radius)] px-4 min-h-[36px] py-2 w-fit">
                <span className="inline-flex items-center gap-1.5 text-sm">
                  <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[8px]">▶</span>
                  Continue
                </span>
              </Button>
            </div>
          </div>
          <div className="relative w-[48%] min-w-[160px] max-w-[280px] shrink-0 self-stretch">
            <Image
              src={imageAssets.home.hero}
              alt=""
              fill
              className="object-cover object-center"
              sizes="280px"
              priority
            />
            <div
              className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent pointer-events-none"
              aria-hidden
            />
          </div>
        </div>
      </div>
    );

    if (hideHeading) return card;

    return (
      <section>
        <h2 className="text-sm font-semibold text-sh-foreground mb-2.5">Continue where you left off</h2>
        {card}
      </section>
    );
  }

  const episodeLine = currentEpisodeTitle
    ? `Episode ${currentEpisodeNumber} of ${totalEpisodes}: ${currentEpisodeTitle}`
    : `Episode ${currentEpisodeNumber} of ${totalEpisodes}`;

  if (!theme || currentEpisodeNumber == null || totalEpisodes == null || progressPercent == null || !readiness) {
    return null;
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-sh-foreground mb-3">Continue where you left off</h2>
      <div className="bg-white rounded-2xl border border-sh-border shadow-[var(--sh-shadow-card)] overflow-hidden flex">
        <div className="flex-1 p-4 sm:p-5 min-w-0 flex flex-col justify-center">
          <span className="self-start text-[10px] font-bold uppercase tracking-wider text-sh-forest bg-sh-forest-soft px-2.5 py-1 rounded-full">
            Active season
          </span>
          <h3 className="text-lg sm:text-xl font-bold mt-2.5 leading-snug text-sh-foreground">
            Season {seasonIndex}: {theme}
          </h3>
          <p className="text-sm text-sh-muted mt-1.5 leading-snug line-clamp-2">{episodeLine}</p>
          <div className="mt-4">
            <p className="text-xs text-sh-muted mb-1.5">{progressPercent}% complete</p>
            <div className="h-1.5 rounded-full bg-sh-border-subtle overflow-hidden">
              <div className="h-full bg-sh-forest rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <Button href={`/seasons/${seasonId}`} className="mt-4 rounded-xl sm:max-w-[200px]">
            <span className="inline-flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">▶</span>
              Continue
            </span>
          </Button>
          <ReadinessPills
            episodeNumber={currentEpisodeNumber}
            totalEpisodes={totalEpisodes}
            readiness={readiness}
          />
        </div>
        <div className="relative w-[34%] sm:w-[38%] min-w-[110px] shrink-0">
          <Image
            src={imageAssets.home.activeSeason}
            alt=""
            fill
            className="object-cover"
            sizes="200px"
            priority
          />
        </div>
      </div>
    </section>
  );
}
