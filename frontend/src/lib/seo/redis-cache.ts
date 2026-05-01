// Redis-Enhanced SEO Cache Management System
import { SEO_CONFIG } from './config';
import type { CacheConfig, CachedSEOData } from './interfaces';

// Redis client interface (would be implemented with actual Redis client)
interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  flushall(): Promise<void>;
  ttl(key: string): Promise<number>;
}

// Mock Redis client for development (replace with actual Redis client in production)
class MockRedisClient implements RedisClient {
  private store: Map<string, { value: string; expiresAt: number }> = new Map();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    
    return entry.value;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + (ttl * 1000) : Date.now() + (24 * 60 * 60 * 1000);
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return 0;
    
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return 0;
    }
    
    return 1;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.store.keys()).filter(key => regex.test(key));
  }

  async flushall(): Promise<void> {
    this.store.clear();
  }

  async ttl(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return -2;
    
    const remaining = Math.floor((entry.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }
}

export class RedisSEOCache {
  private fallbackCache: Map<string, CachedSEOData> = new Map();
  private config: CacheConfig;
  private redis: RedisClient;
  private useRedis: boolean = false;

  constructor(config?: Partial<CacheConfig>, redisClient?: RedisClient) {
    this.config = {
      ttl: SEO_CONFIG.CACHE.TTL.SEO_DATA,
      maxSize: SEO_CONFIG.CACHE.MAX_SIZE,
      keyPrefix: SEO_CONFIG.CACHE.KEY_PREFIX,
      ...config
    };

    // Initialize Redis client (use mock for development)
    this.redis = redisClient || new MockRedisClient();
    this.useRedis = !!redisClient;
  }

  /**
   * Generate cache key with prefix
   */
  private generateKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  /**
   * Serialize data for Redis storage
   */
  private serialize<T>(data: T): string {
    return JSON.stringify({
      data,
      timestamp: new Date().toISOString(),
      version: '1.0'
    });
  }

  /**
   * Deserialize data from Redis storage
   */
  private deserialize<T>(serialized: string): T | null {
    try {
      const parsed = JSON.parse(serialized);
      return parsed.data as T;
    } catch (error) {
      console.error('Cache deserialization error:', error);
      return null;
    }
  }

  /**
   * Get cached data with Redis fallback
   */
  async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.generateKey(key);

    try {
      if (this.useRedis) {
        const serialized = await this.redis.get(cacheKey);
        if (serialized) {
          return this.deserialize<T>(serialized);
        }
      }

      // Fallback to in-memory cache
      const entry = this.fallbackCache.get(cacheKey);
      if (entry && new Date() <= entry.expiresAt) {
        return entry.data as T;
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data with Redis and fallback
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const cacheKey = this.generateKey(key);
    const cacheTTL = ttl || this.config.ttl;

    try {
      if (this.useRedis) {
        const serialized = this.serialize(data);
        await this.redis.set(cacheKey, serialized, cacheTTL);
      }

      // Also store in fallback cache
      const now = new Date();
      const expiresAt = new Date(now.getTime() + cacheTTL * 1000);
      
      this.fallbackCache.set(cacheKey, {
        key: cacheKey,
        data,
        timestamp: now,
        expiresAt
      });

      this.enforceMaxSize();
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<boolean> {
    const cacheKey = this.generateKey(key);

    try {
      let deleted = false;

      if (this.useRedis) {
        const result = await this.redis.del(cacheKey);
        deleted = result > 0;
      }

      // Also delete from fallback cache
      const fallbackDeleted = this.fallbackCache.delete(cacheKey);
      
      return deleted || fallbackDeleted;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    const cacheKey = this.generateKey(key);

    try {
      if (this.useRedis) {
        const exists = await this.redis.exists(cacheKey);
        if (exists > 0) return true;
      }

      // Check fallback cache
      const entry = this.fallbackCache.get(cacheKey);
      return entry ? new Date() <= entry.expiresAt : false;
    } catch (error) {
      console.error('Cache has error:', error);
      return false;
    }
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    try {
      if (this.useRedis) {
        await this.redis.flushall();
      }
      
      this.fallbackCache.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    size: number;
    maxSize: number;
    redisConnected: boolean;
    fallbackSize: number;
  }> {
    try {
      let redisSize = 0;
      
      if (this.useRedis) {
        const keys = await this.redis.keys(`${this.config.keyPrefix}*`);
        redisSize = keys.length;
      }

      return {
        size: redisSize,
        maxSize: this.config.maxSize,
        redisConnected: this.useRedis,
        fallbackSize: this.fallbackCache.size
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        size: 0,
        maxSize: this.config.maxSize,
        redisConnected: false,
        fallbackSize: this.fallbackCache.size
      };
    }
  }

  /**
   * Get or set pattern with Redis support
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    await this.set(key, data, ttl);
    return data;
  }

  /**
   * Batch get multiple keys
   */
  async getBatch<T>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();
    
    // Process in parallel for better performance
    const promises = keys.map(async (key) => {
      const value = await this.get<T>(key);
      return { key, value };
    });

    const resolved = await Promise.all(promises);
    
    for (const { key, value } of resolved) {
      results.set(key, value);
    }
    
    return results;
  }

  /**
   * Batch set multiple key-value pairs
   */
  async setBatch<T>(entries: Array<{ key: string; data: T; ttl?: number }>): Promise<void> {
    // Process in parallel for better performance
    const promises = entries.map(entry => 
      this.set(entry.key, entry.data, entry.ttl)
    );

    await Promise.all(promises);
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    let count = 0;

    try {
      if (this.useRedis) {
        const fullPattern = `${this.config.keyPrefix}${pattern}`;
        const keys = await this.redis.keys(fullPattern);
        
        for (const key of keys) {
          await this.redis.del(key);
          count++;
        }
      }

      // Also invalidate fallback cache
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      for (const key of this.fallbackCache.keys()) {
        if (regex.test(key)) {
          this.fallbackCache.delete(key);
          count++;
        }
      }

      return count;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  /**
   * Warm cache with critical data
   */
  async warmCache(warmingData: Array<{ key: string; fetchFn: () => Promise<any>; ttl?: number }>): Promise<void> {
    console.log(`Warming cache with ${warmingData.length} entries...`);
    
    const promises = warmingData.map(async ({ key, fetchFn, ttl }) => {
      try {
        const exists = await this.has(key);
        if (!exists) {
          const data = await fetchFn();
          await this.set(key, data, ttl);
        }
      } catch (error) {
        console.error(`Cache warming failed for key ${key}:`, error);
      }
    });

    await Promise.all(promises);
    console.log('Cache warming completed');
  }

  /**
   * Get cache health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    redisConnected: boolean;
    fallbackActive: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let redisConnected = false;

    try {
      if (this.useRedis) {
        // Test Redis connection
        await this.redis.set('health-check', 'ok', 10);
        const result = await this.redis.get('health-check');
        redisConnected = result === 'ok';
        await this.redis.del('health-check');
      }
    } catch (error) {
      errors.push(`Redis connection error: ${(error as Error).message}`);
    }

    const fallbackActive = this.fallbackCache.size > 0;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (this.useRedis && !redisConnected) {
      status = fallbackActive ? 'degraded' : 'unhealthy';
      errors.push('Redis unavailable, using fallback cache');
    }

    return {
      status,
      redisConnected,
      fallbackActive,
      errors
    };
  }

  /**
   * Enforce maximum cache size for fallback cache
   */
  private enforceMaxSize(): void {
    if (this.fallbackCache.size > this.config.maxSize) {
      const entries = Array.from(this.fallbackCache.entries());
      entries.sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
      
      const toRemove = this.fallbackCache.size - this.config.maxSize;
      for (let i = 0; i < toRemove; i++) {
        this.fallbackCache.delete(entries[i][0]);
      }
    }
  }
}

// Create Redis-enhanced cache instances
export const redisSeoCache = new RedisSEOCache({
  ttl: SEO_CONFIG.CACHE.TTL.SEO_DATA,
  keyPrefix: 'seo:general:'
});

export const redisStructuredDataCache = new RedisSEOCache({
  ttl: SEO_CONFIG.CACHE.TTL.STRUCTURED_DATA,
  keyPrefix: 'seo:schema:'
});

export const redisPerformanceCache = new RedisSEOCache({
  ttl: SEO_CONFIG.CACHE.TTL.PERFORMANCE_METRICS,
  keyPrefix: 'seo:perf:'
});

export const redisGscCache = new RedisSEOCache({
  ttl: SEO_CONFIG.CACHE.TTL.GSC_DATA,
  keyPrefix: 'seo:gsc:'
});

export const redisContentCache = new RedisSEOCache({
  ttl: SEO_CONFIG.CACHE.TTL.SEO_DATA,
  keyPrefix: 'seo:content:'
});

// Cache warming strategies
export class AdvancedCacheWarmer {
  /**
   * Warm cache for critical SEO pages
   */
  static async warmCriticalSEOPages(): Promise<void> {
    const criticalPages = [
      { key: 'homepage-meta', fetchFn: async () => ({ title: 'SarkariPulse - Latest Government Jobs', description: 'Find latest sarkari naukri notifications...' }) },
      { key: 'jobs-meta', fetchFn: async () => ({ title: 'Government Jobs 2026', description: 'Latest government job notifications...' }) },
      { key: 'schemes-meta', fetchFn: async () => ({ title: 'Government Schemes 2026', description: 'Latest government scheme notifications...' }) },
      { key: 'results-meta', fetchFn: async () => ({ title: 'Exam Results 2026', description: 'Latest exam result notifications...' }) }
    ];

    await redisSeoCache.warmCache(criticalPages);
  }

  /**
   * Warm structured data cache
   */
  static async warmStructuredDataCache(): Promise<void> {
    const structuredDataEntries = [
      { 
        key: 'organization-schema', 
        fetchFn: async () => ({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'SarkariPulse',
          url: 'https://sarkaripulse.net'
        })
      }
    ];

    await redisStructuredDataCache.warmCache(structuredDataEntries);
  }

  /**
   * Warm performance metrics cache
   */
  static async warmPerformanceCache(): Promise<void> {
    const performanceEntries = [
      { 
        key: 'core-web-vitals', 
        fetchFn: async () => ({
          lcp: 2000,
          fid: 50,
          cls: 0.05,
          timestamp: new Date()
        })
      }
    ];

    await redisPerformanceCache.warmCache(performanceEntries);
  }

  /**
   * Warm all caches
   */
  static async warmAllCaches(): Promise<void> {
    console.log('Starting comprehensive cache warming...');
    
    await Promise.all([
      this.warmCriticalSEOPages(),
      this.warmStructuredDataCache(),
      this.warmPerformanceCache()
    ]);

    console.log('All caches warmed successfully');
  }
}

// Cache invalidation strategies
export class CacheInvalidationManager {
  /**
   * Invalidate job-related caches when new jobs are added
   */
  static async invalidateJobCaches(): Promise<void> {
    await Promise.all([
      redisSeoCache.invalidatePattern('job:*'),
      redisStructuredDataCache.invalidatePattern('job:*'),
      redisContentCache.invalidatePattern('jobs:*')
    ]);
  }

  /**
   * Invalidate scheme-related caches when new schemes are added
   */
  static async invalidateSchemeCaches(): Promise<void> {
    await Promise.all([
      redisSeoCache.invalidatePattern('scheme:*'),
      redisStructuredDataCache.invalidatePattern('scheme:*'),
      redisContentCache.invalidatePattern('schemes:*')
    ]);
  }

  /**
   * Invalidate all SEO caches (use sparingly)
   */
  static async invalidateAllSEOCaches(): Promise<void> {
    await Promise.all([
      redisSeoCache.clear(),
      redisStructuredDataCache.clear(),
      redisPerformanceCache.clear(),
      redisGscCache.clear(),
      redisContentCache.clear()
    ]);
  }
}