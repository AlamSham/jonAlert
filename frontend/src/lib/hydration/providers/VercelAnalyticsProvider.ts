/**
 * Vercel Analytics Provider for AnalyticsManager
 * Implements hydration-safe Vercel Analytics integration
 */

import { AnalyticsProvider, AnalyticsEvent, ProviderIsolationConfig } from '../types';

export class VercelAnalyticsProvider implements AnalyticsProvider {
  public readonly id = 'vercel-analytics';
  public readonly name = 'Vercel Analytics';
  public readonly isolationConfig: ProviderIsolationConfig = {
    domIsolation: false, // Vercel Analytics is lightweight
    sandboxed: false,
    allowedDomains: ['vercel.com', 'vitals.vercel-analytics.com'],
    maxExecutionTime: 3000,
  };

  private loaded = false;
  private va: any = null;

  /**
   * Load Vercel Analytics
   */
  public async loadScript(): Promise<void> {
    if (this.loaded || typeof window === 'undefined') {
      return;
    }

    try {
      // Vercel Analytics is typically loaded via @vercel/analytics/react
      // We'll check if it's already available or load it dynamically
      
      if ((window as any).va) {
        this.va = (window as any).va;
        this.loaded = true;
        return;
      }

      // Dynamic import of Vercel Analytics
      const { track } = await import('@vercel/analytics');
      this.va = { track };
      this.loaded = true;
    } catch (error) {
      // Fallback: Create a minimal implementation
      console.warn('Vercel Analytics not available, using fallback');
      this.va = {
        track: (name: string, properties?: Record<string, any>) => {
          // Send to Vercel Analytics endpoint if available
          if (navigator.sendBeacon) {
            const data = JSON.stringify({ name, properties, timestamp: Date.now() });
            navigator.sendBeacon('/_vercel/insights/event', data);
          }
        }
      };
      this.loaded = true;
    }
  }

  /**
   * Check if Vercel Analytics is loaded
   */
  public isLoaded(): boolean {
    return this.loaded && this.va !== null;
  }

  /**
   * Track event to Vercel Analytics
   */
  public trackEvent(event: AnalyticsEvent): void {
    if (!this.isLoaded()) {
      throw new Error('Vercel Analytics not loaded');
    }

    try {
      // Convert our event format to Vercel Analytics format
      const vercelEvent = this.convertToVercelEvent(event);
      
      this.va.track(vercelEvent.name, vercelEvent.properties);
    } catch (error) {
      throw new Error(`Failed to track event to Vercel Analytics: ${error}`);
    }
  }

  /**
   * Convert our event format to Vercel Analytics format
   */
  private convertToVercelEvent(event: AnalyticsEvent): { name: string; properties: Record<string, any> } {
    // Vercel Analytics prefers simple event names and properties
    const properties: Record<string, any> = {
      ...event.data,
      timestamp: event.timestamp,
    };

    // Clean up properties (remove undefined/null values)
    Object.keys(properties).forEach(key => {
      if (properties[key] === undefined || properties[key] === null) {
        delete properties[key];
      }
      
      // Convert complex objects to strings
      if (typeof properties[key] === 'object' && properties[key] !== null) {
        properties[key] = JSON.stringify(properties[key]);
      }
    });

    // Map event types to Vercel-friendly names
    const eventName = this.mapEventName(event.type);

    return {
      name: eventName,
      properties,
    };
  }

  /**
   * Map our event types to Vercel Analytics conventions
   */
  private mapEventName(eventType: string): string {
    const eventMap: Record<string, string> = {
      'apply_click': 'Job Application',
      'search': 'Search',
      'page_view': 'Page View',
      'social_share': 'Social Share',
      'internal_link_click': 'Internal Navigation',
      'scroll_depth': 'Scroll Engagement',
      'time_on_page': 'Page Engagement',
      'form_submission': 'Form Submit',
      'error': 'Error',
      'web_vitals': 'Performance',
    };

    return eventMap[eventType] || eventType;
  }

  /**
   * Track page view specifically
   */
  public trackPageView(path: string, title: string): void {
    if (!this.isLoaded()) return;

    try {
      this.va.track('Page View', {
        path,
        title,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.warn('Failed to track page view to Vercel Analytics:', error);
    }
  }

  /**
   * Track conversion event
   */
  public trackConversion(type: string, value?: number): void {
    if (!this.isLoaded()) return;

    try {
      this.va.track('Conversion', {
        type,
        value: value || 1,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.warn('Failed to track conversion to Vercel Analytics:', error);
    }
  }
}

// Extend window interface for Vercel Analytics
declare global {
  interface Window {
    va?: {
      track: (name: string, properties?: Record<string, any>) => void;
    };
  }
}