/**
 * Example usage of the HydrationManager
 * 
 * This file demonstrates how to use the HydrationManager to prevent
 * hydration mismatch errors in a Next.js application.
 */

import { getHydrationManager, LoadingStrategy } from './index';

// Example: Basic usage
export function basicUsageExample() {
  const hydrationManager = getHydrationManager({
    enableDebugMode: true,
    maxRetryAttempts: 3
  });

  // Register a script that should load only on the client
  hydrationManager.registerScript({
    id: 'onesignal-init',
    content: `
      window.OneSignal = window.OneSignal || [];
      OneSignal.push(function() {
        OneSignal.init({
          appId: "your-app-id",
        });
      });
    `,
    strategy: LoadingStrategy.CLIENT_ONLY
  });

  // Register JSON-LD structured data
  hydrationManager.registerJSONLD({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Job Listings',
    description: 'Latest government job notifications'
  }, 'webpage-jsonld');

  // Register analytics provider
  hydrationManager.registerAnalytics({
    id: 'google-analytics',
    name: 'Google Analytics',
    loadScript: async () => {
      // Load GA script
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
      document.head.appendChild(script);
    },
    isLoaded: () => typeof window !== 'undefined' && !!window.gtag,
    trackEvent: (event) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event.type, event.data);
      }
    }
  });

  // Set up callbacks
  hydrationManager.onHydrationComplete(() => {
    console.log('Hydration completed successfully!');
  });

  hydrationManager.onHydrationError((error) => {
    console.error('Hydration error:', error);
  });

  return hydrationManager;
}

// Example: React component integration
export function reactComponentExample() {
  const hydrationManager = getHydrationManager();

  // Example of how this would be used in a React component
  const componentCode = `
    import { useEffect, useState } from 'react';
    import { getHydrationManager } from '@/lib/hydration';

    export function MyComponent() {
      const [isHydrated, setIsHydrated] = useState(false);
      
      useEffect(() => {
        const manager = getHydrationManager();
        
        // Check if already hydrated
        if (manager.isHydrated()) {
          setIsHydrated(true);
        } else {
          // Wait for hydration
          manager.onHydrationComplete(() => {
            setIsHydrated(true);
          });
        }
        
        // Register component-specific scripts
        manager.registerScript({
          id: 'component-script',
          content: 'console.log("Component script loaded");',
          strategy: LoadingStrategy.DEFERRED
        });
      }, []);

      return (
        <div>
          {isHydrated ? (
            <div>Hydration complete - safe to render dynamic content</div>
          ) : (
            <div>Waiting for hydration...</div>
          )}
        </div>
      );
    }
  `;

  return componentCode;
}

// Example: Error handling and recovery
export function errorHandlingExample() {
  const hydrationManager = getHydrationManager();

  // Add custom error recovery strategy
  hydrationManager.addErrorRecoveryStrategy('script', {
    canRecover: (error) => error.recoverable,
    recover: async (error) => {
      console.log('Attempting to recover from error:', error.message);
      
      // Custom recovery logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        action: 'retry' as any,
        message: 'Recovery successful'
      };
    },
    fallback: (error) => {
      console.log('Using fallback for error:', error.message);
      return 'client-only' as any;
    }
  });

  // Register error handler
  hydrationManager.onHydrationError((error) => {
    // Send error to monitoring service
    console.error('Hydration error occurred:', {
      type: error.type,
      component: error.component,
      message: error.message,
      timestamp: error.timestamp,
      recoverable: error.recoverable
    });
  });

  return hydrationManager;
}

// Example: Metrics and monitoring
export function monitoringExample() {
  const hydrationManager = getHydrationManager();

  // Monitor hydration state changes
  hydrationManager.onStateChange((state) => {
    console.log('Hydration state changed:', state.phase);
    
    if (state.phase === 'hydrated') {
      const metrics = hydrationManager.getMetrics();
      console.log('Hydration metrics:', {
        duration: metrics.hydrationDuration,
        scriptsLoaded: metrics.scriptsLoaded,
        errors: metrics.scriptErrors,
        jsonldCount: metrics.jsonldCount,
        analyticsProviders: metrics.analyticsProviders
      });
    }
  });

  return hydrationManager;
}

// Example: Configuration for different environments
export function environmentConfigExample() {
  // Development configuration
  const devManager = getHydrationManager({
    enableDebugMode: true,
    maxRetryAttempts: 1,
    retryDelay: 500,
    scriptTimeout: 5000,
    deferredLoadDelay: 100
  });

  // Production configuration
  const prodManager = getHydrationManager({
    enableDebugMode: false,
    maxRetryAttempts: 3,
    retryDelay: 2000,
    scriptTimeout: 15000,
    deferredLoadDelay: 200,
    errorReportingEndpoint: 'https://api.example.com/errors'
  });

  return { devManager, prodManager };
}