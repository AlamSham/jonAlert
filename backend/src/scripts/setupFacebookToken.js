#!/usr/bin/env node

/**
 * Facebook Token Setup Script
 * 
 * One-time setup to generate never-expiring page access token
 * Stores token in database for automatic management
 * 
 * Usage: node src/scripts/setupFacebookToken.js
 * 
 * Prerequisites:
 * 1. Get short-lived User Access Token from Facebook Graph API Explorer
 * 2. Grant permissions: pages_manage_posts, pages_read_engagement, pages_show_list
 * 3. Have META_APP_ID and META_APP_SECRET in .env
 * 4. Have META_PAGE_ID in .env
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import readline from 'readline';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import { connectDb } from '../config/db.js';
import { 
  setupLongLivedToken,
  debugToken,
  getStoredToken
} from '../services/facebookToken.service.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Utility functions
const log = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const logError = (message, error) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ ${message}`);
  if (error) {
    console.error(`Error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
  }
};

const logSuccess = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✅ ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const logWarning = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ⚠️  ${message}`);
};

// Prompt user for input
const prompt = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

// Check environment variables
async function checkEnvironment() {
  log('🔍 Checking environment variables...');
  
  const required = [
    { name: 'META_PAGE_ID', value: env.metaPageId },
    { name: 'META_APP_ID', value: env.metaAppId },
    { name: 'META_APP_SECRET', value: env.metaAppSecret }
  ];
  
  let allGood = true;
  
  for (const check of required) {
    if (!check.value) {
      logError(`${check.name} is not set in .env file`);
      allGood = false;
    } else {
      const displayValue = check.name.includes('SECRET') 
        ? `${String(check.value).substring(0, 10)}...` 
        : check.value;
      logSuccess(`${check.name}: ${displayValue}`);
    }
  }
  
  if (!allGood) {
    console.log('\n📝 Please add these to your .env file:');
    console.log('META_APP_ID=your_app_id');
    console.log('META_APP_SECRET=your_app_secret');
    console.log('META_PAGE_ID=your_page_id');
    console.log('\nYou can find these in Facebook Developer Console:');
    console.log('🔗 https://developers.facebook.com/apps/');
    return false;
  }
  
  return true;
}

// Show instructions
function showInstructions() {
  console.log('\n📋 SETUP INSTRUCTIONS');
  console.log('====================\n');
  console.log('This script will help you generate a never-expiring Facebook Page Access Token.');
  console.log('This token will be stored in the database and automatically managed.\n');
  console.log('Steps:');
  console.log('1. Go to Facebook Graph API Explorer:');
  console.log('   🔗 https://developers.facebook.com/tools/explorer/\n');
  console.log('2. Select your app from the dropdown (top right)\n');
  console.log('3. Click "Generate Access Token" button\n');
  console.log('4. Grant these permissions:');
  console.log('   - pages_manage_posts');
  console.log('   - pages_read_engagement');
  console.log('   - pages_show_list\n');
  console.log('5. Copy the User Access Token (it will look like: EAAOA4B3FGbk...)\n');
  console.log('6. Paste it when prompted below\n');
  console.log('⚠️  Note: This is a SHORT-LIVED token. This script will convert it to a NEVER-EXPIRING token.\n');
}

// Check if token already exists
async function checkExistingToken() {
  log('🔍 Checking for existing token in database...');
  
  try {
    const existingToken = await getStoredToken('page', env.metaPageId);
    
    if (existingToken) {
      logWarning('Found existing token in database!');
      log(`📄 Page: ${existingToken.pageName || 'Unknown'}`);
      log(`📅 Last Refreshed: ${existingToken.lastRefreshed?.toISOString()}`);
      log(`🔄 Refresh Count: ${existingToken.refreshCount}`);
      log(`⏰ Expires: ${existingToken.expiresAt?.toISOString() || 'Never'}`);
      
      const answer = await prompt('\n⚠️  Do you want to replace it with a new token? (yes/no): ');
      return answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
    }
    
    log('No existing token found. Proceeding with setup...');
    return true;
  } catch (error) {
    logError('Failed to check existing token', error);
    return true;
  }
}

// Main setup flow
async function main() {
  console.log('🚀 Facebook Token Setup Script');
  console.log('==============================\n');
  
  // Step 1: Connect to database
  log('🔌 Connecting to database...');
  try {
    await connectDb();
    logSuccess('Database connected');
  } catch (error) {
    logError('Database connection failed', error);
    process.exit(1);
  }
  
  // Step 2: Check environment
  const envOk = await checkEnvironment();
  if (!envOk) {
    process.exit(1);
  }
  
  // Step 3: Check existing token
  const shouldProceed = await checkExistingToken();
  if (!shouldProceed) {
    log('Setup cancelled by user');
    process.exit(0);
  }
  
  // Step 4: Show instructions
  showInstructions();
  
  // Step 5: Get short-lived token from user
  const shortLivedToken = await prompt('📝 Paste your SHORT-LIVED User Access Token here: ');
  
  if (!shortLivedToken || shortLivedToken.length < 50) {
    logError('Invalid token provided. Token should be at least 50 characters long.');
    process.exit(1);
  }
  
  log(`\n🔑 Token received: ${shortLivedToken.substring(0, 30)}...`);
  
  // Step 6: Debug the token to check validity
  log('\n🔍 Validating token...');
  try {
    const appAccessToken = `${env.metaAppId}|${env.metaAppSecret}`;
    const tokenInfo = await debugToken(shortLivedToken, appAccessToken);
    
    logSuccess('Token is valid!');
    log(`👤 User ID: ${tokenInfo.userId}`);
    log(`📱 App ID: ${tokenInfo.appId}`);
    log(`🔐 Type: ${tokenInfo.type}`);
    log(`⏰ Expires: ${tokenInfo.expiresAt?.toISOString() || 'Unknown'}`);
    log(`🔑 Scopes: ${tokenInfo.scopes.join(', ')}`);
    
    // Check required scopes
    const requiredScopes = ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'];
    const missingScopes = requiredScopes.filter(scope => !tokenInfo.scopes.includes(scope));
    
    if (missingScopes.length > 0) {
      logWarning(`Missing required scopes: ${missingScopes.join(', ')}`);
      console.log('\n⚠️  Please grant these permissions in Graph API Explorer and try again.');
      process.exit(1);
    }
    
    logSuccess('All required permissions granted!');
  } catch (error) {
    logError('Token validation failed', error);
    console.log('\n💡 Make sure you:');
    console.log('1. Selected the correct app in Graph API Explorer');
    console.log('2. Granted all required permissions');
    console.log('3. Copied the complete token');
    process.exit(1);
  }
  
  // Step 7: Setup long-lived token
  log('\n🔄 Converting to never-expiring token...');
  log('This will:');
  log('1. Exchange short-lived token for long-lived user token (60 days)');
  log('2. Get never-expiring page token from long-lived user token');
  log('3. Store both tokens in database for automatic management\n');
  
  try {
    const result = await setupLongLivedToken(
      shortLivedToken,
      env.metaAppId,
      env.metaAppSecret,
      env.metaPageId
    );
    
    logSuccess('Token setup completed successfully! 🎉\n');
    
    console.log('📊 SETUP SUMMARY');
    console.log('================\n');
    
    console.log('👤 User Token:');
    console.log(`   Token: ${result.userToken.token.substring(0, 30)}...`);
    console.log(`   Expires: ${result.userToken.expiresAt?.toISOString() || 'Unknown'}`);
    console.log(`   Valid for: ~60 days\n`);
    
    console.log('📄 Page Token:');
    console.log(`   Token: ${result.pageToken.token.substring(0, 30)}...`);
    console.log(`   Page ID: ${result.pageToken.pageId}`);
    console.log(`   Page Name: ${result.pageToken.pageName}`);
    console.log(`   Expires: NEVER ✅`);
    console.log(`   Category: ${result.pageToken.category}\n`);
    
    console.log('✅ NEXT STEPS');
    console.log('=============\n');
    console.log('1. Your tokens are now stored in the database');
    console.log('2. The system will automatically use these tokens');
    console.log('3. No need to update .env file anymore!');
    console.log('4. Tokens will be automatically refreshed when needed\n');
    
    console.log('🧪 TEST YOUR SETUP');
    console.log('==================\n');
    console.log('Run these commands to verify everything works:');
    console.log('1. npm run test:facebook');
    console.log('2. npm run test:job-flow:quick\n');
    
    console.log('📝 OPTIONAL: Clean up .env file');
    console.log('================================\n');
    console.log('You can now remove these from .env (optional):');
    console.log('- META_PAGE_ACCESS_TOKEN');
    console.log('- META_USER_ACCESS_TOKEN\n');
    console.log('The system will use database tokens automatically.\n');
    
    logSuccess('Setup complete! 🚀');
    
  } catch (error) {
    logError('Token setup failed', error);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure your app has the correct permissions');
    console.log('2. Verify you are an admin of the Facebook page');
    console.log('3. Check that META_APP_ID and META_APP_SECRET are correct');
    console.log('4. Try generating a new short-lived token');
    process.exit(1);
  }
  
  process.exit(0);
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError('Uncaught Exception:', error);
  process.exit(1);
});

// Run the setup
main().catch((error) => {
  logError('Setup failed', error);
  process.exit(1);
});
