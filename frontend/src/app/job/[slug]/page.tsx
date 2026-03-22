import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getJobBySlug, getRelatedJobs } from '@/lib/api';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ShareButtons } from '@/components/ShareButtons';
import { JobCard } from '@/components/JobCard';
import { jobPostingJsonLd, breadcrumbJsonLd, formatDate } from '@/lib/seo';
import { CATEGORY_EMOJI, CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/types';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: 'Job Not Found' };

  return {
    title: job.metaTitle || job.title,
    description: job.metaDescription || job.summary,
    alternates: { canonical: `/job/${slug}` },
    openGraph: {
      title: job.metaTitle || job.title,
      description: job.metaDescription || job.summary,
      type: 'article',
      publishedTime: job.createdAt,
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  const emoji = CATEGORY_EMOJI[job.category] || '📢';
  const colorClass = CATEGORY_COLORS[job.category] || 'bg-stone-100 text-stone-600';
  const categoryLabel = CATEGORY_LABELS[job.category] || job.category;

  const breadcrumbs = [
    { label: categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1), href: job.category === 'job' ? '/jobs' : `/${job.category}` },
    { label: job.title.slice(0, 50) + (job.title.length > 50 ? '...' : '') },
  ];

  return (
    <div className="container-wrap py-8 animate-fade-in">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd(job)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', url: '/' },
              ...breadcrumbs.map((b) => ({ name: b.label, url: b.href || `/job/${slug}` })),
            ])
          ),
        }}
      />

      <Breadcrumb items={breadcrumbs} />

      <article className="max-w-4xl" id="job-detail">
        {/* Header */}
        <header className="mb-8">
          <span className={`badge ${colorClass} mb-3`}>
            {emoji} {categoryLabel}
          </span>
          <h1 className="text-2xl font-black leading-tight text-ink sm:text-3xl">{job.title}</h1>

          {/* Meta row */}
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
          </div>

          {/* Quick Info Cards */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {job.vacancyCount > 0 && (
              <div className="card !p-4 text-center">
                <p className="text-2xl font-black text-accent">{job.vacancyCount.toLocaleString('en-IN')}</p>
                <p className="text-xs font-semibold uppercase text-muted mt-1">Total Vacancies</p>
              </div>
            )}
            {job.lastDate && (
              <div className="card !p-4 text-center">
                <p className="text-lg font-black text-red-600">{formatDate(job.lastDate)}</p>
                <p className="text-xs font-semibold uppercase text-muted mt-1">Last Date</p>
              </div>
            )}
            {job.qualificationLevel && (
              <div className="card !p-4 text-center">
                <p className="text-lg font-black text-ink">{job.qualificationLevel.toUpperCase()}</p>
                <p className="text-xs font-semibold uppercase text-muted mt-1">Min. Qualification</p>
              </div>
            )}
            {job.salary && (
              <div className="card !p-4 text-center">
                <p className="text-lg font-black text-emerald-600">{job.salary}</p>
                <p className="text-xs font-semibold uppercase text-muted mt-1">Salary</p>
              </div>
            )}
          </div>
        </header>

        {/* Summary */}
        <section className="mb-8 rounded-2xl bg-amber-50/60 border border-amber-200/40 p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-2">📝 Summary</h2>
          <p className="text-sm leading-relaxed text-ink">{job.summary}</p>
        </section>

        {/* Content */}
        <section className="mb-8">
          <h2 className="text-lg font-black text-ink mb-3">📄 Full Details</h2>
          <div className="prose-custom rounded-2xl border border-stone-200 bg-white p-6 text-sm leading-relaxed text-ink/90 whitespace-pre-line">
            {job.content}
          </div>
        </section>

        {/* Eligibility */}
        <section className="mb-8">
          <h2 className="text-lg font-black text-ink mb-3">✅ Eligibility</h2>
          <div className="card !p-5 text-sm leading-relaxed text-ink/90 whitespace-pre-line">
            {job.eligibility}
          </div>
        </section>

        {/* Important Dates */}
        <section className="mb-8">
          <h2 className="text-lg font-black text-ink mb-3">📅 Important Dates</h2>
          <div className="card !p-5 text-sm leading-relaxed text-ink/90 whitespace-pre-line">
            {job.importantDates}
          </div>
        </section>

        {/* Apply Link */}
        {job.applyLink && (
          <section className="mb-8">
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
                <span key={tag} className="tag-chip">#{tag}</span>
              ))}
            </div>
          </section>
        )}

        {/* Source */}
        {job.sourceName && (
          <p className="text-xs text-stone-400 mt-8">
            Source: {job.sourceName}
          </p>
        )}
      </article>

      {/* Share Buttons */}
      <div className="max-w-4xl mt-8 p-5 rounded-2xl border border-stone-200 bg-white">
        <ShareButtons title={job.title} slug={slug} category={job.category} />
      </div>

      {/* Related Jobs */}
      <RelatedJobsSection slug={slug} />
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
