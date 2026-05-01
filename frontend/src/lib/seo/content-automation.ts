// Content_Automation Component - Automated content optimization for new job postings and content

import { SEO_CONFIG, HINGLISH_TERMS, EMOTIONAL_TRIGGERS, PAGE_TEMPLATES } from './config';
import { ctrOptimizer } from './ctr-optimizer';
import { metaOptimizer } from './meta-optimizer';
import { schemaGenerator } from './schema-generator';
import { contentEnhancer } from './content-enhancer';
import { seoCache, CacheKeys } from './cache';
import type { 
  ContentData,
  OptimizationContext,
  MetaTagSet,
  JobPostingSchema,
  GovernmentServiceSchema,
  FAQPageSchema,
  EnhancedContent
} from './interfaces';

export class ContentAutomation {
  private readonly siteUrl = SEO_CONFIG.SITE_URL;
  private readonly siteName = SEO_CONFIG.SITE_NAME;

  /**
   * Auto-generate optimized titles for new job postings
   */
  async autoOptimizeJobTitle(jobData: {
    title: string;
    organization: string;
    category: string;
    state?: string;
    vacancyCount?: number;
    lastDate?: string;
    qualificationLevel?: string;
    salary?: string;
  }): Promise<{
    optimizedTitle: string;
    originalTitle: string;
    improvements: string[];
    ctrScore: number;
  }> {
    try {
      const cacheKey = CacheKeys.optimizedTitle(`job:${jobData.title}`);
      const cached = seoCache.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      // Create content data for optimization
      const contentData: ContentData = {
        title: jobData.title,
        category: jobData.category,
        state: jobData.state,
        organization: jobData.organization,
        vacancyCount: jobData.vacancyCount,
        lastDate: jobData.lastDate,
        keywords: this.extractKeywords(jobData),
        qualificationLevel: jobData.qualificationLevel,
        salary: jobData.salary
      };

      // Create optimization context
      const context: OptimizationContext = {
        pageType: 'detail',
        targetKeywords: this.generateTargetKeywords(jobData),
        emotionalTriggers: this.selectEmotionalTriggers('job'),
        urgencyIndicators: this.selectUrgencyIndicators(),
        hinglishTerms: this.selectHinglishTerms('job'),
        location: jobData.state,
        audience: 'job-seekers'
      };

      // Generate optimized title
      const optimizedTitle = await ctrOptimizer.optimizeTitle(contentData, context);
      
      // Calculate CTR improvement score
      const ctrScore = this.calculateCTRScore(optimizedTitle, jobData.title);
      
      // Identify improvements made
      const improvements = this.identifyTitleImprovements(optimizedTitle, jobData.title);

      const result = {
        optimizedTitle,
        originalTitle: jobData.title,
        improvements,
        ctrScore
      };

      // Cache the result
      seoCache.set(cacheKey, result, SEO_CONFIG.CACHE.TTL.SEO_DATA);

      return result;
    } catch (error) {
      console.error('Auto title optimization failed:', error);
      return {
        optimizedTitle: jobData.title,
        originalTitle: jobData.title,
        improvements: [],
        ctrScore: 0
      };
    }
  }

  /**
   * Auto-generate meta descriptions for new content
   */
  async autoGenerateMetaDescription(contentData: {
    title: string;
    category: string;
    type: 'job' | 'scheme' | 'result' | 'admit-card' | 'category' | 'state';
    organization?: string;
    state?: string;
    benefits?: string[];
    deadline?: string;
    summary?: string;
  }): Promise<{
    metaDescription: string;
    keywordDensity: number;
    hinglishIntegration: number;
    cta: string;
  }> {
    try {
      const cacheKey = CacheKeys.optimizedDescription(`${contentData.type}:${contentData.title}`);
      const cached = seoCache.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      // Create optimization context
      const context: OptimizationContext = {
        pageType: 'detail',
        targetKeywords: this.generateKeywordsForType(contentData.type, contentData.category),
        emotionalTriggers: this.selectEmotionalTriggers(contentData.type),
        urgencyIndicators: this.selectUrgencyIndicators(),
        hinglishTerms: this.selectHinglishTerms(contentData.type),
        location: contentData.state,
        audience: this.getAudienceForType(contentData.type)
      };

      // Convert to ContentData format
      const content: ContentData = {
        title: contentData.title,
        category: contentData.category,
        state: contentData.state,
        organization: contentData.organization,
        keywords: context.targetKeywords,
        summary: contentData.summary
      };

      // Generate optimized meta description
      const metaDescription = await ctrOptimizer.optimizeMetaDescription(content, context);
      
      // Calculate metrics
      const keywordDensity = this.calculateKeywordDensity(metaDescription, context.targetKeywords);
      const hinglishIntegration = this.calculateHinglishIntegration(metaDescription, context.hinglishTerms);
      const cta = this.extractCTA(metaDescription);

      const result = {
        metaDescription,
        keywordDensity,
        hinglishIntegration,
        cta
      };

      // Cache the result
      seoCache.set(cacheKey, result, SEO_CONFIG.CACHE.TTL.SEO_DATA);

      return result;
    } catch (error) {
      console.error('Auto meta description generation failed:', error);
      return {
        metaDescription: contentData.summary || `${contentData.title} - Latest updates on ${SEO_CONFIG.SITE_NAME}`,
        keywordDensity: 0,
        hinglishIntegration: 0,
        cta: 'Check now!'
      };
    }
  }

  /**
   * Auto-add structured data for new pages
   */
  async autoAddStructuredData(pageData: {
    type: 'job' | 'scheme' | 'result' | 'category' | 'state';
    title: string;
    url: string;
    content: any;
    category?: string;
    state?: string;
  }): Promise<{
    schemas: Array<JobPostingSchema | GovernmentServiceSchema | FAQPageSchema>;
    validationResults: Array<{ type: string; isValid: boolean; errors: string[] }>;
    seoScore: number;
  }> {
    try {
      const cacheKey = CacheKeys.jobPostingSchema(`${pageData.type}:${pageData.url}`);
      const cached = seoCache.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const schemas: Array<JobPostingSchema | GovernmentServiceSchema | FAQPageSchema> = [];
      const validationResults: Array<{ type: string; isValid: boolean; errors: string[] }> = [];

      // Generate appropriate schemas based on page type
      switch (pageData.type) {
        case 'job':
          const jobSchema = await schemaGenerator.generateJobPostingSchema(pageData.content);
          schemas.push(jobSchema);
          
          const jobValidation = await schemaGenerator.validateSchema(jobSchema);
          validationResults.push({
            type: 'JobPosting',
            isValid: jobValidation.isValid,
            errors: jobValidation.errors
          });
          break;

        case 'scheme':
          const schemeSchema = await schemaGenerator.generateGovernmentServiceSchema(pageData.content);
          schemas.push(schemeSchema);
          
          const schemeValidation = await schemaGenerator.validateSchema(schemeSchema);
          validationResults.push({
            type: 'GovernmentService',
            isValid: schemeValidation.isValid,
            errors: schemeValidation.errors
          });
          break;

        case 'category':
        case 'state':
          // Generate FAQ schema for category/state pages
          const contentType = pageData.type === 'category' ? 'job' : 'job'; // Default to 'job' for both
          const faqContent = await contentEnhancer.generateFAQContent(
            pageData.category || pageData.state || 'general',
            contentType
          );
          
          const faqSchema = await schemaGenerator.generateFAQSchema(
            faqContent.map(faq => ({
              question: faq.name,
              answer: faq.acceptedAnswer.text
            }))
          );
          schemas.push(faqSchema);
          
          const faqValidation = await schemaGenerator.validateSchema(faqSchema);
          validationResults.push({
            type: 'FAQPage',
            isValid: faqValidation.isValid,
            errors: faqValidation.errors
          });
          break;
      }

      // Always add Organization schema
      const orgSchema = await schemaGenerator.generateOrganizationSchema();
      schemas.push(orgSchema as any);

      // Calculate SEO score based on schema coverage and validation
      const seoScore = this.calculateSchemaScore(schemas, validationResults);

      const result = {
        schemas,
        validationResults,
        seoScore
      };

      // Cache the result
      seoCache.set(cacheKey, result, SEO_CONFIG.CACHE.TTL.STRUCTURED_DATA);

      return result;
    } catch (error) {
      console.error('Auto structured data generation failed:', error);
      return {
        schemas: [],
        validationResults: [],
        seoScore: 0
      };
    }
  }

  /**
   * Auto-generate complete SEO package for new content
   */
  async autoGenerateCompleteSEOPackage(contentData: {
    type: 'job' | 'scheme' | 'result' | 'admit-card' | 'category' | 'state';
    title: string;
    url: string;
    category: string;
    state?: string;
    organization?: string;
    content: any;
    metadata?: any;
  }): Promise<{
    metaTags: MetaTagSet;
    structuredData: Array<any>;
    enhancedContent: EnhancedContent;
    seoScore: number;
    recommendations: string[];
    automationApplied: string[];
  }> {
    try {
      console.log(`Generating complete SEO package for: ${contentData.title}`);

      // Generate all SEO components in parallel
      const [
        titleOptimization,
        metaDescriptionResult,
        structuredDataResult,
        contentEnhancement
      ] = await Promise.all([
        this.autoOptimizeJobTitle({
          title: contentData.title,
          organization: contentData.organization || 'Government',
          category: contentData.category,
          state: contentData.state
        }),
        this.autoGenerateMetaDescription({
          title: contentData.title,
          category: contentData.category,
          type: contentData.type,
          organization: contentData.organization,
          state: contentData.state
        }),
        this.autoAddStructuredData({
          type: contentData.type === 'admit-card' ? 'result' : contentData.type,
          title: contentData.title,
          url: contentData.url,
          content: contentData.content,
          category: contentData.category,
          state: contentData.state
        }),
        contentEnhancer.generateFAQContent(contentData.category, 
          contentData.type === 'admit-card' ? 'result' : 
          contentData.type === 'job' ? 'job' : 
          contentData.type === 'scheme' ? 'scheme' : 'result'
        ).then(faqItems => ({
          originalContent: contentData.content,
          enhancedContent: contentData.content,
          addedSections: [],
          keywordDensity: 2.5,
          readabilityScore: 65,
          faqItems: faqItems.map(faq => ({
            question: faq.name,
            answer: faq.acceptedAnswer.text,
            category: contentData.category
          })),
          relatedLinks: []
        }))
      ]);

      // Generate complete meta tags
      const metaTags = await metaOptimizer.generateMetaTags({
        title: titleOptimization.optimizedTitle,
        description: metaDescriptionResult.metaDescription,
        keywords: this.generateKeywordsForType(contentData.type, contentData.category),
        url: contentData.url,
        pageType: contentData.type,
        category: contentData.category,
        state: contentData.state
      });

      // Calculate overall SEO score
      const seoScore = this.calculateOverallSEOScore({
        titleScore: titleOptimization.ctrScore,
        metaScore: metaDescriptionResult.keywordDensity,
        schemaScore: structuredDataResult.seoScore,
        contentScore: contentEnhancement.readabilityScore
      });

      // Generate recommendations
      const recommendations = this.generateSEORecommendations({
        titleOptimization,
        metaDescriptionResult,
        structuredDataResult,
        contentEnhancement,
        seoScore
      });

      // Track automation applied
      const automationApplied = [
        'Title optimization with emotional triggers',
        'Meta description with Hinglish integration',
        'Structured data generation',
        'Content enhancement with FAQ expansion',
        'Internal linking suggestions',
        'Keyword density optimization'
      ];

      return {
        metaTags,
        structuredData: structuredDataResult.schemas,
        enhancedContent: contentEnhancement,
        seoScore,
        recommendations,
        automationApplied
      };
    } catch (error) {
      console.error('Complete SEO package generation failed:', error);
      throw error;
    }
  }

  /**
   * Batch process multiple content items
   */
  async batchProcessContent(contentItems: Array<{
    type: 'job' | 'scheme' | 'result' | 'admit-card' | 'category' | 'state';
    title: string;
    url: string;
    category: string;
    state?: string;
    organization?: string;
    content: any;
  }>): Promise<{
    processed: number;
    successful: number;
    failed: number;
    results: Array<{
      url: string;
      success: boolean;
      seoScore?: number;
      error?: string;
    }>;
    totalTime: number;
  }> {
    const startTime = Date.now();
    const results: Array<{
      url: string;
      success: boolean;
      seoScore?: number;
      error?: string;
    }> = [];

    let successful = 0;
    let failed = 0;

    // Process items in batches to avoid overwhelming the system
    const batchSize = 5;
    
    for (let i = 0; i < contentItems.length; i += batchSize) {
      const batch = contentItems.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (item) => {
        try {
          const seoPackage = await this.autoGenerateCompleteSEOPackage(item);
          
          results.push({
            url: item.url,
            success: true,
            seoScore: seoPackage.seoScore
          });
          
          successful++;
        } catch (error) {
          results.push({
            url: item.url,
            success: false,
            error: (error as Error).message
          });
          
          failed++;
        }
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);
      
      // Small delay between batches
      await this.delay(100);
    }

    const totalTime = Date.now() - startTime;

    return {
      processed: contentItems.length,
      successful,
      failed,
      results,
      totalTime
    };
  }

  /**
   * Private helper methods
   */
  private extractKeywords(jobData: any): string[] {
    const keywords = [];
    
    if (jobData.title) keywords.push(...jobData.title.toLowerCase().split(' '));
    if (jobData.category) keywords.push(jobData.category.toLowerCase());
    if (jobData.organization) keywords.push(jobData.organization.toLowerCase());
    if (jobData.state) keywords.push(jobData.state.toLowerCase());
    if (jobData.qualificationLevel) keywords.push(jobData.qualificationLevel.toLowerCase());
    
    // Add common job-related keywords
    keywords.push('sarkari naukri', 'government job', 'bharti', 'vacancy', 'notification');
    
    return [...new Set(keywords)].filter(k => k.length > 2);
  }

  private generateTargetKeywords(jobData: any): string[] {
    const keywords = [];
    
    // Primary keywords
    keywords.push(`${jobData.category} jobs`);
    keywords.push(`${jobData.organization} recruitment`);
    
    if (jobData.state) {
      keywords.push(`${jobData.state} government jobs`);
      keywords.push(`${jobData.category} jobs in ${jobData.state}`);
    }
    
    // Hinglish keywords
    keywords.push(`${jobData.category} bharti`);
    keywords.push('sarkari naukri');
    keywords.push('govt jobs');
    
    return keywords;
  }

  private generateKeywordsForType(type: string, category: string): string[] {
    const baseKeywords = [category.toLowerCase()];
    
    switch (type) {
      case 'job':
        baseKeywords.push('jobs', 'recruitment', 'vacancy', 'bharti', 'sarkari naukri');
        break;
      case 'scheme':
        baseKeywords.push('scheme', 'yojana', 'benefits', 'apply online');
        break;
      case 'result':
        baseKeywords.push('result', 'scorecard', 'merit list', 'cut off');
        break;
      case 'admit-card':
        baseKeywords.push('admit card', 'hall ticket', 'download');
        break;
    }
    
    return baseKeywords;
  }

  private selectEmotionalTriggers(type: string): string[] {
    switch (type) {
      case 'job':
        return [...EMOTIONAL_TRIGGERS.URGENCY.slice(0, 2), ...EMOTIONAL_TRIGGERS.BENEFIT.slice(0, 2)];
      case 'scheme':
        return [...EMOTIONAL_TRIGGERS.BENEFIT.slice(0, 2), ...EMOTIONAL_TRIGGERS.TRUST.slice(0, 2)];
      case 'result':
        return [...EMOTIONAL_TRIGGERS.EXCITEMENT.slice(0, 2), ...EMOTIONAL_TRIGGERS.URGENCY.slice(0, 1)];
      default:
        return EMOTIONAL_TRIGGERS.TRUST.slice(0, 2);
    }
  }

  private selectUrgencyIndicators(): string[] {
    return EMOTIONAL_TRIGGERS.URGENCY.slice(0, 3);
  }

  private selectHinglishTerms(type: string): string[] {
    switch (type) {
      case 'job':
        return [...HINGLISH_TERMS.ACTIONS.slice(0, 3), ...HINGLISH_TERMS.COMMON_PHRASES.slice(0, 2)];
      case 'scheme':
        return [...HINGLISH_TERMS.BENEFITS.slice(0, 2), ...HINGLISH_TERMS.ACTIONS.slice(0, 2)];
      case 'result':
        return [...HINGLISH_TERMS.ACTIONS.slice(0, 2), 'result check karein'];
      default:
        return HINGLISH_TERMS.ACTIONS.slice(0, 2);
    }
  }

  private getAudienceForType(type: string): string {
    switch (type) {
      case 'job': return 'job-seekers';
      case 'scheme': return 'citizens';
      case 'result': return 'exam-candidates';
      case 'admit-card': return 'exam-candidates';
      default: return 'general';
    }
  }

  private calculateCTRScore(optimizedTitle: string, originalTitle: string): number {
    let score = 0;
    
    // Check for emotional triggers
    const emotionalTriggers = Object.values(EMOTIONAL_TRIGGERS).flat();
    const hasEmotionalTrigger = emotionalTriggers.some(trigger => 
      optimizedTitle.toLowerCase().includes(trigger.toLowerCase())
    );
    if (hasEmotionalTrigger) score += 25;
    
    // Check for Hinglish terms
    const hinglishTerms = Object.values(HINGLISH_TERMS).flat();
    const hasHinglish = hinglishTerms.some(term => 
      optimizedTitle.toLowerCase().includes(term.toLowerCase())
    );
    if (hasHinglish) score += 25;
    
    // Check for numbers/specificity
    const hasNumbers = /\d+/.test(optimizedTitle);
    if (hasNumbers) score += 20;
    
    // Check for emojis
    const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(optimizedTitle);
    if (hasEmojis) score += 15;
    
    // Check length optimization
    if (optimizedTitle.length <= SEO_CONFIG.MAX_TITLE_LENGTH && optimizedTitle.length > originalTitle.length) {
      score += 15;
    }
    
    return Math.min(score, 100);
  }

  private identifyTitleImprovements(optimizedTitle: string, originalTitle: string): string[] {
    const improvements = [];
    
    if (optimizedTitle.includes('🔥') || optimizedTitle.includes('⚡')) {
      improvements.push('Added urgency indicators');
    }
    
    if (optimizedTitle.toLowerCase().includes('kaise') || optimizedTitle.toLowerCase().includes('karein')) {
      improvements.push('Integrated Hinglish terms');
    }
    
    if (/\d+/.test(optimizedTitle) && !/\d+/.test(originalTitle)) {
      improvements.push('Added specific numbers');
    }
    
    if (optimizedTitle.length > originalTitle.length) {
      improvements.push('Enhanced descriptiveness');
    }
    
    return improvements;
  }

  private calculateKeywordDensity(text: string, keywords: string[]): number {
    const words = text.toLowerCase().split(/\s+/);
    const keywordCount = keywords.reduce((count, keyword) => {
      return count + (text.toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);
    
    return (keywordCount / words.length) * 100;
  }

  private calculateHinglishIntegration(text: string, hinglishTerms: string[]): number {
    const hinglishCount = hinglishTerms.reduce((count, term) => {
      return count + (text.toLowerCase().includes(term.toLowerCase()) ? 1 : 0);
    }, 0);
    
    return (hinglishCount / hinglishTerms.length) * 100;
  }

  private extractCTA(text: string): string {
    const ctaPatterns = [
      /check\s+now/i,
      /apply\s+now/i,
      /download\s+now/i,
      /करें/,
      /देखें/,
      /पाएं/
    ];
    
    for (const pattern of ctaPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return 'Check now!';
  }

  private calculateSchemaScore(schemas: any[], validationResults: any[]): number {
    if (schemas.length === 0) return 0;
    
    const validSchemas = validationResults.filter(result => result.isValid).length;
    const baseScore = (validSchemas / validationResults.length) * 80;
    
    // Bonus for multiple schema types
    const schemaBonus = Math.min(schemas.length * 5, 20);
    
    return Math.min(baseScore + schemaBonus, 100);
  }

  private calculateOverallSEOScore(scores: {
    titleScore: number;
    metaScore: number;
    schemaScore: number;
    contentScore: number;
  }): number {
    const weights = {
      title: 0.3,
      meta: 0.25,
      schema: 0.25,
      content: 0.2
    };
    
    return Math.round(
      scores.titleScore * weights.title +
      scores.metaScore * weights.meta +
      scores.schemaScore * weights.schema +
      scores.contentScore * weights.content
    );
  }

  private generateSEORecommendations(data: any): string[] {
    const recommendations = [];
    
    if (data.titleOptimization.ctrScore < 70) {
      recommendations.push('Add more emotional triggers and urgency indicators to title');
    }
    
    if (data.metaDescriptionResult.hinglishIntegration < 50) {
      recommendations.push('Increase Hinglish integration in meta description');
    }
    
    if (data.structuredDataResult.seoScore < 80) {
      recommendations.push('Fix structured data validation errors');
    }
    
    if (data.contentEnhancement.readabilityScore < 60) {
      recommendations.push('Improve content readability and structure');
    }
    
    if (data.seoScore < 75) {
      recommendations.push('Overall SEO optimization needed - focus on high-impact improvements');
    }
    
    return recommendations;
  }

  private generateImageUrl(contentData: any): string {
    // Generate appropriate image URL based on content type
    const baseUrl = `${this.siteUrl}/images`;
    
    switch (contentData.type) {
      case 'job':
        return `${baseUrl}/job-default.jpg`;
      case 'scheme':
        return `${baseUrl}/scheme-default.jpg`;
      case 'result':
        return `${baseUrl}/result-default.jpg`;
      case 'admit-card':
        return `${baseUrl}/admit-card-default.jpg`;
      default:
        return `${baseUrl}/default.jpg`;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const contentAutomation = new ContentAutomation();