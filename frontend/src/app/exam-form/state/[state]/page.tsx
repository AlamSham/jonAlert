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
    title: `Sarkari Naukri in ${s} — Exam Forms & Registration ${s} 2026`,
    description: generateCategoryMetaDescription('exam-form', s),
    alternates: { canonical: `/exam-form/state/${encodeURIComponent(s)}` },
  };
}

export default async function ExamFormStatePage({ params, searchParams }: Props) {
  const { state } = await params;
  const sp = await searchParams;
  const s = decodeURIComponent(state);
  const page = Math.max(1, Number(sp.page) || 1);
  const { data: jobs, pagination } = await getJobsByState(s, page, 18, 'exam-form');

  // Get neighboring states
  const neighboringStates = getNeighboringStates(s);

  // Calculate statistics
  const latestJobDate = jobs.length > 0 ? new Date(Math.max(...jobs.map(job => new Date(job.createdAt).getTime()))) : null;

  // Generate structured data
  const collectionPageSchema = generateCollectionPageSchema('exam-form', jobs, pagination.total);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Exam Form', url: '/exam-form' },
    { name: s, url: `/exam-form/state/${state}` }
  ]);
  const localBusinessSchema = generateLocalBusinessSchema(s);

  // FAQ data for state-specific exam forms
  const examFormStateFAQ: FAQItem[] = [
    {
      question: `${s} mein kya exam forms available hain?`,
      answer: `${s} mein board exams, competitive exams, university exams, aur professional course exams ke forms available hain. State board aur central board dono ke forms milte hain.`
    },
    {
      question: `${s} board exam form kaise bharein?`,
      answer: `${s} board ki official website par jaayiye, student login kariye, exam form section mein jaayiye, details bhariye, documents upload kariye, aur fee payment kar diye.`
    },
    {
      question: `${s} exam form ki fees kitni hoti hai?`,
      answer: 'Board exams: ₹100-500, Competitive exams: ₹200-1500, University exams: ₹300-1000. SC/ST candidates ko fee exemption milti hai.'
    },
    {
      question: `${s} exam form ki last date kab tak hoti hai?`,
      answer: 'Board exams: September-October, Competitive exams: varies, University exams: course ke according. Late fee ke saath extended dates bhi milti hain.'
    },
    {
      question: `${s} exam form mein correction kar sakte hain?`,
      answer: 'Haan, usually correction window available hoti hai. Limited fields correct kar sakte hain with correction fee. Time limit ke andar correction kariye.'
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
        { label: 'Exam Form', href: '/exam-form' },
        { label: s },
      ]} />
      
      <SectionHeader
        title={`Sarkari Naukri in ${s} — Exam Forms`}
        subtitle={`${pagination.total} exam forms in ${s}`}
        icon="📝"
      />

      {/* State Description */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-ink mb-3">{s} Exam Forms & Registration 2026</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          {s} ke sabhi exam forms ki complete information yahan milti hai. Board exams, 
          competitive exams, university exams - sabke registration links, eligibility, 
          documents requirement aur step-by-step form filling process available hai.
        </p>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{pagination.total}</div>
            <div className="text-xs text-muted">Total Forms</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">
              {latestJobDate ? latestJobDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
            </div>
            <div className="text-xs text-muted">Latest Update</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Step-by-Step</div>
            <div className="text-xs text-muted">Guidance</div>
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
          <h3 className="text-lg font-bold text-ink mb-3">Nearby States Exam Forms</h3>
          <p className="text-sm text-muted mb-4">
            {s} ke neighboring states mein bhi exam forms check kariye:
          </p>
          <div className="flex flex-wrap gap-2">
            {neighboringStates.slice(0, 6).map((neighborState) => (
              <a
                key={neighborState}
                href={`/exam-form/state/${encodeURIComponent(neighborState)}`}
                className="inline-flex items-center px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-sm text-ink transition-colors"
              >
                📝 {neighborState}
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
          <p className="mt-4 font-bold text-muted">{s} mein abhi koi exam form updates nahi hain</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath={`/exam-form/state/${state}`} />

      {/* FAQ Section */}
      <div className="mt-8">
        <FAQ items={examFormStateFAQ} title={`${s} Exam Form - FAQ`} />
      </div>
    </div>
  );
}
