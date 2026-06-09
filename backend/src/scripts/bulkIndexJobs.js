/**
 * Bulk Index All Active Jobs to Google
 * 
 * Run this script once to push all existing active jobs to Google Indexing API.
 * This will speed up indexing of your 5000+ jobs.
 * 
 * Usage:
 *   node src/scripts/bulkIndexJobs.js
 * 
 * Prerequisites:
 * 1. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 * 2. Service account must have Indexing API permission
 * 3. Service account email must be added to Search Console as owner
 */

import { connectDb } from '../config/db.js';
import { notifyAllActiveJobs } from '../services/googleIndexing.service.js';
import { logger } from '../utils/logger.js';

async function main() {
  console.log('🚀 Starting bulk Google Indexing API notification...\n');
  
  // Check if credentials are configured (either file or env vars)
  const hasFileCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const hasEnvCredentials = !!(process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
  
  if (!hasFileCredentials && !hasEnvCredentials) {
    console.error('❌ ERROR: Google credentials not configured');
    console.error('\nPlease either:');
    console.error('1. Set GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"');
    console.error('2. OR add GOOGLE_SERVICE_ACCOUNT_* variables to .env\n');
    process.exit(1);
  }
  
  if (hasEnvCredentials) {
    console.log('✅ Using credentials from environment variables');
  } else {
    console.log('✅ Credentials found:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
  }
  
  console.log('📡 Connecting to database...\n');
  
  await connectDb();
  
  console.log('✅ Database connected');
  console.log('📤 Fetching active jobs and notifying Google...\n');
  console.log('⏳ This may take several minutes for large datasets...\n');
  
  const result = await notifyAllActiveJobs();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTS');
  console.log('='.repeat(60));
  
  if (result.success) {
    console.log(`✅ Total jobs processed: ${result.total}`);
    console.log(`✅ Successfully notified: ${result.successful}`);
    console.log(`❌ Failed notifications: ${result.failed}`);
    
    if (result.successful > 0) {
      console.log('\n🎉 Google has been notified!');
      console.log('⏰ Jobs should start appearing in Google Search within 24-48 hours.');
      console.log('📈 Monitor progress in Google Search Console.');
    }
  } else {
    console.log(`❌ Bulk indexing failed: ${result.error}`);
  }
  
  console.log('='.repeat(60) + '\n');
  
  process.exit(result.success ? 0 : 1);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  logger.error('Bulk indexing script failed', { error: error.message, stack: error.stack });
  process.exit(1);
});
