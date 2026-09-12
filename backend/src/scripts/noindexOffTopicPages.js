#!/usr/bin/env node
/**
 * Noindex Off-Topic Pages Script
 * 
 * Marks off-topic pages (like school rain alerts) as noindex to improve topical authority
 * Run: node src/scripts/noindexOffTopicPages.js
 */

import { connectDb } from '../config/db.js';
import { Job } from '../models/Job.js';
import { logger } from '../utils/logger.js';

const OFF_TOPIC_SLUGS = [
  'school-holiday-rain-alert-state-wise-district-school-closure-list',
  // Add more off-topic slugs here if needed
];

async function noindexOffTopicPages() {
  try {
    await connectDb();
    logger.info('Connected to database');

    for (const slug of OFF_TOPIC_SLUGS) {
      const job = await Job.findOne({ slug });
      
      if (!job) {
        logger.warn(`Job not found: ${slug}`);
        continue;
      }

      // Update to noindex (or you can delete it)
      job.metaRobots = 'noindex, nofollow';
      job.isActive = false; // Mark as inactive so it doesn't appear in listings
      await job.save();

      logger.info(`✅ Noindexed: ${slug}`);
    }

    logger.info('✅ All off-topic pages processed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error processing off-topic pages:', error);
    process.exit(1);
  }
}

noindexOffTopicPages();
