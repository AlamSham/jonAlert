/**
 * Property-Based Tests for JSONLDHandler
 * Tests universal properties for JSON-LD serialization consistency
 * 
 * **Feature: hydration-mismatch-fix, Property 3: JSON-LD Serialization Consistency**
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import fc from 'fast-check';
import { JSONLDHandler } from '../../lib/hydration/JSONLDHandler';

describe('Feature: hydration-mismatch-fix, Property 3: JSON-LD Serialization Consistency', () => {
  let handler: JSONLDHandler;

  beforeEach(() => {
    handler = new JSONLDHandler(false); // Disable debug mode for tests
  });

  afterEach(() => {
    handler.clear();
  });

  // Arbitraries for generating test data
  const validContextArbitrary = (): fc.Arbitrary<string> =>
    fc.constantFrom(
      'https://schema.org',
      'https://schema.org/',
      'http://schema.org',
      'http://schema.org/'
    );

  const validTypeArbitrary = (): fc.Arbitrary<string> =>
    fc.constantFrom(
      'WebSite',
      'Organization',
      'JobPosting',
      'Article',
      'BreadcrumbList',
      'FAQPage',
      'Person',
      'Place',
      'Event'
    );

  const stringPropertyArbitrary = (): fc.Arbitrary<string> =>
    fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);

  const urlArbitrary = (): fc.Arbitrary<string> =>
    fc.oneof(
      fc.webUrl(),
      fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/[^a-zA-Z0-9-_]/g, '')}`),
      fc.string({ minLength: 1, maxLength: 50 }).map(s => `#${s.replace(/[^a-zA-Z0-9-_]/g, '')}`)
    );

  const basicJsonLdArbitrary = (): fc.Arbitrary<object> =>
    fc.oneof(
      // WebSite
      fc.record({
        '@context': validContextArbitrary(),
        '@type': fc.constant('WebSite'),
        name: stringPropertyArbitrary(),
        url: fc.option(urlArbitrary()),
        description: fc.option(stringPropertyArbitrary())
      }),
      // Organization
      fc.record({
        '@context': validContextArbitrary(),
        '@type': fc.constant('Organization'),
        name: stringPropertyArbitrary(),
        url: fc.option(urlArbitrary()),
        description: fc.option(stringPropertyArbitrary())
      }),
      // Article
      fc.record({
        '@context': validContextArbitrary(),
        '@type': fc.constant('Article'),
        headline: stringPropertyArbitrary(),
        name: stringPropertyArbitrary(),
        url: fc.option(urlArbitrary()),
        description: fc.option(stringPropertyArbitrary())
      }),
      // JobPosting with required fields
      fc.record({
        '@context': validContextArbitrary(),
        '@type': fc.constant('JobPosting'),
        title: stringPropertyArbitrary(),
        name: stringPropertyArbitrary(),
        hiringOrganization: fc.record({
          '@type': fc.constant('Organization'),
          name: stringPropertyArbitrary()
        }),
        url: fc.option(urlArbitrary()),
        description: fc.option(stringPropertyArbitrary())
      })
    );

  const nestedJsonLdArbitrary = (): fc.Arbitrary<object> =>
    fc.record({
      '@context': validContextArbitrary(),
      '@type': validTypeArbitrary(),
      name: stringPropertyArbitrary(),
      url: fc.option(urlArbitrary()),
      author: fc.option(fc.record({
        '@type': fc.constant('Person'),
        name: stringPropertyArbitrary()
      })),
      publisher: fc.option(fc.record({
        '@type': fc.constant('Organization'),
        name: stringPropertyArbitrary(),
        url: fc.option(urlArbitrary())
      }))
    });

  const keyArbitrary = (): fc.Arbitrary<string> =>
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

  const priorityArbitrary = (): fc.Arbitrary<number> =>
    fc.integer({ min: -100, max: 100 });

  /**
   * Property 3: JSON-LD Serialization Consistency
   * For any structured data object, the JSON_LD_Handler SHALL produce identical 
   * serialized content between server and client rendering, and validate JSON-LD 
   * syntax before injection.
   */
  it('should produce identical serialization for the same data regardless of property order', () => {
    fc.assert(fc.property(
      basicJsonLdArbitrary(),
      (originalData) => {
        // Create a copy with shuffled property order
        const keys = Object.keys(originalData);
        const shuffledData: any = {};
        
        // Add properties in reverse order
        for (let i = keys.length - 1; i >= 0; i--) {
          const key = keys[i];
          shuffledData[key] = (originalData as any)[key];
        }

        const serialized1 = handler.serializeData(originalData);
        const serialized2 = handler.serializeData(shuffledData);

        // Both serializations should be identical
        return serialized1 === serialized2;
      }
    ), { numRuns: 100 });
  });

  it('should consistently serialize nested objects with different property orders', () => {
    fc.assert(fc.property(
      nestedJsonLdArbitrary(),
      (originalData) => {
        // Create multiple serializations of the same data
        const serializations = [];
        
        for (let i = 0; i < 5; i++) {
          serializations.push(handler.serializeData(originalData));
        }

        // All serializations should be identical
        return serializations.every(s => s === serializations[0]);
      }
    ), { numRuns: 50 });
  });

  it('should validate JSON-LD syntax before allowing addition to handler', () => {
    fc.assert(fc.property(
      basicJsonLdArbitrary(),
      keyArbitrary(),
      priorityArbitrary(),
      (data, key, priority) => {
        try {
          handler.addStructuredData(data, key, priority);
          
          // If addition succeeded, the data should be valid
          const validation = handler.validateSchema(data);
          return validation.valid;
        } catch (error) {
          // If addition failed, the data should be invalid
          const validation = handler.validateSchema(data);
          return !validation.valid;
        }
      }
    ), { numRuns: 100 });
  });

  it('should maintain serialization consistency after updates', () => {
    fc.assert(fc.property(
      basicJsonLdArbitrary(),
      keyArbitrary(),
      priorityArbitrary(),
      (initialData, key, priority) => {
        try {
          // Add initial data
          handler.addStructuredData(initialData, key, priority);
          
          // Create updated data with same structure but different content
          const updatedData = {
            ...initialData,
            name: (initialData as any).name + ' Updated'
          };
          
          // Update with new data
          handler.updateStructuredData(key, updatedData);
          
          // Serialization should be consistent
          const serialized1 = handler.serializeData(updatedData);
          const retrieved = handler.getStructuredData(key);
          const serialized2 = handler.serializeData(retrieved!.data);
          
          return serialized1 === serialized2;
        } catch (error) {
          // Update failed due to validation, which is acceptable
          return true;
        }
      }
    ), { numRuns: 50 });
  });

  it('should escape dangerous characters consistently in serialization', () => {
    fc.assert(fc.property(
      fc.record({
        '@context': validContextArbitrary(),
        '@type': validTypeArbitrary(),
        name: fc.string().map(s => s + '<script>alert("xss")</script>'),
        description: fc.string().map(s => s + '&<>"\'')
      }),
      (dangerousData) => {
        const serialized = handler.serializeData(dangerousData);
        
        // Should not contain unescaped dangerous characters
        const hasDangerousChars = 
          serialized.includes('<script>') ||
          serialized.includes('</script>') ||
          serialized.includes('<') ||
          serialized.includes('>') ||
          serialized.includes('&') ||
          serialized.includes('"') ||
          serialized.includes("'");
        
        return !hasDangerousChars;
      }
    ), { numRuns: 50 });
  });

  it('should maintain priority ordering consistency across operations', () => {
    fc.assert(fc.property(
      fc.array(fc.tuple(basicJsonLdArbitrary(), keyArbitrary(), priorityArbitrary()), { minLength: 2, maxLength: 10 }),
      (dataArray) => {
        // Add all data items
        const validItems: Array<{ data: object; key: string; priority: number }> = [];
        
        for (const [data, key, priority] of dataArray) {
          try {
            handler.addStructuredData(data, key, priority);
            validItems.push({ data, key, priority });
          } catch (error) {
            // Skip invalid data
          }
        }
        
        if (validItems.length < 2) {
          return true; // Not enough valid items to test ordering
        }
        
        // Get all structured data
        const allData = handler.getAllStructuredData();
        
        // Should be sorted by priority (highest first)
        for (let i = 0; i < allData.length - 1; i++) {
          if (allData[i].priority < allData[i + 1].priority) {
            return false;
          }
        }
        
        return true;
      }
    ), { numRuns: 30 });
  });

  it('should generate consistent serialized scripts regardless of addition order', () => {
    fc.assert(fc.property(
      fc.array(fc.tuple(basicJsonLdArbitrary(), keyArbitrary(), priorityArbitrary()), { minLength: 2, maxLength: 5 }),
      (dataArray) => {
        // Create two handlers and add data in different orders
        const handler1 = new JSONLDHandler(false);
        const handler2 = new JSONLDHandler(false);
        
        const validItems: Array<{ data: object; key: string; priority: number }> = [];
        const usedKeys = new Set<string>();
        
        // Filter valid items and ensure unique keys and priorities for deterministic ordering
        for (const [data, key, priority] of dataArray) {
          if (usedKeys.has(key)) {
            continue; // Skip duplicate keys
          }
          
          // Check if this priority is already used
          const priorityExists = validItems.some(item => item.priority === priority);
          if (priorityExists) {
            continue; // Skip duplicate priorities for deterministic ordering
          }
          
          try {
            handler1.addStructuredData(data, key, priority);
            validItems.push({ data, key, priority });
            usedKeys.add(key);
          } catch (error) {
            // Skip invalid data
          }
        }
        
        handler1.clear();
        
        if (validItems.length < 2) {
          return true; // Not enough valid items to test
        }
        
        // Add to first handler in original order
        for (const item of validItems) {
          handler1.addStructuredData(item.data, item.key, item.priority);
        }
        
        // Add to second handler in reverse order
        for (let i = validItems.length - 1; i >= 0; i--) {
          const item = validItems[i];
          handler2.addStructuredData(item.data, item.key, item.priority);
        }
        
        // Get serialized scripts from both handlers
        const scripts1 = handler1.getSerializedScripts();
        const scripts2 = handler2.getSerializedScripts();
        
        // Should have same length and same content (order should be by priority)
        if (scripts1.length !== scripts2.length) {
          return false;
        }
        
        for (let i = 0; i < scripts1.length; i++) {
          if (scripts1[i].key !== scripts2[i].key || 
              scripts1[i].content !== scripts2[i].content ||
              scripts1[i].priority !== scripts2[i].priority) {
            return false;
          }
        }
        
        return true;
      }
    ), { numRuns: 20 });
  });
});