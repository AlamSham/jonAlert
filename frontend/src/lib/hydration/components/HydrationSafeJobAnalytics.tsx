/**
 * Hydration-safe Job Detail Analytics component
 * Replacement for JobDetailAnalytics with better hydration handling and event queuing
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useAnalyticsContext } from './AnalyticsProvider';
import { useScrollTracking, useTimeTracking } from '../hooks/useAnalytics';

interface HydrationSafeJobAnalyticsProps {
  jobSlug: string;
  jobTitle: string;
  organization?: string;
  category: string;
}

export function HydrationSafeJobAnalytics({ 
  jobSlug, 
  jobTitle, 
  organization, 
  category 
}: HydrationSafeJobAnalyticsProps) {
  const { trackEvent, isReady } = useAnalyticsContext();

  // Use built-in scroll and time tracking hooks
  useScrollTracking();
  useTimeTracking('job');

  // Track apply button clicks
  const trackApplyClick = useCallback(() => {
    trackEvent({
      type: 'apply_click',
      data: {
        job_slug: jobSlug,
        job_title: jobTitle,
        job_organization: organization || 'Unknown',
        job_category: category,
        event_category: 'Conversion',
        event_label: jobTitle,
      },
    });

    // Also track as a conversion event
    trackEvent({
      type: 'conversion',
      data: {
        conversion_type: 'apply_click',
        job_slug: jobSlug,
        value: 1,
      },
    });
  }, [jobSlug, jobTitle, organization, category, trackEvent]);

  // Track internal link clicks
  const trackInternalLinkClick = useCallback((e: Event) => {
    const target = e.target as HTMLAnchorElement;
    if (target && target.href && target.href.startsWith(window.location.origin)) {
      const linkType = target.dataset.linkType || 'internal';
      const pathname = new URL(target.href).pathname;
      
      trackEvent({
        type: 'internal_link_click',
        data: {
          link_type: linkType,
          link_destination: pathname,
          link_text: target.textContent || pathname,
          event_category: 'Navigation',
          source_page: 'job_detail',
          source_job: jobSlug,
        },
      });
    }
  }, [jobSlug, trackEvent]);

  useEffect(() => {
    if (!isReady) return;

    // Track page view for job detail
    trackEvent({
      type: 'page_view',
      data: {
        page_path: window.location.pathname,
        page_title: document.title,
        page_category: 'job_detail',
        job_slug: jobSlug,
        job_category: category,
        event_category: 'Navigation',
      },
    });

    // Set up apply button click tracking
    const applyBtn = document.getElementById('apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', trackApplyClick);
    }

    // Set up internal link click tracking
    const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="' + window.location.origin + '"]');
    internalLinks.forEach(link => {
      link.addEventListener('click', trackInternalLinkClick);
    });

    // Track job view engagement
    trackEvent({
      type: 'job_view',
      data: {
        job_slug: jobSlug,
        job_title: jobTitle,
        job_organization: organization || 'Unknown',
        job_category: category,
        event_category: 'Engagement',
        event_label: jobTitle,
      },
    });

    // Cleanup event listeners
    return () => {
      if (applyBtn) {
        applyBtn.removeEventListener('click', trackApplyClick);
      }
      internalLinks.forEach(link => {
        link.removeEventListener('click', trackInternalLinkClick);
      });
    };
  }, [
    isReady,
    jobSlug,
    jobTitle,
    organization,
    category,
    trackEvent,
    trackApplyClick,
    trackInternalLinkClick,
  ]);

  // Track social share clicks if share buttons are present
  useEffect(() => {
    if (!isReady) return;

    const handleSocialShare = (e: Event) => {
      const target = e.target as HTMLElement;
      const shareButton = target.closest('[data-share-platform]');
      
      if (shareButton) {
        const platform = shareButton.getAttribute('data-share-platform') || 'unknown';
        
        trackEvent({
          type: 'social_share',
          data: {
            social_platform: platform,
            content_type: 'job',
            content_id: jobSlug,
            job_title: jobTitle,
            event_category: 'Social',
            event_label: `${platform}_job`,
          },
        });
      }
    };

    // Add event listener to document for event delegation
    document.addEventListener('click', handleSocialShare);

    return () => {
      document.removeEventListener('click', handleSocialShare);
    };
  }, [isReady, jobSlug, jobTitle, trackEvent]);

  // Track form interactions on the page
  useEffect(() => {
    if (!isReady) return;

    const handleFormSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      const formType = form.dataset.formType || 'unknown';
      
      trackEvent({
        type: 'form_submission',
        data: {
          form_type: formType,
          form_success: true, // Will be updated if form fails
          page_context: 'job_detail',
          job_slug: jobSlug,
          event_category: 'Form',
          event_label: `${formType}_job_page`,
        },
      });
    };

    const handleFormError = (e: Event) => {
      const form = e.target as HTMLFormElement;
      const formType = form.dataset.formType || 'unknown';
      
      trackEvent({
        type: 'form_error',
        data: {
          form_type: formType,
          page_context: 'job_detail',
          job_slug: jobSlug,
          event_category: 'Form',
          event_label: `${formType}_error_job_page`,
        },
      });
    };

    // Add form event listeners
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', handleFormSubmit);
      form.addEventListener('error', handleFormError);
    });

    return () => {
      forms.forEach(form => {
        form.removeEventListener('submit', handleFormSubmit);
        form.removeEventListener('error', handleFormError);
      });
    };
  }, [isReady, jobSlug, trackEvent]);

  return null; // This component doesn't render anything
}