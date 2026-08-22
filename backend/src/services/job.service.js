import { Job } from '../models/Job.js';
import { rewriteJobWithAi, getOfficialPortalForOrg } from './ai.service.js';
import { makeSlug } from '../utils/slugify.js';
import { sendTelegramMessage, buildJobNotificationMessage } from './telegram.service.js';
import { enqueueFacebookJobPost } from './facebook.service.js';
import { notifyNewJob } from './googleIndexing.service.js';
import { triggerFrontendRevalidate } from '../utils/revalidateFrontend.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import crypto from 'node:crypto';

const normalizeUrl = (url = '') => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    parsed.searchParams.forEach((_value, key) => {
      if (key.toLowerCase().startsWith('utm_') || key.toLowerCase() === 'ved' || key.toLowerCase() === 'usg') {
        parsed.searchParams.delete(key);
      }
    });
    parsed.hash = '';
    return parsed.toString();
  } catch (_error) {
    return '';
  }
};

const cleanText = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const makeContentFingerprint = (rawJob) => {
  const title = cleanText(rawJob?.title || '');
  const category = cleanText(rawJob?.category || '');
  const sourceUrl = normalizeUrl(rawJob?.sourceUrl || '');
  const description = cleanText(rawJob?.description || '').slice(0, 220);
  const fingerprintBase = `${title}|${category}|${sourceUrl}|${description}`;
  return crypto.createHash('sha1').update(fingerprintBase).digest('hex');
};

const ensureUniqueSlug = async (baseTitle, organization = '') => {
  const baseSlug = makeSlug(baseTitle);
  
  // Check if base slug exists
  const existingBaseJob = await Job.findOne({ slug: baseSlug }).lean();
  if (existingBaseJob) {
    // If base job exists and belongs to same organization or created in last 7 days, treat as duplicate
    const createdTime = existingBaseJob.createdAt ? new Date(existingBaseJob.createdAt).getTime() : 0;
    const isRecent = Date.now() - createdTime < 7 * 24 * 60 * 60 * 1000;
    const isSameOrg = organization && existingBaseJob.organization && 
      cleanText(organization) === cleanText(existingBaseJob.organization);

    if (isRecent || isSameOrg) {
      return { isDuplicate: true, existingJob: existingBaseJob };
    }
  }

  let slug = baseSlug;
  let count = 1;

  while (await Job.exists({ slug })) {
    slug = `${baseSlug}-${count}`;
    count += 1;
  }

  return { isDuplicate: false, slug };
};

const shouldRetryDuplicateFacebookPost = (job) => {
  if (!job || job.facebookPostedAt || job.facebookPostId) return false;

  const windowHours = Number(env.facebookRetryDuplicateWindowHours);
  if (!Number.isFinite(windowHours) || windowHours <= 0) return false;

  const createdAt = job.createdAt ? new Date(job.createdAt).getTime() : 0;
  if (!createdAt || Number.isNaN(createdAt)) return false;

  return Date.now() - createdAt <= windowHours * 60 * 60 * 1000;
};

const enqueueRecentDuplicateFacebookPost = (job, duplicateMatch) => {
  if (!shouldRetryDuplicateFacebookPost(job)) {
    return { queued: false, reason: 'not eligible' };
  }

  const result = enqueueFacebookJobPost(job);
  if (result.queued) {
    logger.info('Facebook autopost queued for recent duplicate job', {
      slug: job.slug,
      duplicateMatch,
      retryWindowHours: env.facebookRetryDuplicateWindowHours
    });
  }

  return result;
};

export const processAndSaveJob = async (rawJob) => {
  const normalizedSourceUrl = normalizeUrl(rawJob.sourceUrl || '');

  const existsBySource = await Job.findOne({ sourceId: rawJob.sourceId }).lean();
  if (existsBySource) {
    const facebook = enqueueRecentDuplicateFacebookPost(existsBySource, 'sourceId');
    return { status: 'duplicate', job: existsBySource, facebook };
  }

  const existsByUrl = normalizedSourceUrl ? await Job.findOne({ sourceUrl: normalizedSourceUrl }).lean() : null;
  if (existsByUrl) {
    const facebook = enqueueRecentDuplicateFacebookPost(existsByUrl, 'sourceUrl');
    return { status: 'duplicate', job: existsByUrl, facebook };
  }

  const contentFingerprint = makeContentFingerprint(rawJob);

  const existsByFingerprint = await Job.findOne({ contentFingerprint }).lean();
  if (existsByFingerprint) {
    const facebook = enqueueRecentDuplicateFacebookPost(existsByFingerprint, 'contentFingerprint');
    return { status: 'duplicate', job: existsByFingerprint, facebook };
  }

  const aiData = await rewriteJobWithAi(rawJob);
  const officialPortal = aiData.officialLink || getOfficialPortalForOrg(aiData.organization, rawJob.title) || rawJob.sourceUrl || '';

  const MAX_SLUG_RETRIES = 3;
  let saved;

  for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
    try {
      const baseTitle = aiData.rewrittenTitle || rawJob.title;
      let slug = '';
      if (attempt === 0) {
        const slugResult = await ensureUniqueSlug(baseTitle, aiData.organization);
        if (slugResult.isDuplicate && slugResult.existingJob) {
          const facebook = enqueueRecentDuplicateFacebookPost(slugResult.existingJob, 'titleSlug');
          return { status: 'duplicate', job: slugResult.existingJob, facebook };
        }
        slug = slugResult.slug;
      } else {
        slug = `${makeSlug(baseTitle)}-${crypto.randomBytes(3).toString('hex')}`;
      }

      saved = await Job.create({
        title: aiData.rewrittenTitle || rawJob.title,
        slug,
        content: aiData.content,
        summary: aiData.summary,
        eligibility: aiData.eligibility,
        importantDates: aiData.importantDates,
        category: rawJob.category,
        state: aiData.state || '',
        organization: aiData.organization || '',
        vacancyCount: aiData.vacancyCount || 0,
        lastDate: aiData.lastDate ? new Date(aiData.lastDate) : undefined,
        qualificationLevel: aiData.qualificationLevel || '',
        applyLink: officialPortal,
        metaTitle: aiData.metaTitle || '',
        metaDescription: aiData.metaDescription || '',
        tags: aiData.tags || [],
        sourceId: rawJob.sourceId,
        contentFingerprint,
        sourceUrl: normalizedSourceUrl,
        sourceName: rawJob.sourceName || '',
        publishedAt: rawJob.publishedAt ? new Date(rawJob.publishedAt) : undefined
      });

      break;
    } catch (error) {
      const isDuplicateSlug = error.code === 11000 && error.message?.includes('slug');
      if (isDuplicateSlug && attempt < MAX_SLUG_RETRIES - 1) {
        continue;
      }
      throw error;
    }
  }

  await sendTelegramMessage(buildJobNotificationMessage(saved));
  const facebook = enqueueFacebookJobPost(saved);

  // Notify Google Indexing API for fast indexing
  notifyNewJob(saved).catch(error => {
    logger.error('Google Indexing API notification failed (non-blocking)', {
      slug: saved.slug,
      error: error.message
    });
  });

  // Trigger Frontend On-Demand ISR Revalidation
  triggerFrontendRevalidate({ slug: saved.slug, category: saved.category }).catch(error => {
    logger.error('Frontend revalidation trigger failed (non-blocking)', {
      slug: saved.slug,
      error: error.message
    });
  });

  return { status: 'created', job: saved, facebook };
};
