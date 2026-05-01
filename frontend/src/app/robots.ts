import { MetadataRoute } from 'next';
import { metaOptimizer } from '@/lib/seo/meta-optimizer';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net';
  
  return {
    rules: [
      // Main crawlers - full access
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/'],
        crawlDelay: 1,
      },
      // All other crawlers
      {
        userAgent: '*',
        allow: [
          '/',
          '/jobs',
          '/result',
          '/admit-card',
          '/admission',
          '/scholarship',
          '/exam-form',
          '/schemes',
          '/jobs/state/',
          '/schemes/',
          '/job/',
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/private/',
        ],
        crawlDelay: 1,
      },
      // Aggressive crawlers - rate limited
      {
        userAgent: 'AhrefsBot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/'],
        crawlDelay: 10,
      },
      {
        userAgent: 'SemrushBot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/'],
        crawlDelay: 10,
      },
      {
        userAgent: 'MJ12bot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/'],
        crawlDelay: 5,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

