import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '@/components/layout/AppShell';
import SpeakingPracticeFlow from '@/components/practice/SpeakingPracticeFlow';
import type { PracticeLaunchMode } from '@/lib/bonus-practice';
import { apiFetchAsGuest } from '@/lib/api-client';

type HomeSummary = {
  hasSeasons: boolean;
  crystalBalance: number;
};

export default function SpeakingPracticePage() {
  const router = useRouter();
  const seasonId = String(router.query.id || '');
  const launchMode: PracticeLaunchMode = router.query.entry === 'home-direct' ? 'direct' : 'intro';
  const [summary, setSummary] = useState<HomeSummary | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetchAsGuest('/users/me/home-summary');
        if (res.ok) {
          setSummary(await res.json());
        }
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);

  if (!seasonId) {
    return null;
  }

  return (
    <AppShell
      showBottomNav
      hasSeasons={summary?.hasSeasons ?? true}
      hideHeader
      plainBackground
      shellVariant={summary?.hasSeasons ? 'framed' : 'default'}
      maxWidth="full"
      crystalBalance={summary?.crystalBalance}
    >
      <div className="py-3 sm:py-6">
        <SpeakingPracticeFlow
          seasonId={seasonId}
          origin="home"
          launchMode={launchMode}
          crystalBalance={summary?.crystalBalance}
          onClose={() => router.push('/')}
        />
      </div>
    </AppShell>
  );
}
