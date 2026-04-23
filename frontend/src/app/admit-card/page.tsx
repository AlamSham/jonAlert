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
  title: 'Admit Card Download — Latest Exam Hall Tickets 2026',
  description: generateCategoryMetaDescription('admit-card'),
  alternates: { canonical: '/admit-card' },
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdmitCardPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { data: jobs, pagination } = await getJobsByCategory('admit-card', page, 18);

  // Generate structured data
  const collectionPageSchema = generateCollectionPageSchema('admit-card', jobs, pagination.total);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Admit Card', url: '/admit-card' }
  ]);

  // FAQ data for admit-card category
  const admitCardFAQ: FAQItem[] = [
    {
      question: 'Admit card download kaise karein?',
      answer: 'Official website par jaayiye, "Download Admit Card" link par click kariye, registration number aur date of birth enter kariye, captcha fill kariye, aur download button dabayiye.'
    },
    {
      question: 'Admit card mein kya information hoti hai?',
      answer: 'Candidate ka naam, photo, signature, roll number, exam center address, exam date aur time, reporting time, aur exam instructions ki complete details hoti hai.'
    },
    {
      question: 'Admit card print karna zaroori hai?',
      answer: 'Haan bilkul! Bina admit card ke exam center mein entry nahi milti. Clear print kariye aur exam ke din saath le jaayiye. Mobile mein soft copy bhi rakh sakte hain backup ke liye.'
    },
    {
      question: 'Admit card mein error hai to kya karein?',
      answer: 'Turant official website par helpline number par call kariye ya email kariye. Correction window agar available hai to online correction kar sakte hain.'
    },
    {
      question: 'Exam center change kar sakte hain?',
      answer: 'Usually exam center change nahi hota. Sirf special circumstances mein (medical emergency, natural disaster) change possible hai. Official notification check kariye.'
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

      <Breadcrumb items={[{ label: 'Admit Cards' }]} />
      
      <SectionHeader
        title="Admit Card Download"
        subtitle={`${pagination.total} admit cards available`}
        icon="🎫"
      />

      {/* Category Description */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-ink mb-3">Latest Admit Card Downloads 2026</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Sabhi government exams ke admit cards yahan milte hain. SSC, UPSC, Railway, Banking, 
          Police, State PSC - sabke hall tickets, exam center details, reporting time aur 
          important instructions ki complete information available hai.
        </p>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{pagination.total}</div>
            <div className="text-xs text-muted">Total Admit Cards</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Instant</div>
            <div className="text-xs text-muted">Downloads</div>
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
          <p className="mt-4 font-bold text-muted">Koi admit cards abhi available nahi hain</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath="/admit-card" />

      {/* FAQ Section */}
      <div className="mt-8">
        <FAQ items={admitCardFAQ} title="Admit Card - Frequently Asked Questions" />
      </div>
    </div>
  );
}
