/**
 * Script loading strategies and utilities
 * 
 * This module provides utilities for determining the appropriate loading strategy
 * based on script type, content, and runtime context.
 */

import { LoadingStrategy, ScriptConfig, LoadingContext } from './types';

/**
 * Determine the optimal loading strategy for a script based on its characteristics
 */
export function determineLoadingStrategy(
  config: Partial<ScriptConfig>,
  context: LoadingContext
): LoadingStrategy {
  // If strategy is explicitly set, use it
  if (config.strategy) {
    return config.strategy;
  }

  // Strategy determination based on script characteristics
  const scriptId = config.id || '';
  const content = config.content || '';
  const src = config.src || '';

  // Third-party analytics scripts - defer to avoid hydration issues
  if (isAnalyticsScript(scriptId, src)) {
    return LoadingStrategy.DEFERRED;
  }

  // Ad scripts - client-only to prevent SSR/CSR mismatches
  if (isAdScript(scriptId, src)) {
    return LoadingStrategy.CLIENT_ONLY;
  }

  // OneSignal and push notification scripts - defer for better performance
  if (isPushNotificationScript(scriptId, src)) {
    return LoadingStrategy.DEFERRED;
  }

  // JSON-LD structured data - can be SSR if content is static
  if (isStructuredDataScript(content)) {
    return hasServerClientMismatchRisk(content) 
      ? LoadingStrategy.CLIENT_ONLY 
      : LoadingStrategy.SSR;
  }

  // Scripts with DOM manipulation - client-only to prevent hydration issues
  if (hasDOMManipulation(content)) {
    return LoadingStrategy.CLIENT_ONLY;
  }

  // Scripts with dynamic content - client-only
  if (hasDynamicContent(content)) {
    return LoadingStrategy.CLIENT_ONLY;
  }

  // Default strategy based on context
  return context.isServer ? LoadingStrategy.SSR : LoadingStrategy.CLIENT_ONLY;
}

/**
 * Check if a script is an analytics script
 */
export function isAnalyticsScript(scriptId: string, src: string): boolean {
  const analyticsPatterns = [
    'google-analytics',
    'gtag',
    'googletagmanager',
    'vercel-analytics',
    'web-vitals',
    'analytics',
    'tracking',
  ];

  const srcPatterns = [
    'googletagmanager.com',
    'google-analytics.com',
    'vercel.com/analytics',
    'analytics.google.com',
  ];

  return analyticsPatterns.some(pattern => 
    scriptId.toLowerCase().includes(pattern)
  ) || srcPatterns.some(pattern => 
    src.toLowerCase().includes(pattern)
  );
}

/**
 * Check if a script is an advertising script
 */
export function isAdScript(scriptId: string, src: string): boolean {
  const adPatterns = [
    'adsense',
    'adsbygoogle',
    'googlesyndication',
    'doubleclick',
    'ads',
  ];

  const srcPatterns = [
    'googlesyndication.com',
    'doubleclick.net',
    'googleadservices.com',
  ];

  return adPatterns.some(pattern => 
    scriptId.toLowerCase().includes(pattern)
  ) || srcPatterns.some(pattern => 
    src.toLowerCase().includes(pattern)
  );
}

/**
 * Check if a script is a push notification script
 */
export function isPushNotificationScript(scriptId: string, src: string): boolean {
  const pushPatterns = [
    'onesignal',
    'push',
    'notification',
    'fcm',
    'firebase-messaging',
  ];

  const srcPatterns = [
    'onesignal.com',
    'firebase.googleapis.com',
    'fcm.googleapis.com',
  ];

  return pushPatterns.some(pattern => 
    scriptId.toLowerCase().includes(pattern)
  ) || srcPatterns.some(pattern => 
    src.toLowerCase().includes(pattern)
  );
}

/**
 * Check if a script contains structured data (JSON-LD)
 */
export function isStructuredDataScript(content: string): boolean {
  return content.includes('application/ld+json') || 
         content.includes('"@context"') ||
         content.includes('"@type"');
}

/**
 * Check if script content has potential server/client mismatch risks
 */
export function hasServerClientMismatchRisk(content: string): boolean {
  const riskPatterns = [
    'new Date()',
    'Date.now()',
    'Math.random()',
    'window.location',
    'navigator.',
    'document.cookie',
    'localStorage',
    'sessionStorage',
    'performance.now()',
    'crypto.getRandomValues',
  ];

  return riskPatterns.some(pattern => content.includes(pattern));
}

/**
 * Check if script content manipulates the DOM
 */
export function hasDOMManipulation(content: string): boolean {
  const domPatterns = [
    'document.write',
    'document.writeln',
    'innerHTML',
    'outerHTML',
    'insertAdjacentHTML',
    'createElement',
    'appendChild',
    'removeChild',
    'insertBefore',
    'replaceChild',
  ];

  return domPatterns.some(pattern => content.includes(pattern));
}

/**
 * Check if script content has dynamic elements that may differ between server and client
 */
export function hasDynamicContent(content: string): boolean {
  const dynamicPatterns = [
    'Math.random',
    'new Date',
    'Date.now',
    'performance.now',
    'crypto.getRandomValues',
    'window.crypto',
    'navigator.userAgent',
    'screen.width',
    'screen.height',
    'window.innerWidth',
    'window.innerHeight',
  ];

  return dynamicPatterns.some(pattern => content.includes(pattern));
}

/**
 * Get recommended configuration for common script types
 */
export function getRecommendedConfig(scriptType: string): Partial<ScriptConfig> {
  const configs: Record<string, Partial<ScriptConfig>> = {
    'google-adsense': {
      strategy: LoadingStrategy.CLIENT_ONLY,
      async: true,
      crossOrigin: 'anonymous',
      timeout: 15000,
    },
    'google-analytics': {
      strategy: LoadingStrategy.DEFERRED,
      async: true,
      timeout: 10000,
    },
    'onesignal': {
      strategy: LoadingStrategy.DEFERRED,
      timeout: 15000,
    },
    'json-ld': {
      strategy: LoadingStrategy.SSR,
      timeout: 5000,
    },
    'web-vitals': {
      strategy: LoadingStrategy.DEFERRED,
      timeout: 10000,
    },
  };

  return configs[scriptType] || {
    strategy: LoadingStrategy.CLIENT_ONLY,
    timeout: 10000,
  };
}

/**
 * Validate script configuration for potential issues
 */
export function validateScriptStrategy(config: ScriptConfig, context: LoadingContext): string[] {
  const warnings: string[] = [];

  // SSR strategy warnings
  if (config.strategy === LoadingStrategy.SSR) {
    if (config.content && hasServerClientMismatchRisk(config.content)) {
      warnings.push('SSR strategy with dynamic content may cause hydration mismatches');
    }

    if (config.content && hasDOMManipulation(config.content)) {
      warnings.push('SSR strategy with DOM manipulation may cause hydration issues');
    }

    if (!context.isServer) {
      warnings.push('SSR strategy used on client-side, will be treated as CLIENT_ONLY');
    }
  }

  // Client-only strategy warnings
  if (config.strategy === LoadingStrategy.CLIENT_ONLY) {
    if (isStructuredDataScript(config.content || '')) {
      warnings.push('CLIENT_ONLY strategy for structured data may impact SEO');
    }
  }

  // Deferred strategy warnings
  if (config.strategy === LoadingStrategy.DEFERRED) {
    if (config.dependencies?.length) {
      warnings.push('DEFERRED strategy with dependencies may cause loading delays');
    }
  }

  return warnings;
}

/**
 * Get loading priority based on script type and strategy
 */
export function getLoadingPriority(config: ScriptConfig): number {
  // Higher numbers = higher priority
  const priorities: Record<LoadingStrategy, number> = {
    [LoadingStrategy.SSR]: 100,
    [LoadingStrategy.CLIENT_ONLY]: 50,
    [LoadingStrategy.DEFERRED]: 10,
  };

  let basePriority = priorities[config.strategy];

  // Adjust based on script type
  if (isStructuredDataScript(config.content || '')) {
    basePriority += 20; // SEO-critical content gets higher priority
  }

  if (isAnalyticsScript(config.id, config.src || '')) {
    basePriority -= 10; // Analytics can wait
  }

  if (isAdScript(config.id, config.src || '')) {
    basePriority -= 20; // Ads have lowest priority
  }

  return basePriority;
}