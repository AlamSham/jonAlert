'use client';

import Link from 'next/link';
import { SchemeListItem, SCHEME_TYPE_EMOJI, SCHEME_TYPE_COLORS, SCHEME_TYPE_LABELS } from '@/lib/types';
import { formatDate } from '@/lib/seo';
import { trackInternalLinkClick } from '@/lib/analytics';

export function SchemeCard({ scheme, index = 0 }: { scheme: SchemeListItem; index?: number }) {
  const emoji = SCHEME_TYPE_EMOJI[scheme.schemeType] || '🏛️';
  const colorClass = SCHEME_TYPE_COLORS[scheme.schemeType] || 'bg-stone-100 text-stone-600';

  const handleSchemeTitleClick = () => {
    trackInternalLinkClick('scheme_title', `/schemes/${scheme.slug}`, scheme.title);
  };

  const handleStateClick = () => {
    if (scheme.state && scheme.state !== 'All India') {
      trackInternalLinkClick('state', `/schemes/state/${encodeURIComponent(scheme.state)}`, scheme.state);
    }
  };

  const handleTagClick = (tag: string) => {
    trackInternalLinkClick('tag', `/search?q=${encodeURIComponent(tag)}`, tag);
  };

  const handleReadMoreClick = () => {
    trackInternalLinkClick('read_more', `/schemes/${scheme.slug}`, 'View Details');
  };

  return (
    <article
      className="card group animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
      id={`scheme-card-${scheme.slug}`}
    >
      {/* Thumbnail or Placeholder */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center text-3xl">
          {scheme.thumbnailUrl ? (
            <img 
              src={scheme.thumbnailUrl} 
              alt={scheme.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span>{emoji}</span>
          )}
        </div>
        
        <div className="flex-1">
          {/* Scheme Type Badge */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className={`badge ${colorClass}`}>
              <span>{emoji}</span>
              {SCHEME_TYPE_LABELS[scheme.schemeType]}
            </span>
            <span className="badge bg-emerald-100 text-emerald-700">
              🆓 Free Apply
            </span>
          </div>
          
          {/* Time */}
          <time
            className="block text-[11px] text-stone-400 font-medium"
            dateTime={scheme.createdAt}
            suppressHydrationWarning
          >
            {formatDate(scheme.createdAt)}
          </time>
        </div>
      </div>

      {/* Title */}
      <h3 className="line-clamp-2 text-[15px] font-extrabold leading-snug text-ink group-hover:text-accent transition-colors mb-2">
        <Link 
          href={`/schemes/${scheme.slug}`} 
          className="hover:underline underline-offset-2"
          onClick={handleSchemeTitleClick}
        >
          {scheme.title}
        </Link>
      </h3>

      {/* Summary */}
      <p className="line-clamp-3 text-[13px] text-muted leading-relaxed mb-3">
        {scheme.summary}
      </p>

      {/* Meta — Department + State */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted mb-3">
        {scheme.department && (
          <span className="flex items-center gap-1">
            <span className="text-stone-400">🏛️</span>
            <span className="line-clamp-1">{scheme.department}</span>
          </span>
        )}
        {scheme.state && (
          <span className="flex items-center gap-1">
            <span className="text-stone-400">📍</span>
            {scheme.state === 'All India' ? (
              <span>{scheme.state}</span>
            ) : (
              <Link 
                href={`/schemes/state/${encodeURIComponent(scheme.state)}`} 
                className="hover:text-accent transition"
                onClick={handleStateClick}
              >
                {scheme.state}
              </Link>
            )}
          </span>
        )}
        {scheme.viewCount > 0 && (
          <span className="flex items-center gap-1">
            <span className="text-stone-400">👁️</span>
            {scheme.viewCount.toLocaleString('en-IN')}
          </span>
        )}
      </div>

      {/* Tags — Clickable */}
      {scheme.tags && scheme.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {scheme.tags.slice(0, 3).map((tag) => (
            <Link 
              key={tag} 
              href={`/search?q=${encodeURIComponent(tag)}`} 
              className="tag-chip hover:bg-accent/15 hover:text-accent transition"
              onClick={() => handleTagClick(tag)}
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* View Details */}
      <div className="pt-3 border-t border-stone-100">
        <Link
          href={`/schemes/${scheme.slug}`}
          className="text-xs font-bold text-accent hover:text-accent-dark transition inline-flex items-center gap-1"
          onClick={handleReadMoreClick}
        >
          Puri Jankari Dekhein
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </article>
  );
}
