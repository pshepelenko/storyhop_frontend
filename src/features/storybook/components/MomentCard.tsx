import Link from 'next/link';
import { useEffect, useState } from 'react';
import { imageAssets } from '@/data/image-assets';
import { Card } from '@/components/ui';
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

  const image = moment.imageUrl ? (
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
  ) : (
    <img
      src={imageAssets.states.lockedStory}
      alt=""
      className="h-full w-full object-cover opacity-70"
    />
  );

  const card = (
    <Card padding="none" variant="flat" className="group h-full overflow-hidden transition-colors hover:border-sh-forest/35">
      <article className="flex h-full flex-col">
        <div className="relative aspect-square overflow-hidden bg-sh-forest-soft">
          {image}
        </div>
        <div className="flex flex-1 flex-col p-3">
          <p className="text-xs text-sh-foreground/65">
            {episodeLabel}
            {episodeLabel && title ? ' · ' : null}
            <span className="font-medium text-sh-foreground">{title}</span>
          </p>
        </div>
      </article>
    </Card>
  );

  return href ? (
    <Link href={href} className="block h-full" aria-label={title}>
      {card}
    </Link>
  ) : card;
}
