export function getApiBaseUrl(): string {
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
