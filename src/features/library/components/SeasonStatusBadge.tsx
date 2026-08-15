import type { SeasonStatus } from '../types';
import type { LibraryCopy } from '../library-copy';

type Props = {
  status: SeasonStatus;
  copy: LibraryCopy;
  compact?: boolean;
};

const styles: Record<SeasonStatus, string> = {
  active: 'border-[#d9ebc9] bg-[#eef7e7] text-sh-forest',
  completed: 'border-[#cfd8e6] bg-[#e8eef8] text-[#3a4d6b]',
  archived: 'border-[#e6ded1] bg-[#f4f1eb] text-sh-muted',
};

export default function SeasonStatusBadge({ status, copy, compact }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${styles[status]} ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
      }`}
    >
      {copy.status[status]}
    </span>
  );
}
