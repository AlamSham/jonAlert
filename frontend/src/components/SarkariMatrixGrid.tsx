import Link from 'next/link';
import { JobListItem, SchemeListItem } from '@/lib/types';

interface SarkariMatrixGridProps {
  topHighlights: JobListItem[];
  results: JobListItem[];
  admitCards: JobListItem[];
  latestJobs: JobListItem[];
  admissions?: JobListItem[];
  schemes?: SchemeListItem[];
}

// Curated colorful gradients for the top highlight cards (similar to SarkariResult's top colored boxes)
const HIGHLIGHT_BG_STYLES = [
  'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-700 shadow-red-200',
  'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-blue-700 shadow-blue-200',
  'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-700 shadow-emerald-200',
  'bg-gradient-to-r from-amber-600 to-orange-700 text-white border-amber-700 shadow-amber-200',
  'bg-gradient-to-r from-purple-600 to-indigo-800 text-white border-purple-700 shadow-purple-200',
  'bg-gradient-to-r from-rose-600 to-pink-700 text-white border-rose-700 shadow-rose-200',
  'bg-gradient-to-r from-cyan-600 to-blue-700 text-white border-cyan-700 shadow-cyan-200',
  'bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white border-fuchsia-700 shadow-fuchsia-200',
];

export function SarkariMatrixGrid({
  topHighlights: _topHighlights,
  results,
  admitCards,
  latestJobs,
  admissions = [],
  schemes = [],
}: SarkariMatrixGridProps) {
  return (
    <section id="sarkari-matrix" className="space-y-8 my-6">

      {/* ========================================================================= */}
      {/* 2. 3-COLUMN CLASSIC SARKARI MATRIX (Results | Admit Cards | Latest Jobs) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-ink flex items-center gap-2">
            🏛️ Sarkari Information Matrix 2026
          </h2>
          <span className="text-xs text-muted font-medium">Real-Time Direct Links</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* ------------------------------------------------------------- */}
          {/* COLUMN 1: RESULTS */}
          {/* ------------------------------------------------------------- */}
          <div className="rounded-2xl border-2 border-red-600/30 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="bg-gradient-to-r from-red-700 to-rose-700 text-white px-4 py-3 font-black text-base sm:text-lg flex items-center justify-between shadow-sm">
                <span className="flex items-center gap-2">
                  <span>📊</span> Results
                </span>
                <span className="text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>

              {/* Items List */}
              <ul className="divide-y divide-stone-100 text-xs sm:text-sm">
                {results.slice(0, 10).map((job, idx) => (
                  <li key={job.slug || idx} className="hover:bg-red-50/50 transition">
                    <Link
                      href={`/job/${job.slug}`}
                      className="p-3 flex items-start gap-2.5 text-ink hover:text-red-700 group leading-snug font-medium"
                    >
                      <span className="text-red-500 font-bold text-xs mt-0.5">●</span>
                      <span className="flex-1 group-hover:underline">
                        {job.title}
                        <span className="ml-1 text-[11px] font-semibold text-red-600 bg-red-100 px-1.5 py-0.2 rounded shrink-0">
                          Result OUT
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}

                {results.length === 0 && (
                  <li className="p-4 text-center text-xs text-muted">Loading latest results...</li>
                )}
              </ul>
            </div>

            {/* Bottom View All Link */}
            <div className="p-3 bg-red-50 border-t border-red-100 text-center">
              <Link
                href="/result"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 hover:text-red-900 transition hover:underline"
              >
                View All Results ({results.length > 0 ? '100+' : ''}) →
              </Link>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COLUMN 2: ADMIT CARDS */}
          {/* ------------------------------------------------------------- */}
          <div className="rounded-2xl border-2 border-blue-600/30 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-4 py-3 font-black text-base sm:text-lg flex items-center justify-between shadow-sm">
                <span className="flex items-center gap-2">
                  <span>🎫</span> Admit Card
                </span>
                <span className="text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full">
                  Hall Ticket
                </span>
              </div>

              {/* Items List */}
              <ul className="divide-y divide-stone-100 text-xs sm:text-sm">
                {admitCards.slice(0, 10).map((job, idx) => (
                  <li key={job.slug || idx} className="hover:bg-blue-50/50 transition">
                    <Link
                      href={`/job/${job.slug}`}
                      className="p-3 flex items-start gap-2.5 text-ink hover:text-blue-700 group leading-snug font-medium"
                    >
                      <span className="text-blue-500 font-bold text-xs mt-0.5">●</span>
                      <span className="flex-1 group-hover:underline">
                        {job.title}
                        <span className="ml-1 text-[11px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.2 rounded shrink-0">
                          Download
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}

                {admitCards.length === 0 && (
                  <li className="p-4 text-center text-xs text-muted">Loading latest admit cards...</li>
                )}
              </ul>
            </div>

            {/* Bottom View All Link */}
            <div className="p-3 bg-blue-50 border-t border-blue-100 text-center">
              <Link
                href="/admit-card"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition hover:underline"
              >
                View All Admit Cards →
              </Link>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COLUMN 3: LATEST JOBS */}
          {/* ------------------------------------------------------------- */}
          <div className="rounded-2xl border-2 border-emerald-600/30 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white px-4 py-3 font-black text-base sm:text-lg flex items-center justify-between shadow-sm">
                <span className="flex items-center gap-2">
                  <span>💼</span> Latest Jobs
                </span>
                <span className="text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full">
                  Apply Online
                </span>
              </div>

              {/* Items List */}
              <ul className="divide-y divide-stone-100 text-xs sm:text-sm">
                {latestJobs.slice(0, 10).map((job, idx) => (
                  <li key={job.slug || idx} className="hover:bg-emerald-50/50 transition">
                    <Link
                      href={`/job/${job.slug}`}
                      className="p-3 flex items-start gap-2.5 text-ink hover:text-emerald-700 group leading-snug font-medium"
                    >
                      <span className="text-emerald-500 font-bold text-xs mt-0.5">●</span>
                      <span className="flex-1 group-hover:underline">
                        {job.title}
                        {job.vacancyCount ? (
                          <span className="ml-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded shrink-0">
                            {job.vacancyCount.toLocaleString()} Posts
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                ))}

                {latestJobs.length === 0 && (
                  <li className="p-4 text-center text-xs text-muted">Loading latest jobs...</li>
                )}
              </ul>
            </div>

            {/* Bottom View All Link */}
            <div className="p-3 bg-emerald-50 border-t border-emerald-100 text-center">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition hover:underline"
              >
                View All Latest Jobs →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SECOND ROW MATRIX (Admissions | Answer Key / Exam Forms | Sarkari Yojana) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
        {/* Answer Key / Exam Forms */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-stone-800 text-white px-4 py-3 font-bold text-sm flex items-center justify-between">
              <span>📝 Answer Key & Exam Forms</span>
              <Link href="/exam-form" className="text-xs text-amber-300 hover:underline">
                View All
              </Link>
            </div>
            <ul className="divide-y divide-stone-100 text-xs">
              {admissions.slice(0, 5).map((job, idx) => (
                <li key={job.slug || idx} className="hover:bg-stone-50 transition">
                  <Link href={`/job/${job.slug}`} className="p-3 flex items-start gap-2 text-ink hover:text-accent font-medium leading-snug">
                    <span className="text-accent font-bold">•</span>
                    <span className="flex-1 line-clamp-2">{job.title}</span>
                  </Link>
                </li>
              ))}
              {admissions.length === 0 && (
                <li className="p-3.5 text-stone-400 text-xs">Regular updates available</li>
              )}
            </ul>
          </div>
        </div>

        {/* College Admissions */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-stone-800 text-white px-4 py-3 font-bold text-sm flex items-center justify-between">
              <span>🎓 College Admissions 2026</span>
              <Link href="/admission" className="text-xs text-amber-300 hover:underline">
                View All
              </Link>
            </div>
            <ul className="divide-y divide-stone-100 text-xs">
              {admissions.slice(5, 10).map((job, idx) => (
                <li key={job.slug || idx} className="hover:bg-stone-50 transition">
                  <Link href={`/job/${job.slug}`} className="p-3 flex items-start gap-2 text-ink hover:text-accent font-medium leading-snug">
                    <span className="text-accent font-bold">•</span>
                    <span className="flex-1 line-clamp-2">{job.title}</span>
                  </Link>
                </li>
              ))}
              {admissions.length < 6 && (
                <li className="p-3.5 text-stone-400 text-xs">Latest Admission forms update daily</li>
              )}
            </ul>
          </div>
        </div>

        {/* Sarkari Yojana */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-stone-800 text-white px-4 py-3 font-bold text-sm flex items-center justify-between">
              <span>🏛️ Sarkari Yojana (सरकारी योजना)</span>
              <Link href="/schemes" className="text-xs text-amber-300 hover:underline">
                View All
              </Link>
            </div>
            <ul className="divide-y divide-stone-100 text-xs">
              {schemes.slice(0, 5).map((scheme, idx) => (
                <li key={scheme.slug || idx} className="hover:bg-stone-50 transition">
                  <Link href={`/schemes/${scheme.slug}`} className="p-3 flex items-start gap-2 text-ink hover:text-accent font-medium leading-snug">
                    <span className="text-accent font-bold">•</span>
                    <span className="flex-1 line-clamp-2">{scheme.title}</span>
                  </Link>
                </li>
              ))}
              {schemes.length === 0 && (
                <li className="p-3.5 text-stone-400 text-xs">PM Kisan, Ayushman Bharat updates</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
