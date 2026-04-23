/**
 * Unit tests for analytics utilities
 */

import {
  trackEvent,
  trackInternalLinkClick,
  trackScrollDepth,
  trackApplyClick,
  trackSearch,
  sendWebVitals,
  trackSocialShare,
  trackPageView,
  trackTimeOnPage,
  trackFormSubmission,
  trackError,
} from '@/lib/analytics';

// Mock window.gtag
const mockGtag = jest.fn();

// Mock window object
Object.defineProperty(window, 'gtag', {
  value: mockGtag,
  writable: true,
});

Object.defineProperty(window, 'location', {
  value: {
    href: 'https://sarkaripulse.net/test-page',
  },
  writable: true,
});

Object.defineProperty(document, 'title', {
  value: 'Test Page Title',
  writable: true,
});

describe('Analytics Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    it('should call gtag with correct parameters', () => {
      const eventName = 'test_event';
      const params = { test_param: 'test_value' };

      trackEvent(eventName, params);

      expect(mockGtag).toHaveBeenCalledWith('event', eventName, {
        test_param: 'test_value',
        timestamp: expect.any(String),
        page_location: 'https://sarkaripulse.net/test-page',
        page_title: 'Test Page Title',
      });
    });

    it('should handle missing gtag gracefully', () => {
      // @ts-ignore
      window.gtag = undefined;

      expect(() => {
        trackEvent('test_event');
      }).not.toThrow();

      // Restore gtag
      window.gtag = mockGtag;
    });

    it('should handle errors gracefully', () => {
      mockGtag.mockImplementation(() => {
        throw new Error('GA error');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      expect(() => {
        trackEvent('test_event');
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Analytics tracking failed:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('trackInternalLinkClick', () => {
    it('should track internal link clicks with correct parameters', () => {
      trackInternalLinkClick('category', '/jobs', 'Jobs Page');

      expect(mockGtag).toHaveBeenCalledWith('event', 'internal_link_click', {
        link_type: 'category',
        link_destination: '/jobs',
        link_text: 'Jobs Page',
        event_category: 'Navigation',
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });
    });

    it('should use destination as link text when not provided', () => {
      trackInternalLinkClick('state', '/jobs/state/delhi');

      expect(mockGtag).toHaveBeenCalledWith('event', 'internal_link_click', {
        link_type: 'state',
        link_destination: '/jobs/state/delhi',
        link_text: '/jobs/state/delhi',
        event_category: 'Navigation',
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });
    });
  });

  describe('trackScrollDepth', () => {
    it('should track valid scroll depths', () => {
      const validDepths = [25, 50, 75, 90, 100];

      validDepths.forEach(depth => {
        trackScrollDepth(depth);
        expect(mockGtag).toHaveBeenCalledWith('event', 'scroll_depth', {
          scroll_depth: depth,
          event_category: 'Engagement',
          event_label: `${depth}%`,
          value: depth,
          timestamp: expect.any(String),
          page_location: expect.any(String),
          page_title: expect.any(String),
        });
      });
    });

    it('should not track invalid scroll depths', () => {
      const invalidDepths = [10, 30, 60, 80, 95];

      invalidDepths.forEach(depth => {
        trackScrollDepth(depth);
      });

      expect(mockGtag).not.toHaveBeenCalled();
    });
  });

  describe('trackApplyClick', () => {
    it('should track apply clicks with all parameters', () => {
      trackApplyClick('test-job-slug', 'Test Job Title', 'Test Organization', 'jobs');

      expect(mockGtag).toHaveBeenCalledTimes(2); // apply_click + conversion

      expect(mockGtag).toHaveBeenNthCalledWith(1, 'event', 'apply_click', {
        job_slug: 'test-job-slug',
        job_title: 'Test Job Title',
        job_organization: 'Test Organization',
        job_category: 'jobs',
        event_category: 'Conversion',
        event_label: 'Test Job Title',
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });

      expect(mockGtag).toHaveBeenNthCalledWith(2, 'event', 'conversion', {
        conversion_type: 'apply_click',
        job_slug: 'test-job-slug',
        value: 1,
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });
    });

    it('should use default values for optional parameters', () => {
      trackApplyClick('test-job-slug', 'Test Job Title');

      expect(mockGtag).toHaveBeenNthCalledWith(1, 'event', 'apply_click', {
        job_slug: 'test-job-slug',
        job_title: 'Test Job Title',
        job_organization: 'Unknown',
        job_category: 'jobs',
        event_category: 'Conversion',
        event_label: 'Test Job Title',
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });
    });
  });

  describe('trackSearch', () => {
    it('should track search queries with all parameters', () => {
      trackSearch('government jobs', 25, 'category');

      expect(mockGtag).toHaveBeenCalledWith('event', 'search', {
        search_term: 'government jobs',
        search_results_count: 25,
        search_type: 'category',
        event_category: 'Search',
        event_label: 'government jobs',
        value: 25,
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });
    });

    it('should normalize search terms', () => {
      trackSearch('  GOVERNMENT JOBS  ', 10);

      expect(mockGtag).toHaveBeenCalledWith('event', 'search', {
        search_term: 'government jobs',
        search_results_count: 10,
        search_type: 'general',
        event_category: 'Search',
        event_label: '  GOVERNMENT JOBS  ',
        value: 10,
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });
    });
  });

  describe('sendWebVitals', () => {
    it('should send web vitals data', () => {
      const metric = {
        name: 'LCP',
        value: 1234.56,
        id: 'test-id',
        delta: 100.5,
        rating: 'good' as const,
      };

      sendWebVitals(metric);

      expect(mockGtag).toHaveBeenCalledWith('event', 'web_vitals', {
        metric_name: 'LCP',
        metric_value: 1235, // rounded
        metric_id: 'test-id',
        metric_delta: 101, // rounded
        metric_rating: 'good',
        event_category: 'Performance',
        event_label: 'LCP',
        value: 1235,
        non_interaction: true,
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });
    });

    it('should handle missing optional fields', () => {
      const metric = {
        name: 'CLS',
        value: 0.1,
        id: 'test-id-2',
      };

      sendWebVitals(metric);

      expect(mockGtag).toHaveBeenCalledWith('event', 'web_vitals', {
        metric_name: 'CLS',
        metric_value: 0,
        metric_id: 'test-id-2',
        metric_delta: undefined,
        metric_rating: undefined,
        event_category: 'Performance',
        event_label: 'CLS',
        value: 0,
        non_interaction: true,
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });
    });
  });

  describe('trackSocialShare', () => {
    it('should track social share events', () => {
      trackSocialShare('whatsapp', 'job', 'test-job-slug');

      expect(mockGtag).toHaveBeenCalledWith('event', 'social_share', {
        social_platform: 'whatsapp',
        content_type: 'job',
        content_id: 'test-job-slug',
        event_category: 'Social',
        event_label: 'whatsapp_job',
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });
    });
  });

  describe('trackPageView', () => {
    it('should track page views with category', () => {
      trackPageView('/jobs', 'Jobs Page', 'category');

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/jobs',
        page_title: 'Jobs Page',
        page_category: 'category',
        event_category: 'Navigation',
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });
    });

    it('should track page views without category', () => {
      trackPageView('/about', 'About Page');

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/about',
        page_title: 'About Page',
        page_category: undefined,
        event_category: 'Navigation',
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });
    });
  });

  describe('trackTimeOnPage', () => {
    it('should track time on page for meaningful durations', () => {
      trackTimeOnPage(30, 'job');

      expect(mockGtag).toHaveBeenCalledWith('event', 'time_on_page', {
        time_spent_seconds: 30,
        page_type: 'job',
        event_category: 'Engagement',
        event_label: 'job',
        value: 30,
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });
    });

    it('should not track short durations', () => {
      trackTimeOnPage(5, 'job');

      expect(mockGtag).not.toHaveBeenCalled();
    });
  });

  describe('trackFormSubmission', () => {
    it('should track successful form submissions', () => {
      trackFormSubmission('search', true);

      expect(mockGtag).toHaveBeenCalledWith('event', 'form_submission', {
        form_type: 'search',
        form_success: true,
        event_category: 'Form',
        event_label: 'search_success',
        value: 1,
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });
    });

    it('should track failed form submissions', () => {
      trackFormSubmission('contact', false);

      expect(mockGtag).toHaveBeenCalledWith('event', 'form_submission', {
        form_type: 'contact',
        form_success: false,
        event_category: 'Form',
        event_label: 'contact_error',
        value: 0,
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });
    });
  });

  describe('trackError', () => {
    it('should track errors with all parameters', () => {
      trackError('404', 'Page not found', '/missing-page');

      expect(mockGtag).toHaveBeenCalledWith('event', 'error', {
        error_type: '404',
        error_message: 'Page not found',
        error_location: '/missing-page',
        event_category: 'Error',
        event_label: '404',
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });
    });

    it('should truncate long error messages', () => {
      const longMessage = 'A'.repeat(150);
      trackError('api_error', longMessage);

      expect(mockGtag).toHaveBeenCalledWith('event', 'error', {
        error_type: 'api_error',
        error_message: 'A'.repeat(100),
        error_location: expect.any(String),
        event_category: 'Error',
        event_label: 'api_error',
        timestamp: expect.any(String),
        page_location: expect.any(String),
        page_title: expect.any(String),
      });
    });
  });

  describe('Parameter validation', () => {
    it('should handle undefined parameters gracefully', () => {
      expect(() => {
        // @ts-ignore - Testing runtime behavior
        trackEvent();
      }).not.toThrow();

      expect(() => {
        // @ts-ignore - Testing runtime behavior
        trackInternalLinkClick();
      }).not.toThrow();

      expect(() => {
        // @ts-ignore - Testing runtime behavior
        trackApplyClick();
      }).not.toThrow();
    });

    it('should handle null parameters gracefully', () => {
      expect(() => {
        // @ts-ignore - Testing runtime behavior
        trackEvent(null, null);
      }).not.toThrow();

      expect(() => {
        // @ts-ignore - Testing runtime behavior
        trackSearch(null, null);
      }).not.toThrow();
    });
  });

  describe('Error handling', () => {
    it('should not throw errors when gtag fails', () => {
      mockGtag.mockImplementation(() => {
        throw new Error('Network error');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      expect(() => {
        trackEvent('test_event');
        trackInternalLinkClick('category', '/test');
        trackScrollDepth(50);
        trackApplyClick('slug', 'title');
        trackSearch('query', 10);
        sendWebVitals({ name: 'LCP', value: 1000, id: 'test' });
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledTimes(6);
      consoleSpy.mockRestore();
    });
  });
});