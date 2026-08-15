type ParentSnapshotMetricProps = {
  label: string;
  value: string;
  tint: 'emerald' | 'blue' | 'purple' | 'amber';
};

const tintClassMap = {
  emerald: 'bg-sh-forest',
  blue: 'bg-sky-500',
  purple: 'bg-violet-500',
  amber: 'bg-amber-400',
} as const;

export default function ParentSnapshotMetric({ label, value, tint }: ParentSnapshotMetricProps) {
  return (
    <div className="rounded-[var(--sh-radius)] border border-sh-border bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.04em] text-sh-muted">{label}</p>
      <p className="mt-2 text-xl font-semibold text-sh-foreground">{value}</p>
      <div className="mt-3 flex items-end gap-1">
        {[0.35, 0.5, 0.4, 0.7, 0.55, 0.82].map((height, index) => (
          <span
            key={index}
            className={`w-2 rounded-full ${tintClassMap[tint]}`}
            style={{ height: `${Math.round(height * 22)}px`, opacity: 0.35 + index * 0.08 }}
          />
        ))}
      </div>
    </div>
  );
}
