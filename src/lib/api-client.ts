import { getApiBaseUrl } from './api-base-url';
import { captureAnalyticsEvent, normalizeAnalyticsRoute } from './analytics';

let guestSessionPromise: Promise<void> | null = null;
const apiBase = getApiBaseUrl().replace(/\/$/, '');
const nativeFetch = typeof window === 'undefined' ? null : window.fetch.bind(window);

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await (nativeFetch || fetch)(`${apiBase}${path}`, { ...init, headers, credentials: 'include' });
  if (!response.ok) {
    captureAnalyticsEvent('api_request_failed', {
      route: normalizeAnalyticsRoute(path),
      method: init.method || 'GET',
      status: response.status,
    });
  }
  return response;
}

/** Creates one anonymous identity per browser. The opaque cookie, not localStorage, owns identity. */
export async function ensureGuestSession(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!guestSessionPromise) {
    guestSessionPromise = apiFetch('/auth/guest', { method: 'POST' }).then((response) => {
      if (!response.ok) throw new Error(`Guest session request failed (${response.status})`);
    }).catch((error) => {
      guestSessionPromise = null;
      throw error;
    });
  }
  return guestSessionPromise;
}

export async function apiFetchAsGuest(path: string, init: RequestInit = {}): Promise<Response> {
  await ensureGuestSession();
  return apiFetch(path, init);
}

// Active pages still contain a few direct fetch calls. Keep the security migration
// atomic while those callers are converted: same API requests always carry the
// HttpOnly session and establish one guest session before their first call.
if (typeof window !== 'undefined' && nativeFetch) {
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if (!url.startsWith(apiBase) || url.includes('/auth/')) return nativeFetch(input, init);
    return ensureGuestSession().then(() => nativeFetch(input, { ...init, credentials: 'include' })).then((response) => {
      if (!response.ok) {
        captureAnalyticsEvent('api_request_failed', {
          route: normalizeAnalyticsRoute(url.replace(apiBase, '')),
          method: init?.method || 'GET',
          status: response.status,
        });
      }
      return response;
    });
  }) as typeof window.fetch;
}
