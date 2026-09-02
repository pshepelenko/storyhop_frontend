import Link from 'next/link';
import { useEffect, useState } from 'react';
import { imageAssets } from '@/data/image-assets';
import { Button, Card } from '@/components/ui';
import type { StorybookCopy } from '../storybook-copy';
import type { StorybookMoment } from '../types';

type Props = {
  moment: StorybookMoment;
  seasonId: string;
  copy: StorybookCopy;
  onCreateIllustration: (moment: StorybookMoment) => void;
  creating: boolean;
};

const FALLBACK = imageAssets.states.storybookMomentFallback;

export default function MomentCard({ moment, seasonId, copy, onCreateIllustration, creating }: Props) {
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

  const caption = (
    <p className="text-xs text-sh-foreground/65">
      {episodeLabel}
      {episodeLabel && title ? ' · ' : null}
      <span className="font-medium text-sh-foreground">{title}</span>
    </p>
  );

  const showCreate = moment.canCreateIllustration && !moment.imageUrl;
  const isGenerating = ['queued', 'pending', 'processing'].includes(moment.status);

  return (
    <Card padding="none" variant="flat" className="group h-full overflow-hidden">
      <article className="flex h-full flex-col">
        <div className="relative aspect-square overflow-hidden bg-sh-forest-soft">
        {href ? (
          <Link href={href} className="absolute inset-0 block" aria-label={title}>
            {image}
          </Link>
        ) : (
          image
        )}
        </div>
        <div className="flex flex-1 flex-col p-3">
        {href ? (
          <Link href={href} className="block hover:underline">
            {caption}
          </Link>
        ) : (
          caption
        )}
          <div className="mt-3">
            {showCreate ? (
              <Button
                variant="secondary"
                className="h-9 !min-h-[36px] w-full px-2 text-xs leading-tight"
                onClick={() => onCreateIllustration(moment)}
                disabled={creating}
              >
                {creating ? copy.illustrationQueued : copy.createIllustration(moment.unlockCost)}
              </Button>
            ) : href ? (
              <Button href={href} variant="ghost" className="h-9 !min-h-[36px] w-full px-2 text-xs">
                {isGenerating ? copy.illustrationQueued : copy.openEpisode}
              </Button>
            ) : null}
          </div>
        </div>
      </article>
    </Card>
  );
}
