import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateSitemap,
  generateJobSitemapEntries,
  generateSchemeSitemapEntries,
  generateStaticPageSitemapEntries,
  formatSitemapEntry
} from './sitemapGenerator.js';
import { Job } from '../../models/Job.js';
import { Scheme } from '../../models/Scheme.js';

// Mock the models
vi.mock('../../models/Job.js');
vi.mock('../../models/Scheme.js');

describe('Sitemap Generator', () => {
  describe('formatSitemapEntry', () => {
    it('should format a complete sitemap entry', () => {
      const entry = {
        loc: 'https://sarkaripulse.net/job/test-job',
        lastmod: '2024-01-15',
        changefreq: 'daily',
        priority: 0.8
      };

      const xml = formatSitemapEntry(entry);

      expect(xml).toContain('<url>');
      expect(xml).toContain('<loc>https://sarkaripulse.net/job/test-job</loc>');
      expect(xml).toContain('<lastmod>2024-01-15</lastmod>');
      expect(xml).toContain('<changefreq>daily</changefreq>');
      expect(xml).toContain('<priority>0.8</priority>');
      expect(xml).toContain('</url>');
    });

    it('should format entry with only required loc field', () => {
      const entry = {
        loc: 'https://sarkaripulse.net/about'
      };

      const xml = formatSitemapEntry(entry);

      expect(xml).toContain('<loc>https://sarkaripulse.net/about</loc>');
      expect(xml).not.toContain('<lastmod>');
      expect(xml).not.toContain('<changefreq>');
      expect(xml).not.toContain('<priority>');
    });

    it('should escape XML special characters in URL', () => {
      const entry = {
        loc: 'https://sarkaripulse.net/job?id=1&category=test'
      };

      const xml = formatSitemapEntry(entry);

      expect(xml).toContain('&amp;');
      expect(xml).not.toContain('&category');
    });

    it('should return empty string for entry without loc', () => {
      const entry = {
        lastmod: '2024-01-15',
        changefreq: 'daily'
      };

      const xml = formatSitemapEntry(entry);

      expect(xml).toBe('');
    });

    it('should format priority with one decimal place', () => {
      const entry = {
        loc: 'https://sarkaripulse.net/test',
        priority: 0.85
      };

      const xml = formatSitemapEntry(entry);

      expect(xml).toContain('<priority>0.9</priority>');
    });
  });

  describe('generateStaticPageSitemapEntries', () => {
    it('should generate entries for all static pages', () => {
      const entries = generateStaticPageSitemapEntries();

      expect(entries).toBeInstanceOf(Array);
      expect(entries.length).toBeGreaterThan(0);

      // Check homepage entry
      const homepage = entries.find(e => e.loc === 'https://sarkaripulse.net');
      expect(homepage).toBeDefined();
      expect(homepage.priority).toBe(1.0);
      expect(homepage.changefreq).toBe('daily');
    });

    it('should include all required fields for each entry', () => {
      const entries = generateStaticPageSitemapEntries();

      entries.forEach(entry => {
        expect(entry).toHaveProperty('loc');
        expect(entry).toHaveProperty('lastmod');
        expect(entry).toHaveProperty('changefreq');
        expect(entry).toHaveProperty('priority');
      });
    });

    it('should use configuration values for static pages', () => {
      const entries = generateStaticPageSitemapEntries();

      // Find about page
      const aboutPage = entries.find(e => e.loc.includes('/about'));
      expect(aboutPage).toBeDefined();
      expect(aboutPage.priority).toBe(0.7);
      expect(aboutPage.changefreq).toBe('monthly');
    });
  });

  describe('generateJobSitemapEntries', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should generate entries for active jobs', async () => {
      const mockJobs = [
        {
          slug: 'railway-recruitment-2024',
          title: 'Railway Recruitment 2024',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          category: 'job',
          status: 'active'
        },
        {
          slug: 'bank-po-exam-2024',
          title: 'Bank PO Exam 2024',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18'),
          category: 'job',
          status: 'active'
        }
      ];

      // Mock the Job.find chain
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(mockJobs)
      };

      Job.find = vi.fn().mockReturnValue(mockQuery);

      const entries = await generateJobSitemapEntries();

      expect(Job.find).toHaveBeenCalledWith({ status: 'active' });
      expect(entries).toHaveLength(2);
      expect(entries[0].loc).toContain('railway-recruitment-2024');
      expect(entries[0].changefreq).toBe('daily');
      expect(entries[0].priority).toBe(0.8);
    });

    it('should use updatedAt for lastmod if available', async () => {
      const mockJobs = [
        {
          slug: 'test-job',
          title: 'Test Job',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          category: 'job',
          status: 'active'
        }
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(mockJobs)
      };

      Job.find = vi.fn().mockReturnValue(mockQuery);

      const entries = await generateJobSitemapEntries();

      expect(entries[0].lastmod).toBe('2024-01-20');
    });

    it('should return empty array on database error', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockRejectedValue(new Error('Database error'))
      };

      Job.find = vi.fn().mockReturnValue(mockQuery);

      const entries = await generateJobSitemapEntries();

      expect(entries).toEqual([]);
    });
  });

  describe('generateSchemeSitemapEntries', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should generate entries for all schemes', async () => {
      const mockSchemes = [
        {
          slug: 'pm-kisan-yojana',
          title: 'PM Kisan Yojana',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-15')
        },
        {
          slug: 'ayushman-bharat',
          title: 'Ayushman Bharat',
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-12')
        }
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(mockSchemes)
      };

      Scheme.find = vi.fn().mockReturnValue(mockQuery);

      const entries = await generateSchemeSitemapEntries();

      expect(Scheme.find).toHaveBeenCalledWith({});
      expect(entries).toHaveLength(2);
      expect(entries[0].loc).toContain('pm-kisan-yojana');
      expect(entries[0].changefreq).toBe('weekly');
      expect(entries[0].priority).toBe(0.7);
    });

    it('should return empty array on database error', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockRejectedValue(new Error('Database error'))
      };

      Scheme.find = vi.fn().mockReturnValue(mockQuery);

      const entries = await generateSchemeSitemapEntries();

      expect(entries).toEqual([]);
    });
  });

  describe('generateSitemap', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should generate complete XML sitemap', async () => {
      // Mock job entries
      const mockJobQuery = {
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([
          {
            slug: 'test-job',
            title: 'Test Job',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-20'),
            category: 'job',
            status: 'active'
          }
        ])
      };

      Job.find = vi.fn().mockReturnValue(mockJobQuery);

      // Mock scheme entries
      const mockSchemeQuery = {
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([
          {
            slug: 'test-scheme',
            title: 'Test Scheme',
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-15')
          }
        ])
      };

      Scheme.find = vi.fn().mockReturnValue(mockSchemeQuery);

      const sitemap = await generateSitemap();

      // Check XML structure
      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(sitemap).toContain('</urlset>');

      // Check that it includes entries from all sources
      expect(sitemap).toContain('test-job');
      expect(sitemap).toContain('test-scheme');
      expect(sitemap).toContain('sarkaripulse.net'); // Homepage
    });

    it('should handle errors gracefully', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockRejectedValue(new Error('Database error'))
      };

      Job.find = vi.fn().mockReturnValue(mockQuery);
      Scheme.find = vi.fn().mockReturnValue(mockQuery);

      await expect(generateSitemap()).rejects.toThrow('Failed to generate sitemap');
    });
  });
});
