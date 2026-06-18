import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        // Security headers for all pages
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      {
        // Long cache for static assets (images, fonts, etc.)
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache for Next.js static chunks
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Clean up invalid search URLs that Google crawled (e.g., /search?q={search_term_string})
      // These create "duplicate without user-selected canonical" issues in GSC
      {
        source: '/search',
        has: [{ type: 'query', key: 'q', value: '\\{search_term_string\\}' }],
        destination: '/search',
        permanent: true,
      },
      // Redirect old/broken admission page with query to clean URL
      {
        source: '/admission',
        has: [{ type: 'query', key: 'page', value: '1' }],
        destination: '/admission',
        permanent: true,
      },
      // Redirect /closing-soon if it was crawled but no longer active
      // (keep it as a valid page, but ensure canonical is correct)
    ];
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/sitemap.xml',
        destination: `${backendUrl}/api/sitemap.xml`,
      },
    ];
  },
};

export default nextConfig;
