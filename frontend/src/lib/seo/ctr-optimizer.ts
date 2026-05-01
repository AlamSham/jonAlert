// CTR Optimizer Component - Optimizes click-through rates via intelligent title and meta description generation

import { SEO_CONFIG, EMOTIONAL_TRIGGERS, HINGLISH_TERMS, PAGE_TEMPLATES } from './config';
import { seoCache, CacheKeys } from './cache';
import type { 
  ContentData, 
  OptimizationContext, 
  ABTestResult,
  CTRMetrics 
} from './interfaces';

export class CTROptimizer {
  private readonly maxTitleLength = SEO_CONFIG.MAX_TITLE_LENGTH;
  private readonly maxDescriptionLength = SEO_CONFIG.MAX_DESCRIPTION_LENGTH;
  private readonly minDescriptionLength = SEO_CONFIG.MIN_DESCRIPTION_LENGTH;

  /**
   * Optimize title for maximum CTR
   */
  async optimizeTitle(content: ContentData, context: OptimizationContext): Promise<string> {
    try {
      // Check cache first
      const cacheKey = CacheKeys.optimizedTitle(content.slug || content.title);
      const cached = seoCache.get<string>(cacheKey);
      if (cached) {
        return cached;
      }

      let optimizedTitle = '';

      // Select template based on page type and category
      const template = this.selectTitleTemplate(context.pageType, content.category);
      
      // Generate title using template
      optimizedTitle = this.generateTitleFromTemplate(template, content, context);

      // Apply emotional triggers and urgency indicators
      optimizedTitle = this.applyEmotionalTriggers(optimizedTitle, context);

      // Integrate Hinglish keywords naturally
      optimizedTitle = this.integrateHinglishKeywords(optimizedTitle, context.hinglishTerms);

      // Ensure length constraint
      optimizedTitle = this.enforceLength(optimizedTitle, this.maxTitleLength);

      // Cache the result
      seoCache.set(cacheKey, optimizedTitle, SEO_CONFIG.CACHE.TTL.SEO_DATA);

      return optimizedTitle;
    } catch (error) {
      console.error('CTR title optimization failed:', error);
      // Fallback to basic title
      return this.generateFallbackTitle(content);
    }
  }

  /**
   * Optimize meta description for maximum CTR
   */
  async optimizeMetaDescription(content: ContentData, context: OptimizationContext): Promise<string> {
    try {
      // Check cache first
      const cacheKey = CacheKeys.optimizedDescription(content.slug || content.title);
      const cached = seoCache.get<string>(cacheKey);
      if (cached) {
        return cached;
      }

      let optimizedDescription = '';

      // Select template based on page type and category
      const template = this.selectDescriptionTemplate(context.pageType, content.category);
      
      // Generate description using template
      optimizedDescription = this.generateDescriptionFromTemplate(template, content, context);

      // Add compelling CTAs and benefit statements
      optimizedDescription = this.addCallsToAction(optimizedDescription, content, context);

      // Integrate Hinglish keywords naturally
      optimizedDescription = this.integrateHinglishKeywords(optimizedDescription, context.hinglishTerms);

      // Ensure length constraint
      optimizedDescription = this.enforceLength(optimizedDescription, this.maxDescriptionLength);

      // Ensure minimum length for SEO effectiveness
      if (optimizedDescription.length < this.minDescriptionLength) {
        optimizedDescription = this.expandDescription(optimizedDescription, content, context);
      }

      // Cache the result
      seoCache.set(cacheKey, optimizedDescription, SEO_CONFIG.CACHE.TTL.SEO_DATA);

      return optimizedDescription;
    } catch (error) {
      console.error('CTR description optimization failed:', error);
      // Fallback to basic description
      return this.generateFallbackDescription(content);
    }
  }

  /**
   * Generate multiple title variations for A/B testing
   */
  async generateVariations(baseTitle: string, count: number = 3): Promise<string[]> {
    const variations: string[] = [baseTitle];
    
    // Generate variations with different emotional triggers
    const triggers = Object.values(EMOTIONAL_TRIGGERS).flat();
    
    for (let i = 1; i < count && i < triggers.length; i++) {
      const trigger = triggers[i - 1];
      let variation = baseTitle;
      
      // Add emoji at the beginning if not present
      if (!variation.match(/^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u)) {
        if (typeof trigger === 'string' && trigger.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u)) {
          variation = `${trigger} ${variation}`;
        }
      }
      
      // Ensure length constraint
      variation = this.enforceLength(variation, this.maxTitleLength);
      variations.push(variation);
    }
    
    return variations;
  }

  /**
   * Test title variations and return results
   */
  async testVariations(variations: string[], pageUrl: string): Promise<ABTestResult> {
    // This would integrate with actual A/B testing platform
    // For now, return mock results
    const mockResult: ABTestResult = {
      winningVariation: variations[0],
      ctrImprovement: 0.15, // 15% improvement
      confidenceLevel: 0.95,
      testDuration: 14, // days
      variations,
      metrics: variations.map((_, index) => ({
        impressions: 1000 + Math.random() * 500,
        clicks: 20 + Math.random() * 30,
        ctr: 0.02 + Math.random() * 0.03
      }))
    };

    // Cache the result
    const cacheKey = CacheKeys.abTestResults(pageUrl);
    seoCache.set(cacheKey, mockResult, SEO_CONFIG.CACHE.TTL.SEO_DATA);

    return mockResult;
  }

  /**
   * Select appropriate title template
   */
  private selectTitleTemplate(pageType: string, category: string): string {
    switch (pageType) {
      case 'detail':
        if (category === 'result') return PAGE_TEMPLATES.RESULT.TITLE;
        if (category === 'admit-card') return PAGE_TEMPLATES.ADMIT_CARD.TITLE;
        if (category === 'scheme') return PAGE_TEMPLATES.SCHEME.TITLE;
        return PAGE_TEMPLATES.JOB_DETAIL.TITLE;
      
      case 'category':
        return PAGE_TEMPLATES.CATEGORY.TITLE;
      
      case 'state':
        return PAGE_TEMPLATES.STATE.TITLE;
      
      default:
        return PAGE_TEMPLATES.CATEGORY.TITLE;
    }
  }

  /**
   * Select appropriate description template
   */
  private selectDescriptionTemplate(pageType: string, category: string): string {
    switch (pageType) {
      case 'detail':
        if (category === 'result') return PAGE_TEMPLATES.RESULT.DESCRIPTION;
        if (category === 'admit-card') return PAGE_TEMPLATES.ADMIT_CARD.DESCRIPTION;
        if (category === 'scheme') return PAGE_TEMPLATES.SCHEME.DESCRIPTION;
        return PAGE_TEMPLATES.JOB_DETAIL.DESCRIPTION;
      
      case 'category':
        return PAGE_TEMPLATES.CATEGORY.DESCRIPTION;
      
      case 'state':
        return PAGE_TEMPLATES.STATE.DESCRIPTION;
      
      default:
        return PAGE_TEMPLATES.CATEGORY.DESCRIPTION;
    }
  }

  /**
   * Generate title from template with variable substitution
   */
  private generateTitleFromTemplate(template: string, content: ContentData, context: OptimizationContext): string {
    let title = template;

    // Replace template variables
    title = title.replace('{emoji}', this.selectEmoji(content.category));
    title = title.replace('{title}', content.title);
    title = title.replace('{organization}', content.organization || 'Government');
    title = title.replace('{vacancies}', content.vacancyCount?.toString() || '');
    title = title.replace('{category}', this.getCategoryLabel(content.category));
    title = title.replace('{state}', content.state || '');
    title = title.replace('{count}', content.vacancyCount?.toString() || '100+');

    // Clean up extra spaces and formatting
    title = title.replace(/\s+/g, ' ').trim();
    title = title.replace(/\s*-\s*\|\s*/, ' | ');

    return title;
  }

  /**
   * Generate description from template with variable substitution
   */
  private generateDescriptionFromTemplate(template: string, content: ContentData, context: OptimizationContext): string {
    let description = template;

    // Replace template variables
    description = description.replace('{emoji}', this.selectEmoji(content.category));
    description = description.replace('{title}', content.title);
    description = description.replace('{organization}', content.organization || 'Government');
    description = description.replace('{vacancies}', content.vacancyCount?.toString() || '');
    description = description.replace('{lastDate}', this.formatLastDate(content.lastDate));
    description = description.replace('{category}', this.getCategoryLabel(content.category));
    description = description.replace('{state}', content.state || '');
    description = description.replace('{count}', content.vacancyCount?.toString() || '100+');
    description = description.replace('{hinglish_cta}', this.selectHinglishCTA());
    description = description.replace('{hinglish_benefit}', this.selectHinglishBenefit());
    description = description.replace('{urgency_cta}', this.selectUrgencyCTA());

    // Clean up extra spaces
    description = description.replace(/\s+/g, ' ').trim();

    return description;
  }

  /**
   * Apply emotional triggers to content
   */
  private applyEmotionalTriggers(content: string, context: OptimizationContext): string {
    // If content already has emoji, don't add more
    if (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u)) {
      return content;
    }

    // Select appropriate emotional trigger
    const triggers = context.emotionalTriggers.length > 0 
      ? context.emotionalTriggers 
      : EMOTIONAL_TRIGGERS.URGENCY;

    if (triggers.length > 0) {
      const trigger = triggers[Math.floor(Math.random() * triggers.length)];
      // Add emoji triggers at the beginning
      if (typeof trigger === 'string' && trigger.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u)) {
        return `${trigger} ${content}`;
      }
    }

    return content;
  }

  /**
   * Integrate Hinglish keywords naturally
   */
  private integrateHinglishKeywords(content: string, hinglishTerms: string[]): string {
    if (hinglishTerms.length === 0) {
      return content;
    }

    // Check if content already contains Hinglish terms
    const hasHinglish = hinglishTerms.some(term => 
      content.toLowerCase().includes(term.toLowerCase())
    );

    if (hasHinglish) {
      return content;
    }

    // Add a relevant Hinglish term if space allows
    const relevantTerms = hinglishTerms.filter(term => 
      content.length + term.length + 1 <= this.maxTitleLength
    );

    if (relevantTerms.length > 0) {
      const term = relevantTerms[0];
      // Try to integrate naturally
      if (content.includes('Apply') && term.includes('karein')) {
        return content.replace('Apply', term);
      }
    }

    return content;
  }

  /**
   * Add compelling calls-to-action to descriptions
   */
  private addCallsToAction(description: string, content: ContentData, context: OptimizationContext): string {
    // Don't add CTA if description already has one
    if (description.includes('!') || description.includes('Apply') || description.includes('Check')) {
      return description;
    }

    const ctas = [
      'Apply now!',
      'Check details!',
      'Jaldi apply karein!',
      'Last date approaching!',
      'Don\'t miss out!'
    ];

    const cta = ctas[Math.floor(Math.random() * ctas.length)];
    
    // Add CTA if space allows
    if (description.length + cta.length + 1 <= this.maxDescriptionLength) {
      return `${description} ${cta}`;
    }

    return description;
  }

  /**
   * Enforce character length limits
   */
  private enforceLength(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content;
    }

    // Truncate at word boundary
    const truncated = content.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }

  /**
   * Expand description to meet minimum length
   */
  private expandDescription(description: string, content: ContentData, context: OptimizationContext): string {
    const additions = [];

    // Add qualification info if available
    if (content.qualificationLevel && !description.includes(content.qualificationLevel)) {
      additions.push(`${content.qualificationLevel} eligible.`);
    }

    // Add salary info if available
    if (content.salary && !description.includes('salary')) {
      additions.push(`Salary: ${content.salary}.`);
    }

    // Add generic benefits
    if (additions.length === 0) {
      additions.push('Free notifications, instant alerts!');
    }

    // Add additions while respecting max length
    for (const addition of additions) {
      if (description.length + addition.length + 1 <= this.maxDescriptionLength) {
        description += ` ${addition}`;
      }
      
      if (description.length >= this.minDescriptionLength) {
        break;
      }
    }

    return description;
  }

  /**
   * Generate fallback title
   */
  private generateFallbackTitle(content: ContentData): string {
    const emoji = this.selectEmoji(content.category);
    const category = this.getCategoryLabel(content.category);
    return `${emoji} ${content.title} - ${category} | SarkariPulse`;
  }

  /**
   * Generate fallback description
   */
  private generateFallbackDescription(content: ContentData): string {
    return content.summary || `${content.title} - Latest notification on SarkariPulse. Check details and apply now!`;
  }

  /**
   * Select appropriate emoji for category
   */
  private selectEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
      'job': '💼',
      'result': '📊',
      'admit-card': '🎫',
      'admission': '🎓',
      'scholarship': '💰',
      'exam-form': '📝',
      'scheme': '🏛️'
    };
    
    return emojiMap[category] || '🔥';
  }

  /**
   * Get category label
   */
  private getCategoryLabel(category: string): string {
    const labelMap: Record<string, string> = {
      'job': 'Sarkari Naukri',
      'result': 'Result',
      'admit-card': 'Admit Card',
      'admission': 'Admission',
      'scholarship': 'Scholarship',
      'exam-form': 'Exam Form',
      'scheme': 'Government Scheme'
    };
    
    return labelMap[category] || 'Notification';
  }

  /**
   * Format last date for display
   */
  private formatLastDate(lastDate?: string): string {
    if (!lastDate) return '';
    
    try {
      const date = new Date(lastDate);
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short' 
      });
    } catch {
      return '';
    }
  }

  /**
   * Select Hinglish CTA
   */
  private selectHinglishCTA(): string {
    const ctas = HINGLISH_TERMS.ACTIONS;
    return ctas[Math.floor(Math.random() * ctas.length)];
  }

  /**
   * Select Hinglish benefit
   */
  private selectHinglishBenefit(): string {
    const benefits = HINGLISH_TERMS.BENEFITS;
    return benefits[Math.floor(Math.random() * benefits.length)];
  }

  /**
   * Select urgency CTA
   */
  private selectUrgencyCTA(): string {
    const urgency = HINGLISH_TERMS.URGENCY;
    return urgency[Math.floor(Math.random() * urgency.length)];
  }
}

// Export singleton instance
export const ctrOptimizer = new CTROptimizer();