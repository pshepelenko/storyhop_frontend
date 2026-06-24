import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { Button, Card, ProgressBar, SectionHeader } from '@/components/ui';
import { imageAssets } from '@/data/image-assets';
import { getChannelUserId } from '@/lib/ui-language';

type SeasonItem = {
  seasonId: string;
  childName: string;
  theme: string;
  status: string;
  progressPercent: number;
};

type StoryTab = 'all' | 'favorites';

export default function LibraryPage() {
  const [seasons, setSeasons] = useState<SeasonItem[]>([]);
  const [crystalBalance, setCrystalBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<StoryTab>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const userId = getChannelUserId();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/home-summary`);
        if (res.ok) {
          const data = await res.json();
          setSeasons(data.seasons || []);
          setCrystalBalance(data.crystalBalance ?? null);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeSeason = seasons[0];

  return (
    <AppShell showBottomNav hasSeasons={seasons.length > 0} maxWidth="wide" crystalBalance={crystalBalance}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <SectionHeader title="Your Adventures" subtitle="Seasons and story moments" />
        <Link href="/referral" className="text-xs font-semibold text-sh-forest shrink-0">Invite</Link>
      </div>

      {loading && <p className="text-sh-muted">Loading...</p>}

      {!loading && seasons.length === 0 && (
        <Card padding="lg" className="text-center">
          <div className="relative h-40 max-w-xs mx-auto rounded-sh overflow-hidden mb-4">
            <Image src={imageAssets.home.emptySeasons} alt="" fill className="object-cover" sizes="320px" />
          </div>
          <p className="text-sh-muted">No seasons yet.</p>
          <Button href="/seasons/new" className="mt-4">Create first season</Button>
        </Card>
      )}

      <div className="space-y-3 mb-8">
        {seasons.map((s) => (
          <Card key={s.seasonId} padding="none" className="overflow-hidden">
            <div className="relative h-32">
              <Image
                src={s.status === 'locked' ? imageAssets.states.lockedStory : imageAssets.home.activeSeason}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
              />
              {s.status === 'locked' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-semibold">Locked</div>
              )}
            </div>
            <div className="p-4">
              <p className="font-semibold font-story">{s.theme}</p>
              <p className="text-xs text-sh-muted">{s.childName} · {Math.round(s.progressPercent / 12.5)}/8 episodes</p>
              <ProgressBar value={s.progressPercent} className="mt-2" />
              <div className="flex gap-2 mt-3">
                {s.status === 'locked' ? (
                  <Button variant="secondary" className="flex-1 text-sm py-2 min-h-0" onClick={() => undefined}>
                    Locked
                  </Button>
                ) : (
                  <Button href={`/seasons/${s.seasonId}`} className="flex-1 text-sm py-2 min-h-0">
                    Continue
                  </Button>
                )}
                <Button href={`/seasons/${s.seasonId}/storybook`} variant="secondary" className="flex-1 text-sm py-2 min-h-0">
                  Storybook
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {activeSeason && (
        <>
          <SectionHeader title="My Storybook" subtitle="Your generated story moments" />
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setTab('all')}
              className={`text-sm px-3 py-1.5 rounded-sh border ${tab === 'all' ? 'bg-sh-forest text-white border-sh-forest' : 'border-sh-border'}`}
            >
              All Episodes
            </button>
            <button
              type="button"
              onClick={() => setTab('favorites')}
              className={`text-sm px-3 py-1.5 rounded-sh border ${tab === 'favorites' ? 'bg-sh-forest text-white border-sh-forest' : 'border-sh-border'}`}
            >
              Favorites
            </button>
          </div>
          <p className="text-sm text-sh-muted mb-3">
            {tab === 'favorites' ? 'Favorites are saved on this device.' : 'Open a season storybook to unlock illustrations.'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <Link key={n} href={`/seasons/${activeSeason.seasonId}/storybook`}>
                <Card padding="none" className="overflow-hidden">
                  <div className="relative aspect-square bg-sh-forest-soft">
                    <Image src={imageAssets.home.features.storybook} alt="" fill className="object-cover opacity-80" sizes="50vw" />
                  </div>
                  <p className="text-xs font-medium p-2">Ep. {n}</p>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}

      <Link href="/seasons/new" className="block text-center text-sm text-sh-forest mt-6">+ Start a new season</Link>
    </AppShell>
  );
}
