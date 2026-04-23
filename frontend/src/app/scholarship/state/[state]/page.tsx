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
  generateCategoryMetaDescription,
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
  const s = decodeURIComponent(state);
  return {
    title: `Sarkari Naukri in ${s} — Scholarship Schemes ${s} 2026`,
    description: generateCategoryMetaDescription('scholarship', s),
    alternates: { canonical: `/scholarship/state/${encodeURIComponent(s)}` },
  };
}

export default async function ScholarshipStatePage({ params, searchParams }: Props) {
  const { state } = await params;
  const sp = await searchParams;
  const s = decodeURIComponent(state);
  const page = Math.max(1, Number(sp.page) || 1);
  const { data: jobs, pagination } = await getJobsByState(s, page, 18, 'scholarship');

  // Get neighboring states
  const neighboringStates = getNeighboringStates(s);

  // Calculate statistics
  const latestJobDate = jobs.length > 0 ? new Date(Math.max(...jobs.map(job => new Date(job.createdAt).getTime()))) : null;

  // Generate structured data
  const collectionPageSchema = generateCollectionPageSchema('scholarship', jobs, pagination.total);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Scholarship', url: '/scholarship' },
    { name: s, url: `/scholarship/state/${state}` }
  ]);
  const localBusinessSchema = generateLocalBusinessSchema(s);

  // FAQ data for state-specific scholarships
  const scholarshipStateFAQ: FAQItem[] = [
    {
      question: `${s} mein kya scholarship schemes available hain?`,
      answer: `${s} mein central government aur state government dono ki scholarship schemes available hain. Pre-matric, post-matric, merit-cum-means, aur minority scholarships milti hain.`
    },
    {
      question: `${s} scholarship ke liye income limit kya hai?`,
      answer: 'Usually family income ₹2-8 lakh per annum tak honi chahiye. Har scheme ki alag income criteria hoti hai. SC/ST categories mein income limit zyada hoti hai.'
    },
    {
      question: `${s} mein scholarship amount kitni milti hai?`,
      answer: 'Pre-matric: ₹1,000-3,000, Post-matric: ₹2,000-12,000, Professional courses: ₹20,000-50,000 per year. Amount course aur category ke basis par vary hoti hai.'
    },
    {
      question: `${s} scholarship application kaise submit karein?`,
      answer: 'NSP portal (scholarships.gov.in) par registration kariye, state portal check kariye, documents upload kariye, aur institute verification karwaiye.'
    },
    {
      question: `${s} scholarship ki last date kya hai?`,
      answer: 'Usually October-December mein applications start hoti hain. Fresh aur renewal dono ke liye alag dates hoti hain. Regular updates check karte rahiye.'
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
        { label: 'Scholarship', href: '/scholarship' },
        { label: s },
      ]} />
      
      <SectionHeader
        title={`Sarkari Naukri in ${s} — Scholarship Schemes`}
        subtitle={`${pagination.total} scholarships in ${s}`}
        icon="💰"
      />

      {/* State Description */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-ink mb-3">{s} Scholarship Schemes 2026</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          {s} ke students ke liye latest government scholarship schemes ki complete information. 
          Central aur state government dono ki scholarships, eligibility criteria, application 
          process, aur amount ki details yahan available hain.
        </p>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{pagination.total}</div>
            <div className="text-xs text-muted">Total Scholarships</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">
              {latestJobDate ? latestJobDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
            </div>
            <div className="text-xs text-muted">Latest Update</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Central + State</div>
            <div className="text-xs text-muted">Government</div>
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
          <h3 className="text-lg font-bold text-ink mb-3">Nearby States Scholarships</h3>
          <p className="text-sm text-muted mb-4">
            {s} ke neighboring states mein bhi scholarship schemes check kariye:
          </p>
          <div className="flex flex-wrap gap-2">
            {neighboringStates.slice(0, 6).map((neighborState) => (
              <a
                key={neighborState}
                href={`/scholarship/state/${encodeURIComponent(neighborState)}`}
                className="inline-flex items-center px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-sm text-ink transition-colors"
              >
                💰 {neighborState}
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
          <p className="mt-4 font-bold text-muted">{s} mein abhi koi scholarship updates nahi hain</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath={`/scholarship/state/${state}`} />

      {/* FAQ Section */}
      <div className="mt-8">
        <FAQ items={scholarshipStateFAQ} title={`${s} Scholarship - FAQ`} />
      </div>
    </div>
  );
}
