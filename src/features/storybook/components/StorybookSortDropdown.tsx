import type { StorybookCopy } from '../storybook-copy';
import type { StorybookSort } from '../types';

type Props = {
  value: StorybookSort;
  onChange: (sort: StorybookSort) => void;
  copy: StorybookCopy;
};

export default function StorybookSortDropdown({ value, onChange, copy }: Props) {
  return (
    <div className="relative inline-block min-w-[180px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as StorybookSort)}
        aria-label={copy.sortLabel}
        className="box-border w-full min-h-[40px] cursor-pointer rounded-full border border-sh-border bg-white px-4 pr-9 text-sm font-medium text-sh-foreground"
        style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
      >
        <option value="episode">{copy.sorts.episode}</option>
        <option value="episode_desc">{copy.sorts.episode_desc}</option>
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        width="14"
        height="14"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sh-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 7.5 10 12.5 15 7.5" />
      </svg>
    </div>
  );
}
