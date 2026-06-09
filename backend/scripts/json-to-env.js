#!/usr/bin/env node
/**
 * Convert Google Service Account JSON to .env format
 * 
 * Usage:
 *   node scripts/json-to-env.js path/to/service-account.json
 * 
 * This will print .env format variables that you can copy-paste
 */

import { readFile } from 'fs/promises';

async function main() {
  const jsonPath = process.argv[2];
  
  if (!jsonPath) {
    console.error('❌ Error: Please provide path to JSON key file');
    console.error('\nUsage:');
    console.error('  node scripts/json-to-env.js path/to/service-account.json');
    process.exit(1);
  }

  try {
    const content = await readFile(jsonPath, 'utf-8');
    const credentials = JSON.parse(content);

    console.log('\n# ========================================');
    console.log('# Google Service Account Configuration');
    console.log('# Copy these lines to your .env file');
    console.log('# ========================================\n');

    console.log(`GOOGLE_SERVICE_ACCOUNT_TYPE=${credentials.type || 'service_account'}`);
    console.log(`GOOGLE_SERVICE_ACCOUNT_PROJECT_ID=${credentials.project_id || ''}`);
    console.log(`GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID=${credentials.private_key_id || ''}`);
    console.log(`GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="${credentials.private_key || ''}"`);
    console.log(`GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=${credentials.client_email || ''}`);
    console.log(`GOOGLE_SERVICE_ACCOUNT_CLIENT_ID=${credentials.client_id || ''}`);
    console.log(`GOOGLE_SERVICE_ACCOUNT_AUTH_URI=${credentials.auth_uri || 'https://accounts.google.com/o/oauth2/auth'}`);
    console.log(`GOOGLE_SERVICE_ACCOUNT_TOKEN_URI=${credentials.token_uri || 'https://oauth2.googleapis.com/token'}`);
    console.log(`GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL=${credentials.auth_provider_x509_cert_url || 'https://www.googleapis.com/oauth2/v1/certs'}`);
    console.log(`GOOGLE_SERVICE_ACCOUNT_CLIENT_CERT_URL=${credentials.client_x509_cert_url || ''}`);

    console.log('\n✅ Done! Copy the above lines to your .env file\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
