// Main SEO Integration - Wires all SEO components together
export * from './interfaces';
export * from './config';

// Core SEO Components (Resilient versions with error handling)
export {
  ctrOptimizer,
  metaOptimizer,
  schemaGenerator,
  contentEnhancer,
  performanceMonitor,
  contentAutomation
} from './resilient-seo';

// Advanced SEO Components
export { indexingManager } from './indexing-manager';
export { smartLinking } from './smart-linking';
export { gscIntegration } from './gsc-integration';

// Cache Management
export { seoCache, CacheEventEmitter } from './cache-manager';
export { 
  redisSeoCache, 
  redisStructuredDataCache, 
  redisPerformanceCache,
  AdvancedCacheWarmer,
  CacheInvalidationManager 
} from './redis-cache';

// Import for internal use
import { seoCache } from './cache-manager';
import { seoNotificationSystem } from './notification-system';
import { performanceMonitor as originalPerformanceMonitor } from './performance-monitor';
import { contentAutomation } from './resilient-seo';

// Error Handling and Resilience
export { 
  seoErrorHandler, 
  SEOFallbackGenerator, 
  GracefulDegradationManager,
  SEOCircuitBreaker 
} from './error-handler';

// Monitoring and Health
export { SEOHealthMonitor } from './resilient-seo';

// Notifications and Reporting
export { seoNotificationSystem } from './notification-system';

// Utility Functions
export { CacheKeys } from './cache';

/**
 * Initialize the complete SEO system
 */
export async function initializeSEOSystem(): Promise<{
  success: boolean;
  components: string[];
  errors: string[];
}> {
  const components: string[] = [];
  const errors: string[] = [];

  try {
    console.log('Initializing SarkariPulse SEO System...');

    // Initialize cache manager
    try {
      const cacheManager = await seoCache;
      await cacheManager.initialize();
      components.push('Cache Manager');
    } catch (error) {
      errors.push(`Cache Manager: ${(error as Error).message}`);
    }

    // Initialize notification system
    try {
      await seoNotificationSystem.initialize();
      components.push('Notification System');
    } catch (error) {
      errors.push(`Notification System: ${(error as Error).message}`);
    }

    // Initialize performance monitoring
    try {
      originalPerformanceMonitor.initializeCoreWebVitalsTracking();
      components.push('Performance Monitor');
    } catch (error) {
      errors.push(`Performance Monitor: ${(error as Error).message}`);
    }

    // Warm critical caches
    try {
      const { AdvancedCacheWarmer } = await import('./redis-cache');
      await AdvancedCacheWarmer.warmCriticalSEOPages();
      components.push('Cache Warming');
    } catch (error) {
      errors.push(`Cache Warming: ${(error as Error).message}`);
    }

    console.log(`SEO System initialized successfully. Components: ${components.length}, Errors: ${errors.length}`);
    
    return {
      success: errors.length === 0,
      components,
      errors
    };
  } catch (error) {
    console.error('Failed to initialize SEO system:', error);
    return {
      success: false,
      components,
      errors: [...errors, `System: ${(error as Error).message}`]
    };
  }
}

/**
 * Get SEO system health status
 */
export async function getSEOSystemHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
  errors: string[];
  recommendations: string[];
  lastChecked: Date;
}> {
  try {
    const { SEOHealthMonitor } = await import('./resilient-seo');
    const health = await SEOHealthMonitor.checkSystemHealth();
    
    return {
      ...health,
      lastChecked: new Date()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      components: {},
      errors: [`Health check failed: ${(error as Error).message}`],
      recommendations: ['Restart SEO system', 'Check system logs'],
      lastChecked: new Date()
    };
  }
}

/**
 * Generate complete SEO package for a page
 */
export async function generatePageSEO(pageData: {
  type: 'job' | 'scheme' | 'result' | 'admit-card' | 'category' | 'state';
  title: string;
  url: string;
  category: string;
  state?: string;
  organization?: string;
  content: any;
  metadata?: any;
}): Promise<{
  success: boolean;
  metaTags: any;
  structuredData: any[];
  enhancedContent: any;
  seoScore: number;
  recommendations: string[];
  automationApplied: string[];
  errors?: string[];
}> {
  try {
    const result = await contentAutomation.autoGenerateCompleteSEOPackage(pageData);
    
    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error('Failed to generate page SEO:', error);
    
    // Return fallback SEO package
    const { SEOFallbackGenerator } = await import('./error-handler');
    
    return {
      success: false,
      metaTags: {
        title: SEOFallbackGenerator.generateFallbackTitle({
          pageType: pageData.type,
          category: pageData.category,
          state: pageData.state,
          organization: pageData.organization
        }),
        description: SEOFallbackGenerator.generateFallbackDescription({
          pageType: pageData.type,
          category: pageData.category,
          state: pageData.state,
          organization: pageData.organization
        }),
        keywords: ['government jobs', 'sarkari naukri'],
        robots: 'index,follow',
        canonical: pageData.url,
        hreflang: [],
        openGraph: {
          title: pageData.title,
          description: 'Latest updates on SarkariPulse',
          type: 'website',
          url: pageData.url,
          image: 'https://sarkaripulse.net/logo.jpg',
          siteName: 'SarkariPulse',
          locale: 'en_IN'
        },
        twitterCard: {
          card: 'summary_large_image',
          title: pageData.title,
          description: 'Latest updates on SarkariPulse'
        }
      },
      structuredData: [SEOFallbackGenerator.generateFallbackStructuredData({
        pageType: pageData.type,
        title: pageData.title,
        description: 'Latest updates on SarkariPulse',
        url: pageData.url
      })],
      enhancedContent: {
        originalContent: pageData.content,
        enhancedContent: pageData.content,
        addedSections: [],
        keywordDensity: 1.5,
        readabilityScore: 60,
        faqItems: SEOFallbackGenerator.generateFallbackFAQ(pageData.category).map(faq => ({
          question: faq.question,
          answer: faq.answer,
          category: pageData.category
        })),
        relatedLinks: []
      },
      seoScore: 50,
      recommendations: [
        'System is running in fallback mode',
        'Check SEO system health',
        'Retry SEO generation when system is stable'
      ],
      automationApplied: [
        'Fallback title generation',
        'Fallback meta description',
        'Basic structured data',
        'Minimal content enhancement'
      ],
      errors: [(error as Error).message]
    };
  }
}

/**
 * Invalidate SEO caches for content updates
 */
export async function invalidateSEOCaches(contentType: 'job' | 'scheme' | 'result' | 'general', contentId?: string): Promise<{
  success: boolean;
  invalidatedCount: number;
  errors: string[];
}> {
  try {
    const { CacheInvalidationManager } = await import('./redis-cache');
    let invalidatedCount = 0;
    const errors: string[] = [];

    switch (contentType) {
      case 'job':
        await CacheInvalidationManager.invalidateJobCaches();
        invalidatedCount += 10; // Approximate count
        break;
      case 'scheme':
        await CacheInvalidationManager.invalidateSchemeCaches();
        invalidatedCount += 8;
        break;
      case 'general':
        await CacheInvalidationManager.invalidateAllSEOCaches();
        invalidatedCount += 50;
        break;
      default:
        // Invalidate specific content
        const cacheManager = await seoCache;
        invalidatedCount = await cacheManager.invalidatePattern(`*${contentType}*`);
    }

    // Emit cache invalidation event
    const { CacheEventEmitter } = await import('./cache-manager');
    CacheEventEmitter.emitContentUpdate(contentType, contentId || 'unknown');

    return {
      success: true,
      invalidatedCount,
      errors
    };
  } catch (error) {
    return {
      success: false,
      invalidatedCount: 0,
      errors: [(error as Error).message]
    };
  }
}

/**
 * Get SEO performance metrics
 */
export async function getSEOMetrics(): Promise<{
  success: boolean;
  metrics: any;
  errors: string[];
}> {
  try {
    const report = await originalPerformanceMonitor.generateSEOReport();
    
    return {
      success: true,
      metrics: {
        ctr: {
          current: report.ctrData.currentCTR,
          target: report.ctrData.targetCTR,
          improvement: report.ctrData.improvement
        },
        indexing: {
          current: report.indexingProgress.indexedPages,
          target: report.indexingProgress.targetPages,
          progress: (report.indexingProgress.indexedPages / report.indexingProgress.targetPages) * 100
        },
        coreWebVitals: {
          lcp: report.coreWebVitals.lcp / 1000,
          fid: report.coreWebVitals.fid,
          cls: report.coreWebVitals.cls,
          score: getCoreWebVitalsScore(report.coreWebVitals)
        },
        traffic: report.seoMetrics.organicTraffic,
        technical: report.seoMetrics.technicalSEO
      },
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      metrics: {},
      errors: [(error as Error).message]
    };
  }
}

function getCoreWebVitalsScore(vitals: any): 'good' | 'needs-improvement' | 'poor' {
  const lcpScore = vitals.lcp <= 2500 ? 2 : vitals.lcp <= 4000 ? 1 : 0;
  const fidScore = vitals.fid <= 100 ? 2 : vitals.fid <= 300 ? 1 : 0;
  const clsScore = vitals.cls <= 0.1 ? 2 : vitals.cls <= 0.25 ? 1 : 0;
  
  const totalScore = lcpScore + fidScore + clsScore;
  
  if (totalScore >= 5) return 'good';
  if (totalScore >= 3) return 'needs-improvement';
  return 'poor';
}

// Auto-initialize SEO system in browser environment
if (typeof window !== 'undefined') {
  // Initialize after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeSEOSystem().then(result => {
        if (result.success) {
          console.log('✅ SEO System initialized successfully');
        } else {
          console.warn('⚠️ SEO System initialized with errors:', result.errors);
        }
      });
    });
  } else {
    initializeSEOSystem().then(result => {
      if (result.success) {
        console.log('✅ SEO System initialized successfully');
      } else {
        console.warn('⚠️ SEO System initialized with errors:', result.errors);
      }
    });
  }
}
