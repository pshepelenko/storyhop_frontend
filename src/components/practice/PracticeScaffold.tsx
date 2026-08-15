import type { ReactNode } from 'react';
import { Button, Card } from '@/components/ui';

type PracticeScaffoldProps = {
  badge: string;
  accent?: 'purple' | 'green';
  backLabel?: string;
  title?: string;
  subtitle?: string;
  crystals?: number | null;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  note?: ReactNode;
  headerVariant?: 'hero' | 'compact';
  width?: 'narrow' | 'regular';
  compactMobile?: boolean;
};

export default function PracticeScaffold({
  badge,
  accent = 'purple',
  backLabel = 'Back',
  title,
  subtitle,
  crystals,
  onBack,
  children,
  footer,
  note,
  headerVariant = 'hero',
  width = 'regular',
  compactMobile = false,
}: PracticeScaffoldProps) {
  const accentClasses =
    accent === 'green'
      ? {
          badge: 'bg-sh-forest-soft text-sh-forest',
          ring: 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_0_0_1px_rgba(5,150,105,0.08)]',
        }
      : {
          badge: 'bg-[color:var(--sh-lavender)]/10 text-[color:var(--sh-lavender)]',
          ring: 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_0_0_1px_rgba(139,92,246,0.08)]',
        };

  return (
    <div className={`mx-auto w-full ${width === 'narrow' ? 'max-w-[31rem]' : 'max-w-[42rem]'} ${compactMobile ? 'px-2 sm:px-0' : 'px-3 sm:px-0'}`}>
      <div className={`${compactMobile ? 'mb-1.5 sm:mb-4' : 'mb-3 sm:mb-4'} flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="secondary"
              className="h-11 !min-h-[44px] rounded-[16px] px-4 py-0 text-sm font-semibold"
              onClick={onBack}
            >
              {backLabel}
            </Button>
          )}
        </div>
        {typeof crystals === 'number' && (
          <div
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border border-sh-border bg-white px-4 py-2 text-sm font-semibold text-sh-foreground ${accentClasses.ring}`}
          >
            <span className="text-[15px]">💎</span>
            <span>{crystals}</span>
          </div>
        )}
      </div>
      <Card className={`overflow-hidden border border-sh-border/80 bg-white p-0 ${compactMobile ? 'rounded-[20px] shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:rounded-[28px] sm:shadow-[0_24px_60px_rgba(15,23,42,0.12)]' : 'rounded-[28px] shadow-[0_24px_60px_rgba(15,23,42,0.12)]'}`}>
        {(badge || title || subtitle) && (
          <div
            className={
              headerVariant === 'hero'
                ? 'px-6 pb-5 pt-8 text-center sm:px-9 sm:pb-7 sm:pt-10'
                : 'px-6 pb-2 pt-6 text-left sm:px-9'
            }
          >
            {badge ? (
              <div
                className={`${
                  headerVariant === 'hero' ? 'mx-auto' : ''
                } inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${accentClasses.badge}`}
              >
                {badge}
              </div>
            ) : null}
            {title ? (
              <h1
                className={
                  headerVariant === 'hero'
                    ? 'mt-4 text-[2rem] font-semibold leading-tight text-sh-foreground sm:text-[3rem]'
                    : 'mt-2 text-xl font-semibold leading-tight text-sh-foreground sm:text-2xl'
                }
              >
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p
                className={
                  headerVariant === 'hero'
                    ? 'mx-auto mt-3 max-w-[34rem] text-base leading-relaxed text-sh-muted sm:text-xl'
                    : 'mt-2 max-w-[34rem] text-sm leading-relaxed text-sh-muted sm:text-base'
                }
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        )}
        <div className={`${badge || title || subtitle ? 'border-t border-sh-border/80' : ''} ${compactMobile ? 'px-4 py-3 sm:px-9 sm:py-8' : 'px-6 py-6 sm:px-9 sm:py-8'}`}>{children}</div>
        {(footer || note) && (
          <div className="border-t border-sh-border/80 px-6 py-5 sm:px-9 sm:py-6">
            {footer}
            {note && <div className="pt-3 text-center text-xs leading-relaxed text-sh-muted sm:text-sm">{note}</div>}
          </div>
        )}
      </Card>
    </div>
  );
}
