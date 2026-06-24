import { SAMPLE_CHAPTER } from '@/data/sample-chapter';
import { EpisodeAudioPlayer } from '../ui';

export default function QuickPeekSection() {
  return (
    <section>
      <h2 className="text-base font-semibold text-sh-foreground mb-1">A quick peek</h2>
      <p className="text-sm text-sh-muted mb-4">Try a sample from Episode 1</p>
      <div className="bg-[#eef4f8] rounded-2xl border border-[#d4e4ef] p-4 lg:p-5 lg:flex lg:gap-8 lg:items-start">
        <div className="flex-1 min-w-0">
          <EpisodeAudioPlayer label="The Call to Adventure" />
          <p className="text-xs text-sh-muted mt-3 leading-relaxed">{SAMPLE_CHAPTER.teaser}</p>
        </div>
        <div className="mt-5 lg:mt-0 lg:flex-1">
          <p className="text-sm font-semibold text-sh-foreground mb-3">What should your child do next?</p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              className="flex-1 rounded-xl border-2 border-sh-forest bg-white px-4 py-3.5 text-left text-sm font-medium text-sh-foreground hover:bg-sh-forest-soft/30 transition-colors"
            >
              <span className="font-bold text-sh-forest mr-1.5">A</span>
              Follow the glowing path
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl border-2 border-sh-coral bg-white px-4 py-3.5 text-left text-sm font-medium text-sh-foreground hover:bg-orange-50 transition-colors"
            >
              <span className="font-bold text-sh-coral mr-1.5">B</span>
              Check the map first
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
