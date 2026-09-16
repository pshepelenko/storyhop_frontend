export function getConfiguredApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (hostname) {
      return `${protocol}//${hostname}:3000`;
    }
  }

  return 'http://localhost:3000';
}

/**
 * Browser API requests stay same-origin. This makes the HttpOnly session cookie
 * first-party in Safari while Next forwards the request to the API service.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') return '/api';
  return getConfiguredApiBaseUrl();
}
