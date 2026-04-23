import { Metadata } from 'next';
import { getJobsByCategory } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { Pagination } from '@/components/Pagination';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHeader } from '@/components/SectionHeader';
import { FAQ } from '@/components/FAQ';
import { 
  generateCollectionPageSchema, 
  breadcrumbJsonLd, 
  generateCategoryMetaDescription 
} from '@/lib/seo';
import { FAQItem } from '@/lib/internal-links';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Sarkari Result — Latest Exam Results & Scorecards 2026',
  description: generateCategoryMetaDescription('result'),
  alternates: { canonical: '/result' },
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function ResultPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { data: jobs, pagination } = await getJobsByCategory('result', page, 18);

  // Generate structured data
  const collectionPageSchema = generateCollectionPageSchema('result', jobs, pagination.total);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Result', url: '/result' }
  ]);

  // FAQ data for result category
  const resultFAQ: FAQItem[] = [
    {
      question: 'Sarkari exam result kaise check karein?',
      answer: 'Official website par jaayiye, result link par click kariye, roll number/registration number enter kariye, aur submit button dabayiye. Result screen par aa jaayega.'
    },
    {
      question: 'Result mein kya information milti hai?',
      answer: 'Roll number, candidate name, marks obtained, total marks, percentage/grade, rank (agar applicable hai), aur qualifying status (Pass/Fail) ki information milti hai.'
    },
    {
      question: 'Scorecard download kaise karein?',
      answer: 'Result check karne ke baad "Download Scorecard" option par click kariye. PDF file download ho jaayegi. Print kar ke safe rakhiye.'
    },
    {
      question: 'Cut-off marks kya hote hain?',
      answer: 'Cut-off marks minimum qualifying marks hote hain jo pass hone ke liye zaroori hain. Ye category wise alag hote hain (General, OBC, SC, ST).'
    },
    {
      question: 'Result mein discrepancy hai to kya karein?',
      answer: 'Official website par grievance/complaint section mein jaayiye, form bhariye, supporting documents attach kariye, aur submit kar diye. Time limit ke andar complaint kariye.'
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

      <Breadcrumb items={[{ label: 'Results' }]} />
      
      <SectionHeader
        title="Sarkari Results"
        subtitle={`${pagination.total} results available`}
        icon="📊"
      />

      {/* Category Description */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-ink mb-3">Latest Sarkari Exam Results 2026</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Sabhi government exams ke latest results yahan milte hain. SSC, UPSC, Railway, Banking, 
          Police, State PSC - sabke results, scorecards, merit lists, cut-off marks aur 
          answer keys ki complete information available hai.
        </p>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{pagination.total}</div>
            <div className="text-xs text-muted">Total Results</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Instant</div>
            <div className="text-xs text-muted">Updates</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">All Exams</div>
            <div className="text-xs text-muted">Coverage</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Direct</div>
            <div className="text-xs text-muted">Links</div>
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
          <p className="mt-4 font-bold text-muted">Koi results abhi available nahi hain</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath="/result" />

      {/* FAQ Section */}
      <div className="mt-8">
        <FAQ items={resultFAQ} title="Sarkari Result - Frequently Asked Questions" />
      </div>
    </div>
  );
}
