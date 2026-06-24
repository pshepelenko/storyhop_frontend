import Image from 'next/image';
import { ReactNode } from 'react';
import { imageAssets } from '@/data/image-assets';
import Button from '../ui/Button';

type ParentStatePanelProps = {
  variant: 'generating' | 'first-ready' | 'no-activity' | 'locked' | 'error';
  title: string;
  message: string;
  imageSrc?: string;
  steps?: { label: string; status: 'done' | 'active' | 'pending' }[];
  primaryAction?: { label: string; onClick?: () => void; href?: string };
  secondaryAction?: { label: string; onClick?: () => void; href?: string };
  children?: ReactNode;
};

const VARIANT_IMAGES: Record<ParentStatePanelProps['variant'], string> = {
  generating: imageAssets.states.generationLoading,
  'first-ready': imageAssets.states.seasonReady,
  'no-activity': imageAssets.states.parentNoActivity,
  locked: imageAssets.states.lockedStory,
  error: imageAssets.states.friendlyError,
};

export default function ParentStatePanel({
  variant,
  title,
  message,
  imageSrc,
  steps,
  primaryAction,
  secondaryAction,
  children,
}: ParentStatePanelProps) {
  const src = imageSrc ?? VARIANT_IMAGES[variant];

  return (
    <div className="text-center space-y-4 py-6">
      <div className="relative w-full max-w-sm mx-auto aspect-[4/3] rounded-sh overflow-hidden">
        <Image src={src} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, 384px" />
      </div>
      <h2 className="text-xl font-bold text-sh-foreground font-story">{title}</h2>
      <p className="text-sm text-sh-muted max-w-sm mx-auto">{message}</p>

      {steps && steps.length > 0 && (
        <ul className="text-left max-w-xs mx-auto space-y-2 mt-4">
          {steps.map((step) => (
            <li key={step.label} className="flex items-center gap-2 text-sm">
              <span className={step.status === 'done' ? 'text-sh-forest' : 'text-sh-muted'}>
                {step.status === 'done' ? '✓' : step.status === 'active' ? '…' : '○'}
              </span>
              <span className={step.status === 'active' ? 'font-semibold' : 'text-sh-muted'}>
                {step.label}
              </span>
            </li>
          ))}
        </ul>
      )}

      {children}

      <div className="flex flex-col gap-2 max-w-xs mx-auto pt-2">
        {primaryAction && (
          primaryAction.href ? (
            <Button href={primaryAction.href} fullWidth>{primaryAction.label}</Button>
          ) : (
            <Button onClick={primaryAction.onClick} fullWidth>{primaryAction.label}</Button>
          )
        )}
        {secondaryAction && (
          secondaryAction.href ? (
            <Button href={secondaryAction.href} variant="secondary" fullWidth>
              {secondaryAction.label}
            </Button>
          ) : (
            <Button onClick={secondaryAction.onClick} variant="secondary" fullWidth>
              {secondaryAction.label}
            </Button>
          )
        )}
      </div>
    </div>
  );
}
