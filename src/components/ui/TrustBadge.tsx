type TrustBadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export default function TrustBadge({ children, className = '' }: TrustBadgeProps) {
  return (
    <div
      className={[
        'w-full rounded-[var(--sh-radius)] px-4 py-3 text-sm text-sh-forest',
        'bg-[var(--sh-trust-bg)] border border-[var(--sh-trust-border)]',
        'flex items-start gap-2.5',
        className,
      ].join(' ')}
    >
      <svg className="w-5 h-5 shrink-0 mt-0.5 text-sh-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 3 4 7v5c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V7l-8-4Z" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="leading-snug">{children}</span>
    </div>
  );
}
