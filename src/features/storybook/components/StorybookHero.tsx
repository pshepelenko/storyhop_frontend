import { useEffect, useState } from 'react';
import { imageAssets } from '@/data/image-assets';
import type { StorybookCopy } from '../storybook-copy';
import type { StorybookSeasonView } from '../types';

type Props = {
  data: StorybookSeasonView;
  copy: StorybookCopy;
};

const FALLBACK = imageAssets.states.storybookMomentFallback;

export default function StorybookHero({ data, copy }: Props) {
  const statusLabel =
    data.libraryStatus === 'completed' ? copy.statusCompleted : copy.statusActive;
  const [coverSrc, setCoverSrc] = useState(data.coverImageUrl || FALLBACK);

  useEffect(() => {
    setCoverSrc(data.coverImageUrl || FALLBACK);
  }, [data.coverImageUrl]);

  return (
    <section className="mb-6 overflow-hidden rounded-[28px] border border-[#e9e3d8] bg-white shadow-[0_14px_40px_rgba(33,57,43,0.07)] lg:mb-8">
      <div className="flex flex-col lg:min-h-[220px] lg:flex-row">
        <div className="relative aspect-[16/10] bg-[#f5efe4] lg:aspect-auto lg:w-[46%] lg:min-w-[340px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverSrc}
            alt={data.title}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => {
              if (coverSrc !== FALLBACK) {
                setCoverSrc(FALLBACK);
              }
            }}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-5 lg:px-8 lg:py-7">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h2 className="font-story text-[28px] font-bold leading-[1.05] text-sh-foreground lg:text-[36px]">
              {data.title}
            </h2>
            <span className="inline-flex rounded-full border border-[#d9ebc9] bg-[#eef7e7] px-2.5 py-1 text-[11px] font-semibold text-sh-forest">
              {statusLabel}
            </span>
          </div>
          <p className="text-sm text-sh-foreground/75 lg:text-[15px]">{copy.subtitle}</p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sh-forest">
            <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
              <path d="M4 5.5h5.2a2 2 0 0 1 1.5.7l.3.35.3-.35a2 2 0 0 1 1.5-.7H17V15a.8.8 0 0 1-1.2.7l-1.4-.7a2 2 0 0 0-.9-.2H11a2 2 0 0 0-1.4.6l-.6.6-.6-.6A2 2 0 0 0 7 14.8H5.5a2 2 0 0 0-.9.2l-1.4.7A.8.8 0 0 1 2 15V5.5h2Z" />
            </svg>
            {copy.momentsUnlocked(data.momentsUnlocked)}
          </p>
        </div>
      </div>
    </section>
  );
}
