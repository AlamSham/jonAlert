import { MetadataRoute } from 'next';
import { getLatestJobs, getStats } from '@/lib/api';
import { JobCategory } from '@/lib/types';

export const revalidate = 3600; // Background revalidation every 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net';

  // Fetch latest jobs and stats for state pages
  let latestJobs: any[] = [];
  let stats: any = { topStates: [] };
  try {
    [latestJobs, stats] = await Promise.all([
      getLatestJobs(3000),
      getStats(),
    ]);
  } catch (error) {
    console.error('Failed to fetch data for sitemap:', error);
  }

  const jobUrls = latestJobs.map((job) => ({
    url: `${siteUrl}/job/${job.slug}`,
    lastModified: new Date(job.createdAt || new Date()),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const categories: JobCategory[] = ['job', 'admission', 'scholarship', 'result', 'admit-card', 'exam-form'];
  
  const categoryUrls = categories.map((cat) => ({
    url: `${siteUrl}/${cat === 'job' ? 'jobs' : cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // State-wise pages
  const stateUrls = (stats.topStates || []).map((s: { state: string }) => ({
    url: `${siteUrl}/jobs/state/${encodeURIComponent(s.state)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const staticUrls = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${siteUrl}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ];

  return [...staticUrls, ...categoryUrls, ...stateUrls, ...jobUrls];
}

