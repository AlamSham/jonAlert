import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const categoryLabels = {
  job: '📢 New Govt Job',
  result: '🎯 Result Out',
  'admit-card': '🎫 Admit Card Out',
  admission: '🎓 Admission Alert',
  scholarship: '💰 Scholarship Alert',
  'exam-form': '📝 Exam Form Alert'
};

/**
 * Builds the notification payload for OneSignal
 */
export const buildOneSignalNotification = (job) => {
  const siteUrl = env.frontendUrl || 'https://sarkaripulse.net';
  const jobUrl = `${siteUrl}/job/${job.slug}`;
  const label = categoryLabels[job.category] || '🔔 New Alert';

  // Crisp title with high click-through appeal
  const title = `${label}: ${job.title}`;
  const truncatedTitle = title.length > 70 ? `${title.slice(0, 67)}...` : title;

  // Informative subtitle / body with key decision factors
  const parts = [];
  if (job.organization) {
    parts.push(job.organization);
  }
  if (job.vacancyCount && Number(job.vacancyCount) > 0) {
    parts.push(`${job.vacancyCount} Posts`);
  }
  if (job.lastDate) {
    const dateStr = new Date(job.lastDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
    parts.push(`Last Date: ${dateStr}`);
  }

  const details = parts.length > 0 ? `${parts.join(' | ')} - ` : '';
  const body = `${details}Click to read details & apply online! 🚀`;

  return {
    app_id: env.oneSignalAppId,
    included_segments: ['Total Subscriptions'],
    headings: { en: truncatedTitle },
    contents: { en: body },
    url: jobUrl,
    web_url: jobUrl,
    chrome_web_icon: `${siteUrl}/icon-192x192.png`,
    chrome_web_badge: `${siteUrl}/icon-192x192.png`,
    firefox_icon: `${siteUrl}/icon-192x192.png`,
    data: {
      slug: job.slug,
      category: job.category
    }
  };
};

/**
 * Send automated push notification via OneSignal REST API
 * Non-blocking, safe error handling
 */
export const sendOneSignalJobNotification = async (job) => {
  if (!env.oneSignalEnabled) {
    logger.debug('OneSignal push notification skipped: disabled via ONESIGNAL_ENABLED');
    return { skipped: true, reason: 'disabled' };
  }

  if (!env.oneSignalAppId || !env.oneSignalApiKey) {
    logger.warn('OneSignal config missing (ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY), skipping push');
    return { skipped: true, reason: 'missing_credentials' };
  }

  try {
    const payload = buildOneSignalNotification(job);

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Key ${env.oneSignalApiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      logger.error('OneSignal push notification failed', {
        status: response.status,
        slug: job.slug,
        response: data
      });
      return { success: false, error: data };
    }

    logger.info('OneSignal push notification dispatched successfully', {
      id: data.id,
      recipients: data.recipients,
      slug: job.slug
    });

    return { success: true, id: data.id, recipients: data.recipients };
  } catch (error) {
    logger.error('OneSignal push notification unexpected error', {
      slug: job?.slug,
      error: error.message
    });
    return { success: false, error: error.message };
  }
};
