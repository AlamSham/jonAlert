/**
 * SEO Routes
 * 
 * Routes for sitemap.xml, robots.txt, and static pages.
 * 
 * @module seo.routes
 */

import express from 'express';
import { generateSitemap } from '../utils/seo/sitemapGenerator.js';
import { generateRobotsTxt } from '../utils/seo/robotsGenerator.js';
import { SitemapCache } from '../models/SitemapCache.js';
import { env } from '../config/env.js';
import { getAllStaticPageNames } from '../config/staticPages.js';

const router = express.Router();

/**
 * GET /sitemap.xml
 * Generate and serve XML sitemap
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    // Check for cached sitemap
    const cached = await SitemapCache.findOne({
      expiresAt: { $gt: new Date() }
    }).sort({ generatedAt: -1 });
    
    if (cached) {
      // Serve cached sitemap
      res.set('Content-Type', 'application/xml');
      return res.send(cached.content);
    }
    
    // Generate new sitemap
    const sitemapXml = await generateSitemap();
    
    // Cache the sitemap
    const expiresAt = new Date(Date.now() + (env.sitemapCacheTtl * 1000));
    
    await SitemapCache.create({
      content: sitemapXml,
      generatedAt: new Date(),
      expiresAt,
      entryCount: (sitemapXml.match(/<url>/g) || []).length,
      lastJobUpdate: new Date(),
      lastSchemeUpdate: new Date()
    });
    
    // Serve sitemap
    res.set('Content-Type', 'application/xml');
    res.send(sitemapXml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Try to serve cached version as fallback
    try {
      const fallback = await SitemapCache.findOne().sort({ generatedAt: -1 });
      
      if (fallback) {
        res.set('Content-Type', 'application/xml');
        return res.send(fallback.content);
      }
    } catch (fallbackError) {
      console.error('Error fetching fallback sitemap:', fallbackError);
    }
    
    res.status(500).send('Error generating sitemap');
  }
});

/**
 * GET /robots.txt
 * Generate and serve robots.txt
 */
router.get('/robots.txt', (req, res) => {
  try {
    const robotsTxt = generateRobotsTxt();
    
    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    res.status(500).send('Error generating robots.txt');
  }
});

/**
 * GET /about, /contact, /disclaimer, etc.
 * Serve static pages with SEO metadata
 */
const staticPages = getAllStaticPageNames();

staticPages.forEach(pageName => {
  router.get(`/${pageName}`, (req, res) => {
    try {
      // Generate meta tags for the page
      const metaTags = req.seo.generateStaticPageMetaTags(pageName);
      
      // In a real application, you would render a template here
      // For now, we'll return JSON with meta tags
      res.json({
        page: pageName,
        metaTags,
        message: 'Static page route - integrate with your frontend'
      });
    } catch (error) {
      console.error(`Error serving ${pageName} page:`, error);
      res.status(500).send('Error loading page');
    }
  });
});

export default router;
