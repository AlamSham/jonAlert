// Advanced CTR Optimizer Features - Enhanced optimization strategies

import { ctrOptimizer } from './ctr-optimizer';
import { SEO_CONFIG, EMOTIONAL_TRIGGERS, HINGLISH_TERMS } from './config';
import { seoCache, CacheKeys } from './cache';
import type { ContentData, OptimizationContext, CTRMetrics } from './interfaces';

export class AdvancedCTROptimizer {
  /**
   * Generate context-aware optimization based on page performance
   */
  async generateContextAwareOptimization(
    content: ContentData, 
    context: OptimizationContext,
    performanceData?: CTRMetrics
  ): Promise<{ title: string; description: string; confidence: number }> {
    
    // Analyze current performance to adjust strategy
    const strategy = this.selectOptimizationStrategy(performanceData, context);
    
    // Generate optimized content with strategy
    const optimizedTitle = await this.generateStrategicTitle(content, context, strategy);
    const optimizedDescription = await this.generateStrategicDescription(content, context, strategy);
    
    // Calculate confidence score
    const confidence = this.calculateConfidenceScore(content, context, strategy);
    
    return {
      title: optimizedTitle,
      description: optimizedDescription,
      confidence
    };
  }

  /**
   * Generate location-specific optimizations for state pages
   */
  async optimizeForLocation(
    content: ContentData,
    context: OptimizationContext,
    state: string
  ): Promise<{ title: string; description: string }> {
    
    // Enhanced context with location-specific terms
    const locationContext: OptimizationContext = {
      ...context,
      location: state,
      targetKeywords: [
        ...context.targetKeywords,
        `${state} sarkari naukri`,
        `${state} govt jobs`,
        `${state} bharti`
      ],
      hinglishTerms: [
        ...context.hinglishTerms,
        `${state} mein jobs`,
        `${state} ki vacancy`,
        `${state} sarkar`
      ]
    };

    // Generate location-optimized content
    const title = await this.generateLocationTitle(content, locationContext, state);
    const description = await this.generateLocationDescription(content, locationContext, state);

    return { title, description };
  }

  /**
   * Generate urgency-based optimizations for time-sensitive content
   */
  async optimizeForUrgency(
    content: ContentData,
    context: OptimizationContext,
    daysUntilDeadline?: number
  ): Promise<{ title: string; description: string }> {
    
    const urgencyLevel = this.calculateUrgencyLevel(content.lastDate, daysUntilDeadline);
    
    // Enhanced context with urgency-specific terms
    const urgencyContext: OptimizationContext = {
      ...context,
      urgencyIndicators: this.getUrgencyIndicators(urgencyLevel),
      emotionalTriggers: this.getUrgencyTriggers(urgencyLevel)
    };

    const title = await ctrOptimizer.optimizeTitle(content, urgencyContext);
    const description = await ctrOptimizer.optimizeMetaDescription(content, urgencyContext);

    return { title, description };
  }

  /**
   * Generate audience-specific optimizations
   */
  async optimizeForAudience(
    content: ContentData,
    context: OptimizationContext,
    audience: 'students' | 'graduates' | 'experienced' | 'general'
  ): Promise<{ title: string; description: string }> {
    
    const audienceContext = this.getAudienceContext(audience, context);
    
    const title = await ctrOptimizer.optimizeTitle(content, audienceContext);
    const description = await ctrOptimizer.optimizeMetaDescription(content, audienceContext);

    return { title, description };
  }

  /**
   * Generate seasonal/trending optimizations
   */
  async optimizeForTrends(
    content: ContentData,
    context: OptimizationContext,
    trendingKeywords: string[]
  ): Promise<{ title: string; description: string }> {
    
    // Integrate trending keywords naturally
    const trendContext: OptimizationContext = {
      ...context,
      targetKeywords: [
        ...context.targetKeywords,
        ...trendingKeywords.slice(0, 3) // Limit to top 3 trending
      ]
    };

    const title = await ctrOptimizer.optimizeTitle(content, trendContext);
    const description = await ctrOptimizer.optimizeMetaDescription(content, trendContext);

    return { title, description };
  }

  /**
   * Select optimization strategy based on performance data
   */
  private selectOptimizationStrategy(
    performanceData?: CTRMetrics,
    context?: OptimizationContext
  ): 'aggressive' | 'moderate' | 'conservative' {
    
    if (!performanceData) return 'moderate';
    
    const currentCTR = performanceData.currentCTR;
    const targetCTR = SEO_CONFIG.CTR_TARGETS.TARGET_MIN;
    
    if (currentCTR < targetCTR * 0.5) {
      return 'aggressive'; // Very low CTR, need strong intervention
    } else if (currentCTR < targetCTR * 0.8) {
      return 'moderate'; // Below target, moderate optimization
    } else {
      return 'conservative'; // Close to target, gentle optimization
    }
  }

  /**
   * Generate strategic title based on optimization strategy
   */
  private async generateStrategicTitle(
    content: ContentData,
    context: OptimizationContext,
    strategy: 'aggressive' | 'moderate' | 'conservative'
  ): Promise<string> {
    
    const strategicContext = this.applyStrategy(context, strategy);
    return await ctrOptimizer.optimizeTitle(content, strategicContext);
  }

  /**
   * Generate strategic description based on optimization strategy
   */
  private async generateStrategicDescription(
    content: ContentData,
    context: OptimizationContext,
    strategy: 'aggressive' | 'moderate' | 'conservative'
  ): Promise<string> {
    
    const strategicContext = this.applyStrategy(context, strategy);
    return await ctrOptimizer.optimizeMetaDescription(content, strategicContext);
  }

  /**
   * Apply optimization strategy to context
   */
  private applyStrategy(
    context: OptimizationContext,
    strategy: 'aggressive' | 'moderate' | 'conservative'
  ): OptimizationContext {
    
    switch (strategy) {
      case 'aggressive':
        return {
          ...context,
          emotionalTriggers: [
            ...EMOTIONAL_TRIGGERS.URGENCY,
            ...EMOTIONAL_TRIGGERS.EXCITEMENT
          ],
          urgencyIndicators: [
            'BREAKING', 'URGENT', 'LAST CHANCE', 'LIMITED TIME'
          ]
        };
      
      case 'moderate':
        return {
          ...context,
          emotionalTriggers: [
            ...EMOTIONAL_TRIGGERS.TRUST,
            ...EMOTIONAL_TRIGGERS.BENEFIT
          ],
          urgencyIndicators: [
            'Latest', 'New', 'Updated'
          ]
        };
      
      case 'conservative':
        return {
          ...context,
          emotionalTriggers: [...EMOTIONAL_TRIGGERS.TRUST],
          urgencyIndicators: ['Official', 'Verified']
        };
      
      default:
        return context;
    }
  }

  /**
   * Generate location-specific title
   */
  private async generateLocationTitle(
    content: ContentData,
    context: OptimizationContext,
    state: string
  ): Promise<string> {
    
    // Create location-enhanced content
    const locationContent: ContentData = {
      ...content,
      title: `${content.title} - ${state}`,
      state
    };

    return await ctrOptimizer.optimizeTitle(locationContent, context);
  }

  /**
   * Generate location-specific description
   */
  private async generateLocationDescription(
    content: ContentData,
    context: OptimizationContext,
    state: string
  ): Promise<string> {
    
    const locationContent: ContentData = {
      ...content,
      state
    };

    return await ctrOptimizer.optimizeMetaDescription(locationContent, context);
  }

  /**
   * Calculate urgency level based on deadline
   */
  private calculateUrgencyLevel(lastDate?: string, daysUntilDeadline?: number): 'high' | 'medium' | 'low' {
    
    if (daysUntilDeadline !== undefined) {
      if (daysUntilDeadline <= 3) return 'high';
      if (daysUntilDeadline <= 7) return 'medium';
      return 'low';
    }

    if (lastDate) {
      const deadline = new Date(lastDate);
      const now = new Date();
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 3) return 'high';
      if (daysLeft <= 7) return 'medium';
      return 'low';
    }

    return 'low';
  }

  /**
   * Get urgency indicators based on urgency level
   */
  private getUrgencyIndicators(urgencyLevel: 'high' | 'medium' | 'low'): string[] {
    
    switch (urgencyLevel) {
      case 'high':
        return ['🚨', 'URGENT', 'LAST CHANCE', 'HURRY', 'DEADLINE TODAY'];
      case 'medium':
        return ['⏰', 'LIMITED TIME', 'APPLY SOON', 'FEW DAYS LEFT'];
      case 'low':
        return ['📅', 'APPLY NOW', 'DON\'T MISS'];
      default:
        return [];
    }
  }

  /**
   * Get urgency triggers based on urgency level
   */
  private getUrgencyTriggers(urgencyLevel: 'high' | 'medium' | 'low'): string[] {
    
    switch (urgencyLevel) {
      case 'high':
        return [...EMOTIONAL_TRIGGERS.URGENCY, ...EMOTIONAL_TRIGGERS.EXCITEMENT];
      case 'medium':
        return [...EMOTIONAL_TRIGGERS.URGENCY];
      case 'low':
        return [...EMOTIONAL_TRIGGERS.BENEFIT];
      default:
        return [];
    }
  }

  /**
   * Get audience-specific context
   */
  private getAudienceContext(
    audience: 'students' | 'graduates' | 'experienced' | 'general',
    baseContext: OptimizationContext
  ): OptimizationContext {
    
    const audienceKeywords: Record<string, string[]> = {
      students: ['student jobs', 'fresher vacancy', '12th pass', 'college students'],
      graduates: ['graduate jobs', 'degree holders', 'fresh graduate', 'entry level'],
      experienced: ['experienced jobs', 'senior positions', 'promotion', 'career growth'],
      general: ['all eligible', 'any qualification', 'open for all']
    };

    const audienceHinglish: Record<string, string[]> = {
      students: ['students ke liye', 'padhai ke saath', 'college ke baad'],
      graduates: ['graduates apply karein', 'degree wale', 'fresh pass'],
      experienced: ['experience wale', 'senior post', 'promotion chahiye'],
      general: ['sab apply kar sakte', 'koi bhi eligible']
    };

    return {
      ...baseContext,
      targetKeywords: [
        ...baseContext.targetKeywords,
        ...audienceKeywords[audience]
      ],
      hinglishTerms: [
        ...baseContext.hinglishTerms,
        ...audienceHinglish[audience]
      ],
      audience
    };
  }

  /**
   * Calculate confidence score for optimization
   */
  private calculateConfidenceScore(
    content: ContentData,
    context: OptimizationContext,
    strategy: string
  ): number {
    
    let confidence = 0.5; // Base confidence
    
    // Boost confidence based on available data
    if (content.vacancyCount && content.vacancyCount > 0) confidence += 0.1;
    if (content.lastDate) confidence += 0.1;
    if (content.organization) confidence += 0.1;
    if (content.qualificationLevel) confidence += 0.1;
    if (context.targetKeywords.length > 3) confidence += 0.1;
    if (context.hinglishTerms.length > 2) confidence += 0.1;
    
    // Adjust based on strategy
    switch (strategy) {
      case 'aggressive':
        confidence += 0.05;
        break;
      case 'conservative':
        confidence -= 0.05;
        break;
    }
    
    return Math.min(Math.max(confidence, 0), 1);
  }
}

// Export singleton instance
export const advancedCTROptimizer = new AdvancedCTROptimizer();