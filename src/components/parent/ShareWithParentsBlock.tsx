import Image from 'next/image';
import Link from 'next/link';
import { imageAssets } from '@/data/image-assets';
import Card from '../ui/Card';

export default function ShareWithParentsBlock() {
  return (
    <Card padding="md" className="overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-40 h-28 shrink-0 rounded-sh overflow-hidden">
          <Image
            src={imageAssets.parent.shareWithParents}
            alt=""
            fill
            className="object-cover"
            sizes="160px"
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="font-semibold text-sm">Love StoryHop? Share with other parents</p>
          <p className="text-xs text-sh-muted mt-1">
            Invite a friend and both get bonus crystals and a discount.
          </p>
          <Link
            href="/referral"
            className="inline-block mt-3 text-sm font-semibold text-sh-forest hover:underline"
          >
            Invite a friend →
          </Link>
        </div>
      </div>
    </Card>
  );
}
