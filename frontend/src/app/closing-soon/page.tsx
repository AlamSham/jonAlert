import { Metadata } from 'next';
import { getClosingSoonJobs } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { Pagination } from '@/components/Pagination';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHeader } from '@/components/SectionHeader';
import { FAQ } from '@/components/FAQ';
import { breadcrumbJsonLd } from '@/lib/seo';
import { FAQItem } from '@/lib/internal-links';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Govt Jobs Closing Soon 2026 — Last Date to Apply Today/This Week',
  description: 'Apply before last date! List of government jobs and exams closing soon this week. Check departments, vacancy details, last dates, and direct links to apply.',
  alternates: { canonical: '/closing-soon' },
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function ClosingSoonPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { data: jobs, pagination } = await getClosingSoonJobs(page, 18);

  // Breadcrumb schema
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Closing Soon', url: '/closing-soon' }
  ]);

  // Structured Data for CollectionPage
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'Govt Jobs Closing Soon 2026 — Last Date to Apply Today/This Week',
    'description': 'Latest government jobs whose application deadline is closing within the next 7-10 days.',
    'url': 'https://sarkaripulse.net/closing-soon',
  };

  const closingSoonFAQ: FAQItem[] = [
    {
      question: 'Closing Soon category me kaunsi jobs aati hain?',
      answer: 'Yahan wahi government jobs, exam forms aur admissions show hote hain jinki apply karne ki aakhri tareek (last date) agle 10 dino ke andar hai.'
    },
    {
      question: 'Kya application date badhne par list update hoti hai?',
      answer: 'Haan, agar kisi department dwara online form apply karne ki last date extend ki jaati hai, toh hamara system use update kar deta hai aur wo job standard list me chali jaati hai.'
    },
    {
      question: 'Kya aakhri din form bharna safe hai?',
      answer: 'Nahi, aakhri dino me server down ya payment failure ke problems ho sakte hain. Hum highly recommend karte hain ki aap last date se 2-3 din pehle hi apply kar lein.'
    },
    {
      question: 'Online payment fasne par kya karein?',
      answer: 'Agar aakhri dino me transaction fail hota hai, toh double verification page check karein aur portal par diye helpdesk number/email par contact karein. Zyadatar websites double payment update hone me 24-48 ghante leti hain.'
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

      <Breadcrumb items={[{ label: 'Closing Soon' }]} />
      
      <SectionHeader
        title="Closing Soon (Last Date Apply)"
        subtitle={`${pagination.total} active jobs closing in next 10 days`}
        icon="⏰"
      />

      {/* Urgency/Warning Banner */}
      <div className="card mb-6 border-l-4 border-l-red-500 bg-red-50/50">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">⚠️</span>
          <div>
            <h2 className="text-md font-bold text-red-800 mb-1">
              Time is running out! Jaldi Apply Karein!
            </h2>
            <p className="text-xs text-red-700 leading-relaxed">
              Niche di gayi sabhi jobs ki application last date bilkul pass hai. Server load badhne se official website down ho sakti hai, isliye aakhri date ka intezar na karein aur aaj hi apna form complete karein.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job, i) => (
          <JobCard key={job.slug} job={job} index={i} />
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="py-20 text-center card bg-stone-50/50">
          <p className="text-5xl">🎉</p>
          <p className="mt-4 font-bold text-ink">Abhi koi immediate closing notification nahi hai</p>
          <p className="mt-2 text-sm text-muted">Sabhi active jobs ke paas apply karne ke liye paryapt samay hai.</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath="/closing-soon" />

      {/* FAQ Section */}
      <div className="mt-8">
        <FAQ items={closingSoonFAQ} title="Application Last Date - Frequently Asked Questions" />
      </div>
    </div>
  );
}
