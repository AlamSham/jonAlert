import mongoose from 'mongoose';
import { validateEnv, env } from '../config/env.js';
import { connectDb } from '../config/db.js';
import { Job } from '../models/Job.js';
import { fetchJobNotifications } from '../services/jobSource.service.js';
import { processAndSaveJob } from '../services/job.service.js';
import {
  buildFacebookJobPostMessage,
  buildFacebookJobUrl,
  publishFacebookPost,
  waitForFacebookPostQueue
} from '../services/facebook.service.js';

const args = process.argv.slice(2);

const hasFlag = (name) => args.includes(name);

const readArg = (name, fallback = '') => {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  return args[index + 1] || fallback;
};

const cleanNumber = (value, fallback, min = 1) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min) return fallback;
  return parsed;
};

const limit = cleanNumber(readArg('--limit', '10'), 10);
const dryRun = hasFlag('--dry-run');
const forcePostExisting = hasFlag('--force-post-existing');
const allowSampleFallback = hasFlag('--allow-sample-fallback');

const usage = () => {
  console.log(`
Usage:
  npm run verify:facebook-flow
  npm run verify:facebook-flow -- --limit 20
  npm run verify:facebook-flow -- --dry-run
  npm run verify:facebook-flow -- --force-post-existing

What it checks:
  1. Scrapes configured job sources.
  2. Processes scraped items through the normal DB + AI + notification flow.
  3. Waits for the Facebook queue.
  4. Reads the saved job and prints Facebook post id or exact failure.

Options:
  --limit                 Max scraped candidates to inspect. Default: 10.
  --dry-run               Only scrape and print candidates. No DB or Facebook write.
  --force-post-existing   If no new/retryable scraped item is found, publish one direct
                          Facebook test post using an existing scraped/DB job.
  --allow-sample-fallback Allow posting sample-json fallback data if live sources fail.
`);
};

const summarizeJob = (job) => ({
  id: job?._id ? String(job._id) : undefined,
  title: job?.title,
  slug: job?.slug,
  sourceName: job?.sourceName,
  sourceUrl: job?.sourceUrl,
  publishedAt: job?.publishedAt,
  createdAt: job?.createdAt,
  facebookPostId: job?.facebookPostId || '',
  facebookPostedAt: job?.facebookPostedAt || '',
  facebookPostAttempts: job?.facebookPostAttempts || 0,
  facebookPostLastError: job?.facebookPostLastError || ''
});

const requireFacebookConfig = () => {
  if (!env.facebookAutopostEnabled) {
    throw new Error('FACEBOOK_AUTOPOST_ENABLED=false hai. Isko true karo.');
  }

  if (!env.metaPageId) {
    throw new Error('META_PAGE_ID missing hai.');
  }

  if (!env.metaPageAccessToken && !env.metaUserAccessToken) {
    throw new Error('META_PAGE_ACCESS_TOKEN ya META_USER_ACCESS_TOKEN missing hai.');
  }
};

const findFallbackJob = async (processedJobs) => {
  const existing = processedJobs.find((job) => job?.slug && job?.title);
  if (existing) return existing;

  return Job.findOne({ status: 'active' })
    .sort({ createdAt: -1 })
    .lean();
};

const forceFacebookPost = async (job) => {
  if (!job) {
    throw new Error('Force post ke liye koi existing job nahi mili.');
  }

  const postJob = {
    ...job,
    title: `[Verification] ${job.title}`
  };

  const link = buildFacebookJobUrl(postJob);
  const message = [
    `Facebook flow verification - ${new Date().toISOString()}`,
    '',
    buildFacebookJobPostMessage(postJob)
  ].join('\n');

  const result = await publishFacebookPost({ message, link });
  return {
    mode: 'force-post-existing',
    postId: result?.id,
    job: summarizeJob(job),
    link
  };
};

const inspectProcessedJob = async ({ result, queueDrained }) => {
  const id = result?.job?._id || result?.job?.id;
  const refreshed = id ? await Job.findById(id).lean() : result.job;
  const posted = Boolean(refreshed?.facebookPostId || refreshed?.facebookPostedAt);

  return {
    status: result.status,
    facebookQueueResult: result.facebook || null,
    queueDrained,
    posted,
    job: summarizeJob(refreshed),
    verdict: posted
      ? 'PASS: Facebook post publish ho gaya.'
      : 'FAIL: Job process hua, lekin Facebook post confirm nahi hua.'
  };
};

const main = async () => {
  if (hasFlag('--help') || hasFlag('-h')) {
    usage();
    return;
  }

  validateEnv();
  if (!dryRun) {
    requireFacebookConfig();
    await connectDb();
  }

  console.log('Starting Facebook flow verification...');
  console.log({
    limit,
    dryRun,
    forcePostExisting,
    allowSampleFallback,
    pageId: env.metaPageId,
    frontendUrl: env.frontendUrl,
    graphVersion: env.metaGraphVersion
  });

  const notifications = await fetchJobNotifications();
  const candidates = notifications.slice(0, limit);

  console.log(`Scrape complete: ${notifications.length} usable notifications fetched.`);

  if (!candidates.length) {
    throw new Error('Scrape se koi usable notification nahi mili.');
  }

  if (dryRun) {
    console.log('Dry run candidates:');
    console.table(
      candidates.map((item, index) => ({
        index: index + 1,
        title: item.title.slice(0, 80),
        category: item.category,
        sourceName: item.sourceName,
        publishedAt: item.publishedAt || ''
      }))
    );
    return;
  }

  const sampleFallbackOnly = candidates.every((item) => item.sourceName === 'sample-json');
  if (sampleFallbackOnly && !allowSampleFallback) {
    throw new Error(
      'Live sources se data nahi aaya; sample-json fallback mila. Real Facebook post ke liye live data chahiye, ya --allow-sample-fallback pass karo.'
    );
  }

  const processedJobs = [];
  const skippedDuplicates = [];

  for (const candidate of candidates) {
    console.log(`Processing candidate: ${candidate.title}`);
    const result = await processAndSaveJob(candidate);
    processedJobs.push(result.job);

    if (result.status === 'created' || result.facebook?.queued) {
      const queueDrained = await waitForFacebookPostQueue({
        timeoutMs: env.facebookQueueWaitTimeoutMs
      });
      const report = await inspectProcessedJob({ result, queueDrained });
      console.log('Verification report:');
      console.dir(report, { depth: null });

      if (!report.posted) {
        process.exitCode = 1;
      }
      return;
    }

    skippedDuplicates.push({
      title: result.job?.title,
      slug: result.job?.slug,
      reason: result.facebook?.reason || 'duplicate'
    });
  }

  if (forcePostExisting) {
    const fallbackJob = await findFallbackJob(processedJobs);
    const report = await forceFacebookPost(fallbackJob);
    console.log('Verification report:');
    console.dir({
      ...report,
      verdict: report.postId
        ? 'PASS: Direct Facebook API post publish ho gaya.'
        : 'FAIL: Direct Facebook API post confirm nahi hua.'
    }, { depth: null });
    return;
  }

  console.log('No Facebook post attempted.');
  console.log({
    checkedCandidates: candidates.length,
    skippedDuplicates,
    hint: 'Agar sab duplicate/already-posted hain, --force-post-existing se FB token/API direct verify kar sakte ho.'
  });
  process.exitCode = 2;
};

main()
  .catch((error) => {
    console.error('Facebook flow verification failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
