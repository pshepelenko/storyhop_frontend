import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import ShareWithParentsBlock from '@/components/parent/ShareWithParentsBlock';
import ParentStatePanel from '@/components/parent/ParentStatePanel';
import { Button, Card, SectionHeader } from '@/components/ui';
import ProgressRing from '@/components/ui/ProgressRing';
import { imageAssets } from '@/data/image-assets';
import { getChannelUserId } from '@/lib/ui-language';

type LearningProgress = {
  activeSeasonTitle: string | null;
  overview: {
    englishAudioListenedMinutes: number;
    activeLearningDays: number;
    vocabularyLearned: number;
    speakingSuccessful: number;
  };
  listening: {
    weeklyMinutes: { label: string; minutes: number }[];
    completionRatePercent: number;
    consistencyDays: number;
    hasActivity: boolean;
  };
  speaking: {
    attemptedPhrases: number;
    successfulPhrases: number;
    accuracyPercent: number;
    trend: { label: string; percent: number }[];
    hasActivity: boolean;
    nextGoal: string | null;
  };
  vocabulary: {
    learned: number;
    inProgress: number;
    reviewSoon: number;
    words: { word: string; translationRu: string; status: string; exposureCount: number }[];
    hasActivity: boolean;
  };
  listeningTrackingFull: boolean;
};

function MiniBarChart({ data }: { data: { label: string; minutes: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.minutes));
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-sh-forest rounded-t-sm min-h-[4px]" style={{ height: `${(d.minutes / max) * 100}%` }} />
          <span className="text-[9px] text-sh-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function SpeakingTrend({ data }: { data: { label: string; percent: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.percent));
  const points = data.map((d, i) => `${(i / Math.max(1, data.length - 1)) * 100},${100 - (d.percent / max) * 80}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="w-full h-20" preserveAspectRatio="none">
      <polyline fill="none" stroke="var(--sh-forest)" strokeWidth="2" points={points} />
    </svg>
  );
}

export default function ParentSpace() {
  const [range, setRange] = useState('week');
  const [data, setData] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeasons, setHasSeasons] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const userId = getChannelUserId();
        const [homeRes, learnRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/home-summary`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/learning-progress?range=${range}`),
        ]);
        if (homeRes.ok) {
          const home = await homeRes.json();
          setHasSeasons(home.hasSeasons);
        }
        if (learnRes.ok) setData(await learnRes.json());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range]);

  const noActivity = data && !data.listening.hasActivity && !data.speaking.hasActivity && !data.vocabulary.hasActivity;

  return (
    <AppShell showBottomNav hasSeasons={hasSeasons} maxWidth="wide">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold font-story">Your Child&apos;s English Progress</h1>
          {data?.activeSeasonTitle && <p className="text-xs text-sh-muted mt-0.5">Season: {data.activeSeasonTitle}</p>}
        </div>
        <div className="flex gap-2">
          <select className="border border-sh-border rounded-sh text-sm px-2 py-1" value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="week">This week</option>
            <option value="30days">Last 30 days</option>
          </select>
          <Button variant="secondary" className="text-sm py-1 min-h-0 px-3" onClick={() => data && navigator.clipboard.writeText(JSON.stringify(data.overview, null, 2))}>
            Export
          </Button>
        </div>
      </div>

      {loading && <p className="text-sh-muted">Loading...</p>}

      {!loading && noActivity && (
        <ParentStatePanel
          variant="no-activity"
          title="No learning activity yet"
          message="Listening minutes appear after your child plays English audio. Speaking and vocabulary grow as they read chapters and practice phrases."
          primaryAction={{ label: 'Start first chapter', href: '/' }}
          secondaryAction={{ label: 'Go to settings', href: '/settings' }}
        />
      )}

      {!loading && data && !noActivity && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card padding="sm"><p className="text-2xl font-bold">{data.overview.englishAudioListenedMinutes}m</p><p className="text-xs text-sh-muted">English audio listened</p></Card>
            <Card padding="sm"><p className="text-2xl font-bold">{data.overview.activeLearningDays}</p><p className="text-xs text-sh-muted">Active days</p></Card>
            <Card padding="sm"><p className="text-2xl font-bold">{data.overview.vocabularyLearned}</p><p className="text-xs text-sh-muted">Words learned</p></Card>
            <Card padding="sm"><p className="text-2xl font-bold">{data.overview.speakingSuccessful}</p><p className="text-xs text-sh-muted">Speaking successful</p></Card>
          </div>

          {!data.listeningTrackingFull && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-sh px-3 py-2">
              Listening minutes will appear after your child plays chapter audio in the app.
            </p>
          )}

          <div className="grid lg:grid-cols-3 gap-4">
            <Card padding="md">
              <SectionHeader title="Listening" subtitle="Weekly minutes" />
              <MiniBarChart data={data.listening.weeklyMinutes} />
              <div className="flex items-center gap-4 mt-3">
                <ProgressRing value={data.listening.completionRatePercent} label="Completion" />
                <p className="text-xs text-sh-muted">Listened on {data.listening.consistencyDays} days</p>
              </div>
            </Card>

            <Card padding="md">
              <SectionHeader title="Speaking" />
              <SpeakingTrend data={data.speaking.trend} />
              <div className="grid grid-cols-3 gap-2 text-center text-sm mt-3">
                <div><p className="font-bold">{data.speaking.attemptedPhrases}</p><p className="text-xs text-sh-muted">Attempted</p></div>
                <div><p className="font-bold">{data.speaking.successfulPhrases}</p><p className="text-xs text-sh-muted">Successful</p></div>
                <div><p className="font-bold">{data.speaking.accuracyPercent}%</p><p className="text-xs text-sh-muted">Accuracy</p></div>
              </div>
              {data.speaking.nextGoal && <p className="text-xs text-sh-muted mt-2">Next: {data.speaking.nextGoal}</p>}
            </Card>

            <Card padding="md">
              <SectionHeader title="Vocabulary" />
              <div className="flex gap-3 text-xs mb-3">
                <span>{data.vocabulary.learned} learned</span>
                <span>{data.vocabulary.inProgress} in progress</span>
                <span>{data.vocabulary.reviewSoon} review soon</span>
              </div>
              <div className="max-h-40 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-sh-muted text-left">
                      <th className="pb-1">Word</th>
                      <th className="pb-1">Translation</th>
                      <th className="pb-1">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.vocabulary.words.map((w) => (
                      <tr key={w.word} className="border-t border-sh-border">
                        <td className="py-1">{w.word}</td>
                        <td className="py-1 text-sh-muted">{w.translationRu}</td>
                        <td className="py-1 text-sh-muted">{w.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <ShareWithParentsBlock />

          <div className="relative h-24 rounded-sh overflow-hidden hidden lg:block">
            <Image src={imageAssets.parent.shareWithParents} alt="" fill className="object-cover object-center opacity-90" sizes="800px" />
          </div>
        </div>
      )}
    </AppShell>
  );
}
