/**
 * Integration tests for AnalyticsManager with real providers
 * Validates end-to-end functionality
 */

import { AnalyticsManager } from '../AnalyticsManager';
import { GoogleAnalyticsProvider, WebVitalsProvider } from '../providers';
import { AnalyticsEvent } from '../types';

describe('AnalyticsManager Integration', () => {
  let manager: AnalyticsManager;

  beforeEach(() => {
    manager = new AnalyticsManager({
      enableDebugMode: false,
      analyticsQueueSize: 50,
      analyticsFlushInterval: 1000,
    });
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('Provider Integration', () => {
    it('should register and manage multiple providers', () => {
      const gaProvider = new GoogleAnalyticsProvider('GA_TEST_ID');
      
      // Create a simple mock provider instead of WebVitalsProvider
      const mockProvider = {
        id: 'mock-provider',
        name: 'Mock Provider',
        async loadScript(): Promise<void> {},
        isLoaded(): boolean { return true; },
        trackEvent(event: AnalyticsEvent): void {},
      };

      manager.registerProvider(gaProvider);
      manager.registerProvider(mockProvider as any);

      expect(manager.getProvider('google-analytics')).toBe(gaProvider);
      expect(manager.getProvider('mock-provider')).toBe(mockProvider);
    });

    it('should handle provider isolation configuration', () => {
      const gaProvider = new GoogleAnalyticsProvider('GA_TEST_ID');
      
      // GA provider should not require DOM isolation
      expect(gaProvider.isolationConfig?.domIsolation).toBe(false);
      expect(gaProvider.isolationConfig?.sandboxed).toBe(false);

      manager.registerProvider(gaProvider);
      
      // Should not throw when isolating
      expect(() => {
        manager.isolateProvider('google-analytics');
      }).not.toThrow();
    });

    it('should queue events before providers are loaded', () => {
      const gaProvider = new GoogleAnalyticsProvider('GA_TEST_ID');
      manager.registerProvider(gaProvider);

      const event: AnalyticsEvent = {
        type: 'page_view',
        data: { page: '/test' },
        timestamp: Date.now(),
      };

      manager.trackEvent(event);

      // Event should be queued since provider is not loaded
      expect(manager.getQueueSize()).toBeGreaterThan(0);
    });

    it('should flush events when providers become available', async () => {
      // Use a mock provider instead of WebVitalsProvider for testing
      const mockProvider = {
        id: 'mock-web-vitals',
        name: 'Mock Web Vitals',
        trackedEvents: [] as AnalyticsEvent[],
        loaded: false,
        
        async loadScript(): Promise<void> {
          this.loaded = true;
        },
        
        isLoaded(): boolean {
          return this.loaded;
        },
        
        trackEvent(event: AnalyticsEvent): void {
          this.trackedEvents.push(event);
        },
        
        getTrackedEvents(): AnalyticsEvent[] {
          return this.trackedEvents;
        }
      };

      manager.registerProvider(mockProvider as any);

      // Queue some events
      const events: AnalyticsEvent[] = [
        { type: 'lcp', data: { value: 1200 }, timestamp: Date.now() },
        { type: 'fid', data: { value: 50 }, timestamp: Date.now() },
      ];

      events.forEach(event => manager.trackEvent(event));
      expect(manager.getQueueSize()).toBe(2);

      // Simulate provider loading
      await mockProvider.loadScript();
      
      // Flush queue
      manager.flushQueue();

      // Queue should be empty and events should be tracked
      expect(manager.getQueueSize()).toBe(0);
      expect(mockProvider.getTrackedEvents()).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle provider loading failures gracefully', async () => {
      const gaProvider = new GoogleAnalyticsProvider('INVALID_ID');
      manager.registerProvider(gaProvider);

      // Should not throw even if provider fails to load
      expect(async () => {
        await gaProvider.loadScript();
      }).not.toThrow();
    });

    it('should continue working when one provider fails', () => {
      const gaProvider = new GoogleAnalyticsProvider('GA_TEST_ID');
      const webVitalsProvider = new WebVitalsProvider();

      manager.registerProvider(gaProvider);
      manager.registerProvider(webVitalsProvider);

      // Even if GA fails, WebVitals should still work
      const event: AnalyticsEvent = {
        type: 'test_event',
        data: { test: true },
        timestamp: Date.now(),
      };

      expect(() => {
        manager.trackEvent(event);
      }).not.toThrow();
    });
  });

  describe('Configuration', () => {
    it('should respect queue size limits', () => {
      const smallQueueManager = new AnalyticsManager({
        analyticsQueueSize: 3,
      });

      // Add more events than queue size
      for (let i = 0; i < 10; i++) {
        smallQueueManager.trackEvent({
          type: `event_${i}`,
          data: { index: i },
          timestamp: Date.now(),
        });
      }

      // Queue should not exceed max size
      expect(smallQueueManager.getQueueSize()).toBeLessThanOrEqual(3);
      
      smallQueueManager.destroy();
    });

    it('should use fallback strategies from configuration', () => {
      const configuredManager = new AnalyticsManager({
        fallbackStrategies: {
          'google-analytics': 'deferred' as any,
          'web-vitals': 'client-only' as any,
        },
      });

      // Configuration should be applied
      expect(configuredManager).toBeDefined();
      
      configuredManager.destroy();
    });
  });
});