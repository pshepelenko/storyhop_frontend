type Segment = { value: string; label: string; description?: string };

export default function SegmentedControl({
  segments,
  value,
  onChange,
  ariaLabel,
}: {
  segments: Segment[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="grid gap-2 sm:grid-cols-3">
      {segments.map((segment) => {
        const selected = segment.value === value;
        return (
          <button
            type="button"
            role="radio"
            aria-checked={selected}
            key={segment.value}
            onClick={() => onChange(segment.value)}
            className={`min-h-[var(--sh-tap-min)] rounded-[var(--sh-radius)] border px-3 py-2 text-left transition-colors ${
              selected ? 'border-sh-forest bg-sh-forest-soft text-sh-forest' : 'border-sh-border bg-white text-sh-foreground'
            }`}
          >
            <span className="block text-sm font-semibold">{segment.label}</span>
            {segment.description && <span className="mt-0.5 block text-xs text-sh-muted">{segment.description}</span>}
          </button>
        );
      })}
    </div>
  );
}
