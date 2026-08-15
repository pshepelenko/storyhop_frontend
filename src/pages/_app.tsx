import '../app/globals.css';
import type { AppProps } from 'next/app';
import AppRootShell from '../app/AppRootShell';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiFetch, ensureGuestSession } from '@/lib/api-client';
import {
  capturePageView,
  identifyAnalyticsUser,
  initAnalytics,
  normalizeAnalyticsRoute,
} from '@/lib/analytics';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    initAnalytics();
    const trackPage = (url: string) => capturePageView(normalizeAnalyticsRoute(url));
    trackPage(window.location.pathname);
    router.events.on('routeChangeComplete', trackPage);

    void ensureGuestSession()
      .then(() => apiFetch('/auth/me'))
      .then((response) => (response.ok ? response.json() : null))
      .then((identity) => identifyAnalyticsUser(identity?.analyticsId, identity?.accountType))
      .catch(() => undefined);

    return () => router.events.off('routeChangeComplete', trackPage);
  }, [router.events]);

  return (
    <AppRootShell>
      <Component {...pageProps} />
    </AppRootShell>
  );
}

export default MyApp;
