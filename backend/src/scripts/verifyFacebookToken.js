#!/usr/bin/env node

/**
 * Facebook Token Verification Script
 * 
 * Checks the status of stored Facebook tokens
 * Shows expiration dates, refresh counts, and validity
 * 
 * Usage: node src/scripts/verifyFacebookToken.js
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { connectDb } from '../config/db.js';
import { 
  getStoredToken,
  debugToken,
  needsRefresh
} from '../services/facebookToken.service.js';
import { env } from '../config/env.js';

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
  }
};

const logSuccess = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✅ ${message}`);
};

const logWarning = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ⚠️  ${message}`);
};

// Format date for display
const formatDate = (date) => {
  if (!date) return 'Never';
  const now = new Date();
  const diff = date - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days < 0) {
    return `${date.toISOString()} (EXPIRED ${Math.abs(days)} days ago)`;
  } else if (days === 0) {
    return `${date.toISOString()} (Expires TODAY)`;
  } else if (days < 7) {
    return `${date.toISOString()} (Expires in ${days} days - NEEDS REFRESH)`;
  } else {
    return `${date.toISOString()} (Expires in ${days} days)`;
  }
};

// Check token validity via API
async function checkTokenValidity(token, tokenType) {
  if (!env.metaAppId || !env.metaAppSecret) {
    logWarning('META_APP_ID or META_APP_SECRET not set, skipping API validation');
    return null;
  }
  
  try {
    const appAccessToken = `${env.metaAppId}|${env.metaAppSecret}`;
    const tokenInfo = await debugToken(token, appAccessToken);
    
    return tokenInfo;
  } catch (error) {
    logError(`Failed to validate ${tokenType} token via API`, error);
    return null;
  }
}

// Main verification
async function main() {
  console.log('🔍 Facebook Token Verification');
  console.log('==============================\n');
  
  // Connect to database
  log('🔌 Connecting to database...');
  try {
    await connectDb();
    logSuccess('Database connected');
  } catch (error) {
    logError('Database connection failed', error);
    process.exit(1);
  }
  
  // Check environment
  log('\n📋 Environment Configuration:');
  log(`   META_PAGE_ID: ${env.metaPageId || 'NOT SET'}`);
  log(`   META_APP_ID: ${env.metaAppId ? 'SET' : 'NOT SET'}`);
  log(`   META_APP_SECRET: ${env.metaAppSecret ? 'SET' : 'NOT SET'}`);
  log(`   META_PAGE_ACCESS_TOKEN: ${env.metaPageAccessToken ? 'SET (legacy)' : 'NOT SET'}`);
  log(`   META_USER_ACCESS_TOKEN: ${env.metaUserAccessToken ? 'SET (legacy)' : 'NOT SET'}`);
  
  // Check stored page token
  log('\n📄 Checking Stored Page Token...');
  const pageToken = await getStoredToken('page', env.metaPageId);
  
  if (!pageToken) {
    logWarning('No page token found in database');
    console.log('\n💡 To setup automatic token management, run:');
    console.log('   npm run setup:facebook-token\n');
  } else {
    logSuccess('Page token found in database');
    console.log('\n📊 Page Token Details:');
    console.log(`   Page ID: ${pageToken.pageId}`);
    console.log(`   Page Name: ${pageToken.pageName || 'Unknown'}`);
    console.log(`   Token: ${pageToken.token.substring(0, 30)}...`);
    console.log(`   Expires: ${formatDate(pageToken.expiresAt)}`);
    console.log(`   Long-Lived: ${pageToken.isLongLived ? 'Yes' : 'No'}`);
    console.log(`   Last Refreshed: ${pageToken.lastRefreshed?.toISOString() || 'Unknown'}`);
    console.log(`   Refresh Count: ${pageToken.refreshCount || 0}`);
    console.log(`   Needs Refresh: ${needsRefresh(pageToken) ? 'YES ⚠️' : 'NO ✅'}`);
    
    // Validate via API
    log('\n🔍 Validating page token via Facebook API...');
    const pageTokenInfo = await checkTokenValidity(pageToken.token, 'page');
    
    if (pageTokenInfo) {
      logSuccess('Page token is valid');
      console.log(`   Valid: ${pageTokenInfo.isValid ? 'YES ✅' : 'NO ❌'}`);
      console.log(`   Type: ${pageTokenInfo.type}`);
      console.log(`   User ID: ${pageTokenInfo.userId}`);
      console.log(`   App ID: ${pageTokenInfo.appId}`);
      console.log(`   Scopes: ${pageTokenInfo.scopes.join(', ')}`);
      console.log(`   Expires: ${formatDate(pageTokenInfo.expiresAt)}`);
      console.log(`   Data Access Expires: ${formatDate(pageTokenInfo.dataAccessExpiresAt)}`);
    }
  }
  
  // Check stored user token
  log('\n👤 Checking Stored User Token...');
  const userToken = await getStoredToken('user');
  
  if (!userToken) {
    logWarning('No user token found in database');
  } else {
    logSuccess('User token found in database');
    console.log('\n📊 User Token Details:');
    console.log(`   Token: ${userToken.token.substring(0, 30)}...`);
    console.log(`   Expires: ${formatDate(userToken.expiresAt)}`);
    console.log(`   Long-Lived: ${userToken.isLongLived ? 'Yes' : 'No'}`);
    console.log(`   Last Refreshed: ${userToken.lastRefreshed?.toISOString() || 'Unknown'}`);
    console.log(`   Refresh Count: ${userToken.refreshCount || 0}`);
    console.log(`   Needs Refresh: ${needsRefresh(userToken) ? 'YES ⚠️' : 'NO ✅'}`);
    
    // Validate via API
    log('\n🔍 Validating user token via Facebook API...');
    const userTokenInfo = await checkTokenValidity(userToken.token, 'user');
    
    if (userTokenInfo) {
      logSuccess('User token is valid');
      console.log(`   Valid: ${userTokenInfo.isValid ? 'YES ✅' : 'NO ❌'}`);
      console.log(`   Type: ${userTokenInfo.type}`);
      console.log(`   User ID: ${userTokenInfo.userId}`);
      console.log(`   App ID: ${userTokenInfo.appId}`);
      console.log(`   Scopes: ${userTokenInfo.scopes.join(', ')}`);
      console.log(`   Expires: ${formatDate(userTokenInfo.expiresAt)}`);
    }
  }
  
  // Summary and recommendations
  console.log('\n📊 SUMMARY');
  console.log('==========\n');
  
  if (!pageToken && !userToken) {
    logWarning('No tokens found in database');
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Run: npm run setup:facebook-token');
    console.log('2. Follow the interactive setup wizard');
    console.log('3. Your tokens will be stored in database');
    console.log('4. No more manual token updates needed!\n');
  } else if (pageToken && !pageToken.expiresAt) {
    logSuccess('You have a never-expiring page token! 🎉');
    console.log('\n✅ Your setup is optimal:');
    console.log('- Page token never expires');
    console.log('- Automatic token management enabled');
    console.log('- No manual intervention needed\n');
  } else if (pageToken && needsRefresh(pageToken)) {
    logWarning('Your page token needs refresh soon');
    console.log('\n⚠️  ACTION REQUIRED:');
    console.log('- Token expires in less than 7 days');
    console.log('- Automatic refresh will attempt soon');
    console.log('- Or run: npm run setup:facebook-token to get new token\n');
  } else if (pageToken) {
    logSuccess('Your page token is healthy');
    console.log('\n✅ Everything looks good:');
    console.log('- Token is valid');
    console.log('- Automatic refresh enabled');
    console.log('- No action needed\n');
  }
  
  // Test commands
  console.log('🧪 TEST COMMANDS');
  console.log('================\n');
  console.log('Test Facebook integration:');
  console.log('  npm run test:facebook\n');
  console.log('Test complete job flow:');
  console.log('  npm run test:job-flow:quick\n');
  console.log('Setup new token:');
  console.log('  npm run setup:facebook-token\n');
  
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

// Run verification
main().catch((error) => {
  logError('Verification failed', error);
  process.exit(1);
});
