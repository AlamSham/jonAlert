// SEO Cache Management System
import { SEO_CONFIG } from './config';
import type { CacheConfig, CachedSEOData } from './interfaces';

class SEOCache {
  private cache: Map<string, CachedSEOData> = new Map();
  private config: CacheConfig;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      ttl: SEO_CONFIG.CACHE.TTL.SEO_DATA,
      maxSize: SEO_CONFIG.CACHE.MAX_SIZE,
      keyPrefix: SEO_CONFIG.CACHE.KEY_PREFIX,
      ...config
    };
  }

  /**
   * Generate cache key with prefix
   */
  private generateKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CachedSEOData): boolean {
    return new Date() > entry.expiresAt;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = new Date();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Ensure cache doesn't exceed max size
   */
  private enforceMaxSize(): void {
    if (this.cache.size > this.config.maxSize) {
      // Remove oldest entries (FIFO)
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
      
      const toRemove = this.cache.size - this.config.maxSize;
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const cacheKey = this.generateKey(key);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const cacheKey = this.generateKey(key);
    const cacheTTL = ttl || this.config.ttl;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + cacheTTL * 1000);

    const entry: CachedSEOData = {
      key: cacheKey,
      data,
      timestamp: now,
      expiresAt
    };

    this.cache.set(cacheKey, entry);
    this.enforceMaxSize();
  }

  /**
   * Delete cached data
   */
  delete(key: string): boolean {
    const cacheKey = this.generateKey(key);
    return this.cache.delete(cacheKey);
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const cacheKey = this.generateKey(key);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(cacheKey);
      return false;
    }

    return true;
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    expiredEntries: number;
  } {
    this.cleanup();
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Would need hit/miss tracking for accurate calculation
      expiredEntries: 0 // Cleaned up in cleanup()
    };
  }

  /**
   * Get or set pattern - fetch data if not cached
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * Batch get multiple keys
   */
  getBatch<T>(keys: string[]): Map<string, T | null> {
    const results = new Map<string, T | null>();
    
    for (const key of keys) {
      results.set(key, this.get<T>(key));
    }
    
    return results;
  }

  /**
   * Batch set multiple key-value pairs
   */
  setBatch<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    for (const entry of entries) {
      this.set(entry.key, entry.data, entry.ttl);
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }
}

// Create singleton instances for different cache types
export const seoCache = new SEOCache({
  ttl: SEO_CONFIG.CACHE.TTL.SEO_DATA,
  keyPrefix: 'seo:general:'
});

export const structuredDataCache = new SEOCache({
  ttl: SEO_CONFIG.CACHE.TTL.STRUCTURED_DATA,
  keyPrefix: 'seo:schema:'
});

export const performanceCache = new SEOCache({
  ttl: SEO_CONFIG.CACHE.TTL.PERFORMANCE_METRICS,
  keyPrefix: 'seo:perf:'
});

export const gscCache = new SEOCache({
  ttl: SEO_CONFIG.CACHE.TTL.GSC_DATA,
  keyPrefix: 'seo:gsc:'
});

export const contentCache = new SEOCache({
  ttl: SEO_CONFIG.CACHE.TTL.SEO_DATA,
  keyPrefix: 'seo:content:'
});

// Cache key generators
export const CacheKeys = {
  // CTR Optimization
  optimizedTitle: (url: string) => `title:${url}`,
  optimizedDescription: (url: string) => `desc:${url}`,
  abTestResults: (url: string) => `abtest:${url}`,
  
  // Meta Tags
  metaTags: (url: string) => `meta:${url}`,
  canonicalUrl: (path: string) => `canonical:${path}`,
  hreflangTags: (url: string) => `hreflang:${url}`,
  
  // Structured Data
  jobPostingSchema: (slug: string) => `job:${slug}`,
  faqSchema: (category: string, page?: number) => `faq:${category}:${page || 1}`,
  breadcrumbSchema: (path: string) => `breadcrumb:${path}`,
  organizationSchema: () => 'organization',
  
  // Content Enhancement
  enhancedContent: (url: string) => `content:${url}`,
  faqItems: (category: string) => `faq-items:${category}`,
  
  // Content_Enhancer specific keys
  faqContent: (category: string, contentType: string) => `faq-content:${category}:${contentType}`,
  introContent: (category: string, contentType: string) => `intro:${category}:${contentType}`,
  stateContent: (state: string, contentType: string) => `state:${state}:${contentType}`,
  topicClusters: (topic: string, contentType: string) => `clusters:${topic}:${contentType}`,
  relatedLinks: (page: string, contentType: string) => `links:${page}:${contentType}`,
  
  // Performance Metrics
  coreWebVitals: (url?: string) => url ? `cwv:${url}` : 'cwv:global',
  ctrMetrics: (url: string, period: string) => `ctr:${url}:${period}`,
  ctrData: () => 'ctr-data',
  indexingStatus: (url: string) => `index:${url}`,
  indexingProgress: () => 'indexing-progress',
  performanceReport: (id: string) => `report:${id}`,
  seoMetrics: () => 'seo-metrics',
  
  // GSC Data
  searchAnalytics: (period: string) => `analytics:${period}`,
  crawlErrors: () => 'crawl-errors',
  coverageIssues: () => 'coverage-issues',
  
  // Sitemaps
  sitemap: (type: string) => `sitemap:${type}`,
  sitemapIndex: () => 'sitemap:index'
};

// Cache warming functions
export class CacheWarmer {
  /**
   * Warm cache for critical pages
   */
  static async warmCriticalPages(urls: string[]): Promise<void> {
    // This would be implemented with actual SEO components
    console.log(`Warming cache for ${urls.length} critical pages`);
  }

  /**
   * Warm cache for category pages
   */
  static async warmCategoryPages(categories: string[]): Promise<void> {
    console.log(`Warming cache for ${categories.length} category pages`);
  }

  /**
   * Warm cache for structured data
   */
  static async warmStructuredData(): Promise<void> {
    console.log('Warming structured data cache');
  }
}

export { SEOCache };