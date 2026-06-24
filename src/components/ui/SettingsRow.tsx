import { ReactNode } from 'react';

type SettingsRowProps = {
  icon?: ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  href?: string;
  trailing?: ReactNode;
  border?: boolean;
};

export default function SettingsRow({
  icon,
  label,
  description,
  onClick,
  href,
  trailing,
  border = true,
}: SettingsRowProps) {
  const className = `flex items-center gap-3 w-full min-h-[var(--sh-tap-min)] px-4 py-3 text-left ${
    border ? 'border-b border-sh-border last:border-b-0' : ''
  } hover:bg-sh-background/80`;

  const content = (
    <>
      {icon && <span className="text-sh-forest shrink-0">{icon}</span>}
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="block text-xs text-sh-muted mt-0.5">{description}</span>}
      </span>
      {trailing ?? (
        <svg className="w-4 h-4 text-sh-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
