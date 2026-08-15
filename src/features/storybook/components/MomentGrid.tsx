import type { StorybookCopy } from '../storybook-copy';
import type { StorybookMoment } from '../types';
import MomentCard from './MomentCard';

type Props = {
  moments: StorybookMoment[];
  seasonId: string;
  copy: StorybookCopy;
  emptyText: string;
};

export default function MomentGrid({ moments, seasonId, copy, emptyText }: Props) {
  if (moments.length === 0) {
    return (
      <p className="rounded-[20px] border border-dashed border-sh-border bg-white/70 px-4 py-10 text-center text-sm text-sh-muted">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5" role="list">
      {moments.map((moment) => (
        <li key={moment.storybookEntryId}>
          <MomentCard moment={moment} seasonId={seasonId} copy={copy} />
        </li>
      ))}
    </ul>
  );
}
