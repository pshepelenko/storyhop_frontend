type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
};

export default function SectionHeader({ title, subtitle, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-end justify-between gap-3 mb-4 ${className}`}>
      <div>
        <h2 className="sh-section-title">{title}</h2>
        {subtitle && <p className="text-sm text-sh-muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
