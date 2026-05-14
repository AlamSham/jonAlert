/**
 * ScriptManager - Manages dynamic script injection with hydration safety
 * 
 * This class implements loading strategy determination (SSR, client-only, deferred),
 * script state tracking to prevent duplicate injections, and script content validation.
 * 
 * Requirements addressed: 4.1, 4.2, 4.3, 1.1, 1.2, 1.3, 1.4, 1.5
 */

import {
  ScriptConfig,
  ScriptState,
  LoadingStrategy,
  LoadingContext,
  ValidationResult,
  RetryConfig,
  HydrationError,
  ScriptLoadCallback,
  DEFAULT_RETRY_CONFIG,
} from './types';

export class ScriptManager {
  private scripts: Map<string, ScriptState> = new Map();
  private loadedScripts: Set<string> = new Set();
  private callbacks: Map<string, ScriptLoadCallback[]> = new Map();
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Load a script with the specified configuration
   * Implements strategy selection and prevents duplicate injections
   */
  async loadScript(config: ScriptConfig): Promise<void> {
    const { id, strategy } = config;

    // Check if script is already loaded or loading
    const existingState = this.scripts.get(id);
    if (existingState?.status === 'loaded') {
      this.debugLog(`Script ${id} already loaded, skipping`);
      return;
    }

    if (existingState?.status === 'loading') {
      this.debugLog(`Script ${id} already loading, waiting for completion`);
      return this.waitForScriptLoad(id);
    }

    // Validate script content before loading
    const validation = this.validateScriptContent(config);
    if (!validation.valid) {
      const error = new Error(`Script validation failed: ${validation.errors.join(', ')}`);
      this.handleScriptError(id, error, 'validation');
      throw error;
    }

    // Determine loading context
    const context = this.getLoadingContext();
    
    // Apply strategy-based loading
    const shouldLoad = this.shouldLoadScript(strategy, context);
    if (!shouldLoad) {
      this.debugLog(`Script ${id} deferred due to strategy ${strategy} and context`, context);
      this.setScriptState(id, { 
        id, 
        status: 'pending', 
        strategy,
        retryCount: 0 
      });
      return;
    }

    // Check dependencies
    if (config.dependencies?.length) {
      await this.waitForDependencies(config.dependencies);
    }

    // Set loading state
    this.setScriptState(id, { 
      id, 
      status: 'loading', 
      strategy,
      retryCount: 0 
    });

    try {
      await this.injectScript(config);
      this.setScriptState(id, { 
        id, 
        status: 'loaded', 
        strategy,
        loadTime: Date.now() 
      });
      this.loadedScripts.add(id);
      this.notifyCallbacks(id, true);
      this.debugLog(`Script ${id} loaded successfully`);
    } catch (error) {
      await this.handleScriptLoadError(config, error as Error);
    }
  }

  /**
   * Unload a script and clean up its state
   */
  unloadScript(id: string): void {
    // Remove script element from DOM
    const scriptElement = document.querySelector(`script[data-script-id="${id}"]`);
    if (scriptElement) {
      scriptElement.remove();
    }

    // Clean up state
    this.scripts.delete(id);
    this.loadedScripts.delete(id);
    this.callbacks.delete(id);
    
    // Clear any pending retry timeouts
    const timeout = this.retryTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(id);
    }

    this.debugLog(`Script ${id} unloaded and cleaned up`);
  }

  /**
   * Get the current state of a script
   */
  getScriptState(id: string): ScriptState | undefined {
    return this.scripts.get(id);
  }

  /**
   * Validate script content for potential hydration issues
   */
  validateScriptContent(config: ScriptConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!config.id) {
      errors.push('Script ID is required');
    }

    if (!config.content && !config.src) {
      errors.push('Either content or src must be provided');
    }

    if (config.content && config.src) {
      warnings.push('Both content and src provided, src will be ignored');
    }

    // Content validation for inline scripts
    if (config.content) {
      // Check for potential hydration mismatch patterns
      if (config.content.includes('document.write')) {
        errors.push('document.write() can cause hydration mismatches');
      }

      if (config.content.includes('innerHTML') && config.strategy === LoadingStrategy.SSR) {
        warnings.push('innerHTML manipulation in SSR scripts may cause hydration issues');
      }

      // Check for syntax errors (basic check)
      try {
        new Function(config.content);
      } catch (syntaxError) {
        errors.push(`Script syntax error: ${(syntaxError as Error).message}`);
      }
    }

    // URL validation for external scripts
    if (config.src) {
      try {
        new URL(config.src);
      } catch {
        errors.push('Invalid script URL');
      }

      // Check for HTTPS in production
      if (typeof window !== 'undefined' && 
          window.location.protocol === 'https:' && 
          config.src.startsWith('http:')) {
        errors.push('HTTP scripts not allowed on HTTPS pages');
      }
    }

    // Strategy validation
    if (config.strategy === LoadingStrategy.SSR && typeof window !== 'undefined') {
      warnings.push('SSR strategy used on client-side, will be treated as CLIENT_ONLY');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Register a callback for script load events
   */
  onScriptLoad(scriptId: string, callback: ScriptLoadCallback): void {
    if (!this.callbacks.has(scriptId)) {
      this.callbacks.set(scriptId, []);
    }
    this.callbacks.get(scriptId)!.push(callback);
  }

  /**
   * Get all script states for debugging
   */
  getAllScriptStates(): Map<string, ScriptState> {
    return new Map(this.scripts);
  }

  /**
   * Clear all scripts and reset state
   */
  reset(): void {
    // Clear all timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    
    // Reset all state
    this.scripts.clear();
    this.loadedScripts.clear();
    this.callbacks.clear();
    this.retryTimeouts.clear();

    this.debugLog('ScriptManager reset');
  }

  // Private methods

  private getLoadingContext(): LoadingContext {
    const isServer = typeof window === 'undefined';
    const isHydrated = !isServer && document.readyState === 'complete';

    return {
      isServer,
      isHydrated,
      userAgent: isServer ? undefined : navigator.userAgent,
      performance: isServer ? undefined : this.getPerformanceMetrics(),
    };
  }

  private getPerformanceMetrics() {
    if (typeof window === 'undefined' || !window.performance || !window.performance.getEntriesByType) {
      return undefined;
    }

    try {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        navigationStart: navigation?.navigationStart || 0,
        domContentLoaded: navigation?.domContentLoadedEventEnd || 0,
        loadComplete: navigation?.loadEventEnd || 0,
      };
    } catch (error) {
      // Fallback if performance API fails
      return undefined;
    }
  }

  private shouldLoadScript(strategy: LoadingStrategy, context: LoadingContext): boolean {
    switch (strategy) {
      case LoadingStrategy.SSR:
        return context.isServer;
      
      case LoadingStrategy.CLIENT_ONLY:
        return !context.isServer;
      
      case LoadingStrategy.DEFERRED:
        return !context.isServer && context.isHydrated;
      
      default:
        return false;
    }
  }

  private async waitForDependencies(dependencies: string[]): Promise<void> {
    const pendingDependencies = dependencies.filter(dep => !this.loadedScripts.has(dep));
    
    if (pendingDependencies.length === 0) {
      return;
    }

    this.debugLog(`Waiting for dependencies: ${pendingDependencies.join(', ')}`);

    // Wait for all dependencies to load
    await Promise.all(
      pendingDependencies.map(dep => this.waitForScriptLoad(dep))
    );
  }

  private async waitForScriptLoad(scriptId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkScript = () => {
        const state = this.scripts.get(scriptId);
        if (state?.status === 'loaded') {
          resolve();
        } else if (state?.status === 'error') {
          reject(new Error(`Dependency ${scriptId} failed to load`));
        } else {
          // Continue waiting
          setTimeout(checkScript, 100);
        }
      };
      checkScript();
    });
  }

  private async injectScript(config: ScriptConfig): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Cannot inject script on server-side');
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.setAttribute('data-script-id', config.id);

      // Set script attributes
      if (config.src) {
        script.src = config.src;
      }
      
      if (config.content) {
        script.textContent = config.content;
      }

      if (config.async !== undefined) {
        script.async = config.async;
      }

      if (config.defer !== undefined) {
        script.defer = config.defer;
      }

      if (config.crossOrigin) {
        script.crossOrigin = config.crossOrigin;
      }

      if (config.integrity) {
        script.integrity = config.integrity;
      }

      if (config.nonce) {
        script.nonce = config.nonce;
      }

      if (config.referrerPolicy) {
        script.referrerPolicy = config.referrerPolicy as ReferrerPolicy;
      }

      // For inline scripts (content), resolve immediately after injection
      if (config.content && !config.src) {
        try {
          document.head.appendChild(script);
          resolve();
        } catch (error) {
          reject(error);
        }
        return;
      }

      // For external scripts (src), use load/error events
      const timeout = setTimeout(() => {
        script.remove();
        reject(new Error(`Script ${config.id} load timeout`));
      }, config.timeout || 10000);

      // Handle load success
      script.onload = () => {
        clearTimeout(timeout);
        resolve();
      };

      // Handle load error
      script.onerror = (error) => {
        clearTimeout(timeout);
        script.remove();
        reject(new Error(`Script ${config.id} failed to load: ${error}`));
      };

      // Inject into DOM
      document.head.appendChild(script);
    });
  }

  private async handleScriptLoadError(config: ScriptConfig, error: Error): Promise<void> {
    const retryConfig = config.retryConfig || DEFAULT_RETRY_CONFIG;
    const currentState = this.scripts.get(config.id);
    const retryCount = (currentState?.retryCount || 0) + 1;

    this.debugLog(`Script ${config.id} failed to load (attempt ${retryCount}):`, error.message);

    if (retryCount >= retryConfig.maxAttempts) {
      // Max retries reached, mark as error
      this.handleScriptError(config.id, error, 'script');
      this.notifyCallbacks(config.id, false);
      throw error;
    }

    // Calculate retry delay with exponential backoff
    const delay = Math.min(
      retryConfig.delay * Math.pow(retryConfig.backoffMultiplier || 2, retryCount - 1),
      retryConfig.maxDelay || 10000
    );

    // Update state with retry count
    this.setScriptState(config.id, {
      id: config.id,
      status: 'pending',
      strategy: config.strategy,
      retryCount,
      lastRetryTime: Date.now(),
      error,
    });

    // Schedule retry
    const timeout = setTimeout(async () => {
      this.retryTimeouts.delete(config.id);
      try {
        await this.loadScript(config);
      } catch (retryError) {
        // Error already handled in recursive call
      }
    }, delay);

    this.retryTimeouts.set(config.id, timeout);
    this.debugLog(`Script ${config.id} retry scheduled in ${delay}ms`);
  }

  private handleScriptError(scriptId: string, error: Error, type: HydrationError['type']): void {
    this.setScriptState(scriptId, {
      id: scriptId,
      status: 'error',
      strategy: this.scripts.get(scriptId)?.strategy || LoadingStrategy.CLIENT_ONLY,
      error,
    });

    // Create hydration error for reporting
    const hydrationError: HydrationError = {
      type,
      component: 'ScriptManager',
      message: error.message,
      recoverable: type !== 'validation',
      scriptId,
      originalError: error,
      timestamp: Date.now(),
    };

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ScriptManager error:', hydrationError);
    }

    // TODO: Report to error tracking service in production
  }

  private setScriptState(id: string, state: ScriptState): void {
    this.scripts.set(id, state);
  }

  private notifyCallbacks(scriptId: string, success: boolean): void {
    const callbacks = this.callbacks.get(scriptId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(scriptId, success);
        } catch (error) {
          console.warn(`Script callback error for ${scriptId}:`, error);
        }
      });
    }
  }

  private debugLog(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ScriptManager] ${message}`, ...args);
    }
  }
}

// Singleton instance
let scriptManagerInstance: ScriptManager | null = null;

/**
 * Get the singleton ScriptManager instance
 */
export function getScriptManager(): ScriptManager {
  if (!scriptManagerInstance) {
    scriptManagerInstance = new ScriptManager();
  }
  return scriptManagerInstance;
}

/**
 * Reset the ScriptManager instance (useful for testing)
 */
export function resetScriptManager(): void {
  if (scriptManagerInstance) {
    scriptManagerInstance.reset();
    scriptManagerInstance = null;
  }
}