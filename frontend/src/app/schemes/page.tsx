import { Metadata } from 'next';
import { getSchemes } from '@/lib/api';
import { SchemeCard } from '@/components/SchemeCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHeader } from '@/components/SectionHeader';
import { SearchForm } from '@/components/SearchForm';
import { FAQ } from '@/components/FAQ';
import { Pagination } from '@/components/Pagination';
import { 
  breadcrumbJsonLd 
} from '@/lib/seo';
import { FAQItem } from '@/lib/internal-links';
import { SchemeListItem } from '@/lib/types';

export const revalidate = 3600;

type Props = { searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  
  let pagination = {
    page: 1,
    limit: 18,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  };

  try {
    const result = await getSchemes(page, 18);
    pagination = result.pagination;
  } catch (error) {
    console.error('Failed to fetch schemes for metadata:', error);
  }
  
  const metadata: Metadata = {
    title: page > 1 ? `Sarkari Yojana 2026 - सरकारी योजना — Page ${page}` : 'Sarkari Yojana 2026 - सरकारी योजना List, PM Kisan, Ayushman Bharat | SarkariPulse',
    description: '2026 ki sabhi sarkari yojana ek jagah — PM Kisan Samman Nidhi, Ayushman Bharat, PM Awas Yojana, Mudra Loan, Sukanya Samriddhi. Eligibility, labh (benefits), zaroori documents aur online apply ki puri jankari Hindi mein. Bilkul free!',
    keywords: [
      'sarkari yojana', 'सरकारी योजना', 'sarkari yojana 2026', 'government schemes',
      'PM Kisan Yojana', 'pm kisan samman nidhi', 'Ayushman Bharat Yojana', 'ayushman card',
      'PM Awas Yojana', 'pradhan mantri awas yojana', 'Mudra Loan Yojana', 'mudra loan online apply',
      'kendra sarkar yojana', 'rajya sarkar yojana', 'sarkari yojana list',
      'Sukanya Samriddhi Yojana', 'Atal Pension Yojana', 'Ujjwala Yojana',
      'Beti Bachao Beti Padhao', 'kisan yojana', 'mahila yojana', 'student yojana',
      'sarkari yojana online apply', 'government scheme eligibility',
      'sarkari yojana ki jankari', 'free sarkari yojana', 'yojana ka labh kaise le',
      'pradhan mantri yojana list 2026', 'state government schemes',
    ],
    alternates: { 
      canonical: page > 1 ? `https://sarkaripulse.net/schemes?page=${page}` : 'https://sarkaripulse.net/schemes'
    },
    openGraph: {
      title: page > 1 ? `Sarkari Yojana 2026 — Page ${page}` : 'Sarkari Yojana 2026 - सरकारी योजना | PM Kisan, Ayushman Bharat',
      description: 'Sabhi sarkari yojana ki puri jankari — PM Kisan, Ayushman Bharat, PM Awas, Mudra Loan. Eligibility, labh, online apply. Bilkul free!',
      type: 'website',
      locale: 'hi_IN',
      siteName: 'SarkariPulse',
      images: [
        {
          url: 'https://sarkaripulse.net/logo.jpg',
          width: 1024,
          height: 1024,
          alt: 'Sarkari Yojana 2026 - सरकारी योजना List',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page > 1 ? `Sarkari Yojana 2026 — Page ${page}` : 'Sarkari Yojana 2026 - सरकारी योजना',
      description: 'Sabhi sarkari yojana ki jankari — PM Kisan, Ayushman Bharat, PM Awas. Free!',
      images: ['https://sarkaripulse.net/logo.jpg'],
    },
  };

  if (pagination.hasNext || pagination.hasPrev) {
    metadata.other = {};
    if (pagination.hasPrev) {
      const prevPage = page - 1;
      metadata.other['link-prev'] = prevPage === 1 ? '/schemes' : `/schemes?page=${prevPage}`;
    }
    if (pagination.hasNext) {
      metadata.other['link-next'] = `/schemes?page=${page + 1}`;
    }
  }

  return metadata;
}

export default async function SchemesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  
  let schemes: SchemeListItem[] = [];
  let pagination = {
    page: 1,
    limit: 18,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  };

  try {
    const result = await getSchemes(page, 18);
    schemes = result.data;
    pagination = result.pagination;
  } catch (error) {
    console.error('Failed to fetch schemes:', error);
    // Return empty state gracefully
  }

  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Sarkari Yojana', url: '/schemes' }
  ]);

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Sarkari Yojana 2026 - सरकारी योजना | Kendra & Rajya Sarkar Yojana',
    description: '2026 ki sabhi sarkari yojana ek jagah — PM Kisan, Ayushman Bharat, PM Awas, Mudra Loan. Eligibility, labh aur online apply ki puri jankari.',
    url: `https://sarkaripulse.net/schemes${page > 1 ? `?page=${page}` : ''}`,
    inLanguage: 'hi-IN',
    isPartOf: {
      '@type': 'WebSite',
      name: 'SarkariPulse',
      url: 'https://sarkaripulse.net'
    },
    about: {
      '@type': 'Thing',
      name: 'Sarkari Yojana',
      description: 'Kendra aur Rajya Sarkar ki sabhi yojanaon ki jankari'
    },
    numberOfItems: pagination.total,
    itemListElement: schemes.map((scheme, index) => ({
      '@type': 'ListItem',
      position: (page - 1) * 18 + index + 1,
      item: {
        '@type': 'GovernmentService',
        name: scheme.title,
        description: scheme.summary,
        url: `https://sarkaripulse.net/schemes/${scheme.slug}`,
        serviceType: scheme.schemeType === 'central' ? 'Kendra Sarkar Yojana' : 'Rajya Sarkar Yojana',
        areaServed: scheme.state || 'India',
        provider: {
          '@type': 'GovernmentOrganization',
          name: scheme.department || 'Government of India'
        }
      }
    }))
  };

  const schemesFAQ: FAQItem[] = [
    {
      question: 'SarkariPulse par kitni sarkari yojana ki jankari available hai?',
      answer: `Abhi ${pagination.total.toLocaleString('en-IN')} sarkari yojanaon ki puri jankari available hai. Kendra Sarkar (Central) aur Rajya Sarkar (State) dono yojana shamil hain — jaise PM Kisan Samman Nidhi, Ayushman Bharat, PM Awas Yojana, Mudra Loan, Sukanya Samriddhi aur bahut saari aur yojanayen.`
    },
    {
      question: 'Kya yahan Kendra aur Rajya dono sarkar ki yojanayen milti hain?',
      answer: 'Haan bilkul! Yahan PM Kisan, Ayushman Bharat, PM Awas jaise Kendra Sarkar ki yojanayen aur Jharkhand, UP, Bihar, Rajasthan jaise Rajya Sarkar ki yojanayen dono available hain. Aap apne state ke hisaab se filter karke dekh sakte hain.'
    },
    {
      question: 'Sarkari yojana ke liye online aavedan (apply) kaise karein?',
      answer: 'Yojana ki detail page par jaayiye, paatrata (eligibility) criteria check kariye, zaroori documents (Aadhaar, income certificate, bank passbook etc.) ready rakhiye, aur "Online Apply" button par click karke official website par jaayiye. Wahan aavedan form bhariye aur submit kariye. Yeh bilkul free hai!'
    },
    {
      question: 'Yojana ki paatrata (eligibility) kaise check karein?',
      answer: 'Har yojana ke detail page par complete paatrata criteria di gayi hai. Aap apni umr (age), aay (income), shaikshik yogyata (qualification), aur varg (category) check kar sakte hain. Kisan yojana, mahila yojana, chhatra yojana — sabke liye alag-alag paatrata hai.'
    },
    {
      question: 'State wise sarkari yojana kaise dekhein?',
      answer: 'Aap state filter use kar sakte hain ya phir direct state-specific page par jaa sakte hain. Har rajya ke liye alag-alag yojanayen available hain — Jharkhand yojana, UP yojana, Bihar yojana, Rajasthan yojana, MP yojana etc.'
    },
    {
      question: 'Sabse popular sarkari yojanayen kaun-kaun si hain?',
      answer: 'Popular yojanayen: PM Kisan Samman Nidhi (kisanon ke liye ₹6000/saal), Ayushman Bharat (₹5 lakh health cover), PM Awas Yojana (ghar ke liye subsidy), Mudra Loan (business ke liye), Sukanya Samriddhi (beti ke liye), Atal Pension Yojana (retirement ke liye), Ujjwala Yojana (LPG connection), Beti Bachao Beti Padhao.'
    },
    {
      question: 'Sarkari yojana ka labh (benefit) kab milta hai?',
      answer: 'Har yojana ka labh alag hai. PM Kisan mein 3 kiston mein ₹6000/saal, Ayushman Bharat mein ₹5 lakh tak ka free ilaaj, PM Awas mein home loan par interest subsidy. Aavedan approve hone ke baad labh milna shuru hota hai.'
    },
    {
      question: 'Kya sarkari yojana mein apply karna free hai?',
      answer: 'Haan, sarkari yojana mein aavedan karna bilkul muft (free) hai. Koi bhi application fee nahi lagti. Agar koi dalal ya agent paisa maange to woh fraud hai. Hamesha direct official government website se hi apply karein.'
    }
  ];

  // FAQ Schema for Google rich results
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: schemesFAQ.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  return (
    <div className="container-wrap py-8 animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Breadcrumb items={[{ label: 'Sarkari Yojana (सरकारी योजना)' }]} />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-6">
        <SectionHeader
          title="Sarkari Yojana (सरकारी योजना)"
          subtitle={`${pagination.total.toLocaleString('en-IN')} yojanaon ki puri jankari`}
          icon="🏛️"
        />
        <div className="w-full sm:w-72">
          <SearchForm />
        </div>
      </div>

      {/* Category Description - Rich Hinglish Content */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-ink mb-3">Sarkari Yojana 2026 — Kendra & Rajya Sarkar Ki Sabhi Yojanayen (सरकारी योजना)</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          SarkariPulse par sabse nayi aur updated <strong>sarkari yojana 2026</strong> ki complete jankari milti hai — bilkul free! 
          Yahan aapko <strong>PM Kisan Samman Nidhi Yojana</strong> (kisanon ke liye ₹6000/saal), <strong>Ayushman Bharat Yojana</strong> (₹5 lakh tak free ilaaj), 
          <strong> PM Awas Yojana</strong> (ghar banane ke liye subsidy), <strong>Mudra Loan Yojana</strong> (vyapaar ke liye loan), 
          <strong> Sukanya Samriddhi Yojana</strong> (beti ke bhavishya ke liye), aur kai aur <strong>Kendra Sarkar</strong> aur <strong>Rajya Sarkar</strong> ki 
          yojanaon ki puri jankari milegi. Har yojana ke liye <strong>paatrata (eligibility)</strong>, <strong>labh (benefits)</strong>, 
          <strong> zaroori documents</strong>, <strong>aavedan prakriya (application process)</strong> aur <strong>official apply link</strong> diya gaya hai. 
          Kisan yojana, mahila sashaktikaran yojana, chhatra yojana, awas yojana, swasthya yojana — sabhi shreniyan (categories) covered hain.
        </p>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{pagination.total.toLocaleString('en-IN')}</div>
            <div className="text-xs text-muted">Kul Yojanayen</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Kendra & Rajya</div>
            <div className="text-xs text-muted">Dono Sarkar</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Updated</div>
            <div className="text-xs text-muted">Taza Jankari</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">🆓 Free</div>
            <div className="text-xs text-muted">Bilkul Muft Seva</div>
          </div>
        </div>
      </div>

      {/* Popular Yojana Quick Links */}
      <div className="card mb-6 !p-4">
        <h3 className="text-sm font-bold text-ink mb-3">🔥 Popular Sarkari Yojanayen:</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'PM Kisan Yojana', 'Ayushman Bharat', 'PM Awas Yojana', 'Mudra Loan',
            'Sukanya Samriddhi', 'Atal Pension', 'Ujjwala Yojana', 'Beti Bachao Beti Padhao',
            'Kisan Credit Card', 'Jan Dhan Yojana', 'Fasal Bima Yojana'
          ].map(tag => (
            <a
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-muted shadow-sm transition hover:border-accent hover:text-accent hover:shadow-md"
            >
              {tag}
            </a>
          ))}
        </div>
      </div>

      {/* Scheme Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {schemes.map((scheme, i) => (
          <SchemeCard key={scheme.slug} scheme={scheme} index={i} />
        ))}
      </div>

      {schemes.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-4 font-bold text-muted">Abhi koi sarkari yojana available nahi hai</p>
          <p className="mt-2 text-sm text-stone-400">Thodi der mein dubara check karein</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath="/schemes" />

      {/* FAQ Section */}
      <div className="mt-8">
        <FAQ items={schemesFAQ} title="Sarkari Yojana - Aksar Poochhe Jaane Wale Sawal (FAQ)" />
      </div>

      {/* SEO Bottom Content */}
      <section className="border-t border-stone-200 pt-8 mt-10">
        <div className="prose-custom max-w-4xl mx-auto text-sm leading-relaxed text-muted">
          <h2 className="text-lg font-black text-ink mb-3">Sarkari Yojana 2026 Ki Puri Jankari — SarkariPulse</h2>
          <p className="mb-3">
            <strong>SarkariPulse</strong> par aapko <strong>Bharat Sarkar</strong> aur <strong>Rajya Sarkar</strong> dwara chalai ja rahi sabhi 
            <strong> sarkari yojanaon</strong> ki latest aur vishwasniya (trusted) jankari milti hai. Chahe aap kisan ho, mahila ho, chhatra ho, ya 
            majdoor — sabke liye koi na koi sarkari yojana zaroor hai.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 mt-4 mb-4">
            <div>
              <h3 className="font-bold text-ink mb-1">🌾 Kisan Yojanayen</h3>
              <p>PM Kisan Samman Nidhi (₹6000/saal), Fasal Bima Yojana, Kisan Credit Card, Soil Health Card, PM Krishi Sinchai Yojana — sabhi kisan welfare yojanayen.</p>
            </div>
            <div>
              <h3 className="font-bold text-ink mb-1">👩 Mahila Sashaktikaran Yojanayen</h3>
              <p>Beti Bachao Beti Padhao, Sukanya Samriddhi Yojana, Mahila Shakti Kendra, Ujjwala Yojana — mahilaon aur betiyon ke liye vishesh yojanayen.</p>
            </div>
            <div>
              <h3 className="font-bold text-ink mb-1">🏠 Awas & Swasthya Yojanayen</h3>
              <p>PM Awas Yojana (Gramin & Shahri), Ayushman Bharat Yojana (₹5 lakh health cover), Jan Aushadhi Yojana — ghar aur swasthya ke liye.</p>
            </div>
            <div>
              <h3 className="font-bold text-ink mb-1">🎓 Shiksha & Rozgar Yojanayen</h3>
              <p>Mudra Loan Yojana, Skill India, Startup India, PM Vidya Lakshmi, National Scholarship Portal — padhai aur rozgar ke liye.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
