import { ReactNode } from 'react';

const STEP_LABELS = ['Child', 'Story', 'Hero', 'Review'];

type WizardLayoutProps = {
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function WizardLayout({ step, title, subtitle, children, footer }: WizardLayoutProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex gap-1 mb-4">
          {STEP_LABELS.map((label, index) => {
            const num = index + 1;
            const active = num === step;
            const done = num < step;
            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={[
                    'w-full h-1.5 rounded-full',
                    done || active ? 'bg-sh-green' : 'bg-slate-200',
                  ].join(' ')}
                />
                <span className={`text-[10px] font-medium ${active ? 'text-sh-green' : 'text-sh-muted'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-sh-muted font-medium">Step {step} of 4</p>
        <h1 className="text-xl font-bold text-sh-foreground mt-1">{title}</h1>
        {subtitle && <p className="text-sm text-sh-muted mt-1">{subtitle}</p>}
      </div>

      <div>{children}</div>

      {footer && <div className="pt-2 border-t border-sh-border">{footer}</div>}
    </div>
  );
}
