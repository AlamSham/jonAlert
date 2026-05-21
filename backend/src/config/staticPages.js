/**
 * Static Pages Configuration
 * 
 * This module defines metadata for all static pages on the website.
 * Used for SEO meta tags, sitemap generation, and page rendering.
 */

/**
 * Static page configurations with SEO metadata
 * Each page includes: title, description, keywords, priority, changefreq
 */
const STATIC_PAGES = {
  about: {
    title: 'About Us - SarkariPulse | Your Trusted Job Notification Portal',
    description: 'Learn about SarkariPulse, India\'s leading platform for government job notifications, exam alerts, and career opportunities. Discover our mission to help job seekers.',
    keywords: ['about sarkaripulse', 'government job portal', 'sarkari job website', 'job notification platform', 'career portal india'],
    priority: 0.7,
    changefreq: 'monthly'
  },
  
  contact: {
    title: 'Contact Us - SarkariPulse | Get in Touch',
    description: 'Contact SarkariPulse for queries about government jobs, exam notifications, and career guidance. Reach out to our support team for assistance.',
    keywords: ['contact sarkaripulse', 'job portal contact', 'support', 'help', 'customer service'],
    priority: 0.6,
    changefreq: 'monthly'
  },
  
  disclaimer: {
    title: 'Disclaimer - SarkariPulse | Terms and Conditions',
    description: 'Read the disclaimer and terms of use for SarkariPulse. Important information about job notifications, exam alerts, and website usage policies.',
    keywords: ['disclaimer', 'terms and conditions', 'legal notice', 'website policy', 'usage terms'],
    priority: 0.4,
    changefreq: 'yearly'
  },
  
  'privacy-policy': {
    title: 'Privacy Policy - SarkariPulse | Data Protection',
    description: 'SarkariPulse privacy policy explains how we collect, use, and protect your personal information. Learn about our commitment to data security and privacy.',
    keywords: ['privacy policy', 'data protection', 'personal information', 'data security', 'user privacy'],
    priority: 0.5,
    changefreq: 'yearly'
  },
  
  admission: {
    title: 'Admission Notifications - Latest College & University Admissions',
    description: 'Get latest admission notifications for colleges, universities, and educational institutions across India. Stay updated with admission dates, eligibility, and application process.',
    keywords: ['admission notifications', 'college admission', 'university admission', 'entrance exam', 'admission alerts'],
    priority: 0.8,
    changefreq: 'daily'
  },
  
  'admit-card': {
    title: 'Admit Card Download - Exam Hall Tickets & Call Letters',
    description: 'Download admit cards and hall tickets for government exams, entrance tests, and competitive examinations. Get direct links to official admit card download pages.',
    keywords: ['admit card', 'hall ticket', 'call letter', 'exam admit card', 'download admit card'],
    priority: 0.8,
    changefreq: 'daily'
  },
  
  'exam-form': {
    title: 'Exam Application Forms - Apply Online for Government Exams',
    description: 'Apply online for government job exams, competitive tests, and entrance examinations. Find direct links to official application forms and registration portals.',
    keywords: ['exam form', 'online application', 'exam registration', 'apply online', 'application form'],
    priority: 0.8,
    changefreq: 'daily'
  },
  
  result: {
    title: 'Exam Results - Check Latest Government Exam Results Online',
    description: 'Check latest exam results for government jobs, competitive exams, and entrance tests. Get direct links to official result declaration websites and merit lists.',
    keywords: ['exam results', 'result declaration', 'merit list', 'scorecard', 'check results online'],
    priority: 0.8,
    changefreq: 'daily'
  },
  
  schemes: {
    title: 'Government Schemes - Central & State Welfare Programs',
    description: 'Explore government schemes and welfare programs from central and state governments. Find eligibility criteria, benefits, and application procedures for various schemes.',
    keywords: ['government schemes', 'welfare programs', 'central schemes', 'state schemes', 'yojana'],
    priority: 0.7,
    changefreq: 'weekly'
  }
};

/**
 * Get static page configuration by page name
 * 
 * @param {string} pageName - Name of the static page (e.g., 'about', 'contact')
 * @returns {Object|null} Page configuration object or null if not found
 * 
 * @example
 * const config = getStaticPageConfig('about');
 * // Returns: { title: '...', description: '...', keywords: [...], priority: 0.7, changefreq: 'monthly' }
 */
function getStaticPageConfig(pageName) {
  if (!pageName || typeof pageName !== 'string') {
    return null;
  }
  
  // Normalize page name (lowercase, trim whitespace)
  const normalizedPageName = pageName.toLowerCase().trim();
  
  // Return the configuration if it exists
  return STATIC_PAGES[normalizedPageName] || null;
}

/**
 * Get all static page names
 * 
 * @returns {string[]} Array of all static page names
 */
function getAllStaticPageNames() {
  return Object.keys(STATIC_PAGES);
}

/**
 * Check if a page name is a valid static page
 * 
 * @param {string} pageName - Name of the page to check
 * @returns {boolean} True if the page exists in configuration
 */
function isStaticPage(pageName) {
  if (!pageName || typeof pageName !== 'string') {
    return false;
  }
  
  const normalizedPageName = pageName.toLowerCase().trim();
  return STATIC_PAGES.hasOwnProperty(normalizedPageName);
}

export {
  STATIC_PAGES,
  getStaticPageConfig,
  getAllStaticPageNames,
  isStaticPage
};
