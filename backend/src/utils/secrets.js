/**
 * GCP Secret Manager Helper
 * Load secrets from GCP Secret Manager in production
 */

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { logger } from './logger.js';

let secretClient = null;

function getSecretClient() {
  if (!secretClient) {
    secretClient = new SecretManagerServiceClient();
  }
  return secretClient;
}

/**
 * Get secret from GCP Secret Manager
 * @param {string} secretName - Name of the secret
 * @param {string} projectId - GCP project ID
 * @returns {Promise<string>} Secret value
 */
export async function getSecret(secretName, projectId = 'sarkaripulse-backend') {
  try {
    const client = getSecretClient();
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
    
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload.data.toString('utf8');
    
    return payload;
  } catch (error) {
    logger.error('Failed to fetch secret from Secret Manager', {
      secretName,
      error: error.message
    });
    throw error;
  }
}

/**
 * Write secret to temp file for googleapis to use
 * @param {string} secretContent - JSON key content
 * @returns {string} Path to temp file
 */
export async function writeSecretToTempFile(secretContent) {
  const { writeFile } = await import('fs/promises');
  const { tmpdir } = await import('os');
  const { join } = await import('path');
  
  const tempPath = join(tmpdir(), 'gcp-indexing-key.json');
  await writeFile(tempPath, secretContent, { mode: 0o600 });
  
  return tempPath;
}
