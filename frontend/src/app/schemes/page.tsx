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

export const revalidate = 60;

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
    title: page > 1 ? `Government Schemes 2026 — Page ${page}` : 'Government Schemes 2026 - Central & State Yojana | SarkariPulse',
    description: 'Latest government schemes 2026 - PM Kisan, Ayushman Bharat, PM Awas, Mudra Loan, state yojanas. Check eligibility, benefits, online apply. Free information in Hinglish.',
    keywords: [
      'government schemes', 'sarkari yojana', 'PM Kisan', 'Ayushman Bharat',
      'PM Awas Yojana', 'Mudra loan', 'central government schemes', 'state government schemes',
      'pradhan mantri yojana', 'farmer schemes', 'women schemes', 'education schemes',
      'Sukanya Samriddhi', 'Atal Pension', 'Ujjwala Yojana', 'Beti Bachao Beti Padhao',
      'government schemes 2026', 'sarkari yojana list', 'how to apply government schemes',
      'eligibility criteria', 'scheme benefits', 'online apply schemes',
    ],
    alternates: { 
      canonical: page > 1 ? `https://sarkaripulse.net/schemes?page=${page}` : 'https://sarkaripulse.net/schemes'
    },
    openGraph: {
      title: page > 1 ? `Government Schemes 2026 — Page ${page}` : 'Government Schemes 2026 - Central & State Yojana',
      description: 'Latest government schemes - PM Kisan, Ayushman Bharat, state yojanas. Check eligibility, benefits, apply online.',
      type: 'website',
      locale: 'hi_IN',
      siteName: 'SarkariPulse',
      images: [
        {
          url: `https://sarkaripulse.net/api/og?title=Government%20Schemes&subtitle=Central%20%26%20State%20Yojana%202026`,
          width: 1200,
          height: 630,
          alt: 'Government Schemes 2026 - Central & State Yojana',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page > 1 ? `Government Schemes 2026 — Page ${page}` : 'Government Schemes 2026',
      description: 'Latest government schemes - PM Kisan, Ayushman Bharat, state yojanas.',
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
    { name: 'Government Schemes', url: '/schemes' }
  ]);

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Government Schemes 2026 - Central & State Yojana',
    description: 'Latest government schemes 2026 - PM Kisan, Ayushman Bharat, state yojanas. Check eligibility, benefits, apply online.',
    url: `https://sarkaripulse.net/schemes${page > 1 ? `?page=${page}` : ''}`,
    inLanguage: 'hi-IN',
    isPartOf: {
      '@type': 'WebSite',
      name: 'SarkariPulse',
      url: 'https://sarkaripulse.net'
    },
    about: {
      '@type': 'Thing',
      name: 'Government Schemes',
      description: 'Central and State Government Schemes in India'
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
        serviceType: scheme.schemeType === 'central' ? 'Central Government Scheme' : 'State Government Scheme',
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
      question: 'SarkariPulse par kitni government schemes available hain?',
      answer: `Currently ${pagination.total.toLocaleString('en-IN')} government schemes ki jankari available hai. Central aur state dono schemes included hain - PM Kisan, Ayushman Bharat, PM Awas, Mudra Loan jaise popular schemes.`
    },
    {
      question: 'Kya central aur state schemes dono milte hain?',
      answer: 'Haan bilkul! Yahan PM Kisan, Ayushman Bharat, PM Awas jaise central schemes aur Jharkhand, UP, Bihar jaise state-specific schemes dono available hain. Aap filter karke dekh sakte hain.'
    },
    {
      question: 'Government scheme ke liye kaise apply karein?',
      answer: 'Scheme details page par jaayiye, eligibility criteria check kariye, required documents ready rakhiye, aur "Apply Online" button par click karke official website par jaayiye. Wahan application form bhariye aur submit kariye.'
    },
    {
      question: 'Kya scheme ki eligibility check kar sakte hain?',
      answer: 'Haan, har scheme ke detail page par complete eligibility criteria di gayi hai. Aap apni age, income, qualification, aur category check kar sakte hain. Farmer schemes, women schemes, education schemes - sabke liye alag criteria hai.'
    },
    {
      question: 'State wise schemes kaise dekhein?',
      answer: 'Aap state filter use kar sakte hain ya phir direct state-specific page par jaa sakte hain. Har state ke liye alag schemes available hain - Jharkhand schemes, UP schemes, Bihar schemes etc.'
    },
    {
      question: 'Popular government schemes kaun kaun si hain?',
      answer: 'Popular schemes: PM Kisan Samman Nidhi (farmers), Ayushman Bharat (health), PM Awas Yojana (housing), Mudra Loan (business), Sukanya Samriddhi (girl child), Atal Pension (retirement), Ujjwala (LPG), Beti Bachao Beti Padhao.'
    },
    {
      question: 'Scheme ka benefit kab milta hai?',
      answer: 'Har scheme ka benefit alag hai. PM Kisan mein 3 installments mein ₹6000/year, Ayushman Bharat mein ₹5 lakh health cover, PM Awas mein interest subsidy. Application approval ke baad benefit milna start hota hai.'
    },
    {
      question: 'Kya schemes free hain?',
      answer: 'Haan, government schemes apply karna completely free hai. Koi application fee nahi lagti. Agar koi agent paisa maange to fraud hai. Direct official website se apply karein.'
    }
  ];

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

      <Breadcrumb items={[{ label: 'Government Schemes' }]} />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-6">
        <SectionHeader
          title="Government Schemes"
          subtitle={`${pagination.total.toLocaleString('en-IN')} schemes available`}
          icon="🏛️"
        />
        <div className="w-full sm:w-72">
          <SearchForm />
        </div>
      </div>

      {/* Category Description */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-ink mb-3">Latest Government Schemes 2026</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          SarkariPulse par sabse latest government schemes ki complete jankari milti hai. PM Kisan Yojana, Ayushman Bharat, 
          PM Awas Yojana, Mudra Loan, Sukanya Samriddhi Yojana aur state-specific schemes - sab ek jagah. Central government schemes 
          aur state government schemes dono available hain. Har scheme ke liye eligibility criteria, benefits, application process, 
          online apply links, aur helpline numbers provided hain. Farmer schemes, women empowerment schemes, education schemes, 
          housing schemes - sabhi categories covered hain.
        </p>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{pagination.total.toLocaleString('en-IN')}</div>
            <div className="text-xs text-muted">Total Schemes</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Central</div>
            <div className="text-xs text-muted">& State</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Updated</div>
            <div className="text-xs text-muted">Information</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Free</div>
            <div className="text-xs text-muted">Service</div>
          </div>
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
          <p className="mt-4 font-bold text-muted">Koi schemes abhi available nahi hain</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath="/schemes" />

      {/* FAQ Section */}
      <div className="mt-8">
        <FAQ items={schemesFAQ} title="Government Schemes - Frequently Asked Questions" />
      </div>
    </div>
  );
}
