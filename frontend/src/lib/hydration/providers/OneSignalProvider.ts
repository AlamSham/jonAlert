/**
 * OneSignal Provider for AnalyticsManager
 * Implements hydration-safe OneSignal integration with DOM isolation
 */

import { AnalyticsProvider, AnalyticsEvent, ProviderIsolationConfig } from '../types';

export class OneSignalProvider implements AnalyticsProvider {
  public readonly id = 'onesignal';
  public readonly name = 'OneSignal';
  public readonly isolationConfig: ProviderIsolationConfig = {
    domIsolation: true, // OneSignal modifies DOM extensively
    sandboxed: false, // Needs access for notifications
    allowedDomains: ['onesignal.com'],
    maxExecutionTime: 10000,
  };

  private appId: string;
  private loaded = false;
  private initialized = false;

  constructor(appId: string) {
    this.appId = appId;
  }

  /**
   * Load OneSignal script with deferred initialization
   */
  public async loadScript(): Promise<void> {
    if (this.loaded || typeof window === 'undefined') {
      return;
    }

    try {
      // Load OneSignal SDK
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load OneSignal script'));
        document.head.appendChild(script);
      });

      this.loaded = true;

      // Initialize OneSignal after hydration
      await this.initializeOneSignal();
    } catch (error) {
      throw new Error(`OneSignal failed to load: ${error}`);
    }
  }

  /**
   * Initialize OneSignal with hydration-safe configuration
   */
  private async initializeOneSignal(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    try {
      // Use OneSignal's deferred initialization pattern
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        await OneSignal.init({
          appId: this.appId,
          notifyButton: {
            enable: true,
          },
          // Hydration-safe settings
          allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
          autoRegister: false, // Manual registration after hydration
          autoResubscribe: true,
          // Reduce DOM manipulation during hydration
          promptOptions: {
            slidedown: {
              prompts: [
                {
                  type: 'push',
                  autoPrompt: false, // Manual prompting after hydration
                  text: {
                    actionMessage: 'Get instant job alerts!',
                    acceptButton: 'Allow',
                    cancelButton: 'No Thanks',
                  },
                },
              ],
            },
          },
        });

        this.initialized = true;
      });
    } catch (error) {
      throw new Error(`OneSignal initialization failed: ${error}`);
    }
  }

  /**
   * Check if OneSignal is loaded and initialized
   */
  public isLoaded(): boolean {
    return this.loaded && this.initialized && typeof window !== 'undefined' && !!(window as any).OneSignal;
  }

  /**
   * Track event to OneSignal (custom events for segmentation)
   */
  public trackEvent(event: AnalyticsEvent): void {
    if (!this.isLoaded()) {
      throw new Error('OneSignal not loaded');
    }

    try {
      const OneSignal = (window as any).OneSignal;
      
      // Convert event to OneSignal tags for user segmentation
      const tags = this.convertToOneSignalTags(event);
      
      if (Object.keys(tags).length > 0) {
        OneSignal.sendTags(tags);
      }

      // Track custom events if supported
      if (OneSignal.sendEvent) {
        OneSignal.sendEvent(event.type, event.data);
      }
    } catch (error) {
      throw new Error(`Failed to track event to OneSignal: ${error}`);
    }
  }

  /**
   * Convert analytics event to OneSignal tags
   */
  private convertToOneSignalTags(event: AnalyticsEvent): Record<string, string> {
    const tags: Record<string, string> = {};

    // Map specific events to user segments
    switch (event.type) {
      case 'apply_click':
        tags.job_seeker = 'true';
        tags.last_apply = new Date().toISOString().split('T')[0];
        if (event.data.job_category) {
          tags.interested_category = event.data.job_category;
        }
        break;

      case 'search':
        tags.active_searcher = 'true';
        tags.last_search = new Date().toISOString().split('T')[0];
        if (event.data.search_type) {
          tags.search_preference = event.data.search_type;
        }
        break;

      case 'page_view':
        if (event.data.page_category) {
          tags.viewed_category = event.data.page_category;
        }
        tags.last_visit = new Date().toISOString().split('T')[0];
        break;

      case 'social_share':
        tags.social_sharer = 'true';
        if (event.data.social_platform) {
          tags.preferred_platform = event.data.social_platform;
        }
        break;
    }

    return tags;
  }

  /**
   * Show notification prompt (after hydration)
   */
  public async showPrompt(): Promise<void> {
    if (!this.isLoaded()) return;

    try {
      const OneSignal = (window as any).OneSignal;
      await OneSignal.showSlidedownPrompt();
    } catch (error) {
      console.warn('Failed to show OneSignal prompt:', error);
    }
  }

  /**
   * Send notification to user
   */
  public async sendNotification(title: string, message: string, url?: string): Promise<void> {
    if (!this.isLoaded()) return;

    try {
      const OneSignal = (window as any).OneSignal;
      
      // Check if user is subscribed
      const isSubscribed = await OneSignal.isPushNotificationsEnabled();
      if (!isSubscribed) {
        console.warn('User not subscribed to notifications');
        return;
      }

      // Send notification via OneSignal API (requires server-side implementation)
      console.log('Notification would be sent:', { title, message, url });
    } catch (error) {
      console.warn('Failed to send notification:', error);
    }
  }

  /**
   * Get user subscription status
   */
  public async getSubscriptionStatus(): Promise<boolean> {
    if (!this.isLoaded()) return false;

    try {
      const OneSignal = (window as any).OneSignal;
      return await OneSignal.isPushNotificationsEnabled();
    } catch (error) {
      console.warn('Failed to get subscription status:', error);
      return false;
    }
  }
}

// Extend window interface for OneSignal
declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
    OneSignal?: any;
  }
}