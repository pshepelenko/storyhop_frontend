import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ReactNode } from 'react';
import { imageAssets } from '@/data/image-assets';
import {
  IconHome,
  IconLibrary,
  IconParent,
  IconProfile,
  IconProgress,
  IconSettings,
} from '../icons/NavIcons';
import Logo from '../logo';

type AppShellProps = {
  children: ReactNode;
  crystalBalance?: number | null;
  showBottomNav?: boolean;
  hasSeasons?: boolean;
  maxWidth?: 'default' | 'wide' | 'full';
  headerRight?: ReactNode;
  hideHeader?: boolean;
  showSideNav?: boolean;
  desktopBottomNav?: boolean;
  parentLabel?: string | null;
  plainBackground?: boolean;
  /** White framed shell on cool gray canvas (returning home desktop mockup) */
  shellVariant?: 'default' | 'framed';
};

const NAV_ITEMS_DEFAULT = [
  { href: '/', label: 'Home', Icon: IconHome },
  { href: '/library', label: 'Library', Icon: IconLibrary },
  { href: '/parent-space', label: 'Parent', Icon: IconParent },
  { href: '/settings', label: 'Settings', Icon: IconSettings },
];

const NAV_ITEMS_FRAMED = [
  { href: '/', label: 'Home', Icon: IconHome },
  { href: '/library', label: 'Library', Icon: IconLibrary },
  { href: '/parent-space', label: 'Progress', Icon: IconProgress },
  { href: '/settings', label: 'Profile', Icon: IconProfile, matchPrefix: false },
  { href: '/settings', label: 'Settings', Icon: IconSettings, matchPrefix: true },
];

export default function AppShell({
  children,
  crystalBalance,
  showBottomNav = false,
  hasSeasons = false,
  maxWidth = 'default',
  headerRight,
  hideHeader = false,
  showSideNav = false,
  desktopBottomNav = false,
  parentLabel,
  plainBackground = false,
  shellVariant = 'default',
}: AppShellProps) {
  const router = useRouter();
  const framed = shellVariant === 'framed';

  const widthClass =
    maxWidth === 'wide' ? 'max-w-[var(--sh-max-width-wide)]' :
    maxWidth === 'full' ? 'max-w-[var(--sh-max-width-home)]' :
    'max-w-[var(--sh-max-width)]';

  const isActive = (href: string, matchPrefix = true) => {
    if (href === '/') return router.pathname === '/';
    if (!matchPrefix) return false;
    return router.pathname.startsWith(href);
  };

  const showNav = showBottomNav && hasSeasons;
  const mainPb = showNav && !framed ? (desktopBottomNav ? 'pb-28' : 'pb-24') : framed ? 'pb-24 lg:pb-5' : 'pb-6';

  const headerPills = (
    <div className="flex items-center gap-2 sm:gap-2.5 ml-auto shrink-0">
      {hasSeasons && crystalBalance != null && (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-sh-forest bg-sh-forest-soft border border-sh-forest/20 rounded-full px-3 h-[var(--sh-pill-h)]">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 3 4 9l8 12 8-12-8-6Z" />
          </svg>
          {crystalBalance}
        </span>
      )}
      {headerRight}
      {hasSeasons && parentLabel && (
        <div className="hidden md:flex items-center gap-2 h-[var(--sh-pill-h)] rounded-full border border-sh-border bg-white px-2.5 max-w-[200px]">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-sh-forest/30 shrink-0">
            <Image
              src={imageAssets.home.hero}
              alt=""
              fill
              className="object-cover object-top"
              sizes="28px"
            />
          </div>
          <span className="text-sm font-medium text-sh-foreground truncate">{parentLabel}</span>
        </div>
      )}
      {!desktopBottomNav && !framed && (
        <Link
          href="/settings"
          className="min-h-[var(--sh-tap-min)] min-w-[var(--sh-tap-min)] flex items-center justify-center rounded-[var(--sh-radius)] border border-sh-border text-sh-forest md:hidden"
          aria-label="Settings"
        >
          <IconSettings />
        </Link>
      )}
    </div>
  );

  const header = !hideHeader && (
    <header
      className={`z-20 bg-white ${
        framed ? 'border-b border-sh-border px-5 sm:px-6 py-3' : 'sticky top-0 border-b border-sh-border/80 shadow-[var(--sh-shadow)]'
      }`}
    >
      <div
        className={`${framed ? 'flex' : `${widthClass} mx-auto px-4 sm:px-6`} items-center justify-between gap-3 w-full py-0`}
      >
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo />
        </Link>
        {headerPills}
      </div>
    </header>
  );

  const main = (
    <main className={`flex-1 w-full ${framed ? 'px-5 sm:px-6 py-5' : `${widthClass} mx-auto px-4 sm:px-6 py-5`} ${mainPb}`}>
      {children}
    </main>
  );

  const bottomNav = showNav && (
    <BottomNav
      items={NAV_ITEMS_FRAMED}
      isActive={isActive}
      desktopVisible={desktopBottomNav}
      insideShell
    />
  );

  if (framed) {
    return (
      <div className="min-h-screen text-sh-foreground font-[family-name:var(--font-geist-sans)] flex flex-col w-full bg-sh-background lg:bg-[var(--sh-page-bg)] lg:p-6">
        <div className="flex flex-col flex-1 min-w-0 w-full lg:mx-auto lg:max-w-[var(--sh-shell-max)] lg:bg-white lg:rounded-[var(--sh-radius-shell)] lg:border lg:border-sh-border lg:shadow-[var(--sh-shadow-shell)] lg:min-h-[calc(100vh-3rem)] lg:overflow-hidden">
          {header}
          {main}
          <div className="hidden lg:block">{bottomNav}</div>
        </div>
        {showNav && (
          <BottomNav items={NAV_ITEMS_DEFAULT} isActive={isActive} desktopVisible={false} insideShell={false} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-sh-foreground font-[family-name:var(--font-geist-sans)] flex flex-col w-full relative bg-sh-background">
      {!plainBackground && (
        <div className="pointer-events-none fixed inset-0 -z-10">
          <Image
            src={imageAssets.backgrounds.mobile}
            alt=""
            fill
            className="object-cover lg:hidden opacity-20"
            priority
          />
          <Image
            src={imageAssets.backgrounds.page}
            alt=""
            fill
            className="object-cover hidden lg:block opacity-15"
            priority
          />
        </div>
      )}

      <div className={`flex flex-1 w-full ${showSideNav && hasSeasons ? 'lg:max-w-6xl lg:mx-auto' : ''}`}>
        {showSideNav && hasSeasons && (
          <aside className="hidden lg:flex flex-col w-52 shrink-0 border-r border-sh-border bg-white/80 backdrop-blur p-4 gap-1">
            <Link href="/" className="mb-4 px-2">
              <Logo />
            </Link>
            {NAV_ITEMS_DEFAULT.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-sh px-3 py-2 text-sm min-h-[var(--sh-tap-min)] ${
                  isActive(href) ? 'bg-sh-forest-soft text-sh-forest font-semibold' : 'text-sh-muted hover:bg-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </aside>
        )}

        <div className="flex flex-col flex-1 min-w-0 w-full">
          {header}
          {main}
        </div>
      </div>

      {showNav && !framed && (
        <BottomNav items={NAV_ITEMS_DEFAULT} isActive={isActive} desktopVisible={desktopBottomNav} insideShell={false} />
      )}
    </div>
  );
}

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  matchPrefix?: boolean;
};

function BottomNav({
  items,
  isActive,
  desktopVisible,
  insideShell,
}: {
  items: NavItem[];
  isActive: (href: string, matchPrefix?: boolean) => boolean;
  desktopVisible: boolean;
  insideShell?: boolean;
}) {
  const nav = (
    <div className={`${insideShell ? '' : 'max-w-[var(--sh-max-width-home)] mx-auto'} flex justify-around px-1`}>
      {items.map(({ href, label, Icon, matchPrefix }) => {
        const active = isActive(href, matchPrefix !== false);
        return (
          <Link
            key={`${href}-${label}`}
            href={href}
            className={`flex flex-col items-center justify-center min-h-[56px] min-w-0 flex-1 text-[10px] gap-0.5 rounded-[var(--sh-radius-sm)] mx-0.5 px-1 ${
              active
                ? 'text-sh-forest font-semibold bg-sh-forest-soft/60'
                : 'text-sh-muted hover:text-sh-forest'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="truncate max-w-full">{label}</span>
          </Link>
        );
      })}
    </div>
  );

  if (insideShell) {
    return (
      <nav className="border-t border-sh-border bg-white safe-area-pb shrink-0 px-2 py-1">
        {nav}
      </nav>
    );
  }

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-sh-border/80 safe-area-pb shadow-[0_-2px_12px_rgba(15,23,42,0.06)] ${
        desktopVisible ? '' : 'lg:hidden'
      }`}
    >
      {nav}
    </nav>
  );
}
