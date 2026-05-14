/**
 * Web Vitals Provider for AnalyticsManager
 * Implements hydration-safe Web Vitals tracking
 */

import { AnalyticsProvider, AnalyticsEvent, ProviderIsolationConfig } from '../types';

export class WebVitalsProvider implements AnalyticsProvider {
  public readonly id = 'web-vitals';
  public readonly name = 'Web Vitals';
  public readonly isolationConfig: ProviderIsolationConfig = {
    domIsolation: false, // Web Vitals needs DOM access for measurements
    sandboxed: false,
    maxExecutionTime: 2000,
  };

  private loaded = false;
  private webVitals: any = null;
  private metricsCollected = new Set<string>();

  /**
   * Load Web Vitals library
   */
  public async loadScript(): Promise<void> {
    if (this.loaded || typeof window === 'undefined') {
      return;
    }

    try {
      // Dynamic import of web-vitals
      this.webVitals = await import('web-vitals');
      this.loaded = true;

      // Start collecting metrics immediately after load
      this.startMetricsCollection();
    } catch (error) {
      throw new Error(`Web Vitals failed to load: ${error}`);
    }
  }

  /**
   * Check if Web Vitals is loaded
   */
  public isLoaded(): boolean {
    return this.loaded && this.webVitals !== null;
  }

  /**
   * Track event (Web Vitals metrics are auto-collected)
   */
  public trackEvent(event: AnalyticsEvent): void {
    if (!this.isLoaded()) {
      throw new Error('Web Vitals not loaded');
    }

    // Web Vitals provider primarily handles performance metrics
    // Other events are logged for debugging
    if (event.type === 'web_vitals') {
      this.handleWebVitalsMetric(event);
    }
  }

  /**
   * Start collecting Web Vitals metrics
   */
  private startMetricsCollection(): void {
    if (!this.webVitals) return;

    const { onCLS, onINP, onFCP, onLCP, onTTFB } = this.webVitals;

    // Collect Core Web Vitals
    onCLS(this.createMetricHandler('CLS'));
    onINP(this.createMetricHandler('INP'));
    onFCP(this.createMetricHandler('FCP'));
    onLCP(this.createMetricHandler('LCP'));
    onTTFB(this.createMetricHandler('TTFB'));
  }

  /**
   * Create metric handler for each Web Vital
   */
  private createMetricHandler(metricName: string) {
    return (metric: any) => {
      // Avoid duplicate reporting
      const metricKey = `${metricName}-${metric.id}`;
      if (this.metricsCollected.has(metricKey)) {
        return;
      }
      this.metricsCollected.add(metricKey);

      // Create analytics event
      const event: AnalyticsEvent = {
        type: 'web_vitals',
        data: {
          metric_name: metric.name,
          metric_value: Math.round(metric.value),
          metric_id: metric.id,
          metric_delta: metric.delta ? Math.round(metric.delta) : undefined,
          metric_rating: metric.rating,
          event_category: 'Performance',
          event_label: metric.name,
          value: Math.round(metric.value),
          non_interaction: true,
        },
        timestamp: Date.now(),
        priority: 'medium',
      };

      // Send to analytics endpoint
      this.sendMetricToEndpoint(event);
    };
  }

  /**
   * Handle Web Vitals metric event
   */
  private handleWebVitalsMetric(event: AnalyticsEvent): void {
    // Additional processing for Web Vitals metrics
    const metricName = event.data.metric_name;
    const metricValue = event.data.metric_value;
    const rating = event.data.metric_rating;

    // Log performance issues in development
    if (process.env.NODE_ENV === 'development') {
      if (rating === 'poor') {
        console.warn(`Poor ${metricName} performance: ${metricValue}`, event.data);
      }
    }

    // Store metric for performance monitoring
    this.storeMetric(metricName, metricValue, rating);
  }

  /**
   * Send metric to analytics endpoint
   */
  private sendMetricToEndpoint(event: AnalyticsEvent): void {
    try {
      const body = JSON.stringify(event);
      
      // Use sendBeacon for reliability
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics', body);
      } else {
        // Fallback to fetch
        fetch('/api/analytics', {
          method: 'POST',
          body,
          keepalive: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // Silent fail - don't break user experience
        });
      }
    } catch (error) {
      console.warn('Failed to send Web Vitals metric:', error);
    }
  }

  /**
   * Store metric for performance monitoring
   */
  private storeMetric(name: string, value: number, rating: string): void {
    try {
      // Store in sessionStorage for performance dashboard
      const metrics = this.getStoredMetrics();
      metrics[name] = {
        value,
        rating,
        timestamp: Date.now(),
      };
      
      sessionStorage.setItem('webVitalsMetrics', JSON.stringify(metrics));
    } catch (error) {
      // Storage might be disabled
      console.warn('Failed to store Web Vitals metric:', error);
    }
  }

  /**
   * Get stored metrics
   */
  private getStoredMetrics(): Record<string, any> {
    try {
      const stored = sessionStorage.getItem('webVitalsMetrics');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): Record<string, any> {
    return this.getStoredMetrics();
  }

  /**
   * Get performance rating for the page
   */
  public getPerformanceRating(): 'good' | 'needs-improvement' | 'poor' | 'unknown' {
    const metrics = this.getStoredMetrics();
    const ratings = Object.values(metrics).map((m: any) => m.rating);
    
    if (ratings.length === 0) return 'unknown';
    
    // If any metric is poor, overall is poor
    if (ratings.includes('poor')) return 'poor';
    
    // If any metric needs improvement, overall needs improvement
    if (ratings.includes('needs-improvement')) return 'needs-improvement';
    
    // All metrics are good
    return 'good';
  }

  /**
   * Clear stored metrics
   */
  public clearMetrics(): void {
    try {
      sessionStorage.removeItem('webVitalsMetrics');
      this.metricsCollected.clear();
    } catch (error) {
      console.warn('Failed to clear Web Vitals metrics:', error);
    }
  }
}