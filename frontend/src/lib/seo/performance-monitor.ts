// Performance_Monitor Component - Tracks Core Web Vitals, SEO metrics, and performance monitoring

import { SEO_CONFIG } from './config';
import { seoCache, CacheKeys } from './cache';
import type { 
  CoreWebVitalsMetrics,
  SEOMetrics,
  PerformanceAlert,
  PerformanceReport,
  CTRData,
  IndexingProgress
} from './interfaces';

export class PerformanceMonitor {
  private readonly siteUrl = SEO_CONFIG.SITE_URL;
  private readonly siteName = SEO_CONFIG.SITE_NAME;
  private performanceObserver: PerformanceObserver | null = null;
  private vitalsData: CoreWebVitalsMetrics = {
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0,
    timestamp: new Date()
  };

  /**
   * Initialize Core Web Vitals tracking
   */
  initializeCoreWebVitalsTracking(): void {
    try {
      // Only run in browser environment
      if (typeof window === 'undefined') {
        return;
      }

      // Track Largest Contentful Paint (LCP)
      this.trackLCP();
      
      // Track First Input Delay (FID)
      this.trackFID();
      
      // Track Cumulative Layout Shift (CLS)
      this.trackCLS();
      
      // Track First Contentful Paint (FCP)
      this.trackFCP();
      
      // Track Time to First Byte (TTFB)
      this.trackTTFB();

      console.log('Core Web Vitals tracking initialized');
    } catch (error) {
      console.error('Failed to initialize Core Web Vitals tracking:', error);
    }
  }

  /**
   * Track Core Web Vitals metrics
   */
  async trackCoreWebVitals(): Promise<CoreWebVitalsMetrics> {
    try {
      const cacheKey = CacheKeys.coreWebVitals();
      const cached = seoCache.get<CoreWebVitalsMetrics>(cacheKey);
      
      if (cached && this.isRecentMetrics(cached)) {
        return cached;
      }

      // Get current metrics
      const metrics = this.getCurrentMetrics();
      
      // Store metrics
      await this.storeMetrics(metrics);
      
      // Check for performance alerts
      await this.checkPerformanceThresholds(metrics);
      
      // Cache the metrics
      seoCache.set(cacheKey, metrics, SEO_CONFIG.CACHE.TTL.PERFORMANCE_METRICS);
      
      return metrics;
    } catch (error) {
      console.error('Core Web Vitals tracking failed:', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Monitor CTR improvement progress
   */
  async monitorCTRImprovement(): Promise<CTRData> {
    try {
      const cacheKey = CacheKeys.ctrData();
      const cached = seoCache.get<CTRData>(cacheKey);
      
      if (cached && this.isRecentData(cached.lastUpdated)) {
        return cached;
      }

      // Fetch CTR data from analytics
      const ctrData = await this.fetchCTRData();
      
      // Calculate improvement metrics
      const improvement = this.calculateCTRImprovement(ctrData);
      
      // Check if we're meeting the 0.3% → 2-5% target
      if (improvement.currentCTR >= 2.0) {
        await this.triggerSuccessAlert('CTR Target Achieved', 
          `CTR improved to ${improvement.currentCTR}% (target: 2-5%)`);
      } else if (improvement.currentCTR < 0.5) {
        await this.triggerAlert('Low CTR Warning', 
          `CTR is ${improvement.currentCTR}% (target: 2-5%)`, 'warning');
      }

      // Cache the data
      seoCache.set(cacheKey, ctrData, SEO_CONFIG.CACHE.TTL.SEO_DATA);
      
      return ctrData;
    } catch (error) {
      console.error('CTR monitoring failed:', error);
      return this.getDefaultCTRData();
    }
  }

  /**
   * Track indexing progress
   */
  async trackIndexingProgress(): Promise<IndexingProgress> {
    try {
      const cacheKey = CacheKeys.indexingProgress();
      const cached = seoCache.get<IndexingProgress>(cacheKey);
      
      if (cached && this.isRecentData(cached.lastUpdated)) {
        return cached;
      }

      // Fetch indexing data from Search Console
      const indexingData = await this.fetchIndexingData();
      
      // Calculate progress towards 21 → 35+ pages goal
      const progress = this.calculateIndexingProgress(indexingData);
      
      // Check if we're meeting the indexing target
      if (indexingData.indexedPages >= 35) {
        await this.triggerSuccessAlert('Indexing Target Achieved', 
          `${indexingData.indexedPages} pages indexed (target: 35+)`);
      } else if (indexingData.indexedPages < 25) {
        await this.triggerAlert('Low Indexing Warning', 
          `Only ${indexingData.indexedPages} pages indexed (target: 35+)`, 'warning');
      }

      // Cache the data
      seoCache.set(cacheKey, indexingData, SEO_CONFIG.CACHE.TTL.SEO_DATA);
      
      return indexingData;
    } catch (error) {
      console.error('Indexing progress tracking failed:', error);
      return this.getDefaultIndexingProgress();
    }
  }

  /**
   * Generate comprehensive SEO performance report
   */
  async generateSEOReport(): Promise<PerformanceReport> {
    try {
      const [coreWebVitals, ctrData, indexingProgress, seoMetrics] = await Promise.all([
        this.trackCoreWebVitals(),
        this.monitorCTRImprovement(),
        this.trackIndexingProgress(),
        this.collectSEOMetrics()
      ]);

      const report: PerformanceReport = {
        id: `report_${Date.now()}`,
        generatedAt: new Date(),
        period: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          end: new Date()
        },
        coreWebVitals,
        ctrData,
        indexingProgress,
        seoMetrics,
        summary: this.generateReportSummary(coreWebVitals, ctrData, indexingProgress, seoMetrics),
        recommendations: this.generateRecommendations(coreWebVitals, ctrData, indexingProgress, seoMetrics)
      };

      // Store report for historical tracking
      await this.storeReport(report);

      return report;
    } catch (error) {
      console.error('SEO report generation failed:', error);
      throw error;
    }
  }

  /**
   * Check performance thresholds and trigger alerts
   */
  private async checkPerformanceThresholds(metrics: CoreWebVitalsMetrics): Promise<void> {
    const alerts: PerformanceAlert[] = [];

    // LCP threshold: < 2.5s (good), 2.5-4s (needs improvement), > 4s (poor)
    if (metrics.lcp > 4000) {
      alerts.push({
        type: 'critical',
        metric: 'LCP',
        value: metrics.lcp,
        threshold: 2500,
        message: `LCP is ${(metrics.lcp / 1000).toFixed(2)}s (target: < 2.5s)`,
        timestamp: new Date()
      });
    } else if (metrics.lcp > 2500) {
      alerts.push({
        type: 'warning',
        metric: 'LCP',
        value: metrics.lcp,
        threshold: 2500,
        message: `LCP needs improvement: ${(metrics.lcp / 1000).toFixed(2)}s (target: < 2.5s)`,
        timestamp: new Date()
      });
    }

    // FID threshold: < 100ms (good), 100-300ms (needs improvement), > 300ms (poor)
    if (metrics.fid > 300) {
      alerts.push({
        type: 'critical',
        metric: 'FID',
        value: metrics.fid,
        threshold: 100,
        message: `FID is ${metrics.fid}ms (target: < 100ms)`,
        timestamp: new Date()
      });
    } else if (metrics.fid > 100) {
      alerts.push({
        type: 'warning',
        metric: 'FID',
        value: metrics.fid,
        threshold: 100,
        message: `FID needs improvement: ${metrics.fid}ms (target: < 100ms)`,
        timestamp: new Date()
      });
    }

    // CLS threshold: < 0.1 (good), 0.1-0.25 (needs improvement), > 0.25 (poor)
    if (metrics.cls > 0.25) {
      alerts.push({
        type: 'critical',
        metric: 'CLS',
        value: metrics.cls,
        threshold: 0.1,
        message: `CLS is ${metrics.cls.toFixed(3)} (target: < 0.1)`,
        timestamp: new Date()
      });
    } else if (metrics.cls > 0.1) {
      alerts.push({
        type: 'warning',
        metric: 'CLS',
        value: metrics.cls,
        threshold: 0.1,
        message: `CLS needs improvement: ${metrics.cls.toFixed(3)} (target: < 0.1)`,
        timestamp: new Date()
      });
    }

    // Process alerts
    for (const alert of alerts) {
      await this.triggerAlert(alert.message, alert.message, alert.type);
    }
  }

  /**
   * Track Largest Contentful Paint (LCP)
   */
  private trackLCP(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry) {
          this.vitalsData.lcp = lastEntry.startTime;
          this.vitalsData.timestamp = new Date();
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.error('LCP tracking failed:', error);
    }
  }

  /**
   * Track First Input Delay (FID)
   */
  private trackFID(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry: any) => {
          if (entry.name === 'first-input') {
            this.vitalsData.fid = entry.processingStart - entry.startTime;
            this.vitalsData.timestamp = new Date();
          }
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.error('FID tracking failed:', error);
    }
  }

  /**
   * Track Cumulative Layout Shift (CLS)
   */
  private trackCLS(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      let clsValue = 0;
      let sessionValue = 0;
      let sessionEntries: any[] = [];

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

            if (sessionValue && 
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            } else {
              sessionValue = entry.value;
              sessionEntries = [entry];
            }

            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              this.vitalsData.cls = clsValue;
              this.vitalsData.timestamp = new Date();
            }
          }
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.error('CLS tracking failed:', error);
    }
  }

  /**
   * Track First Contentful Paint (FCP)
   */
  private trackFCP(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry: any) => {
          if (entry.name === 'first-contentful-paint') {
            this.vitalsData.fcp = entry.startTime;
            this.vitalsData.timestamp = new Date();
          }
        });
      });

      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.error('FCP tracking failed:', error);
    }
  }

  /**
   * Track Time to First Byte (TTFB)
   */
  private trackTTFB(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry: any) => {
          if (entry.entryType === 'navigation') {
            this.vitalsData.ttfb = entry.responseStart - entry.requestStart;
            this.vitalsData.timestamp = new Date();
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.error('TTFB tracking failed:', error);
    }
  }

  /**
   * Get current metrics
   */
  private getCurrentMetrics(): CoreWebVitalsMetrics {
    return { ...this.vitalsData };
  }

  /**
   * Store metrics to database/analytics
   */
  private async storeMetrics(metrics: CoreWebVitalsMetrics): Promise<void> {
    try {
      // This would integrate with your analytics/database system
      console.log('Storing Core Web Vitals metrics:', metrics);
      
      // In real implementation, this would store to database
      // await analyticsService.storeMetrics(metrics);
    } catch (error) {
      console.error('Failed to store metrics:', error);
    }
  }

  /**
   * Fetch CTR data from analytics
   */
  private async fetchCTRData(): Promise<CTRData> {
    try {
      // This would integrate with Google Analytics/Search Console
      // For now, return mock data
      return {
        currentCTR: 1.2, // Current CTR percentage
        previousCTR: 0.3, // Previous period CTR
        improvement: 300, // Percentage improvement
        targetCTR: 2.5, // Target CTR
        period: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        pageData: [
          { page: '/jobs', ctr: 1.5, impressions: 10000, clicks: 150 },
          { page: '/schemes', ctr: 1.1, impressions: 5000, clicks: 55 },
          { page: '/result', ctr: 2.1, impressions: 8000, clicks: 168 }
        ],
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Failed to fetch CTR data:', error);
      return this.getDefaultCTRData();
    }
  }

  /**
   * Fetch indexing data from Search Console
   */
  private async fetchIndexingData(): Promise<IndexingProgress> {
    try {
      // This would integrate with Google Search Console API
      // For now, return mock data
      return {
        indexedPages: 28, // Current indexed pages
        previousIndexedPages: 21, // Previous count
        targetPages: 35, // Target indexed pages
        newlyIndexed: 7, // Recently indexed pages
        deindexed: 0, // Recently deindexed pages
        crawlErrors: 2, // Current crawl errors
        period: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        pageTypes: {
          jobs: 12,
          schemes: 8,
          results: 5,
          categories: 3
        },
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Failed to fetch indexing data:', error);
      return this.getDefaultIndexingProgress();
    }
  }

  /**
   * Collect comprehensive SEO metrics
   */
  private async collectSEOMetrics(): Promise<SEOMetrics> {
    try {
      return {
        organicTraffic: {
          current: 15420,
          previous: 12850,
          growth: 20.0
        },
        keywordRankings: {
          topTen: 42,
          topFifty: 128,
          total: 256,
          averagePosition: 18.5
        },
        technicalSEO: {
          structuredDataValid: 95,
          crawlErrors: 2,
          pagespeedScore: 78,
          mobileUsability: 98
        },
        contentMetrics: {
          totalPages: 156,
          optimizedPages: 89,
          duplicateContent: 3,
          thinContent: 8
        },
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Failed to collect SEO metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate CTR improvement
   */
  private calculateCTRImprovement(ctrData: CTRData): {
    currentCTR: number;
    improvement: number;
    isOnTarget: boolean;
  } {
    const improvement = ((ctrData.currentCTR - ctrData.previousCTR) / ctrData.previousCTR) * 100;
    const isOnTarget = ctrData.currentCTR >= 2.0 && ctrData.currentCTR <= 5.0;

    return {
      currentCTR: ctrData.currentCTR,
      improvement,
      isOnTarget
    };
  }

  /**
   * Calculate indexing progress
   */
  private calculateIndexingProgress(indexingData: IndexingProgress): {
    progress: number;
    isOnTarget: boolean;
    pagesNeeded: number;
  } {
    const progress = (indexingData.indexedPages / indexingData.targetPages) * 100;
    const isOnTarget = indexingData.indexedPages >= indexingData.targetPages;
    const pagesNeeded = Math.max(0, indexingData.targetPages - indexingData.indexedPages);

    return {
      progress,
      isOnTarget,
      pagesNeeded
    };
  }

  /**
   * Generate report summary
   */
  private generateReportSummary(
    coreWebVitals: CoreWebVitalsMetrics,
    ctrData: CTRData,
    indexingProgress: IndexingProgress,
    seoMetrics: SEOMetrics
  ): string {
    const ctrImprovement = this.calculateCTRImprovement(ctrData);
    const indexingProgressCalc = this.calculateIndexingProgress(indexingProgress);

    return `SEO Performance Summary:
    • CTR: ${ctrData.currentCTR}% (${ctrImprovement.improvement > 0 ? '+' : ''}${ctrImprovement.improvement.toFixed(1)}% vs previous)
    • Indexed Pages: ${indexingProgress.indexedPages}/${indexingProgress.targetPages} (${indexingProgressCalc.progress.toFixed(1)}% of target)
    • Core Web Vitals: LCP ${(coreWebVitals.lcp / 1000).toFixed(2)}s, FID ${coreWebVitals.fid}ms, CLS ${coreWebVitals.cls.toFixed(3)}
    • Organic Traffic: ${seoMetrics.organicTraffic.current.toLocaleString()} (+${seoMetrics.organicTraffic.growth}%)
    • Top 10 Keywords: ${seoMetrics.keywordRankings.topTen}`;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    coreWebVitals: CoreWebVitalsMetrics,
    ctrData: CTRData,
    indexingProgress: IndexingProgress,
    seoMetrics: SEOMetrics
  ): string[] {
    const recommendations: string[] = [];

    // CTR recommendations
    if (ctrData.currentCTR < 2.0) {
      recommendations.push('Optimize meta titles and descriptions with emotional triggers and urgency indicators');
      recommendations.push('Add more Hinglish keywords and emojis to improve CTR');
    }

    // Indexing recommendations
    if (indexingProgress.indexedPages < indexingProgress.targetPages) {
      recommendations.push(`Submit ${indexingProgress.targetPages - indexingProgress.indexedPages} more pages for indexing`);
      recommendations.push('Fix crawl errors and improve internal linking');
    }

    // Core Web Vitals recommendations
    if (coreWebVitals.lcp > 2500) {
      recommendations.push('Optimize images and reduce server response time to improve LCP');
    }
    if (coreWebVitals.fid > 100) {
      recommendations.push('Reduce JavaScript execution time to improve FID');
    }
    if (coreWebVitals.cls > 0.1) {
      recommendations.push('Add size attributes to images and avoid dynamic content insertion');
    }

    // Technical SEO recommendations
    if (seoMetrics.technicalSEO.crawlErrors > 0) {
      recommendations.push(`Fix ${seoMetrics.technicalSEO.crawlErrors} crawl errors`);
    }
    if (seoMetrics.technicalSEO.pagespeedScore < 80) {
      recommendations.push('Improve page speed score through image optimization and caching');
    }

    return recommendations;
  }

  /**
   * Store performance report
   */
  private async storeReport(report: PerformanceReport): Promise<void> {
    try {
      // This would store to database for historical tracking
      console.log('Storing performance report:', report.id);
      
      // In real implementation:
      // await reportService.storeReport(report);
    } catch (error) {
      console.error('Failed to store report:', error);
    }
  }

  /**
   * Trigger performance alert
   */
  private async triggerAlert(title: string, message: string, type: 'warning' | 'critical' = 'warning'): Promise<void> {
    try {
      console.log(`${type.toUpperCase()} ALERT: ${title} - ${message}`);
      
      // In real implementation, this would send notifications
      // await notificationService.sendAlert({ title, message, type });
    } catch (error) {
      console.error('Failed to trigger alert:', error);
    }
  }

  /**
   * Trigger success alert
   */
  private async triggerSuccessAlert(title: string, message: string): Promise<void> {
    try {
      console.log(`SUCCESS: ${title} - ${message}`);
      
      // In real implementation, this would send success notifications
      // await notificationService.sendSuccessAlert({ title, message });
    } catch (error) {
      console.error('Failed to trigger success alert:', error);
    }
  }

  /**
   * Helper methods
   */
  private isRecentMetrics(metrics: CoreWebVitalsMetrics): boolean {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return metrics.timestamp.getTime() > fiveMinutesAgo;
  }

  private isRecentData(timestamp: Date): boolean {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return timestamp.getTime() > oneHourAgo;
  }

  private getDefaultMetrics(): CoreWebVitalsMetrics {
    return {
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      ttfb: 0,
      timestamp: new Date()
    };
  }

  private getDefaultCTRData(): CTRData {
    return {
      currentCTR: 0.3,
      previousCTR: 0.3,
      improvement: 0,
      targetCTR: 2.5,
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      pageData: [],
      lastUpdated: new Date()
    };
  }

  private getDefaultIndexingProgress(): IndexingProgress {
    return {
      indexedPages: 21,
      previousIndexedPages: 21,
      targetPages: 35,
      newlyIndexed: 0,
      deindexed: 0,
      crawlErrors: 0,
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      pageTypes: {
        jobs: 0,
        schemes: 0,
        results: 0,
        categories: 0
      },
      lastUpdated: new Date()
    };
  }

  /**
   * Cleanup method
   */
  cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();