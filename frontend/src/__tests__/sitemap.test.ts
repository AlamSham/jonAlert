/**
 * @jest-environment node
 */

import sitemap from '../app/sitemap';

// Mock the API functions
jest.mock('../lib/api', () => ({
  getLatestJobs: jest.fn().mockResolvedValue([
    {
      slug: 'test-job-1',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      slug: 'test-job-2', 
      createdAt: '2024-01-02T00:00:00Z',
    },
  ]),
  getStats: jest.fn().mockResolvedValue({
    topStates: [
      { state: 'Delhi', count: 100 },
      { state: 'Mumbai', count: 80 },
      { state: 'Bangalore', count: 60 },
    ],
  }),
}));

describe('Sitemap Generation', () => {
  beforeEach(() => {
    // Set environment variable for consistent testing
    process.env.NEXT_PUBLIC_SITE_URL = 'https://sarkaripulse.net';
  });

  it('should generate sitemap with all required pages', async () => {
    const sitemapData = await sitemap();
    
    // Check that sitemap is an array
    expect(Array.isArray(sitemapData)).toBe(true);
    
    // Check minimum expected URLs
    expect(sitemapData.length).toBeGreaterThan(20);
    
    // Check homepage with correct priority and changeFrequency
    const homepage = sitemapData.find(url => url.url === 'https://sarkaripulse.net/');
    expect(homepage).toBeDefined();
    expect(homepage?.priority).toBe(1.0);
    expect(homepage?.changeFrequency).toBe('hourly');
    
    // Check legal pages with correct priority and changeFrequency
    const legalPages = ['privacy-policy', 'cookie-policy', 'disclaimer'];
    legalPages.forEach(page => {
      const pageUrl = sitemapData.find(url => url.url === `https://sarkaripulse.net/${page}`);
      expect(pageUrl).toBeDefined();
      expect(pageUrl?.priority).toBe(0.4);
      expect(pageUrl?.changeFrequency).toBe('monthly');
    });
    
    // Check category pages with correct priority
    const categories = ['jobs', 'admission', 'scholarship', 'result', 'admit-card', 'exam-form'];
    categories.forEach(category => {
      const categoryUrl = sitemapData.find(url => url.url === `https://sarkaripulse.net/${category}`);
      expect(categoryUrl).toBeDefined();
      expect(categoryUrl?.priority).toBe(0.8);
      expect(categoryUrl?.changeFrequency).toBe('daily');
    });
    
    // Check qualification pages
    const qualificationPages = [
      'search?q=10th+pass',
      'search?q=12th+pass', 
      'search?q=graduate',
      'search?q=post+graduate',
    ];
    qualificationPages.forEach(page => {
      const pageUrl = sitemapData.find(url => url.url === `https://sarkaripulse.net/${page}`);
      expect(pageUrl).toBeDefined();
      expect(pageUrl?.priority).toBe(0.6);
      expect(pageUrl?.changeFrequency).toBe('daily');
    });
    
    // Check state-specific pages
    const statePages = sitemapData.filter(url => url.url.includes('/state/'));
    expect(statePages.length).toBeGreaterThan(0);
    statePages.forEach(page => {
      expect(page.priority).toBe(0.6);
      expect(page.changeFrequency).toBe('daily');
    });
    
    // Check job pages
    const jobPages = sitemapData.filter(url => url.url.includes('/job/'));
    expect(jobPages.length).toBeGreaterThan(0);
    jobPages.forEach(page => {
      expect(page.priority).toBe(0.7);
      expect(page.changeFrequency).toBe('daily');
    });
  });

  it('should include lastModified timestamp for all URLs', async () => {
    const sitemapData = await sitemap();
    
    sitemapData.forEach(url => {
      expect(url.lastModified).toBeDefined();
      expect(url.lastModified).toBeInstanceOf(Date);
    });
  });

  it('should not exceed 50,000 URLs', async () => {
    const sitemapData = await sitemap();
    expect(sitemapData.length).toBeLessThanOrEqual(50000);
  });

  it('should handle API errors gracefully', async () => {
    // Mock API to throw errors
    const { getLatestJobs, getStats } = require('../lib/api');
    getLatestJobs.mockRejectedValueOnce(new Error('API Error'));
    getStats.mockRejectedValueOnce(new Error('API Error'));
    
    const sitemapData = await sitemap();
    
    // Should still generate basic sitemap even with API errors
    expect(Array.isArray(sitemapData)).toBe(true);
    expect(sitemapData.length).toBeGreaterThan(10);
    
    // Should still include static and legal pages
    const homepage = sitemapData.find(url => url.url === 'https://sarkaripulse.net/');
    expect(homepage).toBeDefined();
  });
});