import ProgressRing from '@/components/ui/ProgressRing';
import { imageAssets } from '@/data/image-assets';
import type { ParentSpaceCopy } from '../parent-space-copy';
import type { ParentSpaceView } from '../types';

type Props = {
  data: ParentSpaceView['listening'];
  copy: ParentSpaceCopy;
};

function MiniBarChart({ data }: { data: { label: string; minutes: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.minutes));
  return (
    <div className="flex h-28 items-end gap-1.5">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full min-h-[4px] rounded-t-md bg-[#3f8f6b]"
            style={{ height: `${(d.minutes / max) * 100}%` }}
          />
          <span className="text-[10px] text-sh-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ListeningCard({ data, copy }: Props) {
  if (!data.hasActivity) {
    return (
      <article className="flex h-full flex-col rounded-[24px] border border-[#e9e3d8] bg-white p-5 shadow-[0_12px_30px_rgba(33,57,43,0.05)]">
        <h2 className="font-story text-2xl font-bold text-[#2f6b4f]">{copy.listeningTitle}</h2>
        <p className="mt-1 text-sm text-sh-muted">{copy.listeningSubtitle}</p>
        <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageAssets.parent.skillEmpty} alt="" className="mb-3 h-24 w-24 rounded-2xl object-cover" />
          <p className="text-sm text-sh-muted">{copy.listeningEmpty}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col rounded-[24px] border border-[#e9e3d8] bg-white p-5 shadow-[0_12px_30px_rgba(33,57,43,0.05)]">
      <h2 className="font-story text-2xl font-bold text-[#2f6b4f]">{copy.listeningTitle}</h2>
      <p className="mt-1 text-sm text-sh-muted">{copy.listeningSubtitle}</p>
      <div className="mt-5">
        <MiniBarChart data={data.weeklyMinutes} />
      </div>
      <div className="mt-5 flex items-center gap-4">
        <ProgressRing value={data.completionRatePercent} size={72} label={copy.completionRate} />
        <div>
          <p className="text-sm font-medium text-sh-foreground">
            {copy.completionRate} {data.completionRatePercent}%
          </p>
          <p className="mt-1 text-xs text-sh-muted">{copy.daysListened(data.consistencyDays)}</p>
        </div>
      </div>
      <div className="mt-auto pt-5">
        <p className="rounded-[14px] bg-[#e8f5ee] px-3 py-2.5 text-sm font-medium text-[#2f6b4f]">
          {copy.listeningBanner}
        </p>
      </div>
    </article>
  );
}
