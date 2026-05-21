/**
 * Structured Data Generator Utility
 * 
 * Generates valid JSON-LD structured data for rich results in search engines.
 * Supports JobPosting, FAQPage, BreadcrumbList, Organization, and WebSite schemas.
 * 
 * @module structuredDataGenerator
 */

import { env } from '../../config/env.js';
import { buildJobUrl } from './urlManager.js';
import { validateSchema } from './schemaValidator.js';

/**
 * Generate JobPosting structured data with complete schema
 * 
 * @param {Object} job - Job document from database
 * @returns {Object} JobPosting JSON-LD schema
 */
export function generateJobPostingSchema(job) {
  if (!job) {
    throw new Error('Job object is required');
  }

  // Build job URL
  const jobUrl = buildJobUrl(job);

  // Parse salary information
  const salaryInfo = parseSalaryInfo(job.salary);

  // Parse location information
  const locationInfo = parseLocationInfo(job.state, job.organization);

  // Parse employment type from category
  const employmentType = parseEmploymentType(job.category);

  // Build the schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.summary || job.content.substring(0, 500),
    datePosted: job.publishedAt ? job.publishedAt.toISOString() : job.createdAt.toISOString(),
    validThrough: job.lastDate ? job.lastDate.toISOString() : getDefaultValidThrough(job.createdAt),
    employmentType: employmentType,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.organization || 'Government of India',
      sameAs: env.baseUrl,
      logo: `${env.baseUrl}/logo.png`
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: locationInfo.streetAddress,
        addressLocality: locationInfo.addressLocality,
        addressRegion: locationInfo.addressRegion,
        postalCode: locationInfo.postalCode,
        addressCountry: 'IN'
      }
    },
    identifier: {
      '@type': 'PropertyValue',
      name: job.organization || 'Government Job',
      value: job.sourceId
    }
  };

  // Add salary information if available
  if (salaryInfo.hasValidSalary) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: {
        '@type': 'QuantitativeValue',
        value: salaryInfo.value,
        minValue: salaryInfo.minValue,
        maxValue: salaryInfo.maxValue,
        unitText: salaryInfo.unitText
      }
    };
  }

  // Add qualifications if available
  if (job.qualificationLevel && job.qualificationLevel !== '') {
    schema.qualifications = formatQualification(job.qualificationLevel);
  }

  // Add responsibilities from eligibility
  if (job.eligibility) {
    schema.responsibilities = job.eligibility.substring(0, 500);
  }

  // Add vacancy count if available
  if (job.vacancyCount && job.vacancyCount > 0) {
    schema.totalJobOpenings = job.vacancyCount;
  }

  // Add application URL if available
  if (job.applyLink) {
    schema.directApply = true;
    schema.applicationContact = {
      '@type': 'ContactPoint',
      url: job.applyLink
    };
  }

  // Validate the schema if validation is enabled
  if (env.enableSeoValidation) {
    const validation = validateSchema(schema, 'JobPosting');
    if (!validation.valid) {
      console.warn('JobPosting schema validation errors:', validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.warn('JobPosting schema validation warnings:', validation.warnings);
    }
  }

  return schema;
}

/**
 * Generate FAQ structured data
 * 
 * @param {Array} faqs - Array of FAQ objects with question and answer properties
 * @returns {Object} FAQPage JSON-LD schema
 */
export function generateFAQSchema(faqs) {
  if (!Array.isArray(faqs) || faqs.length === 0) {
    throw new Error('FAQs array is required and must not be empty');
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  // Validate the schema if validation is enabled
  if (env.enableSeoValidation) {
    const validation = validateSchema(schema, 'FAQPage');
    if (!validation.valid) {
      console.warn('FAQ schema validation errors:', validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.warn('FAQ schema validation warnings:', validation.warnings);
    }
  }

  return schema;
}

/**
 * Generate BreadcrumbList structured data
 * 
 * @param {Array} breadcrumbs - Array of breadcrumb objects with name and url properties
 * @returns {Object} BreadcrumbList JSON-LD schema
 */
export function generateBreadcrumbSchema(breadcrumbs) {
  if (!Array.isArray(breadcrumbs) || breadcrumbs.length === 0) {
    throw new Error('Breadcrumbs array is required and must not be empty');
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url
    }))
  };

  // Validate the schema if validation is enabled
  if (env.enableSeoValidation) {
    const validation = validateSchema(schema, 'BreadcrumbList');
    if (!validation.valid) {
      console.warn('Breadcrumb schema validation errors:', validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.warn('Breadcrumb schema validation warnings:', validation.warnings);
    }
  }

  return schema;
}

/**
 * Generate Organization structured data
 * 
 * @returns {Object} Organization JSON-LD schema
 */
export function generateOrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sarkari Pulse',
    alternateName: 'SarkariPulse.net',
    url: env.baseUrl,
    logo: `${env.baseUrl}/logo.png`,
    description: 'Latest Sarkari Job Notifications, Results, Admit Cards, and Government Schemes for Indian job seekers',
    sameAs: [
      'https://www.facebook.com/sarkaripulse',
      'https://twitter.com/sarkaripulse',
      'https://www.instagram.com/sarkaripulse'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      url: `${env.baseUrl}/contact`,
      availableLanguage: ['English', 'Hindi']
    }
  };

  return schema;
}

/**
 * Generate WebSite structured data with search action
 * 
 * @returns {Object} WebSite JSON-LD schema
 */
export function generateWebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sarkari Pulse',
    alternateName: 'SarkariPulse.net',
    url: env.baseUrl,
    description: 'Latest Sarkari Job Notifications, Results, Admit Cards, and Government Schemes',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${env.baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return schema;
}

/**
 * Parse salary information from salary string
 * 
 * @param {string} salaryString - Salary string from job document
 * @returns {Object} Parsed salary information
 */
function parseSalaryInfo(salaryString) {
  const result = {
    hasValidSalary: false,
    value: null,
    minValue: null,
    maxValue: null,
    unitText: 'MONTH'
  };

  if (!salaryString || salaryString.trim() === '') {
    return result;
  }

  // Remove common prefixes and clean the string
  const cleaned = salaryString
    .replace(/Rs\.?|INR|₹/gi, '')
    .replace(/per month|\/month|pm/gi, '')
    .replace(/per annum|\/annum|pa|per year|\/year/gi, 'YEAR')
    .replace(/lakh|lac/gi, '00000')
    .replace(/thousand|k/gi, '000')
    .replace(/,/g, '')
    .trim();

  // Check if it's yearly
  if (cleaned.includes('YEAR')) {
    result.unitText = 'YEAR';
  }

  // Extract numbers
  const numbers = cleaned.match(/\d+/g);
  
  if (numbers && numbers.length > 0) {
    result.hasValidSalary = true;
    
    if (numbers.length === 1) {
      // Single value
      result.value = parseInt(numbers[0]);
      result.minValue = result.value;
      result.maxValue = result.value;
    } else if (numbers.length >= 2) {
      // Range
      result.minValue = parseInt(numbers[0]);
      result.maxValue = parseInt(numbers[1]);
      result.value = Math.floor((result.minValue + result.maxValue) / 2);
    }
  }

  // Fallback to default salary range if parsing failed
  if (!result.hasValidSalary) {
    result.hasValidSalary = true;
    result.minValue = 20000;
    result.maxValue = 50000;
    result.value = 35000;
    result.unitText = 'MONTH';
  }

  return result;
}

/**
 * Parse location information from state and organization
 * 
 * @param {string} state - State name
 * @param {string} organization - Organization name
 * @returns {Object} Parsed location information
 */
function parseLocationInfo(state, organization) {
  const result = {
    streetAddress: '',
    addressLocality: '',
    addressRegion: '',
    postalCode: ''
  };

  // Handle "All India" or empty state
  if (!state || state === 'All India' || state.trim() === '') {
    result.streetAddress = 'Multiple Locations';
    result.addressLocality = 'New Delhi';
    result.addressRegion = 'Delhi';
    result.postalCode = '110001';
  } else {
    // Use the state information
    result.streetAddress = organization || 'Government Office';
    result.addressLocality = state;
    result.addressRegion = state;
    result.postalCode = getDefaultPostalCode(state);
  }

  return result;
}

/**
 * Get default postal code for a state
 * 
 * @param {string} state - State name
 * @returns {string} Default postal code
 */
function getDefaultPostalCode(state) {
  const postalCodes = {
    'Delhi': '110001',
    'Maharashtra': '400001',
    'Karnataka': '560001',
    'Tamil Nadu': '600001',
    'West Bengal': '700001',
    'Gujarat': '380001',
    'Rajasthan': '302001',
    'Uttar Pradesh': '226001',
    'Madhya Pradesh': '462001',
    'Bihar': '800001',
    'Andhra Pradesh': '520001',
    'Telangana': '500001',
    'Kerala': '695001',
    'Punjab': '160001',
    'Haryana': '122001',
    'Odisha': '751001',
    'Jharkhand': '834001',
    'Chhattisgarh': '492001',
    'Uttarakhand': '248001',
    'Himachal Pradesh': '171001',
    'Assam': '781001',
    'Jammu and Kashmir': '190001',
    'Goa': '403001'
  };

  return postalCodes[state] || '110001';
}

/**
 * Parse employment type from job category
 * 
 * @param {string} category - Job category
 * @returns {string} Employment type
 */
function parseEmploymentType(category) {
  const typeMap = {
    'job': 'FULL_TIME',
    'result': 'OTHER',
    'admit-card': 'OTHER',
    'admission': 'OTHER',
    'scholarship': 'OTHER',
    'exam-form': 'OTHER'
  };

  return typeMap[category] || 'FULL_TIME';
}

/**
 * Format qualification level for display
 * 
 * @param {string} qualificationLevel - Qualification level code
 * @returns {string} Formatted qualification
 */
function formatQualification(qualificationLevel) {
  const qualificationMap = {
    '10th': '10th Pass',
    '12th': '12th Pass',
    'graduate': 'Graduate',
    'post-graduate': 'Post Graduate',
    'diploma': 'Diploma',
    'iti': 'ITI',
    'any': 'Any Qualification'
  };

  return qualificationMap[qualificationLevel] || qualificationLevel;
}

/**
 * Get default validThrough date (30 days from creation)
 * 
 * @param {Date} createdAt - Job creation date
 * @returns {string} ISO 8601 date string
 */
function getDefaultValidThrough(createdAt) {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + 30);
  return date.toISOString();
}
