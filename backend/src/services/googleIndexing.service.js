/**
 * Google Indexing API Service
 * 
 * Notifies Google immediately when new job pages are published.
 * This dramatically speeds up indexing compared to waiting for crawlers.
 * 
 * Setup Required:
 * 1. Enable Google Indexing API in GCP Console
 * 2. Create Service Account with "Indexing API" permission
 * 3. Add service account email to Search Console as owner
 * 4. Download JSON key and set GOOGLE_APPLICATION_CREDENTIALS env var
 * 
 * @module googleIndexing
 */

import { google } from 'googleapis';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { getCredentialsPath } from '../utils/gcpCredentials.js';

const indexing = google.indexing('v3');

/**
 * Get authenticated client for Google Indexing API
 * 
 * Uses credentials from either:
 * 1. GOOGLE_APPLICATION_CREDENTIALS file path
 * 2. Environment variables (GOOGLE_SERVICE_ACCOUNT_*)
 * 3. Application Default Credentials (when running on GCP)
 * 
 * @returns {Promise<Object>} Authenticated JWT client
 */
async function getAuthClient() {
  // Ensure credentials are available (from env vars or file)
  await getCredentialsPath();
  
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  
  return auth.getClient();
}

/**
 * Notify Google about a new or updated URL
 * @param {string} url - Full URL to notify Google about
 * @param {string} type - Notification type: 'URL_UPDATED' or 'URL_DELETED'
 * @returns {Promise<Object>} API response
 */
export async function notifyGoogle(url, type = 'URL_UPDATED') {
  try {
    const authClient = await getAuthClient();
    
    const response = await indexing.urlNotifications.publish({
      auth: authClient,
      requestBody: {
        url: url,
        type: type, // 'URL_UPDATED' or 'URL_DELETED'
      },
    });

    logger.info('Google Indexing API notification sent', {
      url,
      type,
      statusCode: response.status
    });

    return { 
      success: true, 
      data: response.data,
      statusCode: response.status
    };
  } catch (error) {
    logger.error('Google Indexing API notification failed', {
      url,
      type,
      error: error.message,
      code: error.code
    });

    return { 
      success: false, 
      error: error.message,
      code: error.code
    };
  }
}

/**
 * Notify Google about a new job posting
 * @param {Object} job - Job document with slug
 * @returns {Promise<Object>} Notification result
 */
export async function notifyNewJob(job) {
  if (!job || !job.slug) {
    logger.warn('Cannot notify Google: invalid job object');
    return { success: false, reason: 'invalid_job' };
  }

  const url = `${env.frontendUrl}/job/${job.slug}`;
  return notifyGoogle(url, 'URL_UPDATED');
}

/**
 * Notify Google about a deleted job
 * @param {string} slug - Job slug
 * @returns {Promise<Object>} Notification result
 */
export async function notifyDeletedJob(slug) {
  if (!slug) {
    logger.warn('Cannot notify Google: invalid slug');
    return { success: false, reason: 'invalid_slug' };
  }

  const url = `${env.frontendUrl}/job/${slug}`;
  return notifyGoogle(url, 'URL_DELETED');
}

/**
 * Batch notify Google about multiple URLs
 * @param {Array<string>} urls - Array of URLs to notify
 * @param {string} type - Notification type
 * @returns {Promise<Array>} Array of results
 */
export async function batchNotifyGoogle(urls, type = 'URL_UPDATED') {
  const results = [];
  
  // Google Indexing API has rate limits - process in small batches with delays
  const BATCH_SIZE = 100;
  const DELAY_MS = 1000; // 1 second delay between batches
  
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    
    const batchPromises = batch.map(url => notifyGoogle(url, type));
    const batchResults = await Promise.allSettled(batchPromises);
    
    results.push(...batchResults.map(r => r.value || { success: false, error: r.reason }));
    
    // Delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < urls.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
    
    logger.info('Google Indexing API batch processed', {
      batch: Math.floor(i / BATCH_SIZE) + 1,
      total: Math.ceil(urls.length / BATCH_SIZE),
      processed: Math.min(i + BATCH_SIZE, urls.length),
      totalUrls: urls.length
    });
  }
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  
  logger.info('Google Indexing API batch notification completed', {
    total: results.length,
    success: successCount,
    failed: failCount
  });
  
  return results;
}

/**
 * Notify Google about all active jobs (bulk indexing)
 * Use this for initial setup or to re-index existing jobs
 * @returns {Promise<Object>} Batch notification results
 */
export async function notifyAllActiveJobs() {
  try {
    const { Job } = await import('../models/Job.js');
    
    const activeJobs = await Job.find({ status: 'active' })
      .select('slug')
      .lean();
    
    if (activeJobs.length === 0) {
      logger.info('No active jobs to notify Google about');
      return { success: true, count: 0 };
    }
    
    const urls = activeJobs.map(job => `${env.frontendUrl}/job/${job.slug}`);
    
    logger.info('Starting bulk Google Indexing API notification', {
      totalJobs: urls.length
    });
    
    const results = await batchNotifyGoogle(urls, 'URL_UPDATED');
    
    return {
      success: true,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  } catch (error) {
    logger.error('Bulk Google indexing notification failed', {
      error: error.message
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}
