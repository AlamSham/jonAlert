import Link from 'next/link';

const POPULAR_SEARCHES = [
  { label: 'SSC CGL', q: 'SSC CGL' },
  { label: 'UPSC', q: 'UPSC' },
  { label: 'Railway', q: 'Railway' },
  { label: 'Police', q: 'Police' },
  { label: 'Banking', q: 'Banking' },
  { label: 'Army', q: 'Army' },
  { label: 'Navy', q: 'Navy' },
  { label: 'Teacher', q: 'Teacher' },
  { label: 'UPSSSC', q: 'UPSSSC' },
  { label: 'BPSC', q: 'BPSC' },
  { label: 'NTA', q: 'NTA' },
  { label: 'IBPS', q: 'IBPS' },
];

export function TrendingTags() {
  return (
    <section id="trending-tags">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">🔥 Popular Searches</h2>
      <div className="flex flex-wrap gap-2">
        {POPULAR_SEARCHES.map((tag) => (
          <Link
            key={tag.q}
            href={`/search?q=${encodeURIComponent(tag.q)}`}
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
  { label: '10th Pass Jobs', q: '10th pass' },
  { label: '12th Pass Jobs', q: '12th pass' },
  { label: 'Graduate Jobs', q: 'Graduate' },
  { label: 'Post Graduate Jobs', q: 'Post Graduate' },
  { label: 'ITI Jobs', q: 'ITI' },
  { label: 'Diploma Jobs', q: 'Diploma' },
  { label: 'Engineering Jobs', q: 'Engineering' },
  { label: 'B.Ed Jobs', q: 'B.Ed' },
];

export function QualificationLinks() {
  return (
    <section id="qualification-links">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">🎓 Jobs by Qualification</h2>
      <div className="flex flex-wrap gap-2">
        {QUALIFICATION_LINKS.map((item) => (
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
  );
}
