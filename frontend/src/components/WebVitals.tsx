'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

export function WebVitals() {
  useEffect(() => {
    function sendToAnalytics(metric: any) {
      const body = JSON.stringify(metric);
      
      // Send to analytics endpoint
      if ('sendBeacon' in navigator) {
        navigator.sendBeacon('/api/analytics', body);
      } else {
        fetch('/api/analytics', { body, method: 'POST', keepalive: true }).catch(() => {});
      }
      
      // Also send to Google Analytics via gtag if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'web_vitals', {
          metric_name: metric.name,
          metric_value: Math.round(metric.value),
          metric_id: metric.id,
          metric_delta: metric.delta ? Math.round(metric.delta) : undefined,
          metric_rating: metric.rating,
          event_category: 'Performance',
          event_label: metric.name,
          value: Math.round(metric.value),
          non_interaction: true,
        });
      }
    }

    onCLS(sendToAnalytics);
    onINP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  }, []);

  return null;
}
