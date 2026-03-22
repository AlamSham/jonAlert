import { Metadata } from 'next';
import { getJobs } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { Pagination } from '@/components/Pagination';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHeader } from '@/components/SectionHeader';
import { SearchForm } from '@/components/SearchForm';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'All Sarkari Naukri — Latest Government Jobs 2026',
  description: 'Browse all latest sarkari naukri notifications — UPSC, SSC, Railway, Banking, Police, State jobs. Har din nayi vacancies!',
  alternates: { canonical: '/jobs' },
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function JobsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { data: jobs, pagination } = await getJobs(page, 18);

  return (
    <div className="container-wrap py-8 animate-fade-in">
      <Breadcrumb items={[{ label: 'All Jobs' }]} />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-6">
        <SectionHeader
          title="All Sarkari Naukri"
          subtitle={`${pagination.total.toLocaleString('en-IN')} notifications available`}
          icon="💼"
        />
        <div className="w-full sm:w-72">
          <SearchForm />
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
          <p className="mt-4 font-bold text-muted">Koi jobs abhi available nahi hain</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath="/jobs" />
    </div>
  );
}
