/**
 * Test Google Indexing API with a Single URL
 * 
 * This script tests if Google Indexing API is working correctly
 * by notifying Google about a single URL.
 */

import { connectDb } from '../config/db.js';
import { notifyGoogle } from '../services/googleIndexing.service.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

async function main() {
  console.log('🧪 Testing Google Indexing API with single URL...\n');
  
  // Check if credentials are configured
  const hasEnvCredentials = !!(process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
  
  if (!hasEnvCredentials) {
    console.error('❌ ERROR: Google credentials not configured in .env');
    process.exit(1);
  }
  
  console.log('✅ Credentials found in environment variables');
  console.log('📡 Connecting to database...\n');
  
  await connectDb();
  console.log('✅ Database connected\n');
  
  // Get one active job
  const { Job } = await import('../models/Job.js');
  const testJob = await Job.findOne({ status: 'active' }).select('slug title').lean();
  
  if (!testJob) {
    console.error('❌ No active jobs found in database');
    process.exit(1);
  }
  
  const testUrl = `${env.frontendUrl}/job/${testJob.slug}`;
  
  console.log('📤 Testing with URL:');
  console.log(`   ${testUrl}`);
  console.log(`   Job: ${testJob.title}\n`);
  
  console.log('⏳ Sending notification to Google...\n');
  
  const result = await notifyGoogle(testUrl, 'URL_UPDATED');
  
  console.log('='.repeat(60));
  console.log('📊 RESULT');
  console.log('='.repeat(60));
  
  if (result.success) {
    console.log('✅ SUCCESS! Google Indexing API is working!');
    console.log(`   Status Code: ${result.statusCode}`);
    console.log(`   URL notified: ${testUrl}`);
    console.log('\n🎉 Your setup is correct!');
    console.log('⏰ This URL should appear in Google within 24-48 hours.');
    console.log('\n💡 You can now run the bulk script to push all jobs:');
    console.log('   node src/scripts/bulkIndexJobs.js');
  } else {
    console.log('❌ FAILED');
    console.log(`   Error: ${result.error}`);
    console.log(`   Code: ${result.code}`);
    
    if (result.code === 403) {
      console.log('\n⚠️  403 Forbidden Error');
      console.log('   This usually means:');
      console.log('   1. Service account needs "Indexing API" permission in GCP');
      console.log('   2. OR API is not enabled in GCP Console');
      console.log('\n   Check: https://console.cloud.google.com/apis/library/indexing.googleapis.com');
    } else if (result.code === 429) {
      console.log('\n⚠️  429 Quota Exceeded');
      console.log('   Daily quota of 200 requests already used.');
      console.log('   Try again tomorrow after 12:30 PM IST.');
    }
  }
  
  console.log('='.repeat(60) + '\n');
  
  process.exit(result.success ? 0 : 1);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  logger.error('Test script failed', { error: error.message, stack: error.stack });
  process.exit(1);
});
