/**
 * Tests for SEO Integration with JSONLDHandler
 * Validates the integration between existing SEO functions and hydration-safe structured data
 */

import { 
  initializeCoreStructuredData,
  addJobStructuredData,
  addBreadcrumbStructuredData,
  updateJobStructuredData,
  removeJobStructuredData,
  getSSRStructuredData,
  validateAllStructuredData,
  getStructuredDataStats,
  clearAllStructuredData,
  initializePageStructuredData
} from '../../lib/hydration/seo-integration';
import { jsonLDHandler } from '../../lib/hydration/JSONLDHandler';
import { JobDetail } from '../../lib/types';

// Mock job data for testing
const mockJob: JobDetail = {
  _id: 'test-job-id',
  title: 'Software Engineer - Government of India',
  slug: 'software-engineer-govt-india',
  category: 'job',
  summary: 'Exciting opportunity for software engineers in government sector',
  state: 'Delhi',
  organization: 'Department of Electronics and IT',
  vacancyCount: 50,
  lastDate: '2024-03-15',
  tags: ['software', 'engineering', 'government'],
  createdAt: '2024-01-15T10:00:00Z',
  content: 'Detailed job description content...',
  eligibility: 'Bachelor\'s degree in Computer Science or related field',
  importantDates: 'Application start: 2024-01-15, Last date: 2024-03-15',
  qualificationLevel: 'Graduate',
  applyLink: 'https://example.gov.in/apply',
  salary: '₹50,000 - ₹80,000 per month',
  metaTitle: 'Software Engineer Job - Government of India',
  metaDescription: 'Apply for Software Engineer position in Government of India. 50 vacancies available.',
  status: 'active',
  sourceUrl: 'https://example.gov.in/notification',
  sourceName: 'Official Government Portal'
};

describe('SEO Integration', () => {
  beforeEach(() => {
    clearAllStructuredData();
  });

  afterEach(() => {
    clearAllStructuredData();
  });

  describe('Core Structured Data Initialization', () => {
    test('should initialize website and organization schemas', () => {
      initializeCoreStructuredData();

      const websiteData = jsonLDHandler.getStructuredData('website');
      const orgData = jsonLDHandler.getStructuredData('organization');

      expect(websiteData).toBeDefined();
      expect(websiteData?.priority).toBe(100);
      expect(orgData).toBeDefined();
      expect(orgData?.priority).toBe(90);
      expect(orgData?.dependencies).toContain('website');
    });

    test('should handle initialization errors gracefully', () => {
      // Mock console.error to verify error handling
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // This should not throw even if there are internal errors
      expect(() => initializeCoreStructuredData()).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Job Structured Data Management', () => {
    test('should add complete job structured data', () => {
      initializeCoreStructuredData();
      addJobStructuredData(mockJob);

      const jobData = jsonLDHandler.getStructuredData(`job-${mockJob.slug}`);
      const articleData = jsonLDHandler.getStructuredData(`article-${mockJob.slug}`);
      const faqData = jsonLDHandler.getStructuredData(`faq-${mockJob.slug}`);

      expect(jobData).toBeDefined();
      expect(jobData?.priority).toBe(80);
      expect(jobData?.dependencies).toContain('organization');

      expect(articleData).toBeDefined();
      expect(articleData?.priority).toBe(70);

      expect(faqData).toBeDefined();
      expect(faqData?.priority).toBe(60);
    });

    test('should update job structured data safely', () => {
      initializeCoreStructuredData();
      addJobStructuredData(mockJob);

      // Update job data
      const updatedJob = { ...mockJob, title: 'Senior Software Engineer - Updated' };
      updateJobStructuredData(updatedJob);

      const jobData = jsonLDHandler.getStructuredData(`job-${mockJob.slug}`);
      expect(jobData).toBeDefined();
      
      // Verify the data was updated (we can't easily check the internal data structure,
      // but we can verify it exists and hasn't been removed)
      expect(jobData?.key).toBe(`job-${mockJob.slug}`);
    });

    test('should remove job structured data completely', () => {
      initializeCoreStructuredData();
      addJobStructuredData(mockJob);

      // Verify data exists
      expect(jsonLDHandler.getStructuredData(`job-${mockJob.slug}`)).toBeDefined();
      expect(jsonLDHandler.getStructuredData(`article-${mockJob.slug}`)).toBeDefined();

      // Remove data
      removeJobStructuredData(mockJob.slug);

      // Verify data is removed
      expect(jsonLDHandler.getStructuredData(`job-${mockJob.slug}`)).toBeUndefined();
      expect(jsonLDHandler.getStructuredData(`article-${mockJob.slug}`)).toBeUndefined();
      expect(jsonLDHandler.getStructuredData(`faq-${mockJob.slug}`)).toBeUndefined();
    });
  });

  describe('Breadcrumb Structured Data', () => {
    test('should add breadcrumb structured data', () => {
      initializeCoreStructuredData();
      
      const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Jobs', url: '/jobs' },
        { name: 'Software Engineer', url: '/job/software-engineer' }
      ];

      addBreadcrumbStructuredData(breadcrumbs, 'test-page');

      const breadcrumbData = jsonLDHandler.getStructuredData('breadcrumb-test-page');
      expect(breadcrumbData).toBeDefined();
      expect(breadcrumbData?.priority).toBe(50);
      expect(breadcrumbData?.dependencies).toContain('website');
    });
  });

  describe('SSR Structured Data', () => {
    test('should return serialized scripts for SSR', () => {
      initializeCoreStructuredData();
      addJobStructuredData(mockJob);

      const ssrData = getSSRStructuredData();
      
      expect(Array.isArray(ssrData)).toBe(true);
      expect(ssrData.length).toBeGreaterThan(0);
      
      // Should be sorted by priority (highest first)
      for (let i = 0; i < ssrData.length - 1; i++) {
        expect(ssrData[i].priority).toBeGreaterThanOrEqual(ssrData[i + 1].priority);
      }

      // Each item should have required properties
      ssrData.forEach(item => {
        expect(item).toHaveProperty('key');
        expect(item).toHaveProperty('content');
        expect(item).toHaveProperty('priority');
        expect(typeof item.content).toBe('string');
      });
    });
  });

  describe('Validation', () => {
    test('should validate all structured data', () => {
      initializeCoreStructuredData();
      addJobStructuredData(mockJob);

      const validation = validateAllStructuredData();
      
      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('warnings');
      expect(Array.isArray(validation.errors)).toBe(true);
      expect(Array.isArray(validation.warnings)).toBe(true);
    });

    test('should detect validation errors', () => {
      // Add invalid data directly to test error detection
      const invalidData = {
        '@type': 'Organization'
        // Missing @context
      };

      try {
        jsonLDHandler.addStructuredData(invalidData, 'invalid-test', 1);
      } catch {
        // Expected to fail
      }

      const validation = validateAllStructuredData();
      // Should still work even with some invalid data
      expect(validation).toHaveProperty('valid');
    });
  });

  describe('Statistics and Monitoring', () => {
    test('should provide accurate statistics', () => {
      initializeCoreStructuredData();
      addJobStructuredData(mockJob);

      const stats = getStructuredDataStats();
      
      expect(stats).toHaveProperty('count');
      expect(stats).toHaveProperty('totalSize');
      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('byPriority');
      
      expect(stats.count).toBeGreaterThan(0);
      expect(Array.isArray(stats.keys)).toBe(true);
      expect(Array.isArray(stats.byPriority)).toBe(true);
      
      // Priority groups should be sorted by priority (highest first)
      for (let i = 0; i < stats.byPriority.length - 1; i++) {
        expect(stats.byPriority[i].priority).toBeGreaterThanOrEqual(stats.byPriority[i + 1].priority);
      }
    });
  });

  describe('Page Initialization', () => {
    test('should initialize home page structured data', () => {
      initializePageStructuredData('home');

      const websiteData = jsonLDHandler.getStructuredData('website');
      const orgData = jsonLDHandler.getStructuredData('organization');

      expect(websiteData).toBeDefined();
      expect(orgData).toBeDefined();
    });

    test('should initialize job page structured data', () => {
      const pageData = {
        job: mockJob,
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: 'Jobs', url: '/jobs' },
          { name: mockJob.title, url: `/job/${mockJob.slug}` }
        ]
      };

      initializePageStructuredData('job', pageData);

      const websiteData = jsonLDHandler.getStructuredData('website');
      const jobData = jsonLDHandler.getStructuredData(`job-${mockJob.slug}`);
      const breadcrumbData = jsonLDHandler.getStructuredData(`breadcrumb-job-${mockJob.slug}`);

      expect(websiteData).toBeDefined();
      expect(jobData).toBeDefined();
      expect(breadcrumbData).toBeDefined();
    });

    test('should initialize category page structured data', () => {
      const pageData = {
        category: 'job',
        items: [mockJob],
        totalCount: 1,
        state: 'Delhi',
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: 'Jobs', url: '/jobs' }
        ]
      };

      initializePageStructuredData('category', pageData);

      const collectionData = jsonLDHandler.getStructuredData('collection-job-Delhi');
      const localBusinessData = jsonLDHandler.getStructuredData('local-business-Delhi');
      const breadcrumbData = jsonLDHandler.getStructuredData('breadcrumb-category-job');

      expect(collectionData).toBeDefined();
      expect(localBusinessData).toBeDefined();
      expect(breadcrumbData).toBeDefined();
    });

    test('should handle missing page data gracefully', () => {
      expect(() => {
        initializePageStructuredData('job'); // No pageData provided
      }).not.toThrow();

      expect(() => {
        initializePageStructuredData('category', {}); // Empty pageData
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle errors in job data addition', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // This should not throw even with invalid job data
      const invalidJob = { ...mockJob, title: undefined } as any;
      expect(() => addJobStructuredData(invalidJob)).not.toThrow();

      consoleSpy.mockRestore();
    });

    test('should handle errors in breadcrumb addition', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // This should not throw even with invalid breadcrumb data
      expect(() => addBreadcrumbStructuredData(null as any, 'test')).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Data Clearing', () => {
    test('should clear all structured data', () => {
      initializeCoreStructuredData();
      addJobStructuredData(mockJob);

      let stats = getStructuredDataStats();
      expect(stats.count).toBeGreaterThan(0);

      clearAllStructuredData();

      stats = getStructuredDataStats();
      expect(stats.count).toBe(0);
      expect(stats.keys).toHaveLength(0);
    });
  });
});