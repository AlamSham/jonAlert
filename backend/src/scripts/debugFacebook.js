#!/usr/bin/env node

/**
 * Facebook Integration Debug Script
 * 
 * Comprehensive Facebook API testing and debugging tool
 * Tests all Facebook-related functionality step by step
 * 
 * Usage: node src/scripts/debugFacebook.js [options]
 * Options:
 *   --test-token        Test access token resolution
 *   --test-permissions  Test page permissions
 *   --test-post         Test posting capability
 *   --test-queue        Test queue system
 *   --check-page        Check page information
 *   --verbose           Enable verbose logging
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import { connectDb } from '../config/db.js';
import { 
  resolveFacebookPageAccessToken,
  publishFacebookPost,
  buildFacebookJobPostMessage,
  buildFacebookJobUrl,
  enqueueFacebookJobPost,
  waitForFacebookPostQueue
} from '../services/facebook.service.js';
import { Job } from '../models/Job.js';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  testToken: false,
  testPermissions: false,
  testPost: false,
  testQueue: false,
  checkPage: false,
  verbose: false
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--test-token':
      options.testToken = true;
      break;
    case '--test-permissions':
      options.testPermissions = true;
      break;
    case '--test-post':
      options.testPost = true;
      break;
    case '--test-queue':
      options.testQueue = true;
      break;
    case '--check-page':
      options.checkPage = true;
      break;
    case '--verbose':
      options.verbose = true;
      break;
    case '--all':
      options.testToken = true;
      options.testPermissions = true;
      options.testPost = true;
      options.testQueue = true;
      options.checkPage = true;
      break;
    case '--help':
      console.log(`
Facebook Integration Debug Script

Usage: node src/scripts/debugFacebook.js [options]

Options:
  --test-token        Test access token resolution
  --test-permissions  Test page permissions
  --test-post         Test posting capability
  --test-queue        Test queue system
  --check-page        Check page information
  --verbose           Enable verbose logging
  --all               Run all tests
  --help              Show this help message

Examples:
  node src/scripts/debugFacebook.js --all
  node src/scripts/debugFacebook.js --test-token --verbose
  node src/scripts/debugFacebook.js --test-post
      `);
      process.exit(0);
  }
}

// If no specific tests selected, run all
if (!options.testToken && !options.testPermissions && !options.testPost && !options.testQueue && !options.checkPage) {
  options.testToken = true;
  options.testPermissions = true;
  options.testPost = true;
  options.testQueue = true;
  options.checkPage = true;
}

// Utility functions
const log = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  if (data && options.verbose) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const logError = (message, error) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ ${message}`);
  if (error) {
    console.error(`Error: ${error.message}`);
    if (options.verbose && error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
};

const logSuccess = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✅ ${message}`);
  if (data && options.verbose) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const logWarning = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ⚠️  ${message}`);
  if (data && options.verbose) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Facebook API helper
const graphBaseUrl = () => `https://graph.facebook.com/${env.metaGraphVersion}`;

const makeGraphRequest = async (endpoint, options = {}) => {
  try {
    const url = `${graphBaseUrl()}${endpoint}`;
    log(`🌐 Making request to: ${url}`);
    
    const response = await axios({
      timeout: 15000,
      ...options,
      url
    });
    
    return response.data;
  } catch (error) {
    const apiError = error.response?.data?.error;
    const wrapped = new Error(apiError?.message || error.message);
    wrapped.status = error.response?.status;
    wrapped.type = apiError?.type;
    wrapped.code = apiError?.code;
    wrapped.subcode = apiError?.error_subcode;
    wrapped.response = error.response?.data;
    throw wrapped;
  }
};

// Test functions
async function checkEnvironmentVariables() {
  log('🔍 Checking environment variables...');
  
  const checks = [
    { name: 'META_PAGE_ID', value: env.metaPageId, required: true },
    { name: 'META_PAGE_ACCESS_TOKEN', value: env.metaPageAccessToken, required: false },
    { name: 'META_USER_ACCESS_TOKEN', value: env.metaUserAccessToken, required: false },
    { name: 'META_GRAPH_VERSION', value: env.metaGraphVersion, required: true },
    { name: 'FACEBOOK_AUTOPOST_ENABLED', value: env.facebookAutopostEnabled, required: false },
    { name: 'FRONTEND_URL', value: env.frontendUrl, required: true }
  ];
  
  let allGood = true;
  
  checks.forEach(check => {
    if (check.required && !check.value) {
      logError(`❌ ${check.name} is required but not set`);
      allGood = false;
    } else if (check.value) {
      const displayValue = check.name.includes('TOKEN') 
        ? `${String(check.value).substring(0, 20)}...` 
        : check.value;
      logSuccess(`✅ ${check.name}: ${displayValue}`);
    } else {
      logWarning(`⚠️  ${check.name}: Not set (optional)`);
    }
  });
  
  if (!env.metaPageAccessToken && !env.metaUserAccessToken) {
    logError('❌ Either META_PAGE_ACCESS_TOKEN or META_USER_ACCESS_TOKEN must be set');
    allGood = false;
  }
  
  return allGood;
}

async function testAccessTokenResolution() {
  if (!options.testToken) return true;
  
  log('\n🔑 Testing access token resolution...');
  
  try {
    const accessToken = await resolveFacebookPageAccessToken();
    logSuccess('Access token resolved successfully');
    log(`🎯 Token: ${accessToken.substring(0, 30)}...`);
    return accessToken;
  } catch (error) {
    logError('Access token resolution failed', error);
    return null;
  }
}

async function checkPageInformation(accessToken) {
  if (!options.checkPage || !accessToken) return true;
  
  log('\n📄 Checking page information...');
  
  try {
    const pageInfo = await makeGraphRequest(`/${env.metaPageId}`, {
      method: 'GET',
      params: {
        fields: 'id,name,category,about,website,fan_count,talking_about_count,access_token',
        access_token: accessToken
      }
    });
    
    logSuccess('Page information retrieved');
    log(`📝 Page Name: ${pageInfo.name}`);
    log(`🏷️  Category: ${pageInfo.category}`);
    log(`👥 Followers: ${pageInfo.fan_count || 'N/A'}`);
    log(`💬 Talking About: ${pageInfo.talking_about_count || 'N/A'}`);
    log(`🌐 Website: ${pageInfo.website || 'N/A'}`);
    
    if (options.verbose) {
      log('Full page info:', pageInfo);
    }
    
    return true;
  } catch (error) {
    logError('Failed to get page information', error);
    return false;
  }
}

async function testPagePermissions(accessToken) {
  if (!options.testPermissions || !accessToken) return true;
  
  log('\n🔐 Testing page permissions...');
  
  try {
    // Test if we can read the page
    const pageData = await makeGraphRequest(`/${env.metaPageId}`, {
      method: 'GET',
      params: {
        fields: 'id,name',
        access_token: accessToken
      }
    });
    
    logSuccess(`Can read page: ${pageData.name}`);
    
    // Test if we can read the feed
    try {
      const feedData = await makeGraphRequest(`/${env.metaPageId}/feed`, {
        method: 'GET',
        params: {
          limit: 1,
          access_token: accessToken
        }
      });
      
      logSuccess('Can read page feed');
      log(`📊 Recent posts: ${feedData.data?.length || 0}`);
    } catch (feedError) {
      logWarning('Cannot read page feed (might be normal)', feedError);
    }
    
    return true;
  } catch (error) {
    logError('Page permissions test failed', error);
    return false;
  }
}

async function testPostingCapability(accessToken) {
  if (!options.testPost || !accessToken) return true;
  
  log('\n📝 Testing posting capability...');
  
  // Create a test job object
  const testJob = {
    _id: 'test-job-id',
    title: '🧪 Test Job Posting - SarkariPulse Debug Script',
    slug: 'test-job-posting-debug',
    category: 'job',
    summary: 'This is a test job posting created by the debug script to verify Facebook integration is working correctly.',
    organization: 'SarkariPulse Test Organization',
    state: 'Test State',
    vacancyCount: 100,
    lastDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    createdAt: new Date()
  };
  
  try {
    // Generate message and URL
    const message = buildFacebookJobPostMessage(testJob);
    const link = buildFacebookJobUrl(testJob);
    
    log('📝 Generated test post:');
    console.log('---');
    console.log(message);
    console.log('---');
    log(`🔗 Link: ${link}`);
    
    // Ask for confirmation before posting
    console.log('\n⚠️  This will create an actual post on your Facebook page!');
    console.log('Press Ctrl+C to cancel, or any key to continue...');
    
    // Wait for user input (in a real scenario, you might want to skip this)
    // For automated testing, we'll skip the actual posting
    logWarning('Skipping actual post creation to avoid spam');
    logSuccess('Post generation and formatting test passed');
    
    return true;
  } catch (error) {
    logError('Post capability test failed', error);
    return false;
  }
}

async function testQueueSystem() {
  if (!options.testQueue) return true;
  
  log('\n🔄 Testing queue system...');
  
  try {
    await connectDb();
    
    // Get a recent job from database
    const recentJob = await Job.findOne().sort({ createdAt: -1 }).lean();
    
    if (!recentJob) {
      logWarning('No jobs in database to test queue system');
      return true;
    }
    
    log(`📄 Testing with job: ${recentJob.title?.substring(0, 50)}...`);
    
    // Test enqueueing
    const queueResult = enqueueFacebookJobPost(recentJob);
    
    if (queueResult.queued) {
      logSuccess(`Job queued successfully (queue length: ${queueResult.queueLength})`);
      
      // Wait for queue to process
      log('⏳ Waiting for queue to process...');
      const completed = await waitForFacebookPostQueue({ 
        timeoutMs: 30000, 
        pollMs: 1000 
      });
      
      if (completed) {
        logSuccess('Queue processing completed');
      } else {
        logWarning('Queue processing timed out');
      }
    } else {
      logWarning(`Job not queued: ${queueResult.reason}`);
    }
    
    return true;
  } catch (error) {
    logError('Queue system test failed', error);
    return false;
  }
}

async function showDiagnosticInfo() {
  log('\n🔍 DIAGNOSTIC INFORMATION');
  log('========================');
  
  // Environment info
  log(`🌍 Environment: ${env.nodeEnv}`);
  log(`🔗 Frontend URL: ${env.frontendUrl}`);
  log(`📊 Graph API Version: ${env.metaGraphVersion}`);
  
  // Facebook settings
  log(`\n📘 Facebook Settings:`);
  log(`   Autopost Enabled: ${env.facebookAutopostEnabled}`);
  log(`   Post Delay: ${env.facebookPostDelayMs}ms`);
  log(`   Retry Delay: ${env.facebookPostRetryDelayMs}ms`);
  log(`   Max Retries: ${env.facebookPostMaxRetries}`);
  log(`   Request Timeout: ${env.facebookRequestTimeoutMs}ms`);
  
  // Database info
  try {
    await connectDb();
    const jobCount = await Job.countDocuments();
    const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(3).lean();
    
    log(`\n📊 Database Info:`);
    log(`   Total Jobs: ${jobCount}`);
    log(`   Recent Jobs:`);
    recentJobs.forEach((job, index) => {
      log(`     ${index + 1}. ${job.title?.substring(0, 50)}... (${job.category})`);
      log(`        Facebook Posted: ${job.facebookPostId ? 'Yes' : 'No'}`);
      log(`        Created: ${job.createdAt?.toISOString()}`);
    });
  } catch (error) {
    logError('Failed to get database info', error);
  }
}

// Main execution
async function main() {
  console.log('🔍 Facebook Integration Debug Script');
  console.log('===================================');
  
  log(`🎯 Running tests: ${Object.entries(options).filter(([k, v]) => v && k !== 'verbose').map(([k]) => k).join(', ')}`);
  
  // Step 1: Check environment variables
  const envOk = await checkEnvironmentVariables();
  if (!envOk) {
    logError('Environment check failed');
    process.exit(1);
  }
  
  // Step 2: Test access token resolution
  const accessToken = await testAccessTokenResolution();
  
  // Step 3: Check page information
  await checkPageInformation(accessToken);
  
  // Step 4: Test permissions
  await testPagePermissions(accessToken);
  
  // Step 5: Test posting capability
  await testPostingCapability(accessToken);
  
  // Step 6: Test queue system
  await testQueueSystem();
  
  // Step 7: Show diagnostic info
  await showDiagnosticInfo();
  
  logSuccess('Facebook debug script completed!');
  
  // Recommendations
  log('\n💡 RECOMMENDATIONS');
  log('==================');
  
  if (!accessToken) {
    log('❌ Fix access token issues first');
  } else {
    log('✅ Access token is working');
  }
  
  if (env.facebookAutopostEnabled) {
    log('✅ Autopost is enabled');
  } else {
    log('⚠️  Autopost is disabled - enable with FACEBOOK_AUTOPOST_ENABLED=true');
  }
  
  log('🔧 To test the complete flow, run: node src/scripts/testJobFlow.js');
  
  process.exit(0);
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection at:', promise);
  logError('Reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError('Uncaught Exception:', error);
  process.exit(1);
});

// Run the debug script
main().catch((error) => {
  logError('Main execution failed', error);
  process.exit(1);
});