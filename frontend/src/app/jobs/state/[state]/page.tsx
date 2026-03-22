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
  const decodedState = decodeURIComponent(state);
  return {
    title: `${decodedState} Sarkari Naukri — Government Jobs in ${decodedState} 2026`,
    description: `Latest sarkari naukri in ${decodedState} — state government jobs, vacancy notifications, aur bharti updates. Apply karein aaj hi!`,
    alternates: { canonical: `/jobs/state/${state}` },
  };
}

export default async function StatePage({ params, searchParams }: Props) {
  const { state } = await params;
  const sp = await searchParams;
  const decodedState = decodeURIComponent(state);
  const page = Math.max(1, Number(sp.page) || 1);
  const { data: jobs, pagination } = await getJobsByState(decodedState, page, 18);

  return (
    <div className="container-wrap py-8 animate-fade-in">
      <Breadcrumb items={[
        { label: 'All Jobs', href: '/jobs' },
        { label: decodedState },
      ]} />

      <SectionHeader
        title={`${decodedState} Sarkari Naukri`}
        subtitle={`${pagination.total} jobs in ${decodedState}`}
        icon="📍"
      />

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
    </div>
  );
}
