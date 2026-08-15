import type { LibraryCopy } from '../library-copy';
import type { LibrarySort } from '../types';

const SORTS: LibrarySort[] = ['recent', 'oldest', 'progress', 'az'];

type Props = {
  value: LibrarySort;
  onChange: (sort: LibrarySort) => void;
  copy: LibraryCopy;
};

export default function LibrarySortDropdown({ value, onChange, copy }: Props) {
  return (
    <label className="relative block w-full shrink-0">
      <span className="sr-only">{copy.sortLabel}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as LibrarySort)}
        aria-label={copy.sortLabel}
        className="box-border w-full min-h-[48px] cursor-pointer rounded-[18px] border border-sh-border bg-white px-4 pr-10 text-sm font-medium text-sh-foreground focus:outline-none focus:ring-2 focus:ring-sh-forest/30"
        style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
      >
        {SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {copy.sorts[sort]}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        width="16"
        height="16"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sh-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 7.5 10 12.5 15 7.5" />
      </svg>
    </label>
  );
}
