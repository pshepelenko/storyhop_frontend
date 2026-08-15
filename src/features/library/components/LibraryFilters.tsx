import { Chip } from '@/components/ui';
import type { LibraryCopy } from '../library-copy';
import type { LibraryFilter } from '../types';

const FILTERS: LibraryFilter[] = ['all', 'active', 'completed', 'archived'];

type Props = {
  value: LibraryFilter;
  onChange: (filter: LibraryFilter) => void;
  copy: LibraryCopy;
};

export default function LibraryFilters({ value, onChange, copy }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none" role="tablist" aria-label="Season filters">
      {FILTERS.map((filter) => (
        <Chip
          key={filter}
          label={copy.filters[filter]}
          selected={value === filter}
          onClick={() => onChange(filter)}
        />
      ))}
    </div>
  );
}
