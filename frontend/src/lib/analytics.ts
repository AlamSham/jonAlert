/**
 * Analytics tracking utilities for SarkariPulse
 * Provides Google Analytics event tracking with error handling
 */

// Extend the Window interface to include gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date | Record<string, any>,
      config?: Record<string, any>
    ) => void;
  }
}

/**
 * Track custom events to Google Analytics
 * @param eventName - Name of the event to track
 * @param params - Optional parameters to send with the event
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, any>
): void {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...params,
        // Add default parameters
        timestamp: new Date().toISOString(),
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  } catch (error) {
    // Silently fail - don't break user experience
    console.warn('Analytics tracking failed:', error);
  }
}

/**
 * Track internal link clicks for navigation pattern analysis
 * @param linkType - Type of link (category, state, qualification, tag, related)
 * @param destination - URL or path of the destination
 * @param linkText - Text content of the link
 */
export function trackInternalLinkClick(
  linkType: string,
  destination: string,
  linkText?: string
): void {
  try {
    trackEvent('internal_link_click', {
      link_type: linkType,
      link_destination: destination,
      link_text: linkText || destination,
      event_category: 'Navigation',
    });
  } catch (error) {
    console.warn('Internal link tracking failed:', error);
  }
}

/**
 * Track scroll depth for engagement measurement
 * @param depth - Scroll depth percentage (25, 50, 75, 90, 100)
 */
export function trackScrollDepth(depth: number): void {
  try {
    // Only track specific milestones to avoid spam
    const validDepths = [25, 50, 75, 90, 100];
    if (!validDepths.includes(depth)) {
      return;
    }

    trackEvent('scroll_depth', {
      scroll_depth: depth,
      event_category: 'Engagement',
      event_label: `${depth}%`,
      value: depth,
    });
  } catch (error) {
    console.warn('Scroll depth tracking failed:', error);
  }
}

/**
 * Track apply button clicks for conversion measurement
 * @param jobSlug - Unique identifier for the job
 * @param jobTitle - Title of the job
 * @param organization - Organization offering the job
 * @param category - Job category (jobs, admission, scholarship, etc.)
 */
export function trackApplyClick(
  jobSlug: string,
  jobTitle: string,
  organization?: string,
  category?: string
): void {
  try {
    trackEvent('apply_click', {
      job_slug: jobSlug,
      job_title: jobTitle,
      job_organization: organization || 'Unknown',
      job_category: category || 'jobs',
      event_category: 'Conversion',
      event_label: jobTitle,
    });

    // Also track as a conversion event
    trackEvent('conversion', {
      conversion_type: 'apply_click',
      job_slug: jobSlug,
      value: 1,
    });
  } catch (error) {
    console.warn('Apply click tracking failed:', error);
  }
}

/**
 * Track search queries for search behavior analysis
 * @param query - Search query entered by user
 * @param resultsCount - Number of results returned
 * @param searchType - Type of search (general, category, state)
 */
export function trackSearch(
  query: string,
  resultsCount: number,
  searchType: string = 'general'
): void {
  try {
    trackEvent('search', {
      search_term: query.toLowerCase().trim(),
      search_results_count: resultsCount,
      search_type: searchType,
      event_category: 'Search',
      event_label: query,
      value: resultsCount,
    });
  } catch (error) {
    console.warn('Search tracking failed:', error);
  }
}

/**
 * Send Core Web Vitals data to Google Analytics
 * @param metric - Web Vitals metric object
 */
export function sendWebVitals(metric: {
  name: string;
  value: number;
  id: string;
  delta?: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
}): void {
  try {
    trackEvent('web_vitals', {
      metric_name: metric.name,
      metric_value: Math.round(metric.value),
      metric_id: metric.id,
      metric_delta: metric.delta ? Math.round(metric.delta) : undefined,
      metric_rating: metric.rating,
      event_category: 'Performance',
      event_label: metric.name,
      value: Math.round(metric.value),
      // Don't send debug info in production
      non_interaction: true,
    });
  } catch (error) {
    console.warn('Web Vitals tracking failed:', error);
  }
}

/**
 * Track social share button clicks
 * @param platform - Social platform (whatsapp, telegram, twitter, facebook)
 * @param contentType - Type of content being shared (job, page)
 * @param contentId - ID or slug of the content
 */
export function trackSocialShare(
  platform: string,
  contentType: string,
  contentId: string
): void {
  try {
    trackEvent('social_share', {
      social_platform: platform,
      content_type: contentType,
      content_id: contentId,
      event_category: 'Social',
      event_label: `${platform}_${contentType}`,
    });
  } catch (error) {
    console.warn('Social share tracking failed:', error);
  }
}

/**
 * Track page view with additional context
 * @param pagePath - Path of the page
 * @param pageTitle - Title of the page
 * @param category - Page category (job, category, legal, etc.)
 */
export function trackPageView(
  pagePath: string,
  pageTitle: string,
  category?: string
): void {
  try {
    trackEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle,
      page_category: category,
      event_category: 'Navigation',
    });
  } catch (error) {
    console.warn('Page view tracking failed:', error);
  }
}

/**
 * Track time spent on page when user leaves
 * @param timeSpent - Time spent in seconds
 * @param pageType - Type of page (job, category, legal, etc.)
 */
export function trackTimeOnPage(timeSpent: number, pageType: string): void {
  try {
    // Only track if user spent meaningful time (more than 10 seconds)
    if (timeSpent < 10) {
      return;
    }

    trackEvent('time_on_page', {
      time_spent_seconds: Math.round(timeSpent),
      page_type: pageType,
      event_category: 'Engagement',
      event_label: pageType,
      value: Math.round(timeSpent),
    });
  } catch (error) {
    console.warn('Time on page tracking failed:', error);
  }
}

/**
 * Track form submissions
 * @param formType - Type of form (search, contact, subscribe)
 * @param success - Whether the submission was successful
 */
export function trackFormSubmission(
  formType: string,
  success: boolean = true
): void {
  try {
    trackEvent('form_submission', {
      form_type: formType,
      form_success: success,
      event_category: 'Form',
      event_label: `${formType}_${success ? 'success' : 'error'}`,
      value: success ? 1 : 0,
    });
  } catch (error) {
    console.warn('Form submission tracking failed:', error);
  }
}

/**
 * Track error events
 * @param errorType - Type of error (404, 500, api_error, etc.)
 * @param errorMessage - Error message or description
 * @param errorLocation - Where the error occurred
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  errorLocation?: string
): void {
  try {
    trackEvent('error', {
      error_type: errorType,
      error_message: errorMessage.substring(0, 100), // Limit message length
      error_location: errorLocation || window.location.pathname,
      event_category: 'Error',
      event_label: errorType,
    });
  } catch (error) {
    console.warn('Error tracking failed:', error);
  }
}

/**
 * Initialize scroll depth tracking for a page
 * Sets up scroll event listeners to track depth milestones
 */
export function initializeScrollTracking(): (() => void) | undefined {
  try {
    if (typeof window === 'undefined') return;

    const trackedDepths = new Set<number>();
    let ticking = false;

    const trackScrollPosition = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      // Track milestones
      const milestones = [25, 50, 75, 90, 100];
      for (const milestone of milestones) {
        if (scrollPercent >= milestone && !trackedDepths.has(milestone)) {
          trackedDepths.add(milestone);
          trackScrollDepth(milestone);
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

    // Add scroll listener
    window.addEventListener('scroll', onScroll, { passive: true });

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  } catch (error) {
    console.warn('Scroll tracking initialization failed:', error);
  }
}

/**
 * Initialize time tracking for a page
 * Tracks time spent when user leaves the page
 */
export function initializeTimeTracking(pageType: string): (() => void) | undefined {
  try {
    if (typeof window === 'undefined') return;

    const startTime = Date.now();

    const trackTimeSpent = () => {
      const timeSpent = (Date.now() - startTime) / 1000;
      trackTimeOnPage(timeSpent, pageType);
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

    // Cleanup function
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handlePageLeave);
      });
    };
  } catch (error) {
    console.warn('Time tracking initialization failed:', error);
  }
}