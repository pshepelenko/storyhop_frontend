import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ReactNode } from 'react';
import { imageAssets } from '@/data/image-assets';
import { getNavCopy } from '@/lib/nav-copy';
import { useUiLanguage } from '@/lib/use-ui-language';
import {
  IconHome,
  IconLibrary,
  IconParent,
  IconSettings,
} from '../icons/NavIcons';
import Logo from '../logo';
import DesktopSplitLayout, { splitDesktopPanelClass } from './DesktopSplitLayout';
import AuthControls from '../auth/AuthControls';

type AppShellProps = {
  children: ReactNode;
  crystalBalance?: number | null;
  showBottomNav?: boolean;
  hasSeasons?: boolean;
  emptyHomeLayout?: boolean;
  maxWidth?: 'default' | 'wide' | 'full';
  headerRight?: ReactNode;
  hideHeader?: boolean;
  showSideNav?: boolean;
  desktopBottomNav?: boolean;
  parentLabel?: string | null;
  plainBackground?: boolean;
  /** Keeps child-facing reading chrome focused on the story on narrow screens. */
  hideMobileAuthControls?: boolean;
  /** White framed shell on cool gray canvas (returning home desktop mockup) */
  shellVariant?: 'default' | 'framed';
};

const NAV_ITEMS = [
  { href: '/', key: 'home' as const, Icon: IconHome },
  { href: '/library', key: 'library' as const, Icon: IconLibrary },
  { href: '/parent-space', key: 'parent' as const, Icon: IconParent },
  { href: '/settings', key: 'settings' as const, Icon: IconSettings },
];

export default function AppShell({
  children,
  crystalBalance,
  showBottomNav = false,
  hasSeasons = false,
  emptyHomeLayout = false,
  maxWidth = 'default',
  headerRight,
  hideHeader = false,
  showSideNav = false,
  desktopBottomNav = false,
  plainBackground = false,
  hideMobileAuthControls = false,
  shellVariant = 'default',
}: AppShellProps) {
  const router = useRouter();
  const framed = shellVariant === 'framed';
  const lang = useUiLanguage();

  const navCopy = getNavCopy(lang);

  const widthClass =
    maxWidth === 'wide' ? 'max-w-[var(--sh-max-width-wide)]' :
    maxWidth === 'full' ? 'max-w-[var(--sh-max-width-home)]' :
    'max-w-[var(--sh-max-width)]';

  const isActive = (href: string, matchPrefix = true) => {
    if (href === '/') return router.pathname === '/';
    if (!matchPrefix) return false;
    // Storybook moments live under Library navigation.
    if (href === '/library') {
      return (
        router.pathname.startsWith('/library') ||
        router.pathname === '/seasons/[id]/storybook'
      );
    }
    return router.pathname.startsWith(href);
  };

  const splitDesktop = hasSeasons;
  const showNav = showBottomNav && hasSeasons;
  const mainPb = showNav
    ? `max-lg:pb-24 ${splitDesktop || !desktopBottomNav ? 'lg:pb-5' : 'lg:pb-28'}`
    : emptyHomeLayout
      ? 'pb-6'
      : splitDesktop
        ? 'pb-6 lg:pb-5'
        : 'pb-6';

  const headerPillH = splitDesktop ? 'h-[var(--sh-pill-h)] lg:h-[31px]' : 'h-[var(--sh-pill-h)]';

  const headerPills = (
    <div className={`ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2 sm:shrink-0 sm:gap-2.5 max-sm:w-full max-sm:justify-between ${splitDesktop ? '[&_label]:lg:min-h-[31px] [&_label]:lg:py-1' : ''}`}>
      {hasSeasons && crystalBalance != null && (
        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold text-sh-forest bg-sh-forest-soft border border-sh-forest/20 rounded-full px-3 ${headerPillH}`}>
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 3 4 9l8 12 8-12-8-6Z" />
          </svg>
          {crystalBalance}
        </span>
      )}
      {headerRight}
      <div className={hideMobileAuthControls ? 'hidden md:block' : undefined}>
        <AuthControls />
      </div>
      {!desktopBottomNav && !framed && !emptyHomeLayout && (
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
      className={`z-20 bg-white shrink-0 ${
        framed
          ? `border-b border-sh-border px-5 sm:px-6 ${splitDesktop ? 'py-3 lg:py-2' : 'py-3'}`
          : emptyHomeLayout
            ? 'border-b border-sh-border/50'
            : `border-b border-sh-border/80 shadow-[var(--sh-shadow)] ${splitDesktop ? 'lg:static lg:shadow-none lg:py-2' : 'sticky top-0'}`
      }`}
    >
      <div
        className={`${
          framed
            ? 'flex'
            : emptyHomeLayout
              ? 'w-full max-w-[min(1360px,100%)] mx-auto px-4 sm:px-5'
              : `${widthClass} mx-auto px-4 sm:px-6`
        } flex flex-wrap items-center gap-3 w-full sm:flex-nowrap ${emptyHomeLayout ? 'py-3' : 'py-0'} ${
          emptyHomeLayout ? 'justify-between' : splitDesktop ? 'lg:justify-end' : 'justify-between'
        }`}
      >
        <Link
          href="/"
          className={`flex items-center gap-2 shrink-0 ${splitDesktop && !emptyHomeLayout ? 'lg:hidden' : ''}`}
        >
          <Logo />
        </Link>
        {headerPills}
      </div>
    </header>
  );

  const main = (
    <main
      className={`flex-1 w-full ${
        framed
          ? `px-5 sm:px-6 ${splitDesktop ? 'py-5 lg:py-3' : 'py-5'}`
          : emptyHomeLayout
            ? 'w-full max-w-[min(1360px,100%)] mx-auto px-4 sm:px-5 pt-5 pb-8 min-w-0'
            : `${widthClass} mx-auto px-4 sm:px-6 ${splitDesktop ? 'py-5 lg:py-3' : 'py-5'}`
      } ${emptyHomeLayout ? '' : mainPb}`}
    >
      {children}
    </main>
  );

  const bottomNavItems = NAV_ITEMS.map(({ href, key, Icon }) => ({
    href,
    label: navCopy[key],
    Icon,
  }));

  const bottomNav = showNav && (
    <BottomNav
      items={bottomNavItems}
      isActive={isActive}
      desktopVisible={desktopBottomNav && !splitDesktop}
      shellMaxWidth={framed && splitDesktop ? 'framed' : maxWidth}
    />
  );

  const wrapSplit = (content: ReactNode) =>
    splitDesktop ? (
      <DesktopSplitLayout
        isActive={(href) => isActive(href)}
        plainMobileBackground={framed}
        showHelpButton
      >
        {content}
      </DesktopSplitLayout>
    ) : (
      content
    );

  if (framed) {
    return wrapSplit(
      <div className={`relative min-h-screen text-sh-foreground font-[family-name:var(--font-geist-sans)] flex flex-col w-full max-lg:bg-[var(--sh-page-bg)] max-lg:pt-3 max-lg:pb-0 ${splitDesktop ? 'lg:bg-transparent lg:p-0 lg:min-h-0' : 'lg:bg-[var(--sh-page-bg)] lg:p-6'}`}>
        <div
          className={`relative z-10 flex flex-col min-w-0 w-full bg-white ${
            splitDesktop
              ? `${splitDesktopPanelClass(true)} max-lg:max-w-lg max-lg:mx-auto max-lg:rounded-[24px] max-lg:border max-lg:border-sh-border max-lg:shadow-[var(--sh-shadow-shell)] max-lg:overflow-hidden max-lg:min-h-0 max-lg:flex-1`
              : 'flex-1 lg:mx-auto lg:max-w-[var(--sh-shell-max)] lg:rounded-[var(--sh-radius-shell)] lg:border lg:border-sh-border lg:shadow-[var(--sh-shadow-shell)] lg:min-h-[calc(100vh-3rem)] lg:overflow-hidden'
          }`}
        >
          {header}
          {main}
        </div>
        {bottomNav}
      </div>,
    );
  }

  return wrapSplit(
    <div className={`min-h-screen text-sh-foreground font-[family-name:var(--font-geist-sans)] flex flex-col w-full max-w-full overflow-x-hidden relative ${emptyHomeLayout ? 'bg-white' : 'bg-sh-background'} ${splitDesktop ? 'lg:bg-transparent lg:min-h-0' : ''}`}>
      {!plainBackground && !splitDesktop && !emptyHomeLayout && (
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
            {NAV_ITEMS.map(({ href, key, Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-sh px-3 py-2 text-sm min-h-[var(--sh-tap-min)] ${
                  isActive(href) ? 'bg-sh-forest-soft text-sh-forest font-semibold' : 'text-sh-muted hover:bg-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {navCopy[key]}
              </Link>
            ))}
          </aside>
        )}

        <div className={`flex flex-col min-w-0 w-full ${splitDesktop ? `${splitDesktopPanelClass(true)} lg:bg-white` : 'flex-1'}`}>
          {header}
          {main}
        </div>
      </div>

      {bottomNav}
    </div>,
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
  shellMaxWidth = 'default',
}: {
  items: NavItem[];
  isActive: (href: string, matchPrefix?: boolean) => boolean;
  desktopVisible: boolean;
  shellMaxWidth?: 'default' | 'wide' | 'full' | 'framed';
}) {
  const widthClass =
    shellMaxWidth === 'framed'
      ? 'max-w-lg'
      : shellMaxWidth === 'wide'
        ? 'max-w-[var(--sh-max-width-wide)]'
        : shellMaxWidth === 'full'
          ? 'max-w-[var(--sh-max-width-home)]'
          : 'max-w-[var(--sh-max-width)]';

  const nav = (
    <div className={`${widthClass} mx-auto flex justify-around px-1 w-full`}>
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

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-sh-border/80 safe-area-pb shadow-[0_-2px_12px_rgba(15,23,42,0.06)] px-2 py-1 ${
        desktopVisible ? '' : 'lg:hidden'
      }`}
    >
      {nav}
    </nav>
  );
}
