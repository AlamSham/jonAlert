import { Job } from '../models/Job.js';
import { runJobIngestion } from '../cron/job.cron.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

const RELATED_SELECT = 'title slug category summary state organization vacancyCount lastDate tags createdAt';

const cleanLimit = (input, fallback = 10, max = 50) => {
  const parsed = Number(input);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getLatestJobs = async (req, res) => {
  const limit = cleanLimit(req.validated?.limit, 12, 100);

  const jobs = await Job.find({ status: 'active' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('title slug category summary state organization vacancyCount lastDate tags createdAt')
    .lean();

  res.json({ data: jobs });
};

export const getJobs = async (req, res) => {
  logger.info('GET /api/jobs started', { ip: req.ip });
  const limit = cleanLimit(req.validated?.limit, 20, 100);
  const category = req.validated?.category;
  const page = Math.max(1, Number(req.validated?.page) || 1);
  const skip = (page - 1) * limit;

  const filter = { status: 'active' };
  if (category) filter.category = category;

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title slug category summary state organization vacancyCount lastDate tags createdAt')
      .lean(),
    Job.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit);

  logger.info('GET /api/jobs completed', { ip: req.ip, count: jobs.length, category: category || 'all', page });
  res.json({
    data: jobs,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
};

export const getJobsByCategory = async (req, res) => {
  const category = req.validated?.category || req.params.category;
  const limit = cleanLimit(req.validated?.limit, 20, 100);
  const page = Math.max(1, Number(req.validated?.page) || 1);
  const skip = (page - 1) * limit;

  const filter = { category, status: 'active' };

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title slug category summary state organization vacancyCount lastDate tags createdAt')
      .lean(),
    Job.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    data: jobs,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
  });
};

export const getJobsByState = async (req, res) => {
  const state = req.validated?.state || req.params.state;
  const limit = cleanLimit(req.validated?.limit, 20, 100);
  const page = Math.max(1, Number(req.validated?.page) || 1);
  const skip = (page - 1) * limit;

  const filter = { state: new RegExp(`^${escapeRegex(state)}$`, 'i'), status: 'active' };

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title slug category summary state organization vacancyCount lastDate tags createdAt')
      .lean(),
    Job.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    data: jobs,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
  });
};

export const getJobBySlug = async (req, res) => {
  const slug = req.validated?.slug || req.params.slug;
  const job = await Job.findOneAndUpdate(
    { slug },
    { $inc: { viewCount: 1 } },
    { new: true }
  ).lean();

  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  return res.json({ data: job });
};

export const searchJobs = async (req, res) => {
  const q = req.validated?.q || '';

  // Try text index first, fallback to regex
  let jobs;
  try {
    jobs = await Job.find(
      { $text: { $search: q }, status: 'active' },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .select('title slug category summary state organization tags createdAt')
      .lean();
  } catch (_error) {
    // Text index might not exist yet — fallback to regex
    const safeQuery = escapeRegex(q);
    const regex = new RegExp(safeQuery, 'i');
    jobs = await Job.find({
      $or: [{ title: regex }, { content: regex }, { summary: regex }],
      status: 'active'
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('title slug category summary state organization tags createdAt')
      .lean();
  }

  return res.json({ data: jobs });
};

export const getTrendingJobs = async (req, res) => {
  const limit = cleanLimit(req.validated?.limit, 10, 50);

  const jobs = await Job.find({ status: 'active' })
    .sort({ viewCount: -1, createdAt: -1 })
    .limit(limit)
    .select('title slug category summary state organization viewCount tags createdAt')
    .lean();

  res.json({ data: jobs });
};

export const getStats = async (_req, res) => {
  const [total, byCategory, byState, recentCount] = await Promise.all([
    Job.countDocuments({ status: 'active' }),
    Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]),
    Job.aggregate([
      { $match: { status: 'active', state: { $ne: '' } } },
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]),
    Job.countDocuments({
      status: 'active',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
  ]);

  res.json({
    data: {
      totalJobs: total,
      last24Hours: recentCount,
      categories: byCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topStates: byState.map((s) => ({ state: s._id, count: s.count }))
    }
  });
};

export const getSitemap = async (_req, res) => {
  const jobs = await Job.find({ status: 'active' })
    .sort({ createdAt: -1 })
    .select('slug category createdAt')
    .lean();

  const baseUrl = env.frontendUrl.replace(/\/$/, '');
  const now = new Date().toISOString();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Home page
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // Category pages
  for (const cat of ['job', 'result', 'admit-card', 'admission', 'scholarship', 'exam-form']) {
    xml += `  <url>\n    <loc>${baseUrl}/${cat}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  }

  // Job detail pages
  for (const job of jobs) {
    const lastmod = job.createdAt ? new Date(job.createdAt).toISOString() : now;
    xml += `  <url>\n    <loc>${baseUrl}/${job.category}/${job.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  xml += '</urlset>';

  res.set('Content-Type', 'application/xml');
  res.send(xml);
};

export const triggerCronNow = async (_req, res) => {
  logger.info('POST /api/cron/run started');
  const result = await runJobIngestion();
  logger.info('POST /api/cron/run completed', result);
  res.json({ message: 'Cron executed', ...result });
};

export const getRelatedJobs = async (req, res) => {
  const { slug } = req.params;
  const job = await Job.findOne({ slug, status: 'active' }).lean();
  if (!job) return res.status(404).json({ error: 'Not found' });

  const related = await Job.find({
    status: 'active',
    _id: { $ne: job._id },
    $or: [
      { category: job.category, state: job.state },
      { category: job.category },
      { tags: { $in: job.tags || [] } }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(6)
    .select(RELATED_SELECT)
    .lean();

  res.json({ data: related });
};
