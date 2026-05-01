// SEO Error Handling and Fallback System
import { SEO_CONFIG } from './config';
import type { SEOError } from './interfaces';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

export interface FallbackConfig {
  enableFallbacks: boolean;
  fallbackTTL: number;
  maxRetries: number;
  retryDelay: number;
}

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

/**
 * Circuit Breaker Pattern Implementation for SEO Components
 */
export class SEOCircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private successCount: number = 0;
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitBreakerState.HALF_OPEN;
      } else {
        if (fallback) {
          return await fallback();
        }
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      
      // If we have a fallback and just transitioned to OPEN state, use it
      if (fallback) {
        return await fallback();
      }
      
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 3) { // Require 3 successes to close
        this.state = CircuitBreakerState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
    }
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.OPEN;
    }
  }

  /**
   * Check if circuit breaker should attempt reset
   */
  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.config.resetTimeout;
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Get statistics
   */
  getStats(): {
    state: CircuitBreakerState;
    failureCount: number;
    successCount: number;
    lastFailureTime: number;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * SEO Error Handler with Fallback Strategies
 */
export class SEOErrorHandler {
  private static instance: SEOErrorHandler;
  private circuitBreakers: Map<string, SEOCircuitBreaker> = new Map();
  private errorLog: SEOError[] = [];
  private config: FallbackConfig;

  private constructor(config: FallbackConfig) {
    this.config = config;
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: FallbackConfig): SEOErrorHandler {
    if (!SEOErrorHandler.instance) {
      SEOErrorHandler.instance = new SEOErrorHandler(config || {
        enableFallbacks: true,
        fallbackTTL: 300, // 5 minutes
        maxRetries: 3,
        retryDelay: 1000 // 1 second
      });
    }
    return SEOErrorHandler.instance;
  }

  /**
   * Get or create circuit breaker for component
   */
  private getCircuitBreaker(component: string): SEOCircuitBreaker {
    if (!this.circuitBreakers.has(component)) {
      this.circuitBreakers.set(component, new SEOCircuitBreaker({
        failureThreshold: 5,
        resetTimeout: 60000, // 1 minute
        monitoringPeriod: 300000 // 5 minutes
      }));
    }
    return this.circuitBreakers.get(component)!;
  }

  /**
   * Execute SEO operation with error handling and fallbacks
   */
  async executeWithFallback<T>(
    component: string,
    operation: string,
    primaryFn: () => Promise<T>,
    fallbackFn?: () => Promise<T>,
    context?: any
  ): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(component);

    try {
      return await circuitBreaker.execute(primaryFn, fallbackFn);
    } catch (error) {
      // Log the error
      this.logError({
        component,
        operation,
        error: error as Error,
        context,
        timestamp: new Date(),
        severity: 'high'
      });

      // Try fallback if available and enabled
      if (this.config.enableFallbacks && fallbackFn) {
        try {
          console.warn(`${component}.${operation} failed, using fallback`);
          return await fallbackFn();
        } catch (fallbackError) {
          this.logError({
            component,
            operation: `${operation}_fallback`,
            error: fallbackError as Error,
            context,
            timestamp: new Date(),
            severity: 'high'
          });
        }
      }

      // If all else fails, throw the original error
      throw error;
    }
  }

  /**
   * Execute with retry logic
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = this.config.maxRetries,
    delay: number = this.config.retryDelay
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const backoffDelay = delay * Math.pow(2, attempt - 1);
        await this.sleep(backoffDelay);
      }
    }

    throw lastError!;
  }

  /**
   * Log SEO error
   */
  private logError(error: SEOError): void {
    this.errorLog.push(error);
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // Log to console based on severity
    const logMessage = `SEO Error [${error.component}.${error.operation}]: ${error.error.message}`;
    
    switch (error.severity) {
      case 'high':
        console.error(logMessage, error);
        break;
      case 'medium':
        console.warn(logMessage, error);
        break;
      case 'low':
        console.info(logMessage, error);
        break;
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByComponent: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: SEOError[];
    circuitBreakerStats: Record<string, any>;
  } {
    const errorsByComponent: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};

    for (const error of this.errorLog) {
      errorsByComponent[error.component] = (errorsByComponent[error.component] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    }

    const circuitBreakerStats: Record<string, any> = {};
    for (const [component, breaker] of this.circuitBreakers.entries()) {
      circuitBreakerStats[component] = breaker.getStats();
    }

    return {
      totalErrors: this.errorLog.length,
      errorsByComponent,
      errorsBySeverity,
      recentErrors: this.errorLog.slice(-10),
      circuitBreakerStats
    };
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * SEO Fallback Content Generator
 */
export class SEOFallbackGenerator {
  /**
   * Generate fallback title
   */
  static generateFallbackTitle(context: {
    pageType?: string;
    category?: string;
    state?: string;
    organization?: string;
  }): string {
    const { pageType, category, state, organization } = context;

    switch (pageType) {
      case 'job':
        return `${category || 'Government'} Jobs ${state ? `in ${state}` : ''} - SarkariPulse`;
      case 'scheme':
        return `${category || 'Government'} Schemes ${state ? `in ${state}` : ''} - SarkariPulse`;
      case 'result':
        return `${category || 'Exam'} Results ${state ? `in ${state}` : ''} - SarkariPulse`;
      case 'admit-card':
        return `${category || 'Exam'} Admit Card ${state ? `in ${state}` : ''} - SarkariPulse`;
      default:
        return 'Latest Government Jobs & Schemes - SarkariPulse';
    }
  }

  /**
   * Generate fallback meta description
   */
  static generateFallbackDescription(context: {
    pageType?: string;
    category?: string;
    state?: string;
    organization?: string;
  }): string {
    const { pageType, category, state, organization } = context;

    switch (pageType) {
      case 'job':
        return `Find latest ${category || 'government'} job notifications ${state ? `in ${state}` : ''}. Apply online for sarkari naukri with complete details on SarkariPulse.`;
      case 'scheme':
        return `Get information about ${category || 'government'} schemes ${state ? `in ${state}` : ''}. Check eligibility, benefits and apply online on SarkariPulse.`;
      case 'result':
        return `Check ${category || 'exam'} results ${state ? `in ${state}` : ''}. Download scorecard and get latest updates on SarkariPulse.`;
      case 'admit-card':
        return `Download ${category || 'exam'} admit card ${state ? `in ${state}` : ''}. Get hall ticket and exam details on SarkariPulse.`;
      default:
        return 'Get latest government job notifications, exam results, admit cards and scheme updates on SarkariPulse. Your trusted source for sarkari naukri.';
    }
  }

  /**
   * Generate fallback structured data
   */
  static generateFallbackStructuredData(context: {
    pageType?: string;
    title?: string;
    description?: string;
    url?: string;
  }): any {
    const { pageType, title, description, url } = context;

    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title || 'SarkariPulse',
      description: description || 'Latest Government Jobs and Schemes',
      url: url || 'https://sarkaripulse.net',
      publisher: {
        '@type': 'Organization',
        name: 'SarkariPulse',
        url: 'https://sarkaripulse.net'
      }
    };

    return baseSchema;
  }

  /**
   * Generate fallback FAQ content
   */
  static generateFallbackFAQ(category: string): Array<{
    question: string;
    answer: string;
  }> {
    return [
      {
        question: `What is ${category}?`,
        answer: `${category} refers to opportunities and information available on SarkariPulse for government job seekers.`
      },
      {
        question: 'How to apply?',
        answer: 'Visit the official website link provided in the notification and follow the application process.'
      },
      {
        question: 'Is this information authentic?',
        answer: 'Yes, all information on SarkariPulse is sourced from official government websites and notifications.'
      }
    ];
  }
}

/**
 * Graceful Degradation Manager
 */
export class GracefulDegradationManager {
  private static featureFlags: Map<string, boolean> = new Map();

  /**
   * Check if feature is enabled
   */
  static isFeatureEnabled(feature: string): boolean {
    return this.featureFlags.get(feature) ?? true;
  }

  /**
   * Disable feature temporarily
   */
  static disableFeature(feature: string, duration?: number): void {
    this.featureFlags.set(feature, false);
    
    if (duration) {
      setTimeout(() => {
        this.featureFlags.set(feature, true);
      }, duration);
    }
  }

  /**
   * Enable feature
   */
  static enableFeature(feature: string): void {
    this.featureFlags.set(feature, true);
  }

  /**
   * Execute with graceful degradation
   */
  static async executeWithDegradation<T>(
    feature: string,
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>
  ): Promise<T> {
    if (!this.isFeatureEnabled(feature)) {
      console.warn(`Feature ${feature} is disabled, using fallback`);
      return await fallbackFn();
    }

    try {
      return await primaryFn();
    } catch (error) {
      console.warn(`Feature ${feature} failed, using fallback:`, error);
      this.disableFeature(feature, 300000); // Disable for 5 minutes
      return await fallbackFn();
    }
  }

  /**
   * Get feature status
   */
  static getFeatureStatus(): Record<string, boolean> {
    return Object.fromEntries(this.featureFlags.entries());
  }
}

// Export singleton instances
export const seoErrorHandler = SEOErrorHandler.getInstance();

// Initialize error handling on module load
if (typeof window !== 'undefined') {
  // Set up global error handlers for SEO components
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('SEO')) {
      seoErrorHandler.executeWithFallback(
        'global',
        'unhandledRejection',
        async () => { throw event.reason; },
        async () => {
          console.warn('SEO operation failed, continuing with degraded functionality');
          return null;
        }
      );
    }
  });
}