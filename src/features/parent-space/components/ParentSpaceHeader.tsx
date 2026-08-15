import type { ParentSpaceCopy } from '../parent-space-copy';
import type { ParentSpaceRange } from '../types';

type Props = {
  copy: ParentSpaceCopy;
  seasonTitle: string | null;
  range: ParentSpaceRange;
  onRangeChange: (range: ParentSpaceRange) => void;
};

export default function ParentSpaceHeader({ copy, seasonTitle, range, onRangeChange }: Props) {
  return (
    <div className="mb-5 flex flex-col gap-4 lg:mb-7 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="font-story text-[28px] font-bold leading-tight text-sh-forest lg:text-[40px]">
          {copy.title}
        </h1>
        <p className="mt-1.5 text-sm text-sh-foreground/75 lg:text-[15px]">{copy.subtitle}</p>
        {seasonTitle && (
          <p className="mt-1 text-xs font-medium text-sh-muted">{copy.seasonSubtitle(seasonTitle)}</p>
        )}
      </div>
      <label className="relative inline-flex w-full shrink-0 items-center lg:w-auto">
        <span className="sr-only">{copy.rangeLabel}</span>
        <select
          value={range}
          onChange={(e) => onRangeChange(e.target.value as ParentSpaceRange)}
          aria-label={copy.rangeLabel}
          className="min-h-[44px] w-full cursor-pointer rounded-full border border-[#e8e2d8] bg-white px-4 pr-9 text-sm font-medium text-sh-foreground lg:w-[180px]"
          style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
        >
          <option value="week">{copy.ranges.week}</option>
          <option value="30days">{copy.ranges['30days']}</option>
        </select>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          width="14"
          height="14"
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
    </div>
  );
}
