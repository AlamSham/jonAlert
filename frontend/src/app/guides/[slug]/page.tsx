import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guides, getGuideBySlug } from '@/lib/guides';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SafeHtml } from '@/components/SafeHtml';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  
  if (!guide) {
    return {
      title: 'Guide Not Found',
    };
  }

  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: `/guides/${slug}` },
  };
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const otherGuides = guides.filter((g) => g.slug !== slug).slice(0, 5);

  const breadcrumbs = [
    { label: 'Exam Guides', href: '/guides' },
    { label: guide.title.slice(0, 30) + '...' },
  ];

  return (
    <div className="container-wrap py-8 animate-fade-in">
      <Breadcrumb items={breadcrumbs} />

      <div className="mt-4 flex flex-col gap-8 lg:flex-row items-start">
        {/* Main Content */}
        <article className="w-full lg:w-2/3 xl:w-3/4 rounded-2xl border border-stone-200 bg-white p-6 md:p-8 shadow-sm">
          <header className="mb-6 border-b border-stone-100 pb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{guide.icon}</span>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent uppercase tracking-wider">
                {guide.category}
              </span>
            </div>
            
            <h1 className="mt-4 text-2xl font-black leading-tight text-ink md:text-3xl lg:text-4xl">
              {guide.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted">
              <span>📅 Updated: {guide.date}</span>
              <span>🕐 Read Time: {guide.readTime}</span>
            </div>
          </header>

          {/* Guide HTML Content */}
          <div className="guide-content-wrapper mb-8">
            <SafeHtml content={guide.content} />
          </div>

          {/* Inline Sharing Info */}
          <div className="border-t border-stone-100 pt-6 mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-black text-ink uppercase tracking-wider">Share This Guide</p>
              <p className="text-xs text-muted">Apne doston ki help karein, study groups mein share karein.</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`📚 ${guide.title}\n👉 Read full guide here: https://sarkaripulse.net/guides/${guide.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-green-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-green-600 active:scale-95"
              >
                💬 WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(`https://sarkaripulse.net/guides/${guide.slug}`)}&text=${encodeURIComponent(`📚 ${guide.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-600 active:scale-95"
              >
                ✈️ Telegram
              </a>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6 sticky top-6">
          {/* Other Guides Section */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-ink mb-4">
              📖 Other Study Guides
            </h2>
            <div className="flex flex-col gap-4">
              {otherGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="group flex gap-3 items-start p-2 rounded-lg hover:bg-stone-50 transition"
                >
                  <span className="text-2xl mt-0.5 group-hover:scale-110 transition duration-200">
                    {g.icon}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-ink leading-snug group-hover:text-accent transition">
                      {g.title}
                    </h3>
                    <p className="text-[10px] text-muted mt-1 uppercase font-semibold">
                      {g.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-stone-100 text-center">
              <Link
                href="/guides"
                className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
              >
                All Guides Dekhein →
              </Link>
            </div>
          </div>

          {/* Quick Channels CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 p-5 shadow-sm text-center">
            <span className="text-3xl">🚀</span>
            <h2 className="text-sm font-black text-ink mt-2">Instant Job Updates!</h2>
            <p className="text-xs text-muted mt-2 leading-relaxed">
              UPSC, SSC, Railway, aur State Police bharti ke fast notifications seedhe apne phone par receive karein.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href="https://whatsapp.com/channel/0029VaDUx1m1yT2D0Q7g7Q1h" 
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-green-500 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-green-600 transition"
              >
                💬 Join WhatsApp Channel
              </a>
              <a
                href="https://t.me/sarkaripulse" 
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-blue-500 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-600 transition"
              >
                ✈️ Join Telegram Group
              </a>
            </div>
          </div>

          {/* Browse Categories */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-ink mb-4">
              💼 Job Categories
            </h2>
            <div className="flex flex-col gap-2">
              <Link
                href="/jobs"
                className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-100 transition text-xs font-bold text-ink"
              >
                <span>💼 Latest Jobs</span>
                <span className="text-muted">→</span>
              </Link>
              <Link
                href="/result"
                className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-100 transition text-xs font-bold text-ink"
              >
                <span>📊 Exam Results</span>
                <span className="text-muted">→</span>
              </Link>
              <Link
                href="/admit-card"
                className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-100 transition text-xs font-bold text-ink"
              >
                <span>🎫 Admit Cards</span>
                <span className="text-muted">→</span>
              </Link>
              <Link
                href="/schemes"
                className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-100 transition text-xs font-bold text-ink"
              >
                <span>🇮🇳 Sarkari Yojana</span>
                <span className="text-muted">→</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
