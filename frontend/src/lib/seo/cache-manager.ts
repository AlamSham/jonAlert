// SEO Cache Manager - Centralized cache management with Redis support
import { SEO_CONFIG } from './config';
import { RedisSEOCache, AdvancedCacheWarmer, CacheInvalidationManager } from './redis-cache';
import type { CacheConfig } from './interfaces';

export interface CacheManagerConfig {
  redis?: {
    enabled: boolean;
    host?: string;
    port?: number;
    password?: string;
    db?: number;
  };
  warming?: {
    enabled: boolean;
    onStartup: boolean;
    schedule?: string; // Cron expression
  };
  invalidation?: {
    enabled: boolean;
    strategies: string[];
  };
}

export class SEOCacheManager {
  private static instance: SEOCacheManager;
  private config: CacheManagerConfig;
  private caches: Map<string, RedisSEOCache> = new Map();
  private initialized: boolean = false;

  private constructor(config: CacheManagerConfig) {
    this.config = config;
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: CacheManagerConfig): SEOCacheManager {
    if (!SEOCacheManager.instance) {
      SEOCacheManager.instance = new SEOCacheManager(config || {
        redis: { enabled: false },
        warming: { enabled: true, onStartup: true },
        invalidation: { enabled: true, strategies: ['content-update', 'time-based'] }
      });
    }
    return SEOCacheManager.instance;
  }

  /**
   * Initialize cache manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('Initializing SEO Cache Manager...');

    try {
      // Initialize cache instances
      await this.initializeCaches();

      // Warm caches if enabled
      if (this.config.warming?.enabled && this.config.warming?.onStartup) {
        await this.warmCaches();
      }

      // Set up cache invalidation strategies
      if (this.config.invalidation?.enabled) {
        this.setupInvalidationStrategies();
      }

      this.initialized = true;
      console.log('SEO Cache Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SEO Cache Manager:', error);
      throw error;
    }
  }

  /**
   * Initialize cache instances
   */
  private async initializeCaches(): Promise<void> {
    const cacheConfigs = [
      { name: 'seo', keyPrefix: 'seo:general:', ttl: SEO_CONFIG.CACHE.TTL.SEO_DATA },
      { name: 'schema', keyPrefix: 'seo:schema:', ttl: SEO_CONFIG.CACHE.TTL.STRUCTURED_DATA },
      { name: 'performance', keyPrefix: 'seo:perf:', ttl: SEO_CONFIG.CACHE.TTL.PERFORMANCE_METRICS },
      { name: 'gsc', keyPrefix: 'seo:gsc:', ttl: SEO_CONFIG.CACHE.TTL.GSC_DATA },
      { name: 'content', keyPrefix: 'seo:content:', ttl: SEO_CONFIG.CACHE.TTL.SEO_DATA }
    ];

    for (const config of cacheConfigs) {
      const cache = new RedisSEOCache({
        ttl: config.ttl,
        keyPrefix: config.keyPrefix,
        maxSize: SEO_CONFIG.CACHE.MAX_SIZE
      });

      this.caches.set(config.name, cache);
    }

    console.log(`Initialized ${this.caches.size} cache instances`);
  }

  /**
   * Get cache instance by name
   */
  getCache(name: string): RedisSEOCache | null {
    return this.caches.get(name) || null;
  }

  /**
   * Warm all caches
   */
  async warmCaches(): Promise<void> {
    console.log('Starting cache warming process...');
    
    try {
      await AdvancedCacheWarmer.warmAllCaches();
      console.log('Cache warming completed successfully');
    } catch (error) {
      console.error('Cache warming failed:', error);
    }
  }

  /**
   * Setup cache invalidation strategies
   */
  private setupInvalidationStrategies(): void {
    console.log('Setting up cache invalidation strategies...');

    // Content update invalidation
    if (this.config.invalidation?.strategies.includes('content-update')) {
      this.setupContentUpdateInvalidation();
    }

    // Time-based invalidation
    if (this.config.invalidation?.strategies.includes('time-based')) {
      this.setupTimeBasedInvalidation();
    }
  }

  /**
   * Setup content update invalidation
   */
  private setupContentUpdateInvalidation(): void {
    // This would integrate with your content management system
    // For now, we'll set up event listeners for common content updates
    
    if (typeof window !== 'undefined') {
      // Browser environment - listen for custom events
      window.addEventListener('seo:job-updated', () => {
        CacheInvalidationManager.invalidateJobCaches();
      });

      window.addEventListener('seo:scheme-updated', () => {
        CacheInvalidationManager.invalidateSchemeCaches();
      });
    }
  }

  /**
   * Setup time-based invalidation
   */
  private setupTimeBasedInvalidation(): void {
    // Set up periodic cache cleanup
    setInterval(async () => {
      await this.performMaintenanceTasks();
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Perform maintenance tasks
   */
  private async performMaintenanceTasks(): Promise<void> {
    console.log('Performing cache maintenance tasks...');

    try {
      // Get health status for all caches
      const healthChecks = await Promise.all(
        Array.from(this.caches.entries()).map(async ([name, cache]) => {
          const health = await cache.getHealthStatus();
          return { name, health };
        })
      );

      // Log health status
      for (const { name, health } of healthChecks) {
        if (health.status !== 'healthy') {
          console.warn(`Cache ${name} status: ${health.status}`, health.errors);
        }
      }

      // Warm critical caches if they're unhealthy
      const unhealthyCaches = healthChecks.filter(({ health }) => health.status === 'unhealthy');
      if (unhealthyCaches.length > 0) {
        console.log('Re-warming unhealthy caches...');
        await this.warmCaches();
      }

    } catch (error) {
      console.error('Cache maintenance failed:', error);
    }
  }

  /**
   * Get overall cache statistics
   */
  async getCacheStatistics(): Promise<{
    totalCaches: number;
    healthyCount: number;
    degradedCount: number;
    unhealthyCount: number;
    totalSize: number;
    cacheDetails: Array<{
      name: string;
      status: string;
      size: number;
      redisConnected: boolean;
    }>;
  }> {
    const cacheDetails = await Promise.all(
      Array.from(this.caches.entries()).map(async ([name, cache]) => {
        const [health, stats] = await Promise.all([
          cache.getHealthStatus(),
          cache.getStats()
        ]);

        return {
          name,
          status: health.status,
          size: stats.size,
          redisConnected: health.redisConnected
        };
      })
    );

    const healthyCount = cacheDetails.filter(c => c.status === 'healthy').length;
    const degradedCount = cacheDetails.filter(c => c.status === 'degraded').length;
    const unhealthyCount = cacheDetails.filter(c => c.status === 'unhealthy').length;
    const totalSize = cacheDetails.reduce((sum, c) => sum + c.size, 0);

    return {
      totalCaches: this.caches.size,
      healthyCount,
      degradedCount,
      unhealthyCount,
      totalSize,
      cacheDetails
    };
  }

  /**
   * Invalidate caches by pattern across all cache instances
   */
  async invalidatePattern(pattern: string): Promise<number> {
    let totalInvalidated = 0;

    const promises = Array.from(this.caches.values()).map(async (cache) => {
      const count = await cache.invalidatePattern(pattern);
      return count;
    });

    const results = await Promise.all(promises);
    totalInvalidated = results.reduce((sum, count) => sum + count, 0);

    console.log(`Invalidated ${totalInvalidated} cache entries matching pattern: ${pattern}`);
    return totalInvalidated;
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    console.log('Clearing all SEO caches...');

    const promises = Array.from(this.caches.values()).map(cache => cache.clear());
    await Promise.all(promises);

    console.log('All SEO caches cleared');
  }

  /**
   * Shutdown cache manager
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down SEO Cache Manager...');

    // Clear any intervals or timeouts
    // In a real implementation, you'd track these and clear them

    // Optionally persist critical cache data
    // await this.persistCriticalData();

    this.initialized = false;
    console.log('SEO Cache Manager shutdown complete');
  }
}

// Cache event emitters for content updates
export class CacheEventEmitter {
  /**
   * Emit job update event
   */
  static emitJobUpdate(jobId: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('seo:job-updated', { 
        detail: { jobId } 
      }));
    }
  }

  /**
   * Emit scheme update event
   */
  static emitSchemeUpdate(schemeId: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('seo:scheme-updated', { 
        detail: { schemeId } 
      }));
    }
  }

  /**
   * Emit result update event
   */
  static emitResultUpdate(resultId: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('seo:result-updated', { 
        detail: { resultId } 
      }));
    }
  }

  /**
   * Emit general content update event
   */
  static emitContentUpdate(contentType: string, contentId: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('seo:content-updated', { 
        detail: { contentType, contentId } 
      }));
    }
  }
}

// Export singleton instance
export const seoCache = SEOCacheManager.getInstance();

// Initialize cache manager on module load (in browser environment)
if (typeof window !== 'undefined') {
  seoCache.initialize().catch(error => {
    console.error('Failed to initialize SEO cache manager:', error);
  });
}