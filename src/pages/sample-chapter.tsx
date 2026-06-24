import AppShell from '@/components/layout/AppShell';
import { Button, Card, TrustBadge } from '@/components/ui';
import { SAMPLE_CHAPTER } from '@/data/sample-chapter';

export default function SampleChapterPage() {
  return (
    <AppShell maxWidth="default">
      <Card padding="lg">
        <p className="text-xs text-sh-muted uppercase tracking-wide">Sample chapter</p>
        <h1 className="text-xl font-bold mt-1">{SAMPLE_CHAPTER.title}</h1>
        <p className="text-sm text-sh-muted mt-2">{SAMPLE_CHAPTER.teaser}</p>
        <div className="mt-4 p-4 rounded-sh bg-amber-50 text-sm leading-relaxed whitespace-pre-line">
          {SAMPLE_CHAPTER.chapterText}
        </div>
        <p className="text-sm mt-4 italic text-sh-muted">
          Speaking practice: &quot;{SAMPLE_CHAPTER.speakingPrompt}&quot;
        </p>
        <TrustBadge>
          {SAMPLE_CHAPTER.audioNote}
        </TrustBadge>
        <div className="flex gap-3 mt-6">
          <Button href="/seasons/new" fullWidth>Create your season</Button>
          <Button href="/" variant="secondary" fullWidth>Back home</Button>
        </div>
      </Card>
    </AppShell>
  );
}
