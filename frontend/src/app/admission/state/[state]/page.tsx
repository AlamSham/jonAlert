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

export const revalidate = 3600;

type Props = {
  params: Promise<{ state: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const s = decodeURIComponent(state);
  return {
    title: `Sarkari Naukri in ${s} — College Admission ${s} 2026`,
    description: generateCategoryMetaDescription('admission', s),
    alternates: { canonical: `/admission/state/${encodeURIComponent(s)}` },
  };
}

export default async function AdmissionStatePage({ params, searchParams }: Props) {
  const { state } = await params;
  const sp = await searchParams;
  const s = decodeURIComponent(state);
  const page = Math.max(1, Number(sp.page) || 1);
  const { data: jobs, pagination } = await getJobsByState(s, page, 18, 'admission');

  // Get neighboring states
  const neighboringStates = getNeighboringStates(s);

  // Calculate statistics
  const latestJobDate = jobs.length > 0 ? new Date(Math.max(...jobs.map(job => new Date(job.createdAt).getTime()))) : null;

  // Generate structured data
  const collectionPageSchema = generateCollectionPageSchema('admission', jobs, pagination.total);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Admission', url: '/admission' },
    { name: s, url: `/admission/state/${state}` }
  ]);
  const localBusinessSchema = generateLocalBusinessSchema(s);

  // FAQ data for state-specific admissions
  const admissionStateFAQ: FAQItem[] = [
    {
      question: `${s} mein college admission kaise karein?`,
      answer: `${s} ke colleges mein admission ke liye state ki official website check kariye, entrance exams (agar required hai) clear kariye, aur counselling process follow kariye.`
    },
    {
      question: `${s} ke top colleges kaun se hain?`,
      answer: `${s} mein government universities, medical colleges, engineering colleges, aur arts/commerce colleges available hain. State university aur central universities dono options hain.`
    },
    {
      question: `${s} mein admission ki fees kitni hoti hai?`,
      answer: 'Government colleges mein fees kam hoti hai (₹5,000-50,000 per year), private colleges mein zyada (₹50,000-5,00,000+). Scholarship options bhi available hain.'
    },
    {
      question: `${s} admission counselling kab hoti hai?`,
      answer: 'Usually June-August mein counselling process hoti hai. Merit list, document verification, seat allotment, aur fee payment - ye sab steps hote hain.'
    },
    {
      question: `${s} ke colleges mein reservation policy kya hai?`,
      answer: 'State government ki reservation policy follow hoti hai. SC/ST/OBC/EWS categories ke liye seats reserved hoti hain. Domicile certificate required hota hai.'
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
        { label: 'Admission', href: '/admission' },
        { label: s },
      ]} />
      
      <SectionHeader
        title={`Sarkari Naukri in ${s} — Admission Updates`}
        subtitle={`${pagination.total} admission notifications in ${s}`}
        icon="🎓"
      />

      {/* State Description */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-ink mb-3">{s} College Admission 2026</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          {s} ke sabhi colleges aur universities ke latest admission notifications yahan milte hain. 
          Government colleges, private colleges, medical, engineering, arts, commerce - har stream 
          ke admission updates regular basis par available hain.
        </p>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{pagination.total}</div>
            <div className="text-xs text-muted">Total Admissions</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">
              {latestJobDate ? latestJobDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
            </div>
            <div className="text-xs text-muted">Latest Update</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Govt + Private</div>
            <div className="text-xs text-muted">Colleges</div>
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
          <h3 className="text-lg font-bold text-ink mb-3">Nearby States Admissions</h3>
          <p className="text-sm text-muted mb-4">
            {s} ke neighboring states mein bhi college admissions check kariye:
          </p>
          <div className="flex flex-wrap gap-2">
            {neighboringStates.slice(0, 6).map((neighborState) => (
              <a
                key={neighborState}
                href={`/admission/state/${encodeURIComponent(neighborState)}`}
                className="inline-flex items-center px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-sm text-ink transition-colors"
              >
                🎓 {neighborState}
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
          <p className="mt-4 font-bold text-muted">{s} mein abhi koi admission updates nahi hain</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath={`/admission/state/${state}`} />

      {/* FAQ Section */}
      <div className="mt-8">
        <FAQ items={admissionStateFAQ} title={`${s} College Admission - FAQ`} />
      </div>
    </div>
  );
}
