import { MetadataRoute } from 'next';
import { getLatestJobs } from '@/lib/api';
import { JobCategory } from '@/lib/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net';

  // Fetch the latest jobs to include in the sitemap
  let latestJobs: any[] = [];
  try {
    latestJobs = await getLatestJobs(100);
  } catch (error) {
    console.error('Failed to fetch jobs for sitemap:', error);
  }

  const jobUrls = latestJobs.map((job) => ({
    url: `${siteUrl}/jobs/${job.slug}`,
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
  ];

  return [...staticUrls, ...categoryUrls, ...jobUrls];
}
