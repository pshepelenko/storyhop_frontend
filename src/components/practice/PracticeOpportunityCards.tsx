import { Button, Card } from '@/components/ui';
import type { BonusPracticeHomeSummary, BonusPracticeSeasonSummary } from '@/lib/bonus-practice';
import { useUiLanguage } from '@/lib/use-ui-language';
import { practiceCopy } from '@/lib/bonus-practice';

type HomePracticeCardsProps = {
  seasonId: string;
  summary: BonusPracticeHomeSummary;
};

export function HomePracticeCards({ seasonId, summary }: HomePracticeCardsProps) {
  const copy = practiceCopy(useUiLanguage());

  return (
    <div className="space-y-3">
      {summary.speakingRecap.available && (
        <Card className="border-[color:var(--sh-lavender)]/20 bg-[color:var(--sh-lavender)]/5">
          <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--sh-lavender)]">{copy.bonus}</div>
          <div className="mt-2 text-lg font-semibold text-sh-foreground">{copy.speakIntroTitle}</div>
          <p className="mt-1 text-sm text-sh-muted">
            {copy.phrasesWaiting(summary.speakingRecap.count, summary.speakingRecap.maxReward)}
          </p>
          <Button href={`/seasons/${seasonId}/practice/speaking`} className="mt-4 w-full">
            {copy.start}
          </Button>
        </Card>
      )}

      {summary.writing.available && (
        <Card className="border-sh-forest/20 bg-sh-forest-soft">
          <div className="text-xs font-semibold uppercase tracking-wide text-sh-forest">{copy.bonus}</div>
          <div className="mt-2 text-lg font-semibold text-sh-foreground">{copy.writingIntroTitle}</div>
          <p className="mt-1 text-sm text-sh-muted">
            {copy.wordsWaiting(summary.writing.wordCount, summary.writing.maxReward)}
          </p>
          <Button href={`/seasons/${seasonId}/practice/writing`} className="mt-4 w-full">
            {copy.start}
          </Button>
        </Card>
      )}
    </div>
  );
}

type StoryPracticeLaunchersProps = {
  summary: BonusPracticeSeasonSummary;
  onOpen: (type: 'speaking' | 'writing') => void;
};

export function StoryPracticeLaunchers({ summary, onOpen }: StoryPracticeLaunchersProps) {
  const copy = practiceCopy(useUiLanguage());
  if (!summary.storyLaunch.speakingAvailable) {
    return null;
  }

  return (
    <div className="mt-5 grid gap-3">
      {summary.storyLaunch.speakingAvailable && (
        <Card className="border-[color:var(--sh-lavender)]/20 bg-[color:var(--sh-lavender)]/5">
          <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--sh-lavender)]">{copy.bonus}</div>
          <div className="mt-2 text-base font-semibold text-sh-foreground">{copy.speakIntroTitle}</div>
          <p className="mt-1 text-sm text-sh-muted">
            {summary.storyLaunch.speakingType === 'speaking_recap' ? copy.speakIntroBodyRecap : copy.speakIntroBodySingle}
          </p>
          <Button className="mt-4 w-full sm:w-auto" onClick={() => onOpen('speaking')}>
            {copy.start}
          </Button>
        </Card>
      )}

    </div>
  );
}
