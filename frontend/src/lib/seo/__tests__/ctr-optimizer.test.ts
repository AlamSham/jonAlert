// Property-Based Tests for CTR Optimizer
// Tests the universal properties that must hold for all inputs

import { describe, it, expect, beforeEach } from '@jest/globals';
import fc from 'fast-check';
import { ctrOptimizer } from '../ctr-optimizer';
import { SEO_CONFIG } from '../config';
import type { ContentData, OptimizationContext } from '../interfaces';

// Arbitraries for generating test data
const contentDataArbitrary = (): fc.Arbitrary<ContentData> => 
  fc.record({
    title: fc.string({ minLength: 5, maxLength: 100 }),
    category: fc.constantFrom('job', 'result', 'admit-card', 'admission', 'scholarship', 'exam-form', 'scheme'),
    state: fc.option(fc.string({ minLength: 2, maxLength: 20 })),
    organization: fc.option(fc.string({ minLength: 3, maxLength: 50 })),
    vacancyCount: fc.option(fc.integer({ min: 1, max: 10000 })),
    lastDate: fc.option(fc.date().map(d => d.toISOString())),
    keywords: fc.array(fc.string({ minLength: 2, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
    content: fc.option(fc.string({ minLength: 50, maxLength: 500 })),
    summary: fc.option(fc.string({ minLength: 20, maxLength: 200 })),
    slug: fc.option(fc.string({ minLength: 5, maxLength: 50 })),
    tags: fc.option(fc.array(fc.string({ minLength: 2, maxLength: 15 }), { maxLength: 5 })),
    qualificationLevel: fc.option(fc.string({ minLength: 2, maxLength: 20 })),
    salary: fc.option(fc.string({ minLength: 5, maxLength: 30 })),
    applyLink: fc.option(fc.webUrl()),
    eligibility: fc.option(fc.string({ minLength: 10, maxLength: 100 })),
    importantDates: fc.option(fc.string({ minLength: 10, maxLength: 100 }))
  });

const optimizationContextArbitrary = (): fc.Arbitrary<OptimizationContext> =>
  fc.record({
    pageType: fc.constantFrom('detail', 'category', 'state', 'search'),
    targetKeywords: fc.array(fc.string({ minLength: 2, maxLength: 20 }), { minLength: 1, maxLength: 8 }),
    emotionalTriggers: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 5 }),
    urgencyIndicators: fc.array(fc.string({ minLength: 2, maxLength: 15 }), { maxLength: 5 }),
    hinglishTerms: fc.array(fc.string({ minLength: 3, maxLength: 25 }), { maxLength: 5 }),
    location: fc.option(fc.string({ minLength: 2, maxLength: 20 })),
    audience: fc.option(fc.string({ minLength: 5, maxLength: 15 }))
  });

describe('Feature: advanced-seo-improvements', () => {
  beforeEach(() => {
    // Clear any cached data before each test
    jest.clearAllMocks();
  });

  describe('Property 1: Title Length Constraint', () => {
    it('should generate titles under 60 characters for any input', async () => {
      await fc.assert(fc.asyncProperty(
        contentDataArbitrary(),
        optimizationContextArbitrary(),
        async (contentData, context) => {
          const title = await ctrOptimizer.optimizeTitle(contentData, context);
          expect(title.length).toBeLessThanOrEqual(SEO_CONFIG.MAX_TITLE_LENGTH);
          expect(title.length).toBeGreaterThan(0); // Should not be empty
        }
      ), { numRuns: 100 });
    });

    it('should handle edge cases for title length', async () => {
      // Test with very long titles
      const longTitleContent: ContentData = {
        title: 'A'.repeat(200), // Very long title
        category: 'job',
        keywords: ['test']
      };
      
      const context: OptimizationContext = {
        pageType: 'detail',
        targetKeywords: ['test'],
        emotionalTriggers: [],
        urgencyIndicators: [],
        hinglishTerms: []
      };

      const result = await ctrOptimizer.optimizeTitle(longTitleContent, context);
      expect(result.length).toBeLessThanOrEqual(SEO_CONFIG.MAX_TITLE_LENGTH);
    });

    it('should preserve meaningful content when truncating', async () => {
      const content: ContentData = {
        title: 'Important Government Job Notification for Railway Department with Multiple Positions Available',
        category: 'job',
        keywords: ['railway', 'government']
      };
      
      const context: OptimizationContext = {
        pageType: 'detail',
        targetKeywords: ['railway'],
        emotionalTriggers: ['🔥'],
        urgencyIndicators: [],
        hinglishTerms: []
      };

      const result = await ctrOptimizer.optimizeTitle(content, context);
      expect(result.length).toBeLessThanOrEqual(SEO_CONFIG.MAX_TITLE_LENGTH);
      expect(result).toContain('Railway'); // Should preserve key terms
    });
  });

  describe('Property 2: Meta Description Length Constraint', () => {
    it('should generate descriptions under 155 characters for any input', async () => {
      await fc.assert(fc.asyncProperty(
        contentDataArbitrary(),
        optimizationContextArbitrary(),
        async (contentData, context) => {
          const description = await ctrOptimizer.optimizeMetaDescription(contentData, context);
          expect(description.length).toBeLessThanOrEqual(SEO_CONFIG.MAX_DESCRIPTION_LENGTH);
          expect(description.length).toBeGreaterThan(0); // Should not be empty
        }
      ), { numRuns: 100 });
    });

    it('should meet minimum length requirements when possible', async () => {
      await fc.assert(fc.asyncProperty(
        contentDataArbitrary(),
        optimizationContextArbitrary(),
        async (contentData, context) => {
          const description = await ctrOptimizer.optimizeMetaDescription(contentData, context);
          
          // If description is shorter than minimum, it should still be meaningful
          if (description.length < SEO_CONFIG.MIN_DESCRIPTION_LENGTH) {
            expect(description.length).toBeGreaterThan(50); // At least 50 chars for meaningful content
          }
        }
      ), { numRuns: 100 });
    });

    it('should handle edge cases for description length', async () => {
      // Test with minimal content
      const minimalContent: ContentData = {
        title: 'Job',
        category: 'job',
        keywords: ['job']
      };
      
      const context: OptimizationContext = {
        pageType: 'detail',
        targetKeywords: ['job'],
        emotionalTriggers: [],
        urgencyIndicators: [],
        hinglishTerms: []
      };

      const result = await ctrOptimizer.optimizeMetaDescription(minimalContent, context);
      expect(result.length).toBeLessThanOrEqual(SEO_CONFIG.MAX_DESCRIPTION_LENGTH);
      expect(result.length).toBeGreaterThan(20); // Should have meaningful content
    });
  });

  describe('Property 3: Hinglish Keyword Inclusion', () => {
    it('should include Hinglish keywords when provided', async () => {
      await fc.assert(fc.asyncProperty(
        contentDataArbitrary(),
        fc.record({
          pageType: fc.constantFrom('detail', 'category', 'state', 'search'),
          targetKeywords: fc.array(fc.string({ minLength: 2, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
          emotionalTriggers: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 3 }),
          urgencyIndicators: fc.array(fc.string({ minLength: 2, maxLength: 15 }), { maxLength: 3 }),
          hinglishTerms: fc.array(
            fc.constantFrom('kaise karein', 'apply karein', 'check karein', 'jaldi', 'bilkul free'),
            { minLength: 1, maxLength: 3 }
          )
        }),
        async (contentData, context) => {
          if (context.hinglishTerms.length === 0) return; // Skip if no Hinglish terms
          
          const title = await ctrOptimizer.optimizeTitle(contentData, context);
          const description = await ctrOptimizer.optimizeMetaDescription(contentData, context);
          
          // At least one Hinglish term should be present in title or description
          const combinedText = `${title} ${description}`.toLowerCase();
          const hasHinglishTerm = context.hinglishTerms.some(term => 
            combinedText.includes(term.toLowerCase())
          );
          
          // Allow for cases where Hinglish terms couldn't be included due to length constraints
          if (title.length < SEO_CONFIG.MAX_TITLE_LENGTH - 10 || 
              description.length < SEO_CONFIG.MAX_DESCRIPTION_LENGTH - 20) {
            expect(hasHinglishTerm).toBe(true);
          }
        }
      ), { numRuns: 100 });
    });

    it('should handle Hinglish integration gracefully', async () => {
      const content: ContentData = {
        title: 'Railway Jobs 2026',
        category: 'job',
        keywords: ['railway', 'jobs']
      };
      
      const context: OptimizationContext = {
        pageType: 'detail',
        targetKeywords: ['railway'],
        emotionalTriggers: [],
        urgencyIndicators: [],
        hinglishTerms: ['apply karein', 'jaldi']
      };

      const title = await ctrOptimizer.optimizeTitle(content, context);
      const description = await ctrOptimizer.optimizeMetaDescription(content, context);
      
      const combinedText = `${title} ${description}`.toLowerCase();
      const hasHinglish = context.hinglishTerms.some(term => 
        combinedText.includes(term.toLowerCase())
      );
      
      expect(hasHinglish).toBe(true);
    });
  });

  describe('Property 4: Content Consistency', () => {
    it('should generate consistent results for identical inputs', async () => {
      const content: ContentData = {
        title: 'SSC CGL Notification 2026',
        category: 'job',
        organization: 'Staff Selection Commission',
        vacancyCount: 1000,
        keywords: ['ssc', 'cgl', 'government']
      };
      
      const context: OptimizationContext = {
        pageType: 'detail',
        targetKeywords: ['ssc', 'cgl'],
        emotionalTriggers: ['🔥'],
        urgencyIndicators: ['URGENT'],
        hinglishTerms: ['apply karein']
      };

      // Generate multiple times with same input
      const results = await Promise.all([
        ctrOptimizer.optimizeTitle(content, context),
        ctrOptimizer.optimizeTitle(content, context),
        ctrOptimizer.optimizeTitle(content, context)
      ]);

      // Results should be identical for same input (deterministic)
      expect(results[0]).toBe(results[1]);
      expect(results[1]).toBe(results[2]);
    });
  });

  describe('Property 5: Required Content Preservation', () => {
    it('should preserve essential content elements', async () => {
      await fc.assert(fc.asyncProperty(
        contentDataArbitrary(),
        optimizationContextArbitrary(),
        async (contentData, context) => {
          const title = await ctrOptimizer.optimizeTitle(contentData, context);
          
          // Title should contain some reference to the original title or category
          const titleWords = contentData.title.toLowerCase().split(' ');
          const significantWords = titleWords.filter(word => word.length > 3);
          
          if (significantWords.length > 0) {
            const hasSignificantWord = significantWords.some(word => 
              title.toLowerCase().includes(word)
            );
            
            // Should preserve at least one significant word or category reference
            const categoryLabels = ['job', 'result', 'admit', 'admission', 'scholarship', 'exam', 'scheme'];
            const hasCategoryRef = categoryLabels.some(label => 
              title.toLowerCase().includes(label)
            );
            
            expect(hasSignificantWord || hasCategoryRef).toBe(true);
          }
        }
      ), { numRuns: 100 });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete optimization workflow', async () => {
      const content: ContentData = {
        title: 'Railway Recruitment Board Junior Engineer Notification',
        category: 'job',
        state: 'All India',
        organization: 'Railway Recruitment Board',
        vacancyCount: 2500,
        lastDate: '2026-02-15',
        qualificationLevel: 'Diploma/Degree',
        keywords: ['railway', 'engineer', 'rrb']
      };
      
      const context: OptimizationContext = {
        pageType: 'detail',
        targetKeywords: ['railway', 'engineer', 'rrb'],
        emotionalTriggers: ['🔥', '⚡'],
        urgencyIndicators: ['URGENT', 'LIMITED TIME'],
        hinglishTerms: ['apply karein', 'jaldi', 'last date']
      };

      const title = await ctrOptimizer.optimizeTitle(content, context);
      const description = await ctrOptimizer.optimizeMetaDescription(content, context);

      // Verify all constraints
      expect(title.length).toBeLessThanOrEqual(SEO_CONFIG.MAX_TITLE_LENGTH);
      expect(description.length).toBeLessThanOrEqual(SEO_CONFIG.MAX_DESCRIPTION_LENGTH);
      
      // Verify content quality
      expect(title).toContain('Railway');
      expect(description).toContain('2500');
      expect(description.toLowerCase()).toMatch(/apply|karein/);
      
      // Verify emotional triggers
      expect(title).toMatch(/[🔥⚡]/);
    });

    it('should generate variations with consistent constraints', async () => {
      const baseTitle = 'Government Job Notification 2026';
      const variations = await ctrOptimizer.generateVariations(baseTitle, 5);
      
      // All variations should meet length constraint
      variations.forEach(variation => {
        expect(variation.length).toBeLessThanOrEqual(SEO_CONFIG.MAX_TITLE_LENGTH);
        expect(variation.length).toBeGreaterThan(0);
      });
      
      // Should have requested number of variations
      expect(variations.length).toBeLessThanOrEqual(5);
      expect(variations.length).toBeGreaterThan(0);
    });
  });
});