// Schema_Generator Component - Generates comprehensive structured data markup for rich snippets

import { SEO_CONFIG, STRUCTURED_DATA_CONFIG } from './config';
import { structuredDataCache, CacheKeys } from './cache';
import type { 
  JobPostingSchema,
  GovernmentServiceSchema,
  FAQPageSchema,
  FAQQuestion,
  BreadcrumbListSchema,
  BreadcrumbItem,
  OrganizationSchema,
  ValidationResult,
  ContentData
} from './interfaces';

export class SchemaGenerator {
  private readonly siteUrl = SEO_CONFIG.SITE_URL;
  private readonly siteName = SEO_CONFIG.SITE_NAME;

  /**
   * Generate JobPosting structured data for individual job pages
   */
  async generateJobPostingSchema(job: ContentData): Promise<JobPostingSchema> {
    try {
      // Check cache first
      const cacheKey = CacheKeys.jobPostingSchema(job.slug || job.title);
      const cached = structuredDataCache.get<JobPostingSchema>(cacheKey);
      if (cached) {
        return cached;
      }

      const jobAddress = this.buildJobAddress(job);
      const schema: JobPostingSchema = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: job.content || job.summary || job.title,
        datePosted: (job as any).createdAt,
        hiringOrganization: {
          '@type': 'Organization',
          name: job.organization || 'Government of India',
          url: job.organization ? `${this.siteUrl}/organization/${this.slugify(job.organization)}` : this.siteUrl
        },
        jobLocation: {
          '@type': 'Place',
          name: jobAddress.addressLocality || jobAddress.addressRegion || 'India',
          address: jobAddress
        },
        employmentType: 'FULL_TIME'
      };

      // Add optional fields
      if (job.lastDate) {
        schema.validThrough = job.lastDate;
      }

      if (job.salary) {
        schema.baseSalary = {
          '@type': 'MonetaryAmount',
          currency: 'INR',
          value: {
            '@type': 'QuantitativeValue',
            value: this.extractSalaryValue(job.salary)
          }
        };
      }

      if (job.qualificationLevel) {
        schema.qualifications = job.qualificationLevel;
      }

      if (job.vacancyCount && job.vacancyCount > 0) {
        schema.totalJobOpenings = job.vacancyCount;
      }

      if (job.applyLink) {
        schema.directApply = true;
        schema.applicationContact = {
          '@type': 'ContactPoint',
          contactType: 'application',
          url: job.applyLink
        };
      }

      // Add job benefits for government jobs
      if (job.category === 'job') {
        schema.jobBenefits = 'Government job benefits including pension, medical allowance, job security, and career growth opportunities';
      }

      // Cache the result
      structuredDataCache.set(cacheKey, schema, SEO_CONFIG.CACHE.TTL.STRUCTURED_DATA);

      return schema;
    } catch (error) {
      console.error('JobPosting schema generation failed:', error);
      return this.generateFallbackJobSchema(job);
    }
  }

  /**
   * Generate GovernmentService structured data for scheme pages
   */
  async generateGovernmentServiceSchema(scheme: ContentData): Promise<GovernmentServiceSchema> {
    try {
      const cacheKey = CacheKeys.jobPostingSchema(scheme.slug || scheme.title); // Reuse cache key pattern
      const cached = structuredDataCache.get<GovernmentServiceSchema>(cacheKey);
      if (cached) {
        return cached;
      }

      const schema: GovernmentServiceSchema = {
        '@context': 'https://schema.org',
        '@type': 'GovernmentService',
        name: scheme.title,
        description: scheme.content || scheme.summary || scheme.title,
        serviceType: scheme.category === 'scheme' ? 'Government Scheme' : 'Government Service',
        areaServed: scheme.state || 'India',
        provider: {
          '@type': 'GovernmentOrganization',
          name: scheme.organization || 'Government of India',
          url: this.siteUrl
        },
        url: `${this.siteUrl}/schemes/${scheme.slug}`
      };

      // Add optional fields
      if (scheme.eligibility) {
        schema.eligibility = scheme.eligibility;
      }

      if (scheme.lastDate) {
        schema.applicationDeadline = scheme.lastDate;
      }

      // Most government schemes are free
      schema.fee = {
        '@type': 'MonetaryAmount',
        currency: 'INR',
        value: {
          '@type': 'QuantitativeValue',
          value: 0
        }
      };

      // Cache the result
      structuredDataCache.set(cacheKey, schema, SEO_CONFIG.CACHE.TTL.STRUCTURED_DATA);

      return schema;
    } catch (error) {
      console.error('GovernmentService schema generation failed:', error);
      return this.generateFallbackSchemeSchema(scheme);
    }
  }

  /**
   * Generate FAQ structured data for category pages
   */
  async generateFAQSchema(questions: Array<{ question: string; answer: string }>, category?: string): Promise<FAQPageSchema> {
    try {
      const cacheKey = CacheKeys.faqSchema(category || 'general');
      const cached = structuredDataCache.get<FAQPageSchema>(cacheKey);
      if (cached) {
        return cached;
      }

      const faqQuestions: FAQQuestion[] = questions.map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer
        }
      }));

      const schema: FAQPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqQuestions
      };

      // Cache the result
      structuredDataCache.set(cacheKey, schema, SEO_CONFIG.CACHE.TTL.STRUCTURED_DATA);

      return schema;
    } catch (error) {
      console.error('FAQ schema generation failed:', error);
      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: []
      };
    }
  }

  /**
   * Generate BreadcrumbList structured data for navigation
   */
  async generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): Promise<BreadcrumbListSchema> {
    try {
      const path = breadcrumbs.map(b => b.url).join('/');
      const cacheKey = CacheKeys.breadcrumbSchema(path);
      const cached = structuredDataCache.get<BreadcrumbListSchema>(cacheKey);
      if (cached) {
        return cached;
      }

      const breadcrumbItems: BreadcrumbItem[] = breadcrumbs.map((breadcrumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: breadcrumb.name,
        item: breadcrumb.url.startsWith('http') ? breadcrumb.url : `${this.siteUrl}${breadcrumb.url}`
      }));

      const schema: BreadcrumbListSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems
      };

      // Cache the result
      structuredDataCache.set(cacheKey, schema, SEO_CONFIG.CACHE.TTL.STRUCTURED_DATA);

      return schema;
    } catch (error) {
      console.error('Breadcrumb schema generation failed:', error);
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: []
      };
    }
  }

  /**
   * Generate Organization structured data with complete business information
   */
  async generateOrganizationSchema(): Promise<OrganizationSchema> {
    try {
      const cacheKey = CacheKeys.organizationSchema();
      const cached = structuredDataCache.get<OrganizationSchema>(cacheKey);
      if (cached) {
        return cached;
      }

      const schema: OrganizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: STRUCTURED_DATA_CONFIG.ORGANIZATION.name,
        url: STRUCTURED_DATA_CONFIG.ORGANIZATION.url,
        logo: STRUCTURED_DATA_CONFIG.ORGANIZATION.logo,
        description: STRUCTURED_DATA_CONFIG.ORGANIZATION.description,
        foundingDate: STRUCTURED_DATA_CONFIG.ORGANIZATION.foundingDate,
        areaServed: {
          '@type': 'Place',
          name: STRUCTURED_DATA_CONFIG.ORGANIZATION.areaServed
        },
        serviceType: STRUCTURED_DATA_CONFIG.ORGANIZATION.serviceType,
        sameAs: [], // Add social media links when available
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: STRUCTURED_DATA_CONFIG.ORGANIZATION.contactPoint.contactType,
            url: STRUCTURED_DATA_CONFIG.ORGANIZATION.contactPoint.url,
            availableLanguage: [...STRUCTURED_DATA_CONFIG.ORGANIZATION.contactPoint.availableLanguage]
          }
        ],
        knowsAbout: [
          'Government Jobs',
          'Sarkari Naukri',
          'Exam Results',
          'Admit Cards',
          'College Admissions',
          'Scholarships',
          'Government Schemes',
          'PM Kisan',
          'Ayushman Bharat'
        ]
      };

      // Cache the result (longer TTL for organization data)
      structuredDataCache.set(cacheKey, schema, SEO_CONFIG.CACHE.TTL.STRUCTURED_DATA * 2);

      return schema;
    } catch (error) {
      console.error('Organization schema generation failed:', error);
      return this.generateFallbackOrganizationSchema();
    }
  }

  /**
   * Generate Event structured data for exam and result announcements
   */
  async generateEventSchema(event: {
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    location?: string;
    organizer: string;
    url: string;
  }): Promise<object> {
    try {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate || event.startDate,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: event.location ? {
          '@type': 'Place',
          name: event.location,
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'IN'
          }
        } : {
          '@type': 'VirtualLocation',
          url: event.url
        },
        organizer: {
          '@type': 'Organization',
          name: event.organizer,
          url: this.siteUrl
        },
        url: event.url
      };

      return schema;
    } catch (error) {
      console.error('Event schema generation failed:', error);
      return {};
    }
  }

  /**
   * Generate LocalBusiness structured data for location-specific pages
   */
  async generateLocalBusinessSchema(location: {
    state: string;
    description?: string;
  }): Promise<object> {
    try {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: `SarkariPulse - ${location.state}`,
        description: location.description || `Government job notifications and updates for ${location.state}`,
        url: `${this.siteUrl}/jobs/state/${encodeURIComponent(location.state)}`,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'IN',
          addressRegion: location.state
        },
        areaServed: {
          '@type': 'State',
          name: location.state
        },
        serviceType: 'Government Job Information Service',
        priceRange: 'Free'
      };

      return schema;
    } catch (error) {
      console.error('LocalBusiness schema generation failed:', error);
      return {};
    }
  }

  /**
   * Validate structured data using basic validation rules
   */
  async validateSchema(schema: object): Promise<ValidationResult> {
    try {
      const schemaStr = JSON.stringify(schema);
      const issues: string[] = [];
      const warnings: string[] = [];

      // Basic validation checks
      if (!schema || typeof schema !== 'object') {
        issues.push('Schema is not a valid object');
        return {
          isValid: false,
          errors: issues,
          warnings,
          richSnippetEligible: false,
          schemaType: 'unknown'
        };
      }

      const schemaObj = schema as any;

      // Check required fields
      if (!schemaObj['@context']) {
        issues.push('Missing @context field');
      }

      if (!schemaObj['@type']) {
        issues.push('Missing @type field');
      }

      // Type-specific validation
      const schemaType = schemaObj['@type'];
      
      switch (schemaType) {
        case 'JobPosting':
          if (!schemaObj.title) issues.push('JobPosting missing title');
          if (!schemaObj.hiringOrganization) issues.push('JobPosting missing hiringOrganization');
          if (!schemaObj.jobLocation) issues.push('JobPosting missing jobLocation');
          break;
        
        case 'FAQPage':
          if (!schemaObj.mainEntity || !Array.isArray(schemaObj.mainEntity)) {
            issues.push('FAQPage missing mainEntity array');
          }
          break;
        
        case 'Organization':
          if (!schemaObj.name) issues.push('Organization missing name');
          if (!schemaObj.url) issues.push('Organization missing url');
          break;
      }

      // Check for common issues
      if (schemaStr.includes('undefined') || schemaStr.includes('null')) {
        warnings.push('Schema contains undefined or null values');
      }

      // Check JSON-LD format
      if (schemaObj['@context'] !== 'https://schema.org') {
        warnings.push('Non-standard @context value');
      }

      return {
        isValid: issues.length === 0,
        errors: issues,
        warnings,
        richSnippetEligible: issues.length === 0 && warnings.length < 3,
        schemaType: schemaType || 'unknown'
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Schema validation failed: ' + (error as Error).message],
        warnings: [],
        richSnippetEligible: false,
        schemaType: 'unknown'
      };
    }
  }

  /**
   * Generate SearchAction structured data for site search
   */
  generateSearchActionSchema(): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.siteName,
      url: this.siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.siteUrl}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    };
  }

  /**
   * Generate Article structured data for blog-style content
   */
  generateArticleSchema(article: {
    headline: string;
    description: string;
    author?: string;
    datePublished: string;
    dateModified?: string;
    image?: string;
    url: string;
    keywords?: string[];
  }): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.headline,
      description: article.description,
      image: article.image || `${this.siteUrl}/icon-512x512.png`,
      author: {
        '@type': 'Organization',
        name: article.author || this.siteName,
        url: this.siteUrl
      },
      publisher: {
        '@type': 'Organization',
        name: this.siteName,
        url: this.siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${this.siteUrl}/icon-512x512.png`
        }
      },
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': article.url
      },
      keywords: article.keywords?.join(', ') || '',
      inLanguage: 'hi-IN'
    };
  }

  /**
   * Private helper methods
   */
  private generateFallbackJobSchema(job: ContentData | null): JobPostingSchema {
    const safeJob = job || { title: 'Government Job', summary: 'Government job opportunity' };
    const jobAddress = this.buildJobAddress(safeJob as ContentData);
    return {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: safeJob.title || 'Government Job',
      description: safeJob.summary || safeJob.title || 'Government job opportunity',
      hiringOrganization: {
        '@type': 'Organization',
        name: 'Government of India'
      },
      jobLocation: {
        '@type': 'Place',
        name: jobAddress.addressLocality || jobAddress.addressRegion || 'India',
        address: jobAddress
      },
      employmentType: 'FULL_TIME'
    };
  }

  private generateFallbackSchemeSchema(scheme: ContentData | null): GovernmentServiceSchema {
    const safeScheme = scheme || { title: 'Government Scheme', summary: 'Government scheme for citizens', slug: 'government-scheme' };
    return {
      '@context': 'https://schema.org',
      '@type': 'GovernmentService',
      name: safeScheme.title || 'Government Scheme',
      description: safeScheme.summary || safeScheme.title || 'Government scheme for citizens',
      serviceType: 'Government Scheme',
      areaServed: 'India',
      provider: {
        '@type': 'GovernmentOrganization',
        name: 'Government of India'
      },
      url: `${this.siteUrl}/schemes/${(safeScheme as any).slug || 'government-scheme'}`
    };
  }

  private generateFallbackOrganizationSchema(): OrganizationSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.siteName,
      url: this.siteUrl,
      logo: `${this.siteUrl}/icon-512x512.png`,
      description: 'Government job notification portal',
      foundingDate: '2024',
      areaServed: {
        '@type': 'Place',
        name: 'India'
      },
      serviceType: 'Government Job Information Service',
      sameAs: [],
      contactPoint: [],
      knowsAbout: ['Government Jobs', 'Sarkari Naukri']
    };
  }

  private extractSalaryValue(salary: string): number {
    // Extract numeric value from salary string
    const match = salary.match(/[\d,]+/);
    if (match) {
      return parseInt(match[0].replace(/,/g, ''), 10);
    }
    return 0;
  }

  private buildJobAddress(job: ContentData): {
    '@type': 'PostalAddress';
    addressCountry: string;
    addressRegion?: string;
    addressLocality?: string;
    streetAddress?: string;
    postalCode?: string;
  } {
    const locationDefaults: Record<string, { locality: string; region: string; postalCode: string }> = {
      chandigarh: { locality: 'Chandigarh', region: 'Chandigarh', postalCode: '160017' },
      coimbatore: { locality: 'Coimbatore', region: 'Tamil Nadu', postalCode: '641001' },
      delhi: { locality: 'Delhi', region: 'Delhi', postalCode: '110001' },
      jaipur: { locality: 'Jaipur', region: 'Rajasthan', postalCode: '302005' },
      bhopal: { locality: 'Bhopal', region: 'Madhya Pradesh', postalCode: '462001' },
      chennai: { locality: 'Chennai', region: 'Tamil Nadu', postalCode: '600001' },
      bengaluru: { locality: 'Bengaluru', region: 'Karnataka', postalCode: '560001' },
      hyderabad: { locality: 'Hyderabad', region: 'Telangana', postalCode: '500001' }
    };
    const stateDefaults: Record<string, { locality: string; region: string; postalCode: string }> = {
      Chandigarh: locationDefaults.chandigarh,
      Delhi: locationDefaults.delhi,
      Rajasthan: locationDefaults.jaipur,
      'Madhya Pradesh': locationDefaults.bhopal,
      'Tamil Nadu': locationDefaults.chennai,
      Karnataka: locationDefaults.bengaluru,
      Telangana: locationDefaults.hyderabad
    };
    const text = [job.title, job.organization, job.state, job.content]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchedLocation = Object.keys(locationDefaults)
      .sort((a, b) => b.length - a.length)
      .find(location => text.includes(location));
    const defaults = matchedLocation
      ? locationDefaults[matchedLocation]
      : job.state && job.state !== 'All India'
        ? stateDefaults[job.state]
        : undefined;
    const explicitPostalCode = [job.content, job.summary].filter(Boolean).join(' ').match(/\b[1-9][0-9]{5}\b/)?.[0];

    const address: {
      '@type': 'PostalAddress';
      addressCountry: string;
      addressRegion?: string;
      addressLocality?: string;
      streetAddress?: string;
      postalCode?: string;
    } = {
      '@type': 'PostalAddress',
      addressCountry: 'IN'
    };

    if (defaults) {
      address.addressRegion = defaults.region;
      address.addressLocality = defaults.locality;
      address.streetAddress = `${job.organization || 'Government Recruitment Office'}, ${defaults.locality}`;
      address.postalCode = explicitPostalCode || defaults.postalCode;
    } else if (job.state && job.state !== 'All India') {
      address.addressRegion = job.state;
      address.addressLocality = job.state;
      address.streetAddress = `${job.organization || 'Government Recruitment Office'}, ${job.state}`;
      if (explicitPostalCode) address.postalCode = explicitPostalCode;
    }

    return address;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

// Export singleton instance
export const schemaGenerator = new SchemaGenerator();
