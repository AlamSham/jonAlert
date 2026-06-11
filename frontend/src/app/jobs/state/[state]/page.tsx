import { Metadata } from 'next';
import Link from 'next/link';
import { getJobsByState } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { Pagination } from '@/components/Pagination';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHeader } from '@/components/SectionHeader';
import { FAQ } from '@/components/FAQ';
import { 
  generateCollectionPageSchema, 
  breadcrumbJsonLd, 
  generateLocalBusinessSchema
} from '@/lib/seo';
import { FAQItem } from '@/lib/internal-links';
import { getNeighboringStates } from '@/lib/neighboring-states';
import { getStateSEOInfo } from '@/lib/state-seo-data';

export const revalidate = 60;

export async function generateStaticParams() {
  const topStates = [
    'Uttar Pradesh', 'Bihar', 'Rajasthan', 'Madhya Pradesh',
    'Maharashtra', 'West Bengal', 'Andhra Pradesh', 'Chhattisgarh',
    'Jharkhand', 'Himachal Pradesh', 'Tamil Nadu', 'Karnataka',
    'Kerala', 'Gujarat', 'Haryana', 'Punjab', 'Odisha',
    'Telangana', 'Uttarakhand', 'Delhi', 'Assam'
  ];
  return topStates.map(state => ({ state: encodeURIComponent(state) }));
}

type Props = {
  params: Promise<{ state: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { state } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const decodedState = decodeURIComponent(state);
  const stateInfo = getStateSEOInfo(decodedState);
  const canonical = `https://sarkaripulse.net/jobs/state/${encodeURIComponent(decodedState)}`;
  return {
    title: page > 1
      ? `${decodedState} Sarkari Naukri 2026 — Page ${page} | SarkariPulse`
      : `${decodedState} Sarkari Naukri 2026 — ${stateInfo.psc}, ${stateInfo.boards[0]} Vacancy | SarkariPulse`,
    description: `⚡ ${decodedState} Govt Jobs 2026: ${stateInfo.psc}, ${stateInfo.boards.join(', ')} ki latest sarkari naukri. ${stateInfo.popularExams.slice(0, 3).join(', ')} bharti updates. Apply online now!`,
    alternates: {
      canonical: page > 1 ? `${canonical}?page=${page}` : canonical,
    },
  };
}

export default async function StatePage({ params, searchParams }: Props) {
  const { state } = await params;
  const sp = await searchParams;
  const decodedState = decodeURIComponent(state);
  const page = Math.max(1, Number(sp.page) || 1);
  const stateInfo = getStateSEOInfo(decodedState);
  const { data: jobs, pagination } = await getJobsByState(decodedState, page, 18);

  // Get neighboring states
  const neighboringStates = getNeighboringStates(decodedState);

  // Calculate statistics
  const latestJobDate = jobs.length > 0 ? new Date(Math.max(...jobs.map(job => new Date(job.createdAt).getTime()))) : null;
  const categories = jobs.reduce((acc, job) => {
    acc[job.category] = (acc[job.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const popularCategories = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category);

  // Generate structured data
  const collectionPageSchema = generateCollectionPageSchema('job', jobs, pagination.total);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Sarkari Naukri', url: '/jobs' },
    { name: decodedState, url: `/jobs/state/${state}` }
  ]);
  const localBusinessSchema = generateLocalBusinessSchema(decodedState);

  // FAQ data for state-specific jobs (enriched with PSC info)
  const stateFAQ: FAQItem[] = [
    {
      question: `${decodedState} mein kitni government jobs available hain?`,
      answer: `Currently ${pagination.total} sarkari naukri notifications ${decodedState} mein available hain. ${stateInfo.psc}, ${stateInfo.boards.join(', ')} ki sabhi vacancies yahan regularly update hoti hain.`
    },
    {
      question: `${stateInfo.psc} ka agla exam kab hoga?`,
      answer: `${stateInfo.psc} exam dates ke liye official notification check karein. ${stateInfo.popularExams[0]} aur ${stateInfo.popularExams[1]} jaise popular exams ki dates SarkariPulse par turant update hoti hain.`
    },
    {
      question: `${decodedState} mein 10th/12th pass ke liye kaunsi govt jobs hain?`,
      answer: `${decodedState} mein Police Constable, Group D, MTS, Peon, Home Guard jaisi posts 10th/12th pass candidates ke liye available hoti hain. ${stateInfo.boards[0]} regularly in posts ki bharti nikalta hai.`
    },
    {
      question: `${decodedState} government job ki salary kitni hoti hai?`,
      answer: `${decodedState} mein salary post ke according ₹15,000 se ₹1,00,000+ per month tak hoti hai. 7th Pay Commission ke according pay scale + DA + HRA milti hai.`
    },
    {
      question: `${decodedState} ki jobs ke liye age limit kya hai?`,
      answer: `Age limit post ke according alag hoti hai. Usually General: 18-35 years, OBC: +3 years, SC/ST: +5 years relaxation. ${stateInfo.psc} specific rules notification mein check kariye.`
    },
    {
      question: `${stateInfo.psc} ki taiyari kaise karein?`,
      answer: `${stateInfo.psc} ki taiyari ke liye previous year papers solve karein, current affairs daily padhein, aur ${stateInfo.popularExams.slice(0, 2).join(' aur ')} ka syllabus acche se cover karein. SarkariPulse par latest notification aur updates milte rahenge.`
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
        { label: 'All Jobs', href: '/jobs' },
        { label: decodedState },
      ]} />

      <SectionHeader
        title={`${decodedState} Sarkari Naukri 2026`}
        subtitle={`${stateInfo.psc} — ${pagination.total} Govt Jobs Available`}
        icon="📍"
      />

      {/* PSC Info Card */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-ink mb-3">
          🏛️ {decodedState} Sarkari Naukri 2026 — {stateInfo.psc} & {stateInfo.boards[0]} Vacancy
        </h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          {decodedState} mein latest sarkari naukri notifications yahan milte hain.
          {stateInfo.psc}, {stateInfo.boards.join(', ')} ki sabhi vacancies,
          eligibility, last date aur direct apply links available hain.
          Police, Teacher, Clerk, Engineer — har field ki jobs regular basis par update hoti hain.
        </p>

        {/* Popular Exams Tags */}
        <h3 className="text-sm font-semibold text-ink mb-2">🎯 Popular Exams</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {stateInfo.popularExams.map(exam => (
            <span
              key={exam}
              className="inline-flex items-center px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-800"
            >
              {exam}
            </span>
          ))}
        </div>

        {/* Recruitment Boards */}
        <h3 className="text-sm font-semibold text-ink mb-2">📋 Recruitment Boards</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-800">
            {stateInfo.psc}
          </span>
          {stateInfo.boards.map(board => (
            <span
              key={board}
              className="inline-flex items-center px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-800"
            >
              {board}
            </span>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{pagination.total}</div>
            <div className="text-xs text-muted">Total Jobs</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">
              {latestJobDate ? latestJobDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
            </div>
            <div className="text-xs text-muted">Latest Update</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">
              {popularCategories.length > 0 ? popularCategories[0] : 'All'}
            </div>
            <div className="text-xs text-muted">Top Category</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{stateInfo.psc}</div>
            <div className="text-xs text-muted">Main PSC</div>
          </div>
        </div>
      </div>

      {/* Neighboring States Links */}
      {neighboringStates.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-lg font-bold text-ink mb-3">Nearby States Jobs</h3>
          <p className="text-sm text-muted mb-4">
            {decodedState} ke neighboring states mein bhi government jobs check kariye:
          </p>
          <div className="flex flex-wrap gap-2">
            {neighboringStates.slice(0, 6).map((neighborState) => (
              <a
                key={neighborState}
                href={`/jobs/state/${encodeURIComponent(neighborState)}`}
                className="inline-flex items-center px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-sm text-ink transition-colors"
              >
                📍 {neighborState}
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
          <p className="mt-4 font-bold text-muted">{decodedState} mein abhi koi jobs available nahi hain</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath={`/jobs/state/${state}`} />

      {/* FAQ Section */}
      <div className="mt-8">
        <FAQ items={stateFAQ} title={`${decodedState} Sarkari Naukri — FAQ`} />
      </div>

      {/* Browse by Qualification */}
      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">
          📚 Qualification Wise Jobs
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '10th Pass Jobs', slug: '10th' },
            { label: '12th Pass Jobs', slug: '12th' },
            { label: 'Graduate Jobs', slug: 'graduate' },
            { label: 'Post Graduate Jobs', slug: 'post-graduate' },
            { label: 'ITI Jobs', slug: 'iti' },
            { label: 'Diploma Jobs', slug: 'diploma' },
          ].map(({ label, slug }) => (
            <Link
              key={slug}
              href={`/jobs/qualification/${slug}`}
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Browse Other States */}
      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">
          📍 Other States
        </h2>
        <div className="flex flex-wrap gap-2">
          {['Uttar Pradesh','Bihar','Rajasthan','Madhya Pradesh','Maharashtra',
            'West Bengal','Andhra Pradesh','Chhattisgarh','Jharkhand','Himachal Pradesh',
            'Tamil Nadu','Karnataka','Gujarat','Haryana','Delhi']
            .filter(s => s !== decodedState)
            .map(s => (
              <Link
                key={s}
                href={`/jobs/state/${encodeURIComponent(s)}`}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
              >
                {s} Jobs
              </Link>
            ))
          }
        </div>
      </section>
    </div>
  );
}
