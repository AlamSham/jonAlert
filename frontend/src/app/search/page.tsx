import { Metadata } from 'next';
import Link from 'next/link';
import { searchJobs } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SearchForm } from '@/components/SearchForm';
import { breadcrumbJsonLd } from '@/lib/seo';

export const revalidate = 300; // Cache for 5 minutes — search results change but not every second

type Props = { searchParams: Promise<{ q?: string }> };

// Popular searches for internal linking (also used in sitemap)
const POPULAR_SEARCHES = [
  'SSC CGL', 'UPSC', 'Railway', 'Police', 'Banking', 'Army', 'Navy',
  'Teacher', 'UPSSSC', 'BPSC', 'NTA', 'IBPS', 'CTET', 'RRB',
];

const QUALIFICATION_SEARCHES = [
  { label: '10th Pass Jobs', q: '10th pass' },
  { label: '12th Pass Jobs', q: '12th pass' },
  { label: 'Graduate Jobs', q: 'Graduate' },
  { label: 'Post Graduate', q: 'Post Graduate' },
  { label: 'ITI Jobs', q: 'ITI' },
  { label: 'Diploma Jobs', q: 'Diploma' },
  { label: 'Engineering Jobs', q: 'Engineering' },
  { label: 'B.Ed Jobs', q: 'B.Ed' },
];

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net';

  // Index search pages WITH a query, noindex empty search page
  const shouldIndex = q.trim().length > 0;

  const title = q
    ? `${q} Jobs 2026 - Latest Sarkari Naukri, Result, Admit Card | SarkariPulse`
    : 'Search Sarkari Naukri 2026 - Government Jobs, Results, Admit Cards';

  const description = q
    ? `${q} se related latest sarkari naukri 2026, exam results, admit cards aur notifications. ${q} jobs ke liye eligibility, last date, salary aur apply online links. SarkariPulse par daily updates.`
    : 'Search sarkari naukri, government jobs, exam results, admit cards aur scholarships. UPSC, SSC, Railway, Police — sab ek jagah. Type keywords to find relevant notifications.';

  const canonicalUrl = q
    ? `${siteUrl}/search?q=${encodeURIComponent(q)}`
    : `${siteUrl}/search`;

  return {
    title,
    description,
    keywords: q
      ? [
          q, `${q} jobs`, `${q} sarkari naukri`, `${q} result`, `${q} admit card`,
          `${q} vacancy 2026`, `${q} notification`, `${q} bharti`,
          'sarkari naukri', 'government jobs', 'sarkari result',
        ]
      : [
          'search sarkari naukri', 'government jobs search', 'sarkari job search',
          'sarkari result', 'admit card search', 'exam form search',
        ],
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: q ? `${q} - Sarkari Naukri & Results 2026` : 'Search Sarkari Jobs',
      description,
      url: canonicalUrl,
      type: 'website',
      locale: 'hi_IN',
      siteName: 'SarkariPulse',
      images: [
        {
          url: `${siteUrl}/logo.jpg`,
          width: 1024,
          height: 1024,
          alt: q ? `${q} - SarkariPulse Search Results` : 'SarkariPulse Search',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: q ? `${q} - Latest Sarkari Naukri 2026` : 'Search Sarkari Jobs',
      description: description.slice(0, 150),
      images: [`${siteUrl}/logo.jpg`],
    },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q || '';
  const jobs = q ? await searchJobs(q) : [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net';

  // Breadcrumb structured data
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Search', url: '/search' },
    ...(q ? [{ name: q, url: `/search?q=${encodeURIComponent(q)}` }] : []),
  ]);

  // SearchResultsPage structured data for pages with query
  const searchResultsSchema = q
    ? {
        '@context': 'https://schema.org',
        '@type': 'SearchResultsPage',
        name: `${q} - Search Results`,
        description: `Search results for "${q}" on SarkariPulse — sarkari jobs, results, admit cards.`,
        url: `${siteUrl}/search?q=${encodeURIComponent(q)}`,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: jobs.length,
          itemListElement: jobs.slice(0, 10).map((job, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteUrl}/job/${job.slug}`,
            name: job.title,
          })),
        },
      }
    : null;

  return (
    <div className="container-wrap py-8 animate-fade-in">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {searchResultsSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(searchResultsSchema) }}
        />
      )}

      <Breadcrumb items={[
        { label: 'Search', href: '/search' },
        ...(q ? [{ label: q }] : []),
      ]} />

      <div className="max-w-3xl">
        <h1 className="text-2xl font-black text-ink mb-2">
          {q ? `🔍 ${q} — Sarkari Jobs & Results` : '🔍 Search Sarkari Naukri'}
        </h1>
        <p className="text-sm text-muted mb-6">
          {q
            ? `${q} se related ${jobs.length} sarkari naukri, results, admit cards aur notifications.`
            : 'UPSC, SSC, Railway, Police — jo chahiye search karein!'}
        </p>
        <SearchForm initialQuery={q} large />
      </div>

      {q && (
        <div className="mt-8">
          <p className="text-sm text-muted mb-4">
            <span className="font-bold text-ink">{jobs.length}</span> results for{' '}
            <span className="font-bold text-accent">&quot;{q}&quot;</span>
          </p>

          {jobs.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job, i) => (
                <JobCard key={job.slug} job={job} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-4 font-bold text-muted">
                Koi results nahi mile &quot;{q}&quot; ke liye
              </p>
              <p className="mt-1 text-sm text-stone-400">
                Try different keywords jaise &quot;SSC&quot;, &quot;Railway&quot;, &quot;Police&quot;
              </p>
            </div>
          )}
        </div>
      )}

      {!q && (
        <div className="mt-16 text-center">
          <p className="text-5xl">🔍</p>
          <p className="mt-4 font-bold text-muted">Search box mein type karein</p>
          <p className="mt-1 text-sm text-stone-400">
            Example: &quot;UPSC&quot;, &quot;Railway NTPC&quot;, &quot;Bihar Police&quot;, &quot;SSC GD&quot;
          </p>
        </div>
      )}

      {/* Popular Searches — Internal Linking for SEO */}
      <section className="mt-12" id="popular-searches">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">
          🔥 Popular Searches
        </h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.filter((tag) => tag.toLowerCase() !== q.toLowerCase()).map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-muted shadow-sm transition hover:border-accent hover:text-accent hover:shadow-md active:scale-95"
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>

      {/* Qualification Links — Internal Linking */}
      <section className="mt-8" id="qualification-searches">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">
          🎓 Jobs by Qualification
        </h2>
        <div className="flex flex-wrap gap-2">
          {QUALIFICATION_SEARCHES.filter((item) => item.q.toLowerCase() !== q.toLowerCase()).map((item) => (
            <Link
              key={item.q}
              href={`/search?q=${encodeURIComponent(item.q)}`}
              className="rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 shadow-sm transition hover:border-purple-400 hover:bg-purple-100 hover:shadow-md active:scale-95"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by Category — Internal Linking */}
      <section className="mt-8" id="browse-categories">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">
          📂 Browse by Category
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '💼 All Jobs', href: '/jobs' },
            { label: '🎓 Admission', href: '/admission' },
            { label: '💰 Scholarship', href: '/scholarship' },
            { label: '📊 Results', href: '/result' },
            { label: '🎫 Admit Card', href: '/admit-card' },
            { label: '📝 Exam Form', href: '/exam-form' },
            { label: '🏛️ Schemes', href: '/schemes' },
          ].map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-100 hover:shadow-md active:scale-95"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* SEO Content Section — Only shown when query is present */}
      {q && jobs.length > 0 && (
        <section className="mt-12 card" id="search-info">
          <h2 className="text-lg font-bold text-ink mb-3">
            {q} — Latest Sarkari Naukri 2026
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            SarkariPulse par &quot;{q}&quot; se related {jobs.length} sarkari naukri aur notifications available hain.
            Har job notification mein complete details, eligibility criteria, last date, salary details aur
            direct apply links diye gaye hain. AI-powered system har 10 minute mein latest updates check karta hai.
            Koi bhi notification miss nahi hoga!
          </p>
        </section>
      )}
    </div>
  );
}
