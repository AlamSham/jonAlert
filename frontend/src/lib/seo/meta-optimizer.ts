// Meta_Optimizer Component - Manages all meta tags, robots directives, and technical SEO elements

import { SEO_CONFIG } from './config';
import { seoCache, CacheKeys } from './cache';
import type { 
  MetaTagSet, 
  RobotsDirective, 
  HreflangTag, 
  OpenGraphTags, 
  TwitterCardTags,
  ContentData 
} from './interfaces';

export class MetaOptimizer {
  private readonly siteUrl = SEO_CONFIG.SITE_URL;
  private readonly siteName = SEO_CONFIG.SITE_NAME;

  /**
   * Generate comprehensive meta tags for a page
   */
  async generateMetaTags(pageData: {
    url: string;
    title: string;
    description: string;
    keywords?: string[];
    pageType: string;
    category?: string;
    state?: string;
    content?: ContentData;
  }): Promise<MetaTagSet> {
    try {
      // Check cache first
      const cacheKey = CacheKeys.metaTags(pageData.url);
      const cached = seoCache.get<MetaTagSet>(cacheKey);
      if (cached) {
        return cached;
      }

      const metaTags: MetaTagSet = {
        title: pageData.title,
        description: pageData.description,
        keywords: pageData.keywords || [],
        robots: this.optimizeRobotsTags(pageData.pageType).index ? 'index,follow' : 'noindex,nofollow',
        canonical: this.generateCanonicalUrl(pageData.url),
        hreflang: this.generateHreflangTags(pageData),
        openGraph: this.optimizeOpenGraph(pageData),
        twitterCard: this.generateTwitterCards(pageData)
      };

      // Cache the result
      seoCache.set(cacheKey, metaTags, SEO_CONFIG.CACHE.TTL.SEO_DATA);

      return metaTags;
    } catch (error) {
      console.error('Meta tag generation failed:', error);
      return this.generateFallbackMetaTags(pageData);
    }
  }

  /**
   * Optimize robots meta tags based on page type
   */
  optimizeRobotsTags(pageType: string): RobotsDirective {
    const robotsConfig: Record<string, RobotsDirective> = {
      'detail': {
        index: true,
        follow: true,
        maxSnippet: -1,
        maxImagePreview: 'large'
      },
      'category': {
        index: true,
        follow: true,
        maxSnippet: 300,
        maxImagePreview: 'large'
      },
      'state': {
        index: true,
        follow: true,
        maxSnippet: 250,
        maxImagePreview: 'standard'
      },
      'search': {
        index: false, // Don't index search result pages
        follow: true,
        noarchive: true
      },
      'homepage': {
        index: true,
        follow: true,
        maxSnippet: -1,
        maxImagePreview: 'large'
      }
    };

    return robotsConfig[pageType] || {
      index: true,
      follow: true
    };
  }

  /**
   * Generate canonical URL with proper formatting
   */
  generateCanonicalUrl(path: string, params?: URLSearchParams): string {
    try {
      // Clean the path
      let cleanPath = path.startsWith('/') ? path : `/${path}`;
      
      // Remove duplicate slashes
      cleanPath = cleanPath.replace(/\/+/g, '/');
      
      // Remove trailing slash except for root
      if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
        cleanPath = cleanPath.slice(0, -1);
      }

      // Build URL
      let canonicalUrl = `${this.siteUrl}${cleanPath}`;

      // Add allowed parameters (like page for pagination)
      if (params) {
        const allowedParams = ['page'];
        const filteredParams = new URLSearchParams();
        
        allowedParams.forEach(param => {
          const value = params.get(param);
          if (value && value !== '1') { // Don't include page=1
            filteredParams.set(param, value);
          }
        });

        if (filteredParams.toString()) {
          canonicalUrl += `?${filteredParams.toString()}`;
        }
      }

      return canonicalUrl;
    } catch (error) {
      console.error('Canonical URL generation failed:', error);
      return `${this.siteUrl}${path}`;
    }
  }

  /**
   * Generate hreflang tags for Hindi/English content variations
   */
  generateHreflangTags(pageData: { url: string; state?: string }): HreflangTag[] {
    const hreflangTags: HreflangTag[] = [];
    const baseUrl = this.generateCanonicalUrl(pageData.url);

    // Default Hindi (India) - our primary language
    hreflangTags.push({
      hreflang: 'hi-IN',
      href: baseUrl
    });

    // English (India) - secondary language
    hreflangTags.push({
      hreflang: 'en-IN',
      href: baseUrl
    });

    // Default Hindi for broader reach
    hreflangTags.push({
      hreflang: 'hi',
      href: baseUrl
    });

    // X-default for international users
    hreflangTags.push({
      hreflang: 'x-default',
      href: baseUrl
    });

    return hreflangTags;
  }

  /**
   * Optimize Open Graph tags
   */
  optimizeOpenGraph(pageData: {
    title: string;
    description: string;
    url: string;
    pageType: string;
    category?: string;
    content?: ContentData;
  }): OpenGraphTags {
    const ogTags: OpenGraphTags = {
      title: this.truncateForOG(pageData.title, 60),
      description: this.truncateForOG(pageData.description, 155),
      type: pageData.pageType === 'detail' ? 'article' : 'website',
      url: this.generateCanonicalUrl(pageData.url),
      image: this.generateOGImage(pageData),
      siteName: this.siteName,
      locale: 'hi_IN'
    };

    return ogTags;
  }

  /**
   * Generate Twitter Card tags
   */
  generateTwitterCards(pageData: {
    title: string;
    description: string;
    url: string;
    pageType: string;
    category?: string;
  }): TwitterCardTags {
    return {
      card: 'summary_large_image',
      title: this.truncateForTwitter(pageData.title, 70),
      description: this.truncateForTwitter(pageData.description, 200),
      image: this.generateOGImage(pageData),
      site: '@sarkaripulse' // Add when Twitter account is available
    };
  }

  /**
   * Remove noindex directives from important pages
   */
  async removeNoindexDirectives(urls: string[]): Promise<{ success: boolean; updated: string[]; errors: string[] }> {
    const updated: string[] = [];
    const errors: string[] = [];

    for (const url of urls) {
      try {
        // Check if page currently has noindex
        const currentRobots = this.optimizeRobotsTags(this.getPageTypeFromUrl(url));
        
        if (!currentRobots.index) {
          // Update to allow indexing
          const newRobots: RobotsDirective = {
            ...currentRobots,
            index: true,
            follow: true
          };

          // Cache the updated robots directive
          const cacheKey = `robots:${url}`;
          seoCache.set(cacheKey, newRobots);
          updated.push(url);
        }
      } catch (error) {
        console.error(`Failed to update robots for ${url}:`, error);
        errors.push(url);
      }
    }

    return {
      success: errors.length === 0,
      updated,
      errors
    };
  }

  /**
   * Add proper meta robots tags to search and category pages
   */
  addProperRobotsToPages(pageTypes: string[]): Record<string, RobotsDirective> {
    const robotsMap: Record<string, RobotsDirective> = {};

    pageTypes.forEach(pageType => {
      robotsMap[pageType] = this.optimizeRobotsTags(pageType);
    });

    return robotsMap;
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(): string {
    const robotsTxt = `# Robots.txt for ${this.siteName}
User-agent: *
Allow: /

# Important pages
Allow: /jobs
Allow: /result
Allow: /admit-card
Allow: /admission
Allow: /scholarship
Allow: /exam-form
Allow: /schemes

# Sitemaps
Sitemap: ${this.siteUrl}/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1

# Block unnecessary paths
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /private/

# Allow specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Block aggressive crawlers
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10`;

    return robotsTxt;
  }

  /**
   * Validate and fix meta tag issues
   */
  validateAndFixMetaTags(metaTags: MetaTagSet): {
    isValid: boolean;
    issues: string[];
    fixed: MetaTagSet;
  } {
    const issues: string[] = [];
    const fixed: MetaTagSet = { ...metaTags };

    // Validate title length
    if (metaTags.title.length > SEO_CONFIG.MAX_TITLE_LENGTH) {
      issues.push(`Title too long: ${metaTags.title.length} chars`);
      fixed.title = this.truncateForOG(metaTags.title, SEO_CONFIG.MAX_TITLE_LENGTH);
    }

    // Validate description length
    if (metaTags.description.length > SEO_CONFIG.MAX_DESCRIPTION_LENGTH) {
      issues.push(`Description too long: ${metaTags.description.length} chars`);
      fixed.description = this.truncateForOG(metaTags.description, SEO_CONFIG.MAX_DESCRIPTION_LENGTH);
    }

    // Validate canonical URL format
    try {
      new URL(metaTags.canonical);
    } catch {
      issues.push('Invalid canonical URL format');
      fixed.canonical = this.siteUrl;
    }

    // Validate hreflang tags
    metaTags.hreflang.forEach((tag, index) => {
      try {
        new URL(tag.href);
      } catch {
        issues.push(`Invalid hreflang URL at index ${index}`);
        fixed.hreflang[index] = {
          ...tag,
          href: this.siteUrl
        };
      }
    });

    return {
      isValid: issues.length === 0,
      issues,
      fixed
    };
  }

  /**
   * Private helper methods
   */
  private generateFallbackMetaTags(pageData: any): MetaTagSet {
    return {
      title: pageData.title || 'SarkariPulse - Latest Government Jobs',
      description: pageData.description || 'Latest sarkari naukri notifications and updates',
      keywords: pageData.keywords || ['sarkari naukri', 'government jobs'],
      robots: 'index,follow',
      canonical: this.generateCanonicalUrl(pageData.url),
      hreflang: [{
        hreflang: 'hi-IN',
        href: this.generateCanonicalUrl(pageData.url)
      }],
      openGraph: {
        title: pageData.title || 'SarkariPulse',
        description: pageData.description || 'Latest government jobs',
        type: 'website',
        url: this.generateCanonicalUrl(pageData.url),
        image: `${this.siteUrl}/logo.jpg`,
        siteName: this.siteName,
        locale: 'hi_IN'
      },
      twitterCard: {
        card: 'summary_large_image',
        title: pageData.title || 'SarkariPulse',
        description: pageData.description || 'Latest government jobs'
      }
    };
  }

  private truncateForOG(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }

  private truncateForTwitter(text: string, maxLength: number): string {
    return this.truncateForOG(text, maxLength);
  }

  private generateOGImage(pageData: {
    title: string;
    category?: string;
    pageType: string;
  }): string {
    return `${this.siteUrl}/logo.jpg`;
  }

  private getPageTypeFromUrl(url: string): string {
    if (url.includes('/job/')) return 'detail';
    if (url.includes('/jobs')) return 'category';
    if (url.includes('/result')) return 'category';
    if (url.includes('/admit-card')) return 'category';
    if (url.includes('/schemes')) return 'category';
    if (url.includes('/state/')) return 'state';
    if (url.includes('/search')) return 'search';
    if (url === '/' || url === '') return 'homepage';
    
    return 'category';
  }
}

// Export singleton instance
export const metaOptimizer = new MetaOptimizer();
