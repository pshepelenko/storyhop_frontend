import Button from './Button';

export default function AgeStepper({ value, onChange, min = 6, max = 10 }: { value: number; onChange: (value: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex min-h-[var(--sh-tap-min)] items-center justify-between rounded-[var(--sh-radius)] border border-sh-border bg-white p-1">
      <Button variant="secondary" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="!min-h-9 !h-9 !w-9 !px-0 text-lg" aria-label="Decrease age">−</Button>
      <span className="text-base font-semibold text-sh-foreground">{value} лет</span>
      <Button variant="secondary" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="!min-h-9 !h-9 !w-9 !px-0 text-lg" aria-label="Increase age">+</Button>
    </div>
  );
}
