import { Button } from '@/components/ui';

type EpisodeReaderHeaderProps = {
  episodeNumber: number;
  title: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  storybookHref?: string | null;
  backHref?: string;
};

export default function EpisodeReaderHeader({
  episodeNumber,
  title,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  storybookHref,
  backHref = '/library',
}: EpisodeReaderHeaderProps) {
  // Full page navigation: the season reader can hold a huge payload and keep
  // polling, which stalls Next.js client transitions (spinner never finishes).
  const leaveSeason = (href: string) => {
    if (typeof window !== 'undefined') {
      window.location.assign(href);
    }
  };

  return (
    <header className="mb-6">
      {/* Mobile: back + centered meta */}
      <div className="relative flex items-center lg:hidden mb-4">
        <button
          type="button"
          onClick={() => leaveSeason(backHref)}
          className="absolute left-0 flex items-center justify-center w-10 h-10 text-sh-foreground"
          aria-label="Back"
        >
          <span className="text-xl leading-none">←</span>
        </button>
        <div className="flex-1 text-center px-10">
          <p className="text-xs font-semibold text-sh-forest uppercase tracking-wide">
            Episode {episodeNumber}
          </p>
          <h1 className="font-story text-xl font-bold text-sh-foreground leading-tight mt-0.5">{title}</h1>
        </div>
      </div>

      {/* Desktop: back link + storybook */}
      <div className="hidden lg:flex items-center justify-between gap-4 mb-4">
        <button
          type="button"
          onClick={() => leaveSeason(backHref)}
          className="text-sm font-semibold text-sh-forest hover:underline"
        >
          ← Back to season
        </button>
        {storybookHref && (
          <Button href={storybookHref} variant="ghost" className="!min-h-[36px] h-9 py-0 px-3 text-xs">
            Storybook
          </Button>
        )}
      </div>

      {/* Desktop: centered title */}
      <div className="hidden lg:block text-center mb-5">
        <p className="text-sm font-semibold text-sh-forest">
          Episode {episodeNumber}
        </p>
        <h1 className="font-story text-3xl font-bold text-sh-foreground mt-1">{title}</h1>
      </div>

      {/* Desktop: episode paging */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          className="text-sm font-semibold text-sh-forest disabled:opacity-30 disabled:cursor-not-allowed hover:underline"
        >
          ← Episode {episodeNumber - 1}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="text-sm font-semibold text-sh-forest disabled:opacity-30 disabled:cursor-not-allowed hover:underline"
        >
          Episode {episodeNumber + 1} →
        </button>
      </div>
    </header>
  );
}
