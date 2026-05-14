/**
 * Hydration-safe Web Vitals component
 * Replacement for the existing WebVitals component with better hydration handling
 */

'use client';

import { useEffect } from 'react';
import { useAnalyticsContext } from './AnalyticsProvider';

export function HydrationSafeWebVitals() {
  const { manager, isReady } = useAnalyticsContext();

  useEffect(() => {
    if (!isReady || !manager) return;

    // Web Vitals provider should already be registered and will handle metrics collection
    // This component just ensures the provider is active
    
    const webVitalsProvider = manager.getProvider('web-vitals');
    if (!webVitalsProvider) {
      console.warn('Web Vitals provider not found in AnalyticsManager');
      return;
    }

    // The WebVitalsProvider will automatically start collecting metrics
    // No additional setup needed here
    
  }, [manager, isReady]);

  // This component doesn't render anything
  return null;
}