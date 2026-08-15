import Image from 'next/image';
import Link from 'next/link';
import { imageAssets } from '@/data/image-assets';
import Button from '../ui/Button';

export default function ParentDashboardPromo({ layout = 'mobile' }: { layout?: 'mobile' | 'desktop' }) {
  if (layout === 'desktop') {
    return (
      <div className="bg-white rounded-[var(--sh-radius-lg)] border border-sh-border shadow-[var(--sh-shadow-card)] overflow-hidden flex items-center min-h-[83px]">
        <div className="relative w-36 h-[91px] shrink-0">
          <Image src={imageAssets.parent.shareWithParents} alt="" fill className="object-cover" sizes="144px" />
        </div>
        <div className="flex-1 py-4 pl-4 pr-3 min-w-0">
          <p className="font-semibold text-sh-foreground text-sm">Parent dashboard</p>
          <p className="text-sm text-sh-muted mt-1 leading-relaxed">
            See how much English your child listened to, spoke, and learned this week.
          </p>
        </div>
        <Button
          href="/parent-space"
          variant="secondary"
          className="shrink-0 mr-4 rounded-[var(--sh-radius)]"
        >
          Open dashboard
        </Button>
      </div>
    );
  }

  return (
    <Link href="/parent-space" className="block group">
      <div className="bg-white rounded-2xl border border-sh-border shadow-[var(--sh-shadow-card)] overflow-hidden flex items-center group-active:border-sh-forest/30">
        <div className="relative w-24 h-[88px] shrink-0">
          <Image src={imageAssets.parent.shareWithParents} alt="" fill className="object-cover" sizes="96px" />
        </div>
        <div className="flex-1 py-3 pl-3 pr-2 min-w-0">
          <p className="font-semibold text-sm text-sh-foreground">Parent dashboard</p>
          <p className="text-xs text-sh-muted mt-0.5 leading-relaxed">Track listening, vocabulary, and speaking.</p>
        </div>
        <svg className="w-5 h-5 text-sh-muted shrink-0 mr-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}
