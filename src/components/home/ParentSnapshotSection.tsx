import type { ParentSnapshotDisplay } from '@/data/home-display';
import { useUiLanguage } from '@/lib/use-ui-language';
import Button from '../ui/Button';
import ParentSnapshotMetric from './ParentSnapshotMetric';
import { getHomeWithSeasonsCopy } from './home-with-seasons-copy';

type ParentSnapshotSectionProps = {
  snapshot: ParentSnapshotDisplay;
};

export default function ParentSnapshotSection({ snapshot }: ParentSnapshotSectionProps) {
  const copy = getHomeWithSeasonsCopy(useUiLanguage());
  const isEmpty =
    snapshot.weeklyListeningMinutes === 0 &&
    snapshot.completedEpisodesThisWeek === 0 &&
    snapshot.newWordsCount === 0 &&
    snapshot.speakingPracticeCount === 0;

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-sh-foreground sm:text-2xl">{copy.parentTitle}</h2>

      <div className="rounded-[var(--sh-radius-lg)] border border-sh-border bg-white p-4 shadow-[var(--sh-shadow-card)] sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ParentSnapshotMetric
              label={copy.weeklyTime}
              value={copy.minutesLabel(snapshot.weeklyListeningMinutes)}
              tint="purple"
            />
            <ParentSnapshotMetric
              label={copy.episodes}
              value={copy.episodesLabel(snapshot.completedEpisodesThisWeek)}
              tint="emerald"
            />
            <ParentSnapshotMetric
              label={copy.newWords}
              value={copy.wordsLabel(snapshot.newWordsCount)}
              tint="blue"
            />
            <ParentSnapshotMetric
              label={copy.speaking}
              value={copy.practicesLabel(snapshot.speakingPracticeCount)}
              tint="amber"
            />
          </div>

          <div className="rounded-[var(--sh-radius)] border border-sh-border bg-[#fbfcff] px-4 py-4 sm:px-5 lg:flex lg:flex-col lg:justify-center">
            <p className="text-lg font-semibold text-sh-foreground">{copy.parentCtaTitle}</p>
            <p className="mt-2 text-sm leading-6 text-sh-muted">
              {isEmpty ? copy.parentEmpty : copy.parentCtaBody}
            </p>
            <Button href="/parent-space" className="mt-4 w-full lg:w-auto">
              {copy.parentCta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
