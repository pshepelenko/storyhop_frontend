import type { LibraryCopy } from '../library-copy';
import type { LibrarySeasonItem } from '../types';

type Props = {
  season: LibrarySeasonItem;
  copy: LibraryCopy;
  detailed?: boolean;
};

export default function SeasonLearningIndicators({ season, copy, detailed }: Props) {
  const words = season.wordsCount ?? 0;
  const speaking = season.speakingTasksCount ?? 0;
  if (words <= 0 && speaking <= 0) return null;

  return (
    <div className={`grid gap-2 text-sm text-sh-foreground/80 ${detailed ? 'grid-cols-2' : 'flex flex-wrap gap-4'}`}>
      {words > 0 && (
        <span className="inline-flex items-center gap-1.5">
          <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8] text-sh-foreground/70">
            <path d="M3.5 5.5a2 2 0 0 1 2-2h4.75a2 2 0 0 1 1.5.68l.25.29.25-.29a2 2 0 0 1 1.5-.68h1.75a2 2 0 0 1 2 2v9a.75.75 0 0 1-1.08.67l-1.54-.78a2 2 0 0 0-.9-.22H13.5a2 2 0 0 0-1.41.59l-.59.58-.59-.58A2 2 0 0 0 9.5 13.5H6.98a2 2 0 0 0-.9.22l-1.54.78A.75.75 0 0 1 3.5 13.83v-8.33Z" />
          </svg>
          {detailed ? copy.wordsLearned(words) : copy.words(words)}
        </span>
      )}
      {speaking > 0 && (
        <span className="inline-flex items-center gap-1.5">
          <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8] text-sh-foreground/70">
            <path d="M10 3.5a2.5 2.5 0 0 1 2.5 2.5v3a2.5 2.5 0 1 1-5 0V6A2.5 2.5 0 0 1 10 3.5Z" />
            <path d="M5.5 8.75a4.5 4.5 0 0 0 9 0M10 13.25v3.25M7.5 16.5h5" />
          </svg>
          {detailed ? copy.speakingMoments(speaking) : copy.speakingTasks(speaking)}
        </span>
      )}
    </div>
  );
}
