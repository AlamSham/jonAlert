import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getJobBySlug, getRelatedJobs } from '@/lib/api';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ShareButtons } from '@/components/ShareButtons';
import { JobCard } from '@/components/JobCard';
import { ReadingTime } from '@/components/ReadingTime';
import { TableOfContents } from '@/components/TableOfContents';
import { FAQ } from '@/components/FAQ';
import { HowToApply } from '@/components/HowToApply';
import { ApplicationTips } from '@/components/ApplicationTips';
import { JobDetailAnalytics } from '@/components/JobDetailAnalytics';
import { SafeHtml } from '@/components/SafeHtml';
import { jobPostingJsonLd, breadcrumbJsonLd, formatDate, generateJobMetaDescription, generateJobPageTitle, generateFAQSchema, generateArticleSchema, getCanonicalUrl } from '@/lib/seo';
import { generateJobContextualLinks, generateBreadcrumbLinks } from '@/lib/internal-links';
import { CATEGORY_EMOJI, CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/types';
import { guides } from '@/lib/guides';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const { getLatestJobs } = await import('@/lib/api');
    const latestJobs = await getLatestJobs(50);
    return latestJobs.map((job) => ({
      slug: job.slug,
    }));
  } catch (error) {
    console.error('Failed to generate static params for jobs:', error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const job = await getJobBySlug(slug);
    if (!job) return {
      title: 'Job Not Found — SarkariPulse',
      description: 'Ye job notification ab available nahi hai. Latest sarkari naukri updates dekhein.',
      robots: { index: false, follow: true },
    };

    // Use enhanced meta description generator
    const pageTitle = generateJobPageTitle(job);
    const metaDescription = generateJobMetaDescription(job);
    const jobUrl = getCanonicalUrl(`/job/${slug}`);
    const ogImageUrl = getCanonicalUrl(
      `/api/og?title=${encodeURIComponent(job.title || 'Job')}&org=${encodeURIComponent(job.organization || 'Latest Sarkari Naukri Updates')}`
    );

    // Keep ALL jobs indexed — expired jobs still get traffic for results, cutoffs, previous papers
    // Only noindex if job content is completely empty/invalid
    const shouldIndex = true;

    return {
      title: pageTitle,
      description: metaDescription,
      alternates: { canonical: jobUrl },
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
      openGraph: {
        title: pageTitle,
        description: metaDescription,
        url: jobUrl,
        type: 'article',
        publishedTime: job.createdAt,
        locale: 'hi_IN',
        siteName: 'SarkariPulse',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: job.title || 'Job Posting',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: metaDescription.slice(0, 100),
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error('Error generating metadata for job:', error);
    return {
      title: 'Job Details',
      description: 'View job details and application information',
    };
  }
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  
  // If job not found (deleted from DB), redirect to jobs listing instead of 404
  // This prevents 404 errors in Google Search Console for expired/deleted jobs
  if (!job) redirect('/jobs');

  const emoji = CATEGORY_EMOJI[job.category] || '📢';
  const colorClass = CATEGORY_COLORS[job.category] || 'bg-stone-100 text-stone-600';
  const categoryLabel = CATEGORY_LABELS[job.category] || job.category;

  // Helper: detect placeholder/generic content that should be hidden
  const isPlaceholderContent = (content: string | undefined | null): boolean => {
    if (!content || content.trim().length === 0) return true;
    const stripped = content.replace(/<[^>]*>/g, '').trim().toLowerCase();
    const placeholders = [
      'official notification check karein',
      'detailed notification dekhein',
      'check official notification',
      'notification dekhein',
    ];
    // If the entire text content (minus HTML) matches only placeholder phrases
    return placeholders.some(p => stripped === p) || 
           stripped.split(/\s+/).length < 5 && placeholders.some(p => stripped.includes(p));
  };

  const hasRealEligibility = !!job.eligibility && !isPlaceholderContent(job.eligibility);
  const hasRealDates = !!job.importantDates && !isPlaceholderContent(job.importantDates);

  // Generate contextual links and breadcrumbs
  const contextualLinks = generateJobContextualLinks(job);
  const breadcrumbItems = generateBreadcrumbLinks(job.category, job.state, job.title);
  
  const breadcrumbs = [
    { label: categoryLabel ? categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1) : 'Jobs', href: job.category === 'job' ? '/jobs' : `/${job.category}` },
    { label: job.title ? job.title.slice(0, 50) + (job.title.length > 50 ? '...' : '') : 'Job Details' },
  ];

  // Generate FAQ items for the job
  const faqItems = [
    hasRealEligibility && {
      question: `${job.title} ke liye eligibility criteria kya hai?`,
      answer: job.eligibility
    },
    (job.lastDate || hasRealDates) && {
      question: `${job.title} ki last date kya hai?`,
      answer: job.lastDate 
        ? `Last date to apply: ${formatDate(job.lastDate)}`
        : job.importantDates
    },
    job.applyLink && {
      question: `${job.title} ke liye kaise apply karein?`,
      answer: `Official website par jaayiye: ${job.applyLink}. Online application form bhariye, zaroori documents upload kariye, aur fee payment (agar applicable hai) kariye. Application submit karne ke baad receipt save kar liye.`
    },
    job.qualificationLevel && {
      question: `${job.title} ke liye minimum qualification kya hai?`,
      answer: `Minimum qualification: ${job.qualificationLevel}. Complete eligibility criteria ke liye official notification check kariye.`
    },
    job.salary && {
      question: `${job.title} ki salary kitni hai?`,
      answer: `Salary: ${job.salary}. Complete pay scale aur allowances ke liye official notification dekhiye.`
    },
    job.vacancyCount && job.vacancyCount > 0 && {
      question: `${job.title} mein kitni vacancies hain?`,
      answer: `Total vacancies: ${job.vacancyCount}. Category-wise breakdown ke liye official notification check kariye.`
    }
  ].filter(Boolean) as Array<{ question: string; answer: string }>;

  // Find matching guides for this job
  const getMatchedGuides = () => {
    const titleLower = (job.title || '').toLowerCase();
    const matches = [];

    // Match 1: SSC CGL
    if (titleLower.includes('ssc') || titleLower.includes('cgl')) {
      const g = guides.find(x => x.slug === 'ssc-cgl-preparation-guide');
      if (g) matches.push(g);
    }
    // Match 2: UPSC
    if (titleLower.includes('upsc') || titleLower.includes('civil service') || titleLower.includes('ias') || titleLower.includes('ips')) {
      const g = guides.find(x => x.slug === 'upsc-exam-pattern-guide');
      if (g) matches.push(g);
    }
    // Match 3: Railway
    if (titleLower.includes('railway') || titleLower.includes('rrb') || titleLower.includes('rrc') || titleLower.includes('group d') || titleLower.includes('ntpc')) {
      const g = guides.find(x => x.slug === 'railway-group-d-syllabus-guide');
      if (g) matches.push(g);
    }
    // Match 4: 10th pass
    if (job.qualificationLevel?.toLowerCase().includes('10th') || titleLower.includes('mts') || titleLower.includes('gds') || titleLower.includes('post office') || titleLower.includes('dak sevak')) {
      const g = guides.find(x => x.slug === '10th-pass-sarkari-jobs-guide');
      if (g) matches.push(g);
    }
    // Match 5: Police
    if (titleLower.includes('police') || titleLower.includes('constable') || titleLower.includes('sub inspector') || titleLower.includes('daroga') || titleLower.includes('physical')) {
      const g = guides.find(x => x.slug === 'police-bharti-physical-tips-guide');
      if (g) matches.push(g);
    }

    // Always append document verification checklist as a universal guide if we don't have enough matches
    if (matches.length < 2) {
      const dvGuide = guides.find(x => x.slug === 'sarkari-job-document-verification-guide');
      if (dvGuide && !matches.includes(dvGuide)) matches.push(dvGuide);
    }

    return matches.slice(0, 3);
  };

  const matchedGuides = getMatchedGuides();

  // Build TOC items based on available data
  const tocItems = [
    { id: 'section-summary', label: 'Summary', emoji: '📝' },
    job.content && { id: 'section-details', label: 'Full Details', emoji: '📄' },
    hasRealEligibility && { id: 'section-eligibility', label: 'Eligibility', emoji: '✅' },
    hasRealDates && { id: 'section-dates', label: 'Important Dates', emoji: '📅' },
    job.applyLink && { id: 'section-how-to-apply', label: 'How to Apply', emoji: '🚀' },
    { id: 'section-prep', label: 'Preparation Guides', emoji: '📚' },
    { id: 'section-tips', label: 'Application Tips', emoji: '💡' },
    faqItems.length > 0 && { id: 'section-faq', label: 'FAQ', emoji: '❓' },
    job.applyLink && { id: 'section-apply', label: 'Apply Now', emoji: '🔗' },
    { id: 'section-share', label: 'Share', emoji: '📤' },
    { id: 'section-related', label: 'Similar Updates', emoji: '📌' },
  ].filter(Boolean) as { id: string; label: string; emoji: string }[];

  // Build full content string for reading time (with null safety)
  const fullContent = [job.summary, job.content, job.eligibility, job.importantDates]
    .filter(item => item != null && item !== '')
    .join(' ');

  return (
    <div className="container-wrap py-8 animate-fade-in">
      {/* Analytics Component */}
      <JobDetailAnalytics 
        jobSlug={slug}
        jobTitle={job.title}
        organization={job.organization}
        category={job.category}
      />
      
      {/* JSON-LD */}
      {job.category === 'job' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd(job)) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateArticleSchema(job)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd(breadcrumbItems.map(item => ({ name: item.name, url: item.url })))
          ),
        }}
      />
      {/* Enhanced FAQ JSON-LD */}
      {(() => {
        const faqSchema = generateFAQSchema(job);
        return faqSchema ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        ) : null;
      })()}

      <Breadcrumb items={breadcrumbs} />

      {/* Desktop layout: Content + Sidebar TOC */}
      <div className="flex gap-8 items-start mobile-job-layout">
        <article className="max-w-4xl flex-1 mobile-responsive-content" id="job-detail">
          {/* Header */}
          <header className="mb-8">
            <span className={`badge ${colorClass} mb-3`}>
              {emoji} {categoryLabel}
            </span>
            <h1 className="text-2xl font-black leading-tight text-ink sm:text-3xl">{job.title}</h1>

            {/* Meta row with Reading Time */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
              {job.organization && (
                <span className="flex items-center gap-1.5">🏛️ {job.organization}</span>
              )}
              {job.state && (
                <Link
                  href={`/jobs/state/${encodeURIComponent(job.state)}`}
                  className="flex items-center gap-1.5 hover:text-accent transition"
                >
                  📍 {job.state}
                </Link>
              )}
              <span className="flex items-center gap-1.5">🕐 {formatDate(job.createdAt)}</span>
              {job.viewCount != null && job.viewCount > 0 && (
                <span className="flex items-center gap-1.5">👁️ {job.viewCount.toLocaleString('en-IN')} views</span>
              )}
              <ReadingTime content={fullContent} />
            </div>

            {/* Quick Info Cards */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mobile-quick-info-grid">
              {job.vacancyCount > 0 && (
                <div className="card !p-4 text-center mobile-info-card">
                  <p className="text-2xl font-black text-accent">{job.vacancyCount.toLocaleString('en-IN')}</p>
                  <p className="text-xs font-semibold uppercase text-muted mt-1">Total Vacancies</p>
                </div>
              )}
              {job.lastDate && (
                <div className="card !p-4 text-center mobile-info-card">
                  <p className="text-lg font-black text-red-600">{formatDate(job.lastDate)}</p>
                  <p className="text-xs font-semibold uppercase text-muted mt-1">Last Date</p>
                </div>
              )}
              {job.qualificationLevel && (
                <div className="card !p-4 text-center mobile-info-card">
                  <p className="text-lg font-black text-ink">{job.qualificationLevel.toUpperCase()}</p>
                  <p className="text-xs font-semibold uppercase text-muted mt-1">Min. Qualification</p>
                </div>
              )}
              {job.salary && (
                <div className="card !p-4 text-center mobile-info-card">
                  <p className="text-lg font-black text-emerald-600">{job.salary}</p>
                  <p className="text-xs font-semibold uppercase text-muted mt-1">Salary</p>
                </div>
              )}
            </div>
          </header>

          {/* Mobile TOC */}
          <TableOfContents items={tocItems} variant="mobile" />

          {/* Summary */}
          <section className="mb-8 rounded-2xl bg-amber-50/60 border border-amber-200/40 p-5 mobile-content-section" id="section-summary">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-2">📝 Summary</h2>
            <p className="text-sm leading-relaxed text-ink mobile-text-content">{job.summary}</p>
          </section>

          {/* Content */}
          {job.content && (
            <section className="mb-8 mobile-content-section" id="section-details">
              <h2 className="text-lg font-black text-ink mb-3">📄 Full Details</h2>
              <div className="rounded-2xl border border-stone-200 bg-white p-6 mobile-text-content overflow-hidden">
                <SafeHtml content={job.content} />
              </div>
            </section>
          )}

          {/* Eligibility */}
          {hasRealEligibility && (
            <section className="mb-8 mobile-content-section" id="section-eligibility">
              <h2 className="text-lg font-black text-ink mb-3">✅ Eligibility</h2>
              <div className="card !p-5 mobile-text-content overflow-hidden">
                <SafeHtml content={job.eligibility} />
              </div>
            </section>
          )}

          {/* Important Dates */}
          {hasRealDates && (
            <section className="mb-8 mobile-content-section" id="section-dates">
              <h2 className="text-lg font-black text-ink mb-3">📅 Important Dates</h2>
              <div className="card !p-5 mobile-text-content overflow-hidden">
                <SafeHtml content={job.importantDates} />
              </div>
            </section>
          )}

          {/* How to Apply Section */}
          {job.applyLink && (
            <section className="mb-8" id="section-how-to-apply">
              <HowToApply applyLink={job.applyLink} title={job.title} />
            </section>
          )}

          {/* Preparation Guides Section */}
          <section className="mb-8 card !p-5 mobile-content-section" id="section-prep">
            <h2 className="text-lg font-black text-ink mb-2 flex items-center gap-2">
              📚 Exam Preparation & Study Guides
            </h2>
            <p className="text-xs text-muted mb-4">
              Is pariksha/bharti ki aur behtar taiyari ke liye niche diye gaye guidelines aur articles ko zaroor padhein:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {matchedGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="flex gap-3 items-start p-3 rounded-xl border border-stone-100 bg-stone-50 hover:bg-white hover:border-accent/30 hover:shadow-sm transition group"
                >
                  <span className="text-2xl mt-0.5 group-hover:scale-110 transition duration-200">{g.icon}</span>
                  <div>
                    <h3 className="text-xs font-bold text-ink leading-snug group-hover:text-accent transition">
                      {g.title}
                    </h3>
                    <p className="text-[10px] text-muted mt-1 uppercase font-semibold">
                      {g.category}
                    </p>
                  </div>
                </Link>
              ))}
              <Link
                href="/how-to-apply"
                className="flex gap-3 items-start p-3 rounded-xl border border-stone-100 bg-stone-50 hover:bg-white hover:border-accent/30 hover:shadow-sm transition group"
              >
                <span className="text-2xl mt-0.5 group-hover:scale-110 transition duration-200">🚀</span>
                <div>
                  <h3 className="text-xs font-bold text-ink leading-snug group-hover:text-accent transition">
                    Sarkari Naukri Online Form Kaise Bharein: Step-by-Step
                  </h3>
                  <p className="text-[10px] text-muted mt-1 uppercase font-semibold">
                    Apply Guide
                  </p>
                </div>
              </Link>
            </div>
          </section>

          {/* Application Tips */}
          <section className="mb-8" id="section-tips">
            <ApplicationTips />
          </section>

          {/* FAQ Section */}
          {faqItems.length > 0 && (
            <section className="mb-8" id="section-faq">
              <FAQ items={faqItems} title="Frequently Asked Questions" includeJsonLd={false} />
            </section>
          )}

          {/* Apply Link */}
          {job.applyLink && (
            <section className="mb-8" id="section-apply">
              <a
                href={job.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:shadow-xl active:scale-95"
                id="apply-btn"
              >
                🔗 Apply Now / Official Link
              </a>
            </section>
          )}

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">🏷️ Tags</h2>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="tag-chip hover:bg-accent/15 hover:text-accent transition">
                    #{tag}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Internal Links: Enhanced with contextual links */}
          <section className="mb-8 rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">🔗 Explore More</h2>
            <div className="flex flex-wrap gap-2">
              {job.qualificationLevel && (
                <Link
                  href={`/jobs/qualification/${job.qualificationLevel}`}
                  className="rounded-full border border-purple-300/50 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 hover:border-purple-400 transition"
                >
                  {job.qualificationLevel.toUpperCase()} Pass Jobs →
                </Link>
              )}
              {contextualLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    link.type === 'category' 
                      ? 'border-accent/30 bg-accent/5 text-accent hover:bg-accent/10 hover:border-accent'
                      : link.type === 'state'
                      ? 'border-emerald-300/50 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400'
                      : 'border-stone-200 bg-white text-muted hover:border-accent hover:text-accent'
                  }`}
                >
                  {link.label} →
                </Link>
              ))}
              <Link
                href="/"
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
              >
                🏠 Homepage
              </Link>
              <Link
                href="/search"
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
              >
                🔍 Search Jobs
              </Link>
            </div>
          </section>

          {/* Source */}
          {job.sourceName && (
            <p className="text-xs text-stone-400 mt-8">
              Source: {job.sourceName}
            </p>
          )}
        </article>

        {/* Desktop Sidebar TOC */}
        <TableOfContents items={tocItems} variant="desktop" />
      </div>

      {/* Share Buttons */}
      <div className="max-w-4xl mt-8 p-5 rounded-2xl border border-stone-200 bg-white" id="section-share">
        <ShareButtons title={job.title} slug={slug} category={job.category} />
      </div>

      {/* Related Jobs */}
      <div id="section-related">
        <RelatedJobsSection slug={slug} />
      </div>

      {/* Sticky Mobile WhatsApp Share */}
      <div className="fixed bottom-4 right-4 md:hidden z-40">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`📢 ${job.title}\n👉 https://sarkaripulse.net/job/${slug}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-xl transition hover:bg-green-600 active:scale-90"
          aria-label="Share on WhatsApp"
          id="sticky-whatsapp"
        >
          💬
        </a>
      </div>
    </div>
  );
}

async function RelatedJobsSection({ slug }: { slug: string }) {
  const related = await getRelatedJobs(slug);
  if (!related || related.length === 0) return null;

  return (
    <section className="max-w-4xl mt-10">
      <h2 className="text-lg font-black text-ink mb-4">📌 Similar Updates</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((job, i) => (
          <JobCard key={job.slug} job={job} index={i} />
        ))}
      </div>
    </section>
  );
}
