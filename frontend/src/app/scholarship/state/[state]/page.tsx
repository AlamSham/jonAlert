import { Metadata } from 'next';
import { getJobsByState } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { Pagination } from '@/components/Pagination';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHeader } from '@/components/SectionHeader';

export const revalidate = 60;

type Props = {
  params: Promise<{ state: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const s = decodeURIComponent(state);
  return {
    title: `${s} Scholarship — Sarkari Scholarship Schemes 2026`,
    description: `${s} ke students ke liye government scholarship schemes. SC, ST, OBC, minority — kaise apply karein, kitna paisa milega sab Hinglish mein!`,
    alternates: { canonical: `/scholarship/state/${state}` },
  };
}

export default async function ScholarshipStatePage({ params, searchParams }: Props) {
  const { state } = await params;
  const sp = await searchParams;
  const s = decodeURIComponent(state);
  const page = Math.max(1, Number(sp.page) || 1);
  const { data: jobs, pagination } = await getJobsByState(s, page, 18, 'scholarship');

  return (
    <div className="container-wrap py-8 animate-fade-in">
      <Breadcrumb items={[
        { label: 'Scholarship', href: '/scholarship' },
        { label: s },
      ]} />
      <SectionHeader
        title={`${s} — Scholarship Schemes`}
        subtitle={`${pagination.total} scholarships in ${s}`}
        icon="💰"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job, i) => (
          <JobCard key={job.slug} job={job} index={i} />
        ))}
      </div>
      {jobs.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-4xl">📭</p>
          <p className="mt-4 font-bold text-muted">{s} mein abhi koi scholarship updates nahi hain</p>
        </div>
      )}
      <Pagination pagination={pagination} basePath={`/scholarship/state/${state}`} />
    </div>
  );
}
