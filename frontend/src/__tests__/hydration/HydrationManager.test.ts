/**
 * Unit tests for HydrationManager
 * Tests core functionality including state management, component registration,
 * and callback systems for hydration completion events.
 */

import { HydrationManager, resetHydrationManager } from '../../lib/hydration/HydrationManager';
import { LoadingStrategy, HydrationError, AnalyticsProvider } from '../../lib/hydration/types';

// Setup and teardown
beforeEach(() => {
  resetHydrationManager();
  jest.clearAllMocks();
  
  // Mock window object
  (global as any).window = {
    requestIdleCallback: jest.fn((callback: () => void) => {
      setTimeout(callback, 0);
      return 1;
    })
  };
  
  // Mock document
  (global as any).document = {
    readyState: 'complete',
    addEventListener: jest.fn()
  };
  
  // Mock console methods
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  // Clean up global mocks
  delete (global as any).window;
  delete (global as any).document;
});

describe('HydrationManager', () => {
  describe('Initialization', () => {
    it('should initialize with pre-hydration state', () => {
      const manager = new HydrationManager();
      const state = manager.getState();
      
      expect(state.phase).toBe('pre-hydration');
      expect(state.startTime).toBeGreaterThan(0);
      expect(state.errors).toEqual([]);
      expect(state.warnings).toEqual([]);
      expect(manager.isHydrated()).toBe(false);
    });

    it('should accept custom configuration', () => {
      const config = {
        enableDebugMode: false,
        maxRetryAttempts: 5,
        scriptTimeout: 15000
      };
      
      const manager = new HydrationManager(config);
      
      // Test that configuration is applied (we can't directly access private config,
      // but we can test behavior that depends on it)
      expect(manager).toBeDefined();
    });
  });

  describe('State Management', () => {
    it('should transition to hydrated state', () => {
      const manager = new HydrationManager();
      
      manager.forceHydrated();
      
      expect(manager.isHydrated()).toBe(true);
      expect(manager.getState().phase).toBe('hydrated');
      expect(manager.getState().completionTime).toBeGreaterThan(0);
    });

    it('should notify state change callbacks', () => {
      const manager = new HydrationManager();
      const callback = jest.fn();
      
      manager.onStateChange(callback);
      manager.forceHydrated();
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          phase: 'hydrated'
        })
      );
    });

    it('should reset state correctly', () => {
      const manager = new HydrationManager();
      
      manager.forceHydrated();
      manager.reset();
      
      const state = manager.getState();
      expect(state.phase).toBe('pre-hydration');
      expect(state.errors).toEqual([]);
      expect(manager.isHydrated()).toBe(false);
    });
  });

  describe('Component Registration', () => {
    it('should register script components', () => {
      const manager = new HydrationManager();
      const scriptConfig = {
        id: 'test-script',
        content: 'console.log("test");',
        strategy: LoadingStrategy.CLIENT_ONLY
      };
      
      const id = manager.registerScript(scriptConfig);
      
      expect(id).toBe('test-script');
      
      const registrations = manager.getRegistrations('script');
      expect(registrations).toHaveLength(1);
      expect(registrations[0].id).toBe('test-script');
      expect(registrations[0].type).toBe('script');
    });

    it('should register JSON-LD components', () => {
      const manager = new HydrationManager();
      const jsonldData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Test Page'
      };
      
      manager.registerJSONLD(jsonldData, 'test-jsonld');
      
      const registrations = manager.getRegistrations('jsonld');
      expect(registrations).toHaveLength(1);
      expect(registrations[0].id).toBe('test-jsonld');
      expect(registrations[0].type).toBe('jsonld');
    });

    it('should register analytics providers', () => {
      const manager = new HydrationManager();
      const provider: AnalyticsProvider = {
        id: 'test-analytics',
        name: 'Test Analytics',
        loadScript: jest.fn().mockResolvedValue(undefined),
        isLoaded: jest.fn().mockReturnValue(false),
        trackEvent: jest.fn()
      };
      
      manager.registerAnalytics(provider);
      
      const registrations = manager.getRegistrations('analytics');
      expect(registrations).toHaveLength(1);
      expect(registrations[0].id).toBe('test-analytics');
      expect(registrations[0].type).toBe('analytics');
    });

    it('should unregister components', () => {
      const manager = new HydrationManager();
      const scriptConfig = {
        id: 'test-script',
        content: 'console.log("test");',
        strategy: LoadingStrategy.CLIENT_ONLY
      };
      
      manager.registerScript(scriptConfig);
      expect(manager.getRegistrations()).toHaveLength(1);
      
      const unregistered = manager.unregister('test-script');
      expect(unregistered).toBe(true);
      expect(manager.getRegistrations()).toHaveLength(0);
      
      // Unregistering non-existent component should return false
      const notFound = manager.unregister('non-existent');
      expect(notFound).toBe(false);
    });
  });

  describe('Callback System', () => {
    it('should execute callbacks when hydration completes', () => {
      const manager = new HydrationManager();
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      manager.onHydrationComplete(callback1);
      manager.onHydrationComplete(callback2);
      
      manager.forceHydrated();
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should execute callbacks immediately if already hydrated', () => {
      const manager = new HydrationManager();
      const callback = jest.fn();
      
      manager.forceHydrated();
      manager.onHydrationComplete(callback);
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle callback errors gracefully', () => {
      const manager = new HydrationManager();
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const normalCallback = jest.fn();
      
      manager.onHydrationComplete(errorCallback);
      manager.onHydrationComplete(normalCallback);
      
      manager.forceHydrated();
      
      // Both callbacks should be attempted
      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
      
      // Error should be recorded
      const state = manager.getState();
      expect(state.errors).toHaveLength(1);
      expect(state.errors[0].type).toBe('script');
      expect(state.errors[0].component).toBe('callback-0');
    });
  });

  describe('Error Handling', () => {
    it('should register and notify error handlers', () => {
      const manager = new HydrationManager();
      const errorHandler = jest.fn();
      
      manager.onHydrationError(errorHandler);
      
      // Simulate an error by calling a callback that throws
      const errorCallback = jest.fn(() => {
        throw new Error('Test error');
      });
      
      manager.onHydrationComplete(errorCallback);
      manager.forceHydrated();
      
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'script',
          message: expect.stringContaining('Test error'),
          recoverable: true
        })
      );
    });

    it('should handle multiple error handlers', () => {
      const manager = new HydrationManager();
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      manager.onHydrationError(handler1);
      manager.onHydrationError(handler2);
      
      // Trigger an error
      const errorCallback = jest.fn(() => {
        throw new Error('Test error');
      });
      
      manager.onHydrationComplete(errorCallback);
      manager.forceHydrated();
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('Metrics', () => {
    it('should provide hydration metrics', () => {
      const manager = new HydrationManager();
      
      // Register some components
      manager.registerScript({
        id: 'script1',
        strategy: LoadingStrategy.CLIENT_ONLY
      });
      manager.registerJSONLD({ test: 'data' }, 'jsonld1');
      manager.registerAnalytics({
        id: 'analytics1',
        name: 'Test Analytics',
        loadScript: jest.fn().mockResolvedValue(undefined),
        isLoaded: jest.fn().mockReturnValue(false),
        trackEvent: jest.fn()
      });
      
      // Force hydration to set completion time
      manager.forceHydrated();
      
      const metrics = manager.getMetrics();
      
      expect(metrics.scriptsLoaded).toBe(1);
      expect(metrics.jsonldCount).toBe(1);
      expect(metrics.analyticsProviders).toBe(1);
      expect(metrics.scriptErrors).toBe(0);
      expect(metrics.hydrationDuration).toBeGreaterThanOrEqual(0);
    });

    it('should track script errors in metrics', () => {
      const manager = new HydrationManager();
      
      // Trigger an error
      const errorCallback = jest.fn(() => {
        throw new Error('Script error');
      });
      
      manager.onHydrationComplete(errorCallback);
      manager.forceHydrated();
      
      const metrics = manager.getMetrics();
      expect(metrics.scriptErrors).toBe(1);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const { getHydrationManager } = require('../../lib/hydration/HydrationManager');
      
      const instance1 = getHydrationManager();
      const instance2 = getHydrationManager();
      
      expect(instance1).toBe(instance2);
    });

    it('should reset singleton instance', () => {
      const { getHydrationManager, resetHydrationManager } = require('../../lib/hydration/HydrationManager');
      
      const instance1 = getHydrationManager();
      resetHydrationManager();
      const instance2 = getHydrationManager();
      
      expect(instance1).not.toBe(instance2);
    });
  });
});