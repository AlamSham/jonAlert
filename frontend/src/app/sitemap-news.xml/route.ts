import { NextResponse } from 'next/server';
import { getLatestJobs } from '@/lib/api';

export const revalidate = 1800; // Revalidate every 30 minutes

/**
 * Google News Sitemap — serves last 48 hours of job notifications
 * Google News requires content published within the last 2 days.
 * This helps get content into Google News carousel and Discover feed.
 * 
 * Format: https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
 */
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net';

  let latestJobs: any[] = [];
  try {
    latestJobs = await getLatestJobs(50); // Get last 50 jobs
  } catch (error) {
    console.error('Failed to fetch jobs for news sitemap:', error);
  }

  // Filter to only jobs published within last 48 hours
  const now = Date.now();
  const twoDaysAgo = now - (48 * 60 * 60 * 1000);
  const recentJobs = (latestJobs || []).filter((job: any) => {
    if (!job || !job.slug || !job.createdAt) return false;
    const createdTime = new Date(job.createdAt).getTime();
    return createdTime >= twoDaysAgo;
  });

  const newsEntries = recentJobs.map((job: any) => {
    const pubDate = new Date(job.createdAt).toISOString();
    const title = (job.title || 'Job Notification').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const keywords = (job.tags || []).slice(0, 5).join(', ').replace(/&/g, '&amp;');
    
    return `  <url>
    <loc>${siteUrl}/job/${job.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>SarkariPulse</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
      ${keywords ? `<news:keywords>${keywords}</news:keywords>` : ''}
    </news:news>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsEntries}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  });
}
