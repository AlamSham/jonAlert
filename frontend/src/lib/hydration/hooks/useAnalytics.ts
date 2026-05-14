/**
 * React hook for analytics integration
 * Provides a hydration-safe way to use analytics in React components
 */

import { useEffect, useRef, useCallback } from 'react';
import { AnalyticsManager } from '../AnalyticsManager';
import { AnalyticsEvent, HydrationConfig } from '../types';
import { createAnalyticsManager } from '../utils';

// Global analytics manager instance
let globalAnalyticsManager: AnalyticsManager | null = null;

/**
 * Get or create the global analytics manager
 */
function getAnalyticsManager(config?: Partial<HydrationConfig>): AnalyticsManager {
  if (!globalAnalyticsManager) {
    globalAnalyticsManager = createAnalyticsManager(config);
  }
  return globalAnalyticsManager;
}

/**
 * Hook for using analytics in React components
 */
export function useAnalytics(config?: Partial<HydrationConfig>) {
  const managerRef = useRef<AnalyticsManager | null>(null);

  // Initialize analytics manager
  useEffect(() => {
    managerRef.current = getAnalyticsManager(config);
    
    return () => {
      // Cleanup is handled globally, not per component
    };
  }, [config]);

  // Track event function
  const trackEvent = useCallback((event: Omit<AnalyticsEvent, 'timestamp'>) => {
    if (managerRef.current) {
      managerRef.current.trackEvent({
        ...event,
        timestamp: Date.now(),
      });
    }
  }, []);

  // Track page view
  const trackPageView = useCallback((path: string, title: string, category?: string) => {
    trackEvent({
      type: 'page_view',
      data: {
        page_path: path,
        page_title: title,
        page_category: category,
        event_category: 'Navigation',
      },
    });
  }, [trackEvent]);

  // Track user interaction
  const trackInteraction = useCallback((
    action: string,
    category: string = 'User Interaction',
    label?: string,
    value?: number
  ) => {
    trackEvent({
      type: action,
      data: {
        event_category: category,
        event_label: label,
        value,
      },
    });
  }, [trackEvent]);

  // Track conversion
  const trackConversion = useCallback((
    type: string,
    value: number = 1,
    additionalData?: Record<string, any>
  ) => {
    trackEvent({
      type: 'conversion',
      data: {
        conversion_type: type,
        value,
        event_category: 'Conversion',
        ...additionalData,
      },
    });
  }, [trackEvent]);

  // Track error
  const trackError = useCallback((
    errorType: string,
    errorMessage: string,
    errorLocation?: string
  ) => {
    trackEvent({
      type: 'error',
      data: {
        error_type: errorType,
        error_message: errorMessage.substring(0, 100),
        error_location: errorLocation || window.location.pathname,
        event_category: 'Error',
      },
    });
  }, [trackEvent]);

  // Get analytics manager instance
  const getManager = useCallback(() => managerRef.current, []);

  return {
    trackEvent,
    trackPageView,
    trackInteraction,
    trackConversion,
    trackError,
    getManager,
  };
}

/**
 * Hook for tracking page views automatically
 */
export function usePageTracking(
  path?: string,
  title?: string,
  category?: string
) {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    const pagePath = path || window.location.pathname;
    const pageTitle = title || document.title;
    
    // Track page view after a small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      trackPageView(pagePath, pageTitle, category);
    }, 100);

    return () => clearTimeout(timer);
  }, [path, title, category, trackPageView]);
}

/**
 * Hook for tracking scroll depth
 */
export function useScrollTracking() {
  const { trackEvent } = useAnalytics();
  const trackedDepths = useRef(new Set<number>());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;

    const trackScrollPosition = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      // Track milestones
      const milestones = [25, 50, 75, 90, 100];
      for (const milestone of milestones) {
        if (scrollPercent >= milestone && !trackedDepths.current.has(milestone)) {
          trackedDepths.current.add(milestone);
          trackEvent({
            type: 'scroll_depth',
            data: {
              scroll_depth: milestone,
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

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [trackEvent]);
}

/**
 * Hook for tracking time on page
 */
export function useTimeTracking(pageType: string = 'page') {
  const { trackEvent } = useAnalytics();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    const trackTimeSpent = () => {
      const timeSpent = (Date.now() - startTimeRef.current) / 1000;
      
      // Only track if user spent meaningful time (more than 10 seconds)
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

    // Track time when user leaves the page
    const events = ['beforeunload', 'pagehide', 'visibilitychange'];
    
    const handlePageLeave = () => {
      if (document.visibilityState === 'hidden' || document.visibilityState === undefined) {
        trackTimeSpent();
      }
    };

    events.forEach(event => {
      window.addEventListener(event, handlePageLeave, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handlePageLeave);
      });
    };
  }, [pageType, trackEvent]);
}

/**
 * Hook for tracking form interactions
 */
export function useFormTracking(formType: string) {
  const { trackEvent } = useAnalytics();

  const trackFormStart = useCallback(() => {
    trackEvent({
      type: 'form_start',
      data: {
        form_type: formType,
        event_category: 'Form',
        event_label: `${formType}_start`,
      },
    });
  }, [formType, trackEvent]);

  const trackFormSubmit = useCallback((success: boolean = true) => {
    trackEvent({
      type: 'form_submission',
      data: {
        form_type: formType,
        form_success: success,
        event_category: 'Form',
        event_label: `${formType}_${success ? 'success' : 'error'}`,
        value: success ? 1 : 0,
      },
    });
  }, [formType, trackEvent]);

  const trackFormError = useCallback((errorMessage: string) => {
    trackEvent({
      type: 'form_error',
      data: {
        form_type: formType,
        error_message: errorMessage.substring(0, 100),
        event_category: 'Form',
        event_label: `${formType}_error`,
      },
    });
  }, [formType, trackEvent]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFormError,
  };
}