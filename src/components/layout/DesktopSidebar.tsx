import Link from 'next/link';
import Image from 'next/image';
import Logo from '../logo';
import { imageAssets } from '@/data/image-assets';
import { getNavCopy } from '@/lib/nav-copy';
import { useUiLanguage } from '@/lib/use-ui-language';
import {
  IconHome,
  IconLibrary,
  IconParent,
  IconSettings,
} from '../icons/NavIcons';

const NAV_ITEMS = [
  { href: '/', key: 'home' as const, Icon: IconHome },
  { href: '/library', key: 'library' as const, Icon: IconLibrary },
  { href: '/parent-space', key: 'parent' as const, Icon: IconParent },
  { href: '/settings', key: 'settings' as const, Icon: IconSettings },
];

type DesktopSidebarProps = {
  isActive: (href: string) => boolean;
  showHelpButton?: boolean;
};

export default function DesktopSidebar({ isActive, showHelpButton = true }: DesktopSidebarProps) {
  const lang = useUiLanguage();
  const navCopy = getNavCopy(lang);

  return (
    <aside className="hidden lg:flex flex-col w-[252px] shrink-0 border-r border-sh-border/80 min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-white" />
        <div className="absolute inset-x-0 bottom-0 h-1/2">
          <Image
            src={imageAssets.backgrounds.sidebarLandscapeCropped}
            alt=""
            fill
            className="object-cover object-bottom"
            sizes="252px"
            priority
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-col px-4 pt-6 pb-3 flex-1">
        <Link href="/" className="px-1 shrink-0">
          <Logo />
        </Link>

        <nav className="mt-8 flex flex-col gap-0.5" aria-label="Main navigation">
          {NAV_ITEMS.map(({ href, key, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] min-h-[44px] transition-colors ${
                  active
                    ? 'bg-sh-forest-soft text-sh-forest font-semibold'
                    : 'text-sh-muted font-medium hover:bg-white/60 hover:text-sh-foreground'
                }`}
              >
                <Icon
                  className={`w-[22px] h-[22px] shrink-0 ${active ? 'text-sh-forest' : 'text-sh-muted'}`}
                  filled={active}
                />
                {navCopy[key]}
              </Link>
            );
          })}
        </nav>
      </div>

      {showHelpButton && (
        <div className="relative z-10 mt-auto px-4 pb-5 pt-2">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-sh-border bg-white/90 backdrop-blur-sm px-3 py-2.5 text-sm font-medium text-sh-foreground shadow-[var(--sh-shadow)] hover:bg-white transition-colors"
          >
            <IconHelp className="w-[18px] h-[18px] text-sh-muted shrink-0" />
            Help &amp; support
          </button>
        </div>
      )}
    </aside>
  );
}

function IconHelp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.25a2.75 2.75 0 1 1 4.83 1.68c-.93.8-1.33 1.32-1.33 2.32V15" strokeLinecap="round" />
      <circle cx="12" cy="18" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}
