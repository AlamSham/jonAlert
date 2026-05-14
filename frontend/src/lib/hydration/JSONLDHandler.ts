/**
 * JSONLDHandler - Manages structured data scripts with consistent serialization
 * 
 * This class addresses Requirements 2.1, 2.2, 2.3:
 * - Ensures identical JSON-LD content between server and client rendering
 * - Provides consistent data serialization
 * - Validates JSON-LD syntax before injection
 * - Manages priority-based structured data
 */

import { StructuredDataConfig, ValidationResult, HydrationError } from './types';

export class JSONLDHandler {
  private structuredDataMap: Map<string, StructuredDataConfig> = new Map();
  private serializedCache: Map<string, string> = new Map();
  private isClient: boolean;
  private debugMode: boolean;

  constructor(debugMode: boolean = false) {
    this.isClient = typeof window !== 'undefined';
    this.debugMode = debugMode;
    
    if (this.debugMode) {
      console.log('[JSONLDHandler] Initialized', { isClient: this.isClient });
    }
  }

  /**
   * Add structured data with priority-based management
   * Requirement 2.1: Ensure identical content between server and client
   */
  addStructuredData(data: object, key: string, priority: number = 0, dependencies?: string[]): void {
    try {
      // Validate the data before adding
      const validation = this.validateSchema(data);
      if (!validation.valid) {
        throw new Error(`Invalid JSON-LD schema for key "${key}": ${validation.errors.join(', ')}`);
      }

      // Create configuration
      const config: StructuredDataConfig = {
        key,
        data,
        priority,
        dependencies
      };

      // Store in map with priority ordering
      this.structuredDataMap.set(key, config);

      // Generate consistent serialization
      const serialized = this.serializeData(data);
      this.serializedCache.set(key, serialized);

      if (this.debugMode) {
        console.log('[JSONLDHandler] Added structured data', { key, priority, hasData: !!data });
      }
    } catch (error) {
      const hydrationError: HydrationError = {
        type: 'jsonld',
        component: 'JSONLDHandler',
        message: `Failed to add structured data for key "${key}": ${error instanceof Error ? error.message : String(error)}`,
        recoverable: true,
        timestamp: Date.now()
      };
      
      if (this.debugMode) {
        console.error('[JSONLDHandler] Error adding structured data', hydrationError);
      }
      
      throw hydrationError;
    }
  }

  /**
   * Remove structured data by key
   * Requirement 2.4: Update without causing hydration mismatches
   */
  removeStructuredData(key: string): boolean {
    try {
      const removed = this.structuredDataMap.delete(key);
      this.serializedCache.delete(key);
      
      if (this.debugMode && removed) {
        console.log('[JSONLDHandler] Removed structured data', { key });
      }
      
      return removed;
    } catch (error) {
      if (this.debugMode) {
        console.error('[JSONLDHandler] Error removing structured data', { key, error });
      }
      return false;
    }
  }

  /**
   * Serialize data with consistent formatting
   * Requirement 2.2: Consistent serialization between server and client
   */
  serializeData(data: object): string {
    try {
      // Ensure consistent serialization by:
      // 1. Sorting object keys
      // 2. Using consistent spacing
      // 3. Handling special characters properly
      const sortedData = this.sortObjectKeys(data);
      
      // Use consistent JSON formatting
      const serialized = JSON.stringify(sortedData, null, 0);
      
      // Escape special characters that might cause hydration issues
      return this.escapeForHTML(serialized);
    } catch (error) {
      throw new Error(`Serialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate JSON-LD schema
   * Requirement 2.3: Validate syntax before injection
   */
  validateSchema(data: object): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic JSON-LD validation
      if (!data || typeof data !== 'object') {
        errors.push('Data must be a valid object');
        return { valid: false, errors, warnings };
      }

      const jsonLd = data as any;

      // Check for required @context
      if (!jsonLd['@context']) {
        errors.push('Missing required @context property');
      } else if (typeof jsonLd['@context'] !== 'string' && !Array.isArray(jsonLd['@context'])) {
        errors.push('@context must be a string or array');
      }

      // Check for @type
      if (!jsonLd['@type']) {
        errors.push('Missing required @type property');
      } else if (typeof jsonLd['@type'] !== 'string') {
        errors.push('@type must be a string');
      }

      // Validate common schema.org types
      if (jsonLd['@type']) {
        this.validateSchemaOrgType(jsonLd, errors, warnings);
      }

      // Check for circular references
      try {
        JSON.stringify(data);
      } catch (circularError) {
        errors.push('Circular reference detected in data structure');
      }

      // Validate URL formats
      this.validateUrls(jsonLd, errors, warnings);

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
      return { valid: false, errors, warnings };
    }
  }

  /**
   * Get all structured data sorted by priority
   * Requirement 2.1: Maintain consistent ordering
   */
  getAllStructuredData(): StructuredDataConfig[] {
    return Array.from(this.structuredDataMap.values())
      .sort((a, b) => b.priority - a.priority); // Higher priority first
  }

  /**
   * Get serialized JSON-LD scripts for injection
   * Requirement 2.1: Consistent content between server and client
   */
  getSerializedScripts(): Array<{ key: string; content: string; priority: number }> {
    const sortedData = this.getAllStructuredData();
    
    return sortedData.map(config => ({
      key: config.key,
      content: this.serializedCache.get(config.key) || this.serializeData(config.data),
      priority: config.priority
    }));
  }

  /**
   * Update existing structured data safely
   * Requirement 2.4: Update without hydration mismatches
   */
  updateStructuredData(key: string, data: object, priority?: number): void {
    const existing = this.structuredDataMap.get(key);
    if (!existing) {
      throw new Error(`Structured data with key "${key}" not found`);
    }

    // Validate new data
    const validation = this.validateSchema(data);
    if (!validation.valid) {
      throw new Error(`Invalid updated data for key "${key}": ${validation.errors.join(', ')}`);
    }

    // Update with new data, preserving dependencies
    const updatedConfig: StructuredDataConfig = {
      ...existing,
      data,
      priority: priority !== undefined ? priority : existing.priority
    };

    this.structuredDataMap.set(key, updatedConfig);
    this.serializedCache.set(key, this.serializeData(data));

    if (this.debugMode) {
      console.log('[JSONLDHandler] Updated structured data', { key, priority: updatedConfig.priority });
    }
  }

  /**
   * Check if dependencies are satisfied
   */
  areDependenciesSatisfied(key: string): boolean {
    const config = this.structuredDataMap.get(key);
    if (!config || !config.dependencies) {
      return true;
    }

    return config.dependencies.every(dep => this.structuredDataMap.has(dep));
  }

  /**
   * Get structured data by key
   */
  getStructuredData(key: string): StructuredDataConfig | undefined {
    return this.structuredDataMap.get(key);
  }

  /**
   * Clear all structured data
   */
  clear(): void {
    this.structuredDataMap.clear();
    this.serializedCache.clear();
    
    if (this.debugMode) {
      console.log('[JSONLDHandler] Cleared all structured data');
    }
  }

  /**
   * Get statistics for monitoring
   */
  getStats(): { count: number; totalSize: number; keys: string[] } {
    const keys = Array.from(this.structuredDataMap.keys());
    const totalSize = Array.from(this.serializedCache.values())
      .reduce((sum, content) => sum + content.length, 0);

    return {
      count: keys.length,
      totalSize,
      keys
    };
  }

  // Private helper methods

  /**
   * Sort object keys recursively for consistent serialization
   */
  private sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }

    const sorted: any = {};
    Object.keys(obj)
      .sort()
      .forEach(key => {
        sorted[key] = this.sortObjectKeys(obj[key]);
      });

    return sorted;
  }

  /**
   * Escape content for safe HTML injection
   */
  private escapeForHTML(content: string): string {
    return content
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
      .replace(/'/g, '\\u0027')
      .replace(/"/g, '\\u0022');
  }

  /**
   * Validate specific schema.org types
   */
  private validateSchemaOrgType(jsonLd: any, errors: string[], warnings: string[]): void {
    const type = jsonLd['@type'];
    
    switch (type) {
      case 'WebSite':
        if (!jsonLd.name) warnings.push('WebSite should have a name property');
        if (!jsonLd.url) warnings.push('WebSite should have a url property');
        break;
        
      case 'Organization':
        if (!jsonLd.name) errors.push('Organization must have a name property');
        if (!jsonLd.url) warnings.push('Organization should have a url property');
        break;
        
      case 'JobPosting':
        if (!jsonLd.title) errors.push('JobPosting must have a title property');
        if (!jsonLd.hiringOrganization) errors.push('JobPosting must have a hiringOrganization property');
        if (!jsonLd.jobLocation) warnings.push('JobPosting should have a jobLocation property');
        break;
        
      case 'BreadcrumbList':
        if (!jsonLd.itemListElement || !Array.isArray(jsonLd.itemListElement)) {
          errors.push('BreadcrumbList must have an itemListElement array');
        }
        break;
        
      case 'FAQPage':
        if (!jsonLd.mainEntity || !Array.isArray(jsonLd.mainEntity)) {
          errors.push('FAQPage must have a mainEntity array');
        }
        break;
        
      case 'Article':
        if (!jsonLd.headline) errors.push('Article must have a headline property');
        if (!jsonLd.author) warnings.push('Article should have an author property');
        if (!jsonLd.datePublished) warnings.push('Article should have a datePublished property');
        break;
    }
  }

  /**
   * Validate URL formats in the data
   */
  private validateUrls(obj: any, errors: string[], warnings: string[]): void {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && (key === 'url' || key === '@id' || key.endsWith('Url'))) {
        try {
          new URL(value);
        } catch {
          // Check if it's a relative URL
          if (!value.startsWith('/') && !value.startsWith('#')) {
            warnings.push(`Invalid URL format for ${key}: ${value}`);
          }
        }
      } else if (typeof value === 'object') {
        this.validateUrls(value, errors, warnings);
      }
    }
  }
}

// Export singleton instance for global use
export const jsonLDHandler = new JSONLDHandler(process.env.NODE_ENV === 'development');