/**
 * Tests for AnalyticsManager
 * Validates core functionality and hydration safety
 */

import { AnalyticsManager } from '../AnalyticsManager';
import { AnalyticsProvider, AnalyticsEvent, HydrationConfig } from '../types';

// Mock provider for testing
class MockAnalyticsProvider implements AnalyticsProvider {
  public readonly id = 'mock-provider';
  public readonly name = 'Mock Provider';
  
  private loaded = false;
  public trackedEvents: AnalyticsEvent[] = [];

  async loadScript(): Promise<void> {
    this.loaded = true;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  trackEvent(event: AnalyticsEvent): void {
    this.trackedEvents.push(event);
  }
}

describe('AnalyticsManager', () => {
  let manager: AnalyticsManager;
  let mockProvider: MockAnalyticsProvider;

  beforeEach(() => {
    const config: Partial<HydrationConfig> = {
      enableDebugMode: false,
      analyticsQueueSize: 10,
      analyticsFlushInterval: 1000,
    };
    
    manager = new AnalyticsManager(config);
    mockProvider = new MockAnalyticsProvider();
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('Provider Registration', () => {
    it('should register a provider successfully', () => {
      manager.registerProvider(mockProvider);
      
      const retrievedProvider = manager.getProvider('mock-provider');
      expect(retrievedProvider).toBe(mockProvider);
    });

    it('should handle duplicate provider registration', () => {
      manager.registerProvider(mockProvider);
      
      const anotherProvider = new MockAnalyticsProvider();
      manager.registerProvider(anotherProvider);
      
      const retrievedProvider = manager.getProvider('mock-provider');
      expect(retrievedProvider).toBe(anotherProvider);
    });

    it('should return null for non-existent provider', () => {
      const provider = manager.getProvider('non-existent');
      expect(provider).toBeNull();
    });
  });

  describe('Event Tracking', () => {
    beforeEach(async () => {
      manager.registerProvider(mockProvider);
      await mockProvider.loadScript();
      
      // Wait for hydration to complete in test environment
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should track events to loaded providers', () => {
      const event: AnalyticsEvent = {
        type: 'test_event',
        data: { key: 'value' },
        timestamp: Date.now(),
      };

      manager.trackEvent(event);
      
      expect(mockProvider.trackedEvents).toHaveLength(1);
      expect(mockProvider.trackedEvents[0]).toEqual(event);
    });

    it('should queue events when provider is not loaded', () => {
      const unloadedProvider = new MockAnalyticsProvider();
      const unloadedManager = new AnalyticsManager({ enableDebugMode: false });
      unloadedManager.registerProvider(unloadedProvider);

      const event: AnalyticsEvent = {
        type: 'test_event',
        data: { key: 'value' },
        timestamp: Date.now(),
      };

      unloadedManager.trackEvent(event);
      
      // Event should be queued, not tracked immediately
      expect(unloadedProvider.trackedEvents).toHaveLength(0);
      expect(unloadedManager.getQueueSize()).toBeGreaterThan(0);
      
      unloadedManager.destroy();
    });

    it('should add timestamp if not provided', () => {
      const event = {
        type: 'test_event',
        data: { key: 'value' },
      } as AnalyticsEvent;

      manager.trackEvent(event);
      
      expect(mockProvider.trackedEvents[0].timestamp).toBeDefined();
      expect(typeof mockProvider.trackedEvents[0].timestamp).toBe('number');
    });
  });

  describe('Event Queue Management', () => {
    it('should queue events before hydration', () => {
      // Manager starts in pre-hydration state
      const event: AnalyticsEvent = {
        type: 'test_event',
        data: { key: 'value' },
        timestamp: Date.now(),
      };

      manager.trackEvent(event);
      
      expect(manager.getQueueSize()).toBe(1);
    });

    it('should flush queued events', async () => {
      // Queue an event
      const event: AnalyticsEvent = {
        type: 'test_event',
        data: { key: 'value' },
        timestamp: Date.now(),
      };

      manager.trackEvent(event);
      expect(manager.getQueueSize()).toBe(1);

      // Register and load provider
      manager.registerProvider(mockProvider);
      await mockProvider.loadScript();

      // Flush queue
      manager.flushQueue();
      
      expect(manager.getQueueSize()).toBe(0);
      expect(mockProvider.trackedEvents).toHaveLength(1);
    });

    it('should clear queue', () => {
      const event: AnalyticsEvent = {
        type: 'test_event',
        data: { key: 'value' },
        timestamp: Date.now(),
      };

      manager.trackEvent(event);
      expect(manager.getQueueSize()).toBe(1);

      manager.clearQueue();
      expect(manager.getQueueSize()).toBe(0);
    });

    it('should handle queue size limit', () => {
      // Create manager with small queue size
      const smallQueueManager = new AnalyticsManager({
        analyticsQueueSize: 2,
      });

      // Add more events than queue size
      for (let i = 0; i < 5; i++) {
        smallQueueManager.trackEvent({
          type: `test_event_${i}`,
          data: { index: i },
          timestamp: Date.now(),
        });
      }

      // Queue should not exceed max size (should be exactly max size after cleanup)
      expect(smallQueueManager.getQueueSize()).toBeLessThanOrEqual(2);
      
      smallQueueManager.destroy();
    });
  });

  describe('Provider Isolation', () => {
    it('should isolate provider without errors', () => {
      manager.registerProvider(mockProvider);
      
      expect(() => {
        manager.isolateProvider('mock-provider');
      }).not.toThrow();
    });

    it('should handle isolation of non-existent provider', () => {
      expect(() => {
        manager.isolateProvider('non-existent');
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle provider registration errors gracefully', () => {
      const invalidProvider = {
        id: '', // Invalid empty ID
        name: 'Invalid Provider',
      } as AnalyticsProvider;

      expect(() => {
        manager.registerProvider(invalidProvider);
      }).not.toThrow();
    });

    it('should handle event tracking errors gracefully', () => {
      const errorProvider = new MockAnalyticsProvider();
      errorProvider.trackEvent = () => {
        throw new Error('Tracking failed');
      };

      manager.registerProvider(errorProvider);
      
      expect(() => {
        manager.trackEvent({
          type: 'test_event',
          data: {},
          timestamp: Date.now(),
        });
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources on destroy', () => {
      manager.registerProvider(mockProvider);
      
      const event: AnalyticsEvent = {
        type: 'test_event',
        data: { key: 'value' },
        timestamp: Date.now(),
      };
      manager.trackEvent(event);

      expect(manager.getQueueSize()).toBeGreaterThan(0);
      expect(manager.getProvider('mock-provider')).not.toBeNull();

      manager.destroy();

      expect(manager.getQueueSize()).toBe(0);
      expect(manager.getProvider('mock-provider')).toBeNull();
    });
  });
});