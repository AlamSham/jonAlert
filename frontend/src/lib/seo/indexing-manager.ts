// Indexing_Manager Component - Manages sitemaps, Search Console integration, and crawlability optimization

import { SEO_CONFIG } from './config';
import { seoCache, CacheKeys } from './cache';
import type { 
  SitemapEntry,
  SitemapImage,
  IndexingStatus,
  SubmissionResult,
  IndexingResult,
  ContentData
} from './interfaces';

export class IndexingManager {
  private readonly siteUrl = SEO_CONFIG.SITE_URL;
  private readonly siteName = SEO_CONFIG.SITE_NAME;

  /**
   * Generate comprehensive sitemap for different content types
   */
  async generateSitemap(contentType: 'jobs' | 'schemes' | 'results' | 'categories' | 'states' | 'all' = 'all'): Promise<SitemapEntry[]> {
    try {
      const cacheKey = CacheKeys.sitemap(contentType);
      const cached = seoCache.get<SitemapEntry[]>(cacheKey);
      if (cached) {
        return cached;
      }

      let sitemapEntries: SitemapEntry[] = [];

      switch (contentType) {
        case 'jobs':
          sitemapEntries = await this.generateJobsSitemap();
          break;
        case 'schemes':
          sitemapEntries = await this.generateSchemesSitemap();
          break;
        case 'results':
          sitemapEntries = await this.generateResultsSitemap();
          break;
        case 'categories':
          sitemapEntries = await this.generateCategoriesSitemap();
          break;
        case 'states':
          sitemapEntries = await this.generateStatesSitemap();
          break;
        case 'all':
          const [jobs, schemes, results, categories, states, static_pages] = await Promise.all([
            this.generateJobsSitemap(),
            this.generateSchemesSitemap(),
            this.generateResultsSitemap(),
            this.generateCategoriesSitemap(),
            this.generateStatesSitemap(),
            this.generateStaticPagesSitemap()
          ]);
          sitemapEntries = [...jobs, ...schemes, ...results, ...categories, ...states, ...static_pages];
          break;
        default:
          throw new Error(`Unknown content type: ${contentType}`);
      }

      // Sort by priority and last modified date
      sitemapEntries.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return b.lastModified.getTime() - a.lastModified.getTime();
      });

      // Cache the result
      seoCache.set(cacheKey, sitemapEntries, SEO_CONFIG.CACHE.TTL.SEO_DATA);

      return sitemapEntries;
    } catch (error) {
      console.error('Sitemap generation failed:', error);
      return this.generateFallbackSitemap();
    }
  }

  /**
   * Generate sitemap index for multiple sitemaps
   */
  async generateSitemapIndex(): Promise<{
    sitemaps: Array<{
      loc: string;
      lastmod: string;
      changefreq: string;
    }>;
    totalUrls: number;
  }> {
    try {
      const cacheKey = CacheKeys.sitemapIndex();
      const cached = seoCache.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const contentTypes: Array<'jobs' | 'schemes' | 'results' | 'categories' | 'states'> = ['jobs', 'schemes', 'results', 'categories', 'states'];
      const sitemaps = [];
      let totalUrls = 0;

      for (const type of contentTypes) {
        const entries = await this.generateSitemap(type);
        if (entries.length > 0) {
          sitemaps.push({
            loc: `${this.siteUrl}/sitemap-${type}.xml`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: this.getChangeFrequencyForType(type)
          });
          totalUrls += entries.length;
        }
      }

      // Add main sitemap for static pages
      sitemaps.push({
        loc: `${this.siteUrl}/sitemap-static.xml`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly'
      });

      const result = { sitemaps, totalUrls };

      // Cache the result
      seoCache.set(cacheKey, result, SEO_CONFIG.CACHE.TTL.SEO_DATA);

      return result;
    } catch (error) {
      console.error('Sitemap index generation failed:', error);
      return {
        sitemaps: [{
          loc: `${this.siteUrl}/sitemap.xml`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'daily'
        }],
        totalUrls: 0
      };
    }
  }

  /**
   * Generate XML sitemap content
   */
  generateSitemapXML(entries: SitemapEntry[]): string {
    try {
      // Handle null or undefined entries
      if (!entries || !Array.isArray(entries)) {
        return this.generateFallbackSitemapXML();
      }

      const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
      const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
      const urlsetClose = '</urlset>';

      const urls = entries.map(entry => {
        let urlXml = '  <url>\n';
        urlXml += `    <loc>${this.escapeXml(entry.url)}</loc>\n`;
        urlXml += `    <lastmod>${entry.lastModified.toISOString().split('T')[0]}</lastmod>\n`;
        urlXml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
        urlXml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;

        // Add image information if available
        if (entry.images && entry.images.length > 0) {
          entry.images.forEach(image => {
            urlXml += '    <image:image>\n';
            urlXml += `      <image:loc>${this.escapeXml(image.url)}</image:loc>\n`;
            if (image.caption) {
              urlXml += `      <image:caption>${this.escapeXml(image.caption)}</image:caption>\n`;
            }
            if (image.title) {
              urlXml += `      <image:title>${this.escapeXml(image.title)}</image:title>\n`;
            }
            urlXml += '    </image:image>\n';
          });
        }

        urlXml += '  </url>\n';
        return urlXml;
      }).join('');

      return xmlHeader + urlsetOpen + urls + urlsetClose;
    } catch (error) {
      console.error('XML sitemap generation failed:', error);
      return this.generateFallbackSitemapXML();
    }
  }

  /**
   * Generate sitemap index XML
   */
  generateSitemapIndexXML(sitemaps: Array<{ loc: string; lastmod: string; changefreq: string; }>): string {
    try {
      const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
      const sitemapIndexOpen = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      const sitemapIndexClose = '</sitemapindex>';

      const sitemapEntries = sitemaps.map(sitemap => {
        let sitemapXml = '  <sitemap>\n';
        sitemapXml += `    <loc>${this.escapeXml(sitemap.loc)}</loc>\n`;
        sitemapXml += `    <lastmod>${sitemap.lastmod}</lastmod>\n`;
        sitemapXml += '  </sitemap>\n';
        return sitemapXml;
      }).join('');

      return xmlHeader + sitemapIndexOpen + sitemapEntries + sitemapIndexClose;
    } catch (error) {
      console.error('Sitemap index XML generation failed:', error);
      return '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>';
    }
  }

  /**
   * Submit sitemap to search engines
   */
  async submitToSearchEngines(sitemapUrl: string): Promise<SubmissionResult> {
    try {
      const submittedUrls: string[] = [];
      const errors: string[] = [];

      // Google Search Console submission
      try {
        await this.submitToGoogleSearchConsole(sitemapUrl);
        submittedUrls.push('Google Search Console');
      } catch (error) {
        errors.push(`Google: ${(error as Error).message}`);
      }

      // Bing Webmaster Tools submission
      try {
        await this.submitToBingWebmaster(sitemapUrl);
        submittedUrls.push('Bing Webmaster Tools');
      } catch (error) {
        errors.push(`Bing: ${(error as Error).message}`);
      }

      return {
        success: submittedUrls.length > 0,
        message: submittedUrls.length > 0 
          ? `Sitemap submitted to: ${submittedUrls.join(', ')}`
          : 'Failed to submit sitemap to any search engine',
        submittedUrls,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return {
        success: false,
        message: `Sitemap submission failed: ${(error as Error).message}`,
        submittedUrls: [],
        errors: [(error as Error).message]
      };
    }
  }

  /**
   * Request indexing for specific URLs
   */
  async requestIndexing(urls: string[]): Promise<IndexingResult[]> {
    try {
      const results: IndexingResult[] = [];
      
      // Process URLs in batches to respect API limits
      const batchSize = SEO_CONFIG.APIS.GOOGLE_SEARCH_CONSOLE.BATCH_SIZE;
      
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        
        for (const url of batch) {
          try {
            const result = await this.requestSingleUrlIndexing(url);
            results.push(result);
            
            // Rate limiting
            await this.delay(1000); // 1 second between requests
          } catch (error) {
            results.push({
              url,
              success: false,
              message: `Indexing request failed: ${(error as Error).message}`
            });
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Batch indexing request failed:', error);
      return urls.map(url => ({
        url,
        success: false,
        message: `Batch indexing failed: ${(error as Error).message}`
      }));
    }
  }

  /**
   * Get indexing status for URLs
   */
  async getIndexingStatus(urls: string[]): Promise<IndexingStatus[]> {
    try {
      const statuses: IndexingStatus[] = [];
      
      for (const url of urls) {
        try {
          const status = await this.checkSingleUrlStatus(url);
          statuses.push(status);
        } catch (error) {
          statuses.push({
            url,
            status: 'error',
            issues: [(error as Error).message]
          });
        }
      }

      return statuses;
    } catch (error) {
      console.error('Indexing status check failed:', error);
      return urls.map(url => ({
        url,
        status: 'error',
        issues: [(error as Error).message]
      }));
    }
  }

  /**
   * Optimize URL structure for better crawlability
   */
  optimizeUrlStructure(baseUrl: string, params: {
    category?: string;
    state?: string;
    slug?: string;
    page?: number;
  }): string {
    try {
      // Handle empty or invalid base URL
      if (!baseUrl || typeof baseUrl !== 'string') {
        return baseUrl || '';
      }

      let optimizedUrl = baseUrl;

      // Add category in URL path for better SEO
      if (params.category) {
        optimizedUrl += `/category/${encodeURIComponent(params.category.toLowerCase().replace(/\s+/g, '-'))}`;
      }

      // Add state in URL path
      if (params.state) {
        optimizedUrl += `/state/${encodeURIComponent(params.state.toLowerCase().replace(/\s+/g, '-'))}`;
      }

      // Add slug for specific items
      if (params.slug) {
        optimizedUrl += `/${encodeURIComponent(params.slug)}`;
      }

      // Add pagination as query parameter (not in path for SEO)
      if (params.page && params.page > 1) {
        optimizedUrl += `?page=${params.page}`;
      }

      return optimizedUrl;
    } catch (error) {
      console.error('URL structure optimization failed:', error);
      return baseUrl;
    }
  }

  /**
   * Generate pagination markup for multi-page listings
   */
  generatePaginationMarkup(currentPage: number, totalPages: number, baseUrl: string): {
    prev?: string;
    next?: string;
    canonical: string;
  } {
    try {
      const markup: { prev?: string; next?: string; canonical: string } = {
        canonical: currentPage === 1 ? baseUrl : `${baseUrl}?page=${currentPage}`
      };

      if (currentPage > 1) {
        markup.prev = currentPage === 2 ? baseUrl : `${baseUrl}?page=${currentPage - 1}`;
      }

      if (currentPage < totalPages) {
        markup.next = `${baseUrl}?page=${currentPage + 1}`;
      }

      return markup;
    } catch (error) {
      console.error('Pagination markup generation failed:', error);
      return { canonical: baseUrl };
    }
  }

  /**
   * Private helper methods
   */
  private async generateJobsSitemap(): Promise<SitemapEntry[]> {
    try {
      // This would integrate with your job data source
      // For now, return sample structure
      const jobs = await this.fetchJobsData();
      
      return jobs.map(job => ({
        url: `${this.siteUrl}/job/${job.slug}`,
        lastModified: new Date(job.lastUpdated || Date.now()),
        changeFrequency: 'weekly',
        priority: this.calculateJobPriority(job),
        images: job.images ? job.images.map((img: any) => ({
          url: img.url,
          caption: img.caption,
          title: job.title
        })) : undefined
      }));
    } catch (error) {
      console.error('Jobs sitemap generation failed:', error);
      return [];
    }
  }

  private async generateSchemesSitemap(): Promise<SitemapEntry[]> {
    try {
      const schemes = await this.fetchSchemesData();
      
      return schemes.map(scheme => ({
        url: `${this.siteUrl}/schemes/${scheme.slug}`,
        lastModified: new Date(scheme.lastUpdated || Date.now()),
        changeFrequency: 'monthly',
        priority: this.calculateSchemePriority(scheme),
        images: scheme.images ? scheme.images.map((img: any) => ({
          url: img.url,
          caption: img.caption,
          title: scheme.title
        })) : undefined
      }));
    } catch (error) {
      console.error('Schemes sitemap generation failed:', error);
      return [];
    }
  }

  private async generateResultsSitemap(): Promise<SitemapEntry[]> {
    try {
      // Results pages are typically high-priority and frequently updated
      const results = await this.fetchResultsData();
      
      return results.map(result => ({
        url: `${this.siteUrl}/result/${result.slug}`,
        lastModified: new Date(result.lastUpdated || Date.now()),
        changeFrequency: 'daily',
        priority: 0.9, // High priority for results
      }));
    } catch (error) {
      console.error('Results sitemap generation failed:', error);
      return [];
    }
  }

  private async generateCategoriesSitemap(): Promise<SitemapEntry[]> {
    try {
      const categories = [
        'ssc', 'railway', 'banking', 'upsc', 'state-psc', 'teaching', 
        'police', 'defence', 'medical', 'engineering', 'clerk', 'officer'
      ];
      
      return categories.map(category => ({
        url: `${this.siteUrl}/jobs/category/${category}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8
      }));
    } catch (error) {
      console.error('Categories sitemap generation failed:', error);
      return [];
    }
  }

  private async generateStatesSitemap(): Promise<SitemapEntry[]> {
    try {
      const states = [
        'andhra-pradesh', 'arunachal-pradesh', 'assam', 'bihar', 'chhattisgarh',
        'goa', 'gujarat', 'haryana', 'himachal-pradesh', 'jharkhand', 'karnataka',
        'kerala', 'madhya-pradesh', 'maharashtra', 'manipur', 'meghalaya',
        'mizoram', 'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim',
        'tamil-nadu', 'telangana', 'tripura', 'uttar-pradesh', 'uttarakhand',
        'west-bengal', 'delhi', 'jammu-kashmir', 'ladakh'
      ];
      
      return states.map(state => ({
        url: `${this.siteUrl}/jobs/state/${state}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7
      }));
    } catch (error) {
      console.error('States sitemap generation failed:', error);
      return [];
    }
  }

  private async generateStaticPagesSitemap(): Promise<SitemapEntry[]> {
    try {
      const staticPages = [
        { url: '/', priority: 1.0, changeFreq: 'daily' },
        { url: '/jobs', priority: 0.9, changeFreq: 'hourly' },
        { url: '/schemes', priority: 0.9, changeFreq: 'daily' },
        { url: '/result', priority: 0.9, changeFreq: 'daily' },
        { url: '/admit-card', priority: 0.8, changeFreq: 'daily' },
        { url: '/about', priority: 0.5, changeFreq: 'monthly' },
        { url: '/contact', priority: 0.5, changeFreq: 'monthly' },
        { url: '/privacy-policy', priority: 0.3, changeFreq: 'yearly' },
        { url: '/disclaimer', priority: 0.3, changeFreq: 'yearly' }
      ];
      
      return staticPages.map(page => ({
        url: `${this.siteUrl}${page.url}`,
        lastModified: new Date(),
        changeFrequency: page.changeFreq as any,
        priority: page.priority
      }));
    } catch (error) {
      console.error('Static pages sitemap generation failed:', error);
      return [];
    }
  }

  private async fetchJobsData(): Promise<any[]> {
    // This would integrate with your actual job data source
    // For now, return empty array - will be implemented when integrating with backend
    return [];
  }

  private async fetchSchemesData(): Promise<any[]> {
    // This would integrate with your actual schemes data source
    return [];
  }

  private async fetchResultsData(): Promise<any[]> {
    // This would integrate with your actual results data source
    return [];
  }

  private calculateJobPriority(job: any): number {
    // Calculate priority based on job characteristics
    let priority = 0.6; // Base priority
    
    if (job.isLatest) priority += 0.2;
    if (job.isPopular) priority += 0.1;
    if (job.vacancyCount > 1000) priority += 0.1;
    
    return Math.min(priority, 1.0);
  }

  private calculateSchemePriority(scheme: any): number {
    // Calculate priority based on scheme characteristics
    let priority = 0.5; // Base priority
    
    if (scheme.isPopular) priority += 0.2;
    if (scheme.isActive) priority += 0.1;
    
    return Math.min(priority, 0.8);
  }

  private getChangeFrequencyForType(type: string): string {
    const frequencies: Record<string, string> = {
      'jobs': 'daily',
      'schemes': 'weekly',
      'results': 'daily',
      'categories': 'daily',
      'states': 'weekly'
    };
    
    return frequencies[type] || 'weekly';
  }

  private async submitToGoogleSearchConsole(sitemapUrl: string): Promise<void> {
    // This would implement actual Google Search Console API integration
    // For now, simulate the API call
    console.log(`Submitting sitemap to Google Search Console: ${sitemapUrl}`);
    
    // Simulate API delay
    await this.delay(1000);
    
    // In real implementation, this would use Google Search Console API
    // throw new Error('Google Search Console API not configured');
  }

  private async submitToBingWebmaster(sitemapUrl: string): Promise<void> {
    // This would implement actual Bing Webmaster Tools API integration
    console.log(`Submitting sitemap to Bing Webmaster Tools: ${sitemapUrl}`);
    
    // Simulate API delay
    await this.delay(1000);
    
    // In real implementation, this would use Bing Webmaster API
    // throw new Error('Bing Webmaster API not configured');
  }

  private async requestSingleUrlIndexing(url: string): Promise<IndexingResult> {
    // This would implement actual Google Indexing API
    console.log(`Requesting indexing for URL: ${url}`);
    
    // Simulate API delay
    await this.delay(500);
    
    return {
      url,
      success: true,
      message: 'Indexing request submitted successfully',
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  private async checkSingleUrlStatus(url: string): Promise<IndexingStatus> {
    // This would implement actual status checking via Search Console API
    console.log(`Checking indexing status for URL: ${url}`);
    
    // Simulate API delay
    await this.delay(300);
    
    // Simulate different statuses
    const statuses: IndexingStatus['status'][] = ['indexed', 'discovered', 'crawled', 'excluded'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      url,
      status: randomStatus,
      lastCrawled: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
      issues: randomStatus === 'excluded' ? ['Noindex directive found'] : undefined
    };
  }

  private generateFallbackSitemap(): SitemapEntry[] {
    return [
      {
        url: this.siteUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0
      }
    ];
  }

  private generateFallbackSitemapXML(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${this.siteUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }

  private escapeXml(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const indexingManager = new IndexingManager();