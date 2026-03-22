import slugify from 'slugify';

const SEO_STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'latest',
  'update',
  'official',
  'notification'
]);

export const makeSlug = (title) => {
  const words = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !SEO_STOP_WORDS.has(word));

  const base = words.length ? words.join(' ') : String(title);

  const rawSlug = slugify(base, {
    lower: true,
    strict: true,
    trim: true
  });

  const maxLen = 80;
  if (rawSlug.length <= maxLen) {
    return rawSlug;
  }

  return rawSlug.slice(0, maxLen).replace(/-+$/g, '');
};
