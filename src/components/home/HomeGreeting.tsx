import Image from 'next/image';
import { imageAssets } from '@/data/image-assets';
import { useUiLanguage } from '@/lib/use-ui-language';
import { getHomeWithSeasonsCopy } from './home-with-seasons-copy';

type HomeGreetingProps = {
  childName?: string;
  parentLabel?: string;
};

export default function HomeGreeting({ childName, parentLabel }: HomeGreetingProps) {
  const copy = getHomeWithSeasonsCopy(useUiLanguage());
  const name = childName || parentLabel || 'StoryHop';

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-sh-forest/25">
        <Image
          src={imageAssets.home.hero}
          alt=""
          fill
          className="object-cover object-top"
          sizes="44px"
        />
      </div>
      <div className="min-w-0">
        <p className="ph-sensitive font-semibold text-[15px] leading-snug text-sh-foreground sm:text-[16px]">
          {copy.greeting(name)}
        </p>
        <p className="mt-0.5 text-sm text-sh-muted">{copy.subtitle}</p>
      </div>
    </div>
  );
}
