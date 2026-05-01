import { Metadata } from 'next';
import { getJobs } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { Pagination } from '@/components/Pagination';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHeader } from '@/components/SectionHeader';
import { SearchForm } from '@/components/SearchForm';
import { FAQ } from '@/components/FAQ';
import { 
  generateCollectionPageSchema, 
  breadcrumbJsonLd, 
  generateCategoryMetaDescription 
} from '@/lib/seo';
import { FAQItem } from '@/lib/internal-links';

export const revalidate = 60;

type Props = { searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  
  // Get pagination info to determine if we need rel links
  const { pagination } = await getJobs(page, 18);
  
  const metadata: Metadata = {
    title: page > 1 ? `🔥 Latest Sarkari Naukri — Page ${page} | 50,000+ Jobs` : '🔥 Latest Sarkari Naukri 2026 - UPSC, SSC, Railway Jobs | 50,000+ Vacancies',
    description: page > 1 
      ? `Page ${page} - Latest government jobs, UPSC, SSC, Railway notifications. Apply now! Free alerts, instant updates.`
      : '⚡ BREAKING: 50,000+ Sarkari Naukri! UPSC, SSC, Railway, Police, Banking jobs. Daily updates, instant alerts. Apply now - Last dates approaching! 🚨',
    alternates: { 
      canonical: page > 1 ? `https://sarkaripulse.net/jobs?page=${page}` : 'https://sarkaripulse.net/jobs'
    },
    openGraph: {
      title: page > 1 ? `All Sarkari Naukri — Page ${page}` : 'All Sarkari Naukri — Latest Government Jobs 2026',
      description: generateCategoryMetaDescription('job'),
      type: 'website',
      locale: 'hi_IN',
      siteName: 'SarkariPulse',
      images: [
        {
          url: `https://sarkaripulse.net/api/og?title=Sarkari%20Naukri&subtitle=Latest%20Government%20Jobs%202026`,
          width: 1200,
          height: 630,
          alt: 'Latest Sarkari Naukri - Government Jobs 2026',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page > 1 ? `All Sarkari Naukri — Page ${page}` : 'All Sarkari Naukri — Latest Government Jobs 2026',
      description: generateCategoryMetaDescription('job').slice(0, 100),
    },
  };

  // Add pagination link tags
  if (pagination.hasNext || pagination.hasPrev) {
    metadata.other = {};
    if (pagination.hasPrev) {
      const prevPage = page - 1;
      metadata.other['link-prev'] = prevPage === 1 ? '/jobs' : `/jobs?page=${prevPage}`;
    }
    if (pagination.hasNext) {
      metadata.other['link-next'] = `/jobs?page=${page + 1}`;
    }
  }

  return metadata;
}

export default async function JobsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { data: jobs, pagination } = await getJobs(page, 18);

  // Generate structured data
  const collectionPageSchema = generateCollectionPageSchema('job', jobs, pagination.total);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Sarkari Naukri', url: '/jobs' }
  ]);

  // FAQ data for jobs category
  const jobsFAQ: FAQItem[] = [
    {
      question: 'SarkariPulse par kitni government jobs available hain?',
      answer: `Currently ${pagination.total.toLocaleString('en-IN')} sarkari naukri notifications available hain. Har din nayi vacancies add hoti rehti hain.`
    },
    {
      question: 'Kya yahan par latest job notifications milte hain?',
      answer: 'Haan bilkul! Humara AI system har 10 minute mein check karta hai aur latest notifications instantly update karta hai. Aap ko sabse pehle updates mil jaate hain.'
    },
    {
      question: 'Job apply karne ke liye kya karna hoga?',
      answer: 'Job card par click kariye, complete details padhiye, eligibility check kariye, aur "Apply Now" button par click karke official website par jaayiye. Wahan online form bhariye.'
    },
    {
      question: 'Kya SarkariPulse ki service free hai?',
      answer: 'Haan, SarkariPulse 100% free hai. Koi hidden charges nahi hain. Aap free mein latest notifications, alerts, aur job details dekh sakte hain.'
    },
    {
      question: 'State wise jobs kaise search karein?',
      answer: 'Aap search box mein state name type kar sakte hain ya phir job cards mein state filter use kar sakte hain. Har state ke liye separate page bhi available hai.'
    }
  ];

  return (
    <div className="container-wrap py-8 animate-fade-in">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Breadcrumb items={[{ label: 'All Jobs' }]} />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-6">
        <SectionHeader
          title="All Sarkari Naukri"
          subtitle={`${pagination.total.toLocaleString('en-IN')} notifications available`}
          icon="💼"
        />
        <div className="w-full sm:w-72">
          <SearchForm />
        </div>
      </div>

      {/* Category Description */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-ink mb-3">Latest Government Jobs 2026</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          SarkariPulse par sabse latest sarkari naukri notifications milte hain. UPSC, SSC, Railway, Banking, Police, 
          State Government aur Central Government ki sabhi vacancies yahan available hain. Har category ke liye 
          detailed information, eligibility criteria, last date, aur direct apply links provided hain.
        </p>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{pagination.total.toLocaleString('en-IN')}</div>
            <div className="text-xs text-muted">Total Jobs</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Daily</div>
            <div className="text-xs text-muted">Updates</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">10 Min</div>
            <div className="text-xs text-muted">Auto Refresh</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Free</div>
            <div className="text-xs text-muted">Service</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job, i) => (
          <JobCard key={job.slug} job={job} index={i} />
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-4xl">📭</p>
          <p className="mt-4 font-bold text-muted">Koi jobs abhi available nahi hain</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath="/jobs" />

      {/* FAQ Section */}
      <div className="mt-8">
        <FAQ items={jobsFAQ} title="Sarkari Naukri - Frequently Asked Questions" />
      </div>
    </div>
  );
}
