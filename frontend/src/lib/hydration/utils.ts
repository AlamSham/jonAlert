/**
 * Utility functions for the hydration system
 */

import { AnalyticsManager } from './AnalyticsManager';
import {
  GoogleAnalyticsProvider,
  OneSignalProvider,
  VercelAnalyticsProvider,
  WebVitalsProvider,
} from './providers';
import { HydrationConfig } from './types';

/**
 * Create a pre-configured AnalyticsManager with common providers
 */
export function createAnalyticsManager(config?: Partial<HydrationConfig>): AnalyticsManager {
  const manager = new AnalyticsManager(config);

  // Register Web Vitals provider (always available)
  const webVitalsProvider = new WebVitalsProvider();
  manager.registerProvider(webVitalsProvider);

  // Register Vercel Analytics if available
  const vercelProvider = new VercelAnalyticsProvider();
  manager.registerProvider(vercelProvider);

  // Register Google Analytics if GA ID is provided
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (gaId) {
    const gaProvider = new GoogleAnalyticsProvider(gaId);
    manager.registerProvider(gaProvider);
  }

  // Register OneSignal if App ID is provided
  const oneSignalAppId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (oneSignalAppId) {
    const oneSignalProvider = new OneSignalProvider(oneSignalAppId);
    manager.registerProvider(oneSignalProvider);
  }

  return manager;
}

/**
 * Check if the current environment is server-side
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Check if React hydration is complete
 */
export function isHydrated(): boolean {
  if (isServer()) return false;
  
  // Check multiple indicators of hydration completion
  return (
    document.readyState === 'complete' &&
    !!(window as any).React &&
    !document.querySelector('[data-reactroot]')?.hasAttribute('data-reactroot')
  );
}

/**
 * Wait for hydration to complete
 */
export function waitForHydration(): Promise<void> {
  return new Promise((resolve) => {
    if (isHydrated()) {
      resolve();
      return;
    }

    const checkHydration = () => {
      if (isHydrated()) {
        resolve();
        return;
      }

      // Use requestIdleCallback if available
      if (window.requestIdleCallback) {
        window.requestIdleCallback(checkHydration);
      } else {
        setTimeout(checkHydration, 100);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkHydration);
    } else {
      checkHydration();
    }
  });
}

/**
 * Safely execute a function after hydration
 */
export async function executeAfterHydration<T>(fn: () => T | Promise<T>): Promise<T> {
  await waitForHydration();
  return fn();
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Create a throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T = any>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return fallback;
  }
}

/**
 * Generate a unique ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if a URL is from an allowed domain
 */
export function isAllowedDomain(url: string, allowedDomains: string[]): boolean {
  try {
    const urlObj = new URL(url);
    return allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
  } catch (error) {
    return false;
  }
}

/**
 * Measure execution time of a function
 */
export async function measureExecutionTime<T>(
  fn: () => T | Promise<T>,
  label?: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  if (label && process.env.NODE_ENV === 'development') {
    console.log(`${label} took ${duration.toFixed(2)}ms`);
  }
  
  return { result, duration };
}

/**
 * Create a timeout promise
 */
export function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
  });
}

/**
 * Race a promise against a timeout
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promise, timeout(ms)]);
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
  backoffMultiplier: number = 2
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if sessionStorage is available
 */
export function isSessionStorageAvailable(): boolean {
  try {
    const test = '__sessionStorage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get user agent information
 */
export function getUserAgent(): string {
  if (isServer()) return '';
  return navigator.userAgent || '';
}

/**
 * Check if the user is on a mobile device
 */
export function isMobile(): boolean {
  if (isServer()) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(getUserAgent());
}

/**
 * Get current page performance metrics
 */
export function getPagePerformanceMetrics(): Record<string, number> {
  if (isServer() || !window.performance) return {};
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!navigation) return {};
  
  return {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
  };
}