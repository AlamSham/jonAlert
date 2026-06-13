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
  title: 'College Admission — Latest Admission Notifications 2026',
  description: generateCategoryMetaDescription('admission'),
  alternates: { canonical: '/admission' },
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdmissionPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { data: jobs, pagination } = await getJobsByCategory('admission', page, 18);

  // Generate structured data
  const collectionPageSchema = generateCollectionPageSchema('admission', jobs, pagination.total);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Admission', url: '/admission' }
  ]);

  // FAQ data for admission category
  const admissionFAQ: FAQItem[] = [
    {
      question: 'College admission ke liye kya documents chahiye?',
      answer: '10th/12th marksheet, transfer certificate, character certificate, caste certificate (if applicable), income certificate, passport size photos, aur Aadhaar card. Specific requirements har college ki alag hoti hain.'
    },
    {
      question: 'Admission form kaise bharen?',
      answer: 'College ki official website par jaayiye, online application form bhariye, documents upload kariye, application fee pay kariye, aur form submit kar diye. Receipt save kar liye.'
    },
    {
      question: 'Admission ki last date kab tak hoti hai?',
      answer: 'Har college ki admission dates alag hoti hain. Usually June-July mein most admissions hote hain. Latest dates ke liye notification check karte rahiye.'
    },
    {
      question: 'Kya entrance exam dena padta hai?',
      answer: 'Kuch colleges mein entrance exam hota hai (JEE, NEET, CUET etc.), kuch mein merit basis par admission hota hai. College ki requirement check kariye.'
    },
    {
      question: 'Admission counselling kya hoti hai?',
      answer: 'Counselling mein seat allotment hoti hai rank/marks ke basis par. Document verification, seat selection, aur fee payment counselling mein hota hai.'
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

      <Breadcrumb items={[{ label: 'Admission' }]} />
      
      <SectionHeader
        title="College Admission Updates"
        subtitle={`${pagination.total} admission notifications available`}
        icon="🎓"
      />

      {/* Category Description */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-ink mb-3">Latest College Admission 2026</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Top colleges aur universities ke latest admission notifications yahan milte hain. DU, JNU, BHU, IGNOU, 
          IIT, NIT, Medical colleges, Engineering colleges - sabke admission updates, eligibility criteria, 
          application process, aur important dates complete details ke saath.
        </p>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{pagination.total}</div>
            <div className="text-xs text-muted">Total Admissions</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Daily</div>
            <div className="text-xs text-muted">Updates</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">All India</div>
            <div className="text-xs text-muted">Coverage</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">Free</div>
            <div className="text-xs text-muted">Alerts</div>
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
          <p className="mt-4 font-bold text-muted">Koi admission notifications abhi available nahi hain</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath="/admission" />

      {/* FAQ Section */}
      <div className="mt-8">
        <FAQ items={admissionFAQ} title="College Admission - Frequently Asked Questions" />
      </div>
    </div>
  );
}
