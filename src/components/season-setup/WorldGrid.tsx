import { StoryWorldId, StoryWorldPreset } from '@/types/storyWorlds';
import WorldCard from './WorldCard';

type WorldGridProps = {
  worlds: StoryWorldPreset[];
  selectedWorldId: StoryWorldId | null;
  onSelect: (worldId: StoryWorldId) => void;
};

export default function WorldGrid({ worlds, selectedWorldId, onSelect }: WorldGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3" role="radiogroup" aria-label="Choose a story world">
      {worlds.map((world) => (
        <WorldCard
          key={world.id}
          world={world}
          selected={selectedWorldId === world.id}
          onSelect={() => onSelect(world.id)}
        />
      ))}
    </div>
  );
}
