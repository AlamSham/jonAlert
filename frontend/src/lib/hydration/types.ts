/**
 * Core types for the hydration management system
 * Addresses React hydration mismatch errors in Next.js application
 */

// Loading strategies for scripts and content
export enum LoadingStrategy {
  SSR = 'ssr',           // Load during server-side rendering
  CLIENT_ONLY = 'client-only',  // Load only on client after hydration
  DEFERRED = 'deferred'   // Load after hydration with delay
}

// Hydration phases
export type HydrationPhase = 'pre-hydration' | 'hydrating' | 'hydrated' | 'error';

// Error types for hydration issues
export interface HydrationError {
  type: 'script' | 'jsonld' | 'analytics' | 'validation';
  component: string;
  message: string;
  recoverable: boolean;
  timestamp: number;
  scriptId?: string;
  originalError?: Error;
}

// Hydration state management
export interface HydrationState {
  phase: HydrationPhase;
  startTime: number;
  completionTime?: number;
  errors: HydrationError[];
  warnings: string[];
}

// Hydration metrics for monitoring
export interface HydrationMetrics {
  hydrationDuration: number;
  scriptsLoaded: number;
  scriptErrors: number;
  jsonldCount: number;
  analyticsProviders: number;
}

// Script configuration
export interface ScriptConfig {
  id: string;
  content?: string;
  src?: string;
  strategy: LoadingStrategy;
  dependencies?: string[];
  retryConfig?: RetryConfig;
  async?: boolean;
  defer?: boolean;
  crossOrigin?: string;
  integrity?: string;
  nonce?: string;
  referrerPolicy?: string;
  timeout?: number;
}

// Script state tracking
export interface ScriptState {
  id: string;
  status: 'pending' | 'loading' | 'loaded' | 'error';
  strategy: LoadingStrategy;
  loadTime?: number;
  error?: Error;
  retryCount?: number;
  lastRetryTime?: number;
}

// Retry configuration
export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier?: number;
  maxDelay?: number;
}

// Script load callback type
export type ScriptLoadCallback = (scriptId: string, success: boolean) => void;

// Default retry configuration
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
};

// Structured data configuration
export interface StructuredDataConfig {
  key: string;
  data: object;
  priority: number;
  dependencies?: string[];
}

// Validation result for structured data
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Analytics provider interface
export interface AnalyticsProvider {
  id: string;
  name: string;
  loadScript: () => Promise<void>;
  isLoaded: () => boolean;
  trackEvent: (event: AnalyticsEvent) => void;
  isolationConfig?: ProviderIsolationConfig;
}

// Provider isolation configuration
export interface ProviderIsolationConfig {
  domIsolation: boolean;
  sandboxed: boolean;
  maxExecutionTime?: number;
  allowedDomains?: string[];
}

// Event queue for analytics
export interface EventQueue {
  events: AnalyticsEvent[];
  maxSize: number;
  flushInterval: number;
  lastFlush: number;
}

// Analytics event
export interface AnalyticsEvent {
  type: string;
  data: Record<string, any>;
  timestamp: number;
  provider?: string;
}

// Loading context for strategy decisions
export interface LoadingContext {
  isServer: boolean;
  isHydrated: boolean;
  userAgent?: string;
  performance?: PerformanceMetrics;
}

// Performance metrics
export interface PerformanceMetrics {
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
}

// Global hydration configuration
export interface HydrationConfig {
  // Global settings
  enableDebugMode: boolean;
  maxRetryAttempts: number;
  retryDelay: number;
  
  // Script loading settings
  scriptTimeout: number;
  deferredLoadDelay: number;
  
  // Analytics settings
  analyticsQueueSize: number;
  analyticsFlushInterval: number;
  
  // Error handling
  errorReportingEndpoint?: string;
  fallbackStrategies: Record<string, LoadingStrategy>;
}

// Error recovery strategies
export interface ErrorRecoveryStrategy {
  canRecover(error: HydrationError): boolean;
  recover(error: HydrationError): Promise<RecoveryResult>;
  fallback(error: HydrationError): FallbackAction;
}

export enum FallbackAction {
  CLIENT_ONLY_RENDER = 'client-only',
  SKIP_COMPONENT = 'skip',
  USE_DEFAULT = 'default',
  RETRY_WITH_DELAY = 'retry'
}

export interface RecoveryResult {
  success: boolean;
  action: FallbackAction;
  message?: string;
}

// Error reporting context
export interface ErrorContext {
  userAgent: string;
  url: string;
  timestamp: number;
  hydrationPhase: string;
  componentStack?: string;
}

// Callback types for HydrationManager
export type HydrationCallback = () => void;
export type ErrorHandler = (error: HydrationError) => void;
export type StateChangeCallback = (state: HydrationState) => void;

// Component registration for tracking
export interface ComponentRegistration {
  id: string;
  type: 'script' | 'jsonld' | 'analytics';
  config: ScriptConfig | StructuredDataConfig | AnalyticsProvider;
  registeredAt: number;
}

// Default hydration configuration
export const DEFAULT_HYDRATION_CONFIG: HydrationConfig = {
  enableDebugMode: process.env.NODE_ENV === 'development',
  maxRetryAttempts: 3,
  retryDelay: 1000,
  scriptTimeout: 10000,
  deferredLoadDelay: 2000,
  analyticsQueueSize: 100,
  analyticsFlushInterval: 5000,
  fallbackStrategies: {
    'google-analytics': LoadingStrategy.DEFERRED,
    'vercel-analytics': LoadingStrategy.CLIENT_ONLY,
    'onesignal': LoadingStrategy.DEFERRED,
    'web-vitals': LoadingStrategy.CLIENT_ONLY,
  },
};