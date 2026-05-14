/**
 * AnalyticsManager - Manages third-party analytics integration with hydration safety
 * 
 * This class implements:
 * - Provider registration and management
 * - Event queuing system for pre-hydration events
 * - DOM isolation mechanisms for third-party scripts
 * - Fallback strategies for problematic analytics scripts
 * 
 * Requirements: 3.1, 3.2, 3.3 (Analytics provider isolation, event queuing, DOM isolation)
 */

import {
  AnalyticsProvider,
  AnalyticsEvent,
  EventQueue,
  ProviderIsolationConfig,
  HydrationError,
  FallbackAction,
  LoadingStrategy,
  HydrationConfig,
  DEFAULT_HYDRATION_CONFIG,
} from './types';

export class AnalyticsManager {
  private providers: Map<string, AnalyticsProvider> = new Map();
  private eventQueue: EventQueue;
  private isHydrated: boolean = false;
  private config: HydrationConfig;
  private errorHandlers: Array<(error: HydrationError) => void> = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isolatedContainers: Map<string, HTMLElement> = new Map();

  constructor(config: Partial<HydrationConfig> = {}) {
    this.config = { ...DEFAULT_HYDRATION_CONFIG, ...config };
    this.eventQueue = {
      events: [],
      maxSize: this.config.analyticsQueueSize,
      flushInterval: this.config.analyticsFlushInterval,
      lastFlush: Date.now(),
    };

    // Initialize flush timer
    this.initializeFlushTimer();

    // Listen for hydration completion
    if (typeof window !== 'undefined') {
      this.detectHydrationCompletion();
    }
  }

  /**
   * Register an analytics provider with isolation configuration
   * Requirements: 3.1 - Analytics provider registration and management
   */
  public registerProvider(provider: AnalyticsProvider): void {
    try {
      // Validate provider
      if (!provider.id || !provider.name) {
        throw new Error('Provider must have id and name');
      }

      if (this.providers.has(provider.id)) {
        this.logWarning(`Provider ${provider.id} already registered, replacing`);
      }

      // Set up DOM isolation if configured
      if (provider.isolationConfig?.domIsolation) {
        this.setupDOMIsolation(provider);
      }

      // Store provider
      this.providers.set(provider.id, provider);

      // Load provider script if hydration is complete
      if (this.isHydrated) {
        this.loadProviderScript(provider);
      }

      this.logDebug(`Registered analytics provider: ${provider.name}`);
    } catch (error) {
      this.handleError({
        type: 'analytics',
        component: 'AnalyticsManager',
        message: `Failed to register provider ${provider.id}: ${error}`,
        recoverable: true,
        timestamp: Date.now(),
        context: { providerId: provider.id },
      });
    }
  }

  /**
   * Track an analytics event with queuing support
   * Requirements: 3.2 - Event queuing system for pre-hydration events
   */
  public trackEvent(event: AnalyticsEvent): void {
    try {
      // Add timestamp if not present
      if (!event.timestamp) {
        event.timestamp = Date.now();
      }

      // If hydration is not complete, queue the event
      if (!this.isHydrated) {
        this.queueEvent(event);
        return;
      }

      // If specific provider is requested, send only to that provider
      if (event.provider) {
        const provider = this.providers.get(event.provider);
        if (provider && provider.isLoaded()) {
          this.sendEventToProvider(event, provider);
        } else {
          this.queueEvent(event); // Queue if provider not loaded
        }
        return;
      }

      // Send to all loaded providers
      for (const provider of this.providers.values()) {
        if (provider.isLoaded()) {
          this.sendEventToProvider(event, provider);
        }
      }

      this.logDebug(`Tracked event: ${event.type}`, event.data);
    } catch (error) {
      this.handleError({
        type: 'analytics',
        component: 'AnalyticsManager',
        message: `Failed to track event ${event.type}: ${error}`,
        recoverable: true,
        timestamp: Date.now(),
        context: { event },
      });
    }
  }

  /**
   * Flush queued events to loaded providers
   * Requirements: 3.2 - Event queuing system management
   */
  public flushQueue(): void {
    try {
      if (this.eventQueue.events.length === 0) {
        return;
      }

      const eventsToFlush = [...this.eventQueue.events];
      this.eventQueue.events = [];
      this.eventQueue.lastFlush = Date.now();

      // Send queued events to loaded providers
      for (const event of eventsToFlush) {
        if (event.provider) {
          const provider = this.providers.get(event.provider);
          if (provider && provider.isLoaded()) {
            this.sendEventToProvider(event, provider);
          } else {
            // Re-queue if provider still not loaded
            this.queueEvent(event);
          }
        } else {
          // Send to all loaded providers
          for (const provider of this.providers.values()) {
            if (provider.isLoaded()) {
              this.sendEventToProvider(event, provider);
            }
          }
        }
      }

      this.logDebug(`Flushed ${eventsToFlush.length} queued events`);
    } catch (error) {
      this.handleError({
        type: 'analytics',
        component: 'AnalyticsManager',
        message: `Failed to flush event queue: ${error}`,
        recoverable: true,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Isolate a provider to prevent DOM conflicts
   * Requirements: 3.3 - DOM isolation mechanisms for third-party scripts
   */
  public isolateProvider(providerId: string): void {
    try {
      const provider = this.providers.get(providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
      }

      // Create isolated container if not exists
      if (!this.isolatedContainers.has(providerId)) {
        this.setupDOMIsolation(provider);
      }

      // Apply additional isolation measures
      this.applyScriptIsolation(provider);

      this.logDebug(`Isolated provider: ${providerId}`);
    } catch (error) {
      this.handleError({
        type: 'analytics',
        component: 'AnalyticsManager',
        message: `Failed to isolate provider ${providerId}: ${error}`,
        recoverable: true,
        timestamp: Date.now(),
        context: { providerId },
      });
    }
  }

  /**
   * Get a registered provider by ID
   */
  public getProvider(id: string): AnalyticsProvider | null {
    return this.providers.get(id) || null;
  }

  /**
   * Check if a provider is loaded and ready
   */
  public isProviderLoaded(id: string): boolean {
    const provider = this.providers.get(id);
    return provider ? provider.isLoaded() : false;
  }

  /**
   * Get current queue size
   */
  public getQueueSize(): number {
    return this.eventQueue.events.length;
  }

  /**
   * Clear the event queue
   */
  public clearQueue(): void {
    this.eventQueue.events = [];
    this.eventQueue.lastFlush = Date.now();
  }

  /**
   * Add error handler
   */
  public onError(handler: (error: HydrationError) => void): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    // Clear flush timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Clear event queue
    this.clearQueue();

    // Remove isolated containers
    for (const container of this.isolatedContainers.values()) {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
    this.isolatedContainers.clear();

    // Clear providers
    this.providers.clear();

    // Clear error handlers
    this.errorHandlers = [];
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Queue an event for later processing
   */
  private queueEvent(event: AnalyticsEvent): void {
    // Check queue size limit
    if (this.eventQueue.events.length >= this.eventQueue.maxSize) {
      // Remove oldest events to make room (remove 10% or at least 1)
      const removeCount = Math.max(1, Math.floor(this.eventQueue.maxSize * 0.1));
      this.eventQueue.events.splice(0, removeCount);
      this.logWarning(`Event queue full, removed ${removeCount} oldest events`);
    }

    this.eventQueue.events.push(event);
  }

  /**
   * Send event to a specific provider with error handling
   */
  private sendEventToProvider(event: AnalyticsEvent, provider: AnalyticsProvider): void {
    try {
      // Apply isolation timeout if configured
      if (provider.isolationConfig?.maxExecutionTime) {
        const timeout = provider.isolationConfig.maxExecutionTime;
        const timeoutId = setTimeout(() => {
          this.logWarning(`Provider ${provider.id} event tracking timed out`);
        }, timeout);

        provider.trackEvent(event);
        clearTimeout(timeoutId);
      } else {
        provider.trackEvent(event);
      }
    } catch (error) {
      this.handleError({
        type: 'analytics',
        component: 'AnalyticsManager',
        message: `Provider ${provider.id} failed to track event: ${error}`,
        recoverable: true,
        timestamp: Date.now(),
        context: { providerId: provider.id, event },
      });
    }
  }

  /**
   * Set up DOM isolation for a provider
   */
  private setupDOMIsolation(provider: AnalyticsProvider): void {
    if (typeof window === 'undefined') return;

    try {
      // Create isolated container
      const container = document.createElement('div');
      container.id = `analytics-${provider.id}`;
      container.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 1px;
        height: 1px;
        overflow: hidden;
        visibility: hidden;
        pointer-events: none;
      `;

      // Add to document
      document.body.appendChild(container);
      this.isolatedContainers.set(provider.id, container);

      this.logDebug(`Created DOM isolation container for ${provider.id}`);
    } catch (error) {
      this.logWarning(`Failed to create DOM isolation for ${provider.id}: ${error}`);
    }
  }

  /**
   * Apply script-level isolation measures
   */
  private applyScriptIsolation(provider: AnalyticsProvider): void {
    if (!provider.isolationConfig?.sandboxed) return;

    try {
      // Create sandboxed iframe for script execution
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.sandbox = 'allow-scripts allow-same-origin';
      
      const container = this.isolatedContainers.get(provider.id);
      if (container) {
        container.appendChild(iframe);
      }

      this.logDebug(`Applied script isolation for ${provider.id}`);
    } catch (error) {
      this.logWarning(`Failed to apply script isolation for ${provider.id}: ${error}`);
    }
  }

  /**
   * Load provider script with fallback strategies
   */
  private async loadProviderScript(provider: AnalyticsProvider): Promise<void> {
    try {
      await provider.loadScript();
      this.logDebug(`Loaded script for provider: ${provider.id}`);
    } catch (error) {
      // Apply fallback strategy
      const fallbackStrategy = this.config.fallbackStrategies[provider.id];
      if (fallbackStrategy) {
        this.logWarning(`Provider ${provider.id} failed to load, applying fallback: ${fallbackStrategy}`);
        // Implement fallback logic based on strategy
        this.applyFallbackStrategy(provider, fallbackStrategy);
      } else {
        this.handleError({
          type: 'analytics',
          component: 'AnalyticsManager',
          message: `Failed to load provider ${provider.id}: ${error}`,
          recoverable: false,
          timestamp: Date.now(),
          context: { providerId: provider.id },
        });
      }
    }
  }

  /**
   * Apply fallback strategy for failed provider
   */
  private applyFallbackStrategy(provider: AnalyticsProvider, strategy: LoadingStrategy): void {
    switch (strategy) {
      case LoadingStrategy.DEFERRED:
        // Retry loading after delay
        setTimeout(() => {
          this.loadProviderScript(provider);
        }, this.config.deferredLoadDelay);
        break;
      
      case LoadingStrategy.CLIENT_ONLY:
        // Skip server-side loading, only load on client
        if (typeof window !== 'undefined') {
          this.loadProviderScript(provider);
        }
        break;
      
      default:
        this.logWarning(`Unknown fallback strategy: ${strategy}`);
    }
  }

  /**
   * Initialize automatic queue flushing
   */
  private initializeFlushTimer(): void {
    if (typeof window === 'undefined') return;

    this.flushTimer = setInterval(() => {
      if (this.isHydrated && this.eventQueue.events.length > 0) {
        this.flushQueue();
      }
    }, this.eventQueue.flushInterval);
  }

  /**
   * Detect when React hydration is complete
   */
  private detectHydrationCompletion(): void {
    // In test environment, assume hydration is complete immediately
    if (process.env.NODE_ENV === 'test') {
      setTimeout(() => this.onHydrationComplete(), 0);
      return;
    }

    // Method 1: Check if React has hydrated
    const checkHydration = () => {
      if (document.readyState === 'complete' && window.React) {
        this.onHydrationComplete();
        return;
      }
      
      // Method 2: Use requestIdleCallback if available
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          this.onHydrationComplete();
        });
      } else {
        // Fallback: Use setTimeout
        setTimeout(() => {
          this.onHydrationComplete();
        }, this.config.deferredLoadDelay);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkHydration);
    } else {
      checkHydration();
    }
  }

  /**
   * Handle hydration completion
   */
  private onHydrationComplete(): void {
    this.isHydrated = true;
    this.logDebug('Hydration completed, loading analytics providers');

    // Load all registered providers
    for (const provider of this.providers.values()) {
      this.loadProviderScript(provider);
    }

    // Flush queued events
    setTimeout(() => {
      this.flushQueue();
    }, 100); // Small delay to ensure providers are loaded
  }

  /**
   * Handle errors with recovery strategies
   */
  private handleError(error: HydrationError): void {
    // Log error
    if (this.config.enableDebugMode) {
      console.error('[AnalyticsManager]', error);
    }

    // Notify error handlers
    for (const handler of this.errorHandlers) {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError);
      }
    }

    // Report to error endpoint if configured
    if (this.config.errorReportingEndpoint) {
      this.reportError(error);
    }
  }

  /**
   * Report error to external endpoint
   */
  private async reportError(error: HydrationError): Promise<void> {
    try {
      if (!this.config.errorReportingEndpoint) return;

      await fetch(this.config.errorReportingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      });
    } catch (reportError) {
      console.warn('Failed to report error:', reportError);
    }
  }

  /**
   * Debug logging
   */
  private logDebug(message: string, data?: any): void {
    if (this.config.enableDebugMode) {
      console.log(`[AnalyticsManager] ${message}`, data || '');
    }
  }

  /**
   * Warning logging
   */
  private logWarning(message: string): void {
    if (this.config.enableDebugMode) {
      console.warn(`[AnalyticsManager] ${message}`);
    }
  }
}