import Image from 'next/image';
import { StoryWorldPreset } from '@/types/storyWorlds';

type WorldCardProps = {
  world: StoryWorldPreset;
  selected: boolean;
  onSelect: () => void;
};

export default function WorldCard({ world, selected, onSelect }: WorldCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={world.title}
      onClick={onSelect}
      className={`group h-full w-full rounded-[var(--sh-radius-lg)] border bg-white p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sh-forest)] ${
        selected
          ? 'border-sh-forest bg-[color:var(--sh-forest-soft)] shadow-[0_0_0_1px_var(--sh-forest)]'
          : 'border-sh-border hover:border-sh-forest'
      }`}
    >
      <div className="relative mb-3 h-32 overflow-hidden rounded-[14px] bg-slate-100">
        <Image
          src={world.imagePath}
          alt={world.altText}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 767px) 42vw, (max-width: 1279px) 30vw, 220px"
        />
        {selected && (
          <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-sh-forest text-sm font-semibold text-white shadow">
            ✓
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight text-sh-foreground">{world.title}</p>
          <p className="mt-1 text-xs leading-5 text-sh-muted">{world.shortDescription}</p>
        </div>
      </div>
    </button>
  );
}
