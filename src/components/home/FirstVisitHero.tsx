import Image from 'next/image';
import { imageAssets } from '@/data/image-assets';
import Button from '../ui/Button';

export default function FirstVisitHero() {
  return (
    <section>
      <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:items-center">
        {/* Image first on mobile (mockup) */}
        <div className="relative aspect-[4/3] max-w-sm mx-auto lg:max-w-none rounded-2xl overflow-hidden shadow-[var(--sh-shadow-card)]">
          <Image src={imageAssets.home.hero} alt="" fill className="object-cover" priority sizes="(max-width:1024px) 90vw, 45vw" />
        </div>

        <div className="text-center lg:text-left mt-6 lg:mt-0">
          <h1 className="text-[1.75rem] leading-tight lg:text-[2.125rem] font-bold font-story text-sh-foreground">
            <span className="lg:hidden">Create your child&apos;s English adventure</span>
            <span className="hidden lg:inline">Let&apos;s build your child&apos;s English adventure</span>
          </h1>
          <p className="text-[15px] text-sh-muted mt-3 max-w-md mx-auto lg:mx-0 leading-relaxed">
            Personalized stories, audio, choices, and speaking practice — made for 6–10 year old explorers.
          </p>
          <div className="flex flex-col gap-3 mt-6 max-w-md mx-auto lg:mx-0">
            <Button href="/seasons/new" fullWidth className="rounded-xl py-3.5 text-[15px]">
              Create first season ✨
            </Button>
            <Button href="/sample-chapter" variant="secondary" fullWidth className="rounded-xl py-3.5 text-[15px]">
              <span className="inline-flex items-center justify-center gap-2 w-full">
                <span className="w-6 h-6 rounded-full border-2 border-sh-forest flex items-center justify-center text-[10px] text-sh-forest">▶</span>
                See sample chapter
              </span>
            </Button>
          </div>
          <div className="mt-5 max-w-md mx-auto lg:mx-0">
            <div className="flex items-start gap-2.5 rounded-xl bg-[#ecfdf5] border border-[#bbf7d0] px-4 py-3 text-[13px] text-sh-forest leading-snug text-left">
              <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M12 3 4 7v5c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V7l-8-4Z" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Made for kids. Trusted by parents. Safe, ad-free, and privacy-first.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
