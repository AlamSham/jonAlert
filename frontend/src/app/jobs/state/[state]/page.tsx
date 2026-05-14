import { Metadata } from 'next';
import { getJobsByState } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { Pagination } from '@/components/Pagination';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHeader } from '@/components/SectionHeader';
import { FAQ } from '@/components/FAQ';
import { 
  generateCollectionPageSchema, 
  breadcrumbJsonLd, 
  generateLocalBusinessSchema
} from '@/lib/seo';
import { FAQItem } from '@/lib/internal-links';
import { getNeighboringStates } from '@/lib/neighboring-states';

export const revalidate = 60;

type Props = {
  params: Promise<{ state: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const decodedState = decodeURIComponent(state);
  return {
    title: `${decodedState} Govt Jobs 2026: Latest Vacancy, Sarkari Naukri`,
    description: `Latest ${decodedState} Govt Jobs 2026: sarkari naukri, vacancy, eligibility, last date, salary aur apply online links. Daily government job updates.`,
    alternates: { canonical: `https://sarkaripulse.net/jobs/state/${encodeURIComponent(decodedState)}` },
  };
}

export default async function StatePage({ params, searchParams }: Props) {
  const { state } = await params;
  const sp = await searchParams;
  const decodedState = decodeURIComponent(state);
  const page = Math.max(1, Number(sp.page) || 1);
  const { data: jobs, pagination } = await getJobsByState(decodedState, page, 18);

  // Get neighboring states
  const neighboringStates = getNeighboringStates(decodedState);

  // Calculate statistics
  const latestJobDate = jobs.length > 0 ? new Date(Math.max(...jobs.map(job => new Date(job.createdAt).getTime()))) : null;
  const categories = jobs.reduce((acc, job) => {
    acc[job.category] = (acc[job.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const popularCategories = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category);

  // Generate structured data
  const collectionPageSchema = generateCollectionPageSchema('job', jobs, pagination.total);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Sarkari Naukri', url: '/jobs' },
    { name: decodedState, url: `/jobs/state/${state}` }
  ]);
  const localBusinessSchema = generateLocalBusinessSchema(decodedState);

  // FAQ data for state-specific jobs
  const stateFAQ: FAQItem[] = [
    {
      question: `${decodedState} mein kitni government jobs available hain?`,
      answer: `Currently ${pagination.total} sarkari naukri notifications ${decodedState} mein available hain. State government aur central government dono ki jobs yahan milti hain.`
    },
    {
      question: `${decodedState} ki state government jobs kaise apply karein?`,
      answer: `${decodedState} ki official website par jaayiye, employment section check kariye, ya phir job notification mein diye gaye direct link par click kariye. Online application form bhariye.`
    },
    {
      question: `${decodedState} mein kya qualification ki jobs milti hain?`,
      answer: '10th pass se lekar Post Graduate tak sabhi qualification ki jobs milti hain. Police, Teacher, Clerk, Engineer, Doctor - har field ki vacancies available hain.'
    },
    {
      question: `${decodedState} government job ki salary kitni hoti hai?`,
      answer: 'Salary post ke according vary hoti hai. Usually ₹15,000 se ₹1,00,000+ per month tak hoti hai. 7th Pay Commission ke according pay scale milti hai.'
    },
    {
      question: `${decodedState} ki jobs ke liye age limit kya hai?`,
      answer: 'Age limit post ke according alag hoti hai. Usually 18-35 years, lekin SC/ST/OBC candidates ko age relaxation milti hai. Notification mein details check kariye.'
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <Breadcrumb items={[
        { label: 'All Jobs', href: '/jobs' },
        { label: decodedState },
      ]} />

      <SectionHeader
        title={`Sarkari Naukri in ${decodedState}`}
        subtitle={`${pagination.total} jobs in ${decodedState}`}
        icon="📍"
      />

      {/* State Description */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-ink mb-3">{decodedState} Government Jobs 2026</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          {decodedState} mein latest sarkari naukri notifications yahan milti hain. State government 
          aur central government dono ki jobs available hain. Police, Teacher, Clerk, Engineer, 
          Medical Officer - har field ki vacancies regular basis par update hoti rehti hain.
        </p>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{pagination.total}</div>
            <div className="text-xs text-muted">Total Jobs</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">
              {latestJobDate ? latestJobDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
            </div>
            <div className="text-xs text-muted">Latest Job</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">
              {popularCategories.length > 0 ? popularCategories[0] : 'All'}
            </div>
            <div className="text-xs text-muted">Popular Category</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Regular</div>
            <div className="text-xs text-muted">Updates</div>
          </div>
        </div>
      </div>

      {/* Neighboring States Links */}
      {neighboringStates.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-lg font-bold text-ink mb-3">Nearby States Jobs</h3>
          <p className="text-sm text-muted mb-4">
            {decodedState} ke neighboring states mein bhi government jobs check kariye:
          </p>
          <div className="flex flex-wrap gap-2">
            {neighboringStates.slice(0, 6).map((neighborState) => (
              <a
                key={neighborState}
                href={`/jobs/state/${encodeURIComponent(neighborState)}`}
                className="inline-flex items-center px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-sm text-ink transition-colors"
              >
                📍 {neighborState}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job, i) => (
          <JobCard key={job.slug} job={job} index={i} />
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-4xl">📭</p>
          <p className="mt-4 font-bold text-muted">{decodedState} mein abhi koi jobs available nahi hain</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath={`/jobs/state/${state}`} />

      {/* FAQ Section */}
      <div className="mt-8">
        <FAQ items={stateFAQ} title={`${decodedState} Government Jobs - FAQ`} />
      </div>
    </div>
  );
}
