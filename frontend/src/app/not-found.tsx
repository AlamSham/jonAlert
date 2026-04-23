import Link from 'next/link';
import { Metadata } from 'next';
import { SearchForm } from '@/components/SearchForm';
import { getLatestJobs } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { JobListItem } from '@/lib/types';

export const metadata: Metadata = {
  title: '404 - Page Not Found — SarkariPulse',
  description: 'Page nahi mila? Koi baat nahi! Search karein ya popular categories browse karein.',
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  let recentJobs: JobListItem[] = [];
  try {
    recentJobs = await getLatestJobs(6);
  } catch (error) {
    // Silently fail - don't break the error page
    console.error('Failed to fetch recent jobs for 404 page:', error);
  }

  return (
    <div className="container-wrap py-16 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-6xl mb-6">🔍</p>
        <h1 className="text-3xl font-black text-ink mb-4">404 - Page Nahi Mila</h1>
        <p className="text-muted max-w-md mx-auto mb-8">
          Jo page aap dhund rahe hain wo exist nahi karta ya hata diya gaya hai. Koi baat nahi! Neeche search karein ya popular categories browse karein.
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-2xl mx-auto mb-12">
        <h2 className="text-lg font-bold text-ink mb-4 text-center">🔍 Kuch Aur Search Karein</h2>
        <SearchForm large={true} />
      </div>

      {/* Popular Categories */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-ink mb-6 text-center">📂 Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Link
            href="/jobs"
            className="card !p-6 text-center hover:bg-stone-50/60 transition group"
          >
            <span className="text-3xl block mb-2">💼</span>
            <h3 className="font-bold text-ink text-sm mb-1 group-hover:text-accent transition">Sarkari Naukri</h3>
            <p className="text-xs text-muted">Latest government jobs</p>
          </Link>
          
          <Link
            href="/result"
            className="card !p-6 text-center hover:bg-stone-50/60 transition group"
          >
            <span className="text-3xl block mb-2">📊</span>
            <h3 className="font-bold text-ink text-sm mb-1 group-hover:text-accent transition">Results</h3>
            <p className="text-xs text-muted">Exam results & merit lists</p>
          </Link>
          
          <Link
            href="/admit-card"
            className="card !p-6 text-center hover:bg-stone-50/60 transition group"
          >
            <span className="text-3xl block mb-2">🎫</span>
            <h3 className="font-bold text-ink text-sm mb-1 group-hover:text-accent transition">Admit Card</h3>
            <p className="text-xs text-muted">Download hall tickets</p>
          </Link>
          
          <Link
            href="/admission"
            className="card !p-6 text-center hover:bg-stone-50/60 transition group"
          >
            <span className="text-3xl block mb-2">🎓</span>
            <h3 className="font-bold text-ink text-sm mb-1 group-hover:text-accent transition">Admission</h3>
            <p className="text-xs text-muted">College & university admissions</p>
          </Link>
          
          <Link
            href="/scholarship"
            className="card !p-6 text-center hover:bg-stone-50/60 transition group"
          >
            <span className="text-3xl block mb-2">💰</span>
            <h3 className="font-bold text-ink text-sm mb-1 group-hover:text-accent transition">Scholarship</h3>
            <p className="text-xs text-muted">Scholarship opportunities</p>
          </Link>
          
          <Link
            href="/exam-form"
            className="card !p-6 text-center hover:bg-stone-50/60 transition group"
          >
            <span className="text-3xl block mb-2">📝</span>
            <h3 className="font-bold text-ink text-sm mb-1 group-hover:text-accent transition">Exam Form</h3>
            <p className="text-xs text-muted">Application forms</p>
          </Link>
        </div>
      </div>

      {/* Recent Jobs */}
      {recentJobs.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg font-bold text-ink mb-6 text-center">📢 Latest Notifications</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {recentJobs.map((job, index) => (
              <JobCard key={job._id} job={job} index={index} />
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-accent-dark"
            >
              View All Jobs →
            </Link>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="text-center">
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl active:scale-95"
          >
            🏠 Home Page
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-stone-300 px-6 py-3 text-sm font-bold text-ink transition hover:bg-stone-50 active:scale-95"
          >
            💼 Browse Jobs
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-stone-300 px-6 py-3 text-sm font-bold text-ink transition hover:bg-stone-50 active:scale-95"
          >
            🔍 Search
          </Link>
        </div>
      </div>
    </div>
  );
}
