import { Scheme } from '../models/Scheme.js';
import { makeSlug } from '../utils/slugify.js';

/**
 * Generate a unique slug for a scheme
 * @param {string} title - Scheme title
 * @returns {Promise<string>} - Unique slug
 */
export async function generateUniqueSlug(title) {
  let slug = makeSlug(title);
  let counter = 1;
  
  // Check if slug exists, if so append counter
  while (await Scheme.findOne({ slug }).lean()) {
    slug = `${makeSlug(title)}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Sanitize search query to prevent regex injection
 * @param {string} query - User search query
 * @returns {string} - Sanitized query
 */
export function sanitizeSearchQuery(query) {
  if (!query || typeof query !== 'string') return '';
  
  // Remove special regex characters
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
}

/**
 * Find related schemes based on type, state, and tags
 * @param {Object} scheme - Current scheme object
 * @param {number} limit - Maximum number of related schemes
 * @returns {Promise<Array>} - Array of related schemes
 */
export async function findRelatedSchemes(scheme, limit = 6) {
  if (!scheme) return [];
  
  // Priority scoring:
  // 1. Same type + same state (highest priority)
  // 2. Same type
  // 3. Matching tags
  const related = await Scheme.find({
    _id: { $ne: scheme._id },
    $or: [
      { schemeType: scheme.schemeType, state: scheme.state },
      { schemeType: scheme.schemeType },
      { tags: { $in: scheme.tags || [] } }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('title slug schemeType summary state department tags thumbnailUrl viewCount createdAt')
    .lean();
  
  return related;
}

/**
 * Build filter object for scheme queries
 * @param {Object} params - Filter parameters
 * @returns {Object} - MongoDB filter object
 */
export function buildSchemeFilter(params = {}) {
  const filter = {};
  
  if (params.schemeType && ['central', 'state'].includes(params.schemeType)) {
    filter.schemeType = params.schemeType;
  }
  
  if (params.state) {
    const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { state: new RegExp(`^${escapeRegex(params.state)}$`, 'i') },
      { state: 'All India' }
    ];
  }
  
  if (params.tags && Array.isArray(params.tags) && params.tags.length > 0) {
    filter.tags = { $in: params.tags };
  }
  
  return filter;
}
