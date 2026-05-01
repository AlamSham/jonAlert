// Meta Description Enhancement - Advanced description optimization strategies

import { SEO_CONFIG, HINGLISH_TERMS } from './config';
import { seoCache, CacheKeys } from './cache';
import type { ContentData, OptimizationContext } from './interfaces';

export class MetaDescriptionEnhancer {
  private readonly maxLength = SEO_CONFIG.MAX_DESCRIPTION_LENGTH;
  private readonly minLength = SEO_CONFIG.MIN_DESCRIPTION_LENGTH;

  /**
   * Generate compelling calls-to-action based on content type and urgency
   */
  generateCompellingCTA(content: ContentData, context: OptimizationContext): string {
    const ctasByCategory: Record<string, string[]> = {
      'job': [
        'Apply now - Last dates approaching!',
        'Jaldi apply karein - Limited seats!',
        'Don\'t miss this opportunity!',
        'Apply before deadline!',
        'Secure your government job!'
      ],
      'result': [
        'Check your result now!',
        'Download scorecard instantly!',
        'Result declared - Check now!',
        'Merit list available!',
        'Apna result check karein!'
      ],
      'admit-card': [
        'Download admit card now!',
        'Hall ticket ready for download!',
        'Print your admit card!',
        'Exam center details available!',
        'Admit card download karein!'
      ],
      'scheme': [
        'Apply for benefits now!',
        'Check eligibility criteria!',
        'Government scheme - Apply free!',
        'Yojana ka faayda uthayein!',
        'Online application available!'
      ]
    };

    const ctas = ctasByCategory[content.category] || ctasByCategory['job'];
    
    // Select CTA based on urgency
    if (this.isUrgent(content)) {
      return ctas[0] || ctas[1]; // Use urgent CTAs
    }
    
    return ctas[Math.floor(Math.random() * ctas.length)];
  }

  /**
   * Add benefit statements to descriptions
   */
  generateBenefitStatements(content: ContentData, context: OptimizationContext): string[] {
    const benefits: string[] = [];

    // Category-specific benefits
    switch (content.category) {
      case 'job':
        benefits.push('Government job security');
        if (content.salary) benefits.push(`Salary: ${content.salary}`);
        if (content.vacancyCount) benefits.push(`${content.vacancyCount} vacancies`);
        benefits.push('Pension & medical benefits');
        break;
      
      case 'result':
        benefits.push('Instant result check');
        benefits.push('Scorecard download');
        benefits.push('Merit list access');
        break;
      
      case 'admit-card':
        benefits.push('Instant download');
        benefits.push('Exam center details');
        benefits.push('Mobile-friendly format');
        break;
      
      case 'scheme':
        benefits.push('Free government benefits');
        benefits.push('Easy online application');
        benefits.push('Direct bank transfer');
        break;
    }

    // General benefits
    benefits.push('100% free service');
    benefits.push('Instant notifications');
    benefits.push('Official links only');

    return benefits.slice(0, 3); // Limit to top 3 benefits
  }

  /**
   * Add social proof elements
   */
  generateSocialProof(content: ContentData, context: OptimizationContext): string {
    const socialProofElements = [
      '50,000+ students trust us',
      'Lakhs of successful applications',
      'India\'s #1 job portal',
      'Trusted by government job seekers',
      '10 lakh+ notifications sent',
      'Verified by thousands of users'
    ];

    // Select based on content type
    if (content.category === 'job' && content.vacancyCount && content.vacancyCount > 1000) {
      return 'Join thousands of applicants';
    }

    return socialProofElements[Math.floor(Math.random() * socialProofElements.length)];
  }

  /**
   * Optimize description length and readability
   */
  optimizeDescriptionLength(description: string, content: ContentData): string {
    // If too short, expand with additional information
    if (description.length < this.minLength) {
      return this.expandDescription(description, content);
    }

    // If too long, intelligently truncate
    if (description.length > this.maxLength) {
      return this.intelligentTruncate(description);
    }

    return description;
  }

  /**
   * Add location-specific benefits for state pages
   */
  generateLocationBenefits(state: string, content: ContentData): string[] {
    const locationBenefits = [
      `${state} government jobs`,
      `Local ${state} opportunities`,
      `${state} state benefits`,
      `Work in ${state}`,
      `${state} domicile advantage`
    ];

    return locationBenefits.slice(0, 2);
  }

  /**
   * Create urgency-driven descriptions
   */
  createUrgencyDescription(content: ContentData, daysLeft?: number): string {
    if (!daysLeft && content.lastDate) {
      const deadline = new Date(content.lastDate);
      const now = new Date();
      daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    if (daysLeft && daysLeft <= 3) {
      return `🚨 URGENT: Only ${daysLeft} days left! ${content.title}. Apply immediately - Don't miss this opportunity!`;
    } else if (daysLeft && daysLeft <= 7) {
      return `⏰ Limited time: ${daysLeft} days remaining for ${content.title}. Apply soon to secure your spot!`;
    }

    return '';
  }

  /**
   * Generate statistics-driven descriptions
   */
  generateStatisticsDescription(content: ContentData): string {
    const stats: string[] = [];

    if (content.vacancyCount) {
      stats.push(`${content.vacancyCount.toLocaleString('en-IN')} vacancies`);
    }

    if (content.salary) {
      stats.push(`Salary: ${content.salary}`);
    }

    if (content.qualificationLevel) {
      stats.push(`${content.qualificationLevel} eligible`);
    }

    if (stats.length > 0) {
      return stats.join(', ') + '.';
    }

    return '';
  }

  /**
   * Create mobile-optimized descriptions
   */
  optimizeForMobile(description: string): string {
    // Mobile descriptions should be front-loaded with key information
    const sentences = description.split('. ');
    
    if (sentences.length > 1) {
      // Ensure the first sentence contains the most important information
      const firstSentence = sentences[0];
      const remainingSentences = sentences.slice(1);
      
      // If first sentence is too short, combine with second
      if (firstSentence.length < 50 && remainingSentences.length > 0) {
        return `${firstSentence}. ${remainingSentences[0]}. ${remainingSentences.slice(1).join('. ')}`.trim();
      }
    }

    return description;
  }

  /**
   * Add emotional triggers to descriptions
   */
  addEmotionalTriggers(description: string, triggers: string[]): string {
    // Don't add if description already has emotional elements
    if (description.match(/[!🔥⚡🚨]/)) {
      return description;
    }

    const emotionalPhrases = [
      'Don\'t miss out!',
      'Limited opportunity!',
      'Exclusive access!',
      'Act fast!',
      'Secure your future!'
    ];

    const phrase = emotionalPhrases[Math.floor(Math.random() * emotionalPhrases.length)];
    
    // Add if space allows
    if (description.length + phrase.length + 1 <= this.maxLength) {
      return `${description} ${phrase}`;
    }

    return description;
  }

  /**
   * Private helper methods
   */
  private isUrgent(content: ContentData): boolean {
    if (!content.lastDate) return false;
    
    const deadline = new Date(content.lastDate);
    const now = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysLeft <= 7;
  }

  private expandDescription(description: string, content: ContentData): string {
    const expansions: string[] = [];

    // Add qualification info
    if (content.qualificationLevel) {
      expansions.push(`${content.qualificationLevel} candidates eligible.`);
    }

    // Add application info
    if (content.applyLink) {
      expansions.push('Online application available.');
    }

    // Add organization info
    if (content.organization && !description.includes(content.organization)) {
      expansions.push(`By ${content.organization}.`);
    }

    // Add generic expansion
    if (expansions.length === 0) {
      expansions.push('Check complete details and eligibility criteria.');
    }

    // Add expansions while respecting max length
    for (const expansion of expansions) {
      if (description.length + expansion.length + 1 <= this.maxLength) {
        description += ` ${expansion}`;
      }
      
      if (description.length >= this.minLength) {
        break;
      }
    }

    return description;
  }

  private intelligentTruncate(description: string): string {
    // Try to truncate at sentence boundary
    const sentences = description.split('. ');
    let truncated = '';
    
    for (const sentence of sentences) {
      const potential = truncated ? `${truncated}. ${sentence}` : sentence;
      
      if (potential.length <= this.maxLength - 3) {
        truncated = potential;
      } else {
        break;
      }
    }

    // If we have a good truncation, use it
    if (truncated.length > this.maxLength * 0.8) {
      return truncated + '.';
    }

    // Otherwise, truncate at word boundary
    const words = description.split(' ');
    truncated = '';
    
    for (const word of words) {
      const potential = truncated ? `${truncated} ${word}` : word;
      
      if (potential.length <= this.maxLength - 3) {
        truncated = potential;
      } else {
        break;
      }
    }

    return truncated + '...';
  }
}

// Export singleton instance
export const metaDescriptionEnhancer = new MetaDescriptionEnhancer();