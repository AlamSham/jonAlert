/**
 * Robots.txt Generator Utility
 * 
 * Generates robots.txt content with proper directives for search engine crawlers.
 * 
 * @module robotsGenerator
 */

import { BASE_URL } from './urlManager.js';

/**
 * Generate robots.txt content
 * 
 * @returns {string} Robots.txt content
 */
export function generateRobotsTxt() {
  const lines = [];
  
  // Allow all user agents by default
  lines.push('User-agent: *');
  
  // Allow crawling of main content
  lines.push('Allow: /');
  
  // Disallow crawling of API endpoints
  lines.push('Disallow: /api/');
  
  // Disallow crawling of admin paths (if they exist)
  lines.push('Disallow: /admin/');
  
  // Disallow crawling of private/internal paths
  lines.push('Disallow: /private/');
  
  // Add crawl-delay to prevent server overload (optional)
  // Uncomment if needed:
  // lines.push('Crawl-delay: 1');
  
  // Add blank line before sitemap
  lines.push('');
  
  // Include sitemap URL
  lines.push(`Sitemap: ${BASE_URL}/sitemap.xml`);
  
  return lines.join('\n');
}
