/**
 * SEO Integration with JSONLDHandler
 * 
 * This module provides integration between existing SEO functions and the new JSONLDHandler
 * to ensure hydration-safe structured data management
 */

import { jsonLDHandler } from './JSONLDHandler';
import { 
  websiteJsonLd, 
  organizationJsonLd, 
  jobPostingJsonLd, 
  breadcrumbJsonLd,
  generateFAQSchema,
  generateArticleSchema,
  generateCollectionPageSchema,
  generateLocalBusinessSchema
} from '../seo';
import { JobDetail } from '../types';

/**
 * Initialize core structured data that should be present on all pages
 * Requirements 2.1, 2.5: Ensure structured data availability during initial page load
 */
export function initializeCoreStructuredData(): void {
  try {
    // Add website schema with highest priority
    jsonLDHandler.addStructuredData(
      websiteJsonLd(),
      'website',
      100
    );

    // Add organization schema with high priority
    jsonLDHandler.addStructuredData(
      organizationJsonLd(),
      'organization',
      90,
      ['website'] // Depends on website schema
    );
  } catch (error) {
    console.error('[SEO Integration] Failed to initialize core structured data:', error);
  }
}

/**
 * Add job posting structured data with validation
 * Requirements 2.1, 2.2, 2.3: Consistent serialization and validation
 */
export function addJobStructuredData(job: JobDetail): void {
  try {
    // Add main job posting schema
    const jobSchema = jobPostingJsonLd(job);
    jsonLDHandler.addStructuredData(
      jobSchema,
      `job-${job.slug}`,
      80,
      ['organization']
    );

    // Add article schema for the job content
    const articleSchema = generateArticleSchema(job);
    if (articleSchema && Object.keys(articleSchema).length > 0) {
      jsonLDHandler.addStructuredData(
        articleSchema,
        `article-${job.slug}`,
        70,
        [`job-${job.slug}`]
      );
    }

    // Add FAQ schema if available
    const faqSchema = generateFAQSchema(job);
    if (faqSchema) {
      jsonLDHandler.addStructuredData(
        faqSchema,
        `faq-${job.slug}`,
        60,
        [`job-${job.slug}`]
      );
    }
  } catch (error) {
    console.error('[SEO Integration] Failed to add job structured data:', error);
  }
}

/**
 * Add breadcrumb structured data
 * Requirements 2.1: Consistent content between server and client
 */
export function addBreadcrumbStructuredData(
  items: { name: string; url: string }[],
  pageId: string
): void {
  try {
    const breadcrumbSchema = breadcrumbJsonLd(items);
    jsonLDHandler.addStructuredData(
      breadcrumbSchema,
      `breadcrumb-${pageId}`,
      50,
      ['website']
    );
  } catch (error) {
    console.error('[SEO Integration] Failed to add breadcrumb structured data:', error);
  }
}

/**
 * Add collection page structured data
 * Requirements 2.1, 2.2: Consistent serialization for category pages
 */
export function addCollectionPageStructuredData(
  category: string,
  items: any[],
  totalCount: number,
  state?: string
): void {
  try {
    const collectionSchema = generateCollectionPageSchema(category, items, totalCount);
    const key = state ? `collection-${category}-${state}` : `collection-${category}`;
    
    jsonLDHandler.addStructuredData(
      collectionSchema,
      key,
      40,
      ['website']
    );

    // Add local business schema for state-specific pages
    if (state && state !== 'All India') {
      const localBusinessSchema = generateLocalBusinessSchema(state);
      jsonLDHandler.addStructuredData(
        localBusinessSchema,
        `local-business-${state}`,
        30,
        [key]
      );
    }
  } catch (error) {
    console.error('[SEO Integration] Failed to add collection page structured data:', error);
  }
}

/**
 * Update job structured data safely
 * Requirements 2.4: Update without causing hydration mismatches
 */
export function updateJobStructuredData(job: JobDetail): void {
  try {
    const jobKey = `job-${job.slug}`;
    const existingJob = jsonLDHandler.getStructuredData(jobKey);
    
    if (existingJob) {
      // Update existing job data
      const updatedJobSchema = jobPostingJsonLd(job);
      jsonLDHandler.updateStructuredData(jobKey, updatedJobSchema);

      // Update article schema
      const articleKey = `article-${job.slug}`;
      const existingArticle = jsonLDHandler.getStructuredData(articleKey);
      if (existingArticle) {
        const updatedArticleSchema = generateArticleSchema(job);
        jsonLDHandler.updateStructuredData(articleKey, updatedArticleSchema);
      }

      // Update FAQ schema
      const faqKey = `faq-${job.slug}`;
      const existingFAQ = jsonLDHandler.getStructuredData(faqKey);
      const updatedFAQSchema = generateFAQSchema(job);
      
      if (existingFAQ && updatedFAQSchema) {
        jsonLDHandler.updateStructuredData(faqKey, updatedFAQSchema);
      } else if (!existingFAQ && updatedFAQSchema) {
        // Add FAQ if it didn't exist before but now we have data
        jsonLDHandler.addStructuredData(updatedFAQSchema, faqKey, 60, [jobKey]);
      } else if (existingFAQ && !updatedFAQSchema) {
        // Remove FAQ if we no longer have data for it
        jsonLDHandler.removeStructuredData(faqKey);
      }
    } else {
      // Add new job data
      addJobStructuredData(job);
    }
  } catch (error) {
    console.error('[SEO Integration] Failed to update job structured data:', error);
  }
}

/**
 * Remove job-related structured data
 * Requirements 2.4: Safe removal without hydration issues
 */
export function removeJobStructuredData(jobSlug: string): void {
  try {
    jsonLDHandler.removeStructuredData(`job-${jobSlug}`);
    jsonLDHandler.removeStructuredData(`article-${jobSlug}`);
    jsonLDHandler.removeStructuredData(`faq-${jobSlug}`);
  } catch (error) {
    console.error('[SEO Integration] Failed to remove job structured data:', error);
  }
}

/**
 * Get all structured data for server-side rendering
 * Requirements 2.1, 2.5: Maintain SEO benefits during initial page load
 */
export function getSSRStructuredData(): Array<{ key: string; content: string; priority: number }> {
  try {
    return jsonLDHandler.getSerializedScripts();
  } catch (error) {
    console.error('[SEO Integration] Failed to get SSR structured data:', error);
    return [];
  }
}

/**
 * Validate all current structured data
 * Requirements 2.3: Validate JSON-LD syntax
 */
export function validateAllStructuredData(): {
  valid: boolean;
  errors: Array<{ key: string; errors: string[] }>;
  warnings: Array<{ key: string; warnings: string[] }>;
} {
  const allData = jsonLDHandler.getAllStructuredData();
  const errors: Array<{ key: string; errors: string[] }> = [];
  const warnings: Array<{ key: string; warnings: string[] }> = [];

  for (const config of allData) {
    try {
      const validation = jsonLDHandler.validateSchema(config.data);
      
      if (!validation.valid) {
        errors.push({
          key: config.key,
          errors: validation.errors
        });
      }
      
      if (validation.warnings.length > 0) {
        warnings.push({
          key: config.key,
          warnings: validation.warnings
        });
      }
    } catch (error) {
      errors.push({
        key: config.key,
        errors: [`Validation failed: ${error instanceof Error ? error.message : String(error)}`]
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get structured data statistics for monitoring
 * Requirements: Performance monitoring and debugging
 */
export function getStructuredDataStats(): {
  count: number;
  totalSize: number;
  keys: string[];
  byPriority: Array<{ priority: number; count: number }>;
} {
  const stats = jsonLDHandler.getStats();
  const allData = jsonLDHandler.getAllStructuredData();
  
  // Group by priority
  const priorityGroups = allData.reduce((acc, config) => {
    const priority = config.priority;
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const byPriority = Object.entries(priorityGroups)
    .map(([priority, count]) => ({ priority: Number(priority), count }))
    .sort((a, b) => b.priority - a.priority);

  return {
    ...stats,
    byPriority
  };
}

/**
 * Clear all structured data (useful for testing or page transitions)
 */
export function clearAllStructuredData(): void {
  jsonLDHandler.clear();
}

/**
 * Initialize structured data for a specific page type
 */
export function initializePageStructuredData(
  pageType: 'home' | 'job' | 'category' | 'search',
  pageData?: any
): void {
  // Always initialize core data
  initializeCoreStructuredData();

  // Add page-specific data based on type
  switch (pageType) {
    case 'job':
      if (pageData?.job) {
        addJobStructuredData(pageData.job);
      }
      if (pageData?.breadcrumbs) {
        addBreadcrumbStructuredData(pageData.breadcrumbs, `job-${pageData.job?.slug}`);
      }
      break;

    case 'category':
      if (pageData?.category && pageData?.items) {
        addCollectionPageStructuredData(
          pageData.category,
          pageData.items,
          pageData.totalCount || 0,
          pageData.state
        );
      }
      if (pageData?.breadcrumbs) {
        addBreadcrumbStructuredData(pageData.breadcrumbs, `category-${pageData.category}`);
      }
      break;

    case 'search':
      if (pageData?.breadcrumbs) {
        addBreadcrumbStructuredData(pageData.breadcrumbs, 'search');
      }
      break;

    case 'home':
    default:
      // Core data is already initialized
      break;
  }
}