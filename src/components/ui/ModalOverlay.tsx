import { useEffect, useState, type HTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { pauseActiveMedia } from '@/lib/media-control';

type ModalOverlayProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  position?: 'fixed' | 'absolute';
  pauseMediaOnOpen?: boolean;
};

export default function ModalOverlay({
  children,
  className = '',
  position = 'fixed',
  pauseMediaOnOpen = position === 'fixed',
  ...props
}: ModalOverlayProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (position === 'fixed') {
      setPortalTarget(document.body);
    }
  }, [position]);

  useEffect(() => {
    if (pauseMediaOnOpen) pauseActiveMedia();
  }, [pauseMediaOnOpen]);

  const overlay = (
    <div
      {...props}
      className={`${position} inset-0 z-[100] flex bg-[rgba(71,85,105,0.48)] px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 backdrop-blur-[2px] ${className}`}
    >
      {children}
    </div>
  );

  if (position === 'absolute') {
    return overlay;
  }

  return portalTarget ? createPortal(overlay, portalTarget) : null;
}
