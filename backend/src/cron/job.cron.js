import cron from 'node-cron';
import { fetchJobNotifications } from '../services/jobSource.service.js';
import { processAndSaveJob } from '../services/job.service.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

let isRunning = false;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const runJobIngestion = async () => {
  if (isRunning) {
    logger.warn('Cron skipped: previous run still in progress');
    return { skippedReason: 'already running' };
  }

  isRunning = true;
  const startedAt = Date.now();
  logger.info('Cron started: fetching job notifications');

  try {
    const notifications = await fetchJobNotifications();
    let created = 0;
    let duplicates = 0;
    let failed = 0;
    let skipped = 0;
    let capped = false;

    for (const job of notifications) {
      // Stop if we've created enough new jobs this run
      if (created >= env.cronMaxNewPerRun) {
        capped = true;
        logger.info('Cron max new jobs cap reached, stopping processing', {
          cap: env.cronMaxNewPerRun,
          processedSoFar: created + duplicates + failed + skipped
        });
        break;
      }

      if (!job?.sourceId || !job?.title || !job?.description || !job?.category) {
        skipped += 1;
        logger.warn('Skipping invalid job payload from source fetch', {
          sourceId: job?.sourceId || 'unknown'
        });
        continue;
      }

      try {
        const result = await processAndSaveJob(job);
        if (result.status === 'created') {
          created += 1;
          // Delay after each NEW job to avoid AI rate limits
          if (env.cronAiDelayMs > 0) {
            await delay(env.cronAiDelayMs);
          }
        } else {
          duplicates += 1;
        }
      } catch (error) {
        failed += 1;
        logger.error('Failed processing job notification', {
          sourceId: job.sourceId,
          error: error.message
        });
      }
    }

    logger.info('Cron completed successfully', {
      fetched: notifications.length,
      created,
      duplicates,
      skipped,
      failed,
      capped,
      durationMs: Date.now() - startedAt
    });

    return {
      fetched: notifications.length,
      created,
      duplicates,
      skipped,
      failed,
      capped,
      durationMs: Date.now() - startedAt
    };
  } catch (error) {
    logger.error('Cron failed', { error: error.message, durationMs: Date.now() - startedAt });
    throw error;
  } finally {
    isRunning = false;
  }
};

export const startCron = () => {
  if (!env.cronEnabled) {
    logger.warn('Cron disabled via CRON_ENABLED=false');
    return;
  }

  cron.schedule(env.cronSchedule, async () => {
    try {
      await runJobIngestion();
    } catch (error) {
      logger.error('Scheduled cron execution failed', { error: error.message });
    }
  });

  logger.info(`Cron scheduler initialized: schedule=${env.cronSchedule}, maxNew=${env.cronMaxNewPerRun}, aiDelay=${env.cronAiDelayMs}ms`);
};
