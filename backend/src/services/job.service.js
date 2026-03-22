import { Job } from '../models/Job.js';
import { rewriteJobWithAi } from './ai.service.js';
import { makeSlug } from '../utils/slugify.js';
import { sendTelegramMessage, buildJobNotificationMessage } from './telegram.service.js';
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

const makeContentFingerprint = (rawJob, aiData) => {
  const title = cleanText(aiData?.rewrittenTitle || rawJob?.title || '');
  const category = cleanText(rawJob?.category || '');
  const sourceUrl = normalizeUrl(rawJob?.sourceUrl || '');
  const summary = cleanText(aiData?.summary || rawJob?.description || '').slice(0, 220);
  const fingerprintBase = `${title}|${category}|${sourceUrl}|${summary}`;
  return crypto.createHash('sha1').update(fingerprintBase).digest('hex');
};

const ensureUniqueSlug = async (baseTitle) => {
  const baseSlug = makeSlug(baseTitle);
  let slug = baseSlug;
  let count = 1;

  while (await Job.exists({ slug })) {
    slug = `${baseSlug}-${count}`;
    count += 1;
  }

  return slug;
};

export const processAndSaveJob = async (rawJob) => {
  const normalizedSourceUrl = normalizeUrl(rawJob.sourceUrl || '');

  const existsBySource = await Job.findOne({ sourceId: rawJob.sourceId }).lean();
  if (existsBySource) {
    return { status: 'duplicate', job: existsBySource };
  }

  const existsByUrl = normalizedSourceUrl ? await Job.findOne({ sourceUrl: normalizedSourceUrl }).lean() : null;
  if (existsByUrl) {
    return { status: 'duplicate', job: existsByUrl };
  }

  const aiData = await rewriteJobWithAi(rawJob);
  const contentFingerprint = makeContentFingerprint(rawJob, aiData);

  const existsByFingerprint = await Job.findOne({ contentFingerprint }).lean();
  if (existsByFingerprint) {
    return { status: 'duplicate', job: existsByFingerprint };
  }

  const MAX_SLUG_RETRIES = 3;
  let saved;

  for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
    try {
      const baseTitle = aiData.rewrittenTitle || rawJob.title;
      const slug = attempt === 0
        ? await ensureUniqueSlug(baseTitle)
        : `${makeSlug(baseTitle)}-${crypto.randomBytes(3).toString('hex')}`;

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
        applyLink: rawJob.sourceUrl || '',
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

  return { status: 'created', job: saved };
};
