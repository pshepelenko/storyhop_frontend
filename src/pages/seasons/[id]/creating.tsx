import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import ParentStatePanel from '@/components/parent/ParentStatePanel';
import { Button } from '@/components/ui';

type SeasonData = {
  status: string;
  childProfile?: { childName?: string };
  hero?: { heroReferenceImageUrl?: string | null } | null;
  currentEpisode?: { title?: string; audioChunks?: { status: string }[] } | null;
  generationJobs?: { jobType: string; status: string }[];
};

export default function SeasonCreatingPage() {
  const router = useRouter();
  const seasonId = router.query.id as string;
  const [season, setSeason] = useState<SeasonData | null>(null);
  const [error, setError] = useState('');
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    if (!seasonId) return;

    const bootstrap = async () => {
      if (!bootstrapped) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}/bootstrap`, {
            method: 'POST',
          });
        } catch {
          // polling will surface errors
        }
        setBootstrapped(true);
      }
    };

    const poll = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}`);
        if (!res.ok) throw new Error('Failed to load season');
        const data = await res.json();
        setSeason(data);

        if (data.status === 'episode_ready' && data.currentEpisode) {
          return;
        }

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}/jobs/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 5 }),
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load season');
      }
    };

    bootstrap().then(poll);
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [seasonId, bootstrapped]);

  const childName = season?.childProfile?.childName || 'your child';
  const frameworkDone = Boolean(season);
  const heroDone = season?.status === 'hero_ready' || season?.status === 'episode_ready';
  const episodeDone = season?.status === 'episode_ready';
  const heroImageDone = Boolean(season?.hero?.heroReferenceImageUrl);

  const steps = [
    { label: 'Building season arc', status: frameworkDone ? 'done' as const : 'active' as const },
    { label: 'Creating hero', status: heroDone ? 'done' as const : frameworkDone ? 'active' as const : 'pending' as const },
    { label: 'Preparing first episode', status: episodeDone ? 'done' as const : heroDone ? 'active' as const : 'pending' as const },
    { label: 'Drawing hero reference', status: heroImageDone ? 'done' as const : heroDone ? 'active' as const : 'pending' as const },
  ];

  if (error) {
    return (
      <AppShell>
        <ParentStatePanel
          variant="error"
          title="Something went wrong"
          message="We could not finish creating the season. Check your connection and try again."
          primaryAction={{ label: 'Try again', onClick: () => router.reload() }}
          secondaryAction={{ label: 'Go home', href: '/' }}
        />
      </AppShell>
    );
  }

  if (season?.status === 'episode_ready' && season.currentEpisode) {
    const audioReady = season.currentEpisode.audioChunks?.some(
      (c) => c.status === 'ready' || c.status === 'ready_dry_run',
    );
    return (
      <AppShell>
        <ParentStatePanel
          variant="first-ready"
          title={`${childName}'s adventure is all set!`}
          message={`Episode 1: ${season.currentEpisode.title || 'The adventure begins'}`}
          primaryAction={{ label: 'Continue to story', href: `/seasons/${seasonId}` }}
          secondaryAction={{ label: 'Parent dashboard', href: '/parent-space' }}
        >
          <p className="text-sm text-sh-muted">{audioReady ? '🎧 Audio ready' : '⏳ Audio preparing'}</p>
          <Button href={`/seasons/${seasonId}/storybook`} variant="ghost" fullWidth className="mt-2">
            My storybook
          </Button>
        </ParentStatePanel>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ParentStatePanel
        variant="generating"
        title={`Creating ${childName}'s season...`}
        message="This may take a few minutes. You can leave this page — we'll keep working."
        steps={steps}
      />
    </AppShell>
  );
}
