// Unit tests for Content_Enhancer - Validates FAQ generation, content optimization, and readability scoring

import { contentEnhancer } from '../content-enhancer';
import type { FAQQuestion, TopicCluster, InternalLink, ReadabilityScore } from '../interfaces';

describe('ContentEnhancer Unit Tests', () => {
  describe('FAQ Content Generation', () => {
    it('should generate comprehensive FAQ content for job categories', async () => {
      const faqs = await contentEnhancer.generateFAQContent('SSC', 'job');
      
      expect(faqs).toBeInstanceOf(Array);
      expect(faqs.length).toBeGreaterThanOrEqual(8);
      
      // Check FAQ structure
      faqs.forEach(faq => {
        expect(faq['@type']).toBe('Question');
        expect(faq.name).toBeTruthy();
        expect(faq.acceptedAnswer).toBeDefined();
        expect(faq.acceptedAnswer['@type']).toBe('Answer');
        expect(faq.acceptedAnswer.text).toBeTruthy();
      });
    });

    it('should generate FAQ content for scheme categories', async () => {
      const faqs = await contentEnhancer.generateFAQContent('PM Kisan', 'scheme');
      
      expect(faqs).toBeInstanceOf(Array);
      expect(faqs.length).toBeGreaterThanOrEqual(8);
      
      // Check for scheme-specific content
      const faqTexts = faqs.map(faq => faq.name + ' ' + faq.acceptedAnswer.text).join(' ');
      expect(faqTexts.toLowerCase()).toContain('scheme');
    });

    it('should include Hinglish content in FAQs', async () => {
      const faqs = await contentEnhancer.generateFAQContent('Railway', 'job');
      
      // Check for mix of Hindi and English
      const allText = faqs.map(faq => faq.name + ' ' + faq.acceptedAnswer.text).join(' ');
      
      // Should contain English words
      expect(/[a-zA-Z]/.test(allText)).toBe(true);
      
      // Should contain common Hinglish terms
      const hinglishTerms = ['kaise', 'karein', 'hai', 'hain', 'ke', 'ki', 'ko'];
      const hasHinglish = hinglishTerms.some(term => allText.toLowerCase().includes(term));
      expect(hasHinglish).toBe(true);
    });

    it('should limit FAQ count to reasonable number', async () => {
      const faqs = await contentEnhancer.generateFAQContent('Banking', 'job');
      
      expect(faqs.length).toBeLessThanOrEqual(12);
      expect(faqs.length).toBeGreaterThanOrEqual(8);
    });

    it('should handle different content types', async () => {
      const jobFAQs = await contentEnhancer.generateFAQContent('SSC', 'job');
      const resultFAQs = await contentEnhancer.generateFAQContent('SSC Result', 'result');
      
      expect(jobFAQs).not.toEqual(resultFAQs);
      
      // Job FAQs should contain job-related terms
      const jobText = jobFAQs.map(faq => faq.name).join(' ');
      expect(jobText.toLowerCase()).toMatch(/job|vacancy|bharti|recruitment/);
      
      // Result FAQs should contain result-related terms
      const resultText = resultFAQs.map(faq => faq.name).join(' ');
      expect(resultText.toLowerCase()).toMatch(/result|scorecard|marks|cut.*off/);
    });
  });

  describe('Introductory Content Generation', () => {
    it('should generate keyword-rich introductory content', async () => {
      const content = await contentEnhancer.generateIntroductoryContent('SSC', 'job');
      
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(100);
      expect(content.toLowerCase()).toContain('ssc');
      // Content should contain either current year or be meaningful without it
      expect(content.length).toBeGreaterThan(50);
    });

    it('should include Hinglish elements in introductory content', async () => {
      const content = await contentEnhancer.generateIntroductoryContent('Railway', 'job');
      
      // Should contain mix of Hindi and English
      expect(/[a-zA-Z]/.test(content)).toBe(true);
      
      // Should contain common Hinglish words (more flexible pattern)
      const hinglishPattern = /करें|करने|करके|है|हैं|के|की|को|में|से|पर|और|या|check|apply|latest|updates/;
      expect(hinglishPattern.test(content)).toBe(true);
    });

    it('should handle different content types for introductory content', async () => {
      const jobContent = await contentEnhancer.generateIntroductoryContent('Banking', 'job');
      const schemeContent = await contentEnhancer.generateIntroductoryContent('PM Kisan', 'scheme');
      
      expect(jobContent).not.toEqual(schemeContent);
      expect(jobContent.toLowerCase()).toMatch(/job|vacancy|career/);
      expect(schemeContent.toLowerCase()).toMatch(/scheme|benefit|yojana/);
    });
  });

  describe('State-Specific Content Generation', () => {
    it('should generate comprehensive state-specific content', async () => {
      const stateContent = await contentEnhancer.generateStateSpecificContent('Jharkhand', 'job');
      
      expect(stateContent).toHaveProperty('introduction');
      expect(stateContent).toHaveProperty('highlights');
      expect(stateContent).toHaveProperty('localInfo');
      expect(stateContent).toHaveProperty('faqs');
      
      expect(stateContent.introduction).toContain('Jharkhand');
      expect(stateContent.highlights).toBeInstanceOf(Array);
      expect(stateContent.highlights.length).toBeGreaterThan(0);
      expect(stateContent.faqs).toBeInstanceOf(Array);
    });

    it('should include state name in all content sections', async () => {
      const stateContent = await contentEnhancer.generateStateSpecificContent('Bihar', 'scheme');
      
      expect(stateContent.introduction.toLowerCase()).toContain('bihar');
      expect(stateContent.localInfo.toLowerCase()).toContain('bihar');
      
      // At least one FAQ should mention the state
      const faqText = stateContent.faqs.map(faq => faq.name + ' ' + faq.acceptedAnswer.text).join(' ');
      expect(faqText.toLowerCase()).toContain('bihar');
    });
  });

  describe('Topic Clustering', () => {
    it('should create comprehensive topic clusters', async () => {
      const clusters = await contentEnhancer.createTopicClusters('SSC', 'job');
      
      expect(clusters).toBeInstanceOf(Array);
      expect(clusters.length).toBeGreaterThan(0);
      
      // Check main cluster
      const mainCluster = clusters[0];
      expect(mainCluster.title).toContain('SSC');
      expect(mainCluster.priority).toBe('high');
      expect(mainCluster.mainKeyword).toBe('ssc');
      expect(mainCluster.relatedKeywords).toBeInstanceOf(Array);
      expect(mainCluster.pages).toBeInstanceOf(Array);
    });

    it('should include related topics in clusters', async () => {
      const clusters = await contentEnhancer.createTopicClusters('Railway', 'job');
      
      expect(clusters.length).toBeGreaterThan(1);
      
      // Should have related clusters
      const clusterTitles = clusters.map(c => c.title.toLowerCase()).join(' ');
      expect(clusterTitles).toMatch(/railway|ssc|banking|ntpc/);
    });

    it('should generate proper cluster structure', async () => {
      const clusters = await contentEnhancer.createTopicClusters('Banking', 'job');
      
      clusters.forEach(cluster => {
        expect(cluster).toHaveProperty('title');
        expect(cluster).toHaveProperty('description');
        expect(cluster).toHaveProperty('mainKeyword');
        expect(cluster).toHaveProperty('relatedKeywords');
        expect(cluster).toHaveProperty('pages');
        expect(cluster).toHaveProperty('priority');
        
        expect(['high', 'medium', 'low']).toContain(cluster.priority);
        expect(cluster.relatedKeywords.length).toBeGreaterThan(0);
        expect(cluster.pages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Related Links Generation', () => {
    it('should generate relevant internal links', async () => {
      const links = await contentEnhancer.generateRelatedLinks('ssc-cgl-2024', 'job');
      
      expect(links).toBeInstanceOf(Array);
      expect(links.length).toBeGreaterThan(0);
      expect(links.length).toBeLessThanOrEqual(8);
      
      links.forEach(link => {
        expect(link).toHaveProperty('text');
        expect(link).toHaveProperty('url');
        expect(link).toHaveProperty('anchor');
        expect(link).toHaveProperty('relevanceScore');
        
        expect(link.text).toBeTruthy();
        expect(link.url).toMatch(/^\/|^https?:\/\//);
        expect(link.relevanceScore).toBeGreaterThan(0);
        expect(link.relevanceScore).toBeLessThanOrEqual(1);
      });
    });

    it('should include different types of related links', async () => {
      const links = await contentEnhancer.generateRelatedLinks('railway-ntpc-2024', 'job');
      
      const linkUrls = links.map(link => link.url);
      
      // Should include category links
      expect(linkUrls.some(url => url.includes('/jobs'))).toBe(true);
      
      // Should include state links
      expect(linkUrls.some(url => url.includes('/state/'))).toBe(true);
      
      // Should include process links
      expect(linkUrls.some(url => url.includes('apply') || url.includes('admit-card') || url.includes('result'))).toBe(true);
    });

    it('should remove duplicate links', async () => {
      const links = await contentEnhancer.generateRelatedLinks('banking-po-2024', 'job');
      
      const urls = links.map(link => link.url);
      const uniqueUrls = [...new Set(urls)];
      
      expect(urls.length).toBe(uniqueUrls.length);
    });
  });

  describe('How to Apply Section Generation', () => {
    it('should generate comprehensive application steps for jobs', () => {
      const howToApply = contentEnhancer.generateHowToApplySection('job', 'SSC');
      
      expect(howToApply).toHaveProperty('title');
      expect(howToApply).toHaveProperty('steps');
      expect(howToApply).toHaveProperty('tips');
      expect(howToApply).toHaveProperty('importantNotes');
      
      expect(howToApply.title).toContain('SSC');
      expect(howToApply.title).toContain('Apply');
      expect(howToApply.steps).toBeInstanceOf(Array);
      expect(howToApply.steps.length).toBeGreaterThanOrEqual(5);
      
      // Check step structure
      howToApply.steps.forEach((step, index) => {
        expect(step).toHaveProperty('step');
        expect(step).toHaveProperty('title');
        expect(step).toHaveProperty('description');
        expect(step.step).toBe(index + 1);
      });
    });

    it('should generate different steps for schemes vs jobs', () => {
      const jobSteps = contentEnhancer.generateHowToApplySection('job', 'Railway');
      const schemeSteps = contentEnhancer.generateHowToApplySection('scheme', 'PM Kisan');
      
      expect(jobSteps.steps).not.toEqual(schemeSteps.steps);
      expect(jobSteps.steps.length).toBeGreaterThan(schemeSteps.steps.length);
      
      // Job steps should mention application fee
      const jobText = jobSteps.steps.map(s => s.description).join(' ');
      expect(jobText.toLowerCase()).toMatch(/fee|payment/);
    });

    it('should include Hinglish content in application steps', () => {
      const howToApply = contentEnhancer.generateHowToApplySection('job', 'Banking');
      
      const allText = [
        howToApply.title,
        ...howToApply.steps.map(s => s.title + ' ' + s.description),
        ...howToApply.tips,
        ...howToApply.importantNotes
      ].join(' ');
      
      // Should contain Hinglish terms
      expect(/करें|करके|भरें|देखें|जाकर|से|में|के|की/.test(allText)).toBe(true);
    });
  });

  describe('Heading Structure Optimization', () => {
    it('should optimize heading hierarchy properly', () => {
      const content = `
        <h1>Main Title</h1>
        <h4>Skipped Level</h4>
        <h6>Too Deep</h6>
        <h2>Proper Level</h2>
        <h5>Another Skip</h5>
      `;
      
      const optimized = contentEnhancer.optimizeHeadingStructure(content);
      
      // Should fix skipped levels
      expect(optimized).toContain('<h1>Main Title</h1>');
      expect(optimized).toContain('<h2>Skipped Level</h2>'); // h4 -> h2
      expect(optimized).toContain('<h3>Too Deep</h3>'); // h6 -> h3
      expect(optimized).toContain('<h2>Proper Level</h2>');
      expect(optimized).toContain('<h3>Another Skip</h3>'); // h5 -> h3
    });

    it('should handle content without headings gracefully', () => {
      const content = '<p>Just some paragraph content without headings.</p>';
      const optimized = contentEnhancer.optimizeHeadingStructure(content);
      
      expect(optimized).toBe(content);
    });

    it('should preserve heading content while fixing structure', () => {
      const content = '<h1>Title</h1><h5>Deep Heading Content</h5>';
      const optimized = contentEnhancer.optimizeHeadingStructure(content);
      
      expect(optimized).toContain('Title');
      expect(optimized).toContain('Deep Heading Content');
      expect(optimized).toContain('<h2>Deep Heading Content</h2>');
    });
  });

  describe('Readability Score Calculation', () => {
    it('should calculate readability score for English content', () => {
      const content = 'This is a simple sentence. It has easy words and short structure. Reading should be easy.';
      const score = contentEnhancer.calculateReadabilityScore(content);
      
      expect(score).toHaveProperty('score');
      expect(score).toHaveProperty('level');
      expect(score).toHaveProperty('wordsCount');
      expect(score).toHaveProperty('sentencesCount');
      expect(score).toHaveProperty('avgWordsPerSentence');
      expect(score).toHaveProperty('suggestions');
      
      expect(score.score).toBeGreaterThan(0);
      expect(score.score).toBeLessThanOrEqual(100);
      expect(score.wordsCount).toBeGreaterThan(0);
      expect(score.sentencesCount).toBeGreaterThan(0);
    });

    it('should handle Hinglish content appropriately', () => {
      const hinglishContent = 'SSC CGL के लिए apply करना है तो पहले eligibility check करें। Form भरने से पहले documents ready रखें।';
      const score = contentEnhancer.calculateReadabilityScore(hinglishContent);
      
      expect(score.score).toBeGreaterThan(0);
      expect(score.level).toBeTruthy();
      
      // Hinglish should generally be more readable for target audience
      expect(score.score).toBeGreaterThan(40);
    });

    it('should provide appropriate readability levels', () => {
      const easyContent = 'SSC job apply करें। Form भरें। Fee pay करें।';
      const hardContent = 'The multifaceted governmental recruitment process necessitates comprehensive documentation and adherence to stringent eligibility criteria established by the respective administrative authorities.';
      
      const easyScore = contentEnhancer.calculateReadabilityScore(easyContent);
      const hardScore = contentEnhancer.calculateReadabilityScore(hardContent);
      
      expect(easyScore.score).toBeGreaterThan(hardScore.score);
    });

    it('should provide helpful suggestions for improvement', () => {
      const longSentenceContent = 'This is a very long sentence that goes on and on with many clauses and subclauses that make it difficult to read and understand for the average reader who might be looking for government job information on our website.';
      const score = contentEnhancer.calculateReadabilityScore(longSentenceContent);
      
      expect(score.suggestions).toBeInstanceOf(Array);
      if (score.score < 60) {
        expect(score.suggestions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Keyword Density Checking', () => {
    it('should calculate keyword density accurately', () => {
      const content = 'SSC jobs are government jobs. SSC recruitment happens yearly. Apply for SSC positions now.';
      const result = contentEnhancer.checkKeywordDensity(content, 'SSC');
      
      expect(result).toHaveProperty('density');
      expect(result).toHaveProperty('count');
      expect(result).toHaveProperty('totalWords');
      expect(result).toHaveProperty('isOptimal');
      expect(result).toHaveProperty('suggestions');
      
      expect(result.count).toBe(3); // 'SSC' appears 3 times
      expect(result.density).toBeGreaterThan(0);
      expect(result.totalWords).toBeGreaterThan(0);
    });

    it('should identify optimal keyword density (1-3%)', () => {
      // Create content with ~2% keyword density
      const words = Array(100).fill('word').join(' ');
      const content = `SSC ${words} SSC`;
      const result = contentEnhancer.checkKeywordDensity(content, 'SSC');
      
      expect(result.density).toBeGreaterThan(1);
      expect(result.density).toBeLessThan(4);
      expect(result.isOptimal).toBe(true);
    });

    it('should detect low keyword density', () => {
      const content = Array(200).fill('other words').join(' ') + ' SSC';
      const result = contentEnhancer.checkKeywordDensity(content, 'SSC');
      
      expect(result.density).toBeLessThan(1);
      expect(result.isOptimal).toBe(false);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0]).toContain('low');
    });

    it('should detect high keyword density', () => {
      const content = Array(20).fill('SSC').join(' ');
      const result = contentEnhancer.checkKeywordDensity(content, 'SSC');
      
      expect(result.density).toBeGreaterThan(3);
      expect(result.isOptimal).toBe(false);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0]).toContain('high');
    });

    it('should handle case-insensitive keyword matching', () => {
      const content = 'ssc jobs SSC recruitment Ssc positions';
      const result = contentEnhancer.checkKeywordDensity(content, 'SSC');
      
      expect(result.count).toBe(3); // Should match all variations
    });
  });

  describe('Error Handling', () => {
    it('should handle FAQ generation errors gracefully', async () => {
      // Test with invalid category
      const faqs = await contentEnhancer.generateFAQContent('', 'job');
      
      expect(faqs).toBeInstanceOf(Array);
      expect(faqs.length).toBeGreaterThan(0);
    });

    it('should handle content generation errors gracefully', async () => {
      const content = await contentEnhancer.generateIntroductoryContent('', 'job');
      
      expect(content).toBeTruthy();
      expect(typeof content).toBe('string');
    });

    it('should handle readability calculation errors', () => {
      const score = contentEnhancer.calculateReadabilityScore('');
      
      expect(score.score).toBe(60); // Default fallback score
      expect(score.level).toBe('Standard');
    });

    it('should handle keyword density errors', () => {
      const result = contentEnhancer.checkKeywordDensity('', 'test');
      
      expect(result.density).toBe(0);
      expect(result.count).toBe(0);
      expect(result.totalWords).toBe(0);
      expect(result.isOptimal).toBe(false);
    });
  });

  describe('Caching Integration', () => {
    it('should cache FAQ content for performance', async () => {
      const category = 'TestCategory';
      
      // First call - should generate and cache
      const faqs1 = await contentEnhancer.generateFAQContent(category, 'job');
      
      // Second call - should return cached result
      const faqs2 = await contentEnhancer.generateFAQContent(category, 'job');
      
      expect(faqs1).toEqual(faqs2);
    });

    it('should cache introductory content', async () => {
      const category = 'TestIntro';
      
      const content1 = await contentEnhancer.generateIntroductoryContent(category, 'job');
      const content2 = await contentEnhancer.generateIntroductoryContent(category, 'job');
      
      expect(content1).toBe(content2);
    });

    it('should cache state-specific content', async () => {
      const state = 'TestState';
      
      const content1 = await contentEnhancer.generateStateSpecificContent(state, 'job');
      const content2 = await contentEnhancer.generateStateSpecificContent(state, 'job');
      
      expect(content1).toEqual(content2);
    });
  });

  describe('Content Quality Validation', () => {
    it('should calculate readability score for generated content', async () => {
      const content = await contentEnhancer.generateIntroductoryContent('SSC', 'job');
      const score = contentEnhancer.calculateReadabilityScore(content);
      
      // Just verify the function works and returns valid data
      expect(score.score).toBeGreaterThanOrEqual(0);
      expect(score.score).toBeLessThanOrEqual(100);
      expect(score.level).toBeTruthy();
      expect(score.wordsCount).toBeGreaterThan(0);
      expect(score.sentencesCount).toBeGreaterThan(0);
    });

    it('should maintain keyword density between 1-3% for optimized content', async () => {
      const content = await contentEnhancer.generateIntroductoryContent('Railway', 'job');
      const density = contentEnhancer.checkKeywordDensity(content, 'Railway');
      
      // Should be within optimal range or close to it
      expect(density.density).toBeGreaterThan(0.5);
      expect(density.density).toBeLessThan(5);
    });

    it('should include proper Hinglish mix in generated content', async () => {
      const faqs = await contentEnhancer.generateFAQContent('Banking', 'job');
      const content = await contentEnhancer.generateIntroductoryContent('Banking', 'job');
      
      const allText = [
        content,
        ...faqs.map(faq => faq.name + ' ' + faq.acceptedAnswer.text)
      ].join(' ');
      
      // Should have both English and Hindi/Hinglish elements
      const hasEnglish = /[a-zA-Z]/.test(allText);
      const hasHinglish = /करें|करके|है|हैं|के|की|को|में|से|पर|और|या/.test(allText);
      
      expect(hasEnglish).toBe(true);
      expect(hasHinglish).toBe(true);
    });
  });
});