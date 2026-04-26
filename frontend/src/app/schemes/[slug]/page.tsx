import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSchemeBySlug, getRelatedSchemes } from '@/lib/api';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ShareButtons } from '@/components/ShareButtons';
import { SchemeCard } from '@/components/SchemeCard';
import { FAQ } from '@/components/FAQ';
import { breadcrumbJsonLd, formatDate } from '@/lib/seo';
import { SCHEME_TYPE_EMOJI, SCHEME_TYPE_COLORS, SCHEME_TYPE_LABELS } from '@/lib/types';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const scheme = await getSchemeBySlug(slug);
  if (!scheme) return { title: 'Scheme Not Found' };

  const metaDescription = scheme.metaDescription || scheme.summary;

  return {
    title: scheme.metaTitle || `${scheme.title} - Eligibility, Benefits, Apply Online`,
    description: metaDescription,
    alternates: { canonical: `https://sarkaripulse.net/schemes/${slug}` },
    openGraph: {
      title: scheme.metaTitle || scheme.title,
      description: metaDescription,
      type: 'article',
      locale: 'hi_IN',
      siteName: 'SarkariPulse',
      images: [
        {
          url: `https://sarkaripulse.net/api/og?title=${encodeURIComponent(scheme.title)}&org=${encodeURIComponent(scheme.department || 'Government Scheme')}`,
          width: 1200,
          height: 630,
          alt: scheme.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: scheme.metaTitle || scheme.title,
      description: metaDescription.slice(0, 100),
    },
  };
}

export default async function SchemeDetailPage({ params }: Props) {
  const { slug } = await params;
  const scheme = await getSchemeBySlug(slug);
  if (!scheme) notFound();

  const emoji = SCHEME_TYPE_EMOJI[scheme.schemeType] || '🏛️';
  const colorClass = SCHEME_TYPE_COLORS[scheme.schemeType] || 'bg-stone-100 text-stone-600';
  const typeLabel = SCHEME_TYPE_LABELS[scheme.schemeType] || scheme.schemeType;

  const breadcrumbs = [
    { label: 'Government Schemes', href: '/schemes' },
    { label: scheme.title.slice(0, 50) + (scheme.title.length > 50 ? '...' : '') },
  ];

  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Government Schemes', url: '/schemes' },
    { name: scheme.title, url: `/schemes/${slug}` }
  ]);

  // Generate FAQ items
  const faqItems = [
    {
      question: `${scheme.title} ke liye eligibility kya hai?`,
      answer: scheme.eligibility
    },
    scheme.applyLink && {
      question: `${scheme.title} ke liye kaise apply karein?`,
      answer: `Official website par jaayiye: ${scheme.applyLink}. ${scheme.applicationProcess}`
    },
    {
      question: `${scheme.title} ke benefits kya hain?`,
      answer: scheme.benefits
    },
    scheme.helplineNumber && {
      question: `${scheme.title} ka helpline number kya hai?`,
      answer: `Helpline: ${scheme.helplineNumber}. Aap is number par call karke scheme ki jankari le sakte hain.`
    }
  ].filter(Boolean) as Array<{ question: string; answer: string }>;

  return (
    <div className="container-wrap py-8 animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Breadcrumb items={breadcrumbs} />

      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <span className={`badge ${colorClass} mb-3`}>
            {emoji} {typeLabel}
          </span>
          <h1 className="text-2xl font-black leading-tight text-ink sm:text-3xl">{scheme.title}</h1>

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
            {scheme.department && (
              <span className="flex items-center gap-1.5">🏛️ {scheme.department}</span>
            )}
            {scheme.state && (
              <Link
                href={`/schemes/state/${encodeURIComponent(scheme.state)}`}
                className="flex items-center gap-1.5 hover:text-accent transition"
              >
                📍 {scheme.state}
              </Link>
            )}
            {scheme.launchDate && (
              <span className="flex items-center gap-1.5">📅 Launched: {formatDate(scheme.launchDate)}</span>
            )}
            {scheme.viewCount > 0 && (
              <span className="flex items-center gap-1.5">👁️ {scheme.viewCount.toLocaleString('en-IN')} views</span>
            )}
          </div>

          {/* Quick Info Cards */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card !p-4 text-center">
              <p className="text-lg font-black text-accent">{typeLabel}</p>
              <p className="text-xs font-semibold uppercase text-muted mt-1">Scheme Type</p>
            </div>
            {scheme.state && (
              <div className="card !p-4 text-center">
                <p className="text-lg font-black text-ink">{scheme.state}</p>
                <p className="text-xs font-semibold uppercase text-muted mt-1">Applicable In</p>
              </div>
            )}
            {scheme.department && (
              <div className="card !p-4 text-center">
                <p className="text-sm font-black text-ink line-clamp-2">{scheme.department}</p>
                <p className="text-xs font-semibold uppercase text-muted mt-1">Department</p>
              </div>
            )}
          </div>
        </header>

        {/* Summary */}
        <section className="mb-8 rounded-2xl bg-amber-50/60 border border-amber-200/40 p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-2">📝 Summary</h2>
          <p className="text-sm leading-relaxed text-ink">{scheme.summary}</p>
        </section>

        {/* Description */}
        <section className="mb-8">
          <h2 className="text-lg font-black text-ink mb-3">📄 Scheme Details</h2>
          <div className="card !p-5 text-sm leading-relaxed text-ink/90 whitespace-pre-line">
            {scheme.description}
          </div>
        </section>

        {/* Eligibility */}
        <section className="mb-8">
          <h2 className="text-lg font-black text-ink mb-3">✅ Eligibility Criteria</h2>
          <div className="card !p-5 text-sm leading-relaxed text-ink/90 whitespace-pre-line">
            {scheme.eligibility}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-8">
          <h2 className="text-lg font-black text-ink mb-3">🎁 Benefits</h2>
          <div className="card !p-5 text-sm leading-relaxed text-ink/90 whitespace-pre-line">
            {scheme.benefits}
          </div>
        </section>

        {/* Application Process */}
        <section className="mb-8">
          <h2 className="text-lg font-black text-ink mb-3">📋 Application Process</h2>
          <div className="card !p-5 text-sm leading-relaxed text-ink/90 whitespace-pre-line">
            {scheme.applicationProcess}
          </div>
        </section>

        {/* Apply Link */}
        {scheme.applyLink && (
          <section className="mb-8">
            <a
              href={scheme.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-green-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:shadow-xl active:scale-95"
            >
              🔗 Apply Online / Official Website
            </a>
            <p className="mt-2 text-xs text-muted">
              ⚠️ You will be redirected to the official government website
            </p>
          </section>
        )}

        {/* Contact Information */}
        {(scheme.helplineNumber || scheme.officialWebsite) && (
          <section className="mb-8 rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">📞 Contact Information</h2>
            <div className="space-y-2 text-sm">
              {scheme.helplineNumber && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">Helpline:</span>
                  <a href={`tel:${scheme.helplineNumber}`} className="text-accent hover:underline">
                    {scheme.helplineNumber}
                  </a>
                </div>
              )}
              {scheme.officialWebsite && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">Website:</span>
                  <a 
                    href={scheme.officialWebsite} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-accent hover:underline break-all"
                  >
                    {scheme.officialWebsite}
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {faqItems.length > 0 && (
          <section className="mb-8">
            <FAQ items={faqItems} title="Frequently Asked Questions" />
          </section>
        )}

        {/* Tags */}
        {scheme.tags && scheme.tags.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">🏷️ Tags</h2>
            <div className="flex flex-wrap gap-2">
              {scheme.tags.map((tag) => (
                <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="tag-chip hover:bg-accent/15 hover:text-accent transition">
                  #{tag}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Last Updated */}
        {(scheme.lastVerified || scheme.updatedAt) && (
          <p className="text-xs text-stone-400 mt-8">
            Last updated: {formatDate(scheme.lastVerified || scheme.updatedAt || scheme.createdAt)}
          </p>
        )}
      </article>

      {/* Share Buttons */}
      <div className="max-w-4xl mx-auto mt-8 p-5 rounded-2xl border border-stone-200 bg-white">
        <ShareButtons title={scheme.title} slug={slug} category="job" />
      </div>

      {/* Related Schemes */}
      <RelatedSchemesSection slug={slug} />
    </div>
  );
}

async function RelatedSchemesSection({ slug }: { slug: string }) {
  const related = await getRelatedSchemes(slug);
  if (!related || related.length === 0) return null;

  return (
    <section className="max-w-4xl mx-auto mt-10">
      <h2 className="text-lg font-black text-ink mb-4">📌 Related Schemes</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((scheme, i) => (
          <SchemeCard key={scheme.slug} scheme={scheme} index={i} />
        ))}
      </div>
    </section>
  );
}
