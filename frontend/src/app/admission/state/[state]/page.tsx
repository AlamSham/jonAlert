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
    title: `${s} College Admission — Latest Admission Notifications 2026`,
    description: `${s} ke top colleges mein admission updates. DU, BHU, state universities — eligibility, last date, form kaise bhare Hinglish mein!`,
    alternates: { canonical: `/admission/state/${state}` },
  };
}

export default async function AdmissionStatePage({ params, searchParams }: Props) {
  const { state } = await params;
  const sp = await searchParams;
  const s = decodeURIComponent(state);
  const page = Math.max(1, Number(sp.page) || 1);
  const { data: jobs, pagination } = await getJobsByState(s, page, 18, 'admission');

  return (
    <div className="container-wrap py-8 animate-fade-in">
      <Breadcrumb items={[
        { label: 'Admission', href: '/admission' },
        { label: s },
      ]} />
      <SectionHeader
        title={`${s} — Admission Updates`}
        subtitle={`${pagination.total} admission notifications in ${s}`}
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
          <p className="mt-4 font-bold text-muted">{s} mein abhi koi admission updates nahi hain</p>
        </div>
      )}
      <Pagination pagination={pagination} basePath={`/admission/state/${state}`} />
    </div>
  );
}
