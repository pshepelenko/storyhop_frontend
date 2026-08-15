import { imageAssets } from '@/data/image-assets';
import type { ParentSpaceCopy } from '../parent-space-copy';

type Props = {
  copy: ParentSpaceCopy;
};

export default function ParentFooterBanner({ copy }: Props) {
  return (
    <section className="relative mt-8 overflow-hidden rounded-[28px] border border-[#d7e8cf] bg-[#eef6e8] lg:mt-10">
      {/* Soft wash behind art — matches mockup mint band */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_50%,rgba(255,255,255,0.75)_0%,rgba(238,246,232,0)_55%)]"
      />

      <div className="relative grid min-h-[168px] grid-cols-1 items-center lg:min-h-[200px] lg:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.85fr)]">
        <div className="relative z-10 px-5 py-6 pr-6 lg:px-8 lg:py-8 lg:pr-4">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#d9ebc9] text-sh-forest ring-1 ring-[#c5dfb4]">
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M12 2.5 19 5.2v5.1c0 4.6-2.9 8.3-7 10.2-4.1-1.9-7-5.6-7-10.2V5.2L12 2.5Z" />
              <path
                d="m8.6 11.5 2.2 2.2 4.6-4.6"
                className="fill-none stroke-white stroke-[2.2]"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="max-w-[22ch] font-story text-[26px] font-bold leading-[1.15] text-sh-forest lg:text-[34px]">
            {copy.footerTitle}
          </h2>
          <p className="mt-2 max-w-[36ch] text-sm leading-relaxed text-sh-foreground/75 lg:text-[15px]">
            {copy.footerBody}
          </p>
        </div>

        {/* Mockup: art sits on the right edge of the banner, not a centered card below */}
        <div className="relative h-40 w-full self-end lg:h-full lg:min-h-[200px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageAssets.parent.footerBook}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[70%_55%] lg:object-right"
          />
        </div>
      </div>
    </section>
  );
}
