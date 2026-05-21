/**
 * Unit tests for Structured Data Generator
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateJobPostingSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateJobBreadcrumbs,
  generateSchemeBreadcrumbs,
  generateCategoryBreadcrumbs,
  generateStaticPageBreadcrumbs
} from './structuredDataGenerator.js';

// Mock the dependencies
vi.mock('../../config/env.js', () => ({
  env: {
    baseUrl: 'https://sarkaripulse.net',
    enableSeoValidation: false
  }
}));

vi.mock('./urlManager.js', () => ({
  buildJobUrl: (job) => `https://sarkaripulse.net/job/${job.slug}`,
  buildSchemeUrl: (scheme) => `https://sarkaripulse.net/scheme/${scheme.slug}`,
  getCanonicalUrl: (path) => `https://sarkaripulse.net${path}`
}));

vi.mock('./schemaValidator.js', () => ({
  validateSchema: () => ({ valid: true, errors: [], warnings: [] })
}));

describe('generateJobPostingSchema', () => {
  let mockJob;

  beforeEach(() => {
    mockJob = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Railway Recruitment 2024',
      slug: 'railway-recruitment-2024',
      summary: 'Apply for Railway jobs across India',
      content: 'Detailed information about railway recruitment',
      category: 'job',
      state: 'All India',
      organization: 'Indian Railways',
      salary: '25000-50000 per month',
      lastDate: new Date('2024-12-31'),
      eligibility: '10th Pass',
      applyLink: 'https://indianrailways.gov.in/apply',
      sourceId: 'railway-2024-001',
      publishedAt: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01')
    };
  });

  it('should generate valid JobPosting schema with all fields', () => {
    const schema = generateJobPostingSchema(mockJob);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('JobPosting');
    expect(schema.title).toBe('Railway Recruitment 2024');
    expect(schema.description).toBe('Apply for Railway jobs across India');
    expect(schema.hiringOrganization.name).toBe('Indian Railways');
    expect(schema.jobLocation['@type']).toBe('Place');
    expect(schema.jobLocation.address['@type']).toBe('PostalAddress');
  });

  it('should parse salary information correctly', () => {
    const schema = generateJobPostingSchema(mockJob);

    expect(schema.baseSalary).toBeDefined();
    expect(schema.baseSalary['@type']).toBe('MonetaryAmount');
    expect(schema.baseSalary.currency).toBe('INR');
    expect(schema.baseSalary.value.minValue).toBe(25000);
    expect(schema.baseSalary.value.maxValue).toBe(50000);
    expect(schema.baseSalary.value.unitText).toBe('MONTH');
  });

  it('should handle missing salary gracefully', () => {
    mockJob.salary = '';
    const schema = generateJobPostingSchema(mockJob);

    expect(schema.baseSalary).toBeUndefined();
  });

  it('should use default address for "All India" state', () => {
    const schema = generateJobPostingSchema(mockJob);

    expect(schema.jobLocation.address.addressLocality).toBe('New Delhi');
    expect(schema.jobLocation.address.addressCountry).toBe('IN');
  });

  it('should use specific state when provided', () => {
    mockJob.state = 'Maharashtra';
    const schema = generateJobPostingSchema(mockJob);

    expect(schema.jobLocation.address.addressLocality).toBe('Maharashtra');
    expect(schema.jobLocation.address.addressRegion).toBe('Maharashtra');
  });

  it('should include qualifications when eligibility is present', () => {
    const schema = generateJobPostingSchema(mockJob);

    expect(schema.qualifications).toBe('10th Pass');
  });

  it('should include validThrough when lastDate is present', () => {
    const schema = generateJobPostingSchema(mockJob);

    expect(schema.validThrough).toBeDefined();
    expect(new Date(schema.validThrough)).toEqual(mockJob.lastDate);
  });

  it('should throw error when job is missing', () => {
    expect(() => generateJobPostingSchema(null)).toThrow('Job object with title is required');
  });

  it('should throw error when job title is missing', () => {
    expect(() => generateJobPostingSchema({})).toThrow('Job object with title is required');
  });

  it('should determine employment type based on category', () => {
    const schema = generateJobPostingSchema(mockJob);
    expect(schema.employmentType).toBe('FULL_TIME');

    mockJob.category = 'scholarship';
    const schemaScholarship = generateJobPostingSchema(mockJob);
    expect(schemaScholarship.employmentType).toBe('OTHER');
  });
});

describe('generateFAQSchema', () => {
  it('should generate valid FAQPage schema', () => {
    const faqs = [
      { question: 'What is the eligibility?', answer: '10th Pass' },
      { question: 'How to apply?', answer: 'Visit official website' }
    ];

    const schema = generateFAQSchema(faqs);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity).toHaveLength(2);
    expect(schema.mainEntity[0]['@type']).toBe('Question');
    expect(schema.mainEntity[0].name).toBe('What is the eligibility?');
    expect(schema.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe('10th Pass');
  });

  it('should handle alternative property names', () => {
    const faqs = [
      { name: 'Question 1', text: 'Answer 1' }
    ];

    const schema = generateFAQSchema(faqs);

    expect(schema.mainEntity[0].name).toBe('Question 1');
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe('Answer 1');
  });

  it('should throw error when faqs array is empty', () => {
    expect(() => generateFAQSchema([])).toThrow('FAQs array is required and must not be empty');
  });

  it('should throw error when faqs is not an array', () => {
    expect(() => generateFAQSchema(null)).toThrow('FAQs array is required and must not be empty');
  });
});

describe('generateBreadcrumbSchema', () => {
  it('should generate valid BreadcrumbList schema', () => {
    const breadcrumbs = [
      { name: 'Home', url: 'https://sarkaripulse.net' },
      { name: 'Jobs', url: 'https://sarkaripulse.net/jobs' },
      { name: 'Railway Jobs', url: 'https://sarkaripulse.net/job/railway-recruitment-2024' }
    ];

    const schema = generateBreadcrumbSchema(breadcrumbs);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[0].name).toBe('Home');
    expect(schema.itemListElement[2].position).toBe(3);
  });

  it('should handle alternative property names', () => {
    const breadcrumbs = [
      { label: 'Home', href: 'https://sarkaripulse.net' }
    ];

    const schema = generateBreadcrumbSchema(breadcrumbs);

    expect(schema.itemListElement[0].name).toBe('Home');
    expect(schema.itemListElement[0].item).toBe('https://sarkaripulse.net');
  });

  it('should throw error when breadcrumbs array is empty', () => {
    expect(() => generateBreadcrumbSchema([])).toThrow('Breadcrumbs array is required and must not be empty');
  });
});

describe('generateOrganizationSchema', () => {
  it('should generate valid Organization schema', () => {
    const schema = generateOrganizationSchema();

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('Sarkari Pulse');
    expect(schema.url).toBe('https://sarkaripulse.net');
    expect(schema.logo).toBe('https://sarkaripulse.net/logo.png');
    expect(schema.contactPoint).toBeDefined();
    expect(schema.sameAs).toBeInstanceOf(Array);
  });
});

describe('generateWebSiteSchema', () => {
  it('should generate valid WebSite schema with search action', () => {
    const schema = generateWebSiteSchema();

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('WebSite');
    expect(schema.name).toBe('Sarkari Pulse');
    expect(schema.potentialAction).toBeDefined();
    expect(schema.potentialAction['@type']).toBe('SearchAction');
    expect(schema.potentialAction.target.urlTemplate).toContain('/search?q=');
  });
});

describe('generateJobBreadcrumbs', () => {
  it('should generate breadcrumbs for job posting', () => {
    const job = {
      title: 'Railway Recruitment 2024',
      slug: 'railway-recruitment-2024',
      category: 'job'
    };

    const breadcrumbs = generateJobBreadcrumbs(job);

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[0].name).toBe('Home');
    expect(breadcrumbs[1].name).toBe('Job');
    expect(breadcrumbs[2].name).toBe('Railway Recruitment 2024');
  });

  it('should handle multi-word categories', () => {
    const job = {
      title: 'Test',
      slug: 'test',
      category: 'admit-card'
    };

    const breadcrumbs = generateJobBreadcrumbs(job);

    expect(breadcrumbs[1].name).toBe('Admit Card');
  });
});

describe('generateSchemeBreadcrumbs', () => {
  it('should generate breadcrumbs for scheme page', () => {
    const scheme = {
      title: 'PM Kisan Yojana',
      slug: 'pm-kisan-yojana',
      schemeType: 'central'
    };

    const breadcrumbs = generateSchemeBreadcrumbs(scheme);

    expect(breadcrumbs).toHaveLength(4);
    expect(breadcrumbs[0].name).toBe('Home');
    expect(breadcrumbs[1].name).toBe('Schemes');
    expect(breadcrumbs[2].name).toBe('Central Schemes');
    expect(breadcrumbs[3].name).toBe('PM Kisan Yojana');
  });
});

describe('generateCategoryBreadcrumbs', () => {
  it('should generate breadcrumbs for category page', () => {
    const breadcrumbs = generateCategoryBreadcrumbs('job');

    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0].name).toBe('Home');
    expect(breadcrumbs[1].name).toBe('Job');
  });

  it('should include state filter in breadcrumbs', () => {
    const breadcrumbs = generateCategoryBreadcrumbs('job', { state: 'Maharashtra' });

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[2].name).toBe('Maharashtra');
  });

  it('should not include "All India" state in breadcrumbs', () => {
    const breadcrumbs = generateCategoryBreadcrumbs('job', { state: 'All India' });

    expect(breadcrumbs).toHaveLength(2);
  });
});

describe('generateStaticPageBreadcrumbs', () => {
  it('should generate breadcrumbs for static page', () => {
    const breadcrumbs = generateStaticPageBreadcrumbs('about', 'About Us');

    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0].name).toBe('Home');
    expect(breadcrumbs[1].name).toBe('About Us');
    expect(breadcrumbs[1].url).toBe('https://sarkaripulse.net/about');
  });
});
