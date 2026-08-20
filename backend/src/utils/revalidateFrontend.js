import axios from 'axios';

/**
 * Trigger Next.js On-Demand ISR Revalidation on Frontend
 * Call this function whenever a new job or scheme is created or updated.
 * 
 * @param {Object} options
 * @param {string} [options.slug] - The slug of the created/updated job or scheme
 * @param {string} [options.category] - Category name or path
 * @param {string} [options.path] - Exact URL path to revalidate
 */
export async function triggerFrontendRevalidate({ slug, category, path } = {}) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://sarkaripulse.net';
  const token = process.env.REVALIDATE_SECRET_TOKEN;

  if (!token) {
    console.log('[Revalidate] REVALIDATE_SECRET_TOKEN not set, skipping frontend revalidation trigger.');
    return;
  }

  try {
    const targetUrl = `${frontendUrl.replace(/\/$/, '')}/api/revalidate?secret=${encodeURIComponent(token)}`;
    const response = await axios.post(
      targetUrl,
      { slug, category, path },
      { timeout: 5000 }
    );

    if (response.data && response.data.revalidated) {
      console.log(`[Revalidate Success] Revalidated frontend for slug: "${slug || 'N/A'}", path: "${path || 'N/A'}"`);
    }
  } catch (error) {
    console.error(`[Revalidate Error] Failed to trigger frontend revalidation:`, error.message);
  }
}
