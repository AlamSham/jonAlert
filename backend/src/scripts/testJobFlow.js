#!/usr/bin/env node

/**
 * Manual Job Flow Testing Script
 * 
 * Tests complete flow:
 * 1. Job scraping from RSS feeds
 * 2. AI processing and content enhancement
 * 3. Database saving with duplicate detection
 * 4. Facebook posting with queue management
 * 5. Telegram notifications
 * 
 * Usage: node src/scripts/testJobFlow.js [options]
 * Options:
 *   --source <name>     Test specific source (default: random)
 *   --count <number>    Number of jobs to process (default: 5)
 *   --skip-facebook     Skip Facebook posting test
 *   --skip-telegram     Skip Telegram notification test
 *   --force-post        Force Facebook post even if duplicate
 *   --debug             Enable debug logging
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { connectDb } from '../config/db.js';
import { jobSourceService } from '../services/jobSource.service.js';
import { processAndSaveJob } from '../services/job.service.js';
import { 
  publishFacebookPost, 
  buildFacebookJobPostMessage, 
  buildFacebookJobUrl,
  enqueueFacebookJobPost,
  waitForFacebookPostQueue,
  resolveFacebookPageAccessToken
} from '../services/facebook.service.js';
import { sendTelegramMessage, buildJobNotificationMessage } from '../services/telegram.service.js';
import { Job } from '../models/Job.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  source: null,
  count: 5,
  skipFacebook: false,
  skipTelegram: false,
  forcePost: false,
  debug: false
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--source':
      options.source = args[++i];
      break;
    case '--count':
      options.count = parseInt(args[++i]) || 5;
      break;
    case '--skip-facebook':
      options.skipFacebook = true;
      break;
    case '--skip-telegram':
      options.skipTelegram = true;
      break;
    case '--force-post':
      options.forcePost = true;
      break;
    case '--debug':
      options.debug = true;
      break;
    case '--help':
      console.log(`
Manual Job Flow Testing Script

Usage: node src/scripts/testJobFlow.js [options]

Options:
  --source <name>     Test specific source (default: random)
  --count <number>    Number of jobs to process (default: 5)
  --skip-facebook     Skip Facebook posting test
  --skip-telegram     Skip Telegram notification test
  --force-post        Force Facebook post even if duplicate
  --debug             Enable debug logging
  --help              Show this help message

Examples:
  node src/scripts/testJobFlow.js
  node src/scripts/testJobFlow.js --source "Central UPSC Jobs" --count 3
  node src/scripts/testJobFlow.js --skip-facebook --debug
  node src/scripts/testJobFlow.js --force-post --count 1
      `);
      process.exit(0);
  }
}

// Utility functions
const log = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  if (data && options.debug) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const logError = (message, error) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ ${message}`);
  if (error) {
    console.error(error.message);
    if (options.debug && error.stack) {
      console.error(error.stack);
    }
  }
};

const logSuccess = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✅ ${message}`);
  if (data && options.debug) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const logWarning = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ⚠️  ${message}`);
  if (data && options.debug) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Test functions
async function testDatabaseConnection() {
  log('🔌 Testing database connection...');
  try {
    await connectDb();
    logSuccess('Database connected successfully');
    
    // Test job count
    const jobCount = await Job.countDocuments();
    log(`📊 Current jobs in database: ${jobCount}`);
    
    return true;
  } catch (error) {
    logError('Database connection failed', error);
    return false;
  }
}

async function testFacebookCredentials() {
  if (options.skipFacebook) {
    logWarning('Skipping Facebook credentials test');
    return true;
  }

  log('🔑 Testing Facebook credentials...');
  try {
    // Check environment variables
    if (!env.metaPageId) {
      throw new Error('META_PAGE_ID not configured');
    }
    
    if (!env.metaPageAccessToken && !env.metaUserAccessToken) {
      throw new Error('Neither META_PAGE_ACCESS_TOKEN nor META_USER_ACCESS_TOKEN configured');
    }

    log(`📄 Page ID: ${env.metaPageId}`);
    log(`🔐 Page Access Token: ${env.metaPageAccessToken ? 'Configured' : 'Not configured'}`);
    log(`👤 User Access Token: ${env.metaUserAccessToken ? 'Configured' : 'Not configured'}`);
    log(`🤖 Autopost Enabled: ${env.facebookAutopostEnabled}`);

    // Test token resolution
    const accessToken = await resolveFacebookPageAccessToken();
    logSuccess('Facebook credentials validated successfully');
    log(`🎯 Resolved access token: ${accessToken.substring(0, 20)}...`);
    
    return true;
  } catch (error) {
    logError('Facebook credentials test failed', error);
    return false;
  }
}

async function testTelegramCredentials() {
  if (options.skipTelegram) {
    logWarning('Skipping Telegram credentials test');
    return true;
  }

  log('📱 Testing Telegram credentials...');
  try {
    if (!env.telegramBotToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }
    
    if (!env.telegramChatId) {
      throw new Error('TELEGRAM_CHAT_ID not configured');
    }

    log(`🤖 Bot Token: ${env.telegramBotToken.substring(0, 20)}...`);
    log(`💬 Chat ID: ${env.telegramChatId}`);
    
    logSuccess('Telegram credentials configured');
    return true;
  } catch (error) {
    logError('Telegram credentials test failed', error);
    return false;
  }
}

async function loadJobSources() {
  log('📋 Loading job sources...');
  try {
    const sources = await jobSourceService.loadJobSources();
    logSuccess(`Loaded ${sources.length} job sources`);
    
    if (options.debug) {
      sources.slice(0, 5).forEach((source, index) => {
        log(`  ${index + 1}. ${source.name} (${source.category}, priority: ${source.priority})`);
      });
      if (sources.length > 5) {
        log(`  ... and ${sources.length - 5} more sources`);
      }
    }
    
    return sources;
  } catch (error) {
    logError('Failed to load job sources', error);
    return [];
  }
}

async function selectTestSource(sources) {
  if (options.source) {
    const source = sources.find(s => s.name.toLowerCase().includes(options.source.toLowerCase()));
    if (source) {
      log(`🎯 Using specified source: ${source.name}`);
      return source;
    } else {
      logWarning(`Source "${options.source}" not found, using random source`);
    }
  }

  // Select high-priority sources for better results
  const highPrioritySources = sources.filter(s => s.priority >= 90);
  const selectedSource = highPrioritySources.length > 0 
    ? highPrioritySources[Math.floor(Math.random() * highPrioritySources.length)]
    : sources[Math.floor(Math.random() * sources.length)];
    
  log(`🎲 Using random source: ${selectedSource.name} (priority: ${selectedSource.priority})`);
  return selectedSource;
}

async function scrapeJobsFromSource(source) {
  log(`🕷️  Scraping jobs from: ${source.name}`);
  log(`📡 URL: ${source.url}`);
  
  try {
    const jobs = await jobSourceService.scrapeJobsFromSource(source);
    logSuccess(`Scraped ${jobs.length} jobs from ${source.name}`);
    
    if (jobs.length === 0) {
      logWarning('No jobs found from this source');
      return [];
    }

    // Show sample jobs
    jobs.slice(0, Math.min(3, jobs.length)).forEach((job, index) => {
      log(`  📄 Job ${index + 1}: ${job.title?.substring(0, 80)}...`);
      if (options.debug) {
        log(`     Category: ${job.category}, Source: ${job.sourceName}`);
        log(`     URL: ${job.sourceUrl}`);
      }
    });
    
    return jobs;
  } catch (error) {
    logError(`Failed to scrape jobs from ${source.name}`, error);
    return [];
  }
}

async function processJob(rawJob, index) {
  log(`\n🔄 Processing job ${index + 1}: ${rawJob.title?.substring(0, 60)}...`);
  
  try {
    const result = await processAndSaveJob(rawJob);
    
    switch (result.status) {
      case 'created':
        logSuccess(`Job created successfully: ${result.job.slug}`);
        log(`📝 Title: ${result.job.title}`);
        log(`🏷️  Category: ${result.job.category}`);
        log(`🏢 Organization: ${result.job.organization || 'N/A'}`);
        log(`📍 State: ${result.job.state || 'N/A'}`);
        log(`💼 Vacancies: ${result.job.vacancyCount || 'N/A'}`);
        log(`📅 Last Date: ${result.job.lastDate ? result.job.lastDate.toDateString() : 'N/A'}`);
        
        if (result.facebook) {
          log(`📘 Facebook: ${result.facebook.queued ? 'Queued' : 'Skipped'} (${result.facebook.reason || 'queued'})`);
        }
        break;
        
      case 'duplicate':
        logWarning(`Job is duplicate: ${result.job.slug}`);
        if (result.facebook) {
          log(`📘 Facebook: ${result.facebook.queued ? 'Retry queued' : 'Skipped'} (${result.facebook.reason || 'not eligible'})`);
        }
        break;
        
      default:
        logWarning(`Unknown status: ${result.status}`);
    }
    
    return result;
  } catch (error) {
    logError(`Failed to process job: ${rawJob.title?.substring(0, 60)}`, error);
    return null;
  }
}

async function testDirectFacebookPost(job) {
  if (options.skipFacebook) {
    logWarning('Skipping direct Facebook post test');
    return true;
  }

  log(`\n📘 Testing direct Facebook post for: ${job.title?.substring(0, 60)}...`);
  
  try {
    const message = buildFacebookJobPostMessage(job);
    const link = buildFacebookJobUrl(job);
    
    log('📝 Generated Facebook post:');
    console.log('---');
    console.log(message);
    console.log('---');
    log(`🔗 Link: ${link}`);
    
    // Only post if force-post is enabled or job is new
    if (options.forcePost || !job.facebookPostId) {
      log('🚀 Publishing to Facebook...');
      const result = await publishFacebookPost({ message, link });
      logSuccess(`Facebook post published: ${result.id}`);
      log(`📊 Post ID: ${result.id}`);
      return true;
    } else {
      logWarning('Job already posted to Facebook, use --force-post to override');
      return true;
    }
  } catch (error) {
    logError('Direct Facebook post failed', error);
    return false;
  }
}

async function testTelegramNotification(job) {
  if (options.skipTelegram) {
    logWarning('Skipping Telegram notification test');
    return true;
  }

  log(`\n📱 Testing Telegram notification for: ${job.title?.substring(0, 60)}...`);
  
  try {
    const message = buildJobNotificationMessage(job);
    
    log('📝 Generated Telegram message:');
    console.log('---');
    console.log(message);
    console.log('---');
    
    log('🚀 Sending to Telegram...');
    await sendTelegramMessage(message);
    logSuccess('Telegram notification sent successfully');
    return true;
  } catch (error) {
    logError('Telegram notification failed', error);
    return false;
  }
}

async function waitForFacebookQueue() {
  if (options.skipFacebook) {
    return true;
  }

  log('\n⏳ Waiting for Facebook post queue to complete...');
  
  try {
    const completed = await waitForFacebookPostQueue({ 
      timeoutMs: 120000, // 2 minutes
      pollMs: 1000 
    });
    
    if (completed) {
      logSuccess('Facebook post queue completed');
    } else {
      logWarning('Facebook post queue timed out');
    }
    
    return completed;
  } catch (error) {
    logError('Error waiting for Facebook queue', error);
    return false;
  }
}

async function showSummary(results) {
  log('\n📊 SUMMARY REPORT');
  log('================');
  
  const created = results.filter(r => r?.status === 'created').length;
  const duplicates = results.filter(r => r?.status === 'duplicate').length;
  const failed = results.filter(r => r === null).length;
  
  log(`✅ Jobs Created: ${created}`);
  log(`🔄 Duplicates: ${duplicates}`);
  log(`❌ Failed: ${failed}`);
  log(`📊 Total Processed: ${results.length}`);
  
  // Facebook summary
  if (!options.skipFacebook) {
    const facebookQueued = results.filter(r => r?.facebook?.queued).length;
    log(`📘 Facebook Posts Queued: ${facebookQueued}`);
  }
  
  // Show recent jobs
  const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5).lean();
  log(`\n📋 Recent Jobs in Database:`);
  recentJobs.forEach((job, index) => {
    log(`  ${index + 1}. ${job.title?.substring(0, 60)}... (${job.category})`);
  });
}

// Main execution
async function main() {
  console.log('🚀 Starting Manual Job Flow Test');
  console.log('================================');
  
  log(`⚙️  Test Options:`);
  log(`   Source: ${options.source || 'Random'}`);
  log(`   Count: ${options.count}`);
  log(`   Skip Facebook: ${options.skipFacebook}`);
  log(`   Skip Telegram: ${options.skipTelegram}`);
  log(`   Force Post: ${options.forcePost}`);
  log(`   Debug: ${options.debug}`);
  
  // Step 1: Test database connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    process.exit(1);
  }
  
  // Step 2: Test credentials
  const facebookOk = await testFacebookCredentials();
  const telegramOk = await testTelegramCredentials();
  
  if (!facebookOk && !options.skipFacebook) {
    logError('Facebook credentials failed and not skipped');
    process.exit(1);
  }
  
  if (!telegramOk && !options.skipTelegram) {
    logError('Telegram credentials failed and not skipped');
    process.exit(1);
  }
  
  // Step 3: Load job sources
  const sources = await loadJobSources();
  if (sources.length === 0) {
    logError('No job sources available');
    process.exit(1);
  }
  
  // Step 4: Select and scrape from source
  const selectedSource = await selectTestSource(sources);
  const scrapedJobs = await scrapeJobsFromSource(selectedSource);
  
  if (scrapedJobs.length === 0) {
    logError('No jobs scraped from source');
    process.exit(1);
  }
  
  // Step 5: Process jobs
  const jobsToProcess = scrapedJobs.slice(0, options.count);
  log(`\n🔄 Processing ${jobsToProcess.length} jobs...`);
  
  const results = [];
  for (let i = 0; i < jobsToProcess.length; i++) {
    const result = await processJob(jobsToProcess[i], i);
    results.push(result);
    
    // Add delay between jobs to avoid rate limits
    if (i < jobsToProcess.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Step 6: Test direct Facebook post with first created job
  const firstCreatedJob = results.find(r => r?.status === 'created')?.job;
  if (firstCreatedJob && !options.skipFacebook) {
    await testDirectFacebookPost(firstCreatedJob);
  }
  
  // Step 7: Test Telegram notification with first created job
  if (firstCreatedJob && !options.skipTelegram) {
    await testTelegramNotification(firstCreatedJob);
  }
  
  // Step 8: Wait for Facebook queue
  await waitForFacebookQueue();
  
  // Step 9: Show summary
  await showSummary(results);
  
  logSuccess('Manual job flow test completed!');
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

// Run the test
main().catch((error) => {
  logError('Main execution failed', error);
  process.exit(1);
});