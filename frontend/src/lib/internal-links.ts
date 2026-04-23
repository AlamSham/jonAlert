import { JobDetail, CATEGORY_LABELS } from './types';

export interface InternalLink {
  href: string;
  label: string;
  type: 'category' | 'state' | 'qualification' | 'tag' | 'related';
  count?: number; // Optional count for display
}

export interface FAQItem {
  question: string;
  answer: string;
}

// Generate contextual links for job detail pages
export function generateJobContextualLinks(job: JobDetail): InternalLink[] {
  const links: InternalLink[] = [];
  
  try {
    // Category page link
    const categoryHref = job.category === 'job' ? '/jobs' : `/${job.category}`;
    const categoryLabel = CATEGORY_LABELS[job.category] || job.category;
    links.push({
      href: categoryHref,
      label: `More ${categoryLabel}`,
      type: 'category'
    });
    
    // State page link (if state exists and not "All India")
    if (job.state && job.state !== 'All India') {
      links.push({
        href: `/jobs/state/${encodeURIComponent(job.state)}`,
        label: `${job.state} Jobs`,
        type: 'state'
      });
    }
    
    // Qualification page link (if qualificationLevel exists)
    if (job.qualificationLevel && job.qualificationLevel !== '') {
      const qualificationMap: Record<string, string> = {
        '10th': '10th+pass',
        '12th': '12th+pass',
        'graduate': 'Graduate',
        'post-graduate': 'Post+Graduate',
        'diploma': 'Diploma',
        'iti': 'ITI',
        'any': 'Any+Qualification'
      };
      
      const searchTerm = qualificationMap[job.qualificationLevel.toLowerCase()] || job.qualificationLevel;
      links.push({
        href: `/search?q=${searchTerm}`,
        label: `${job.qualificationLevel} Jobs`,
        type: 'qualification'
      });
    }
    
    // Organization-based link (if organization exists)
    if (job.organization && job.organization !== '') {
      links.push({
        href: `/search?q=${encodeURIComponent(job.organization)}`,
        label: `${job.organization} Jobs`,
        type: 'related'
      });
    }
    
    // Tag-based links (first 3 tags)
    if (job.tags && job.tags.length > 0) {
      job.tags.slice(0, 3).forEach(tag => {
        if (tag && tag.trim() !== '') {
          links.push({
            href: `/search?q=${encodeURIComponent(tag)}`,
            label: `${tag} Jobs`,
            type: 'tag'
          });
        }
      });
    }
    
    return links;
  } catch (error) {
    console.error('Error generating job contextual links:', error);
    return [];
  }
}

// Generate related content suggestions
export function generateRelatedContentLinks(
  category: string,
  state?: string,
  tags?: string[]
): InternalLink[] {
  const links: InternalLink[] = [];
  
  try {
    // Related categories
    const relatedCategories: Record<string, string[]> = {
      job: ['result', 'admit-card'],
      result: ['job', 'admit-card'],
      'admit-card': ['job', 'result'],
      admission: ['scholarship', 'exam-form'],
      scholarship: ['admission', 'exam-form'],
      'exam-form': ['admission', 'scholarship']
    };
    
    const related = relatedCategories[category] || [];
    related.forEach(relatedCategory => {
      const href = relatedCategory === 'job' ? '/jobs' : `/${relatedCategory}`;
      const label = CATEGORY_LABELS[relatedCategory as keyof typeof CATEGORY_LABELS] || relatedCategory;
      links.push({
        href,
        label: `Latest ${label}`,
        type: 'category'
      });
    });
    
    // State-based link (if state provided and not "All India")
    if (state && state !== 'All India') {
      links.push({
        href: `/jobs/state/${encodeURIComponent(state)}`,
        label: `${state} Jobs`,
        type: 'state'
      });
    }
    
    // Tag-based links (if tags provided)
    if (tags && tags.length > 0) {
      tags.slice(0, 2).forEach(tag => {
        if (tag && tag.trim() !== '') {
          links.push({
            href: `/search?q=${encodeURIComponent(tag)}`,
            label: `${tag} Updates`,
            type: 'tag'
          });
        }
      });
    }
    
    return links;
  } catch (error) {
    console.error('Error generating related content links:', error);
    return [];
  }
}

// Generate qualification-based links
export function getQualificationLinks(): InternalLink[] {
  const qualifications = [
    { level: '10th Pass', search: '10th+pass', label: '10th Pass Jobs' },
    { level: '12th Pass', search: '12th+pass', label: '12th Pass Jobs' },
    { level: 'Graduate', search: 'Graduate', label: 'Graduate Jobs' },
    { level: 'Post Graduate', search: 'Post+Graduate', label: 'Post Graduate Jobs' },
    { level: 'ITI', search: 'ITI', label: 'ITI Jobs' },
    { level: 'Diploma', search: 'Diploma', label: 'Diploma Jobs' },
    { level: 'Engineering', search: 'Engineering', label: 'Engineering Jobs' },
    { level: 'Any Qualification', search: 'Any+Qualification', label: 'Any Qualification Jobs' }
  ];
  
  return qualifications.map(qual => ({
    href: `/search?q=${qual.search}`,
    label: qual.label,
    type: 'qualification' as const
  }));
}

// Generate state-based links
export function getTopStateLinks(states: Array<{ state: string; count: number }>): InternalLink[] {
  try {
    return states.map(s => ({
      href: `/jobs/state/${encodeURIComponent(s.state)}`,
      label: s.state,
      type: 'state' as const,
      count: s.count
    }));
  } catch (error) {
    console.error('Error generating state links:', error);
    return [];
  }
}

// Generate popular search links
export function getPopularSearchLinks(): InternalLink[] {
  const popularSearches = [
    { query: 'UPSC', label: 'UPSC Jobs' },
    { query: 'SSC', label: 'SSC Jobs' },
    { query: 'Railway', label: 'Railway Jobs' },
    { query: 'Police', label: 'Police Jobs' },
    { query: 'Banking', label: 'Banking Jobs' },
    { query: 'Teacher', label: 'Teacher Jobs' },
    { query: 'Clerk', label: 'Clerk Jobs' },
    { query: 'Engineer', label: 'Engineer Jobs' }
  ];
  
  return popularSearches.map(search => ({
    href: `/search?q=${encodeURIComponent(search.query)}`,
    label: search.label,
    type: 'tag' as const
  }));
}

// Generate breadcrumb links
export function generateBreadcrumbLinks(
  category?: string,
  state?: string,
  jobTitle?: string
): Array<{ name: string; url: string }> {
  const breadcrumbs: Array<{ name: string; url: string }> = [
    { name: 'Home', url: '/' }
  ];
  
  try {
    if (category) {
      const categoryLabel = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category;
      const categoryUrl = category === 'job' ? '/jobs' : `/${category}`;
      breadcrumbs.push({ name: categoryLabel, url: categoryUrl });
    }
    
    if (state && state !== 'All India') {
      breadcrumbs.push({ 
        name: state, 
        url: `/jobs/state/${encodeURIComponent(state)}` 
      });
    }
    
    if (jobTitle) {
      // Don't add URL for current page (job title)
      breadcrumbs.push({ name: jobTitle, url: '' });
    }
    
    return breadcrumbs;
  } catch (error) {
    console.error('Error generating breadcrumb links:', error);
    return [{ name: 'Home', url: '/' }];
  }
}

// Generate category navigation links
export function getCategoryNavigationLinks(): InternalLink[] {
  const categories = [
    { key: 'job', href: '/jobs', label: 'Sarkari Naukri' },
    { key: 'admission', href: '/admission', label: 'Admission' },
    { key: 'scholarship', href: '/scholarship', label: 'Scholarship' },
    { key: 'result', href: '/result', label: 'Results' },
    { key: 'admit-card', href: '/admit-card', label: 'Admit Card' },
    { key: 'exam-form', href: '/exam-form', label: 'Exam Form' }
  ];
  
  return categories.map(cat => ({
    href: cat.href,
    label: cat.label,
    type: 'category' as const
  }));
}