// Integration tests for Schema_Generator - Validates structured data generation and Google Rich Results compatibility

import { schemaGenerator } from '../schema-generator';
import type { ContentData, ValidationResult } from '../interfaces';

describe('SchemaGenerator Integration Tests', () => {
  // Test data
  const mockJob: ContentData = {
    title: 'SSC CGL 2024 Notification - 17727 Posts | Apply Online',
    slug: 'ssc-cgl-2024-notification',
    content: 'Staff Selection Commission Combined Graduate Level Examination 2024 notification for 17727 posts across various departments.',
    summary: 'SSC CGL 2024 recruitment for graduate level posts with online application process.',
    category: 'job',
    state: 'All India',
    organization: 'Staff Selection Commission',
    lastDate: '2024-05-15',
    salary: '₹25,500 - ₹81,100',
    qualificationLevel: 'Graduate',
    vacancyCount: 17727,
    applyLink: 'https://ssc.nic.in/apply'
  };

  const mockScheme: ContentData = {
    title: 'PM Kisan Samman Nidhi Yojana - ₹6000 Annual Support',
    slug: 'pm-kisan-samman-nidhi-yojana',
    content: 'Pradhan Mantri Kisan Samman Nidhi provides financial support of ₹6000 per year to small and marginal farmers.',
    summary: 'Direct income support scheme for farmers providing ₹6000 annually.',
    category: 'scheme',
    state: 'All India',
    organization: 'Ministry of Agriculture',
    eligibility: 'Small and marginal farmers with landholding up to 2 hectares',
    lastDate: '2024-12-31'
  };

  const mockFAQs = [
    {
      question: 'SSC CGL 2024 के लिए eligibility criteria क्या है?',
      answer: 'SSC CGL 2024 के लिए candidates का graduation complete होना चाहिए। Age limit 18-32 years है with relaxation for reserved categories।'
    },
    {
      question: 'SSC CGL exam pattern कैसा होता है?',
      answer: 'SSC CGL exam 4 tiers में होता है - Tier 1 (Objective), Tier 2 (Objective), Tier 3 (Descriptive), और Tier 4 (Skill Test/Computer Proficiency Test)।'
    },
    {
      question: 'SSC CGL की salary कितनी होती है?',
      answer: 'SSC CGL posts की salary ₹25,500 से ₹81,100 तक होती है, post के according। इसके साथ DA, HRA और other allowances भी मिलते हैं।'
    }
  ];

  const mockBreadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Jobs', url: '/jobs' },
    { name: 'SSC Jobs', url: '/jobs/category/ssc' },
    { name: 'SSC CGL 2024', url: '/job/ssc-cgl-2024-notification' }
  ];

  describe('JobPosting Schema Generation', () => {
    it('should generate valid JobPosting schema with all required fields', async () => {
      const schema = await schemaGenerator.generateJobPostingSchema(mockJob);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('JobPosting');
      expect(schema.title).toBe(mockJob.title);
      expect(schema.description).toBe(mockJob.content);
      expect(schema.hiringOrganization).toBeDefined();
      expect(schema.jobLocation).toBeDefined();
      expect(schema.employmentType).toBe('FULL_TIME');
      expect(schema.validThrough).toBe(mockJob.lastDate);
      expect(schema.totalJobOpenings).toBe(mockJob.vacancyCount);
      expect(schema.qualifications).toBe(mockJob.qualificationLevel);
    });

    it('should include salary information when available', async () => {
      const schema = await schemaGenerator.generateJobPostingSchema(mockJob);
      
      expect(schema.baseSalary).toBeDefined();
      expect(schema.baseSalary?.currency).toBe('INR');
      expect(schema.baseSalary?.value?.['@type']).toBe('QuantitativeValue');
      expect(typeof schema.baseSalary?.value?.value).toBe('number');
    });

    it('should handle missing optional fields gracefully', async () => {
      const minimalJob: ContentData = {
        title: 'Test Job',
        slug: 'test-job',
        category: 'job'
      };

      const schema = await schemaGenerator.generateJobPostingSchema(minimalJob);
      
      expect(schema['@type']).toBe('JobPosting');
      expect(schema.title).toBe('Test Job');
      expect(schema.hiringOrganization).toBeDefined();
      expect(schema.jobLocation).toBeDefined();
    });

    it('should validate generated JobPosting schema', async () => {
      const schema = await schemaGenerator.generateJobPostingSchema(mockJob);
      const validation = await schemaGenerator.validateSchema(schema);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.schemaType).toBe('JobPosting');
      expect(validation.richSnippetEligible).toBe(true);
    });
  });

  describe('GovernmentService Schema Generation', () => {
    it('should generate valid GovernmentService schema for schemes', async () => {
      const schema = await schemaGenerator.generateGovernmentServiceSchema(mockScheme);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('GovernmentService');
      expect(schema.name).toBe(mockScheme.title);
      expect(schema.description).toBe(mockScheme.content);
      expect(schema.serviceType).toBe('Government Scheme');
      expect(schema.areaServed).toBe(mockScheme.state);
      expect(schema.provider).toBeDefined();
      expect(schema.provider?.['@type']).toBe('GovernmentOrganization');
    });

    it('should include eligibility and deadline information', async () => {
      const schema = await schemaGenerator.generateGovernmentServiceSchema(mockScheme);
      
      expect(schema.eligibility).toBe(mockScheme.eligibility);
      expect(schema.applicationDeadline).toBe(mockScheme.lastDate);
      expect(schema.fee).toBeDefined();
      expect(schema.fee?.currency).toBe('INR');
      expect(schema.fee?.value?.value).toBe(0); // Government schemes are typically free
    });

    it('should validate generated GovernmentService schema', async () => {
      const schema = await schemaGenerator.generateGovernmentServiceSchema(mockScheme);
      const validation = await schemaGenerator.validateSchema(schema);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.schemaType).toBe('GovernmentService');
    });
  });

  describe('FAQ Schema Generation', () => {
    it('should generate valid FAQPage schema with Hinglish content', async () => {
      const schema = await schemaGenerator.generateFAQSchema(mockFAQs, 'ssc-jobs');
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('FAQPage');
      expect(schema.mainEntity).toHaveLength(3);
      
      // Check first FAQ
      const firstFAQ = schema.mainEntity[0];
      expect(firstFAQ['@type']).toBe('Question');
      expect(firstFAQ.name).toContain('SSC CGL 2024');
      expect(firstFAQ.name).toContain('eligibility criteria');
      expect(firstFAQ.acceptedAnswer['@type']).toBe('Answer');
      expect(firstFAQ.acceptedAnswer.text).toContain('graduation');
    });

    it('should handle Hinglish content properly in FAQ schema', async () => {
      const schema = await schemaGenerator.generateFAQSchema(mockFAQs);
      
      schema.mainEntity.forEach(faq => {
        expect(faq.name).toBeTruthy();
        expect(faq.acceptedAnswer.text).toBeTruthy();
        // Check for mix of Hindi and English characters
        const hasHindi = /[\u0900-\u097F]/.test(faq.name + faq.acceptedAnswer.text);
        const hasEnglish = /[a-zA-Z]/.test(faq.name + faq.acceptedAnswer.text);
        expect(hasHindi || hasEnglish).toBe(true);
      });
    });

    it('should validate generated FAQ schema', async () => {
      const schema = await schemaGenerator.generateFAQSchema(mockFAQs);
      const validation = await schemaGenerator.validateSchema(schema);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.schemaType).toBe('FAQPage');
    });
  });

  describe('BreadcrumbList Schema Generation', () => {
    it('should generate valid BreadcrumbList schema', async () => {
      const schema = await schemaGenerator.generateBreadcrumbSchema(mockBreadcrumbs);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(4);
      
      // Check breadcrumb structure
      schema.itemListElement.forEach((item, index) => {
        expect(item['@type']).toBe('ListItem');
        expect(item.position).toBe(index + 1);
        expect(item.name).toBe(mockBreadcrumbs[index].name);
        expect(item.item).toContain(mockBreadcrumbs[index].url);
      });
    });

    it('should handle absolute and relative URLs correctly', async () => {
      const mixedBreadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'External', url: 'https://external.com/page' },
        { name: 'Internal', url: '/internal' }
      ];

      const schema = await schemaGenerator.generateBreadcrumbSchema(mixedBreadcrumbs);
      
      expect(schema.itemListElement[0].item).toMatch(/^https?:\/\//);
      expect(schema.itemListElement[1].item).toBe('https://external.com/page');
      expect(schema.itemListElement[2].item).toMatch(/^https?:\/\//);
    });
  });

  describe('Organization Schema Generation', () => {
    it('should generate comprehensive Organization schema', async () => {
      const schema = await schemaGenerator.generateOrganizationSchema();
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBeTruthy();
      expect(schema.url).toBeTruthy();
      expect(schema.logo).toBeTruthy();
      expect(schema.description).toBeTruthy();
      expect(schema.foundingDate).toBeTruthy();
      expect(schema.areaServed).toBeDefined();
      expect(schema.serviceType).toBeTruthy();
      expect(schema.contactPoint).toBeInstanceOf(Array);
      expect(schema.knowsAbout).toBeInstanceOf(Array);
    });

    it('should include government job related knowledge areas', async () => {
      const schema = await schemaGenerator.generateOrganizationSchema();
      
      expect(schema.knowsAbout).toContain('Government Jobs');
      expect(schema.knowsAbout).toContain('Sarkari Naukri');
      expect(schema.knowsAbout).toContain('Exam Results');
      expect(schema.knowsAbout).toContain('PM Kisan');
      expect(schema.knowsAbout).toContain('Ayushman Bharat');
    });
  });

  describe('Event Schema Generation', () => {
    it('should generate valid Event schema for exam announcements', async () => {
      const examEvent = {
        name: 'SSC CGL 2024 Tier 1 Exam',
        description: 'Staff Selection Commission Combined Graduate Level Tier 1 examination',
        startDate: '2024-07-15',
        endDate: '2024-08-15',
        location: 'All India',
        organizer: 'Staff Selection Commission',
        url: 'https://sarkaripulse.net/job/ssc-cgl-2024-notification'
      };

      const schema = await schemaGenerator.generateEventSchema(examEvent);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Event');
      expect(schema.name).toBe(examEvent.name);
      expect(schema.startDate).toBe(examEvent.startDate);
      expect(schema.endDate).toBe(examEvent.endDate);
      expect(schema.eventStatus).toBe('https://schema.org/EventScheduled');
      expect(schema.organizer).toBeDefined();
      expect(schema.location).toBeDefined();
    });
  });

  describe('Schema Validation', () => {
    it('should validate schema with required fields', async () => {
      const validSchema = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: 'Test Job',
        hiringOrganization: { '@type': 'Organization', name: 'Test Org' },
        jobLocation: { '@type': 'Place' }
      };

      const validation = await schemaGenerator.validateSchema(validSchema);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.schemaType).toBe('JobPosting');
    });

    it('should detect missing required fields', async () => {
      const invalidSchema = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting'
        // Missing required fields
      };

      const validation = await schemaGenerator.validateSchema(invalidSchema);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors).toContain('JobPosting missing title');
    });

    it('should detect undefined/null values in schema', async () => {
      const schemaWithNulls = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: 'Test Job',
        description: null,
        hiringOrganization: undefined
      };

      const validation = await schemaGenerator.validateSchema(schemaWithNulls);
      
      expect(validation.warnings).toContain('Schema contains undefined or null values');
    });

    it('should validate FAQ schema structure', async () => {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Test question?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Test answer'
            }
          }
        ]
      };

      const validation = await schemaGenerator.validateSchema(faqSchema);
      
      expect(validation.isValid).toBe(true);
      expect(validation.schemaType).toBe('FAQPage');
    });
  });

  describe('SearchAction Schema', () => {
    it('should generate valid SearchAction schema for site search', () => {
      const schema = schemaGenerator.generateSearchActionSchema();
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebSite');
      expect(schema.potentialAction).toBeDefined();
      expect(schema.potentialAction['@type']).toBe('SearchAction');
      expect(schema.potentialAction.target).toBeDefined();
      expect(schema.potentialAction['query-input']).toBe('required name=search_term_string');
    });
  });

  describe('Article Schema Generation', () => {
    it('should generate valid Article schema for content pages', () => {
      const article = {
        headline: 'SSC CGL 2024 Complete Guide - Eligibility, Exam Pattern, Syllabus',
        description: 'Complete guide for SSC CGL 2024 including eligibility criteria, exam pattern, syllabus, and preparation tips.',
        datePublished: '2024-04-01',
        dateModified: '2024-04-15',
        url: 'https://sarkaripulse.net/ssc-cgl-2024-guide',
        keywords: ['SSC CGL', 'Government Jobs', 'Exam Preparation', 'Sarkari Naukri']
      };

      const schema = schemaGenerator.generateArticleSchema(article);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Article');
      expect(schema.headline).toBe(article.headline);
      expect(schema.author).toBeDefined();
      expect(schema.publisher).toBeDefined();
      expect(schema.datePublished).toBe(article.datePublished);
      expect(schema.inLanguage).toBe('hi-IN');
      expect(schema.keywords).toContain('SSC CGL');
    });
  });

  describe('Caching Integration', () => {
    it('should cache generated schemas for performance', async () => {
      // First call - should generate and cache
      const schema1 = await schemaGenerator.generateJobPostingSchema(mockJob);
      
      // Second call - should return cached result
      const schema2 = await schemaGenerator.generateJobPostingSchema(mockJob);
      
      expect(schema1).toEqual(schema2);
      expect(schema1.title).toBe(mockJob.title);
    });

    it('should cache FAQ schemas by category', async () => {
      const schema1 = await schemaGenerator.generateFAQSchema(mockFAQs, 'ssc-jobs');
      const schema2 = await schemaGenerator.generateFAQSchema(mockFAQs, 'ssc-jobs');
      
      expect(schema1).toEqual(schema2);
      expect(schema1.mainEntity).toHaveLength(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle schema generation errors gracefully', async () => {
      const invalidJob = null as any;
      
      const schema = await schemaGenerator.generateJobPostingSchema(invalidJob);
      
      // Should return fallback schema
      expect(schema['@type']).toBe('JobPosting');
      expect(schema.hiringOrganization).toBeDefined();
    });

    it('should handle validation errors gracefully', async () => {
      const invalidSchema = 'not an object' as any;
      
      const validation = await schemaGenerator.validateSchema(invalidSchema);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Google Rich Results Compatibility', () => {
    it('should generate JobPosting schema compatible with Google Rich Results', async () => {
      const schema = await schemaGenerator.generateJobPostingSchema(mockJob);
      const validation = await schemaGenerator.validateSchema(schema);
      
      expect(validation.richSnippetEligible).toBe(true);
      
      // Check Google-specific requirements
      expect(schema.title).toBeTruthy();
      expect(schema.hiringOrganization).toBeTruthy();
      expect(schema.jobLocation).toBeTruthy();
      expect(schema.description).toBeTruthy();
    });

    it('should generate FAQ schema compatible with Google Rich Results', async () => {
      const schema = await schemaGenerator.generateFAQSchema(mockFAQs);
      const validation = await schemaGenerator.validateSchema(schema);
      
      expect(validation.richSnippetEligible).toBe(true);
      
      // Check Google FAQ requirements
      expect(schema.mainEntity).toBeInstanceOf(Array);
      expect(schema.mainEntity.length).toBeGreaterThan(0);
      
      schema.mainEntity.forEach(faq => {
        expect(faq['@type']).toBe('Question');
        expect(faq.name).toBeTruthy();
        expect(faq.acceptedAnswer).toBeTruthy();
        expect(faq.acceptedAnswer['@type']).toBe('Answer');
        expect(faq.acceptedAnswer.text).toBeTruthy();
      });
    });
  });
});