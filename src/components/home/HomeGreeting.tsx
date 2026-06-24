import Image from 'next/image';
import { imageAssets } from '@/data/image-assets';

type HomeGreetingProps = {
  childName?: string;
  parentLabel?: string;
  variant: 'mobile' | 'desktop';
};

export default function HomeGreeting({ childName, parentLabel, variant }: HomeGreetingProps) {
  const label = parentLabel ?? (childName ? `${childName}'s parent` : 'Parent');

  if (variant === 'mobile' && childName) {
    return (
      <div className="flex items-center gap-3 lg:hidden">
        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-sh-forest/30">
          <Image src={imageAssets.home.hero} alt="" fill className="object-cover object-top" sizes="40px" />
        </div>
        <div>
          <p className="text-[15px] font-medium text-sh-foreground leading-snug">
            Hi, {label}! <span aria-hidden>👋</span>
          </p>
          <p className="text-[13px] text-sh-muted mt-0.5">Let&apos;s continue the adventure.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-sh-forest/25">
        <Image src={imageAssets.home.hero} alt="" fill className="object-cover object-top" sizes="44px" />
      </div>
      <div>
        <p className="text-base font-medium text-sh-foreground leading-snug">
          Hi, {label}! <span aria-hidden>👋</span>
        </p>
        <p className="text-sm text-sh-muted mt-0.5">Let&apos;s continue the adventure.</p>
      </div>
    </div>
  );
}
