import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const categoryLabels = {
  job: 'Sarkari Naukri',
  result: 'Sarkari Result',
  'admit-card': 'Admit Card',
  admission: 'Admission',
  scholarship: 'Scholarship',
  'exam-form': 'Exam Form'
};

const postQueue = [];
const queuedKeys = new Set();
let isQueueRunning = false;
let resolvedPageAccessToken = env.metaPageAccessToken;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cleanNumber = (value, fallback, min = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min) return fallback;
  return parsed;
};

const graphBaseUrl = () => `https://graph.facebook.com/${env.metaGraphVersion}`;

const normalizeBaseUrl = () => env.frontendUrl.replace(/\/+$/, '');

export const buildFacebookJobUrl = (job) => {
  const baseUrl = normalizeBaseUrl();
  return `${baseUrl}/job/${encodeURIComponent(job.slug)}`;
};

const truncate = (value = '', max = 260) => {
  const text = String(value).replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3).trim()}...`;
};

const formatDate = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const buildFacebookJobPostMessage = (job) => {
  const category = categoryLabels[job.category] || 'Sarkari Update';
  const lines = [
    `New ${category} Update`,
    '',
    job.title,
    job.summary ? `\n${truncate(job.summary, 240)}` : '',
    job.organization ? `Organization: ${job.organization}` : '',
    job.state ? `State: ${job.state}` : '',
    job.vacancyCount > 0 ? `Vacancies: ${job.vacancyCount}` : '',
    job.lastDate ? `Last Date: ${formatDate(job.lastDate)}` : '',
    '',
    'Full details, eligibility, dates aur apply link website par check karein.',
    '',
    `#SarkariPulse #${String(job.category || 'update').replace(/-/g, '')} #GovtJobs`
  ];

  return lines.filter(Boolean).join('\n');
};

const isConfigured = () =>
  Boolean(env.metaPageId && (resolvedPageAccessToken || env.metaUserAccessToken));

const requestJson = async (url, options = {}) => {
  try {
    const response = await axios({
      timeout: cleanNumber(env.facebookRequestTimeoutMs, 15000, 1000),
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
    throw wrapped;
  }
};

export const resolveFacebookPageAccessToken = async () => {
  if (resolvedPageAccessToken) return resolvedPageAccessToken;

  if (!env.metaUserAccessToken) {
    throw new Error('META_PAGE_ACCESS_TOKEN or META_USER_ACCESS_TOKEN is required');
  }

  let url = new URL(`${graphBaseUrl()}/me/accounts`);
  url.searchParams.set('fields', 'id,name,access_token');
  url.searchParams.set('limit', '100');
  url.searchParams.set('access_token', env.metaUserAccessToken);

  for (let page = 0; page < 5 && url; page += 1) {
    const data = await requestJson(url.toString(), { method: 'GET' });
    const match = data?.data?.find((item) => String(item.id) === String(env.metaPageId));

    if (match?.access_token) {
      resolvedPageAccessToken = match.access_token;
      logger.info('Resolved Facebook Page access token', {
        pageId: env.metaPageId,
        pageName: match.name
      });
      return resolvedPageAccessToken;
    }

    url = data?.paging?.next ? new URL(data.paging.next) : null;
  }

  throw new Error('Could not resolve Facebook Page access token from META_USER_ACCESS_TOKEN');
};

export const publishFacebookPost = async ({ message, link }) => {
  if (!env.metaPageId) {
    throw new Error('META_PAGE_ID is required');
  }

  const accessToken = await resolveFacebookPageAccessToken();
  const body = new URLSearchParams();
  body.set('access_token', accessToken);

  if (message) body.set('message', message);
  if (link) body.set('link', link);

  if (!body.has('message') && !body.has('link')) {
    throw new Error('Facebook post requires message or link');
  }

  return requestJson(`${graphBaseUrl()}/${env.metaPageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: body
  });
};

const serializeJobForQueue = (job) => ({
  id: String(job._id || job.id || job.slug),
  title: job.title,
  slug: job.slug,
  category: job.category,
  summary: job.summary,
  organization: job.organization,
  state: job.state,
  vacancyCount: job.vacancyCount,
  lastDate: job.lastDate,
  createdAt: job.createdAt
});

const processQueue = async () => {
  if (isQueueRunning) return;
  isQueueRunning = true;

  const postDelayMs = cleanNumber(env.facebookPostDelayMs, 10000);
  const retryDelayMs = cleanNumber(env.facebookPostRetryDelayMs, 30000);
  const maxRetries = cleanNumber(env.facebookPostMaxRetries, 3, 1);

  try {
    while (postQueue.length > 0) {
      const item = postQueue[0];

      try {
        if (postDelayMs > 0) {
          await delay(postDelayMs);
        }

        const link = buildFacebookJobUrl(item.job);
        const message = buildFacebookJobPostMessage(item.job);
        const result = await publishFacebookPost({ message, link });

        logger.info('Facebook job post published', {
          slug: item.job.slug,
          postId: result?.id,
          queueRemaining: Math.max(0, postQueue.length - 1)
        });

        queuedKeys.delete(item.key);
        postQueue.shift();
      } catch (error) {
        item.attempts += 1;

        if (item.attempts >= maxRetries) {
          logger.error('Facebook job post failed after retries', {
            slug: item.job.slug,
            attempts: item.attempts,
            status: error.status,
            code: error.code,
            message: error.message
          });
          queuedKeys.delete(item.key);
          postQueue.shift();
          continue;
        }

        logger.warn('Facebook job post failed, will retry', {
          slug: item.job.slug,
          attempt: item.attempts,
          maxRetries,
          retryDelayMs,
          status: error.status,
          code: error.code,
          message: error.message
        });

        if (retryDelayMs > 0) {
          await delay(retryDelayMs);
        }
      }
    }
  } finally {
    isQueueRunning = false;
  }
};

export const enqueueFacebookJobPost = (job) => {
  if (!env.facebookAutopostEnabled) {
    logger.info('Facebook autopost disabled, skipping queue', { slug: job?.slug });
    return { queued: false, reason: 'disabled' };
  }

  if (!isConfigured()) {
    logger.warn('Facebook autopost not configured, skipping queue', { slug: job?.slug });
    return { queued: false, reason: 'not configured' };
  }

  if (!job?.slug || !job?.title) {
    logger.warn('Facebook autopost skipped invalid job payload', { slug: job?.slug });
    return { queued: false, reason: 'invalid job' };
  }

  const key = String(job._id || job.id || job.slug);
  if (queuedKeys.has(key)) {
    logger.info('Facebook autopost already queued', { slug: job.slug });
    return { queued: false, reason: 'already queued' };
  }

  postQueue.push({
    key,
    job: serializeJobForQueue(job),
    attempts: 0
  });
  queuedKeys.add(key);

  logger.info('Facebook job post queued', {
    slug: job.slug,
    queueLength: postQueue.length,
    delayMs: cleanNumber(env.facebookPostDelayMs, 10000)
  });

  void processQueue();

  return { queued: true, queueLength: postQueue.length };
};

export const waitForFacebookPostQueue = async ({ timeoutMs = 0, pollMs = 500 } = {}) => {
  const startedAt = Date.now();

  while (isQueueRunning || postQueue.length > 0) {
    if (timeoutMs > 0 && Date.now() - startedAt >= timeoutMs) {
      logger.warn('Timed out waiting for Facebook post queue', {
        queueLength: postQueue.length,
        timeoutMs
      });
      return false;
    }

    await delay(pollMs);
  }

  return true;
};
