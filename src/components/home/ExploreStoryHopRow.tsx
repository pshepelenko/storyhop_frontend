import { HOME_FEATURES } from './home-features';
import { ExploreFeatureCard } from './HomeFeatureRow';

type ExploreStoryHopRowProps = {
  layout?: 'default' | 'desktop-full';
};

export default function ExploreStoryHopRow({ layout = 'default' }: ExploreStoryHopRowProps) {
  const isFullWidth = layout === 'desktop-full';

  return (
    <section className={isFullWidth ? 'w-full' : undefined}>
      <h2 className="text-sm font-semibold text-sh-foreground mb-2.5">Explore StoryHop</h2>
      <div
        className={
          isFullWidth
            ? 'grid grid-cols-6 gap-3'
            : 'grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3'
        }
      >
        {HOME_FEATURES.map((f) => (
          <ExploreFeatureCard key={f.key} feature={f} size={isFullWidth ? 'desktop-full' : 'default'} />
        ))}
      </div>
    </section>
  );
}
