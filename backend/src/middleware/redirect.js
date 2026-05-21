/**
 * Redirect Middleware
 * 
 * Handles homepage redirects and enforces canonical URLs.
 * Redirects all variants to https://sarkaripulse.net
 * 
 * @module redirect
 */

import { BASE_URL } from '../utils/seo/urlManager.js';

/**
 * Middleware to handle homepage redirects
 * Redirects all variants to the canonical HTTPS version
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function redirectMiddleware(req, res, next) {
  // Only apply to homepage requests
  if (req.path !== '/' && req.path !== '') {
    return next();
  }
  
  const protocol = req.protocol;
  const host = req.get('host') || '';
  const hasWww = host.startsWith('www.');
  
  // Check if redirect is needed
  const needsHttpsRedirect = protocol !== 'https';
  const needsWwwRemoval = hasWww;
  
  if (needsHttpsRedirect || needsWwwRemoval) {
    // Build canonical URL
    const canonicalUrl = BASE_URL;
    
    // Perform 301 permanent redirect
    return res.redirect(301, canonicalUrl);
  }
  
  // Already canonical, pass through
  next();
}

/**
 * Middleware to enforce trailing slash rules
 * Removes trailing slashes from non-directory paths
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function trailingSlashMiddleware(req, res, next) {
  const path = req.path;
  
  // Skip if root path
  if (path === '/') {
    return next();
  }
  
  // Skip if path has file extension
  if (path.match(/\.[a-z0-9]+$/i)) {
    return next();
  }
  
  // Remove trailing slash if present
  if (path.length > 1 && path.endsWith('/')) {
    const newPath = path.slice(0, -1);
    const query = req.url.slice(path.length);
    
    return res.redirect(301, newPath + query);
  }
  
  next();
}
