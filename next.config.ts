import type { NextConfig } from 'next';

function getStorageProxyRemotePatterns() {
  const patterns: NonNullable<NextConfig['images']>['remotePatterns'] = [];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  try {
    const parsed = new URL(apiUrl);
    patterns.push({
      protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      pathname: '/storage-proxy/**',
    });
  } catch {
    patterns.push({
      protocol: 'http',
      hostname: 'localhost',
      port: '3000',
      pathname: '/storage-proxy/**',
    });
  }

  return patterns;
}

const nextConfig: NextConfig = {
  // Keep dev output separate from production builds. Otherwise `next build`
  // can replace manifests/chunks while a long-lived `next dev` is serving them.
  distDir: process.env.STORYHOP_NEXT_DIST_DIR || '.next',
  env: {
    NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN:
      process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.VITE_PUBLIC_POSTHOG_KEY || '',
    NEXT_PUBLIC_POSTHOG_HOST:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || process.env.VITE_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
  },
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [128, 256, 384],
    remotePatterns: getStorageProxyRemotePatterns(),
  },
};

export default nextConfig;
