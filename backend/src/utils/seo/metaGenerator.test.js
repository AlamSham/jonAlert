import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateMetaTags,
  generateJobMetaTags,
  generateSchemeMetaTags,
  generateStaticPageMetaTags,
  generateCategoryMetaTags
} from './metaGenerator.js';

describe('Meta Tag Generator', () => {
  describe('generateMetaTags', () => {
    it('should generate basic meta tags with default values', () => {
      const result = generateMetaTags({});
      
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('canonical');
      expect(result).toHaveProperty('openGraph');
      expect(result).toHaveProperty('twitter');
      expect(result).toHaveProperty('robots');
      expect(result).toHaveProperty('keywords');
    });
    
    it('should validate title length between 50-60 characters', () => {
      const shortTitle = 'Short';
      const result = generateMetaTags({ title: shortTitle });
      
      expect(result.title.length).toBeGreaterThanOrEqual(50);
      expect(result.title.length).toBeLessThanOrEqual(60);
    });
    
    it('should truncate long titles to 60 characters', () => {
      const longTitle = 'This is a very long title that exceeds the maximum allowed length of sixty characters for SEO optimization';
      const result = generateMetaTags({ title: longTitle });
      
      expect(result.title.length).toBeLessThanOrEqual(60);
      expect(result.title).toContain('...');
    });
    
    it('should validate description length between 150-160 characters', () => {
      const description = 'This is a test description that should be validated for proper length according to SEO best practices. It needs to be between 150 and 160 characters long.';
      const result = generateMetaTags({ description });
      
      expect(result.description.length).toBeGreaterThanOrEqual(150);
      expect(result.description.length).toBeLessThanOrEqual(160);
    });
    
    it('should truncate long descriptions to 160 characters', () => {
      const longDescription = 'This is a very long description that exceeds the maximum allowed length of one hundred sixty characters for SEO optimization and needs to be truncated properly while preserving word boundaries.';
      const result = generateMetaTags({ description: longDescription });
      
      expect(result.description.length).toBeLessThanOrEqual(160);
      expect(result.description).toContain('...');
    });
    
    it('should generate Open Graph tags', () => {
      const options = {
        title: 'Test Page Title for Open Graph Meta Tags Testing',
        description: 'Test description for Open Graph meta tags that should be at least 150 characters long to meet SEO requirements and provide enough context for social sharing.',
        canonicalUrl: 'https://sarkaripulse.net/test',
        imageUrl: 'https://sarkaripulse.net/images/test.jpg'
      };
      
      const result = generateMetaTags(options);
      
      expect(result.openGraph).toHaveProperty('og:title');
      expect(result.openGraph).toHaveProperty('og:description');
      expect(result.openGraph).toHaveProperty('og:image');
      expect(result.openGraph).toHaveProperty('og:url');
      expect(result.openGraph).toHaveProperty('og:type');
      expect(result.openGraph).toHaveProperty('og:site_name');
      expect(result.openGraph['og:url']).toBe(options.canonicalUrl);
    });
    
    it('should generate Twitter Card tags', () => {
      const options = {
        title: 'Test Page Title for Twitter Card Meta Tags Testing',
        description: 'Test description for Twitter Card meta tags that should be at least 150 characters long to meet SEO requirements and provide enough context for social sharing.',
        imageUrl: 'https://sarkaripulse.net/images/test.jpg'
      };
      
      const result = generateMetaTags(options);
      
      expect(result.twitter).toHaveProperty('twitter:card');
      expect(result.twitter).toHaveProperty('twitter:title');
      expect(result.twitter).toHaveProperty('twitter:description');
      expect(result.twitter).toHaveProperty('twitter:image');
      expect(result.twitter['twitter:card']).toBe('summary_large_image');
    });
    
    it('should include keywords array', () => {
      const keywords = ['test', 'meta', 'tags', 'seo'];
      const result = generateMetaTags({ keywords });
      
      expect(result.keywords).toEqual(keywords);
    });
    
    it('should use default keywords if none provided', () => {
      const result = generateMetaTags({});
      
      expect(result.keywords).toBeInstanceOf(Array);
      expect(result.keywords.length).toBeGreaterThan(0);
    });
  });
  
  describe('generateJobMetaTags', () => {
    const mockJob = {
      title: 'Railway Recruitment 2024 - 5000 Posts',
      slug: 'railway-recruitment-2024-5000-posts',
      summary: 'Indian Railways is recruiting for 5000 posts across various categories. Eligible candidates can apply online through the official website.',
      organization: 'Indian Railways',
      state: 'All India',
      category: 'job',
      vacancyCount: 5000,
      lastDate: new Date('2024-12-31'),
      status: 'active',
      tags: ['railway', 'government', 'recruitment']
    };
    
    it('should generate meta tags for job posting', () => {
      const result = generateJobMetaTags(mockJob);
      
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('canonical');
      expect(result.title).toContain('Railway Recruitment');
    });
    
    it('should include organization in title', () => {
      const result = generateJobMetaTags(mockJob);
      
      expect(result.title).toContain('Indian Railways');
    });
    
    it('should include vacancy count in description', () => {
      const result = generateJobMetaTags(mockJob);
      
      expect(result.description).toContain('5000 vacancies');
    });
    
    it('should include last date in description', () => {
      const result = generateJobMetaTags(mockJob);
      
      expect(result.description).toContain('Apply by');
    });
    
    it('should use custom metaTitle if provided', () => {
      const jobWithCustomMeta = {
        ...mockJob,
        metaTitle: 'Custom Railway Job Title for SEO Optimization'
      };
      
      const result = generateJobMetaTags(jobWithCustomMeta);
      
      expect(result.title).toContain('Custom Railway Job Title');
    });
    
    it('should use custom metaDescription if provided', () => {
      const jobWithCustomMeta = {
        ...mockJob,
        metaDescription: 'Custom description for railway recruitment that is optimized for search engines and provides detailed information about the job posting and application process.'
      };
      
      const result = generateJobMetaTags(jobWithCustomMeta);
      
      expect(result.description).toContain('Custom description');
    });
    
    it('should set noindex for inactive jobs', () => {
      const inactiveJob = {
        ...mockJob,
        status: 'expired'
      };
      
      const result = generateJobMetaTags(inactiveJob);
      
      expect(result.robots).toBe('noindex,follow');
    });
    
    it('should include job tags in keywords', () => {
      const result = generateJobMetaTags(mockJob);
      
      expect(result.keywords).toContain('railway');
      expect(result.keywords).toContain('government');
      expect(result.keywords).toContain('recruitment');
    });
    
    it('should handle job without organization', () => {
      const jobWithoutOrg = {
        ...mockJob,
        organization: ''
      };
      
      const result = generateJobMetaTags(jobWithoutOrg);
      
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
    });
    
    it('should return default meta tags for null job', () => {
      const result = generateJobMetaTags(null);
      
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
    });
  });
  
  describe('generateSchemeMetaTags', () => {
    const mockScheme = {
      title: 'Pradhan Mantri Awas Yojana',
      slug: 'pradhan-mantri-awas-yojana',
      summary: 'Housing scheme for economically weaker sections providing financial assistance for construction of houses.',
      schemeType: 'central',
      state: 'All India',
      department: 'Ministry of Housing and Urban Affairs',
      tags: ['housing', 'central scheme', 'pmay']
    };
    
    it('should generate meta tags for scheme', () => {
      const result = generateSchemeMetaTags(mockScheme);
      
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('canonical');
      expect(result.title).toContain('Pradhan Mantri Awas Yojana');
    });
    
    it('should include scheme type in title', () => {
      const result = generateSchemeMetaTags(mockScheme);
      
      expect(result.title).toContain('Central Scheme');
    });
    
    it('should include department in description', () => {
      const result = generateSchemeMetaTags(mockScheme);
      
      expect(result.description).toContain('Ministry of Housing');
    });
    
    it('should use custom metaTitle if provided', () => {
      const schemeWithCustomMeta = {
        ...mockScheme,
        metaTitle: 'Custom PMAY Title for SEO Optimization Purpose'
      };
      
      const result = generateSchemeMetaTags(schemeWithCustomMeta);
      
      expect(result.title).toContain('Custom PMAY Title');
    });
    
    it('should use thumbnail image if available', () => {
      const schemeWithThumbnail = {
        ...mockScheme,
        thumbnailUrl: 'https://sarkaripulse.net/images/pmay.jpg'
      };
      
      const result = generateSchemeMetaTags(schemeWithThumbnail);
      
      expect(result.openGraph['og:image']).toBe(schemeWithThumbnail.thumbnailUrl);
    });
    
    it('should include scheme tags in keywords', () => {
      const result = generateSchemeMetaTags(mockScheme);
      
      expect(result.keywords).toContain('housing');
      expect(result.keywords).toContain('central scheme');
      expect(result.keywords).toContain('pmay');
    });
    
    it('should handle state scheme type', () => {
      const stateScheme = {
        ...mockScheme,
        schemeType: 'state',
        state: 'Maharashtra'
      };
      
      const result = generateSchemeMetaTags(stateScheme);
      
      expect(result.title).toContain('State Scheme');
      expect(result.title).toContain('Maharashtra');
    });
    
    it('should return default meta tags for null scheme', () => {
      const result = generateSchemeMetaTags(null);
      
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
    });
  });
  
  describe('generateStaticPageMetaTags', () => {
    it('should generate meta tags for about page', () => {
      const result = generateStaticPageMetaTags('about');
      
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('canonical');
      expect(result.canonical).toContain('/about');
    });
    
    it('should generate meta tags for contact page', () => {
      const result = generateStaticPageMetaTags('contact');
      
      expect(result.title).toContain('Contact');
      expect(result.canonical).toContain('/contact');
    });
    
    it('should generate meta tags for privacy-policy page', () => {
      const result = generateStaticPageMetaTags('privacy-policy');
      
      expect(result.title).toContain('Privacy Policy');
      expect(result.canonical).toContain('/privacy-policy');
    });
    
    it('should handle unknown static page', () => {
      const result = generateStaticPageMetaTags('unknown-page');
      
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result.canonical).toContain('/unknown-page');
    });
    
    it('should return default meta tags for empty page name', () => {
      const result = generateStaticPageMetaTags('');
      
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
    });
  });
  
  describe('generateCategoryMetaTags', () => {
    it('should generate meta tags for job category', () => {
      const result = generateCategoryMetaTags('job');
      
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('canonical');
      expect(result.title).toContain('Job');
    });
    
    it('should include state filter in title and description', () => {
      const result = generateCategoryMetaTags('job', { state: 'Maharashtra' });
      
      expect(result.title).toContain('Maharashtra');
      expect(result.description).toContain('Maharashtra');
    });
    
    it('should include qualification filter in title and description', () => {
      const result = generateCategoryMetaTags('job', { qualification: 'graduate' });
      
      expect(result.title).toContain('graduate');
      expect(result.description).toContain('graduate');
    });
    
    it('should include multiple filters', () => {
      const result = generateCategoryMetaTags('job', {
        state: 'Delhi',
        qualification: '12th'
      });
      
      expect(result.title).toContain('Delhi');
      expect(result.title).toContain('12th');
      expect(result.description).toContain('Delhi');
      expect(result.description).toContain('12th');
    });
    
    it('should normalize category name with hyphens', () => {
      const result = generateCategoryMetaTags('admit-card');
      
      expect(result.title).toContain('Admit Card');
    });
    
    it('should include category-specific keywords', () => {
      const result = generateCategoryMetaTags('result', { state: 'UP' });
      
      expect(result.keywords).toContain('Result');
      expect(result.keywords).toContain('UP jobs');
    });
    
    it('should return default meta tags for empty category', () => {
      const result = generateCategoryMetaTags('');
      
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
    });
  });
});
