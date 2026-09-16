import { getApiBaseUrl, getConfiguredApiBaseUrl } from './api-base-url';
import { captureAnalyticsEvent, normalizeAnalyticsRoute } from './analytics';

let guestSessionPromise: Promise<void> | null = null;
const apiBase = getApiBaseUrl().replace(/\/$/, '');
const configuredApiBase = getConfiguredApiBaseUrl().replace(/\/$/, '');
const nativeFetch = typeof window === 'undefined' ? null : window.fetch.bind(window);
const GUEST_SESSION_TIMEOUT_MS = 8_000;

function isApiRequest(url: string): boolean {
  return url.startsWith(apiBase) || url.startsWith(configuredApiBase);
}

function toSameOriginApiInput(input: RequestInfo | URL, url: string): RequestInfo | URL {
  if (!url.startsWith(configuredApiBase) || apiBase === configuredApiBase) return input;
  return `${apiBase}${url.slice(configuredApiBase.length)}`;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type') && !(typeof FormData !== 'undefined' && init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await (nativeFetch || fetch)(`${apiBase}${path}`, {
    ...init,
    headers,
    credentials: 'include',
    // API reads are user/session-specific. Reusing a cached 304 response can leave
    // a newly restored guest session with another identity's home summary.
    cache: init.cache ?? 'no-store',
  });
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
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), GUEST_SESSION_TIMEOUT_MS);
    const pending = apiFetch('/auth/guest', { method: 'POST', signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Guest session request failed (${response.status})`);
      })
      .finally(() => window.clearTimeout(timeout));

    guestSessionPromise = pending;
    void pending.catch(() => {
      if (guestSessionPromise === pending) guestSessionPromise = null;
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
    if (!isApiRequest(url)) return nativeFetch(input, init);
    const sameOriginInput = toSameOriginApiInput(input, url);
    if (url.includes('/auth/')) return nativeFetch(sameOriginInput, init);
    return ensureGuestSession().then(() => nativeFetch(sameOriginInput, {
      ...init,
      credentials: 'include',
      cache: init?.cache ?? 'no-store',
    })).then((response) => {
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
