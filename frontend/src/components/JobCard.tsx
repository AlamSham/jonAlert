import Link from 'next/link';
import { JobListItem, CATEGORY_EMOJI, CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/types';
import { timeAgo, formatDate } from '@/lib/seo';

function getLastDateStatus(lastDate?: string) {
  if (!lastDate) return null;
  const now = new Date();
  const ld = new Date(lastDate);
  const daysLeft = Math.ceil((ld.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { label: '❌ Expired', class: 'bg-stone-100 text-stone-500' };
  if (daysLeft <= 3) return { label: `⏰ ${daysLeft}d left!`, class: 'bg-red-100 text-red-700 animate-pulse' };
  if (daysLeft <= 7) return { label: `⏰ ${daysLeft}d left`, class: 'bg-orange-100 text-orange-700' };
  return null;
}

export function JobCard({ job, index = 0 }: { job: JobListItem; index?: number }) {
  const emoji = CATEGORY_EMOJI[job.category] || '📢';
  const colorClass = CATEGORY_COLORS[job.category] || 'bg-stone-100 text-stone-600';

  return (
    <article
      className="card group animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
      id={`job-card-${job.slug}`}
    >
      {/* Category + Time */}
      <div className="flex items-center justify-between mb-3">
        <span className={`badge ${colorClass}`}>
          <span>{emoji}</span>
          {CATEGORY_LABELS[job.category] || job.category}
        </span>
        <time className="text-[11px] text-stone-400 font-medium">{timeAgo(job.createdAt)}</time>
      </div>

      {/* Title */}
      <h3 className="line-clamp-2 text-[15px] font-extrabold leading-snug text-ink group-hover:text-accent transition-colors">
        <Link href={`/job/${job.slug}`} className="hover:underline underline-offset-2">
          {job.title}
        </Link>
      </h3>

      {/* Meta — Org + State */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
        {job.organization && (
          <span className="flex items-center gap-1">
            <span className="text-stone-400">🏛️</span>
            {job.organization}
          </span>
        )}
        {job.state && (
          <span className="flex items-center gap-1">
            <span className="text-stone-400">📍</span>
            <Link href={`/jobs/state/${encodeURIComponent(job.state)}`} className="hover:text-accent transition">
              {job.state}
            </Link>
          </span>
        )}
      </div>

      {/* Summary */}
      <p className="mt-2.5 line-clamp-2 text-[13px] text-muted leading-relaxed">{job.summary}</p>

      {/* Bottom — Vacancy + LastDate + Tags */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {job.vacancyCount > 0 && (
          <span className="badge bg-amber-50 text-amber-700">
            👥 {job.vacancyCount.toLocaleString('en-IN')} Vacancies
          </span>
        )}
        {job.lastDate && (
          <span className="badge bg-red-50 text-red-600">
            📅 {formatDate(job.lastDate)}
          </span>
        )}
        {(() => {
          const status = getLastDateStatus(job.lastDate);
          return status ? <span className={`badge ${status.class}`}>{status.label}</span> : null;
        })()}
      </div>

      {/* Tags — Clickable */}
      {job.tags && job.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.tags.slice(0, 3).map((tag) => (
            <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="tag-chip hover:bg-accent/15 hover:text-accent transition">
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Read More */}
      <div className="mt-4 pt-3 border-t border-stone-100">
        <Link
          href={`/job/${job.slug}`}
          className="text-xs font-bold text-accent hover:text-accent-dark transition inline-flex items-center gap-1"
        >
          Read Full Details
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </article>
  );
}
