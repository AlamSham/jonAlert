/**
 * SEO Helper Utility
 * 
 * Helper functions to add SEO metadata to API responses.
 * Used in job and scheme controllers to enhance responses with meta tags and structured data.
 * 
 * @module seoHelper
 */

import { generateJobMetaTags, generateSchemeMetaTags } from './seo/metaGenerator.js';
import { generateJobPostingSchema, generateBreadcrumbSchema } from './seo/structuredDataGenerator.js';
import { buildJobUrl, buildSchemeUrl, BASE_URL } from './seo/urlManager.js';

/**
 * Add SEO metadata to job response
 * 
 * @param {Object} job - Job document
 * @returns {Object} Job with SEO metadata
 */
export function addJobSEO(job) {
  if (!job) return null;
  
  try {
    // Generate meta tags
    const metaTags = generateJobMetaTags(job);
    
    // Generate structured data
    const structuredData = {
      jobPosting: generateJobPostingSchema(job),
      breadcrumb: generateBreadcrumbSchema([
        { name: 'Home', url: BASE_URL },
        { name: 'Jobs', url: `${BASE_URL}/jobs` },
        { name: job.title, url: buildJobUrl(job) }
      ])
    };
    
    return {
      ...job,
      seo: {
        metaTags,
        structuredData,
        canonicalUrl: buildJobUrl(job)
      }
    };
  } catch (error) {
    console.error('Error adding job SEO:', error);
    return job;
  }
}

/**
 * Add SEO metadata to scheme response
 * 
 * @param {Object} scheme - Scheme document
 * @returns {Object} Scheme with SEO metadata
 */
export function addSchemeSEO(scheme) {
  if (!scheme) return null;
  
  try {
    // Generate meta tags
    const metaTags = generateSchemeMetaTags(scheme);
    
    // Generate breadcrumb
    const breadcrumb = generateBreadcrumbSchema([
      { name: 'Home', url: BASE_URL },
      { name: 'Schemes', url: `${BASE_URL}/schemes` },
      { name: scheme.title, url: buildSchemeUrl(scheme) }
    ]);
    
    return {
      ...scheme,
      seo: {
        metaTags,
        structuredData: {
          breadcrumb
        },
        canonicalUrl: buildSchemeUrl(scheme)
      }
    };
  } catch (error) {
    console.error('Error adding scheme SEO:', error);
    return scheme;
  }
}

/**
 * Add SEO metadata to multiple jobs
 * 
 * @param {Array} jobs - Array of job documents
 * @returns {Array} Jobs with SEO metadata
 */
export function addJobsSEO(jobs) {
  if (!Array.isArray(jobs)) return [];
  
  return jobs.map(job => addJobSEO(job));
}

/**
 * Add SEO metadata to multiple schemes
 * 
 * @param {Array} schemes - Array of scheme documents
 * @returns {Array} Schemes with SEO metadata
 */
export function addSchemesSEO(schemes) {
  if (!Array.isArray(schemes)) return [];
  
  return schemes.map(scheme => addSchemeSEO(scheme));
}
