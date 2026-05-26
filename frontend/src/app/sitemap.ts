import { MetadataRoute } from 'next';
import { getLatestJobs, getStats } from '@/lib/api';
import { JobCategory } from '@/lib/types';

export const revalidate = 3600; // Background revalidation every 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net';

  // Fetch latest jobs, stats, and schemes for sitemap
  let latestJobs: any[] = [];
  let stats: any = { topStates: [] };
  let latestSchemes: any[] = [];
  try {
    const { getLatestSchemes } = await import('@/lib/api');
    [latestJobs, stats, latestSchemes] = await Promise.all([
      getLatestJobs(3000),
      getStats(),
      getLatestSchemes(100).catch(() => []), // Fetch up to 100 schemes
    ]);
  } catch (error) {
    console.error('Failed to fetch data for sitemap:', error);
  }

  // Job URLs with proper priority and changeFrequency
  const jobUrls = latestJobs.map((job) => ({
    url: `${siteUrl}/job/${job.slug}`,
    lastModified: new Date(job.createdAt || new Date()),
    changeFrequency: 'daily' as const,
    priority: 0.8, // Enhanced to upper range (0.7-0.8 for jobs)
  }));

  const categories: JobCategory[] = ['job', 'admission', 'scholarship', 'result', 'admit-card', 'exam-form'];
  
  // Category URLs with enhanced priority (0.8-0.9 for categories)
  const categoryUrls = categories.map((cat) => ({
    url: `${siteUrl}/${cat === 'job' ? 'jobs' : cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9, // Enhanced to upper range (0.8-0.9 for categories)
  }));

  // State-specific pages for all categories with jobs (priority 0.6-0.7)
  const stateUrls: MetadataRoute.Sitemap = [];
  const categoriesWithStates = ['jobs', 'admission', 'scholarship', 'exam-form'];
  
  (stats.topStates || []).forEach((s: { state: string }) => {
    categoriesWithStates.forEach((category) => {
      stateUrls.push({
        url: `${siteUrl}/${category}/state/${encodeURIComponent(s.state)}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7, // Enhanced to upper range (0.6-0.7 for state pages)
      });
    });
  });

  // Scheme URLs with proper priority and changeFrequency
  const schemeUrls: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/schemes`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9, // High priority for main schemes page
    },
    ...latestSchemes.map((scheme: any) => ({
      url: `${siteUrl}/schemes/${scheme.slug}`,
      lastModified: new Date(scheme.updatedAt || scheme.createdAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8, // High priority for scheme detail pages
    })),
  ];

  // Search page URLs — high-value keyword pages for SEO
  const popularSearches = [
    'SSC CGL', 'UPSC', 'Railway', 'Police', 'Banking', 'Army', 'Navy',
    'Teacher', 'UPSSSC', 'BPSC', 'NTA', 'IBPS', 'CTET', 'RRB',
    'defense', 'Left Front', 'MPBSE', 'JPSC', 'CEE', 'Padma Awards',
    'subsidy', 'board exams', 'BIEAP', 'PGT', 'Tamil Nadu', 'police',
    'ISC', 'CTET', 'BSTC', 'SEBA', 'farmer', 'WBPSC', 'UKSSSC', 'CSJMU',
    'environment', 'AP Inter', 'IIIT Bangalore', 'Technician',
    'Kerala Board of Public Examinations', 'college', 'BTech', 'Careers360',
    'M.Tech', 'Gujarat ITI', 'hall ticket', 'TNGASA', 'IIIT Hyderabad',
    'Maharashtra ITI', 'CA Final', 'Himachal Pradesh', 'post-graduate',
    'exam calendar', 'HP PAT', 'TNEA',
  ];
  
  const qualificationSearches = [
    '10th pass', '12th pass', 'Graduate', 'Post Graduate', 'ITI',
    'Diploma', 'Engineering', 'B.Ed',
  ];

  const searchUrls: MetadataRoute.Sitemap = [
    // Main search page
    {
      url: `${siteUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    // Popular search pages
    ...popularSearches.map((q) => ({
      url: `${siteUrl}/search?q=${encodeURIComponent(q)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })),
    // Qualification-based search pages
    ...qualificationSearches.map((q) => ({
      url: `${siteUrl}/search?q=${encodeURIComponent(q)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })),
  ];

  // Static URLs with proper metadata
  const staticUrls = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const, // As per requirements
      priority: 1.0, // Homepage priority
    },
  ];

  // High-traffic special landing pages
  const specialTrafficUrls = [
    {
      url: `${siteUrl}/today`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/closing-soon`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];


  // Legal pages with proper priority (0.4-0.5) and monthly changeFrequency
  const legalUrls = [
    {
      url: `${siteUrl}/about`,
      lastModified: new Date('2024-12-15'), // Last updated date
      changeFrequency: 'monthly' as const,
      priority: 0.5, // Upper range for legal pages
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date('2024-12-15'), // Last updated date
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: new Date('2024-12-15'), // Last updated date
      changeFrequency: 'monthly' as const,
      priority: 0.4, // Lower range for policy pages
    },
    {
      url: `${siteUrl}/terms-and-conditions`,
      lastModified: new Date('2024-12-15'), // Last updated date
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${siteUrl}/cookie-policy`,
      lastModified: new Date('2024-12-15'), // Last updated date
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${siteUrl}/disclaimer`,
      lastModified: new Date('2024-12-15'), // Last updated date
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ];

  // Combine all URLs and ensure we don't exceed 50,000 URLs
  const allUrls = [
    ...staticUrls,
    ...specialTrafficUrls,
    ...legalUrls,
    ...categoryUrls,
    ...stateUrls,
    ...schemeUrls, // Add scheme URLs
    ...searchUrls, // Add search page URLs for SEO
    ...jobUrls,
  ];

  // Limit to 50,000 URLs as per requirements
  if (allUrls.length > 50000) {
    console.warn(`Sitemap has ${allUrls.length} URLs, truncating to 50,000`);
    return allUrls.slice(0, 50000);
  }

  return allUrls;
}
