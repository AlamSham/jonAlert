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
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
          'GoogleOther',
          'Applebot-Extended',
          'Amazonbot',
          'meta-externalagent',
          'cohere-ai',
        ],
        allow: ['/', '/llms.txt', '/llms-full.txt'],
        disallow: ['/api/', '/admin/', '/private/'],
      },
      {
        userAgent: ['MJ12bot', 'Bytespider', 'PetalBot', 'DotBot', 'CCBot'],
        disallow: '/',
      },
    ],
    sitemap: [
      `${siteUrl}/sitemap.xml`,
      `${siteUrl}/sitemap-index.xml`,
      `${siteUrl}/sitemap-jobs.xml`,
      `${siteUrl}/sitemap-results.xml`,
      `${siteUrl}/sitemap-schemes.xml`,
      `${siteUrl}/sitemap-states.xml`,
      `${siteUrl}/sitemap-categories.xml`,
      `${siteUrl}/sitemap-static.xml`,
    ],
  };
}

