/**
 * Sitemap Generator Utility
 * 
 * Generates dynamic XML sitemaps from database content.
 * Includes jobs, schemes, and static pages with proper priorities and change frequencies.
 * 
 * @module sitemapGenerator
 */

import { Job } from '../../models/Job.js';
import { Scheme } from '../../models/Scheme.js';
import { buildJobUrl, buildSchemeUrl, getCanonicalUrl, BASE_URL } from './urlManager.js';
import { getAllStaticPageNames, getStaticPageConfig } from '../../config/staticPages.js';

/**
 * Format a sitemap entry as XML
 * 
 * @param {Object} entry - Sitemap entry object
 * @param {string} entry.loc - URL location
 * @param {string} entry.lastmod - Last modification date (ISO 8601)
 * @param {string} entry.changefreq - Change frequency
 * @param {number} entry.priority - Priority (0.0 to 1.0)
 * @returns {string} XML string for the entry
 */
export function formatSitemapEntry(entry) {
  const { loc, lastmod, changefreq, priority } = entry;
  
  let xml = '  <url>\n';
  xml += `    <loc>${escapeXml(loc)}</loc>\n`;
  
  if (lastmod) {
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
  }
  
  if (changefreq) {
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
  }
  
  if (priority !== undefined && priority !== null) {
    xml += `    <priority>${priority.toFixed(1)}</priority>\n`;
  }
  
  xml += '  </url>\n';
  
  return xml;
}

/**
 * Escape XML special characters
 * 
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeXml(str) {
  if (!str) return '';
  
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate sitemap entries for jobs
 * 
 * @returns {Promise<Array>} Array of sitemap entry objects
 */
export async function generateJobSitemapEntries() {
  try {
    // Query active jobs with optimized projection
    const jobs = await Job.find({ status: 'active' })
      .select('slug title createdAt updatedAt category')
      .sort({ createdAt: -1 })
      .limit(10000)
      .lean()
      .exec();
    
    return jobs.map(job => {
      const url = buildJobUrl(job);
      const lastmod = job.updatedAt || job.createdAt;
      
      return {
        loc: url,
        lastmod: lastmod ? new Date(lastmod).toISOString().split('T')[0] : undefined,
        changefreq: 'weekly',
        priority: 0.8
      };
    });
  } catch (error) {
    console.error('Error generating job sitemap entries:', error);
    return [];
  }
}

/**
 * Generate sitemap entries for schemes
 * 
 * @returns {Promise<Array>} Array of sitemap entry objects
 */
export async function generateSchemeSitemapEntries() {
  try {
    // Query all schemes with optimized projection
    const schemes = await Scheme.find({})
      .select('slug title updatedAt createdAt schemeType')
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean()
      .exec();
    
    return schemes.map(scheme => {
      const url = buildSchemeUrl(scheme);
      const lastmod = scheme.updatedAt || scheme.createdAt;
      
      return {
        loc: url,
        lastmod: lastmod ? new Date(lastmod).toISOString().split('T')[0] : undefined,
        changefreq: 'monthly',
        priority: 0.7
      };
    });
  } catch (error) {
    console.error('Error generating scheme sitemap entries:', error);
    return [];
  }
}

/**
 * Generate sitemap entries for static pages
 * 
 * @returns {Array} Array of sitemap entry objects
 */
export function generateStaticPageSitemapEntries() {
  try {
    const pageNames = getAllStaticPageNames();
    
    return pageNames.map(pageName => {
      const pageConfig = getStaticPageConfig(pageName);
      const url = getCanonicalUrl(`/${pageName}`);
      
      return {
        loc: url,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: pageConfig?.changefreq || 'monthly',
        priority: pageConfig?.priority || 0.5
      };
    });
  } catch (error) {
    console.error('Error generating static page sitemap entries:', error);
    return [];
  }
}

/**
 * Generate complete XML sitemap
 * 
 * @returns {Promise<string>} Complete sitemap XML string
 */
export async function generateSitemap() {
  try {
    // Generate all sitemap entries
    const [jobEntries, schemeEntries, staticPageEntries] = await Promise.all([
      generateJobSitemapEntries(),
      generateSchemeSitemapEntries(),
      generateStaticPageSitemapEntries()
    ]);
    
    // Add homepage entry
    const homepageEntry = {
      loc: BASE_URL,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: 1.0
    };
    
    // Combine all entries
    const allEntries = [
      homepageEntry,
      ...staticPageEntries,
      ...jobEntries,
      ...schemeEntries
    ];
    
    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    for (const entry of allEntries) {
      xml += formatSitemapEntry(entry);
    }
    
    xml += '</urlset>';
    
    return xml;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
}
