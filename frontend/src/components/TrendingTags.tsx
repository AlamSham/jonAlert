import Link from 'next/link';

const POPULAR_SEARCHES = [
  { label: 'SSC CGL', orgSlug: 'ssc' },
  { label: 'UPSC', orgSlug: 'upsc' },
  { label: 'Railway', orgSlug: 'railway' },
  { label: 'Police', orgSlug: 'police' },
  { label: 'Banking', orgSlug: 'banking' },
  { label: 'Army', orgSlug: 'defense' },
  { label: 'Navy', orgSlug: 'defense' },
  { label: 'Teacher', q: 'Teacher' },
  { label: 'UPSSSC', q: 'UPSSSC' },
  { label: 'BPSC', q: 'BPSC' },
  { label: 'NTA', q: 'NTA' },
  { label: 'IBPS', orgSlug: 'banking' },
];

export function TrendingTags() {
  return (
    <section id="trending-tags">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">🔥 Popular Searches</h2>
      <div className="flex flex-wrap gap-2">
        {POPULAR_SEARCHES.map((tag, index) => (
          <Link
            key={index}
            href={tag.orgSlug ? `/jobs/org/${tag.orgSlug}` : `/search?q=${encodeURIComponent(tag.q!)}`}
            className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-muted shadow-sm transition hover:border-accent hover:text-accent hover:shadow-md active:scale-95"
          >
            {tag.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

const QUALIFICATION_LINKS = [
  { label: '10th Pass Jobs', slug: '10th' },
  { label: '12th Pass Jobs', slug: '12th' },
  { label: 'Graduate Jobs', slug: 'graduate' },
  { label: 'Post Graduate Jobs', slug: 'post-graduate' },
  { label: 'ITI Jobs', slug: 'iti' },
  { label: 'Diploma Jobs', slug: 'diploma' },
  { label: 'Engineering Jobs', search: 'Engineering' },
  { label: 'B.Ed Jobs', search: 'B.Ed' },
];

export function QualificationLinks() {
  return (
    <section id="qualification-links">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">🎓 Jobs by Qualification</h2>
      <div className="flex flex-wrap gap-2">
        {QUALIFICATION_LINKS.map((item) => (
          <Link
            key={item.label}
            href={item.slug ? `/jobs/qualification/${item.slug}` : `/search?q=${encodeURIComponent(item.search!)}`}
            className="rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 shadow-sm transition hover:border-purple-400 hover:bg-purple-100 hover:shadow-md active:scale-95"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
