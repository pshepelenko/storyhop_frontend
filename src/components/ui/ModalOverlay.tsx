import type { HTMLAttributes, ReactNode } from 'react';

type ModalOverlayProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  position?: 'fixed' | 'absolute';
};

export default function ModalOverlay({ children, className = '', position = 'fixed', ...props }: ModalOverlayProps) {
  return (
    <div
      {...props}
      className={`${position} inset-0 z-50 flex bg-[rgba(71,85,105,0.48)] px-4 py-6 backdrop-blur-[2px] ${className}`}
    >
      {children}
    </div>
  );
}
