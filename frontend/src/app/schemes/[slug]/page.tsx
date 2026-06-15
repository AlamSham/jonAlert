import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSchemeBySlug, getRelatedSchemes } from '@/lib/api';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ShareButtons } from '@/components/ShareButtons';
import { SchemeCard } from '@/components/SchemeCard';
import { ReadingTime } from '@/components/ReadingTime';
import { TableOfContents } from '@/components/TableOfContents';
import { FAQ } from '@/components/FAQ';
import { SafeHtml } from '@/components/SafeHtml';
import { 
  breadcrumbJsonLd, 
  formatDate, 
  generateSchemePageTitle, 
  generateSchemeMetaDescription, 
  generateSchemeArticleSchema, 
  generateGovernmentServiceSchema, 
  generateSchemeFAQSchema,
  getCanonicalUrl
} from '@/lib/seo';
import { SCHEME_TYPE_EMOJI, SCHEME_TYPE_COLORS, SCHEME_TYPE_LABELS } from '@/lib/types';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const scheme = await getSchemeBySlug(slug);
  if (!scheme) return { title: 'Yojana Nahi Mili' };

  const pageTitle = generateSchemePageTitle(scheme);
  const metaDescription = generateSchemeMetaDescription(scheme);
  const schemeUrl = getCanonicalUrl(`/schemes/${slug}`);

  return {
    title: pageTitle,
    description: metaDescription,
    alternates: { canonical: schemeUrl },
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      url: schemeUrl,
      type: 'article',
      publishedTime: scheme.createdAt,
      locale: 'hi_IN',
      siteName: 'SarkariPulse',
      images: [
        {
          url: 'https://sarkaripulse.net/logo.jpg',
          width: 1024,
          height: 1024,
          alt: scheme.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: metaDescription.slice(0, 100),
      images: ['https://sarkaripulse.net/logo.jpg'],
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
    { label: 'Sarkari Yojana', href: '/schemes' },
    { label: scheme.title.slice(0, 50) + (scheme.title.length > 50 ? '...' : '') },
  ];

  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Sarkari Yojana', url: '/schemes' },
    { name: scheme.title, url: `/schemes/${slug}` }
  ]);

  // GovernmentService Schema
  const govServiceSchema = generateGovernmentServiceSchema(scheme);
  
  // Article Schema
  const articleSchema = generateSchemeArticleSchema(scheme);
  
  // FAQ Schema
  const faqSchema = generateSchemeFAQSchema(scheme);

  // Generate FAQ items in Hinglish
  const faqItems = [
    {
      question: `${scheme.title} ke liye paatrata (eligibility) kya hai?`,
      answer: scheme.eligibility
    },
    {
      question: `${scheme.title} ke kya-kya labh (benefits) milte hain?`,
      answer: scheme.benefits
    },
    scheme.applyLink && {
      question: `${scheme.title} ke liye online aavedan (apply) kaise karein?`,
      answer: `Official website par jaayiye: ${scheme.applyLink}. ${scheme.applicationProcess}. Yeh bilkul free hai — koi application fee nahi hai!`
    },
    scheme.helplineNumber && {
      question: `${scheme.title} ka helpline number kya hai?`,
      answer: `Helpline Number: ${scheme.helplineNumber}. Aap is number par call karke yojana ke baare mein puri jankari le sakte hain aur apni samasya ka samadhan pa sakte hain.`
    },
    {
      question: `Kya ${scheme.title} mein aavedan karna free hai?`,
      answer: 'Haan, sarkari yojana mein aavedan karna bilkul muft (free) hai. Koi bhi application fee nahi lagti. Agar koi dalal ya agent paisa maange to woh fraud hai. Hamesha direct official government website se hi apply karein.'
    },
    {
      question: `${scheme.title} ke liye kaun-kaun se documents chahiye?`,
      answer: 'Aam taur par ye documents chahiye: Aadhaar Card, Income Certificate, Bank Account Passbook (aapke naam se), Passport Size Photo, Mobile Number (Aadhaar se linked), Ration Card, aur yojana ke hisaab se kuch aur specific documents. Detail page par puri list di gayi hai.'
    }
  ].filter(Boolean) as Array<{ question: string; answer: string }>;

  // Build TOC items
  const tocItems = [
    { id: 'section-summary', label: 'Yojana Ka Saar', emoji: '📝' },
    { id: 'section-highlights', label: 'Mukhya Baatein', emoji: '⭐' },
    { id: 'section-details', label: 'Puri Jankari', emoji: '📄' },
    { id: 'section-eligibility', label: 'Paatrata', emoji: '✅' },
    { id: 'section-benefits', label: 'Labh', emoji: '🎁' },
    { id: 'section-application', label: 'Aavedan Prakriya', emoji: '📋' },
    { id: 'section-documents', label: 'Zaroori Documents', emoji: '📑' },
    scheme.applyLink && { id: 'section-apply', label: 'Online Apply', emoji: '🔗' },
    (scheme.helplineNumber || scheme.officialWebsite) && { id: 'section-contact', label: 'Sampark', emoji: '📞' },
    faqItems.length > 0 && { id: 'section-faq', label: 'FAQ', emoji: '❓' },
    { id: 'section-share', label: 'Share', emoji: '📤' },
    { id: 'section-related', label: 'Sambandhit Yojanayen', emoji: '📌' },
  ].filter(Boolean) as { id: string; label: string; emoji: string }[];

  // Build full content string for reading time
  const fullContent = [scheme.summary, scheme.description, scheme.eligibility, scheme.benefits, scheme.applicationProcess].filter(Boolean).join(' ');

  return (
    <div className="container-wrap py-8 animate-fade-in">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(govServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <Breadcrumb items={breadcrumbs} />

      {/* Desktop layout: Content + Sidebar TOC */}
      <div className="flex gap-8 items-start mobile-job-layout">
        <article className="max-w-4xl flex-1 mobile-responsive-content" id="scheme-detail">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`badge ${colorClass}`}>
                {emoji} {typeLabel}
              </span>
              <span className="badge bg-emerald-100 text-emerald-700">
                🆓 Free Apply
              </span>
            </div>
            <h1 className="text-2xl font-black leading-tight text-ink sm:text-3xl">{scheme.title}</h1>

            {/* Meta row with Reading Time */}
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
                <span className="flex items-center gap-1.5">📅 Shuru: {formatDate(scheme.launchDate)}</span>
              )}
              {scheme.viewCount > 0 && (
                <span className="flex items-center gap-1.5">👁️ {scheme.viewCount.toLocaleString('en-IN')} views</span>
              )}
              <ReadingTime content={fullContent} />
            </div>

            {/* Quick Info Cards */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mobile-quick-info-grid">
              <div className="card !p-4 text-center mobile-info-card">
                <p className="text-lg font-black text-accent">{typeLabel}</p>
                <p className="text-xs font-semibold uppercase text-muted mt-1">Yojana Prakar</p>
              </div>
              {scheme.state && (
                <div className="card !p-4 text-center mobile-info-card">
                  <p className="text-lg font-black text-ink">{scheme.state}</p>
                  <p className="text-xs font-semibold uppercase text-muted mt-1">Lagu Kshetra</p>
                </div>
              )}
              {scheme.department && (
                <div className="card !p-4 text-center mobile-info-card">
                  <p className="text-sm font-black text-ink line-clamp-2">{scheme.department}</p>
                  <p className="text-xs font-semibold uppercase text-muted mt-1">Vibhag</p>
                </div>
              )}
            </div>
          </header>

          {/* Mobile TOC */}
          <TableOfContents items={tocItems} variant="mobile" />

          {/* Summary / Saar */}
          <section className="mb-8 rounded-2xl bg-amber-50/60 border border-amber-200/40 p-5 mobile-content-section" id="section-summary">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-2">📝 Yojana Ka Saar (सारांश)</h2>
            <p className="text-sm leading-relaxed text-ink mobile-text-content">{scheme.summary}</p>
          </section>

          {/* Key Highlights / Mukhya Baatein */}
          <section className="mb-8 mobile-content-section" id="section-highlights">
            <h2 className="text-lg font-black text-ink mb-3">⭐ Yojana Ki Mukhya Baatein</h2>
            <div className="card !p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/60">
                  <span className="text-xl">🏛️</span>
                  <div>
                    <p className="text-xs font-bold text-blue-700 uppercase">Yojana Prakar</p>
                    <p className="text-sm font-semibold text-ink">{typeLabel}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50/60">
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="text-xs font-bold text-green-700 uppercase">Lagu Kshetra</p>
                    <p className="text-sm font-semibold text-ink">{scheme.state || 'Pura Bharat'}</p>
                  </div>
                </div>
                {scheme.department && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/60">
                    <span className="text-xl">🏢</span>
                    <div>
                      <p className="text-xs font-bold text-purple-700 uppercase">Vibhag</p>
                      <p className="text-sm font-semibold text-ink">{scheme.department}</p>
                    </div>
                  </div>
                )}
                {scheme.launchDate && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/60">
                    <span className="text-xl">📅</span>
                    <div>
                      <p className="text-xs font-bold text-orange-700 uppercase">Shuru Ki Tareekh</p>
                      <p className="text-sm font-semibold text-ink">{formatDate(scheme.launchDate)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/60">
                  <span className="text-xl">💰</span>
                  <div>
                    <p className="text-xs font-bold text-emerald-700 uppercase">Aavedan Shulk</p>
                    <p className="text-sm font-semibold text-ink">Bilkul Muft (Free)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/60">
                  <span className="text-xl">🌐</span>
                  <div>
                    <p className="text-xs font-bold text-rose-700 uppercase">Aavedan Maadhyam</p>
                    <p className="text-sm font-semibold text-ink">Online / Offline</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Description / Puri Jankari */}
          <section className="mb-8 mobile-content-section" id="section-details">
            <h2 className="text-lg font-black text-ink mb-3">📄 Yojana Ki Puri Jankari</h2>
            <div className="card !p-5 mobile-text-content overflow-hidden">
              <SafeHtml content={scheme.description} />
            </div>
          </section>

          {/* Eligibility / Paatrata */}
          <section className="mb-8 mobile-content-section" id="section-eligibility">
            <h2 className="text-lg font-black text-ink mb-3">✅ Paatrata (Eligibility Criteria)</h2>
            <div className="card !p-5 mobile-text-content overflow-hidden">
              <SafeHtml content={scheme.eligibility} />
            </div>
          </section>

          {/* Benefits / Labh */}
          <section className="mb-8 mobile-content-section" id="section-benefits">
            <h2 className="text-lg font-black text-ink mb-3">🎁 Yojana Ke Labh (Benefits)</h2>
            <div className="card !p-5 mobile-text-content overflow-hidden">
              <SafeHtml content={scheme.benefits} />
            </div>
          </section>

          {/* Application Process / Aavedan Prakriya */}
          <section className="mb-8 mobile-content-section" id="section-application">
            <h2 className="text-lg font-black text-ink mb-3">📋 Aavedan Kaise Karein (Application Process)</h2>
            <div className="card !p-5 mobile-text-content overflow-hidden">
              <SafeHtml content={scheme.applicationProcess} />
            </div>
          </section>

          {/* Required Documents / Zaroori Documents */}
          <section className="mb-8 mobile-content-section" id="section-documents">
            <h2 className="text-lg font-black text-ink mb-3">📑 Zaroori Documents (Required Documents)</h2>
            <div className="card !p-5">
              <p className="text-sm text-muted mb-4">Is yojana ke liye aavedan karte samay ye documents rakhein:</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { icon: '🪪', name: 'Aadhaar Card', desc: 'Pehchaan pramaan ke liye' },
                  { icon: '🏦', name: 'Bank Passbook', desc: 'Aapke naam ka khata' },
                  { icon: '📸', name: 'Passport Size Photo', desc: 'Haal ki photo' },
                  { icon: '📱', name: 'Mobile Number', desc: 'Aadhaar se linked' },
                  { icon: '📄', name: 'Income Certificate', desc: 'Aay ka pramaan patra' },
                  { icon: '🏠', name: 'Niwas Praman Patra', desc: 'Address proof' },
                  { icon: '📋', name: 'Ration Card', desc: 'Agar applicable ho' },
                  { icon: '🎓', name: 'Shaikshik Pramaan Patra', desc: 'Qualification proof' },
                ].map((doc) => (
                  <div key={doc.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-stone-50 text-sm">
                    <span className="text-lg">{doc.icon}</span>
                    <div>
                      <p className="font-semibold text-ink">{doc.name}</p>
                      <p className="text-xs text-muted">{doc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-3">
                ⚠️ Note: Yojana ke hisaab se kuch aur documents bhi maange ja sakte hain. Official notification zaroor padhein.
              </p>
            </div>
          </section>

          {/* Apply Link */}
          {scheme.applyLink && (
            <section className="mb-8" id="section-apply">
              <a
                href={scheme.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-green-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:shadow-xl active:scale-95"
                id="apply-btn"
              >
                🔗 Online Apply Karein / Official Website
              </a>
              <p className="mt-2 text-xs text-muted">
                ⚠️ Aap official sarkari website par redirect honge. Apply karna bilkul free hai!
              </p>
            </section>
          )}

          {/* Contact Information / Sampark Jankari */}
          {(scheme.helplineNumber || scheme.officialWebsite) && (
            <section className="mb-8 rounded-2xl border border-stone-200 bg-stone-50 p-5" id="section-contact">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">📞 Sampark Jankari (Helpline)</h2>
              <div className="space-y-2 text-sm">
                {scheme.helplineNumber && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">Helpline Number:</span>
                    <a href={`tel:${scheme.helplineNumber}`} className="text-accent hover:underline">
                      {scheme.helplineNumber}
                    </a>
                  </div>
                )}
                {scheme.officialWebsite && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">Official Website:</span>
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
            <section className="mb-8" id="section-faq">
              <FAQ items={faqItems} title="Aksar Poochhe Jaane Wale Sawal (FAQ)" includeJsonLd={false} />
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

          {/* Internal Links / Explore More */}
          <section className="mb-8 rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">🔗 Aur Dekhein</h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/schemes"
                className="rounded-full border border-accent/30 bg-accent/5 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10 hover:border-accent transition"
              >
                📋 Sabhi Sarkari Yojanayen →
              </Link>
              {scheme.state && scheme.state !== 'All India' && (
                <Link
                  href={`/schemes/state/${encodeURIComponent(scheme.state)}`}
                  className="rounded-full border border-emerald-300/50 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 transition"
                >
                  📍 {scheme.state} Ki Yojanayen →
                </Link>
              )}
              <Link
                href="/jobs"
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
              >
                💼 Sarkari Naukri →
              </Link>
              <Link
                href="/search"
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
              >
                🔍 Search Karein →
              </Link>
              <Link
                href="/"
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
              >
                🏠 Homepage →
              </Link>
            </div>
          </section>

          {/* Last Updated */}
          {(scheme.lastVerified || scheme.updatedAt) && (
            <p className="text-xs text-stone-400 mt-8">
              Aakhri baar update kiya gaya: {formatDate(scheme.lastVerified || scheme.updatedAt || scheme.createdAt)}
            </p>
          )}
        </article>

        {/* Desktop Sidebar TOC */}
        <TableOfContents items={tocItems} variant="desktop" />
      </div>

      {/* Share Buttons */}
      <div className="max-w-4xl mt-8 p-5 rounded-2xl border border-stone-200 bg-white" id="section-share">
        <ShareButtons title={scheme.title} slug={slug} category="job" />
      </div>

      {/* Related Schemes */}
      <div id="section-related">
        <RelatedSchemesSection slug={slug} />
      </div>

      {/* Sticky Mobile WhatsApp Share */}
      <div className="fixed bottom-4 right-4 md:hidden z-40">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`🏛️ ${scheme.title}\n👉 https://sarkaripulse.net/schemes/${slug}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-xl transition hover:bg-green-600 active:scale-90"
          aria-label="WhatsApp par share karein"
          id="sticky-whatsapp"
        >
          💬
        </a>
      </div>
    </div>
  );
}

async function RelatedSchemesSection({ slug }: { slug: string }) {
  const related = await getRelatedSchemes(slug);
  if (!related || related.length === 0) return null;

  return (
    <section className="max-w-4xl mt-10">
      <h2 className="text-lg font-black text-ink mb-4">📌 Sambandhit Yojanayen (Related Schemes)</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((scheme, i) => (
          <SchemeCard key={scheme.slug} scheme={scheme} index={i} />
        ))}
      </div>
    </section>
  );
}
