import type { LibraryCopy } from '../library-copy';
import type { LibrarySeasonItem } from '../types';
import { buildSeasonNumberMap } from '../utils';
import SeasonCard from './SeasonCard';

type Props = {
  seasons: LibrarySeasonItem[];
  allSeasons?: LibrarySeasonItem[];
  copy: LibraryCopy;
  onArchive: (seasonId: string) => void;
  onUnarchive: (seasonId: string) => void;
  archivingId?: string | null;
};

export default function SeasonList({
  seasons,
  allSeasons,
  copy,
  onArchive,
  onUnarchive,
  archivingId,
}: Props) {
  if (seasons.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-sh-muted">
        {copy.noResults}
      </p>
    );
  }

  const numberMap = buildSeasonNumberMap(allSeasons || seasons);

  return (
    <ul
      className="grid grid-cols-1 gap-3 md:gap-4"
      role="list"
    >
      {seasons.map((season) => (
        <li key={season.id}>
          <SeasonCard
            season={season}
            seasonNumber={numberMap.get(season.id)}
            copy={copy}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
            archiving={archivingId === season.id}
          />
        </li>
      ))}
    </ul>
  );
}
