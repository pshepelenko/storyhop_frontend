import { StoryWorldId, StoryWorldPreset } from '@/types/storyWorlds';
import WorldCard from './WorldCard';

type WorldCarouselProps = {
  worlds: StoryWorldPreset[];
  selectedWorldId: StoryWorldId | null;
  onSelect: (worldId: StoryWorldId) => void;
};

export default function WorldCarousel({ worlds, selectedWorldId, onSelect }: WorldCarouselProps) {
  return (
    <div>
      <div
        className="-mx-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="radiogroup"
        aria-label="Choose a story world"
      >
        <div className="flex gap-3 pr-12">
          {worlds.map((world) => (
            <div key={world.id} className="w-[76vw] min-w-[268px] max-w-[320px] shrink-0 snap-start">
              <WorldCard
                world={world}
                selected={selectedWorldId === world.id}
                onSelect={() => onSelect(world.id)}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {worlds.map((world) => (
          <span
            key={world.id}
            className={`rounded-full transition-all ${
              selectedWorldId === world.id ? 'h-1.5 w-5 bg-sh-forest' : 'h-1.5 w-1.5 bg-sh-border'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
