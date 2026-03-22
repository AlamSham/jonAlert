import { JobDetail, CATEGORY_LABELS } from './types';

const SITE_NAME = 'SarkariPulse';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.com';

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
