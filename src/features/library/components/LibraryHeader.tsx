import { Button } from '@/components/ui';
import type { LibraryCopy } from '../library-copy';

type Props = {
  copy: LibraryCopy;
  compact?: boolean;
};

export default function LibraryHeader({ copy, compact }: Props) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 ${compact ? 'mb-5' : 'mb-7'}`}>
      <div>
        <h1 className={`${compact ? 'text-[38px]' : 'text-[54px]'} font-story font-bold leading-none text-sh-forest`}>
          {compact ? copy.mobileTitle || copy.title : copy.title}
        </h1>
        <p className={`${compact ? 'mt-2 text-sm' : 'mt-3 text-[15px]'} text-sh-foreground/85`}>
          {copy.subtitle}
        </p>
      </div>
      {!compact && (
        <Button href="/seasons/new" className="shrink-0 rounded-full px-6">
          <span aria-hidden className="text-lg leading-none">+</span>
          {copy.createSeason}
        </Button>
      )}
    </div>
  );
}
