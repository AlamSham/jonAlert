import { Metadata } from 'next';
import { getJobsByCategory } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { Pagination } from '@/components/Pagination';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHeader } from '@/components/SectionHeader';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Scholarship — Latest Sarkari Scholarship Schemes 2026',
  description: 'SC, ST, OBC, Minority students ke liye government scholarship schemes. NSP, Post Matric, Pre Matric — kaise apply karein sab Hinglish mein!',
  alternates: { canonical: '/scholarship' },
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function ScholarshipPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { data: jobs, pagination } = await getJobsByCategory('scholarship', page, 18);

  return (
    <div className="container-wrap py-8 animate-fade-in">
      <Breadcrumb items={[{ label: 'Scholarship' }]} />
      <SectionHeader
        title="Scholarship Schemes"
        subtitle={`${pagination.total} scholarship updates available`}
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
          <p className="mt-4 font-bold text-muted">Koi scholarship updates abhi available nahi hain</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath="/scholarship" />
    </div>
  );
}
