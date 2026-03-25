import Link from 'next/link';
import { getLatestJobs, getTrendingJobs, getStats } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { StatsBanner } from '@/components/StatsBanner';
import { SectionHeader } from '@/components/SectionHeader';
import { SearchForm } from '@/components/SearchForm';
import { SubscribeCTA } from '@/components/SubscribeCTA';
import { CATEGORY_EMOJI } from '@/lib/types';

export const revalidate = 60;

export default async function HomePage() {
  const [latestJobs, trendingJobs, stats] = await Promise.all([
    getLatestJobs(12),
    getTrendingJobs(6),
    getStats(),
  ]);

  const categories = [
    { key: 'job', label: 'Sarkari Naukri', emoji: '💼', href: '/jobs', desc: 'Latest govt job notifications' },
    { key: 'admission', label: 'Admission', emoji: '🎓', href: '/admission', desc: 'College admission updates' },
    { key: 'scholarship', label: 'Scholarship', emoji: '💰', href: '/scholarship', desc: 'Sarkari scholarship schemes' },
    { key: 'result', label: 'Results', emoji: '📊', href: '/result', desc: 'Exam results & scorecards' },
    { key: 'admit-card', label: 'Admit Card', emoji: '🎫', href: '/admit-card', desc: 'Download admit cards' },
    { key: 'exam-form', label: 'Exam Form', emoji: '📝', href: '/exam-form', desc: 'Application forms & registration' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero-gradient py-12 sm:py-16" id="hero">
        <div className="container-wrap text-center">
          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Sarkari Naukri Ka <span className="gradient-text">Pulse</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted sm:text-base leading-relaxed">
            UPSC, SSC, Railway, Police, Banking — jobs, admission, scholarship, results aur admit cards ek jagah.
            <br className="hidden sm:block" />
            AI-powered updates har 10 minute. Koi update miss nahi hoga! 🚀
          </p>
          <div className="mt-6 sm:mt-8">
            <SearchForm large />
          </div>
        </div>
      </section>

      <div className="container-wrap py-8 space-y-12">
        {/* Stats */}
        <section id="stats">
          <StatsBanner stats={stats} />
        </section>

        {/* Category Cards */}
        <section id="categories">
          <SectionHeader title="Browse by Category" icon="📂" />
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.key}
                href={cat.href}
                className="card flex items-center gap-4 !p-5 group"
                id={`cat-${cat.key}`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-2xl transition group-hover:scale-110">
                  {cat.emoji}
                </span>
                <div>
                  <h3 className="font-bold text-ink group-hover:text-accent transition">
                    {cat.label}
                    {stats.categories[cat.key] != null && (
                      <span className="ml-2 text-xs font-normal text-muted">
                        ({stats.categories[cat.key]})
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Top States */}
        {stats.topStates.length > 0 && (
          <section id="top-states">
            <SectionHeader title="Jobs by State" subtitle="State-wise sarkari naukri" icon="📍" />
            <div className="flex flex-wrap gap-2">
              {stats.topStates.map((s) => (
                <Link
                  key={s.state}
                  href={`/jobs/state/${encodeURIComponent(s.state)}`}
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-muted shadow-sm transition hover:border-accent hover:text-accent hover:shadow-md"
                >
                  {s.state} <span className="ml-1 text-xs text-stone-400">({s.count})</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trending Jobs */}
        {trendingJobs.length > 0 && (
          <section id="trending">
            <SectionHeader title="Trending Jobs" subtitle="Most viewed notifications" icon="🔥" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trendingJobs.map((job, i) => (
                <JobCard key={job.slug} job={job} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Subscribe CTA */}
        <SubscribeCTA />

        {/* Latest Jobs */}
        <section id="latest">
          <div className="flex items-center justify-between mb-6">
            <SectionHeader title="Latest Notifications" subtitle="Real-time updates" icon="⚡" />
            <Link
              href="/jobs"
              className="text-sm font-bold text-accent hover:text-accent-dark transition hidden sm:block"
            >
              View All →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestJobs.map((job, i) => (
              <JobCard key={job.slug} job={job} index={i} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/jobs"
              className="inline-block rounded-2xl bg-accent px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-accent-dark hover:shadow-md"
            >
              View All Jobs →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
