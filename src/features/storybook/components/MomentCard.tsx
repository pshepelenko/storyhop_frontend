import Link from 'next/link';
import { useEffect, useState } from 'react';
import { imageAssets } from '@/data/image-assets';
import type { StorybookCopy } from '../storybook-copy';
import type { StorybookMoment } from '../types';

type Props = {
  moment: StorybookMoment;
  seasonId: string;
  copy: StorybookCopy;
};

const FALLBACK = imageAssets.states.storybookMomentFallback;

export default function MomentCard({ moment, seasonId, copy }: Props) {
  const episodeLabel =
    moment.episodeNumber != null
      ? copy.episodeLabel(moment.episodeNumber)
      : null;
  const title =
    moment.episodeTitle ||
    moment.title.replace(/^Episode\s+\d+:\s*/i, '') ||
    moment.title;
  const [src, setSrc] = useState(moment.imageUrl || FALLBACK);
  const href =
    moment.episodeNumber != null
      ? `/seasons/${seasonId}?episode=${moment.episodeNumber}`
      : null;

  useEffect(() => {
    setSrc(moment.imageUrl || FALLBACK);
  }, [moment.imageUrl]);

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
      onError={() => {
        if (src !== FALLBACK) {
          setSrc(FALLBACK);
        }
      }}
    />
  );

  const caption = (
    <p className="text-xs text-sh-foreground/65">
      {episodeLabel}
      {episodeLabel && title ? ' · ' : null}
      <span className="font-medium text-sh-foreground">{title}</span>
    </p>
  );

  return (
    <article className="group">
      <div className="relative aspect-square overflow-hidden rounded-[18px] bg-[#f5efe4]">
        {href ? (
          <Link href={href} className="absolute inset-0 block" aria-label={title}>
            {image}
          </Link>
        ) : (
          image
        )}
      </div>
      <div className="mt-2 px-0.5">
        {href ? (
          <Link href={href} className="block hover:underline">
            {caption}
          </Link>
        ) : (
          caption
        )}
      </div>
    </article>
  );
}
