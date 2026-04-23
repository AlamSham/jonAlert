import { JobDetail, CATEGORY_LABELS } from './types';

const SITE_NAME = 'SarkariPulse';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net';

export function getCanonicalUrl(path: string) {
  return `${SITE_URL}${path}`;
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Latest Sarkari Naukri, Exam Results, Admit Cards — AI-powered updates in Hinglish',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512x512.png`,
    description: 'AI-powered sarkari job notification portal — latest govt jobs, results, admit cards, admissions, scholarships in India.',
    sameAs: [
      // Add social media links when available
      // 'https://twitter.com/sarkaripulse',
      // 'https://facebook.com/sarkaripulse',
      // 'https://instagram.com/sarkaripulse'
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        url: `${SITE_URL}/contact`,
        availableLanguage: ['Hindi', 'English']
      }
    ],
    foundingDate: '2024',
    areaServed: {
      '@type': 'Country',
      name: 'India'
    },
    serviceType: 'Government Job Information Service',
    knowsAbout: [
      'Government Jobs',
      'Sarkari Naukri',
      'Exam Results',
      'Admit Cards',
      'College Admissions',
      'Scholarships'
    ]
  };
}

export function jobPostingJsonLd(job: JobDetail) {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.content,
    datePosted: job.createdAt,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.organization || 'Government of India',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
        addressRegion: job.state !== 'All India' ? job.state : undefined,
      },
    },
    employmentType: 'FULL_TIME',
  };

  if (job.lastDate) {
    jsonLd.validThrough = job.lastDate;
  }

  if (job.salary) {
    jsonLd.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: { '@type': 'QuantitativeValue', value: job.salary },
    };
  }

  // Enhanced fields
  if (job.qualificationLevel) {
    jsonLd.qualifications = job.qualificationLevel;
  }

  if (job.vacancyCount && job.vacancyCount > 0) {
    jsonLd.totalJobOpenings = job.vacancyCount;
  }

  if (job.applyLink) {
    jsonLd.directApply = true;
    jsonLd.applicationContact = {
      '@type': 'ContactPoint',
      url: job.applyLink
    };
  }

  // Add job benefits if available
  if (job.category === 'job') {
    jsonLd.jobBenefits = 'Government job benefits including pension, medical allowance, and job security';
  }

  return jsonLd;
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function categoryMeta(category: string) {
  const label = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category;
  return {
    title: `${label} — Latest Updates | ${SITE_NAME}`,
    description: `Latest ${label.toLowerCase()} updates, notifications aur alerts ${SITE_NAME} par. Jaldi check karein aur koi update miss mat karein!`,
  };
}

// Meta Description Generators
export function generateJobMetaDescription(job: JobDetail): string {
  try {
    const categoryLabel = CATEGORY_LABELS[job.category] || job.category;
    const organization = job.organization || 'Government';
    const state = job.state && job.state !== 'All India' ? ` in ${job.state}` : '';
    
    // Build base description
    let description = `${job.title} - ${categoryLabel} notification by ${organization}${state}.`;
    
    // Add vacancy count if available
    if (job.vacancyCount && job.vacancyCount > 0) {
      description += ` ${job.vacancyCount} vacancies.`;
    }
    
    // Add last date if available
    if (job.lastDate) {
      const lastDate = new Date(job.lastDate);
      const formattedDate = lastDate.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short' 
      });
      description += ` Last date: ${formattedDate}.`;
    }
    
    // Add CTA in Hinglish
    const ctas = [
      'Jaldi apply karein!',
      'Details check karein!',
      'Apply karne se pehle eligibility check karein!',
      'Official notification padhiye!'
    ];
    const cta = ctas[Math.floor(Math.random() * ctas.length)];
    description += ` ${cta}`;
    
    // Ensure length is between 150-160 characters
    if (description.length > 160) {
      // Truncate and add ellipsis
      description = description.slice(0, 157) + '...';
    } else if (description.length < 150) {
      // Add more context if too short
      const additionalInfo = job.qualificationLevel ? ` ${job.qualificationLevel} eligible.` : ' Check eligibility.';
      if (description.length + additionalInfo.length <= 160) {
        description += additionalInfo;
      }
    }
    
    return description;
  } catch (error) {
    console.error('Meta description generation failed:', error);
    // Fallback to existing metaDescription or summary
    return job.metaDescription || job.summary.slice(0, 160);
  }
}

export function generateCategoryMetaDescription(category: string, state?: string): string {
  try {
    const categoryLabel = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category;
    const stateText = state && state !== 'All India' ? ` in ${state}` : '';
    
    const descriptions: Record<string, string> = {
      job: `Latest Sarkari Naukri${stateText} - Government job notifications, bharti updates, aur vacancy details. UPSC, SSC, Railway jobs check karein!`,
      result: `Latest Sarkari Result${stateText} - Exam results, scorecard download, merit list aur cut-off marks. Apna result check karein!`,
      'admit-card': `Latest Admit Card${stateText} - Hall ticket download, exam center details aur important instructions. Print karke exam mein le jaayein!`,
      admission: `Latest College Admission${stateText} - University admission notifications, application forms aur last dates. Apply karne se pehle check karein!`,
      scholarship: `Latest Scholarship${stateText} - Government scholarship schemes, eligibility criteria aur application process. Students apply karein!`,
      'exam-form': `Latest Exam Form${stateText} - Online application forms, registration links aur important dates. Form bharne se pehle padhiye!`
    };
    
    return descriptions[category] || `Latest ${categoryLabel}${stateText} updates on SarkariPulse. Check notifications aur apply karein!`;
  } catch (error) {
    console.error('Category meta description generation failed:', error);
    return `Latest ${category} updates on SarkariPulse. Check notifications aur apply karein!`;
  }
}

// Structured Data Generators
export function generateFAQSchema(job: JobDetail): object | null {
  try {
    const questions: Array<{ '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }> = [];
    
    // Question 1: Eligibility
    if (job.eligibility) {
      questions.push({
        '@type': 'Question',
        name: `${job.title} ke liye eligibility criteria kya hai?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: job.eligibility
        }
      });
    }
    
    // Question 2: Last Date
    if (job.lastDate || job.importantDates) {
      const lastDateText = job.lastDate 
        ? `Last date to apply: ${new Date(job.lastDate).toLocaleDateString('en-IN')}`
        : job.importantDates;
      
      questions.push({
        '@type': 'Question',
        name: `${job.title} ki last date kya hai?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: lastDateText
        }
      });
    }
    
    // Question 3: Application Process
    if (job.applyLink) {
      questions.push({
        '@type': 'Question',
        name: `${job.title} ke liye kaise apply karein?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Official website par jaayiye: ${job.applyLink}. Online application form bhariye, zaroori documents upload kariye, aur fee payment (agar applicable hai) kariye. Application submit karne ke baad receipt save kar liye.`
        }
      });
    }
    
    // Question 4: Qualification
    if (job.qualificationLevel) {
      questions.push({
        '@type': 'Question',
        name: `${job.title} ke liye minimum qualification kya hai?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Minimum qualification: ${job.qualificationLevel}. Complete eligibility criteria ke liye official notification check kariye.`
        }
      });
    }
    
    // Question 5: Salary (conditional)
    if (job.salary) {
      questions.push({
        '@type': 'Question',
        name: `${job.title} ki salary kitni hai?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Salary: ${job.salary}. Complete pay scale aur allowances ke liye official notification dekhiye.`
        }
      });
    }
    
    // Question 6: Vacancy Count (conditional)
    if (job.vacancyCount && job.vacancyCount > 0) {
      questions.push({
        '@type': 'Question',
        name: `${job.title} mein kitni vacancies hain?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Total vacancies: ${job.vacancyCount}. Category-wise breakdown ke liye official notification check kariye.`
        }
      });
    }
    
    // Return null if fewer than 2 questions
    if (questions.length < 2) {
      return null;
    }
    
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions
    };
  } catch (error) {
    console.error('FAQ schema generation failed:', error);
    return null;
  }
}

export function generateArticleSchema(job: JobDetail): object {
  try {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: job.title,
      description: job.summary,
      image: `${SITE_URL}/icon-512x512.png`, // Default image, can be enhanced later
      author: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/icon-512x512.png`
        }
      },
      datePublished: job.createdAt,
      dateModified: job.createdAt, // Can be enhanced with actual modification date
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/job/${job.slug}`
      },
      articleSection: CATEGORY_LABELS[job.category] || job.category,
      keywords: job.tags.join(', '),
      inLanguage: 'hi-IN'
    };
  } catch (error) {
    console.error('Article schema generation failed:', error);
    return {};
  }
}

export function generateCollectionPageSchema(
  category: string, 
  items: any[], 
  totalCount: number
): object {
  try {
    const categoryLabel = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${categoryLabel} - SarkariPulse`,
      description: `Latest ${categoryLabel.toLowerCase()} notifications and updates`,
      url: `${SITE_URL}/${category === 'job' ? 'jobs' : category}`,
      numberOfItems: totalCount,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: items.length,
        itemListElement: items.slice(0, 10).map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'JobPosting',
            name: item.title,
            url: `${SITE_URL}/job/${item.slug}`,
            datePosted: item.createdAt,
            hiringOrganization: {
              '@type': 'Organization',
              name: item.organization || 'Government of India'
            }
          }
        }))
      }
    };
  } catch (error) {
    console.error('CollectionPage schema generation failed:', error);
    return {};
  }
}

export function generateLocalBusinessSchema(state: string): object {
  try {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: `SarkariPulse - ${state}`,
      description: `Government job notifications and updates for ${state}`,
      url: `${SITE_URL}/jobs/state/${encodeURIComponent(state)}`,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
        addressRegion: state
      },
      areaServed: {
        '@type': 'State',
        name: state
      },
      serviceType: 'Government Job Information Service',
      priceRange: 'Free'
    };
  } catch (error) {
    console.error('LocalBusiness schema generation failed:', error);
    return {};
  }
}
