/**
 * GCP Credentials from Environment Variables
 * 
 * Converts environment variables to Google Service Account JSON format
 * This allows storing credentials in .env instead of JSON files
 */

import { logger } from './logger.js';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Generate service account JSON from environment variables
 * @returns {Object|null} Service account credentials object
 */
export function getCredentialsFromEnv() {
  const {
    GOOGLE_SERVICE_ACCOUNT_TYPE,
    GOOGLE_SERVICE_ACCOUNT_PROJECT_ID,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    GOOGLE_SERVICE_ACCOUNT_CLIENT_ID,
    GOOGLE_SERVICE_ACCOUNT_AUTH_URI,
    GOOGLE_SERVICE_ACCOUNT_TOKEN_URI,
    GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL,
    GOOGLE_SERVICE_ACCOUNT_CLIENT_CERT_URL
  } = process.env;

  // If all env vars are present, construct credentials object
  if (GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL && GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    return {
      type: GOOGLE_SERVICE_ACCOUNT_TYPE || 'service_account',
      project_id: GOOGLE_SERVICE_ACCOUNT_PROJECT_ID,
      private_key_id: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
      private_key: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      client_id: GOOGLE_SERVICE_ACCOUNT_CLIENT_ID,
      auth_uri: GOOGLE_SERVICE_ACCOUNT_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: GOOGLE_SERVICE_ACCOUNT_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: GOOGLE_SERVICE_ACCOUNT_CLIENT_CERT_URL
    };
  }

  return null;
}

/**
 * Write credentials to temporary JSON file for googleapis
 * @returns {Promise<string|null>} Path to temp file, or null if not configured
 */
let cachedCredentialsPath = null;

export async function getCredentialsPath() {
  // Return cached path if already generated
  if (cachedCredentialsPath) {
    return cachedCredentialsPath;
  }
  
  // First check if file path is already provided
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    cachedCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    return cachedCredentialsPath;
  }

  // Otherwise, try to construct from env variables
  const credentials = getCredentialsFromEnv();
  
  if (!credentials) {
    logger.warn('Google service account credentials not configured in environment');
    return null;
  }

  try {
    const tempPath = join(tmpdir(), 'gcp-service-account.json');
    await writeFile(tempPath, JSON.stringify(credentials, null, 2), { mode: 0o600 });
    
    logger.info('Generated temporary credentials file from environment variables');
    
    // Set environment variable for googleapis to use
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tempPath;
    cachedCredentialsPath = tempPath;
    
    // Clean up temp file on exit
    process.once('exit', () => {
      unlink(tempPath).catch(() => {});
    });
    
    return tempPath;
  } catch (error) {
    logger.error('Failed to write temporary credentials file', { error: error.message });
    return null;
  }
}
