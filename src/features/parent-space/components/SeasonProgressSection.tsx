import Link from 'next/link';
import { imageAssets } from '@/data/image-assets';
import type { ParentSpaceCopy } from '../parent-space-copy';
import type { ParentSpaceSeasonCard } from '../types';

type Props = {
  seasons: ParentSpaceSeasonCard[];
  copy: ParentSpaceCopy;
};

function statusLabel(status: string, copy: ParentSpaceCopy) {
  if (status === 'completed') return copy.statusCompleted;
  if (status === 'archived') return copy.statusArchived;
  return copy.statusActive;
}

export default function SeasonProgressSection({ seasons, copy }: Props) {
  if (seasons.length === 0) return null;

  return (
    <section className="mt-8 lg:mt-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="font-story text-[26px] font-bold text-sh-forest lg:text-[32px]">{copy.seasonsTitle}</h2>
        <Link href="/library" className="shrink-0 text-sm font-semibold text-sh-forest hover:underline">
          {copy.seeAllSeasons} →
        </Link>
      </div>

      <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
        {seasons.map((season) => {
          const cover = season.coverImageUrl || imageAssets.states.storybookMomentFallback;
          return (
            <article
              key={season.seasonId}
              className="overflow-hidden rounded-[22px] border border-[#e9e3d8] bg-white shadow-[0_10px_28px_rgba(33,57,43,0.05)]"
            >
              <div className="flex gap-3 p-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[16px] bg-[#f5efe4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-story text-lg font-bold text-sh-foreground">{season.title}</h3>
                    <span className="inline-flex rounded-full border border-[#d9ebc9] bg-[#eef7e7] px-2 py-0.5 text-[10px] font-semibold text-sh-forest">
                      {statusLabel(season.status, copy)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-sh-muted">
                    {copy.seasonMeta(season.seasonNumber)}
                  </p>
                  <p className="mt-2 text-xs font-medium text-sh-foreground">
                    {copy.seasonEpisodes(season.completedEpisodes)}
                  </p>
                  <p className="mt-2 text-[11px] text-sh-muted">
                    {copy.wordsPracticed(season.wordsPracticed)} · {copy.speakingCount(season.speakingCompleted)}
                  </p>
                </div>
              </div>
              <div className="border-t border-[#efe9df] px-3 py-2.5">
                <Link
                  href={`/parent-space?seasonId=${season.seasonId}`}
                  className="text-sm font-semibold text-sh-forest hover:underline"
                >
                  {copy.viewProgress}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
