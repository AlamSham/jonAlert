/**
 * HydrationManager - Central coordinator for all hydration-sensitive operations
 * 
 * This class manages React hydration state and coordinates script loading,
 * JSON-LD structured data, and analytics integration to prevent hydration
 * mismatch errors in Next.js applications.
 * 
 * Requirements addressed: 4.1, 4.3, 6.1
 */

import {
  HydrationState,
  HydrationError,
  HydrationCallback,
  ErrorHandler,
  StateChangeCallback,
  ScriptConfig,
  StructuredDataConfig,
  AnalyticsProvider,
  ComponentRegistration,
  HydrationConfig,
  LoadingStrategy,
  FallbackAction,
  ErrorRecoveryStrategy,
  RecoveryResult,
  HydrationMetrics
} from './types';

export class HydrationManager {
  private state: HydrationState;
  private config: HydrationConfig;
  private callbacks: HydrationCallback[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private stateChangeCallbacks: StateChangeCallback[] = [];
  private registrations: Map<string, ComponentRegistration> = new Map();
  private errorRecoveryStrategies: Map<string, ErrorRecoveryStrategy> = new Map();
  private isClient: boolean;

  constructor(config?: Partial<HydrationConfig>) {
    this.isClient = typeof window !== 'undefined';
    
    // Initialize default configuration
    this.config = {
      enableDebugMode: process.env.NODE_ENV === 'development',
      maxRetryAttempts: 3,
      retryDelay: 1000,
      scriptTimeout: 10000,
      deferredLoadDelay: 100,
      analyticsQueueSize: 100,
      analyticsFlushInterval: 5000,
      fallbackStrategies: {
        'script': LoadingStrategy.CLIENT_ONLY,
        'jsonld': LoadingStrategy.CLIENT_ONLY,
        'analytics': LoadingStrategy.DEFERRED
      },
      ...config
    };

    // Initialize hydration state
    this.state = {
      phase: 'pre-hydration',
      startTime: Date.now(),
      errors: [],
      warnings: []
    };

    // Set up hydration detection on client
    if (this.isClient) {
      this.setupHydrationDetection();
    }

    this.log('HydrationManager initialized', { isClient: this.isClient });
  }

  /**
   * Check if React hydration has completed
   */
  public isHydrated(): boolean {
    return this.state.phase === 'hydrated';
  }

  /**
   * Get current hydration state
   */
  public getState(): HydrationState {
    return { ...this.state };
  }

  /**
   * Register a callback to be executed when hydration completes
   */
  public onHydrationComplete(callback: HydrationCallback): void {
    if (this.isHydrated()) {
      // If already hydrated, execute immediately
      try {
        callback();
      } catch (error) {
        this.handleError({
          type: 'script',
          component: 'callback',
          message: `Hydration callback failed: ${error}`,
          recoverable: true,
          timestamp: Date.now()
        });
      }
    } else {
      this.callbacks.push(callback);
    }
  }

  /**
   * Register an error handler for hydration errors
   */
  public onHydrationError(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Register a callback for state changes
   */
  public onStateChange(callback: StateChangeCallback): void {
    this.stateChangeCallbacks.push(callback);
  }

  /**
   * Register a script component for hydration-safe loading
   */
  public registerScript(config: ScriptConfig): string {
    const registration: ComponentRegistration = {
      id: config.id,
      type: 'script',
      config,
      registeredAt: Date.now()
    };

    this.registrations.set(config.id, registration);
    this.log('Script registered', { id: config.id, strategy: config.strategy });

    return config.id;
  }

  /**
   * Register JSON-LD structured data for consistent serialization
   */
  public registerJSONLD(data: object, key: string): void {
    const config: StructuredDataConfig = {
      key,
      data,
      priority: 1
    };

    const registration: ComponentRegistration = {
      id: key,
      type: 'jsonld',
      config,
      registeredAt: Date.now()
    };

    this.registrations.set(key, registration);
    this.log('JSON-LD registered', { key });
  }

  /**
   * Register an analytics provider for coordinated loading
   */
  public registerAnalytics(provider: AnalyticsProvider): void {
    const registration: ComponentRegistration = {
      id: provider.id,
      type: 'analytics',
      config: provider,
      registeredAt: Date.now()
    };

    this.registrations.set(provider.id, registration);
    this.log('Analytics provider registered', { id: provider.id, name: provider.name });
  }

  /**
   * Get all registered components of a specific type
   */
  public getRegistrations(type?: 'script' | 'jsonld' | 'analytics'): ComponentRegistration[] {
    const registrations = Array.from(this.registrations.values());
    return type ? registrations.filter(reg => reg.type === type) : registrations;
  }

  /**
   * Unregister a component
   */
  public unregister(id: string): boolean {
    const existed = this.registrations.has(id);
    this.registrations.delete(id);
    
    if (existed) {
      this.log('Component unregistered', { id });
    }
    
    return existed;
  }

  /**
   * Add an error recovery strategy for a specific error type
   */
  public addErrorRecoveryStrategy(errorType: string, strategy: ErrorRecoveryStrategy): void {
    this.errorRecoveryStrategies.set(errorType, strategy);
    this.log('Error recovery strategy added', { errorType });
  }

  /**
   * Get hydration metrics for monitoring
   */
  public getMetrics(): HydrationMetrics {
    const scriptRegistrations = this.getRegistrations('script');
    const jsonldRegistrations = this.getRegistrations('jsonld');
    const analyticsRegistrations = this.getRegistrations('analytics');

    return {
      hydrationDuration: this.state.completionTime 
        ? this.state.completionTime - this.state.startTime 
        : Date.now() - this.state.startTime,
      scriptsLoaded: scriptRegistrations.length,
      scriptErrors: this.state.errors.filter(e => e.type === 'script').length,
      jsonldCount: jsonldRegistrations.length,
      analyticsProviders: analyticsRegistrations.length
    };
  }

  /**
   * Force transition to hydrated state (for testing or manual control)
   */
  public forceHydrated(): void {
    if (this.state.phase !== 'hydrated') {
      this.transitionToState('hydrated');
    }
  }

  /**
   * Reset the hydration manager (for testing)
   */
  public reset(): void {
    this.state = {
      phase: 'pre-hydration',
      startTime: Date.now(),
      errors: [],
      warnings: []
    };
    this.callbacks = [];
    this.registrations.clear();
    this.log('HydrationManager reset');
  }

  /**
   * Set up hydration detection on the client side
   */
  private setupHydrationDetection(): void {
    if (!this.isClient) return;

    // Detect when React starts hydrating
    const originalConsoleError = console.error;
    let hydrationStarted = false;

    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Detect hydration start
      if (!hydrationStarted && message.includes('hydrat')) {
        hydrationStarted = true;
        this.transitionToState('hydrating');
      }
      
      // Detect hydration errors
      if (message.includes('Hydration failed') || message.includes('hydration mismatch')) {
        this.handleError({
          type: 'script',
          component: 'react-hydration',
          message: message,
          recoverable: false,
          timestamp: Date.now()
        });
      }
      
      originalConsoleError.apply(console, args);
    };

    // Use multiple methods to detect hydration completion
    this.detectHydrationCompletion();
  }

  /**
   * Detect when hydration has completed using multiple strategies
   */
  private detectHydrationCompletion(): void {
    let hydrationDetected = false;

    const markHydrated = () => {
      if (!hydrationDetected && this.state.phase !== 'hydrated') {
        hydrationDetected = true;
        this.transitionToState('hydrated');
      }
    };

    // Strategy 1: Use React's built-in hydration detection
    if (typeof window !== 'undefined') {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          // Give React time to hydrate after DOM is ready
          setTimeout(markHydrated, this.config.deferredLoadDelay);
        });
      } else {
        // DOM is already ready, hydration likely completed or will complete soon
        setTimeout(markHydrated, this.config.deferredLoadDelay);
      }

      // Strategy 2: Use requestIdleCallback if available
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          setTimeout(markHydrated, 50);
        });
      }

      // Strategy 3: Fallback timeout
      setTimeout(() => {
        if (!hydrationDetected) {
          this.log('Hydration detection timeout, assuming hydrated');
          markHydrated();
        }
      }, 5000);
    }
  }

  /**
   * Transition to a new hydration state
   */
  private transitionToState(newPhase: HydrationState['phase']): void {
    const oldPhase = this.state.phase;
    
    this.state.phase = newPhase;
    
    if (newPhase === 'hydrated' && !this.state.completionTime) {
      this.state.completionTime = Date.now();
    }

    this.log('State transition', { from: oldPhase, to: newPhase });

    // Notify state change callbacks
    this.stateChangeCallbacks.forEach(callback => {
      try {
        callback(this.getState());
      } catch (error) {
        this.log('State change callback error', error);
      }
    });

    // Execute hydration completion callbacks
    if (newPhase === 'hydrated') {
      this.executeHydrationCallbacks();
    }
  }

  /**
   * Execute all registered hydration completion callbacks
   */
  private executeHydrationCallbacks(): void {
    const callbacks = [...this.callbacks];
    this.callbacks = []; // Clear callbacks to prevent re-execution

    callbacks.forEach((callback, index) => {
      try {
        callback();
      } catch (error) {
        const hydrationError: HydrationError = {
          type: 'script',
          component: `callback-${index}`,
          message: `Hydration callback failed: ${error}`,
          recoverable: true,
          timestamp: Date.now()
        };
        
        // Handle error synchronously for callbacks
        this.state.errors.push(hydrationError);
        this.log('Hydration error', hydrationError);
        
        // Notify error handlers synchronously
        this.errorHandlers.forEach(handler => {
          try {
            handler(hydrationError);
          } catch (handlerError) {
            this.log('Error handler failed', handlerError);
          }
        });
      }
    });

    this.log('Hydration callbacks executed', { count: callbacks.length });
  }

  /**
   * Handle hydration errors with recovery strategies
   */
  private async handleError(error: HydrationError): Promise<void> {
    this.state.errors.push(error);
    
    this.log('Hydration error', error);

    // Try to recover from the error
    const recovery = await this.attemptErrorRecovery(error);
    
    if (!recovery.success && error.type === 'script') {
      // If recovery failed, transition to error state
      this.transitionToState('error');
    }

    // Notify error handlers
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        this.log('Error handler failed', handlerError);
      }
    });
  }

  /**
   * Attempt to recover from an error using registered strategies
   */
  private async attemptErrorRecovery(error: HydrationError): Promise<RecoveryResult> {
    const strategy = this.errorRecoveryStrategies.get(error.type);
    
    if (strategy && strategy.canRecover(error)) {
      try {
        return await strategy.recover(error);
      } catch (recoveryError) {
        this.log('Error recovery failed', recoveryError);
      }
    }

    // Default fallback strategy
    const fallbackStrategy = this.config.fallbackStrategies[error.type];
    if (fallbackStrategy) {
      return {
        success: true,
        action: FallbackAction.CLIENT_ONLY_RENDER,
        message: `Using fallback strategy: ${fallbackStrategy}`
      };
    }

    return {
      success: false,
      action: FallbackAction.SKIP_COMPONENT,
      message: 'No recovery strategy available'
    };
  }

  /**
   * Log messages with debug mode support
   */
  private log(message: string, data?: any): void {
    if (this.config.enableDebugMode) {
      console.log(`[HydrationManager] ${message}`, data || '');
    }
  }
}

// Export singleton instance
let hydrationManagerInstance: HydrationManager | null = null;

/**
 * Get the singleton HydrationManager instance
 */
export function getHydrationManager(config?: Partial<HydrationConfig>): HydrationManager {
  if (!hydrationManagerInstance) {
    hydrationManagerInstance = new HydrationManager(config);
  }
  return hydrationManagerInstance;
}

/**
 * Reset the singleton instance (for testing)
 */
export function resetHydrationManager(): void {
  hydrationManagerInstance = null;
}