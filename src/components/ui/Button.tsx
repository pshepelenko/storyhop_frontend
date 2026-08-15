import Link from 'next/link';
import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' | 'soft';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-sh-forest text-white hover:bg-sh-forest-dark border-transparent shadow-[0_2px_8px_rgba(27,94,59,0.25)]',
  accent:
    'bg-sh-lavender text-white hover:opacity-90 border-transparent shadow-[0_2px_8px_rgba(139,92,246,0.3)]',
  soft:
    'bg-sh-lavender/12 text-sh-foreground border-transparent hover:bg-sh-lavender/18 shadow-none',
  secondary:
    'bg-white text-sh-forest border border-sh-forest hover:bg-sh-forest-soft/50',
  ghost: 'bg-transparent text-sh-forest border-transparent hover:bg-sh-forest-soft',
  danger: 'bg-red-50 text-red-700 border border-red-700 hover:bg-red-100',
};

type BaseProps = {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
};

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkButtonProps = BaseProps & { href: string };

export default function Button({
  variant = 'primary',
  fullWidth,
  children,
  className = '',
  href,
  ...rest
}: ButtonProps | LinkButtonProps) {
  const classes = [
    'inline-flex items-center justify-center gap-2 min-h-[var(--sh-tap-min)] px-5 py-2.5',
    'rounded-[var(--sh-radius)] border text-sm font-semibold transition-all duration-150',
    'disabled:opacity-50 disabled:pointer-events-none',
    variantClasses[variant],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
