/**
 * SEO Middleware
 * 
 * Attaches SEO utilities to the request object for use in route handlers.
 * Provides easy access to meta tag generation, structured data, and URL management.
 * 
 * @module seo
 */

import { generateMetaTags, generateJobMetaTags, generateSchemeMetaTags, generateStaticPageMetaTags, generateCategoryMetaTags } from '../utils/seo/metaGenerator.js';
import { generateJobPostingSchema, generateFAQSchema, generateBreadcrumbSchema, generateOrganizationSchema, generateWebSiteSchema } from '../utils/seo/structuredDataGenerator.js';
import { getCanonicalUrl, buildJobUrl, buildSchemeUrl, buildCategoryUrl } from '../utils/seo/urlManager.js';
import { validateSchema } from '../utils/seo/schemaValidator.js';

/**
 * SEO Middleware
 * Attaches SEO utilities to req.seo object
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function seoMiddleware(req, res, next) {
  // Attach SEO utilities to request object
  req.seo = {
    // Meta tag generators
    generateMetaTags,
    generateJobMetaTags,
    generateSchemeMetaTags,
    generateStaticPageMetaTags,
    generateCategoryMetaTags,
    
    // Structured data generators
    generateStructuredData: {
      jobPosting: generateJobPostingSchema,
      faq: generateFAQSchema,
      breadcrumb: generateBreadcrumbSchema,
      organization: generateOrganizationSchema,
      website: generateWebSiteSchema
    },
    
    // URL management
    getCanonicalUrl,
    buildJobUrl,
    buildSchemeUrl,
    buildCategoryUrl,
    
    // Schema validation
    validateSchema
  };
  
  next();
}
