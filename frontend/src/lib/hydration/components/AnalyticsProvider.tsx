/**
 * React component for providing analytics context
 * Replaces the existing WebVitals component with hydration-safe analytics
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AnalyticsManager } from '../AnalyticsManager';
import { HydrationConfig, AnalyticsEvent } from '../types';
import { createAnalyticsManager } from '../utils';

// Analytics context
interface AnalyticsContextType {
  manager: AnalyticsManager | null;
  isReady: boolean;
  trackEvent: (event: Omit<AnalyticsEvent, 'timestamp'>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  manager: null,
  isReady: false,
  trackEvent: () => {},
});

// Provider props
interface AnalyticsProviderProps {
  children: ReactNode;
  config?: Partial<HydrationConfig>;
  enableDebug?: boolean;
}

/**
 * Analytics Provider Component
 * Provides analytics functionality to the entire app
 */
export function AnalyticsProvider({ 
  children, 
  config,
  enableDebug = process.env.NODE_ENV === 'development'
}: AnalyticsProviderProps) {
  const [manager, setManager] = useState<AnalyticsManager | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Create analytics manager with configuration
    const analyticsConfig: Partial<HydrationConfig> = {
      enableDebugMode: enableDebug,
      ...config,
    };

    const analyticsManager = createAnalyticsManager(analyticsConfig);
    
    // Set up error handling
    analyticsManager.onError((error) => {
      if (enableDebug) {
        console.error('[Analytics Error]', error);
      }
      
      // Report critical errors
      if (!error.recoverable) {
        console.error('Critical analytics error:', error);
      }
    });

    setManager(analyticsManager);
    setIsReady(true);

    // Cleanup on unmount
    return () => {
      analyticsManager.destroy();
    };
  }, [config, enableDebug]);

  // Track event function
  const trackEvent = (event: Omit<AnalyticsEvent, 'timestamp'>) => {
    if (manager) {
      manager.trackEvent({
        ...event,
        timestamp: Date.now(),
      });
    }
  };

  const contextValue: AnalyticsContextType = {
    manager,
    isReady,
    trackEvent,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Hook to use analytics context
 */
export function useAnalyticsContext(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}

/**
 * Higher-order component for analytics tracking
 */
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  trackingConfig?: {
    pageType?: string;
    autoTrackPageView?: boolean;
    autoTrackScrollDepth?: boolean;
    autoTrackTimeOnPage?: boolean;
  }
) {
  return function AnalyticsWrappedComponent(props: P) {
    const { trackEvent } = useAnalyticsContext();
    const {
      pageType = 'page',
      autoTrackPageView = true,
      autoTrackScrollDepth = true,
      autoTrackTimeOnPage = true,
    } = trackingConfig || {};

    useEffect(() => {
      // Auto-track page view
      if (autoTrackPageView) {
        trackEvent({
          type: 'page_view',
          data: {
            page_path: window.location.pathname,
            page_title: document.title,
            page_type: pageType,
            event_category: 'Navigation',
          },
        });
      }

      // Auto-track scroll depth
      let scrollCleanup: (() => void) | undefined;
      if (autoTrackScrollDepth) {
        const trackedDepths = new Set<number>();
        let ticking = false;

        const trackScrollPosition = () => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPercent = Math.round((scrollTop / docHeight) * 100);

          const milestones = [25, 50, 75, 90, 100];
          for (const milestone of milestones) {
            if (scrollPercent >= milestone && !trackedDepths.has(milestone)) {
              trackedDepths.add(milestone);
              trackEvent({
                type: 'scroll_depth',
                data: {
                  scroll_depth: milestone,
                  page_type: pageType,
                  event_category: 'Engagement',
                  event_label: `${milestone}%`,
                  value: milestone,
                },
              });
            }
          }
          ticking = false;
        };

        const onScroll = () => {
          if (!ticking) {
            requestAnimationFrame(trackScrollPosition);
            ticking = true;
          }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        scrollCleanup = () => window.removeEventListener('scroll', onScroll);
      }

      // Auto-track time on page
      let timeCleanup: (() => void) | undefined;
      if (autoTrackTimeOnPage) {
        const startTime = Date.now();

        const trackTimeSpent = () => {
          const timeSpent = (Date.now() - startTime) / 1000;
          if (timeSpent >= 10) {
            trackEvent({
              type: 'time_on_page',
              data: {
                time_spent_seconds: Math.round(timeSpent),
                page_type: pageType,
                event_category: 'Engagement',
                event_label: pageType,
                value: Math.round(timeSpent),
              },
            });
          }
        };

        const events = ['beforeunload', 'pagehide', 'visibilitychange'];
        const handlePageLeave = () => {
          if (document.visibilityState === 'hidden' || document.visibilityState === undefined) {
            trackTimeSpent();
          }
        };

        events.forEach(event => {
          window.addEventListener(event, handlePageLeave, { passive: true });
        });

        timeCleanup = () => {
          events.forEach(event => {
            window.removeEventListener(event, handlePageLeave);
          });
        };
      }

      // Cleanup
      return () => {
        scrollCleanup?.();
        timeCleanup?.();
      };
    }, [trackEvent, pageType, autoTrackPageView, autoTrackScrollDepth, autoTrackTimeOnPage]);

    return <Component {...props} />;
  };
}

/**
 * Component for tracking specific events
 */
interface EventTrackerProps {
  event: Omit<AnalyticsEvent, 'timestamp'>;
  trigger?: 'mount' | 'unmount' | 'both';
  delay?: number;
}

export function EventTracker({ 
  event, 
  trigger = 'mount', 
  delay = 0 
}: EventTrackerProps) {
  const { trackEvent } = useAnalyticsContext();

  useEffect(() => {
    const trackWithDelay = () => {
      if (delay > 0) {
        setTimeout(() => trackEvent(event), delay);
      } else {
        trackEvent(event);
      }
    };

    if (trigger === 'mount' || trigger === 'both') {
      trackWithDelay();
    }

    return () => {
      if (trigger === 'unmount' || trigger === 'both') {
        trackEvent(event);
      }
    };
  }, [event, trigger, delay, trackEvent]);

  return null;
}