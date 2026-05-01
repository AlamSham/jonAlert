/**
 * Facebook Token Refresh Cron Job
 * 
 * Automatically checks and refreshes Facebook access tokens
 * Runs daily to ensure tokens never expire
 */

import cron from 'node-cron';
import { refreshTokenIfNeeded, getStoredToken } from '../services/facebookToken.service.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let cronJob = null;

/**
 * Check and refresh token if needed
 */
export const checkAndRefreshToken = async () => {
  try {
    logger.info('Starting token refresh check...');
    
    // Check if we have a stored token
    const storedToken = await getStoredToken('page', env.metaPageId);
    
    if (!storedToken) {
      logger.warn('No stored token found. Please run setup script: npm run setup:facebook-token');
      return;
    }
    
    logger.info('Found stored token', {
      pageId: storedToken.pageId,
      pageName: storedToken.pageName,
      expiresAt: storedToken.expiresAt?.toISOString() || 'Never',
      lastRefreshed: storedToken.lastRefreshed?.toISOString()
    });
    
    // Try to refresh if needed
    const result = await refreshTokenIfNeeded();
    
    if (result) {
      logger.info('Token refreshed successfully', {
        pageId: result.pageId,
        pageName: result.pageName,
        expiresAt: result.expiresAt?.toISOString() || 'Never'
      });
    } else {
      logger.info('Token does not need refresh or refresh not possible');
    }
    
  } catch (error) {
    logger.error('Token refresh check failed', {
      error: error.message,
      stack: error.stack
    });
  }
};

/**
 * Start the token refresh cron job
 * Runs daily at 3 AM
 */
export const startTokenRefreshCron = () => {
  if (cronJob) {
    logger.warn('Token refresh cron job already running');
    return;
  }
  
  // Run daily at 3 AM
  const schedule = process.env.TOKEN_REFRESH_CRON_SCHEDULE || '0 3 * * *';
  
  logger.info('Starting token refresh cron job', { schedule });
  
  cronJob = cron.schedule(schedule, async () => {
    logger.info('Token refresh cron job triggered');
    await checkAndRefreshToken();
  });
  
  // Run once on startup
  setTimeout(() => {
    logger.info('Running initial token refresh check on startup');
    checkAndRefreshToken().catch(error => {
      logger.error('Initial token refresh check failed', {
        error: error.message
      });
    });
  }, 5000); // Wait 5 seconds after startup
  
  logger.info('Token refresh cron job started successfully');
};

/**
 * Stop the token refresh cron job
 */
export const stopTokenRefreshCron = () => {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    logger.info('Token refresh cron job stopped');
  }
};
