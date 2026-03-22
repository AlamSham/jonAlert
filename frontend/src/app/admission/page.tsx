import { Metadata } from 'next';
import { getJobsByCategory } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { Pagination } from '@/components/Pagination';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHeader } from '@/components/SectionHeader';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'College Admission — Latest Admission Notifications 2026',
  description: 'DU, JNU, BHU, IGNOU aur sabhi top colleges ke admission updates. Eligibility, last date, documents, form kaise bhare — sab Hinglish mein samjhein!',
  alternates: { canonical: '/admission' },
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdmissionPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { data: jobs, pagination } = await getJobsByCategory('admission', page, 18);

  return (
    <div className="container-wrap py-8 animate-fade-in">
      <Breadcrumb items={[{ label: 'Admission' }]} />
      <SectionHeader
        title="College Admission Updates"
        subtitle={`${pagination.total} admission notifications available`}
        icon="🎓"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job, i) => (
          <JobCard key={job.slug} job={job} index={i} />
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-4xl">📭</p>
          <p className="mt-4 font-bold text-muted">Koi admission notifications abhi available nahi hain</p>
        </div>
      )}

      <Pagination pagination={pagination} basePath="/admission" />
    </div>
  );
}
