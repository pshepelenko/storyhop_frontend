import { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  variant?: 'default' | 'flat' | 'dashed';
};

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const variantMap = {
  default: 'bg-sh-surface border border-sh-border/70 rounded-[var(--sh-radius-lg)] shadow-[var(--sh-shadow-card)]',
  flat: 'bg-sh-surface border border-sh-border/50 rounded-[var(--sh-radius-lg)]',
  dashed: 'bg-sh-surface/60 border-2 border-dashed border-sh-border rounded-[var(--sh-radius-lg)]',
};

export default function Card({
  children,
  className = '',
  padding = 'md',
  onClick,
  variant = 'default',
}: CardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={[
        variantMap[variant],
        paddingMap[padding],
        onClick ? 'cursor-pointer hover:border-sh-forest/25 transition-colors' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
