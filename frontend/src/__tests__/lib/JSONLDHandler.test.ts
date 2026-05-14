/**
 * Unit tests for JSONLDHandler class
 * Tests consistent serialization, validation, and priority management
 */

import { JSONLDHandler } from '../../lib/hydration/JSONLDHandler';
import { ValidationResult } from '../../lib/hydration/types';

describe('JSONLDHandler', () => {
  let handler: JSONLDHandler;

  beforeEach(() => {
    handler = new JSONLDHandler(false); // Disable debug mode for tests
  });

  afterEach(() => {
    handler.clear();
  });

  describe('Basic Operations', () => {
    test('should add and retrieve structured data', () => {
      const testData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Test Site',
        url: 'https://example.com'
      };

      handler.addStructuredData(testData, 'website', 1);
      const retrieved = handler.getStructuredData('website');

      expect(retrieved).toBeDefined();
      expect(retrieved?.key).toBe('website');
      expect(retrieved?.data).toEqual(testData);
      expect(retrieved?.priority).toBe(1);
    });

    test('should remove structured data', () => {
      const testData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test Org'
      };

      handler.addStructuredData(testData, 'org', 0);
      expect(handler.getStructuredData('org')).toBeDefined();

      const removed = handler.removeStructuredData('org');
      expect(removed).toBe(true);
      expect(handler.getStructuredData('org')).toBeUndefined();
    });

    test('should return false when removing non-existent data', () => {
      const removed = handler.removeStructuredData('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('Serialization Consistency', () => {
    test('should produce consistent serialization for same data', () => {
      const testData = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: 'Software Engineer',
        hiringOrganization: {
          '@type': 'Organization',
          name: 'Tech Corp'
        },
        jobLocation: {
          '@type': 'Place',
          address: 'New York'
        }
      };

      const serialized1 = handler.serializeData(testData);
      const serialized2 = handler.serializeData(testData);

      expect(serialized1).toBe(serialized2);
    });

    test('should sort object keys for consistent serialization', () => {
      const data1 = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test',
        url: 'https://example.com'
      };

      const data2 = {
        url: 'https://example.com',
        name: 'Test',
        '@type': 'Organization',
        '@context': 'https://schema.org'
      };

      const serialized1 = handler.serializeData(data1);
      const serialized2 = handler.serializeData(data2);

      expect(serialized1).toBe(serialized2);
    });

    test('should escape special characters for HTML safety', () => {
      const testData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test <script>alert("xss")</script> Article'
      };

      const serialized = handler.serializeData(testData);
      expect(serialized).not.toContain('<script>');
      expect(serialized).toContain('\\u003cscript\\u003e');
    });
  });

  describe('Priority Management', () => {
    test('should sort structured data by priority', () => {
      const lowPriority = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Low' };
      const highPriority = { '@context': 'https://schema.org', '@type': 'Organization', name: 'High' };
      const mediumPriority = { '@context': 'https://schema.org', '@type': 'Article', headline: 'Medium' };

      handler.addStructuredData(lowPriority, 'low', 1);
      handler.addStructuredData(highPriority, 'high', 10);
      handler.addStructuredData(mediumPriority, 'medium', 5);

      const allData = handler.getAllStructuredData();
      expect(allData).toHaveLength(3);
      expect(allData[0].key).toBe('high');
      expect(allData[1].key).toBe('medium');
      expect(allData[2].key).toBe('low');
    });

    test('should handle equal priorities consistently', () => {
      const data1 = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Site1' };
      const data2 = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Site2' };

      handler.addStructuredData(data1, 'site1', 5);
      handler.addStructuredData(data2, 'site2', 5);

      const allData = handler.getAllStructuredData();
      expect(allData).toHaveLength(2);
      expect(allData[0].priority).toBe(5);
      expect(allData[1].priority).toBe(5);
    });
  });

  describe('Schema Validation', () => {
    test('should validate valid JSON-LD schema', () => {
      const validData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Valid Org',
        url: 'https://example.com'
      };

      const result = handler.validateSchema(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject data without @context', () => {
      const invalidData = {
        '@type': 'Organization',
        name: 'Invalid Org'
      };

      const result = handler.validateSchema(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required @context property');
    });

    test('should reject data without @type', () => {
      const invalidData = {
        '@context': 'https://schema.org',
        name: 'Invalid Data'
      };

      const result = handler.validateSchema(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required @type property');
    });

    test('should validate JobPosting schema requirements', () => {
      const incompleteJob = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting'
        // Missing required fields
      };

      const result = handler.validateSchema(incompleteJob);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('JobPosting must have a title property');
      expect(result.errors).toContain('JobPosting must have a hiringOrganization property');
    });

    test('should provide warnings for missing recommended fields', () => {
      const minimalOrg = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Minimal Org'
        // Missing recommended url
      };

      const result = handler.validateSchema(minimalOrg);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Organization should have a url property');
    });

    test('should detect circular references', () => {
      const circularData: any = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Circular Org'
      };
      circularData.self = circularData; // Create circular reference

      const result = handler.validateSchema(circularData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Circular reference detected in data structure');
    });
  });

  describe('Update Operations', () => {
    test('should update existing structured data', () => {
      const originalData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Original Name'
      };

      const updatedData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Updated Name',
        url: 'https://example.com'
      };

      handler.addStructuredData(originalData, 'org', 5);
      handler.updateStructuredData('org', updatedData, 10);

      const retrieved = handler.getStructuredData('org');
      expect(retrieved?.data).toEqual(updatedData);
      expect(retrieved?.priority).toBe(10);
    });

    test('should throw error when updating non-existent data', () => {
      const newData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'New Org'
      };

      expect(() => {
        handler.updateStructuredData('non-existent', newData);
      }).toThrow('Structured data with key "non-existent" not found');
    });

    test('should preserve dependencies when updating', () => {
      const originalData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Original'
      };

      handler.addStructuredData(originalData, 'article', 1, ['website']);

      const updatedData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Updated'
      };

      handler.updateStructuredData('article', updatedData);

      const retrieved = handler.getStructuredData('article');
      expect(retrieved?.dependencies).toEqual(['website']);
    });
  });

  describe('Dependencies', () => {
    test('should check dependency satisfaction', () => {
      const websiteData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Test Site'
      };

      const articleData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test Article'
      };

      handler.addStructuredData(websiteData, 'website', 1);
      handler.addStructuredData(articleData, 'article', 2, ['website']);

      expect(handler.areDependenciesSatisfied('article')).toBe(true);
      expect(handler.areDependenciesSatisfied('website')).toBe(true);
    });

    test('should detect unsatisfied dependencies', () => {
      const articleData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test Article'
      };

      handler.addStructuredData(articleData, 'article', 1, ['website']);

      expect(handler.areDependenciesSatisfied('article')).toBe(false);
    });
  });

  describe('Serialized Scripts Generation', () => {
    test('should generate serialized scripts in priority order', () => {
      const data1 = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Site' };
      const data2 = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Org' };

      handler.addStructuredData(data1, 'site', 1);
      handler.addStructuredData(data2, 'org', 10);

      const scripts = handler.getSerializedScripts();
      expect(scripts).toHaveLength(2);
      expect(scripts[0].key).toBe('org');
      expect(scripts[1].key).toBe('site');
      expect(scripts[0].priority).toBe(10);
      expect(scripts[1].priority).toBe(1);
    });

    test('should include serialized content in scripts', () => {
      const testData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Test Site'
      };

      handler.addStructuredData(testData, 'site', 1);
      const scripts = handler.getSerializedScripts();

      expect(scripts[0].content).toBeDefined();
      // Content is escaped for HTML safety
      expect(scripts[0].content).toContain('\\u0022@context\\u0022:\\u0022https://schema.org\\u0022');
      expect(scripts[0].content).toContain('\\u0022@type\\u0022:\\u0022WebSite\\u0022');
    });
  });

  describe('Statistics and Monitoring', () => {
    test('should provide accurate statistics', () => {
      const data1 = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Site1' };
      const data2 = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Org1' };

      handler.addStructuredData(data1, 'site', 1);
      handler.addStructuredData(data2, 'org', 2);

      const stats = handler.getStats();
      expect(stats.count).toBe(2);
      expect(stats.keys).toContain('site');
      expect(stats.keys).toContain('org');
      expect(stats.totalSize).toBeGreaterThan(0);
    });

    test('should clear all data', () => {
      const testData = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Test' };
      handler.addStructuredData(testData, 'test', 1);

      expect(handler.getStats().count).toBe(1);

      handler.clear();

      expect(handler.getStats().count).toBe(0);
      expect(handler.getStructuredData('test')).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    test('should throw HydrationError for invalid data', () => {
      const invalidData = {
        '@type': 'Invalid'
        // Missing @context
      };

      expect(() => {
        handler.addStructuredData(invalidData, 'invalid', 1);
      }).toThrow();
    });

    test('should handle serialization errors gracefully', () => {
      const circularData: any = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test'
      };
      circularData.circular = circularData;

      expect(() => {
        handler.serializeData(circularData);
      }).toThrow('Serialization failed');
    });
  });

  describe('URL Validation', () => {
    test('should validate proper URLs', () => {
      const dataWithValidUrl = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test Org',
        url: 'https://example.com'
      };

      const result = handler.validateSchema(dataWithValidUrl);
      expect(result.valid).toBe(true);
    });

    test('should warn about invalid URLs', () => {
      const dataWithInvalidUrl = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test Org',
        url: 'not-a-valid-url'
      };

      const result = handler.validateSchema(dataWithInvalidUrl);
      expect(result.valid).toBe(true); // Still valid, just a warning
      expect(result.warnings.some(w => w.includes('Invalid URL format'))).toBe(true);
    });

    test('should accept relative URLs', () => {
      const dataWithRelativeUrl = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test Org',
        url: '/about'
      };

      const result = handler.validateSchema(dataWithRelativeUrl);
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes('Invalid URL format'))).toBe(false);
    });
  });
});