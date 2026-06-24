import Image from 'next/image';
import { imageAssets } from '@/data/image-assets';
import Button from '../ui/Button';

type LockedIllustrationPanelProps = {
  title: string;
  message: string;
  variant?: 'locked' | 'crystals';
  crystalBalance?: number;
  crystalCost?: number;
  primaryAction?: { label: string; href?: string; onClick?: () => void };
};

export default function LockedIllustrationPanel({
  title,
  message,
  variant = 'locked',
  crystalBalance,
  crystalCost,
  primaryAction,
}: LockedIllustrationPanelProps) {
  const src = variant === 'crystals' ? imageAssets.states.notEnoughCrystals : imageAssets.states.lockedStory;

  return (
    <div className="text-center space-y-4 py-6">
      <div className="relative w-full max-w-xs mx-auto aspect-square rounded-sh overflow-hidden">
        <Image src={src} alt="" fill className="object-cover" sizes="320px" />
      </div>
      <h2 className="text-xl font-bold font-story">{title}</h2>
      <p className="text-sm text-sh-muted max-w-sm mx-auto">{message}</p>
      {variant === 'crystals' && crystalBalance != null && crystalCost != null && (
        <p className="text-sm">
          Balance: <strong>{crystalBalance}</strong> · Need: <strong>{crystalCost}</strong>
        </p>
      )}
      {primaryAction && (
        primaryAction.href ? (
          <Button href={primaryAction.href}>{primaryAction.label}</Button>
        ) : (
          <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
        )
      )}
    </div>
  );
}
