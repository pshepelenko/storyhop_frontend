import type { LibrarySeasonItem } from '../types';

type Props = {
  season: LibrarySeasonItem;
  className?: string;
  compact?: boolean;
};

export default function SeasonProgressBar({
  season,
  className = '',
  compact = false,
}: Props) {
  const current = season.currentEpisodeNumber || season.completedEpisodes || 0;

  return (
    <div className={className}>
      <p className={compact ? 'text-xs text-sh-muted' : 'text-sm font-medium text-sh-foreground/85'}>
        Episode {current || 1}
      </p>
    </div>
  );
}
