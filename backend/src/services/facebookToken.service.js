/**
 * Facebook Token Management Service
 * 
 * Handles automatic token refresh and long-lived token generation
 * Stores tokens in database to avoid manual .env updates
 */

import axios from 'axios';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Token storage schema
const tokenSchema = new mongoose.Schema({
  type: { type: String, enum: ['page', 'user'], required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date },
  isLongLived: { type: Boolean, default: false },
  pageId: { type: String },
  pageName: { type: String },
  lastRefreshed: { type: Date, default: Date.now },
  refreshCount: { type: Number, default: 0 },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

const FacebookToken = mongoose.model('FacebookToken', tokenSchema);

const graphBaseUrl = () => `https://graph.facebook.com/${env.metaGraphVersion}`;

/**
 * Get long-lived user access token from short-lived token
 */
export const exchangeForLongLivedUserToken = async (shortLivedToken, appId, appSecret) => {
  try {
    const url = `${graphBaseUrl()}/oauth/access_token`;
    const response = await axios.get(url, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortLivedToken
      }
    });

    const { access_token, expires_in } = response.data;
    const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : null;

    logger.info('Exchanged for long-lived user token', {
      expiresIn: expires_in,
      expiresAt: expiresAt?.toISOString()
    });

    return {
      token: access_token,
      expiresAt,
      expiresIn: expires_in
    };
  } catch (error) {
    logger.error('Failed to exchange for long-lived user token', {
      error: error.message,
      response: error.response?.data
    });
    throw error;
  }
};

/**
 * Get never-expiring page access token from user token
 */
export const getPageAccessToken = async (userAccessToken, pageId) => {
  try {
    const url = `${graphBaseUrl()}/me/accounts`;
    const response = await axios.get(url, {
      params: {
        access_token: userAccessToken,
        fields: 'id,name,access_token,category,tasks'
      }
    });

    const pages = response.data.data || [];
    const targetPage = pages.find(page => String(page.id) === String(pageId));

    if (!targetPage) {
      throw new Error(`Page ${pageId} not found in user's managed pages`);
    }

    logger.info('Retrieved page access token', {
      pageId: targetPage.id,
      pageName: targetPage.name,
      category: targetPage.category
    });

    return {
      token: targetPage.access_token,
      pageId: targetPage.id,
      pageName: targetPage.name,
      category: targetPage.category,
      // Page tokens from long-lived user tokens never expire
      expiresAt: null,
      isLongLived: true
    };
  } catch (error) {
    logger.error('Failed to get page access token', {
      error: error.message,
      response: error.response?.data
    });
    throw error;
  }
};

/**
 * Debug token to check expiration and validity
 */
export const debugToken = async (tokenToDebug, appAccessToken) => {
  try {
    const url = `${graphBaseUrl()}/debug_token`;
    const response = await axios.get(url, {
      params: {
        input_token: tokenToDebug,
        access_token: appAccessToken
      }
    });

    const data = response.data.data;
    
    return {
      isValid: data.is_valid,
      expiresAt: data.expires_at ? new Date(data.expires_at * 1000) : null,
      issuedAt: data.issued_at ? new Date(data.issued_at * 1000) : null,
      scopes: data.scopes || [],
      userId: data.user_id,
      appId: data.app_id,
      type: data.type,
      dataAccessExpiresAt: data.data_access_expires_at ? new Date(data.data_access_expires_at * 1000) : null
    };
  } catch (error) {
    logger.error('Failed to debug token', {
      error: error.message,
      response: error.response?.data
    });
    throw error;
  }
};

/**
 * Save token to database
 */
export const saveToken = async (tokenData) => {
  try {
    const filter = { 
      type: tokenData.type,
      ...(tokenData.pageId && { pageId: tokenData.pageId })
    };

    const update = {
      $set: {
        token: tokenData.token,
        expiresAt: tokenData.expiresAt,
        isLongLived: tokenData.isLongLived || false,
        pageName: tokenData.pageName,
        lastRefreshed: new Date(),
        metadata: tokenData.metadata || {}
      },
      $inc: { refreshCount: 1 }
    };

    const result = await FacebookToken.findOneAndUpdate(
      filter,
      update,
      { upsert: true, new: true }
    );

    logger.info('Token saved to database', {
      type: tokenData.type,
      pageId: tokenData.pageId,
      isLongLived: tokenData.isLongLived,
      expiresAt: tokenData.expiresAt?.toISOString()
    });

    return result;
  } catch (error) {
    logger.error('Failed to save token to database', {
      error: error.message
    });
    throw error;
  }
};

/**
 * Get token from database
 */
export const getStoredToken = async (type, pageId = null) => {
  try {
    const filter = { type };
    if (pageId) filter.pageId = pageId;

    const token = await FacebookToken.findOne(filter).sort({ lastRefreshed: -1 });
    
    if (!token) {
      return null;
    }

    // Check if token is expired
    if (token.expiresAt && token.expiresAt < new Date()) {
      logger.warn('Stored token is expired', {
        type: token.type,
        pageId: token.pageId,
        expiresAt: token.expiresAt.toISOString()
      });
      return null;
    }

    return token;
  } catch (error) {
    logger.error('Failed to get stored token', {
      error: error.message
    });
    return null;
  }
};

/**
 * Check if token needs refresh (expires in less than 7 days)
 */
export const needsRefresh = (token) => {
  if (!token.expiresAt) return false; // Never expires
  
  const daysUntilExpiry = (token.expiresAt - new Date()) / (1000 * 60 * 60 * 24);
  return daysUntilExpiry < 7;
};

/**
 * Complete token setup flow
 * Takes a short-lived user token and generates never-expiring page token
 */
export const setupLongLivedToken = async (shortLivedUserToken, appId, appSecret, pageId) => {
  try {
    logger.info('Starting long-lived token setup', { pageId });

    // Step 1: Exchange for long-lived user token
    logger.info('Step 1: Exchanging for long-lived user token...');
    const longLivedUser = await exchangeForLongLivedUserToken(
      shortLivedUserToken,
      appId,
      appSecret
    );

    // Save long-lived user token
    await saveToken({
      type: 'user',
      token: longLivedUser.token,
      expiresAt: longLivedUser.expiresAt,
      isLongLived: true,
      metadata: { expiresIn: longLivedUser.expiresIn }
    });

    // Step 2: Get never-expiring page token
    logger.info('Step 2: Getting never-expiring page token...');
    const pageToken = await getPageAccessToken(longLivedUser.token, pageId);

    // Save page token
    await saveToken({
      type: 'page',
      token: pageToken.token,
      expiresAt: pageToken.expiresAt, // null = never expires
      isLongLived: pageToken.isLongLived,
      pageId: pageToken.pageId,
      pageName: pageToken.pageName,
      metadata: { category: pageToken.category }
    });

    logger.info('Long-lived token setup completed successfully', {
      pageId: pageToken.pageId,
      pageName: pageToken.pageName,
      userTokenExpires: longLivedUser.expiresAt?.toISOString(),
      pageTokenExpires: 'Never'
    });

    return {
      userToken: longLivedUser,
      pageToken: pageToken
    };
  } catch (error) {
    logger.error('Failed to setup long-lived token', {
      error: error.message
    });
    throw error;
  }
};

/**
 * Get valid page access token (from DB or env)
 * Auto-refreshes if needed
 */
export const getValidPageAccessToken = async () => {
  try {
    // Try to get from database first
    const storedToken = await getStoredToken('page', env.metaPageId);
    
    if (storedToken && !needsRefresh(storedToken)) {
      logger.info('Using stored page access token from database', {
        pageId: storedToken.pageId,
        pageName: storedToken.pageName,
        expiresAt: storedToken.expiresAt?.toISOString() || 'Never'
      });
      return storedToken.token;
    }

    // Fall back to env variable
    if (env.metaPageAccessToken) {
      logger.info('Using page access token from environment');
      return env.metaPageAccessToken;
    }

    // Try to resolve from user token
    if (env.metaUserAccessToken) {
      logger.info('Resolving page token from user token');
      const pageToken = await getPageAccessToken(env.metaUserAccessToken, env.metaPageId);
      
      // Save for future use
      await saveToken({
        type: 'page',
        token: pageToken.token,
        expiresAt: pageToken.expiresAt,
        isLongLived: pageToken.isLongLived,
        pageId: pageToken.pageId,
        pageName: pageToken.pageName
      });
      
      return pageToken.token;
    }

    throw new Error('No valid Facebook access token available');
  } catch (error) {
    logger.error('Failed to get valid page access token', {
      error: error.message
    });
    throw error;
  }
};

/**
 * Refresh token if needed
 */
export const refreshTokenIfNeeded = async () => {
  try {
    const storedToken = await getStoredToken('page', env.metaPageId);
    
    if (!storedToken) {
      logger.info('No stored token found, skipping refresh');
      return null;
    }

    if (!needsRefresh(storedToken)) {
      logger.info('Token does not need refresh', {
        expiresAt: storedToken.expiresAt?.toISOString() || 'Never'
      });
      return storedToken;
    }

    logger.info('Token needs refresh, attempting refresh...');
    
    // Get user token to refresh
    const userToken = await getStoredToken('user');
    if (!userToken) {
      logger.warn('No user token available for refresh');
      return null;
    }

    // Get new page token
    const pageToken = await getPageAccessToken(userToken.token, env.metaPageId);
    
    // Save refreshed token
    await saveToken({
      type: 'page',
      token: pageToken.token,
      expiresAt: pageToken.expiresAt,
      isLongLived: pageToken.isLongLived,
      pageId: pageToken.pageId,
      pageName: pageToken.pageName
    });

    logger.info('Token refreshed successfully');
    return pageToken;
  } catch (error) {
    logger.error('Failed to refresh token', {
      error: error.message
    });
    return null;
  }
};

export { FacebookToken };
