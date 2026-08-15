import Image from 'next/image';
import { ReactNode } from 'react';
import { imageAssets } from '@/data/image-assets';
import DesktopSidebar from './DesktopSidebar';

type DesktopSplitLayoutProps = {
  children: ReactNode;
  isActive: (href: string) => boolean;
  plainMobileBackground?: boolean;
  showHelpButton?: boolean;
};

/** Desktop: landscape in sidebar only; main column stays white. */
export default function DesktopSplitLayout({
  children,
  isActive,
  plainMobileBackground = false,
  showHelpButton = true,
}: DesktopSplitLayoutProps) {
  return (
    <div className="relative min-h-screen flex w-full text-sh-foreground font-[family-name:var(--font-geist-sans)]">
      {plainMobileBackground ? (
        <div className="pointer-events-none fixed inset-0 z-0 lg:hidden bg-[var(--sh-page-bg)]" />
      ) : (
        <div className="pointer-events-none fixed inset-0 z-0 lg:hidden">
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white" />
          <div className="absolute inset-x-0 bottom-0 h-1/2">
            <Image
              src={imageAssets.backgrounds.mobile}
              alt=""
              fill
              className="object-cover object-bottom"
              priority
            />
          </div>
        </div>
      )}

      <DesktopSidebar isActive={isActive} showHelpButton={showHelpButton} />

      <div className="relative z-10 flex-1 min-w-0 flex flex-col items-stretch min-h-screen lg:bg-white">
        {children}
      </div>
    </div>
  );
}

/** White content panel: full width of the right column, flush to top (desktop split only). */
export function splitDesktopPanelClass(active: boolean) {
  return active
    ? 'lg:w-full lg:max-w-none lg:mx-0 lg:min-h-0 lg:rounded-none lg:border-0 lg:border-b lg:border-sh-border lg:shadow-[var(--sh-shadow-shell)] lg:flex lg:flex-col'
    : '';
}
