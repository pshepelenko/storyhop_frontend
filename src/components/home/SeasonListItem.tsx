import Image from 'next/image';
import Link from 'next/link';
import { imageAssets } from '@/data/image-assets';

type SeasonListItemProps = {
  seasonId: string;
  seasonLabel: string;
  subtitle: string;
  locked?: boolean;
  episodeLabel?: string;
};

export default function SeasonListItem({
  seasonId,
  seasonLabel,
  subtitle,
  locked = false,
  episodeLabel,
}: SeasonListItemProps) {
  const inner = (
    <div
      className={`rounded-xl border p-3 flex gap-3 items-center ${
        locked ? 'bg-[#f5f3ef] border-[#e8e4dc] opacity-90' : 'bg-white border-[#ebe8e3] shadow-sm'
      }`}
    >
      <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
        <Image
          src={locked ? imageAssets.states.lockedStory : imageAssets.home.activeSeason}
          alt=""
          fill
          className={`object-cover ${locked ? 'grayscale brightness-95' : ''}`}
          sizes="56px"
        />
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <svg className="w-5 h-5 text-white drop-shadow" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-3 0H10V7a2 2 0 1 1 4 0v2Z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className={`font-semibold text-sm leading-tight truncate ${locked ? 'text-sh-muted' : 'text-sh-foreground'}`}>
            {seasonLabel}
          </p>
          {locked && (
            <span className="text-[8px] font-bold uppercase text-sh-muted bg-[#e8e4dc] px-1.5 py-0.5 rounded shrink-0">
              Locked
            </span>
          )}
        </div>
        <p className="text-xs text-sh-muted truncate">{subtitle}</p>
        {episodeLabel && <p className="text-[11px] text-sh-muted mt-0.5">{episodeLabel}</p>}
      </div>
    </div>
  );

  if (locked) return <div className="mb-2">{inner}</div>;
  return (
    <Link href={`/seasons/${seasonId}`} className="block mb-2">
      {inner}
    </Link>
  );
}
