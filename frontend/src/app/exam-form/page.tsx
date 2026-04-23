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
  title: 'Exam Form — Latest Application Forms & Registration 2026',
  description: generateCategoryMetaDescription('exam-form'),
  alternates: { canonical: '/exam-form' },
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function ExamFormPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { data: jobs, pagination } = await getJobsByCategory('exam-form', page, 18);

  // Generate structured data
  const collectionPageSchema = generateCollectionPageSchema('exam-form', jobs, pagination.total);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Exam Form', url: '/exam-form' }
  ]);

  // FAQ data for exam-form category
  const examFormFAQ: FAQItem[] = [
    {
      question: 'Online exam form kaise bharein?',
      answer: 'Official website par jaayiye, "Apply Online" link par click kariye, registration kariye, personal details bhariye, documents upload kariye, fee payment kariye, aur form submit kar diye.'
    },
    {
      question: 'Exam form ke liye kya documents chahiye?',
      answer: 'Photo, signature, 10th/12th marksheet, caste certificate (if applicable), income certificate, Aadhaar card, aur passport size photos. Specific requirements notification mein check kariye.'
    },
    {
      question: 'Application fee kitni hoti hai?',
      answer: 'Fee exam ke type par depend karti hai. Usually ₹100-1500 tak hoti hai. SC/ST candidates ko fee exemption milti hai. Online payment (debit/credit card, net banking) kar sakte hain.'
    },
    {
      question: 'Form submit karne ke baad correction kar sakte hain?',
      answer: 'Haan, usually correction window available hoti hai. Limited time mein specific fields correct kar sakte hain. Correction fee bhi lag sakti hai.'
    },
    {
      question: 'Form ki last date miss ho gayi to kya karein?',
      answer: 'Last date ke baad form submit nahi kar sakte. Kuch exams mein late fee ke saath extended date milti hai. Next cycle ka wait karna padega.'
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

      <Breadcrumb items={[{ label: 'Exam Form' }]} />
      
      <SectionHeader
        title="Exam Forms & Registration"
        subtitle={`${pagination.total} exam form updates available`}
        icon="📝"
      />

      {/* Category Description */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-ink mb-3">Latest Exam Forms & Registration 2026</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Sabhi competitive exams ke application forms yahan milte hain. Board exams, UPSC, SSC, 
          NEET, JEE, University exams - sabke registration links, eligibility criteria, 
          documents requirement aur step-by-step form filling process ki details available hai.
        </p>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{pagination.total}</div>
            <div className="text-xs text-muted">Total Forms</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Step-by-Step</div>
            <div className="text-xs text-muted">Guidance</div>
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
          <p className="mt-4 font-bold text-muted">Koi exam form updates abhi available nahi hain</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath="/exam-form" />

      {/* FAQ Section */}
      <div className="mt-8">
        <FAQ items={examFormFAQ} title="Exam Form - Frequently Asked Questions" />
      </div>
    </div>
  );
}
