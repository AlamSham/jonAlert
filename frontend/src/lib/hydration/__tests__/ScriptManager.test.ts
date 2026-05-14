/**
 * Unit tests for ScriptManager
 * Tests script loading, validation, state tracking, and error handling
 */

import { ScriptManager } from '../ScriptManager';
import { LoadingStrategy, ScriptConfig } from '../types';

// Mock DOM environment
const mockDocument = {
  createElement: jest.fn(),
  head: {
    appendChild: jest.fn(),
  },
  querySelector: jest.fn(),
  readyState: 'complete',
};

const mockWindow = {
  location: {
    protocol: 'https:',
  },
  performance: {
    getEntriesByType: jest.fn(() => [{
      navigationStart: 0,
      domContentLoadedEventEnd: 100,
      loadEventEnd: 200,
    }]),
  },
  navigator: {
    userAgent: 'test-agent',
  },
};

// Setup DOM mocks
(global as any).document = mockDocument;
(global as any).window = mockWindow;

describe('ScriptManager', () => {
  let scriptManager: ScriptManager;
  let mockScriptElement: any;

  beforeEach(() => {
    scriptManager = new ScriptManager();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock script element
    mockScriptElement = {
      setAttribute: jest.fn(),
      remove: jest.fn(),
      onload: null,
      onerror: null,
      src: '',
      textContent: '',
      async: false,
      defer: false,
      crossOrigin: '',
      integrity: '',
      nonce: '',
      referrerPolicy: '',
    };
    
    mockDocument.createElement.mockReturnValue(mockScriptElement);
    mockDocument.querySelector.mockReturnValue(null);
  });

  afterEach(() => {
    scriptManager.reset();
  });

  describe('Script Validation', () => {
    it('should validate script configuration correctly', () => {
      const validConfig: ScriptConfig = {
        id: 'test-script',
        content: 'console.log("test");',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      const result = scriptManager.validateScriptContent(validConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject scripts without ID', () => {
      const invalidConfig: ScriptConfig = {
        id: '',
        content: 'console.log("test");',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      const result = scriptManager.validateScriptContent(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Script ID is required');
    });

    it('should reject scripts without content or src', () => {
      const invalidConfig: ScriptConfig = {
        id: 'test-script',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      const result = scriptManager.validateScriptContent(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Either content or src must be provided');
    });

    it('should detect document.write usage', () => {
      const dangerousConfig: ScriptConfig = {
        id: 'dangerous-script',
        content: 'document.write("<div>test</div>");',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      const result = scriptManager.validateScriptContent(dangerousConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('document.write() can cause hydration mismatches');
    });

    it('should detect syntax errors', () => {
      const syntaxErrorConfig: ScriptConfig = {
        id: 'syntax-error-script',
        content: 'console.log("unclosed string',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      const result = scriptManager.validateScriptContent(syntaxErrorConfig);
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('Script syntax error'))).toBe(true);
    });

    it('should validate external script URLs', () => {
      const validExternalConfig: ScriptConfig = {
        id: 'external-script',
        src: 'https://example.com/script.js',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      const result = scriptManager.validateScriptContent(validExternalConfig);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const invalidUrlConfig: ScriptConfig = {
        id: 'invalid-url-script',
        src: 'not-a-valid-url',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      const result = scriptManager.validateScriptContent(invalidUrlConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid script URL');
    });
  });

  describe('Script State Tracking', () => {
    it('should track script loading state', async () => {
      const config: ScriptConfig = {
        id: 'test-script',
        content: 'console.log("test");',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      // Start loading and immediately check state (should be loading)
      const loadPromise = scriptManager.loadScript(config);
      
      // Give a small delay to allow the loading state to be set
      await new Promise(resolve => setTimeout(resolve, 1));
      
      // Check loading state
      const loadingState = scriptManager.getScriptState('test-script');
      expect(loadingState?.status).toBe('loading');
      expect(loadingState?.strategy).toBe(LoadingStrategy.CLIENT_ONLY);

      // Simulate successful load
      if (mockScriptElement.onload) {
        mockScriptElement.onload();
      }

      await loadPromise;

      // Check loaded state
      const loadedState = scriptManager.getScriptState('test-script');
      expect(loadedState?.status).toBe('loaded');
      expect(loadedState?.loadTime).toBeDefined();
    });

    it('should prevent duplicate script loading', async () => {
      const config: ScriptConfig = {
        id: 'duplicate-script',
        content: 'console.log("test");',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      // Simulate successful load for first call
      setTimeout(() => {
        if (mockScriptElement.onload) {
          mockScriptElement.onload();
        }
      }, 1);

      // Load script first time
      await scriptManager.loadScript(config);
      
      // Reset mock call count
      mockDocument.createElement.mockClear();

      // Try to load same script again
      await scriptManager.loadScript(config);

      // Should not create new script element
      expect(mockDocument.createElement).not.toHaveBeenCalled();
    });

    it('should handle script loading errors', async () => {
      const config: ScriptConfig = {
        id: 'error-script',
        content: 'console.log("test");',
        strategy: LoadingStrategy.CLIENT_ONLY,
        retryConfig: { maxAttempts: 1, delay: 100 },
      };

      // Simulate script error
      setTimeout(() => {
        if (mockScriptElement.onerror) {
          mockScriptElement.onerror(new Error('Load failed'));
        }
      }, 1);

      await expect(scriptManager.loadScript(config)).rejects.toThrow();

      const errorState = scriptManager.getScriptState('error-script');
      expect(errorState?.status).toBe('error');
      expect(errorState?.error).toBeDefined();
    });
  });

  describe('Loading Strategy Implementation', () => {
    it('should respect CLIENT_ONLY strategy', async () => {
      // Mock server environment
      (global as any).window = undefined;

      const config: ScriptConfig = {
        id: 'client-only-script',
        content: 'console.log("client only");',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      await scriptManager.loadScript(config);

      // Should be pending on server
      const state = scriptManager.getScriptState('client-only-script');
      expect(state?.status).toBe('pending');

      // Restore window
      (global as any).window = mockWindow;
    });

    it('should handle DEFERRED strategy', async () => {
      // Mock non-hydrated state
      mockDocument.readyState = 'loading';

      const config: ScriptConfig = {
        id: 'deferred-script',
        content: 'console.log("deferred");',
        strategy: LoadingStrategy.DEFERRED,
      };

      await scriptManager.loadScript(config);

      // Should be pending when not hydrated
      const state = scriptManager.getScriptState('deferred-script');
      expect(state?.status).toBe('pending');

      // Restore ready state
      mockDocument.readyState = 'complete';
    });
  });

  describe('Script Cleanup', () => {
    it('should unload scripts and clean up state', async () => {
      const config: ScriptConfig = {
        id: 'cleanup-script',
        content: 'console.log("cleanup");',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      // Mock existing script element
      mockDocument.querySelector.mockReturnValue(mockScriptElement);

      // Load script
      setTimeout(() => {
        if (mockScriptElement.onload) {
          mockScriptElement.onload();
        }
      }, 1);

      await scriptManager.loadScript(config);

      // Verify script is loaded
      expect(scriptManager.getScriptState('cleanup-script')?.status).toBe('loaded');

      // Unload script
      scriptManager.unloadScript('cleanup-script');

      // Verify cleanup
      expect(mockScriptElement.remove).toHaveBeenCalled();
      expect(scriptManager.getScriptState('cleanup-script')).toBeUndefined();
    });

    it('should reset all scripts and state', async () => {
      const config1: ScriptConfig = {
        id: 'reset-script-1',
        content: 'console.log("1");',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      const config2: ScriptConfig = {
        id: 'reset-script-2',
        content: 'console.log("2");',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      // Load multiple scripts
      setTimeout(() => {
        if (mockScriptElement.onload) {
          mockScriptElement.onload();
        }
      }, 1);

      await Promise.all([
        scriptManager.loadScript(config1),
        scriptManager.loadScript(config2),
      ]);

      // Verify scripts are loaded
      expect(scriptManager.getAllScriptStates().size).toBe(2);

      // Reset manager
      scriptManager.reset();

      // Verify all state is cleared
      expect(scriptManager.getAllScriptStates().size).toBe(0);
    });
  });

  describe('Callback System', () => {
    it('should notify callbacks on successful load', async () => {
      const callback = jest.fn();
      const config: ScriptConfig = {
        id: 'callback-script',
        content: 'console.log("callback");',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      scriptManager.onScriptLoad('callback-script', callback);

      // Simulate successful load
      setTimeout(() => {
        if (mockScriptElement.onload) {
          mockScriptElement.onload();
        }
      }, 1);

      await scriptManager.loadScript(config);

      expect(callback).toHaveBeenCalledWith('callback-script', true);
    });

    it('should notify callbacks on load failure', async () => {
      const callback = jest.fn();
      const config: ScriptConfig = {
        id: 'callback-error-script',
        content: 'console.log("callback error");',
        strategy: LoadingStrategy.CLIENT_ONLY,
        retryConfig: { maxAttempts: 1, delay: 100 },
      };

      scriptManager.onScriptLoad('callback-error-script', callback);

      // Simulate script error
      setTimeout(() => {
        if (mockScriptElement.onerror) {
          mockScriptElement.onerror(new Error('Load failed'));
        }
      }, 1);

      await expect(scriptManager.loadScript(config)).rejects.toThrow();

      expect(callback).toHaveBeenCalledWith('callback-error-script', false);
    });
  });
});