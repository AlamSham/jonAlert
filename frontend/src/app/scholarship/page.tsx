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

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Scholarship — Latest Sarkari Scholarship Schemes 2026',
  description: generateCategoryMetaDescription('scholarship'),
  alternates: { canonical: '/scholarship' },
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function ScholarshipPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { data: jobs, pagination } = await getJobsByCategory('scholarship', page, 18);

  // Generate structured data
  const collectionPageSchema = generateCollectionPageSchema('scholarship', jobs, pagination.total);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Scholarship', url: '/scholarship' }
  ]);

  // FAQ data for scholarship category
  const scholarshipFAQ: FAQItem[] = [
    {
      question: 'Government scholarship ke liye kya eligibility hai?',
      answer: 'Family income limit (usually 2-8 lakh per annum), academic performance (minimum 50-60% marks), aur category requirements (SC/ST/OBC/Minority/General). Har scheme ki alag criteria hoti hai.'
    },
    {
      question: 'Scholarship application kaise submit karein?',
      answer: 'NSP portal (scholarships.gov.in) par registration kariye, personal details bhariye, documents upload kariye, bank details add kariye, aur application submit kar diye. Institute verification bhi zaroori hai.'
    },
    {
      question: 'Scholarship ki amount kitni milti hai?',
      answer: 'Pre-matric: ₹1,000-3,000 per year, Post-matric: ₹2,000-12,000 per year, Merit-cum-means: ₹20,000-50,000 per year. Amount course aur category ke basis par vary hoti hai.'
    },
    {
      question: 'Scholarship renewal kaise karein?',
      answer: 'Har year fresh application submit karna padta hai. Previous year ki marksheet, attendance certificate, aur updated documents ke saath renewal form bhariye.'
    },
    {
      question: 'Scholarship amount kab milti hai?',
      answer: 'Usually 3-6 months mein scholarship amount bank account mein aa jaati hai. DBT (Direct Benefit Transfer) ke through seedha bank account mein transfer hoti hai.'
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

      <Breadcrumb items={[{ label: 'Scholarship' }]} />
      
      <SectionHeader
        title="Scholarship Schemes"
        subtitle={`${pagination.total} scholarship updates available`}
        icon="💰"
      />

      {/* Category Description */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-ink mb-3">Latest Government Scholarship 2026</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Students ke liye latest government scholarship schemes ki complete information. NSP Portal, 
          Post Matric, Pre Matric, Merit-cum-Means, Minority scholarships - sabki eligibility, 
          application process, documents, aur last dates ki details yahan milti hain.
        </p>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{pagination.total}</div>
            <div className="text-xs text-muted">Total Scholarships</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">NSP</div>
            <div className="text-xs text-muted">Portal Updates</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">All Categories</div>
            <div className="text-xs text-muted">SC/ST/OBC/General</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Free</div>
            <div className="text-xs text-muted">Guidance</div>
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
          <p className="mt-4 font-bold text-muted">Koi scholarship updates abhi available nahi hain</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath="/scholarship" />

      {/* FAQ Section */}
      <div className="mt-8">
        <FAQ items={scholarshipFAQ} title="Scholarship - Frequently Asked Questions" />
      </div>
    </div>
  );
}
