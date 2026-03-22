import { Metadata } from 'next';
import { getJobsByCategory } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { Pagination } from '@/components/Pagination';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHeader } from '@/components/SectionHeader';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Admit Card Download — Latest Exam Hall Tickets 2026',
  description: 'Download latest sarkari exam admit cards, hall tickets aur exam city slips. SSC, UPSC, Railway, Banking sab admit cards yahan dekhein!',
  alternates: { canonical: '/admit-card' },
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdmitCardPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { data: jobs, pagination } = await getJobsByCategory('admit-card', page, 18);

  return (
    <div className="container-wrap py-8 animate-fade-in">
      <Breadcrumb items={[{ label: 'Admit Cards' }]} />
      <SectionHeader
        title="Admit Card Download"
        subtitle={`${pagination.total} admit cards available`}
        icon="🎫"
      />

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
    </div>
  );
}
