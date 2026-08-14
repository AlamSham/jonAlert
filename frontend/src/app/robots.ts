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
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/'],
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
          '/search',
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/private/',
        ],
      },
      // AI Search Bots - Allowed for AI Traffic & Citing
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'ChatGPT-User', 'OAI-SearchBot', 'PerplexityBot'],
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/'],
      },
      // Block aggressive SEO crawlers & scrapers to save Vercel ISR Writes & Bandwidth
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'Bytespider', 'PetalBot', 'DotBot', 'CCBot'],
        disallow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap-index.xml`,
  };
}

