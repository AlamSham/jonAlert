import { env } from '../../config/env.js';
import { makeSlug } from '../slugify.js';

/**
 * Constants for URL management
 */
export const BASE_URL = env.baseUrl;
export const MAX_SLUG_LENGTH = 100;
export const STOP_WORDS = [
  'the',
  'and',
  'for',
  'with',
  'latest',
  'update',
  'official',
  'notification'
];

/**
 * Generate SEO-friendly slug from title
 * @param {string} title - Title to slugify
 * @param {Object} options - Slug options
 * @param {number} options.maxLength - Maximum slug length (default: 100)
 * @returns {string} SEO-friendly slug
 */
export function generateSlug(title, options = {}) {
  const maxLength = options.maxLength || MAX_SLUG_LENGTH;
  
  if (!title || typeof title !== 'string') {
    return '';
  }

  // Use the existing makeSlug utility which already handles stop words
  const slug = makeSlug(title);
  
  // Ensure slug doesn't exceed max length
  if (slug.length > maxLength) {
    return slug.slice(0, maxLength).replace(/-+$/g, '');
  }
  
  return slug;
}

/**
 * Normalize URL (remove trailing slashes, ensure lowercase, etc.)
 * @param {string} url - URL to normalize
 * @returns {string} Normalized URL
 */
export function normalizeUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  let normalized = url.trim();
  
  // Remove trailing slashes (except for root path)
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.replace(/\/+$/, '');
  }
  
  // Ensure single slashes (no double slashes except in protocol)
  normalized = normalized.replace(/([^:]\/)\/+/g, '$1');
  
  return normalized;
}

/**
 * Generate canonical URL for a page
 * @param {string} path - Page path (e.g., '/job/railway-recruitment-2024')
 * @param {Object} options - URL options
 * @param {boolean} options.includeQueryParams - Include query parameters (default: false)
 * @param {Object} options.queryParams - Query parameters to include
 * @returns {string} Canonical URL
 */
export function getCanonicalUrl(path, options = {}) {
  if (!path || typeof path !== 'string') {
    return BASE_URL;
  }

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Build base URL
  let canonicalUrl = `${BASE_URL}${normalizedPath}`;
  
  // Add query parameters if specified
  if (options.includeQueryParams && options.queryParams) {
    const queryString = new URLSearchParams(options.queryParams).toString();
    if (queryString) {
      canonicalUrl += `?${queryString}`;
    }
  }
  
  // Normalize the final URL
  return normalizeUrl(canonicalUrl);
}

/**
 * Build job posting URL
 * @param {Object} job - Job document from database
 * @returns {string} Job posting URL
 */
export function buildJobUrl(job) {
  if (!job) {
    return BASE_URL;
  }

  // Use existing slug if available, otherwise generate from title
  const slug = job.slug || generateSlug(job.title);
  
  if (!slug) {
    return BASE_URL;
  }

  return getCanonicalUrl(`/job/${slug}`);
}

/**
 * Build scheme URL
 * @param {Object} scheme - Scheme document from database
 * @returns {string} Scheme URL
 */
export function buildSchemeUrl(scheme) {
  if (!scheme) {
    return BASE_URL;
  }

  // Use existing slug if available, otherwise generate from title
  const slug = scheme.slug || generateSlug(scheme.title);
  
  if (!slug) {
    return BASE_URL;
  }

  return getCanonicalUrl(`/scheme/${slug}`);
}

/**
 * Build category URL
 * @param {string} category - Category name (e.g., 'job', 'result', 'admit-card')
 * @param {Object} filters - Applied filters (state, qualification, etc.)
 * @returns {string} Category URL with query params
 */
export function buildCategoryUrl(category, filters = {}) {
  if (!category || typeof category !== 'string') {
    return BASE_URL;
  }

  // Normalize category name to slug format
  const categorySlug = generateSlug(category);
  
  if (!categorySlug) {
    return BASE_URL;
  }

  // Build URL with filters as query parameters
  const hasFilters = filters && Object.keys(filters).length > 0;
  
  if (hasFilters) {
    // Filter out empty values
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    return getCanonicalUrl(`/${categorySlug}`, {
      includeQueryParams: true,
      queryParams: cleanFilters
    });
  }
  
  return getCanonicalUrl(`/${categorySlug}`);
}
