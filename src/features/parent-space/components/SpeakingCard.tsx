import ProgressRing from '@/components/ui/ProgressRing';
import { imageAssets } from '@/data/image-assets';
import type { ParentSpaceCopy } from '../parent-space-copy';
import type { ParentSpaceView } from '../types';

type Props = {
  data: ParentSpaceView['speaking'];
  copy: ParentSpaceCopy;
};

function SpeakingTrend({ data }: { data: { label: string; percent: number }[] }) {
  if (data.length === 0) return null;
  const max = Math.max(1, ...data.map((d) => d.percent));
  const points = data
    .map((d, i) => `${(i / Math.max(1, data.length - 1)) * 100},${100 - (d.percent / max) * 78}`)
    .join(' ');
  return (
    <div className="mt-4">
      <svg viewBox="0 0 100 100" className="h-24 w-full" preserveAspectRatio="none">
        <polyline fill="none" stroke="#3b82b4" strokeWidth="2.4" points={points} />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-sh-muted">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export default function SpeakingCard({ data, copy }: Props) {
  if (!data.hasActivity) {
    return (
      <article className="flex h-full flex-col rounded-[24px] border border-[#e9e3d8] bg-white p-5 shadow-[0_12px_30px_rgba(33,57,43,0.05)]">
        <h2 className="font-story text-2xl font-bold text-[#2f6fb0]">{copy.speakingTitle}</h2>
        <p className="mt-1 text-sm text-sh-muted">{copy.speakingSubtitle}</p>
        <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageAssets.parent.skillEmpty} alt="" className="mb-3 h-24 w-24 rounded-2xl object-cover" />
          <p className="text-sm text-sh-muted">{copy.speakingEmpty}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col rounded-[24px] border border-[#e9e3d8] bg-white p-5 shadow-[0_12px_30px_rgba(33,57,43,0.05)]">
      <h2 className="font-story text-2xl font-bold text-[#2f6fb0]">{copy.speakingTitle}</h2>
      <p className="mt-1 text-sm text-sh-muted">{copy.speakingSubtitle}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[16px] bg-[#eef5fc] px-3 py-3">
          <p className="text-2xl font-bold text-sh-foreground">{data.attemptedPhrases}</p>
          <p className="text-xs text-sh-muted">{copy.attempted}</p>
        </div>
        <div className="rounded-[16px] bg-[#eef5fc] px-3 py-3">
          <p className="text-2xl font-bold text-sh-foreground">{data.successfulPhrases}</p>
          <p className="text-xs text-sh-muted">{copy.successful}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <ProgressRing value={data.accuracyPercent} size={72} label={copy.accuracy} />
        <p className="text-sm font-medium text-sh-foreground">
          {data.accuracyPercent}% {copy.accuracy}
        </p>
      </div>

      <SpeakingTrend data={data.trend} />

      <div className="mt-auto pt-5">
        <p className="rounded-[14px] bg-[#e8f1fb] px-3 py-2.5 text-sm font-medium text-[#2f6fb0]">
          {copy.speakingBanner}
        </p>
      </div>
    </article>
  );
}
