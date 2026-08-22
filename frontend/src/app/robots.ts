import { MetadataRoute } from 'next';
import { metaOptimizer } from '@/lib/seo/meta-optimizer';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net';
  
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
      },
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'ChatGPT-User', 'OAI-SearchBot', 'PerplexityBot'],
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
      },
      {
        userAgent: ['MJ12bot', 'Bytespider', 'PetalBot', 'DotBot', 'CCBot'],
        disallow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap-index.xml`,
  };
}

