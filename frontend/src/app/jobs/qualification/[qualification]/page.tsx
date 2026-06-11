import { Metadata } from 'next';
import { getJobsByQualification } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { Pagination } from '@/components/Pagination';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHeader } from '@/components/SectionHeader';
import { FAQ } from '@/components/FAQ';
import { breadcrumbJsonLd, generateCollectionPageSchema } from '@/lib/seo';

export const revalidate = 60;

const QUALIFICATION_META: Record<string, { label: string; emoji: string; description: string }> = {
  '10th': {
    label: '10th Pass',
    emoji: '📘',
    description: '10th pass sarkari naukri — Police Constable, Group D, MTS, Peon, Driver aur Multi-Tasking Staff posts. Minimum 10th class pass candidates apply kar sakte hain.',
  },
  '12th': {
    label: '12th Pass',
    emoji: '📗',
    description: '12th pass govt jobs — SSC CHSL, Railway Group D, LDC, Clerk, Stenographer aur Data Entry Operator posts. Intermediate pass candidates ke liye latest vacancies.',
  },
  'graduate': {
    label: 'Graduate',
    emoji: '🎓',
    description: 'Graduate level sarkari naukri — SSC CGL, UPSC, Banking PO/Clerk, State PSC, Teaching posts. BA/BSc/BCom/BCA/BTech pass candidates ke liye.',
  },
  'post-graduate': {
    label: 'Post Graduate',
    emoji: '🎓',
    description: 'Post graduate govt jobs — UPSC Civil Services, UGC NET, PGT Teacher, Research Officer posts. MA/MSc/MBA/MTech pass candidates ke liye.',
  },
  'diploma': {
    label: 'Diploma',
    emoji: '📜',
    description: 'Diploma holder sarkari naukri — Junior Engineer, Technician, Supervisor posts. Polytechnic diploma holders ke liye latest govt vacancies.',
  },
  'iti': {
    label: 'ITI',
    emoji: '🔧',
    description: 'ITI pass govt jobs — Fitter, Electrician, Welder, Turner, Mechanic posts. Railway, Defense, PSU mein ITI trade holders ke liye bharti.',
  },
};

type Props = {
  params: Promise<{ qualification: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateStaticParams() {
  return ['10th', '12th', 'graduate', 'post-graduate', 'diploma', 'iti'].map(q => ({
    qualification: q,
  }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { qualification } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const meta = QUALIFICATION_META[qualification];
  if (!meta) return { title: 'Jobs Not Found' };

  return {
    title: page > 1
      ? `${meta.label} Sarkari Naukri 2026 — Page ${page} | SarkariPulse`
      : `${meta.emoji} ${meta.label} Sarkari Naukri 2026 — Latest Govt Jobs | SarkariPulse`,
    description: meta.description.slice(0, 160),
    alternates: {
      canonical: page > 1
        ? `https://sarkaripulse.net/jobs/qualification/${qualification}?page=${page}`
        : `https://sarkaripulse.net/jobs/qualification/${qualification}`,
    },
  };
}

export default async function QualificationJobsPage({ params, searchParams }: Props) {
  const { qualification } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const meta = QUALIFICATION_META[qualification];

  if (!meta) {
    const { notFound } = await import('next/navigation');
    notFound();
  }

  const { data: jobs, pagination } = await getJobsByQualification(qualification, page, 18);

  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Jobs', url: '/jobs' },
    { name: `${meta.label} Jobs`, url: `/jobs/qualification/${qualification}` },
  ]);

  const collectionPageSchema = generateCollectionPageSchema(
    'job', jobs, pagination.total
  );

  const faqItems = [
    {
      question: `${meta.label} pass ke liye kaunsi sarkari naukri hain?`,
      answer: meta.description,
    },
    {
      question: `${meta.label} pass sarkari naukri ke liye age limit kya hai?`,
      answer: `Age limit post ke hisaab se alag hoti hai. General: 18-27, OBC: 18-30, SC/ST: 18-32 years. Exact age limit official notification mein dekh sakte hain.`,
    },
    {
      question: `${meta.label} pass ke liye sabse zyada salary wali govt job kaunsi hai?`,
      answer: `${qualification === '10th' || qualification === '12th'
        ? 'Railway, SSC MTS, Police Constable mein 25,000-35,000 per month salary milti hai.'
        : 'UPSC, State PSC, Banking PO mein 50,000-1,00,000+ per month salary milti hai.'
      }`,
    },
  ];

  return (
    <div className="container-wrap py-8 animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />

      <Breadcrumb items={[
        { label: 'Jobs', href: '/jobs' },
        { label: `${meta.label} Jobs` },
      ]} />

      <SectionHeader
        title={`${meta.emoji} ${meta.label} Sarkari Naukri`}
        subtitle={`${pagination.total.toLocaleString('en-IN')} jobs available`}
        icon={meta.emoji}
      />

      <div className="card mb-6">
        <h2 className="text-lg font-bold text-ink mb-3">
          {meta.label} Pass Government Jobs 2026
        </h2>
        <p className="text-sm text-muted leading-relaxed">{meta.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job, i) => (
          <JobCard key={job.slug} job={job} index={i} />
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-4xl">📭</p>
          <p className="mt-4 font-bold text-muted">
            Abhi {meta.label} ke liye koi vacancy available nahi hai
          </p>
        </div>
      )}

      <Pagination pagination={pagination} basePath={`/jobs/qualification/${qualification}`} />

      <div className="mt-8">
        <FAQ items={faqItems} title={`${meta.label} Sarkari Naukri FAQ`} />
      </div>
    </div>
  );
}
