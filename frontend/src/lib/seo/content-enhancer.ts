// Content_Enhancer Component - Enhances content with FAQ expansion, topic clustering, and internal linking

import { SEO_CONFIG, FAQ_TEMPLATES, CONTENT_TEMPLATES } from './config';
import { contentCache, CacheKeys } from './cache';
import type { 
  ContentData,
  FAQQuestion,
  TopicCluster,
  InternalLink,
  ContentOptimization,
  ReadabilityScore
} from './interfaces';

export class ContentEnhancer {
  private readonly siteUrl = SEO_CONFIG.SITE_URL;
  private readonly siteName = SEO_CONFIG.SITE_NAME;

  /**
   * Generate comprehensive FAQ content for category pages
   * Expands FAQ sections to 8+ questions with Hinglish content
   */
  async generateFAQContent(category: string, contentType: 'job' | 'scheme' | 'result' | 'admit-card' | 'category' | 'state' = 'job'): Promise<FAQQuestion[]> {
    try {
      const cacheKey = CacheKeys.faqContent(category, contentType);
      const cached = contentCache.get<FAQQuestion[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const faqs: FAQQuestion[] = [];

      // Base FAQ templates by content type
      const baseTemplates = this.getBaseFAQTemplates(contentType);
      
      // Category-specific FAQs
      const categoryFAQs = this.getCategorySpecificFAQs(category, contentType);
      
      // State-specific FAQs (if applicable)
      const stateFAQs = this.getStateSpecificFAQs(category);
      
      // Process-related FAQs
      const processFAQs = this.getProcessFAQs(contentType);
      
      // Eligibility FAQs
      const eligibilityFAQs = this.getEligibilityFAQs(category, contentType);

      // Combine all FAQs
      faqs.push(...baseTemplates);
      faqs.push(...categoryFAQs);
      faqs.push(...stateFAQs);
      faqs.push(...processFAQs);
      faqs.push(...eligibilityFAQs);

      // Ensure we have at least 8 FAQs
      while (faqs.length < 8) {
        faqs.push(...this.getGenericFAQs(contentType));
      }

      // Limit to reasonable number and optimize for Hinglish
      const optimizedFAQs = faqs.slice(0, 12).map(faq => this.optimizeFAQForHinglish(faq, category));

      // Cache the result
      contentCache.set(cacheKey, optimizedFAQs, SEO_CONFIG.CACHE.TTL.CONTENT);

      return optimizedFAQs;
    } catch (error) {
      console.error('FAQ content generation failed:', error);
      return this.getFallbackFAQs(contentType);
    }
  }

  /**
   * Generate keyword-rich introductory content for category pages
   */
  async generateIntroductoryContent(category: string, contentType: 'job' | 'scheme' | 'result' = 'job'): Promise<string> {
    try {
      const cacheKey = CacheKeys.introContent(category, contentType);
      const cached = contentCache.get<string>(cacheKey);
      if (cached) {
        return cached;
      }

      const templates = CONTENT_TEMPLATES.INTRODUCTORY[contentType];
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      // Replace placeholders with category-specific content
      let content = template
        .replace(/\{category\}/g, category)
        .replace(/\{year\}/g, new Date().getFullYear().toString())
        .replace(/\{month\}/g, this.getCurrentMonth());

      // Add keyword density optimization
      content = this.optimizeKeywordDensity(content, category);
      
      // Add Hinglish elements
      content = this.addHinglishElements(content);

      // Cache the result
      contentCache.set(cacheKey, content, SEO_CONFIG.CACHE.TTL.CONTENT);

      return content;
    } catch (error) {
      console.error('Introductory content generation failed:', error);
      return `Latest ${category} notifications and updates for ${new Date().getFullYear()}. सभी ${category} की जानकारी यहाँ पाएं।`;
    }
  }

  /**
   * Create state-specific content sections for location pages
   */
  async generateStateSpecificContent(state: string, contentType: 'job' | 'scheme' = 'job'): Promise<{
    introduction: string;
    highlights: string[];
    localInfo: string;
    faqs: FAQQuestion[];
  }> {
    try {
      const cacheKey = CacheKeys.stateContent(state, contentType);
      const cached = contentCache.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const stateContent = {
        introduction: this.generateStateIntroduction(state, contentType),
        highlights: this.generateStateHighlights(state, contentType),
        localInfo: this.generateLocalInformation(state, contentType),
        faqs: await this.generateStateFAQs(state, contentType)
      };

      // Cache the result
      contentCache.set(cacheKey, stateContent, SEO_CONFIG.CACHE.TTL.CONTENT);

      return stateContent;
    } catch (error) {
      console.error('State-specific content generation failed:', error);
      return this.getFallbackStateContent(state, contentType);
    }
  }

  /**
   * Create topic clusters for related job categories and schemes
   */
  async createTopicClusters(mainTopic: string, contentType: 'job' | 'scheme' = 'job'): Promise<TopicCluster[]> {
    try {
      const cacheKey = CacheKeys.topicClusters(mainTopic, contentType);
      const cached = contentCache.get<TopicCluster[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const clusters: TopicCluster[] = [];

      // Main cluster
      const mainCluster: TopicCluster = {
        title: `${mainTopic} - Complete Guide`,
        description: `Comprehensive information about ${mainTopic} including eligibility, application process, and latest updates`,
        mainKeyword: mainTopic.toLowerCase(),
        relatedKeywords: this.getRelatedKeywords(mainTopic, contentType),
        pages: this.getRelatedPages(mainTopic, contentType),
        priority: 'high'
      };

      clusters.push(mainCluster);

      // Related clusters
      const relatedTopics = this.getRelatedTopics(mainTopic, contentType);
      for (const topic of relatedTopics) {
        clusters.push({
          title: `${topic} Information`,
          description: `Latest updates and information about ${topic}`,
          mainKeyword: topic.toLowerCase(),
          relatedKeywords: this.getRelatedKeywords(topic, contentType),
          pages: this.getRelatedPages(topic, contentType),
          priority: 'medium'
        });
      }

      // Cache the result
      contentCache.set(cacheKey, clusters, SEO_CONFIG.CACHE.TTL.CONTENT);

      return clusters;
    } catch (error) {
      console.error('Topic cluster creation failed:', error);
      return [];
    }
  }

  /**
   * Generate related internal links for improved linking structure
   */
  async generateRelatedLinks(currentPage: string, contentType: 'job' | 'scheme' | 'result' = 'job'): Promise<InternalLink[]> {
    try {
      const cacheKey = CacheKeys.relatedLinks(currentPage, contentType);
      const cached = contentCache.get<InternalLink[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const links: InternalLink[] = [];

      // Category-based links
      const categoryLinks = this.getCategoryLinks(currentPage, contentType);
      links.push(...categoryLinks);

      // State-based links (if applicable)
      const stateLinks = this.getStateLinks(currentPage);
      links.push(...stateLinks);

      // Process-based links
      const processLinks = this.getProcessLinks(contentType);
      links.push(...processLinks);

      // Popular content links
      const popularLinks = this.getPopularLinks(contentType);
      links.push(...popularLinks);

      // Remove duplicates and limit
      const uniqueLinks = this.removeDuplicateLinks(links).slice(0, 8);

      // Cache the result
      contentCache.set(cacheKey, uniqueLinks, SEO_CONFIG.CACHE.TTL.CONTENT);

      return uniqueLinks;
    } catch (error) {
      console.error('Related links generation failed:', error);
      return [];
    }
  }

  /**
   * Add "How to Apply" sections with step-by-step instructions
   */
  generateHowToApplySection(contentType: 'job' | 'scheme', category?: string): {
    title: string;
    steps: Array<{ step: number; title: string; description: string; }>;
    tips: string[];
    importantNotes: string[];
  } {
    const baseSteps = contentType === 'job' 
      ? this.getJobApplicationSteps(category)
      : this.getSchemeApplicationSteps(category);

    return {
      title: contentType === 'job' 
        ? `${category || 'Government Job'} के लिए Apply कैसे करें?`
        : `${category || 'Government Scheme'} के लिए Apply कैसे करें?`,
      steps: baseSteps,
      tips: this.getApplicationTips(contentType),
      importantNotes: this.getImportantNotes(contentType)
    };
  }

  /**
   * Optimize heading structure for proper H1-H6 hierarchy
   */
  optimizeHeadingStructure(content: string): string {
    try {
      // Parse existing headings
      const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
      const headings: Array<{ level: number; text: string; original: string }> = [];
      
      let match;
      while ((match = headingRegex.exec(content)) !== null) {
        headings.push({
          level: parseInt(match[1]),
          text: match[2],
          original: match[0]
        });
      }

      // Optimize hierarchy
      let optimizedContent = content;
      let currentLevel = 1;

      for (const heading of headings) {
        // Ensure proper hierarchy (no skipping levels)
        const targetLevel = Math.min(heading.level, currentLevel + 1);
        
        if (heading.level !== targetLevel) {
          const newHeading = heading.original.replace(
            `<h${heading.level}`,
            `<h${targetLevel}`
          ).replace(
            `</h${heading.level}>`,
            `</h${targetLevel}>`
          );
          
          optimizedContent = optimizedContent.replace(heading.original, newHeading);
        }

        currentLevel = targetLevel;
      }

      return optimizedContent;
    } catch (error) {
      console.error('Heading structure optimization failed:', error);
      return content;
    }
  }

  /**
   * Calculate readability score for content
   */
  calculateReadabilityScore(content: string): ReadabilityScore {
    try {
      if (!content || content.trim().length === 0) {
        return {
          score: 60,
          level: 'Standard',
          wordsCount: 0,
          sentencesCount: 0,
          avgWordsPerSentence: 0,
          suggestions: ['Content is empty']
        };
      }

      const words = content.split(/\s+/).filter(word => word.length > 0).length;
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      const syllables = this.countSyllables(content);
      
      if (words === 0 || sentences === 0) {
        return {
          score: 60,
          level: 'Standard',
          wordsCount: words,
          sentencesCount: sentences,
          avgWordsPerSentence: 0,
          suggestions: ['Content too short to analyze']
        };
      }
      
      // Flesch Reading Ease Score (adapted for Hinglish)
      const avgWordsPerSentence = words / sentences;
      const avgSyllablesPerWord = syllables / words;
      
      const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
      
      // Adjust for Hinglish content
      const hinglishAdjustment = this.getHinglishAdjustment(content);
      const adjustedScore = Math.max(0, Math.min(100, fleschScore + hinglishAdjustment));

      return {
        score: Math.round(adjustedScore),
        level: this.getReadabilityLevel(adjustedScore),
        wordsCount: words,
        sentencesCount: sentences,
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        suggestions: this.getReadabilitySuggestions(adjustedScore, avgWordsPerSentence)
      };
    } catch (error) {
      console.error('Readability calculation failed:', error);
      return {
        score: 60,
        level: 'Standard',
        wordsCount: 0,
        sentencesCount: 0,
        avgWordsPerSentence: 0,
        suggestions: []
      };
    }
  }

  /**
   * Check and optimize keyword density (target: 1-3%)
   */
  checkKeywordDensity(content: string, targetKeyword: string): {
    density: number;
    count: number;
    totalWords: number;
    isOptimal: boolean;
    suggestions: string[];
  } {
    try {
      if (!content || content.trim().length === 0) {
        return {
          density: 0,
          count: 0,
          totalWords: 0,
          isOptimal: false,
          suggestions: ['Content is empty']
        };
      }

      const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 0);
      const totalWords = words.length;
      
      if (totalWords === 0) {
        return {
          density: 0,
          count: 0,
          totalWords: 0,
          isOptimal: false,
          suggestions: ['No words found in content']
        };
      }

      const keywordCount = words.filter(word => 
        word.includes(targetKeyword.toLowerCase()) || 
        targetKeyword.toLowerCase().includes(word)
      ).length;
      
      const density = (keywordCount / totalWords) * 100;
      const isOptimal = density >= 1 && density <= 3;
      
      const suggestions: string[] = [];
      if (density < 1) {
        suggestions.push(`Keyword density is low (${density.toFixed(1)}%). Add more instances of "${targetKeyword}".`);
      } else if (density > 3) {
        suggestions.push(`Keyword density is high (${density.toFixed(1)}%). Reduce keyword usage to avoid over-optimization.`);
      }

      return {
        density: Math.round(density * 10) / 10,
        count: keywordCount,
        totalWords,
        isOptimal,
        suggestions
      };
    } catch (error) {
      console.error('Keyword density check failed:', error);
      return {
        density: 0,
        count: 0,
        totalWords: 0,
        isOptimal: false,
        suggestions: ['Unable to calculate keyword density']
      };
    }
  }

  /**
   * Private helper methods
   */
  private getBaseFAQTemplates(contentType: 'job' | 'scheme' | 'result' | 'admit-card' | 'category' | 'state'): FAQQuestion[] {
    const typeMap: Record<string, keyof typeof FAQ_TEMPLATES> = {
      'job': 'JOBS',
      'scheme': 'SCHEMES',
      'result': 'RESULTS',
      'admit-card': 'ADMIT_CARDS',
      'category': 'JOBS', // Default to jobs for category pages
      'state': 'JOBS' // Default to jobs for state pages
    };
    
    const templateKey = typeMap[contentType] || 'JOBS';
    const templates = FAQ_TEMPLATES[templateKey];
    
    return templates.slice(0, 3).map(template => ({
      '@type': 'Question',
      name: template.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'answerTemplate' in template ? template.answerTemplate : template.answer
      }
    }));
  }

  private getCategorySpecificFAQs(category: string, contentType: 'job' | 'scheme' | 'result' | 'admit-card' | 'category' | 'state'): FAQQuestion[] {
    // Category-specific FAQ generation logic
    const faqs: FAQQuestion[] = [];
    
    if (contentType === 'job') {
      faqs.push({
        '@type': 'Question',
        name: `${category} jobs के लिए qualification क्या चाहिए?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${category} jobs के लिए आमतौर पर graduation या relevant qualification चाहिए होती है। Specific requirements job notification में दी जाती हैं।`
        }
      });
    }

    return faqs;
  }

  private getStateSpecificFAQs(category: string): FAQQuestion[] {
    return [
      {
        '@type': 'Question',
        name: `${category} के लिए state-wise vacancies कैसे check करें?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `State-wise vacancies official notification में detailed breakdown के साथ दी जाती हैं। आप हमारी website पर state filter का use करके भी check कर सकते हैं।`
        }
      }
    ];
  }

  private getProcessFAQs(contentType: string): FAQQuestion[] {
    if (contentType === 'job') {
      return [
        {
          '@type': 'Question',
          name: 'Online application कैसे submit करें?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Official website पर जाकर registration करें, form fill करें, documents upload करें, और fee payment करके application submit करें।'
          }
        }
      ];
    }
    return [];
  }

  private getEligibilityFAQs(category: string, contentType: string): FAQQuestion[] {
    return [
      {
        '@type': 'Question',
        name: `${category} के लिए age limit क्या है?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Age limit job/scheme के according अलग होती है। Generally 18-30 years होती है with relaxation for reserved categories।`
        }
      }
    ];
  }

  private getGenericFAQs(contentType: string): FAQQuestion[] {
    return [
      {
        '@type': 'Question',
        name: 'Application fee कितनी होती है?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Application fee category के according अलग होती है। General candidates के लिए ज्यादा और SC/ST/PWD के लिए exemption या कम fee होती है।'
        }
      }
    ];
  }

  private optimizeFAQForHinglish(faq: FAQQuestion, category: string): FAQQuestion {
    // Add Hinglish optimization logic
    return {
      ...faq,
      name: this.addHinglishElements(faq.name),
      acceptedAnswer: {
        ...faq.acceptedAnswer,
        text: this.addHinglishElements(faq.acceptedAnswer.text)
      }
    };
  }

  private getFallbackFAQs(contentType: string): FAQQuestion[] {
    return [
      {
        '@type': 'Question',
        name: `${contentType} के लिए कैसे apply करें?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Official website पर जाकर online application submit करें।'
        }
      }
    ];
  }

  private generateStateIntroduction(state: string, contentType: string): string {
    return `${state} में latest ${contentType} notifications और updates की complete information यहाँ पाएं। हमारी website पर ${state} के सभी government ${contentType}s की detailed जानकारी available है।`;
  }

  private generateStateHighlights(state: string, contentType: string): string[] {
    return [
      `${state} government ${contentType}s की regular updates`,
      'State-specific eligibility criteria और requirements',
      'Local language में application guidance',
      'State board और commission की latest notifications'
    ];
  }

  private generateLocalInformation(state: string, contentType: string): string {
    return `${state} में ${contentType} opportunities के लिए local offices और contact information। State-specific documents और procedures की complete details।`;
  }

  private async generateStateFAQs(state: string, contentType: string): Promise<FAQQuestion[]> {
    return [
      {
        '@type': 'Question',
        name: `${state} में government ${contentType}s कैसे find करें?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${state} की government ${contentType}s के लिए state employment website और हमारी site का state filter use करें।`
        }
      }
    ];
  }

  private getFallbackStateContent(state: string, contentType: string) {
    return {
      introduction: `${state} ${contentType} information`,
      highlights: [`Latest ${contentType} updates`],
      localInfo: `${state} specific information`,
      faqs: []
    };
  }

  private getRelatedKeywords(topic: string, contentType: string): string[] {
    const baseKeywords = [topic, `${topic} ${contentType}`, `${topic} notification`];
    if (contentType === 'job') {
      baseKeywords.push(`${topic} vacancy`, `${topic} recruitment`, `${topic} bharti`);
    }
    return baseKeywords;
  }

  private getRelatedPages(topic: string, contentType: string): Array<{ title: string; url: string; }> {
    return [
      { title: `${topic} Latest Updates`, url: `/${contentType}s?category=${encodeURIComponent(topic)}` },
      { title: `${topic} Eligibility`, url: `/${contentType}s/eligibility/${encodeURIComponent(topic)}` }
    ];
  }

  private getRelatedTopics(mainTopic: string, contentType: string): string[] {
    // Logic to find related topics based on main topic
    const relatedMap: Record<string, string[]> = {
      'SSC': ['Railway', 'Banking', 'UPSC', 'State PSC'],
      'Railway': ['SSC', 'Banking', 'NTPC', 'Group D'],
      'Banking': ['SSC', 'Insurance', 'RBI', 'NABARD'],
      'Teaching': ['CTET', 'TET', 'KVS', 'NVS']
    };
    
    return relatedMap[mainTopic] || [];
  }

  private getCategoryLinks(currentPage: string, contentType: string): InternalLink[] {
    return [
      {
        text: `Latest ${contentType} Notifications`,
        url: `/${contentType}s`,
        anchor: `latest ${contentType} notifications`,
        relevanceScore: 0.9
      }
    ];
  }

  private getStateLinks(currentPage: string): InternalLink[] {
    const states = ['Jharkhand', 'Bihar', 'Uttar Pradesh', 'Maharashtra'];
    return states.map(state => ({
      text: `${state} Jobs`,
      url: `/jobs/state/${encodeURIComponent(state)}`,
      anchor: `${state} government jobs`,
      relevanceScore: 0.7
    }));
  }

  private getProcessLinks(contentType: string): InternalLink[] {
    return [
      {
        text: 'How to Apply Online',
        url: '/how-to-apply',
        anchor: 'online application process',
        relevanceScore: 0.8
      }
    ];
  }

  private getPopularLinks(contentType: string): InternalLink[] {
    return [
      {
        text: 'Admit Card Downloads',
        url: '/admit-card',
        anchor: 'download admit card',
        relevanceScore: 0.8
      },
      {
        text: 'Result Updates',
        url: '/result',
        anchor: 'check results online',
        relevanceScore: 0.8
      }
    ];
  }

  private removeDuplicateLinks(links: InternalLink[]): InternalLink[] {
    const seen = new Set<string>();
    return links.filter(link => {
      if (seen.has(link.url)) {
        return false;
      }
      seen.add(link.url);
      return true;
    });
  }

  private getJobApplicationSteps(category?: string) {
    return [
      {
        step: 1,
        title: 'Notification Check करें',
        description: 'Official website पर latest job notification check करें और eligibility criteria पढ़ें।'
      },
      {
        step: 2,
        title: 'Online Registration',
        description: 'Official portal पर जाकर new registration करें या existing account से login करें।'
      },
      {
        step: 3,
        title: 'Application Form Fill करें',
        description: 'Personal details, educational qualification, और experience की जानकारी सही से भरें।'
      },
      {
        step: 4,
        title: 'Documents Upload करें',
        description: 'Required documents को scan करके proper format में upload करें।'
      },
      {
        step: 5,
        title: 'Fee Payment करें',
        description: 'Application fee को online payment gateway के through pay करें।'
      },
      {
        step: 6,
        title: 'Application Submit करें',
        description: 'सभी details verify करके final submission करें और receipt save करें।'
      }
    ];
  }

  private getSchemeApplicationSteps(category?: string) {
    return [
      {
        step: 1,
        title: 'Eligibility Check करें',
        description: 'Scheme की eligibility criteria check करें और required documents की list देखें।'
      },
      {
        step: 2,
        title: 'Documents Prepare करें',
        description: 'सभी required documents को collect करें और proper format में ready रखें।'
      },
      {
        step: 3,
        title: 'Online/Offline Application',
        description: 'Scheme के according online portal या offline center पर application submit करें।'
      }
    ];
  }

  private getApplicationTips(contentType: string): string[] {
    return [
      'Application deadline से पहले ही apply करें',
      'सभी documents को properly scan करें (clear और readable)',
      'Payment receipt को safely save करें',
      'Application number को note कर लें future reference के लिए'
    ];
  }

  private getImportantNotes(contentType: string): string[] {
    return [
      'Fake websites से बचें, हमेशा official website use करें',
      'Application fee refund नहीं होती है',
      'Last date के बाद कोई application accept नहीं होती',
      'Technical issues के लिए helpline number use करें'
    ];
  }

  private optimizeKeywordDensity(content: string, keyword: string): string {
    // Basic keyword density optimization
    const words = content.split(' ');
    const keywordCount = words.filter(word => 
      word.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    const density = (keywordCount / words.length) * 100;
    
    if (density < 1) {
      // Add keyword naturally
      content += ` Latest ${keyword} updates और notifications के लिए regular check करें।`;
    }
    
    return content;
  }

  private addHinglishElements(content: string): string {
    // Add natural Hinglish elements
    let hinglishContent = content
      .replace(/\bcheck\b/gi, 'check')
      .replace(/\bapply\b/gi, 'apply')
      .replace(/\blatest\b/gi, 'latest')
      .replace(/\bonline\b/gi, 'online');

    // Add common Hinglish phrases if not already present
    if (!content.includes('करें') && !content.includes('के लिए')) {
      hinglishContent += ' Latest updates के लिए regular check करें।';
    }

    return hinglishContent;
  }

  private getCurrentMonth(): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[new Date().getMonth()];
  }

  private countSyllables(text: string): number {
    // Simple syllable counting for readability
    const words = text.toLowerCase().split(/\s+/);
    let syllableCount = 0;
    
    for (const word of words) {
      const vowels = word.match(/[aeiouAEIOU]/g);
      syllableCount += vowels ? vowels.length : 1;
    }
    
    return syllableCount;
  }

  private getHinglishAdjustment(content: string): number {
    // Adjust readability score for Hinglish content
    const hindiChars = content.match(/[\u0900-\u097F]/g);
    const hindiRatio = hindiChars ? hindiChars.length / content.length : 0;
    
    // Hinglish content is generally easier to understand for target audience
    return hindiRatio * 10;
  }

  private getReadabilityLevel(score: number): string {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  }

  private getReadabilitySuggestions(score: number, avgWordsPerSentence: number): string[] {
    const suggestions: string[] = [];
    
    if (score < 60) {
      suggestions.push('Use shorter sentences to improve readability');
      suggestions.push('Replace complex words with simpler alternatives');
    }
    
    if (avgWordsPerSentence > 20) {
      suggestions.push('Break long sentences into shorter ones');
    }
    
    return suggestions;
  }
}

// Export singleton instance
export const contentEnhancer = new ContentEnhancer();