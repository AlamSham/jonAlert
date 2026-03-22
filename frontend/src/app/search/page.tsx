import { Metadata } from 'next';
import { searchJobs } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SearchForm } from '@/components/SearchForm';

export const revalidate = 0; // Dynamic — no cache for search

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q || '';
  return {
    title: q ? `Search: "${q}" — SarkariPulse` : 'Search Sarkari Naukri',
    description: q
      ? `Search results for "${q}" — sarkari jobs, results, admit cards on SarkariPulse.`
      : 'Search sarkari naukri, exam results, aur admit cards. Type keywords to find relevant notifications.',
    robots: { index: false }, // Don't index search pages
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q || '';
  const jobs = q ? await searchJobs(q) : [];

  return (
    <div className="container-wrap py-8 animate-fade-in">
      <Breadcrumb items={[{ label: 'Search' }]} />

      <div className="max-w-3xl">
        <h1 className="text-2xl font-black text-ink mb-2">🔍 Search Jobs</h1>
        <p className="text-sm text-muted mb-6">UPSC, SSC, Railway, Police — jo chahiye search karein!</p>
        <SearchForm initialQuery={q} large />
      </div>

      {q && (
        <div className="mt-8">
          <p className="text-sm text-muted mb-4">
            <span className="font-bold text-ink">{jobs.length}</span> results for <span className="font-bold text-accent">&quot;{q}&quot;</span>
          </p>

          {jobs.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job, i) => (
                <JobCard key={job.slug} job={job} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-4 font-bold text-muted">Koi results nahi mile &quot;{q}&quot; ke liye</p>
              <p className="mt-1 text-sm text-stone-400">Try different keywords jaise &quot;SSC&quot;, &quot;Railway&quot;, &quot;Police&quot;</p>
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
    </div>
  );
}
