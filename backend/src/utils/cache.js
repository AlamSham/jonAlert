/**
 * In-Memory Cache Utility
 * 
 * Simple in-memory cache for structured data and meta tags.
 * Uses Map with TTL support for automatic expiration.
 * 
 * @module cache
 */

import { env } from '../config/env.js';

/**
 * Cache entry structure
 * @typedef {Object} CacheEntry
 * @property {*} value - Cached value
 * @property {number} expiresAt - Expiration timestamp
 */

/**
 * Simple in-memory cache with TTL
 */
class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Set a value in cache with TTL
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  set(key, value, ttl) {
    const expiresAt = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or null if not found/expired
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    
    this.hits++;
    return entry.value;
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 
        ? (this.hits / (this.hits + this.misses) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}

// Create cache instances
export const structuredDataCache = new SimpleCache();
export const metaTagCache = new SimpleCache();

// Periodic cleanup (every 5 minutes)
setInterval(() => {
  const sdCleaned = structuredDataCache.cleanup();
  const mtCleaned = metaTagCache.cleanup();
  
  if (sdCleaned > 0 || mtCleaned > 0) {
    console.log(`Cache cleanup: ${sdCleaned} structured data entries, ${mtCleaned} meta tag entries removed`);
  }
}, 5 * 60 * 1000);

/**
 * Cache a job's structured data
 * @param {string} jobId - Job ID
 * @param {Object} data - Structured data
 */
export function cacheJobStructuredData(jobId, data) {
  structuredDataCache.set(`job:${jobId}`, data, env.structuredDataCacheTtl);
}

/**
 * Get cached job structured data
 * @param {string} jobId - Job ID
 * @returns {Object|null} Cached structured data or null
 */
export function getCachedJobStructuredData(jobId) {
  return structuredDataCache.get(`job:${jobId}`);
}

/**
 * Cache a job's meta tags
 * @param {string} jobId - Job ID
 * @param {Object} metaTags - Meta tags
 */
export function cacheJobMetaTags(jobId, metaTags) {
  metaTagCache.set(`job:${jobId}`, metaTags, env.metaTagCacheTtl);
}

/**
 * Get cached job meta tags
 * @param {string} jobId - Job ID
 * @returns {Object|null} Cached meta tags or null
 */
export function getCachedJobMetaTags(jobId) {
  return metaTagCache.get(`job:${jobId}`);
}

/**
 * Invalidate cache for a job
 * @param {string} jobId - Job ID
 */
export function invalidateJobCache(jobId) {
  structuredDataCache.delete(`job:${jobId}`);
  metaTagCache.delete(`job:${jobId}`);
}

/**
 * Get cache statistics
 * @returns {Object} Combined cache stats
 */
export function getCacheStats() {
  return {
    structuredData: structuredDataCache.getStats(),
    metaTags: metaTagCache.getStats()
  };
}
