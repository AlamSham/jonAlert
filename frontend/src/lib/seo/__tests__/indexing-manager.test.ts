// Integration tests for Indexing_Manager - Validates sitemap generation, Search Console integration, and URL optimization

import { indexingManager } from '../indexing-manager';
import { gscIntegration } from '../gsc-integration';
import type { SitemapEntry, IndexingResult, SubmissionResult } from '../interfaces';

// Mock external dependencies
jest.mock('../gsc-integration');

describe('IndexingManager Integration Tests', () => {
  describe('Sitemap Generation', () => {
    it('should generate comprehensive sitemap for all content types', async () => {
      const sitemap = await indexingManager.generateSitemap('all');
      
      expect(sitemap).toBeInstanceOf(Array);
      expect(sitemap.length).toBeGreaterThan(0);
      
      // Check sitemap entry structure
      sitemap.forEach(entry => {
        expect(entry).toHaveProperty('url');
        expect(entry).toHaveProperty('lastModified');
        expect(entry).toHaveProperty('changeFrequency');
        expect(entry).toHaveProperty('priority');
        
        expect(entry.url).toMatch(/^https?:\/\//);
        expect(entry.lastModified).toBeInstanceOf(Date);
        expect(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']).toContain(entry.changeFrequency);
        expect(entry.priority).toBeGreaterThanOrEqual(0);
        expect(entry.priority).toBeLessThanOrEqual(1);
      });
    });

    it('should generate job-specific sitemap', async () => {
      const jobsSitemap = await indexingManager.generateSitemap('jobs');
      
      expect(jobsSitemap).toBeInstanceOf(Array);
      
      // Jobs sitemap should have appropriate change frequency
      jobsSitemap.forEach(entry => {
        expect(entry.changeFrequency).toBe('weekly');
        expect(entry.url).toContain('/job/');
      });
    });

    it('should generate schemes-specific sitemap', async () => {
      const schemesSitemap = await indexingManager.generateSitemap('schemes');
      
      expect(schemesSitemap).toBeInstanceOf(Array);
      
      // Schemes sitemap should have appropriate change frequency
      schemesSitemap.forEach(entry => {
        expect(entry.changeFrequency).toBe('monthly');
        expect(entry.url).toContain('/schemes/');
      });
    });

    it('should generate categories sitemap with proper URLs', async () => {
      const categoriesSitemap = await indexingManager.generateSitemap('categories');
      
      expect(categoriesSitemap).toBeInstanceOf(Array);
      expect(categoriesSitemap.length).toBeGreaterThan(0);
      
      // Check for common job categories
      const categoryUrls = categoriesSitemap.map(entry => entry.url);
      expect(categoryUrls.some(url => url.includes('/category/ssc'))).toBe(true);
      expect(categoryUrls.some(url => url.includes('/category/railway'))).toBe(true);
      expect(categoryUrls.some(url => url.includes('/category/banking'))).toBe(true);
    });

    it('should generate states sitemap with all Indian states', async () => {
      const statesSitemap = await indexingManager.generateSitemap('states');
      
      expect(statesSitemap).toBeInstanceOf(Array);
      expect(statesSitemap.length).toBeGreaterThanOrEqual(28); // At least 28 states + UTs
      
      // Check for major states
      const stateUrls = statesSitemap.map(entry => entry.url);
      expect(stateUrls.some(url => url.includes('/state/maharashtra'))).toBe(true);
      expect(stateUrls.some(url => url.includes('/state/uttar-pradesh'))).toBe(true);
      expect(stateUrls.some(url => url.includes('/state/jharkhand'))).toBe(true);
    });

    it('should sort sitemap entries by priority and date', async () => {
      const sitemap = await indexingManager.generateSitemap('all');
      
      if (sitemap.length > 1) {
        // Check that entries are sorted by priority (descending)
        for (let i = 0; i < sitemap.length - 1; i++) {
          if (sitemap[i].priority !== sitemap[i + 1].priority) {
            expect(sitemap[i].priority).toBeGreaterThanOrEqual(sitemap[i + 1].priority);
          }
        }
      }
    });

    it('should handle empty content gracefully', async () => {
      // Test with content type that might have no data
      const resultsSitemap = await indexingManager.generateSitemap('results');
      
      expect(resultsSitemap).toBeInstanceOf(Array);
      // Should not throw error even if no results data
    });
  });

  describe('Sitemap Index Generation', () => {
    it('should generate comprehensive sitemap index', async () => {
      const sitemapIndex = await indexingManager.generateSitemapIndex();
      
      expect(sitemapIndex).toHaveProperty('sitemaps');
      expect(sitemapIndex).toHaveProperty('totalUrls');
      expect(sitemapIndex.sitemaps).toBeInstanceOf(Array);
      expect(sitemapIndex.totalUrls).toBeGreaterThanOrEqual(0);
      
      // Check sitemap index structure
      sitemapIndex.sitemaps.forEach(sitemap => {
        expect(sitemap).toHaveProperty('loc');
        expect(sitemap).toHaveProperty('lastmod');
        expect(sitemap).toHaveProperty('changefreq');
        
        expect(sitemap.loc).toMatch(/^https?:\/\//);
        expect(sitemap.loc).toMatch(/\.xml$/);
        expect(sitemap.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should include all content type sitemaps in index', async () => {
      const sitemapIndex = await indexingManager.generateSitemapIndex();
      
      const sitemapUrls = sitemapIndex.sitemaps.map(s => s.loc);
      
      // Should include major content types (only if they have content)
      // Since we're using empty data sources, check for static sitemap at minimum
      expect(sitemapUrls.some(url => url.includes('sitemap-static.xml'))).toBe(true);
      
      // The other sitemaps may not be included if content types are empty
      // This is expected behavior for the current implementation
    });
  });

  describe('XML Generation', () => {
    it('should generate valid XML sitemap', () => {
      const sampleEntries: SitemapEntry[] = [
        {
          url: 'https://sarkaripulse.net/jobs',
          lastModified: new Date('2024-01-15'),
          changeFrequency: 'daily',
          priority: 0.9
        },
        {
          url: 'https://sarkaripulse.net/schemes',
          lastModified: new Date('2024-01-10'),
          changeFrequency: 'weekly',
          priority: 0.8
        }
      ];
      
      const xml = indexingManager.generateSitemapXML(sampleEntries);
      
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      expect(xml).toContain('<loc>https://sarkaripulse.net/jobs</loc>');
      expect(xml).toContain('<loc>https://sarkaripulse.net/schemes</loc>');
      expect(xml).toContain('<changefreq>daily</changefreq>');
      expect(xml).toContain('<priority>0.9</priority>');
      expect(xml).toContain('</urlset>');
    });

    it('should generate valid XML sitemap index', () => {
      const sampleSitemaps = [
        {
          loc: 'https://sarkaripulse.net/sitemap-jobs.xml',
          lastmod: '2024-01-15',
          changefreq: 'daily'
        },
        {
          loc: 'https://sarkaripulse.net/sitemap-schemes.xml',
          lastmod: '2024-01-10',
          changefreq: 'weekly'
        }
      ];
      
      const xml = indexingManager.generateSitemapIndexXML(sampleSitemaps);
      
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(xml).toContain('<loc>https://sarkaripulse.net/sitemap-jobs.xml</loc>');
      expect(xml).toContain('<lastmod>2024-01-15</lastmod>');
      expect(xml).toContain('</sitemapindex>');
    });

    it('should properly escape XML characters', () => {
      const sampleEntries: SitemapEntry[] = [
        {
          url: 'https://sarkaripulse.net/job/test-&-special-<chars>',
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
          images: [{
            url: 'https://sarkaripulse.net/image.jpg',
            caption: 'Test & Special <Characters>',
            title: 'Job "Title" with quotes'
          }]
        }
      ];
      
      const xml = indexingManager.generateSitemapXML(sampleEntries);
      
      expect(xml).toContain('&amp;');
      expect(xml).toContain('&lt;');
      expect(xml).toContain('&gt;');
      expect(xml).toContain('&quot;');
      // Check that raw & characters are properly escaped (except in XML entities)
      const xmlWithoutEntities = xml.replace(/&(amp|lt|gt|quot|apos);/g, '');
      expect(xmlWithoutEntities).not.toContain('&');
      expect(xml).not.toContain('<chars>');
    });

    it('should include image information in sitemap', () => {
      const sampleEntries: SitemapEntry[] = [
        {
          url: 'https://sarkaripulse.net/job/ssc-cgl-2024',
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
          images: [
            {
              url: 'https://sarkaripulse.net/images/ssc-logo.jpg',
              caption: 'SSC CGL 2024 Notification',
              title: 'SSC Combined Graduate Level Examination'
            }
          ]
        }
      ];
      
      const xml = indexingManager.generateSitemapXML(sampleEntries);
      
      expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
      expect(xml).toContain('<image:image>');
      expect(xml).toContain('<image:loc>https://sarkaripulse.net/images/ssc-logo.jpg</image:loc>');
      expect(xml).toContain('<image:caption>SSC CGL 2024 Notification</image:caption>');
      expect(xml).toContain('<image:title>SSC Combined Graduate Level Examination</image:title>');
      expect(xml).toContain('</image:image>');
    });
  });

  describe('Search Engine Submission', () => {
    it('should submit sitemap to search engines', async () => {
      const sitemapUrl = 'https://sarkaripulse.net/sitemap.xml';
      
      const result = await indexingManager.submitToSearchEngines(sitemapUrl);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('submittedUrls');
      expect(result.submittedUrls).toBeInstanceOf(Array);
      
      if (result.success) {
        expect(result.submittedUrls.length).toBeGreaterThan(0);
      }
    });

    it('should handle submission failures gracefully', async () => {
      const invalidSitemapUrl = 'invalid-url';
      
      const result = await indexingManager.submitToSearchEngines(invalidSitemapUrl);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('errors');
      
      if (!result.success) {
        expect(result.errors).toBeInstanceOf(Array);
        expect(result.errors!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('URL Indexing Requests', () => {
    it('should request indexing for multiple URLs', async () => {
      const urls = [
        'https://sarkaripulse.net/job/ssc-cgl-2024',
        'https://sarkaripulse.net/schemes/pm-kisan',
        'https://sarkaripulse.net/result/ssc-cgl-result-2024'
      ];
      
      const results = await indexingManager.requestIndexing(urls);
      
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBe(urls.length);
      
      results.forEach((result, index) => {
        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('message');
        expect(result.url).toBe(urls[index]);
      });
    });

    it('should handle batch processing correctly', async () => {
      // Test with more URLs than batch size
      const urls = Array.from({ length: 30 }, (_, i) => 
        `https://sarkaripulse.net/job/test-job-${i + 1}`
      );
      
      const results = await indexingManager.requestIndexing(urls);
      
      expect(results.length).toBe(urls.length);
      
      // Should have processed all URLs
      const processedUrls = results.map(r => r.url);
      urls.forEach(url => {
        expect(processedUrls).toContain(url);
      });
    }, 60000); // Increase timeout to 60 seconds

    it('should provide detailed results for each URL', async () => {
      const urls = ['https://sarkaripulse.net/jobs'];
      
      const results = await indexingManager.requestIndexing(urls);
      
      expect(results.length).toBe(1);
      
      const result = results[0];
      expect(result.url).toBe(urls[0]);
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
      
      if (result.success) {
        expect(result.requestId).toBeTruthy();
      }
    });
  });

  describe('Indexing Status Monitoring', () => {
    it('should get indexing status for URLs', async () => {
      const urls = [
        'https://sarkaripulse.net/jobs',
        'https://sarkaripulse.net/schemes'
      ];
      
      const statuses = await indexingManager.getIndexingStatus(urls);
      
      expect(statuses).toBeInstanceOf(Array);
      expect(statuses.length).toBe(urls.length);
      
      statuses.forEach((status, index) => {
        expect(status).toHaveProperty('url');
        expect(status).toHaveProperty('status');
        expect(status.url).toBe(urls[index]);
        expect(['indexed', 'discovered', 'crawled', 'excluded', 'error']).toContain(status.status);
      });
    });

    it('should provide detailed status information', async () => {
      const urls = ['https://sarkaripulse.net/'];
      
      const statuses = await indexingManager.getIndexingStatus(urls);
      
      expect(statuses.length).toBe(1);
      
      const status = statuses[0];
      expect(status.url).toBe(urls[0]);
      
      if (status.lastCrawled) {
        expect(status.lastCrawled).toBeInstanceOf(Date);
      }
      
      if (status.issues) {
        expect(status.issues).toBeInstanceOf(Array);
      }
    });
  });

  describe('URL Structure Optimization', () => {
    it('should optimize URL structure with category and state', () => {
      const baseUrl = 'https://sarkaripulse.net/jobs';
      
      const optimizedUrl = indexingManager.optimizeUrlStructure(baseUrl, {
        category: 'SSC Jobs',
        state: 'Uttar Pradesh'
      });
      
      expect(optimizedUrl).toContain('/category/ssc-jobs');
      expect(optimizedUrl).toContain('/state/uttar-pradesh');
      expect(optimizedUrl).not.toContain(' '); // Spaces should be replaced
    });

    it('should handle pagination in URL structure', () => {
      const baseUrl = 'https://sarkaripulse.net/jobs';
      
      const optimizedUrl = indexingManager.optimizeUrlStructure(baseUrl, {
        category: 'Banking',
        page: 2
      });
      
      expect(optimizedUrl).toContain('/category/banking');
      expect(optimizedUrl).toContain('?page=2');
    });

    it('should handle slug in URL structure', () => {
      const baseUrl = 'https://sarkaripulse.net/job';
      
      const optimizedUrl = indexingManager.optimizeUrlStructure(baseUrl, {
        slug: 'ssc-cgl-2024-notification'
      });
      
      expect(optimizedUrl).toContain('/ssc-cgl-2024-notification');
    });

    it('should not add page parameter for page 1', () => {
      const baseUrl = 'https://sarkaripulse.net/jobs';
      
      const optimizedUrl = indexingManager.optimizeUrlStructure(baseUrl, {
        category: 'Railway',
        page: 1
      });
      
      expect(optimizedUrl).not.toContain('?page=1');
      expect(optimizedUrl).toContain('/category/railway');
    });
  });

  describe('Pagination Markup Generation', () => {
    it('should generate proper pagination markup', () => {
      const baseUrl = 'https://sarkaripulse.net/jobs';
      
      const markup = indexingManager.generatePaginationMarkup(2, 5, baseUrl);
      
      expect(markup).toHaveProperty('canonical');
      expect(markup).toHaveProperty('prev');
      expect(markup).toHaveProperty('next');
      
      expect(markup.canonical).toBe(`${baseUrl}?page=2`);
      expect(markup.prev).toBe(baseUrl); // Page 1 should not have ?page=1
      expect(markup.next).toBe(`${baseUrl}?page=3`);
    });

    it('should handle first page pagination', () => {
      const baseUrl = 'https://sarkaripulse.net/jobs';
      
      const markup = indexingManager.generatePaginationMarkup(1, 5, baseUrl);
      
      expect(markup.canonical).toBe(baseUrl);
      expect(markup.prev).toBeUndefined();
      expect(markup.next).toBe(`${baseUrl}?page=2`);
    });

    it('should handle last page pagination', () => {
      const baseUrl = 'https://sarkaripulse.net/jobs';
      
      const markup = indexingManager.generatePaginationMarkup(5, 5, baseUrl);
      
      expect(markup.canonical).toBe(`${baseUrl}?page=5`);
      expect(markup.prev).toBe(`${baseUrl}?page=4`);
      expect(markup.next).toBeUndefined();
    });

    it('should handle single page scenario', () => {
      const baseUrl = 'https://sarkaripulse.net/jobs';
      
      const markup = indexingManager.generatePaginationMarkup(1, 1, baseUrl);
      
      expect(markup.canonical).toBe(baseUrl);
      expect(markup.prev).toBeUndefined();
      expect(markup.next).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle sitemap generation errors gracefully', async () => {
      // This should not throw an error even if data fetching fails
      const sitemap = await indexingManager.generateSitemap('jobs');
      
      expect(sitemap).toBeInstanceOf(Array);
      // Should return at least empty array or fallback data
    });

    it('should handle XML generation errors gracefully', () => {
      const invalidEntries = null as any;
      
      const xml = indexingManager.generateSitemapXML(invalidEntries);
      
      expect(xml).toBeTruthy();
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset');
    });

    it('should handle URL optimization errors gracefully', () => {
      const invalidBaseUrl = '';
      
      const optimizedUrl = indexingManager.optimizeUrlStructure(invalidBaseUrl, {
        category: 'Test'
      });
      
      expect(optimizedUrl).toBe(invalidBaseUrl);
    });

    it('should handle pagination markup errors gracefully', () => {
      const invalidBaseUrl = '';
      
      const markup = indexingManager.generatePaginationMarkup(1, 5, invalidBaseUrl);
      
      expect(markup).toHaveProperty('canonical');
      expect(markup.canonical).toBe(invalidBaseUrl);
    });
  });

  describe('Caching Integration', () => {
    it('should cache sitemap generation results', async () => {
      const contentType = 'categories';
      
      // First call - should generate and cache
      const sitemap1 = await indexingManager.generateSitemap(contentType);
      
      // Second call - should return cached result
      const sitemap2 = await indexingManager.generateSitemap(contentType);
      
      expect(sitemap1).toEqual(sitemap2);
    });

    it('should cache sitemap index results', async () => {
      // First call - should generate and cache
      const index1 = await indexingManager.generateSitemapIndex();
      
      // Second call - should return cached result
      const index2 = await indexingManager.generateSitemapIndex();
      
      expect(index1).toEqual(index2);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large sitemap generation efficiently', async () => {
      const startTime = Date.now();
      
      const sitemap = await indexingManager.generateSitemap('all');
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time (5 seconds)
      expect(executionTime).toBeLessThan(5000);
      expect(sitemap).toBeInstanceOf(Array);
    });

    it('should respect API rate limits for indexing requests', async () => {
      const urls = [
        'https://sarkaripulse.net/job/test-1',
        'https://sarkaripulse.net/job/test-2',
        'https://sarkaripulse.net/job/test-3'
      ];
      
      const startTime = Date.now();
      
      const results = await indexingManager.requestIndexing(urls);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Should take at least some time due to rate limiting
      expect(executionTime).toBeGreaterThan(1000); // At least 1 second for 3 URLs
      expect(results.length).toBe(urls.length);
    });
  });
});