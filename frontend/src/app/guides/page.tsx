import { Metadata } from 'next';
import Link from 'next/link';
import { guides } from '@/lib/guides';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Sarkari Exam Preparation Guides & Syllabus | SarkariPulse',
  description: 'UPSC, SSC, Railway aur anya sarkari parikshao ki taiyari ke liye useful study guides, exam syllabus, physical tests, aur preparation tips.',
  alternates: { canonical: '/guides' },
};

export default function GuidesPage() {
  const breadcrumbs = [
    { label: 'Exam Guides', href: '/guides' }
  ];

  return (
    <div className="container-wrap py-12 animate-fade-in max-w-6xl">
      <Breadcrumb items={breadcrumbs} />

      <header className="mb-10 text-center sm:text-left mt-4">
        <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">
          📚 Sarkari Exam Preparation Guides & Syllabus
        </h1>
        <p className="mt-3 text-muted max-w-2xl text-sm leading-relaxed">
          Government jobs ki taiyari ko aasan banayein! Yahan aapko sabhi competitive exams ke detailed syllabus, physical test rules, study tips, aur document verification checklists milenge.
        </p>
      </header>

      {/* Grid listing guides */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <article 
            key={guide.slug} 
            className="group flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-3xl">{guide.icon}</span>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-muted uppercase">
                  {guide.category}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-black leading-snug text-ink group-hover:text-accent transition duration-200">
                <Link href={`/guides/${guide.slug}`}>
                  {guide.title}
                </Link>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-3">
                {guide.description}
              </p>
            </div>
            
            <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4 text-xs font-medium text-muted">
              <span>🕐 {guide.readTime}</span>
              <Link 
                href={`/guides/${guide.slug}`} 
                className="inline-flex items-center gap-1 font-bold text-accent group-hover:underline"
              >
                Read Guide →
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Related Pages Section */}
      <div className="mt-16 rounded-2xl border border-stone-200 bg-stone-50/50 p-6 sm:p-8 text-center sm:text-left">
        <h2 className="text-lg font-bold text-ink">💡 Looking for specific job opportunities?</h2>
        <p className="mt-2 text-sm text-muted max-w-xl">
          Check out our latest job alerts, exam result updates, and online application links, updated in real-time.
        </p>
        <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-accent-dark"
          >
            🏠 Home Page
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-stone-300 bg-white px-6 py-3 text-sm font-bold text-ink transition hover:bg-stone-50"
          >
            💼 Browse All Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
