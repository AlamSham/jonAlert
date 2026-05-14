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

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  
  // Get pagination info for dynamic optimization
  let pagination = {
    page: 1,
    limit: 18,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  };

  try {
    const result = await getJobsByCategory('result', page, 18);
    pagination = result.pagination;
  } catch (error) {
    console.error('Failed to fetch results for metadata:', error);
  }
  
  const metadata: Metadata = {
    title: page > 1 
      ? `🔥 Sarkari Result Page ${page} - Latest Exam Results 2026 | SarkariPulse`
      : '🔥 Latest Sarkari Result 2026 - Exam Results, Scorecard Download | SarkariPulse',
    description: page > 1 
      ? `Page ${page} - Latest sarkari exam results, scorecard download, merit list. ${pagination.total}+ results available. Check now!`
      : `⚡ BREAKING: Latest Sarkari Result 2026! ${pagination.total}+ exam results, scorecard download, merit list, cut-off marks. Check apna result now! 🚨`,
    keywords: [
      'sarkari result', 'exam result', 'scorecard download', 'merit list', 'cut-off marks',
      'sarkari result 2026', 'government exam result', 'result check kaise karein',
      'SSC result', 'UPSC result', 'Railway result', 'Banking result', 'Police result',
      'result kaise check kare', 'scorecard kaise download kare', 'merit list kaise dekhe',
      'answer key', 'result date', 'passing marks', 'qualifying marks'
    ],
    alternates: { 
      canonical: page > 1 ? `https://sarkaripulse.net/result?page=${page}` : 'https://sarkaripulse.net/result'
    },
    openGraph: {
      title: page > 1 ? `Sarkari Result — Page ${page}` : 'Latest Sarkari Result 2026 - Exam Results & Scorecards',
      description: `Latest government exam results, scorecard download, merit list. ${pagination.total}+ results available.`,
      type: 'website',
      locale: 'hi_IN',
      siteName: 'SarkariPulse',
      images: [
        {
          url: 'https://sarkaripulse.net/logo.jpg',
          width: 1024,
          height: 1024,
          alt: 'Latest Sarkari Result 2026 - Exam Results & Scorecards',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page > 1 ? `Sarkari Result — Page ${page}` : 'Latest Sarkari Result 2026',
      description: `Latest exam results, scorecard download. ${pagination.total}+ results available.`,
      images: ['https://sarkaripulse.net/logo.jpg'],
    },
  };

  // Add pagination link tags
  if (pagination.hasNext || pagination.hasPrev) {
    metadata.other = {};
    if (pagination.hasPrev) {
      const prevPage = page - 1;
      metadata.other['link-prev'] = prevPage === 1 ? '/result' : `/result?page=${prevPage}`;
    }
    if (pagination.hasNext) {
      metadata.other['link-next'] = `/result?page=${page + 1}`;
    }
  }

  return metadata;
}

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

  // Enhanced FAQ data for result category with more questions
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
    },
    {
      question: 'Merit list kaise check karein?',
      answer: 'Result declare hone ke baad merit list bhi publish hoti hai. Official website par "Merit List" ya "Final Result" section check kariye. Category wise merit list available hoti hai.'
    },
    {
      question: 'Answer key kab release hoti hai?',
      answer: 'Usually exam ke 2-3 din baad provisional answer key release hoti hai. Final answer key result ke saath ya usse pehle aati hai. Objection window bhi milti hai.'
    },
    {
      question: 'Result ki validity kitni hoti hai?',
      answer: 'Government exam results ki validity usually 1-2 saal hoti hai. Kuch exams mein permanent validity hoti hai. Official notification mein validity period clearly mentioned hoti hai.'
    },
    {
      question: 'Kya SarkariPulse par sabse pehle result milta hai?',
      answer: 'Haan! Humara AI system har 10 minute mein official websites check karta hai. Result declare hote hi instantly notification mil jaata hai. 50,000+ students trust karte hain.'
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
        <h2 className="text-lg font-bold text-ink mb-3">🔥 Latest Sarkari Exam Results 2026</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          ⚡ <strong>BREAKING:</strong> Sabhi government exams ke latest results yahan milte hain! SSC, UPSC, Railway, Banking, 
          Police, State PSC - sabke results, scorecards, merit lists, cut-off marks aur 
          answer keys ki complete information available hai. <strong>Apna result check karein - bilkul free!</strong>
        </p>
        
        {/* Enhanced Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{pagination.total.toLocaleString('en-IN')}</div>
            <div className="text-xs text-muted">Total Results</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">⚡ Instant</div>
            <div className="text-xs text-muted">Updates</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">🏆 All Exams</div>
            <div className="text-xs text-muted">Coverage</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">🔗 Direct</div>
            <div className="text-xs text-muted">Links</div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            📊 Merit List Available
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            💯 Cut-off Marks
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            📄 Scorecard Download
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
            🔑 Answer Keys
          </span>
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
