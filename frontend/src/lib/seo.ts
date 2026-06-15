import { JobDetail, CATEGORY_LABELS, SchemeDetail, SCHEME_TYPE_LABELS } from './types';

const SITE_NAME = 'SarkariPulse';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net';
const SITE_LOGO_URL = `${SITE_URL}/logo.jpg`;

type JobAddressDefaults = {
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
};

const LOCATION_DEFAULTS: Record<string, JobAddressDefaults> = {
  chandigarh: { addressLocality: 'Chandigarh', addressRegion: 'Chandigarh', postalCode: '160017' },
  coimbatore: { addressLocality: 'Coimbatore', addressRegion: 'Tamil Nadu', postalCode: '641001' },
  'new delhi': { addressLocality: 'New Delhi', addressRegion: 'Delhi', postalCode: '110001' },
  delhi: { addressLocality: 'Delhi', addressRegion: 'Delhi', postalCode: '110001' },
  jaipur: { addressLocality: 'Jaipur', addressRegion: 'Rajasthan', postalCode: '302005' },
  bhopal: { addressLocality: 'Bhopal', addressRegion: 'Madhya Pradesh', postalCode: '462001' },
  lucknow: { addressLocality: 'Lucknow', addressRegion: 'Uttar Pradesh', postalCode: '226001' },
  patna: { addressLocality: 'Patna', addressRegion: 'Bihar', postalCode: '800001' },
  mumbai: { addressLocality: 'Mumbai', addressRegion: 'Maharashtra', postalCode: '400001' },
  pune: { addressLocality: 'Pune', addressRegion: 'Maharashtra', postalCode: '411001' },
  chennai: { addressLocality: 'Chennai', addressRegion: 'Tamil Nadu', postalCode: '600001' },
  bengaluru: { addressLocality: 'Bengaluru', addressRegion: 'Karnataka', postalCode: '560001' },
  bangalore: { addressLocality: 'Bengaluru', addressRegion: 'Karnataka', postalCode: '560001' },
  hyderabad: { addressLocality: 'Hyderabad', addressRegion: 'Telangana', postalCode: '500001' },
  ahmedabad: { addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', postalCode: '380001' },
  kolkata: { addressLocality: 'Kolkata', addressRegion: 'West Bengal', postalCode: '700001' },
  ranchi: { addressLocality: 'Ranchi', addressRegion: 'Jharkhand', postalCode: '834001' },
  raipur: { addressLocality: 'Raipur', addressRegion: 'Chhattisgarh', postalCode: '492001' },
  dehradun: { addressLocality: 'Dehradun', addressRegion: 'Uttarakhand', postalCode: '248001' },
  guwahati: { addressLocality: 'Guwahati', addressRegion: 'Assam', postalCode: '781001' },
};

const STATE_DEFAULTS: Record<string, JobAddressDefaults> = {
  'Andhra Pradesh': { addressLocality: 'Amaravati', addressRegion: 'Andhra Pradesh', postalCode: '522020' },
  Assam: { addressLocality: 'Guwahati', addressRegion: 'Assam', postalCode: '781001' },
  Bihar: { addressLocality: 'Patna', addressRegion: 'Bihar', postalCode: '800001' },
  Chandigarh: LOCATION_DEFAULTS.chandigarh,
  Chhattisgarh: { addressLocality: 'Raipur', addressRegion: 'Chhattisgarh', postalCode: '492001' },
  Delhi: LOCATION_DEFAULTS.delhi,
  Gujarat: { addressLocality: 'Gandhinagar', addressRegion: 'Gujarat', postalCode: '382010' },
  Haryana: { addressLocality: 'Chandigarh', addressRegion: 'Haryana', postalCode: '160017' },
  'Himachal Pradesh': { addressLocality: 'Shimla', addressRegion: 'Himachal Pradesh', postalCode: '171001' },
  Jharkhand: { addressLocality: 'Ranchi', addressRegion: 'Jharkhand', postalCode: '834001' },
  Karnataka: { addressLocality: 'Bengaluru', addressRegion: 'Karnataka', postalCode: '560001' },
  Kerala: { addressLocality: 'Thiruvananthapuram', addressRegion: 'Kerala', postalCode: '695001' },
  'Madhya Pradesh': LOCATION_DEFAULTS.bhopal,
  Maharashtra: { addressLocality: 'Mumbai', addressRegion: 'Maharashtra', postalCode: '400001' },
  Odisha: { addressLocality: 'Bhubaneswar', addressRegion: 'Odisha', postalCode: '751001' },
  Punjab: { addressLocality: 'Chandigarh', addressRegion: 'Punjab', postalCode: '160017' },
  Rajasthan: LOCATION_DEFAULTS.jaipur,
  'Tamil Nadu': LOCATION_DEFAULTS.chennai,
  Telangana: LOCATION_DEFAULTS.hyderabad,
  'Uttar Pradesh': LOCATION_DEFAULTS.lucknow,
  Uttarakhand: LOCATION_DEFAULTS.dehradun,
  'West Bengal': LOCATION_DEFAULTS.kolkata,
};

export function getCanonicalUrl(path: string) {
  return `${SITE_URL}${path}`;
}

function cleanText(value?: string | null) {
  return value?.replace(/\s+/g, ' ').trim() || '';
}

function toISODate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function parseDateParts(day: string, month: string, year: string): string | undefined {
  const monthMap: Record<string, number> = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, sept: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11,
  };
  const normalizedYear = year.length === 2 ? `20${year}` : year;
  const monthIndex = /^\d+$/.test(month) ? Number(month) - 1 : monthMap[month.toLowerCase()];
  const date = new Date(Date.UTC(Number(normalizedYear), monthIndex, Number(day), 23, 59, 59));
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function extractValidThrough(job: JobDetail): string | undefined {
  const directDate = toISODate(job.lastDate);
  if (directDate) return directDate;

  const text = cleanText([job.importantDates, job.content, job.summary].filter(Boolean).join(' '));
  const datePattern = /(?:last date|closing date|apply by|last date to apply|online last date)[^\d]{0,60}(\d{1,2})[\s./-]+([a-zA-Z]+|\d{1,2})[\s,./-]+(\d{2,4})/i;
  const match = text.match(datePattern);
  return match ? parseDateParts(match[1], match[2], match[3]) : undefined;
}

function extractSalaryValue(job: JobDetail): Record<string, unknown> | undefined {
  const text = cleanText([job.salary, job.content, job.summary].filter(Boolean).join(' '));
  if (!text) return undefined;

  const salaryPatterns = [
    /(?:salary|pay scale|pay|stipend)[^₹\d]{0,50}(?:₹|rs\.?|inr)?\s*([\d,]{4,})(?:\s*(?:-|to|–)\s*(?:₹|rs\.?|inr)?\s*([\d,]{4,}))?/i,
    /(?:₹|rs\.?|inr)\s*([\d,]{4,})(?:\s*(?:-|to|–)\s*(?:₹|rs\.?|inr)?\s*([\d,]{4,}))?/i,
  ];

  for (const pattern of salaryPatterns) {
    const match = text.match(pattern);
    if (!match) continue;

    const firstValue = Number(match[1].replace(/,/g, ''));
    const secondValue = match[2] ? Number(match[2].replace(/,/g, '')) : undefined;
    if (!Number.isFinite(firstValue) || firstValue <= 0) continue;

    if (secondValue && Number.isFinite(secondValue) && secondValue > firstValue) {
      return {
        '@type': 'QuantitativeValue',
        minValue: firstValue,
        maxValue: secondValue,
        unitText: 'MONTH',
      };
    }

    return {
      '@type': 'QuantitativeValue',
      value: firstValue,
      unitText: 'MONTH',
    };
  }

  return undefined;
}

function resolveAddressDefaults(job: JobDetail): JobAddressDefaults | undefined {
  const text = cleanText([job.title, job.organization, job.state, job.content].filter(Boolean).join(' ')).toLowerCase();
  const matchingLocation = Object.keys(LOCATION_DEFAULTS)
    .sort((a, b) => b.length - a.length)
    .find(location => text.includes(location));

  if (matchingLocation) return LOCATION_DEFAULTS[matchingLocation];
  if (job.state && job.state !== 'All India') return STATE_DEFAULTS[job.state] || {
    addressLocality: job.state,
    addressRegion: job.state,
    postalCode: '',
  };

  return undefined;
}

function buildJobAddress(job: JobDetail): Record<string, string> {
  const defaults = resolveAddressDefaults(job);
  const explicitPostalCode = cleanText([job.content, job.summary].join(' ')).match(/\b[1-9][0-9]{5}\b/)?.[0];
  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  };

  if (defaults?.addressRegion) address.addressRegion = defaults.addressRegion;
  if (defaults?.addressLocality) {
    address.addressLocality = defaults.addressLocality;
    address.streetAddress = `${job.organization || 'Government Recruitment Office'}, ${defaults.addressLocality}`;
  }
  if (explicitPostalCode || defaults?.postalCode) {
    address.postalCode = explicitPostalCode || defaults?.postalCode || '';
  }

  return address;
}

function buildJobBaseSalary(job: JobDetail) {
  const value = extractSalaryValue(job);
  if (!value) return undefined;

  return {
    '@type': 'MonetaryAmount',
    currency: 'INR',
    value,
  };
}

function truncateTitle(title: string, maxLength = 68) {
  if (title.length <= maxLength) return title;
  return `${title.slice(0, maxLength - 3).trim()}...`;
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
    logo: SITE_LOGO_URL,
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
  const address = buildJobAddress(job);
  const baseSalary = buildJobBaseSalary(job);
  const validThrough = extractValidThrough(job);

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.content || job.summary || job.title,
    datePosted: job.createdAt,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.organization || 'Government of India',
      sameAs: job.sourceUrl || SITE_URL,
    },
    jobLocation: {
      '@type': 'Place',
      name: address.addressLocality || address.addressRegion || 'India',
      address,
    },
    employmentType: 'FULL_TIME',
  };

  if (validThrough) {
    jsonLd.validThrough = validThrough;
  }

  if (baseSalary) {
    jsonLd.baseSalary = baseSalary;
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
    timeZone: 'UTC',
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

export function generateJobPageTitle(job: JobDetail): string {
  const providedTitle = cleanText(job.metaTitle);
  if (providedTitle && providedTitle.length <= 68) return providedTitle;

  const categoryLabel = CATEGORY_LABELS[job.category] || job.category;
  const title = cleanText(job.title);
  const vacancyText = job.vacancyCount && job.vacancyCount > 0 ? `${job.vacancyCount} Vacancies` : 'Vacancy';
  const currentYear = new Date().getFullYear();

  const suffixByCategory: Record<string, string> = {
    job: job.vacancyCount && job.vacancyCount > 0
      ? `${job.vacancyCount.toLocaleString()} Posts, Apply Online ${currentYear}`
      : `Online Form, Apply Now ${currentYear}`,
    result: `Result OUT, Merit List, Cut Off ${currentYear}`,
    'admit-card': `Admit Card OUT, Download Now ${currentYear}`,
    admission: `Admission Open, Apply Before Last Date ${currentYear}`,
    scholarship: `Apply Online, ₹ Scholarship Amount ${currentYear}`,
    'exam-form': `Form OUT, Registration Open ${currentYear}`,
  };

  const suffix = suffixByCategory[job.category] || `${categoryLabel}, Details`;
  const optimizedTitle = `${title}: ${suffix}`;

  return truncateTitle(optimizedTitle);
}

// Meta Description Generators
export function generateJobMetaDescription(job: JobDetail): string {
  try {
    const categoryLabel = CATEGORY_LABELS[job.category] || job.category;
    const organization = job.organization || 'Government';
    const state = job.state && job.state !== 'All India' ? ` in ${job.state}` : '';
    
    // Hinglish action prompt based on category
    const categoryPrompts: Record<string, string> = {
      job: 'Online application form apply link, eligibility criteria, age limit',
      result: 'Direct result download link, scorecard, cut-off marks, merit list',
      'admit-card': 'Hall ticket download link, exam date and timing, reporting instructions',
      admission: 'Registration form link, eligibility, fee structure, guidelines',
      scholarship: 'Sarkari scholarship yojana registration, eligibility, benefit details',
      'exam-form': 'Online form registration link, fees, payment guidelines',
    };
    const categoryPrompt = categoryPrompts[job.category] || 'Complete notification details, apply link';

    const vacancyText = job.vacancyCount && job.vacancyCount > 0 ? ` ${job.vacancyCount} vacancies.` : '';
    let lastDateText = '';
    if (job.lastDate) {
      const lastDate = new Date(job.lastDate);
      const formattedDate = lastDate.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short' 
      });
      lastDateText = ` Last date to apply: ${formattedDate}.`;
    }

    // Compelling meta description in Hinglish/English mix (highly popular for search intent)
    const orgText = job.organization ? `${job.organization} ` : '';
    let description = `⚡ ${orgText}${job.title}!${vacancyText}${lastDateText} ${categoryPrompt}. Apply karein! 🚀`;

    // Ensure length is between 150-160 characters
    if (description.length > 160) {
      description = description.slice(0, 157) + '...';
    } else if (description.length < 140) {
      description += ' SarkariPulse par latest updates sabse pehle.';
      if (description.length > 160) {
        description = description.slice(0, 160);
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
      job: `Latest Sarkari Job 2026${stateText} - govt jobs, sarkari naukri, vacancy, eligibility, last date aur apply online updates daily check karein.`,
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
      image: SITE_LOGO_URL,
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
          url: SITE_LOGO_URL
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
            '@type': 'WebPage',
            name: item.title,
            url: `${SITE_URL}/job/${item.slug}`,
            datePublished: item.createdAt,
            description: item.summary
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

// =====================================================
// Scheme-specific SEO functions (Hindi/Hinglish)
// =====================================================

export function generateSchemePageTitle(scheme: SchemeDetail): string {
  const providedTitle = cleanText(scheme.metaTitle);
  if (providedTitle && providedTitle.length <= 68) return providedTitle;

  const title = cleanText(scheme.title);
  const currentYear = new Date().getFullYear();
  const typeLabel = scheme.schemeType === 'central' ? 'Kendra Sarkar' : 'Rajya Sarkar';

  const optimizedTitle = `${title} - Paatrata, Labh, Online Aavedan ${currentYear} | ${typeLabel} Yojana`;
  return truncateTitle(optimizedTitle);
}

export function generateSchemeMetaDescription(scheme: SchemeDetail): string {
  try {
    const typeText = scheme.schemeType === 'central' ? 'Kendra Sarkar' : 'Rajya Sarkar';
    const stateText = scheme.state && scheme.state !== 'All India' ? ` ${scheme.state} mein` : '';
    const deptText = scheme.department ? ` ${scheme.department} dwara` : '';

    let description = `⚡ ${scheme.title}${stateText}${deptText} - ${typeText} Yojana. Eligibility, labh, zaroori documents aur online aavedan ki puri jankari. Abhi apply karein! 🚀`;

    if (description.length > 160) {
      description = description.slice(0, 157) + '...';
    } else if (description.length < 140) {
      description += ' SarkariPulse par sarkari yojana ki jankari sabse pehle.';
      if (description.length > 160) {
        description = description.slice(0, 160);
      }
    }

    return description;
  } catch (error) {
    console.error('Scheme meta description generation failed:', error);
    return scheme.metaDescription || scheme.summary.slice(0, 160);
  }
}

export function generateSchemeArticleSchema(scheme: SchemeDetail): object {
  try {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: scheme.title,
      description: scheme.summary,
      image: SITE_LOGO_URL,
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
          url: SITE_LOGO_URL
        }
      },
      datePublished: scheme.createdAt,
      dateModified: scheme.updatedAt || scheme.createdAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/schemes/${scheme.slug}`
      },
      articleSection: 'Sarkari Yojana',
      keywords: scheme.tags?.join(', ') || 'sarkari yojana, government scheme',
      inLanguage: 'hi-IN'
    };
  } catch (error) {
    console.error('Scheme Article schema generation failed:', error);
    return {};
  }
}

export function generateGovernmentServiceSchema(scheme: SchemeDetail): object {
  try {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'GovernmentService',
      name: scheme.title,
      description: scheme.summary,
      url: `${SITE_URL}/schemes/${scheme.slug}`,
      serviceType: scheme.schemeType === 'central' ? 'Central Government Scheme' : 'State Government Scheme',
      provider: {
        '@type': 'GovernmentOrganization',
        name: scheme.department || 'Government of India',
        url: scheme.officialWebsite || SITE_URL
      },
      areaServed: {
        '@type': scheme.state === 'All India' ? 'Country' : 'State',
        name: scheme.state || 'India'
      },
      audience: {
        '@type': 'Audience',
        audienceType: 'Indian Citizens'
      },
      isRelatedTo: {
        '@type': 'WebPage',
        url: `${SITE_URL}/schemes`
      },
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: scheme.applyLink || scheme.officialWebsite || `${SITE_URL}/schemes/${scheme.slug}`,
        serviceType: 'Online Application'
      }
    };

    if (scheme.helplineNumber) {
      schema.servicePhone = scheme.helplineNumber;
    }

    return schema;
  } catch (error) {
    console.error('GovernmentService schema generation failed:', error);
    return {};
  }
}

export function generateSchemeFAQSchema(scheme: SchemeDetail): object | null {
  try {
    const questions: Array<{ '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }> = [];

    if (scheme.eligibility) {
      questions.push({
        '@type': 'Question',
        name: `${scheme.title} ke liye paatrata (eligibility) kya hai?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: scheme.eligibility
        }
      });
    }

    if (scheme.benefits) {
      questions.push({
        '@type': 'Question',
        name: `${scheme.title} ke kya labh (benefits) hain?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: scheme.benefits
        }
      });
    }

    if (scheme.applicationProcess) {
      questions.push({
        '@type': 'Question',
        name: `${scheme.title} ke liye kaise aavedan karein?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: scheme.applicationProcess
        }
      });
    }

    if (scheme.applyLink) {
      questions.push({
        '@type': 'Question',
        name: `${scheme.title} ka online apply link kya hai?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Official website par jaayiye: ${scheme.applyLink}. Wahan application form bhariye, zaroori documents upload kariye aur submit kariye. Yeh bilkul free hai.`
        }
      });
    }

    if (scheme.helplineNumber) {
      questions.push({
        '@type': 'Question',
        name: `${scheme.title} ka helpline number kya hai?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Helpline Number: ${scheme.helplineNumber}. Aap is number par call karke yojana ki puri jankari le sakte hain aur apni samasya ka samadhan pa sakte hain.`
        }
      });
    }

    questions.push({
      '@type': 'Question',
      name: `Kya ${scheme.title} ke liye apply karna free hai?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Haan, sarkari yojana mein apply karna bilkul free hai. Koi bhi application fee nahi lagti. Agar koi agent paisa maange to fraud hai. Direct official website se apply karein.'
      }
    });

    if (questions.length < 2) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions
    };
  } catch (error) {
    console.error('Scheme FAQ schema generation failed:', error);
    return null;
  }
}

