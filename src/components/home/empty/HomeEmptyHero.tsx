import Image from 'next/image';
import Button from '@/components/ui/Button';
import { imageAssets } from '@/data/image-assets';
import type { HomeEmptyCopy } from './home-empty-copy';

type HomeEmptyHeroProps = {
  copy: HomeEmptyCopy;
};

export default function HomeEmptyHero({ copy }: HomeEmptyHeroProps) {
  return (
    <section className="rounded-2xl border border-sh-border/60 bg-gradient-to-br from-sky-50 via-indigo-50/80 to-violet-50 overflow-hidden shadow-[var(--sh-shadow-card)]">
      <div className="lg:grid lg:grid-cols-2 lg:min-h-[300px]">
        <div className="order-2 lg:order-1 flex flex-col justify-center px-5 py-6 sm:px-7 sm:py-8 lg:px-8 lg:py-10 text-center lg:text-left">
          <h1 className="text-[1.65rem] sm:text-[1.85rem] lg:text-[2rem] leading-tight font-bold font-story text-sh-foreground">
            {copy.heroTitle}
          </h1>
          <p className="text-[15px] text-sh-muted mt-3 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            {copy.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-5 justify-center lg:justify-start">
            <Button href="/demo-story" variant="accent" className="rounded-xl px-6 py-3 text-[15px] w-full sm:w-auto">
              {copy.demoCtaButton}
            </Button>
            <Button href="/seasons/new" variant="primary" className="rounded-xl px-6 py-3 text-[15px] w-full sm:w-auto">
              {copy.storyCtaButton}
            </Button>
          </div>
        </div>

        <div className="order-1 lg:order-2 relative min-h-[200px] sm:min-h-[240px] lg:min-h-0 lg:h-full">
          <Image
            src={imageAssets.home.hero}
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
