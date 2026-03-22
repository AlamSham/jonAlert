import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': env.scraperUserAgent
  }
});

const MAX_ITEMS_PER_SOURCE = 30;
const allowedCategories = new Set(['job', 'result', 'admit-card', 'admission', 'scholarship', 'exam-form']);
const allowedTypes = new Set(['rss', 'html']);

const cleanText = (value = '') => {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const absoluteUrl = (url, baseUrl) => {
  if (!url) return '';
  try {
    return new URL(url, baseUrl).toString();
  } catch (_error) {
    return '';
  }
};

const inferCategory = (title = '', description = '', fallback = 'job') => {
  if (['job', 'result', 'admit-card', 'admission', 'scholarship', 'exam-form'].includes(fallback)) return fallback;

  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('admission') || text.includes('counselling') || text.includes('registration open') || text.includes('enrollment')) return 'admission';
  if (text.includes('scholarship') || text.includes('fellowship') || text.includes('stipend') || text.includes('financial aid')) return 'scholarship';
  if (text.includes('exam form') || text.includes('application form') || text.includes('registration form') || text.includes('form fill')) return 'exam-form';
  if (text.includes('result') || text.includes('scorecard') || text.includes('cutoff')) return 'result';
  if (text.includes('admit card') || text.includes('hall ticket') || text.includes('exam city')) return 'admit-card';
  return 'job';
};

const makeSourceId = ({ sourceName = '', sourceUrl = '', title = '', publishedAt = '' }) => {
  const base = `${sourceName}|${sourceUrl}|${title}|${publishedAt}`;
  return crypto.createHash('sha1').update(base).digest('hex');
};

const toIsoDateOrUndefined = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const normalizeJob = (item) => {
  const title = cleanText(item.title);
  const description = cleanText(item.description);
  const sourceUrl = absoluteUrl(item.sourceUrl, item.baseUrl);
  const sourceName = cleanText(item.sourceName);
  const publishedAt = toIsoDateOrUndefined(item.publishedAt);
  const category = inferCategory(title, description, item.category);
  const sourceId =
    cleanText(item.sourceId) ||
    makeSourceId({
      sourceName,
      sourceUrl,
      title,
      publishedAt
    });

  if (!title || !description || !sourceId) {
    return null;
  }

  return {
    sourceId,
    title,
    description,
    category,
    sourceUrl,
    sourceName,
    publishedAt
  };
};

const fetchFromRss = async (source) => {
  const feed = await parser.parseURL(source.url);
  const items = Array.isArray(feed.items) ? feed.items.slice(0, MAX_ITEMS_PER_SOURCE) : [];

  return items
    .map((item) =>
      normalizeJob({
        title: item.title,
        description: item.contentSnippet || item.content || item.summary || item.title,
        category: source.category,
        sourceName: source.name,
        sourceUrl: item.link,
        publishedAt: item.isoDate || item.pubDate
      })
    )
    .filter(Boolean);
};

const getSelectorText = ($node, selector) => {
  if (!selector) return '';
  return cleanText($node.find(selector).first().text());
};

const getSelectorHref = ($node, selector, baseUrl) => {
  if (!selector) return '';
  const href = $node.find(selector).first().attr('href');
  return absoluteUrl(href, baseUrl);
};

const fetchFromHtml = async (source) => {
  const response = await axios.get(source.url, {
    timeout: 15000,
    headers: {
      'User-Agent': env.scraperUserAgent
    }
  });

  const $ = cheerio.load(response.data);
  const selector = source.itemSelector || '.item';
  const rows = $(selector).toArray().slice(0, MAX_ITEMS_PER_SOURCE);

  return rows
    .map((row) => {
      const $row = $(row);
      return normalizeJob({
        title: getSelectorText($row, source.titleSelector),
        description: getSelectorText($row, source.descriptionSelector) || getSelectorText($row, source.titleSelector),
        category: source.category,
        sourceName: source.name,
        sourceUrl: getSelectorHref($row, source.linkSelector, source.url),
        publishedAt: getSelectorText($row, source.dateSelector) || undefined,
        baseUrl: source.url
      });
    })
    .filter(Boolean);
};

const fetchFromConfiguredSource = async (source) => {
  if (source.type === 'rss') {
    return fetchFromRss(source);
  }

  if (source.type === 'html') {
    return fetchFromHtml(source);
  }

  throw new Error(`Unsupported source type: ${source.type}`);
};

const parseConfiguredSources = async () => {
  const normalizeSource = (source) => {
    const normalized = {
      ...source,
      type: String(source?.type || '').toLowerCase(),
      category: String(source?.category || 'job').toLowerCase(),
      priority: Number(source?.priority || 50)
    };

    if (!normalized.name || !normalized.url) return null;
    if (!allowedTypes.has(normalized.type)) return null;
    if (!allowedCategories.has(normalized.category)) return null;

    if (Number.isNaN(normalized.priority)) {
      normalized.priority = 50;
    }

    return normalized;
  };

  const applySort = (sources) =>
    sources
      .map(normalizeSource)
      .filter(Boolean)
      .sort((a, b) => b.priority - a.priority);

  const raw = env.jobSourcesJson?.trim();
  if (raw) {
    try {
      const sources = JSON.parse(raw);
      if (!Array.isArray(sources)) {
        logger.warn('JOB_SOURCES_JSON must be an array, ignoring custom sources');
        return [];
      }

      return applySort(sources);
    } catch (error) {
      logger.error('Invalid JOB_SOURCES_JSON, ignoring custom sources', { error: error.message });
      return [];
    }
  }

  const filePath = env.jobSourcesFile?.trim();
  if (!filePath) return [];

  try {
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    const rawFile = await fs.readFile(absolutePath, 'utf-8');
    const sources = JSON.parse(rawFile);

    if (!Array.isArray(sources)) {
      logger.warn('JOB_SOURCES_FILE content must be an array, ignoring custom sources');
      return [];
    }

    return applySort(sources);
  } catch (error) {
    logger.error('Invalid JOB_SOURCES_FILE, ignoring custom sources', { error: error.message });
    return [];
  }
};

const fetchFromSampleJson = async () => {
  const filePath = path.resolve(process.cwd(), 'src/data/sampleJobs.json');
  const raw = await fs.readFile(filePath, 'utf-8');
  const items = JSON.parse(raw);

  return items
    .map((item) =>
      normalizeJob({
        sourceId: item.sourceId,
        title: item.title,
        description: item.description,
        category: item.category,
        sourceName: item.sourceName || 'sample-json',
        sourceUrl: item.sourceUrl || ''
      })
    )
    .filter(Boolean);
};

export const fetchJobNotifications = async () => {
  const configuredSources = await parseConfiguredSources();

  if (!configuredSources.length) {
    logger.warn('No live sources configured, using sample JSON source');
    return fetchFromSampleJson();
  }

  const allJobs = [];
  for (const source of configuredSources) {
    try {
      logger.info('Fetching source', { name: source.name, type: source.type, url: source.url });
      const jobs = await fetchFromConfiguredSource(source);
      logger.info('Source fetched', { name: source.name, count: jobs.length });
      allJobs.push(...jobs);
    } catch (error) {
      logger.error('Source fetch failed', {
        name: source.name,
        url: source.url,
        error: error.message
      });
    }
  }

  const deduped = Array.from(new Map(allJobs.map((item) => [item.sourceId, item])).values());

  if (!deduped.length) {
    logger.warn('No jobs fetched from live sources, using sample JSON fallback');
    return fetchFromSampleJson();
  }

  return deduped;
};
