import { getCanonicalUrl, buildJobUrl, buildSchemeUrl, buildCategoryUrl, BASE_URL } from './urlManager.js';
import { getStaticPageConfig } from '../../config/staticPages.js';

/**
 * Constants for meta tag generation
 */
const TITLE_MIN_LENGTH = 50;
const TITLE_MAX_LENGTH = 60;
const DESCRIPTION_MIN_LENGTH = 150;
const DESCRIPTION_MAX_LENGTH = 160;
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/og-default.jpg`;
const SITE_NAME = 'SarkariPulse';

/**
 * Truncate text to specified length while preserving word boundaries
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text || '';
  }
  
  // Find the last space before maxLength
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Pad text to minimum length if needed
 * @param {string} text - Text to pad
 * @param {number} minLength - Minimum length
 * @param {string} suffix - Suffix to add for padding
 * @returns {string} Padded text
 */
function padText(text, minLength, suffix = '') {
  if (!text) {
    return suffix;
  }
  
  if (text.length >= minLength) {
    return text;
  }
  
  if (suffix && (text.length + suffix.length + 3) <= minLength) {
    return `${text} - ${suffix}`;
  }
  
  return text;
}

/**
 * Validate and normalize title length (50-60 characters)
 * @param {string} title - Title to validate
 * @param {string} fallback - Fallback suffix for padding
 * @returns {string} Validated title
 */
function validateTitle(title, fallback = SITE_NAME) {
  if (!title) {
    return fallback;
  }
  
  // Truncate if too long
  if (title.length > TITLE_MAX_LENGTH) {
    return truncateText(title, TITLE_MAX_LENGTH);
  }
  
  // Pad if too short
  if (title.length < TITLE_MIN_LENGTH) {
    return padText(title, TITLE_MIN_LENGTH, fallback);
  }
  
  return title;
}

/**
 * Validate and normalize description length (150-160 characters)
 * @param {string} description - Description to validate
 * @param {string} fallback - Fallback text for padding
 * @returns {string} Validated description
 */
function validateDescription(description, fallback = '') {
  if (!description) {
    return fallback;
  }
  
  // Truncate if too long
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    return truncateText(description, DESCRIPTION_MAX_LENGTH);
  }
  
  // Pad if too short
  if (description.length < DESCRIPTION_MIN_LENGTH && fallback) {
    return padText(description, DESCRIPTION_MIN_LENGTH, fallback);
  }
  
  return description;
}

/**
 * Generate Open Graph tags
 * @param {Object} options - OG tag options
 * @returns {Object} Open Graph tags
 */
function generateOpenGraphTags(options) {
  const {
    title,
    description,
    url,
    image = DEFAULT_OG_IMAGE,
    type = 'website',
    siteName = SITE_NAME
  } = options;
  
  return {
    'og:title': title,
    'og:description': description,
    'og:image': image,
    'og:url': url,
    'og:type': type,
    'og:site_name': siteName
  };
}

/**
 * Generate Twitter Card meta tags
 * @param {Object} options - Twitter card options
 * @returns {Object} Twitter Card tags
 */
function generateTwitterCardTags(options) {
  const {
    title,
    description,
    image = DEFAULT_OG_IMAGE,
    card = 'summary_large_image'
  } = options;
  
  return {
    'twitter:card': card,
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image
  };
}

/**
 * Generate meta tags for a page
 * @param {Object} options - Page metadata
 * @param {string} options.pageType - Type of page (job, scheme, static, category)
 * @param {string} options.title - Page title
 * @param {string} options.description - Page description
 * @param {string} options.canonicalUrl - Canonical URL
 * @param {string} options.imageUrl - Open Graph image URL
 * @param {string[]} options.keywords - SEO keywords
 * @param {string} options.robots - Robots meta tag value
 * @param {Object} options.data - Additional page data
 * @returns {Object} Meta tags object
 */
export function generateMetaTags(options) {
  const {
    pageType = 'website',
    title = SITE_NAME,
    description = '',
    canonicalUrl = BASE_URL,
    imageUrl = DEFAULT_OG_IMAGE,
    keywords = [],
    robots = 'index,follow',
    data = {}
  } = options;
  
  // Validate title and description lengths
  const validatedTitle = validateTitle(title);
  const validatedDescription = validateDescription(description, 'Latest government job notifications, exam results, admit cards, and scheme updates for India.');
  
  // Generate Open Graph tags
  const openGraph = generateOpenGraphTags({
    title: validatedTitle,
    description: validatedDescription,
    url: canonicalUrl,
    image: imageUrl,
    type: pageType === 'job' ? 'article' : 'website'
  });
  
  // Generate Twitter Card tags
  const twitter = generateTwitterCardTags({
    title: validatedTitle,
    description: validatedDescription,
    image: imageUrl
  });
  
  return {
    title: validatedTitle,
    description: validatedDescription,
    canonical: canonicalUrl,
    openGraph,
    twitter,
    robots,
    keywords: keywords.length > 0 ? keywords : ['government jobs', 'sarkari naukri', 'job notifications', 'exam results']
  };
}

/**
 * Generate meta tags for job posting page
 * @param {Object} job - Job document from database
 * @returns {Object} Meta tags object
 */
export function generateJobMetaTags(job) {
  if (!job) {
    return generateMetaTags({});
  }
  
  // Use custom meta title/description if available, otherwise generate
  let title = job.metaTitle || job.title;
  let description = job.metaDescription || job.summary;
  
  // Enhance title with organization and location if available
  if (!job.metaTitle) {
    const titleParts = [job.title];
    
    if (job.organization) {
      titleParts.push(job.organization);
    }
    
    if (job.state && job.state !== 'All India') {
      titleParts.push(job.state);
    }
    
    title = titleParts.join(' - ');
  }
  
  // Enhance description with key details if available
  if (!job.metaDescription && job.summary) {
    const descParts = [job.summary];
    
    if (job.vacancyCount && job.vacancyCount > 0) {
      descParts.push(`${job.vacancyCount} vacancies`);
    }
    
    if (job.lastDate) {
      const lastDate = new Date(job.lastDate);
      descParts.push(`Apply by ${lastDate.toLocaleDateString('en-IN')}`);
    }
    
    description = descParts.join('. ');
  }
  
  // Generate canonical URL
  const canonicalUrl = buildJobUrl(job);
  
  // Extract keywords from job data
  const keywords = [
    job.title,
    job.organization || 'government job',
    job.state || 'India',
    job.category,
    ...(job.tags || [])
  ].filter(Boolean);
  
  return generateMetaTags({
    pageType: 'job',
    title,
    description,
    canonicalUrl,
    imageUrl: DEFAULT_OG_IMAGE,
    keywords,
    robots: job.status === 'active' ? 'index,follow' : 'noindex,follow',
    data: job
  });
}

/**
 * Generate meta tags for scheme page
 * @param {Object} scheme - Scheme document from database
 * @returns {Object} Meta tags object
 */
export function generateSchemeMetaTags(scheme) {
  if (!scheme) {
    return generateMetaTags({});
  }
  
  // Use custom meta title/description if available, otherwise generate
  let title = scheme.metaTitle || scheme.title;
  let description = scheme.metaDescription || scheme.summary;
  
  // Enhance title with scheme type and state if available
  if (!scheme.metaTitle) {
    const titleParts = [scheme.title];
    
    if (scheme.schemeType) {
      titleParts.push(scheme.schemeType === 'central' ? 'Central Scheme' : 'State Scheme');
    }
    
    if (scheme.state && scheme.state !== 'All India') {
      titleParts.push(scheme.state);
    }
    
    title = titleParts.join(' - ');
  }
  
  // Enhance description with key details if available
  if (!scheme.metaDescription && scheme.summary) {
    const descParts = [scheme.summary];
    
    if (scheme.department) {
      descParts.push(`by ${scheme.department}`);
    }
    
    description = descParts.join('. ');
  }
  
  // Generate canonical URL
  const canonicalUrl = buildSchemeUrl(scheme);
  
  // Extract keywords from scheme data
  const keywords = [
    scheme.title,
    scheme.department || 'government scheme',
    scheme.state || 'India',
    scheme.schemeType,
    ...(scheme.tags || [])
  ].filter(Boolean);
  
  // Use thumbnail if available
  const imageUrl = scheme.thumbnailUrl || DEFAULT_OG_IMAGE;
  
  return generateMetaTags({
    pageType: 'article',
    title,
    description,
    canonicalUrl,
    imageUrl,
    keywords,
    robots: 'index,follow',
    data: scheme
  });
}

/**
 * Generate meta tags for static page
 * @param {string} pageName - Name of static page
 * @returns {Object} Meta tags object
 */
export function generateStaticPageMetaTags(pageName) {
  if (!pageName) {
    return generateMetaTags({});
  }
  
  // Get static page configuration
  const pageConfig = getStaticPageConfig(pageName);
  
  if (!pageConfig) {
    // Return default meta tags if page not found
    return generateMetaTags({
      title: `${pageName} - ${SITE_NAME}`,
      canonicalUrl: getCanonicalUrl(`/${pageName}`)
    });
  }
  
  // Generate canonical URL
  const canonicalUrl = getCanonicalUrl(`/${pageName}`);
  
  return generateMetaTags({
    pageType: 'website',
    title: pageConfig.title,
    description: pageConfig.description,
    canonicalUrl,
    imageUrl: DEFAULT_OG_IMAGE,
    keywords: pageConfig.keywords || [],
    robots: 'index,follow',
    data: pageConfig
  });
}

/**
 * Generate meta tags for category page
 * @param {string} category - Category name
 * @param {Object} filters - Applied filters (state, qualification, etc.)
 * @returns {Object} Meta tags object
 */
export function generateCategoryMetaTags(category, filters = {}) {
  if (!category) {
    return generateMetaTags({});
  }
  
  // Normalize category name for display
  const categoryDisplay = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Build title with filters
  const titleParts = [categoryDisplay];
  
  if (filters.state && filters.state !== 'All India') {
    titleParts.push(filters.state);
  }
  
  if (filters.qualification) {
    titleParts.push(filters.qualification);
  }
  
  titleParts.push(SITE_NAME);
  
  const title = titleParts.join(' - ');
  
  // Build description with filters
  let description = `Browse latest ${categoryDisplay.toLowerCase()} notifications`;
  
  const descParts = [];
  
  if (filters.state && filters.state !== 'All India') {
    descParts.push(`in ${filters.state}`);
  }
  
  if (filters.qualification) {
    descParts.push(`for ${filters.qualification} candidates`);
  }
  
  if (descParts.length > 0) {
    description += ` ${descParts.join(' ')}`;
  }
  
  description += '. Get exam dates, eligibility criteria, application links, and more.';
  
  // Generate canonical URL with filters
  const canonicalUrl = buildCategoryUrl(category, filters);
  
  // Generate keywords
  const keywords = [
    categoryDisplay,
    `${categoryDisplay} notifications`,
    'government jobs',
    'sarkari naukri'
  ];
  
  if (filters.state) {
    keywords.push(`${filters.state} jobs`);
  }
  
  if (filters.qualification) {
    keywords.push(`${filters.qualification} jobs`);
  }
  
  return generateMetaTags({
    pageType: 'website',
    title,
    description,
    canonicalUrl,
    imageUrl: DEFAULT_OG_IMAGE,
    keywords,
    robots: 'index,follow',
    data: { category, filters }
  });
}
