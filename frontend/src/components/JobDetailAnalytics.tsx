'use client';

import { useEffect } from 'react';
import { trackApplyClick, trackInternalLinkClick, initializeScrollTracking, initializeTimeTracking } from '@/lib/analytics';

interface JobDetailAnalyticsProps {
  jobSlug: string;
  jobTitle: string;
  organization?: string;
  category: string;
}

export function JobDetailAnalytics({ jobSlug, jobTitle, organization, category }: JobDetailAnalyticsProps) {
  useEffect(() => {
    // Initialize scroll depth tracking
    const cleanupScroll = initializeScrollTracking();
    
    // Initialize time tracking
    const cleanupTime = initializeTimeTracking('job');
    
    // Track apply button clicks
    const applyBtn = document.getElementById('apply-btn');
    const handleApplyClick = () => {
      trackApplyClick(jobSlug, jobTitle, organization, category);
    };
    
    if (applyBtn) {
      applyBtn.addEventListener('click', handleApplyClick);
    }
    
    // Track internal link clicks
    const internalLinks = document.querySelectorAll('a[href^="/"]');
    const handleInternalLinkClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target && target.href) {
        const linkType = target.dataset.linkType || 'internal';
        trackInternalLinkClick(linkType, target.pathname, target.textContent || '');
      }
    };
    
    internalLinks.forEach(link => {
      link.addEventListener('click', handleInternalLinkClick);
    });
    
    return () => {
      if (applyBtn) {
        applyBtn.removeEventListener('click', handleApplyClick);
      }
      internalLinks.forEach(link => {
        link.removeEventListener('click', handleInternalLinkClick);
      });
      if (cleanupScroll) {
        cleanupScroll();
      }
      if (cleanupTime) {
        cleanupTime();
      }
    };
  }, [jobSlug, jobTitle, organization, category]);

  return null; // This component doesn't render anything
}