type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  className?: string;
  showValue?: boolean;
};

export default function ProgressBar({ value, max = 100, label, className = '', showValue = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between text-xs text-sh-muted mb-1.5">
          <span>{label}</span>
          {showValue && <span className="font-medium text-sh-foreground">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="h-1.5 rounded-full bg-[#e8e4dc] overflow-hidden">
        <div
          className="h-full rounded-full bg-sh-forest transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
