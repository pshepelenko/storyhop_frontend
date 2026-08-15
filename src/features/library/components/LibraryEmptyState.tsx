import Image from 'next/image';
import { Button, Card } from '@/components/ui';
import { imageAssets } from '@/data/image-assets';
import type { LibraryCopy } from '../library-copy';

type Props = {
  copy: LibraryCopy;
};

export default function LibraryEmptyState({ copy }: Props) {
  return (
    <Card padding="lg" className="text-center max-w-lg mx-auto">
      <div className="relative h-40 max-w-xs mx-auto rounded-[var(--sh-radius-lg)] overflow-hidden mb-5">
        <Image src={imageAssets.home.emptySeasons} alt="" fill className="object-cover" sizes="320px" />
      </div>
      <h2 className="text-lg font-bold font-story text-sh-foreground">{copy.emptyTitle}</h2>
      <p className="text-sm text-sh-muted mt-2 leading-relaxed">{copy.emptyText}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <Button href="/seasons/new">{copy.createFirst}</Button>
        <Button href="/demo-story" variant="secondary">
          {copy.tryDemo}
        </Button>
      </div>
    </Card>
  );
}
