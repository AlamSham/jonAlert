// Property-Based Tests for Meta Optimizer
// Tests the universal properties for canonical URLs and hreflang tags

import { describe, it, expect, beforeEach } from '@jest/globals';
import fc from 'fast-check';
import { metaOptimizer } from '../meta-optimizer';
import { SEO_CONFIG } from '../config';

// Arbitraries for generating test data
const pathArbitrary = (): fc.Arbitrary<string> => 
  fc.oneof(
    fc.constant('/'),
    fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/[^a-zA-Z0-9-_]/g, '')}`),
    fc.tuple(
      fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9-_]/g, '')),
      fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9-_]/g, ''))
    ).map(([category, slug]) => `/${category}/${slug}`)
  );

const urlParamsArbitrary = (): fc.Arbitrary<URLSearchParams> =>
  fc.record({
    page: fc.option(fc.integer({ min: 1, max: 100 }).map(n => n.toString())),
    q: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
    category: fc.option(fc.constantFrom('job', 'result', 'admit-card'))
  }).map(params => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });
    return urlParams;
  });

const pageDataArbitrary = (): fc.Arbitrary<any> =>
  fc.record({
    url: pathArbitrary(),
    title: fc.string({ minLength: 5, maxLength: 100 }),
    description: fc.string({ minLength: 20, maxLength: 200 }),
    pageType: fc.constantFrom('detail', 'category', 'state', 'search', 'homepage'),
    category: fc.option(fc.constantFrom('job', 'result', 'admit-card', 'scheme')),
    state: fc.option(fc.string({ minLength: 2, maxLength: 20 }))
  });

describe('Feature: advanced-seo-improvements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 4: Canonical URL Format Consistency', () => {
    it('should generate valid canonical URLs for any path input', async () => {
      await fc.assert(fc.asyncProperty(
        pathArbitrary(),
        fc.option(urlParamsArbitrary()),
        async (path, params) => {
          const canonicalUrl = metaOptimizer.generateCanonicalUrl(path, params || undefined);
          
          // Should be a valid URL
          expect(() => new URL(canonicalUrl)).not.toThrow();
          
          // Should start with the site URL
          expect(canonicalUrl).toMatch(/^https:\/\/sarkaripulse\.net/);
          
          // Should not have duplicate slashes (except in protocol)
          const pathPart = canonicalUrl.replace('https://', '');
          expect(pathPart).not.toMatch(/\/\//);
          
          // Should not end with slash unless it's root
          if (canonicalUrl !== SEO_CONFIG.SITE_URL + '/') {
            expect(canonicalUrl).not.toMatch(/\/$/);
          }
          
          // Should not contain invalid characters in path
          const url = new URL(canonicalUrl);
          expect(url.pathname).toMatch(/^[\/a-zA-Z0-9\-_]*$/);
        }
      ), { numRuns: 100 });
    });

    it('should handle edge cases for canonical URL generation', async () => {
      const edgeCases = [
        '', // Empty path
        '/', // Root path
        '//', // Double slash
        '///multiple//slashes///', // Multiple slashes
        '/path/with/trailing/', // Trailing slash
        '/path-with-dashes', // Dashes
        '/path_with_underscores', // Underscores
        '/very/deep/nested/path/structure' // Deep nesting
      ];

      for (const path of edgeCases) {
        const canonicalUrl = metaOptimizer.generateCanonicalUrl(path);
        
        // Should always be a valid URL
        expect(() => new URL(canonicalUrl)).not.toThrow();
        
        // Should start with site URL
        expect(canonicalUrl).toMatch(/^https:\/\/sarkaripulse\.net/);
        
        // Should not have duplicate slashes in path
        const pathPart = canonicalUrl.replace('https://sarkaripulse.net', '');
        if (pathPart.length > 1) {
          expect(pathPart).not.toMatch(/\/\//);
          expect(pathPart).not.toMatch(/\/$/);
        }
      }
    });

    it('should properly handle URL parameters', async () => {
      const path = '/jobs';
      const params = new URLSearchParams();
      params.set('page', '2');
      params.set('category', 'government');
      
      const canonicalUrl = metaOptimizer.generateCanonicalUrl(path, params);
      
      // Should include page parameter but not page=1
      expect(canonicalUrl).toContain('page=2');
      
      // Test page=1 exclusion
      params.set('page', '1');
      const canonicalUrlPage1 = metaOptimizer.generateCanonicalUrl(path, params);
      expect(canonicalUrlPage1).not.toContain('page=1');
    });
  });

  describe('Property 5: Hreflang Tag Completeness', () => {
    it('should generate complete hreflang tags for any page data', async () => {
      await fc.assert(fc.asyncProperty(
        pageDataArbitrary(),
        async (pageData) => {
          const hreflangTags = metaOptimizer.generateHreflangTags(pageData);
          
          // Should have at least the required language variations
          expect(hreflangTags.length).toBeGreaterThanOrEqual(3);
          
          // Should include Hindi (India) as primary
          const hiInTag = hreflangTags.find(tag => tag.hreflang === 'hi-IN');
          expect(hiInTag).toBeDefined();
          expect(() => new URL(hiInTag!.href)).not.toThrow();
          
          // Should include English (India) as secondary
          const enInTag = hreflangTags.find(tag => tag.hreflang === 'en-IN');
          expect(enInTag).toBeDefined();
          expect(() => new URL(enInTag!.href)).not.toThrow();
          
          // Should include x-default for international users
          const defaultTag = hreflangTags.find(tag => tag.hreflang === 'x-default');
          expect(defaultTag).toBeDefined();
          expect(() => new URL(defaultTag!.href)).not.toThrow();
          
          // All URLs should be valid
          hreflangTags.forEach(tag => {
            expect(() => new URL(tag.href)).not.toThrow();
            expect(tag.href).toMatch(/^https:\/\/sarkaripulse\.net/);
          });
          
          // Should not have duplicate hreflang values
          const hreflangValues = hreflangTags.map(tag => tag.hreflang);
          const uniqueValues = new Set(hreflangValues);
          expect(uniqueValues.size).toBe(hreflangValues.length);
        }
      ), { numRuns: 100 });
    });

    it('should handle different page types consistently', async () => {
      const pageTypes = ['detail', 'category', 'state', 'search', 'homepage'];
      
      for (const pageType of pageTypes) {
        const pageData = {
          url: '/test-page',
          pageType
        };
        
        const hreflangTags = metaOptimizer.generateHreflangTags(pageData);
        
        // Should always include required languages regardless of page type
        expect(hreflangTags.some(tag => tag.hreflang === 'hi-IN')).toBe(true);
        expect(hreflangTags.some(tag => tag.hreflang === 'en-IN')).toBe(true);
        expect(hreflangTags.some(tag => tag.hreflang === 'x-default')).toBe(true);
        
        // All URLs should be valid
        hreflangTags.forEach(tag => {
          expect(() => new URL(tag.href)).not.toThrow();
        });
      }
    });
  });

  describe('Meta Tag Generation Properties', () => {
    it('should generate valid meta tags for any page data', async () => {
      await fc.assert(fc.asyncProperty(
        pageDataArbitrary(),
        async (pageData) => {
          const metaTags = await metaOptimizer.generateMetaTags(pageData);
          
          // Title should be within limits
          expect(metaTags.title.length).toBeLessThanOrEqual(SEO_CONFIG.MAX_TITLE_LENGTH);
          expect(metaTags.title.length).toBeGreaterThan(0);
          
          // Description should be within limits
          expect(metaTags.description.length).toBeLessThanOrEqual(SEO_CONFIG.MAX_DESCRIPTION_LENGTH);
          expect(metaTags.description.length).toBeGreaterThan(0);
          
          // Canonical URL should be valid
          expect(() => new URL(metaTags.canonical)).not.toThrow();
          
          // Robots directive should be valid
          expect(['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'])
            .toContain(metaTags.robots);
          
          // Hreflang tags should be complete
          expect(metaTags.hreflang.length).toBeGreaterThanOrEqual(3);
          metaTags.hreflang.forEach(tag => {
            expect(() => new URL(tag.href)).not.toThrow();
          });
          
          // Open Graph tags should be valid
          expect(metaTags.openGraph.title.length).toBeGreaterThan(0);
          expect(metaTags.openGraph.description.length).toBeGreaterThan(0);
          expect(() => new URL(metaTags.openGraph.url)).not.toThrow();
          expect(() => new URL(metaTags.openGraph.image)).not.toThrow();
          
          // Twitter Card should be valid
          expect(metaTags.twitterCard.card).toBe('summary_large_image');
          expect(metaTags.twitterCard.title.length).toBeGreaterThan(0);
          expect(metaTags.twitterCard.description.length).toBeGreaterThan(0);
        }
      ), { numRuns: 100 });
    });
  });

  describe('Robots Directive Properties', () => {
    it('should generate appropriate robots directives for different page types', async () => {
      const pageTypes = ['detail', 'category', 'state', 'search', 'homepage'];
      
      pageTypes.forEach(pageType => {
        const robots = metaOptimizer.optimizeRobotsTags(pageType);
        
        // Should have index and follow properties
        expect(typeof robots.index).toBe('boolean');
        expect(typeof robots.follow).toBe('boolean');
        
        // Search pages should not be indexed
        if (pageType === 'search') {
          expect(robots.index).toBe(false);
        } else {
          expect(robots.index).toBe(true);
        }
        
        // All pages should allow following
        expect(robots.follow).toBe(true);
      });
    });
  });

  describe('URL Validation Properties', () => {
    it('should validate and fix meta tag issues', async () => {
      // Test with problematic meta tags
      const problematicMetaTags = {
        title: 'A'.repeat(100), // Too long
        description: 'B'.repeat(200), // Too long
        keywords: ['test'],
        robots: 'index,follow',
        canonical: 'invalid-url', // Invalid URL
        hreflang: [
          { hreflang: 'hi-IN', href: 'invalid-url' }, // Invalid URL
          { hreflang: 'en-IN', href: 'https://sarkaripulse.net/test' }
        ],
        openGraph: {
          title: 'Test',
          description: 'Test description',
          type: 'website',
          url: 'https://sarkaripulse.net/test',
          image: 'https://sarkaripulse.net/image.jpg',
          siteName: 'SarkariPulse',
          locale: 'hi_IN'
        },
        twitterCard: {
          card: 'summary_large_image',
          title: 'Test',
          description: 'Test description'
        }
      };
      
      const validation = metaOptimizer.validateAndFixMetaTags(problematicMetaTags);
      
      // Should identify issues
      expect(validation.issues.length).toBeGreaterThan(0);
      expect(validation.isValid).toBe(false);
      
      // Should fix the issues
      expect(validation.fixed.title.length).toBeLessThanOrEqual(SEO_CONFIG.MAX_TITLE_LENGTH);
      expect(validation.fixed.description.length).toBeLessThanOrEqual(SEO_CONFIG.MAX_DESCRIPTION_LENGTH);
      expect(() => new URL(validation.fixed.canonical)).not.toThrow();
      
      // Fixed hreflang URLs should be valid
      validation.fixed.hreflang.forEach(tag => {
        expect(() => new URL(tag.href)).not.toThrow();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete meta optimization workflow', async () => {
      const pageData = {
        url: '/jobs/railway-engineer-recruitment',
        title: 'Railway Engineer Recruitment 2026 - Apply Online',
        description: 'Latest railway engineer recruitment notification. 2500 vacancies. Apply online before last date.',
        keywords: ['railway', 'engineer', 'recruitment'],
        pageType: 'detail',
        category: 'job',
        content: {
          title: 'Railway Engineer Recruitment',
          category: 'job',
          organization: 'Railway Recruitment Board',
          vacancyCount: 2500,
          keywords: ['railway', 'engineer']
        }
      };
      
      const metaTags = await metaOptimizer.generateMetaTags(pageData);
      
      // Verify all components are properly generated
      expect(metaTags.title).toBe(pageData.title);
      expect(metaTags.description).toBe(pageData.description);
      expect(metaTags.canonical).toBe('https://sarkaripulse.net/jobs/railway-engineer-recruitment');
      expect(metaTags.robots).toBe('index,follow');
      
      // Verify hreflang completeness
      expect(metaTags.hreflang.length).toBeGreaterThanOrEqual(3);
      expect(metaTags.hreflang.some(tag => tag.hreflang === 'hi-IN')).toBe(true);
      
      // Verify Open Graph optimization
      expect(metaTags.openGraph.type).toBe('article'); // Detail page should be article
      expect(metaTags.openGraph.locale).toBe('hi_IN');
      
      // Verify Twitter Card
      expect(metaTags.twitterCard.card).toBe('summary_large_image');
    });
  });
});