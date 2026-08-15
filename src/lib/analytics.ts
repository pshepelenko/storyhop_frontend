import posthog from 'posthog-js';

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

let initialized = false;

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || '';
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

const blockedAnalyticsProperties = new Set([
  'email',
  'name',
  'child_name',
  'hero_name',
  'text',
  'story_text',
  'chapter_text',
  'answer',
  'phrase',
  'transcript',
  'request_body',
  'response_body',
]);

function sanitizeAnalyticsUrl(value: unknown) {
  if (typeof value !== 'string') return value;
  try {
    const url = new URL(value, window.location.origin);
    return normalizeAnalyticsRoute(url.pathname);
  } catch {
    return normalizeAnalyticsRoute(value);
  }
}

function sanitizeAnalyticsCapture<T extends { properties?: Record<string, unknown> } | null>(capture: T): T {
  if (!capture?.properties) return capture;
  const properties = { ...capture.properties };
  for (const key of Object.keys(properties)) {
    if (blockedAnalyticsProperties.has(key.toLowerCase())) delete properties[key];
  }
  for (const key of ['$current_url', '$pathname', '$referrer', '$referring_domain']) {
    if (key in properties) properties[key] = sanitizeAnalyticsUrl(properties[key]);
  }
  return { ...capture, properties };
}

export function initAnalytics() {
  if (typeof window === 'undefined' || initialized || !projectToken) return false;

  posthog.init(projectToken, {
    api_host: apiHost,
    defaults: '2026-05-30',
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: {
      dom_event_allowlist: ['click', 'submit'],
      element_allowlist: ['a', 'button', 'form'],
    },
    mask_all_text: true,
    mask_personal_data_properties: true,
    before_send: sanitizeAnalyticsCapture,
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
    person_profiles: 'identified_only',
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '*',
      maskCapturedNetworkRequestFn: (request) => {
        if (request.name) request.name = request.name.split('?')[0];
        return request;
      },
    },
  });
  posthog.register({ app: 'storyhop', environment: process.env.NODE_ENV || 'unknown' });
  initialized = true;
  return true;
}

export function captureAnalyticsEvent(event: string, properties: AnalyticsProperties = {}) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function capturePageView(route: string) {
  captureAnalyticsEvent('$pageview', { route });
}

export function identifyAnalyticsUser(analyticsId?: string | null, accountType?: string | null) {
  if (!initialized || !analyticsId) return;
  posthog.identify(analyticsId, { account_type: accountType || 'guest' });
}

export function resetAnalyticsUser() {
  if (!initialized) return;
  posthog.reset();
}

export function normalizeAnalyticsRoute(input: string) {
  const withoutQuery = input.split('?')[0];
  return withoutQuery
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, ':id')
    .replace(/\/\d+(?=\/|$)/g, '/:number');
}
