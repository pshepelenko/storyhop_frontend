import Image from 'next/image';
import { imageAssets } from '@/data/image-assets';

/** Landscape at the bottom of mobile returning home (inside main). */
export default function MobileHomeBottomLandscape() {
  return (
    <div
      className="relative -mx-5 sm:-mx-6 mt-5 w-full aspect-[1536/713] shrink-0 overflow-hidden"
      aria-hidden
    >
      <Image
        src={imageAssets.backgrounds.sidebarLandscapeCropped}
        alt=""
        fill
        className="object-cover object-bottom"
        sizes="100vw"
        priority
      />
    </div>
  );
}
