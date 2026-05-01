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
    const result = await getJobsByCategory('admit-card', page, 18);
    pagination = result.pagination;
  } catch (error) {
    console.error('Failed to fetch admit cards for metadata:', error);
  }
  
  const metadata: Metadata = {
    title: page > 1 
      ? `🎫 Admit Card Page ${page} - Latest Hall Tickets 2026 | SarkariPulse`
      : '🎫 Latest Admit Card 2026 - Hall Ticket Download, Exam Center | SarkariPulse',
    description: page > 1 
      ? `Page ${page} - Latest admit cards, hall ticket download, exam center details. ${pagination.total}+ admit cards available. Download now!`
      : `⚡ URGENT: Latest Admit Card 2026! ${pagination.total}+ hall tickets available. Download now - exam dates approaching! Print karke exam center jaayiye! 🚨`,
    keywords: [
      'admit card', 'hall ticket', 'admit card download', 'exam center', 'hall ticket download',
      'admit card 2026', 'sarkari admit card', 'admit card kaise download kare',
      'SSC admit card', 'UPSC admit card', 'Railway admit card', 'Banking admit card',
      'hall ticket kaise download kare', 'exam center kaise check kare', 'reporting time',
      'exam instructions', 'admit card print', 'exam date', 'exam timing'
    ],
    alternates: { 
      canonical: page > 1 ? `https://sarkaripulse.net/admit-card?page=${page}` : 'https://sarkaripulse.net/admit-card'
    },
    openGraph: {
      title: page > 1 ? `Admit Card — Page ${page}` : 'Latest Admit Card 2026 - Hall Ticket Download',
      description: `Latest admit cards, hall ticket download, exam center details. ${pagination.total}+ admit cards available.`,
      type: 'website',
      locale: 'hi_IN',
      siteName: 'SarkariPulse',
      images: [
        {
          url: `https://sarkaripulse.net/api/og?title=Admit%20Card&subtitle=Hall%20Ticket%20Download%202026`,
          width: 1200,
          height: 630,
          alt: 'Latest Admit Card 2026 - Hall Ticket Download',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page > 1 ? `Admit Card — Page ${page}` : 'Latest Admit Card 2026',
      description: `Hall ticket download, exam center details. ${pagination.total}+ admit cards available.`,
    },
  };

  // Add pagination link tags
  if (pagination.hasNext || pagination.hasPrev) {
    metadata.other = {};
    if (pagination.hasPrev) {
      const prevPage = page - 1;
      metadata.other['link-prev'] = prevPage === 1 ? '/admit-card' : `/admit-card?page=${prevPage}`;
    }
    if (pagination.hasNext) {
      metadata.other['link-next'] = `/admit-card?page=${page + 1}`;
    }
  }

  return metadata;
}

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

  // Enhanced FAQ data for admit-card category with more questions
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
    },
    {
      question: 'Admit card kab release hoti hai?',
      answer: 'Usually exam se 7-15 din pehle admit card release hoti hai. Exact date official notification mein di jaati hai. SarkariPulse par instant notification mil jaata hai.'
    },
    {
      question: 'Exam center kaise pata karein?',
      answer: 'Admit card mein exam center ka complete address, landmark aur contact details di jaati hai. Google Maps use karke route plan kar sakte hain. Pehle se visit kar liye better hai.'
    },
    {
      question: 'Reporting time kya hota hai?',
      answer: 'Reporting time wo time hai jab aap ko exam center pahunchna hai. Usually exam start se 30-60 minute pehle. Late entry allowed nahi hoti, so time se pahunchiye.'
    },
    {
      question: 'Admit card ke saath kya documents chahiye?',
      answer: 'Original photo ID proof (Aadhar, PAN, Driving License, Passport) zaroori hai. Admit card mein mentioned documents ki list check kariye. Photocopy bhi le jaayiye.'
    },
    {
      question: 'Kya mobile phone exam center le ja sakte hain?',
      answer: 'Nahi! Mobile phone, calculator, watch, aur electronic items strictly prohibited hain. Sirf admit card, ID proof, aur allowed stationery le ja sakte hain.'
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
        <h2 className="text-lg font-bold text-ink mb-3">🎫 Latest Admit Card Downloads 2026</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          ⚡ <strong>URGENT:</strong> Sabhi government exams ke admit cards yahan milte hain! SSC, UPSC, Railway, Banking, 
          Police, State PSC - sabke hall tickets, exam center details, reporting time aur 
          important instructions ki complete information available hai. <strong>Jaldi download kariye - exam dates approaching!</strong>
        </p>
        
        {/* Enhanced Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{pagination.total.toLocaleString('en-IN')}</div>
            <div className="text-xs text-muted">Total Admit Cards</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">⚡ Instant</div>
            <div className="text-xs text-muted">Downloads</div>
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
            📄 Instant Download
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            📍 Exam Center Details
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            ⏰ Reporting Time
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
            📋 Exam Instructions
          </span>
        </div>

        {/* Important Notice */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 text-lg">⚠️</span>
            <div>
              <p className="text-sm font-medium text-yellow-800">Important Notice:</p>
              <p className="text-xs text-yellow-700 mt-1">
                Bina admit card ke exam center mein entry nahi milti! Download karke clear print kar liye. 
                Exam ke din original admit card aur photo ID saath le jaayiye.
              </p>
            </div>
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
