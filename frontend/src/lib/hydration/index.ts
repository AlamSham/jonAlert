/**
 * Hydration Management System - Main Export
 * 
 * This module exports all the hydration management components and utilities
 * for preventing React hydration mismatch errors in Next.js applications
 */

// Core types
export * from './types';

// Core managers
export { AnalyticsManager } from './AnalyticsManager';
export { HydrationManager } from './HydrationManager';
export { ScriptManager } from './ScriptManager';

// JSONLDHandler for structured data management
export { JSONLDHandler, jsonLDHandler } from './JSONLDHandler';

// Analytics providers
export * from './providers';

// SEO integration utilities
export * from './seo-integration';

// React components for hydration-safe rendering
export { 
  HydrationSafeJSONLD, 
  SSRSafeJSONLD, 
  useStructuredData 
} from '../../../components/HydrationSafeJSONLD';

// Version and metadata
export const HYDRATION_SYSTEM_VERSION = '1.0.0';
export const SUPPORTED_FEATURES = [
  'json-ld-serialization',
  'priority-based-management',
  'dependency-tracking',
  'schema-validation',
  'hydration-safe-rendering',
  'analytics-provider-isolation',
  'event-queuing-system',
  'dom-isolation-mechanisms'
] as const;