import Image from 'next/image';
import { imageAssets } from '@/data/image-assets';
import Button from '../ui/Button';

export default function EmptySeasonsBlock({ showCta = false }: { showCta?: boolean }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-sh-foreground">Your seasons</h2>
        <span className="text-xs text-sh-muted">All seasons</span>
      </div>
      <div className="rounded-2xl border-2 border-dashed border-[#d8d4cc] bg-white px-5 py-8 text-center">
        <div className="relative w-14 h-14 mx-auto mb-3 opacity-70">
          <Image src={imageAssets.home.emptySeasons} alt="" fill className="object-contain" sizes="56px" />
        </div>
        <p className="text-sm font-medium text-sh-foreground">No seasons yet</p>
        <p className="text-xs text-sh-muted mt-1.5 max-w-[260px] mx-auto leading-relaxed">
          Create your first season to start the adventure!
        </p>
        {showCta && (
          <Button href="/seasons/new" className="mt-5 rounded-xl">
            Create first season ✨
          </Button>
        )}
      </div>
    </section>
  );
}
