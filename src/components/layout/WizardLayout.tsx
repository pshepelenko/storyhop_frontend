import { ReactNode } from 'react';
import { Button } from '@/components/ui';

const STEP_LABELS = ['История', 'Герой', 'Проверка'];

type WizardLayoutProps = {
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
};

export default function WizardLayout({
  step,
  title,
  subtitle,
  children,
  footer,
  onBack,
  backLabel = 'Назад',
}: WizardLayoutProps) {
  return (
    <div className="space-y-5">
      <div>
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-3 self-start !px-0 text-left text-sm font-semibold sm:mb-4"
          >
            ← {backLabel}
          </Button>
        )}
        <div className="flex items-center justify-center gap-2 mb-5">
          {STEP_LABELS.map((label, index) => {
            const num = index + 1;
            const active = num === step;
            const done = num < step;
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={[
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border',
                    done
                      ? 'bg-sh-forest text-white border-sh-forest'
                      : active
                        ? 'bg-sh-forest text-white border-sh-forest'
                        : 'bg-white text-sh-muted border-sh-border',
                  ].join(' ')}
                >
                  {done ? '✓' : num}
                </div>
                <span className={`hidden sm:inline text-xs font-semibold ${done || active ? 'text-sh-forest' : 'text-sh-muted'}`}>
                  {label}
                </span>
                {index < STEP_LABELS.length - 1 && (
                  <span className={`hidden sm:block w-12 h-px ${done ? 'bg-sh-forest' : 'bg-sh-border'}`} />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-sh-muted font-semibold">Шаг {step} из 3</p>
        <h1 className="text-xl md:text-2xl font-bold text-sh-foreground mt-1 leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-sh-muted mt-2 leading-relaxed">{subtitle}</p>}
      </div>

      <div>{children}</div>

      {footer && <div className="sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 sm:pt-3 sm:pb-0 bg-white/95 border-t border-sh-border sm:static sm:bg-transparent">{footer}</div>}
    </div>
  );
}
