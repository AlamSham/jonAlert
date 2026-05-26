import { Metadata } from 'next';
import { getTodayJobs } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { Pagination } from '@/components/Pagination';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHeader } from '@/components/SectionHeader';
import { FAQ } from '@/components/FAQ';
import { breadcrumbJsonLd } from '@/lib/seo';
import { FAQItem } from '@/lib/internal-links';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const currentDateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return {
    title: `Aaj Ki Naukri (${currentDateStr}) — Latest Govt Jobs Today`,
    description: `Daily updated government jobs for ${currentDateStr}. Check latest sarkari jobs, admit cards, results, and admissions notifications released today.`,
    alternates: { canonical: '/today' },
  };
}

type Props = { searchParams: Promise<{ page?: string }> };

export default async function TodayPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { data: jobs, pagination } = await getTodayJobs(page, 18);

  const currentDateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Breadcrumb schema
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Aaj Ki Naukri', url: '/today' }
  ]);

  // Structured Data for CollectionPage
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': `Aaj Ki Naukri (${currentDateStr}) — Latest Govt Jobs Today`,
    'description': `Latest government jobs, admit cards, and results announced today: ${currentDateStr}`,
    'url': 'https://sarkaripulse.net/today',
  };

  const todayFAQ: FAQItem[] = [
    {
      question: 'Aaj Ki Naukri page par kaunsi jobs milti hain?',
      answer: 'Yahan har roz release hone wali latest sarkari naukri, admit cards, results, admission, scholarship, aur exam forms ki list sabse pehle update hoti hai.'
    },
    {
      question: 'Sarkari jobs ki list kitni baar update hoti hai?',
      answer: 'Hamara system har 10-15 minute me alag-alag government departments ki official websites scan karta hai aur naye notifications turant yahan publish karta hai.'
    },
    {
      question: 'Aaj ki notifications ka apply link kahan milega?',
      answer: 'Aap kisi bhi job title par click karke detailed notification page par ja sakte hain, jahan official apply link aur detailed advertisement PDF available hota hai.'
    },
    {
      question: 'Kya main state-wise notifications bhi dekh sakta hoon?',
      answer: 'Haan, hamare website par state-wise aur category-wise filter features hain jisse aap apne qualification aur interest ke mutabik jobs easily search kar sakte hain.'
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

      <Breadcrumb items={[{ label: 'Aaj Ki Naukri' }]} />
      
      <SectionHeader
        title={`Aaj Ki Naukri — ${currentDateStr}`}
        subtitle={`${pagination.total} new updates found today`}
        icon="📅"
      />

      {/* Intro section */}
      <div className="card mb-6 border-l-4 border-l-accent bg-accent/5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink mb-1 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Live Updates Today
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Aaj ke din publish kiye gaye sabhi sarkari vibhago ke notifications yahan check karein. 
              Sarkari Job, Admit Card, Result, Admission aur Answer Key sabhi updates live hain.
            </p>
          </div>
          <div className="bg-stone-50 border border-stone-200/60 rounded-xl px-4 py-3 text-center self-start md:self-auto min-w-[150px]">
            <div className="text-2xl font-black text-accent">{pagination.total}</div>
            <div className="text-xs font-semibold text-muted tracking-wider uppercase">Updates Today</div>
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
          <p className="text-5xl">📅</p>
          <p className="mt-4 font-bold text-ink">Aaj abhi tak koi naya notification nahi aaya hai</p>
          <p className="mt-2 text-sm text-muted">Aap niche se humare top active job notifications check kar sakte hain.</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath="/today" />

      {/* FAQ Section */}
      <div className="mt-8">
        <FAQ items={todayFAQ} title="Aaj Ki Naukri - Frequently Asked Questions" />
      </div>
    </div>
  );
}
