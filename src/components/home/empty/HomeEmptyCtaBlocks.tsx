import Image from 'next/image';
import Link from 'next/link';
import { imageAssets } from '@/data/image-assets';
import type { HomeEmptyCopy } from './home-empty-copy';

type HomeEmptyCtaBlocksProps = {
  copy: HomeEmptyCopy;
};

const CTA_HEIGHT = 'min-h-[172px] sm:min-h-[180px] lg:h-[180px]';

export default function HomeEmptyCtaBlocks({ copy }: HomeEmptyCtaBlocksProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className={`relative overflow-hidden rounded-2xl ${CTA_HEIGHT} shadow-[0_8px_24px_rgba(124,58,237,0.2)]`}>
        <Image
          src={imageAssets.home.emptyCta.demo}
          alt=""
          fill
          className="object-cover object-left"
          sizes="(max-width: 1024px) 100vw, 50vw"
          loading="lazy"
        />
        <div className="absolute inset-0 z-10 grid grid-rows-[1fr_auto] gap-3 p-4 sm:p-5 lg:p-6 ml-auto w-full max-w-[54%] sm:max-w-[52%]">
          <div className="min-w-0 self-center">
            <p className="text-sm sm:text-base lg:text-lg font-semibold text-white leading-snug">{copy.demoCtaTitle}</p>
            <p className="text-xs sm:text-sm text-white/90 mt-1">{copy.demoCtaSubtitle}</p>
          </div>
          <Link
            href="/demo-story"
            className="inline-flex items-center justify-center shrink-0 rounded-xl bg-[#5b21b6] px-4 sm:px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#4c1d95] transition-colors w-full sm:w-auto self-start"
          >
            {copy.demoCtaButton}
          </Link>
        </div>
      </section>

      <section className={`relative overflow-hidden rounded-2xl ${CTA_HEIGHT} shadow-[0_8px_24px_rgba(5,150,105,0.15)]`}>
        <Image
          src={imageAssets.home.emptyCta.story}
          alt=""
          fill
          className="object-cover object-left"
          sizes="(max-width: 1024px) 100vw, 50vw"
          loading="lazy"
        />
        <div className="absolute inset-0 z-10 grid grid-rows-[1fr_auto] gap-3 p-4 sm:p-5 lg:p-6 w-full max-w-[58%] sm:max-w-[54%]">
          <div className="min-w-0 self-center">
            <p className="text-sm sm:text-base lg:text-lg font-semibold text-[#065f46] leading-snug">{copy.storyCtaTitle}</p>
            <p className="text-xs sm:text-sm text-[#047857]/90 mt-1">{copy.storyCtaSubtitle}</p>
          </div>
          <Link
            href="/seasons/new"
            className="inline-flex items-center justify-center shrink-0 rounded-xl bg-[#059669] px-4 sm:px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#047857] transition-colors w-full sm:w-auto self-start"
          >
            {copy.storyCtaButton}
          </Link>
        </div>
      </section>
    </div>
  );
}
