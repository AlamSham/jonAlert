import { Scheme } from '../models/Scheme.js';
import { logger } from '../utils/logger.js';

const RELATED_SELECT = 'title slug schemeType summary state department tags thumbnailUrl viewCount createdAt';

const cleanLimit = (input, fallback = 18, max = 50) => {
  const parsed = Number(input);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getSchemes = async (req, res) => {
  logger.info('GET /api/schemes started', { ip: req.ip });
  const limit = cleanLimit(req.validated?.limit, 18, 100);
  const schemeType = req.validated?.schemeType;
  const state = req.validated?.state;
  const page = Math.max(1, Number(req.validated?.page) || 1);
  const skip = (page - 1) * limit;

  const filter = {};
  if (schemeType) filter.schemeType = schemeType;
  if (state) filter.$or = [
    { state: new RegExp(`^${escapeRegex(state)}$`, 'i') },
    { state: 'All India' }
  ];

  const [schemes, total] = await Promise.all([
    Scheme.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title slug schemeType summary state department tags thumbnailUrl viewCount createdAt')
      .lean(),
    Scheme.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit);

  logger.info('GET /api/schemes completed', { ip: req.ip, count: schemes.length, schemeType: schemeType || 'all', page });
  res.json({
    data: schemes,
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

export const getLatestSchemes = async (req, res) => {
  const limit = cleanLimit(req.validated?.limit, 6, 20);

  const schemes = await Scheme.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select(RELATED_SELECT)
    .lean();

  res.json({ data: schemes });
};

export const getSchemeBySlug = async (req, res) => {
  const slug = req.validated?.slug || req.params.slug;
  const scheme = await Scheme.findOneAndUpdate(
    { slug },
    { $inc: { viewCount: 1 } },
    { new: true }
  ).lean();

  if (!scheme) {
    return res.status(404).json({ message: 'Scheme not found' });
  }

  return res.json({ data: scheme });
};

export const getSchemesByType = async (req, res) => {
  const schemeType = req.validated?.type || req.params.type;
  const limit = cleanLimit(req.validated?.limit, 18, 100);
  const page = Math.max(1, Number(req.validated?.page) || 1);
  const skip = (page - 1) * limit;

  const filter = { schemeType };

  const [schemes, total] = await Promise.all([
    Scheme.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(RELATED_SELECT)
      .lean(),
    Scheme.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    data: schemes,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
  });
};

export const getSchemesByState = async (req, res) => {
  const state = req.validated?.state || req.params.state;
  const limit = cleanLimit(req.validated?.limit, 18, 100);
  const page = Math.max(1, Number(req.validated?.page) || 1);
  const skip = (page - 1) * limit;

  // Include state-specific schemes AND central schemes (All India)
  const filter = {
    $or: [
      { state: new RegExp(`^${escapeRegex(state)}$`, 'i') },
      { state: 'All India' }
    ]
  };

  const [schemes, total] = await Promise.all([
    Scheme.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(RELATED_SELECT)
      .lean(),
    Scheme.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    data: schemes,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
  });
};

export const searchSchemes = async (req, res) => {
  const q = req.validated?.q || '';

  // Try text index first, fallback to regex
  let schemes;
  try {
    schemes = await Scheme.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .select(RELATED_SELECT)
      .lean();
  } catch (_error) {
    // Text index might not exist yet — fallback to regex
    const safeQuery = escapeRegex(q);
    const regex = new RegExp(safeQuery, 'i');
    schemes = await Scheme.find({
      $or: [{ title: regex }, { description: regex }, { summary: regex }]
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select(RELATED_SELECT)
      .lean();
  }

  return res.json({ data: schemes });
};

export const getRelatedSchemes = async (req, res) => {
  const { slug } = req.params;
  const scheme = await Scheme.findOne({ slug }).lean();
  if (!scheme) return res.status(404).json({ error: 'Not found' });

  const related = await Scheme.find({
    _id: { $ne: scheme._id },
    $or: [
      { schemeType: scheme.schemeType, state: scheme.state },
      { schemeType: scheme.schemeType },
      { tags: { $in: scheme.tags || [] } }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(6)
    .select(RELATED_SELECT)
    .lean();

  res.json({ data: related });
};
