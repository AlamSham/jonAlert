/**
 * Google Analytics Provider for AnalyticsManager
 * Implements hydration-safe Google Analytics integration
 */

import { AnalyticsProvider, AnalyticsEvent, ProviderIsolationConfig } from '../types';

export class GoogleAnalyticsProvider implements AnalyticsProvider {
  public readonly id = 'google-analytics';
  public readonly name = 'Google Analytics';
  public readonly isolationConfig: ProviderIsolationConfig = {
    domIsolation: false, // GA needs access to main DOM
    sandboxed: false,
    allowedDomains: ['google-analytics.com', 'googletagmanager.com'],
    maxExecutionTime: 5000,
  };

  private gaId: string;
  private loaded = false;

  constructor(gaId: string) {
    this.gaId = gaId;
  }

  /**
   * Load Google Analytics script
   */
  public async loadScript(): Promise<void> {
    if (this.loaded || typeof window === 'undefined') {
      return;
    }

    try {
      // Load gtag script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
      
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Analytics script'));
        document.head.appendChild(script);
      });

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      
      // Make gtag globally available
      (window as any).gtag = gtag;

      gtag('js', new Date());
      gtag('config', this.gaId, {
        // Optimize for hydration safety
        send_page_view: false, // We'll send manually after hydration
        anonymize_ip: true,
        allow_google_signals: false, // Reduce external dependencies
      });

      this.loaded = true;
    } catch (error) {
      throw new Error(`Google Analytics failed to load: ${error}`);
    }
  }

  /**
   * Check if Google Analytics is loaded
   */
  public isLoaded(): boolean {
    return this.loaded && typeof window !== 'undefined' && !!(window as any).gtag;
  }

  /**
   * Track event to Google Analytics
   */
  public trackEvent(event: AnalyticsEvent): void {
    if (!this.isLoaded()) {
      throw new Error('Google Analytics not loaded');
    }

    try {
      const gtag = (window as any).gtag;
      
      // Convert our event format to GA format
      const gaEvent = this.convertToGAEvent(event);
      
      gtag('event', gaEvent.action, gaEvent.parameters);
    } catch (error) {
      throw new Error(`Failed to track event to Google Analytics: ${error}`);
    }
  }

  /**
   * Convert our event format to Google Analytics format
   */
  private convertToGAEvent(event: AnalyticsEvent): { action: string; parameters: Record<string, any> } {
    const parameters: Record<string, any> = {
      ...event.data,
      event_category: event.data.event_category || 'General',
      event_label: event.data.event_label,
      value: event.data.value,
      custom_map: {
        timestamp: event.timestamp,
      },
    };

    // Clean up parameters (GA has specific requirements)
    Object.keys(parameters).forEach(key => {
      if (parameters[key] === undefined || parameters[key] === null) {
        delete parameters[key];
      }
    });

    return {
      action: event.type,
      parameters,
    };
  }

  /**
   * Send page view to Google Analytics
   */
  public trackPageView(path: string, title: string): void {
    if (!this.isLoaded()) return;

    try {
      const gtag = (window as any).gtag;
      gtag('config', this.gaId, {
        page_path: path,
        page_title: title,
      });
    } catch (error) {
      console.warn('Failed to track page view:', error);
    }
  }

  /**
   * Set user properties
   */
  public setUserProperties(properties: Record<string, any>): void {
    if (!this.isLoaded()) return;

    try {
      const gtag = (window as any).gtag;
      gtag('set', properties);
    } catch (error) {
      console.warn('Failed to set user properties:', error);
    }
  }
}

// Extend window interface for Google Analytics
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}