import { Metadata } from 'next';
import { getJobsByOrg } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { Pagination } from '@/components/Pagination';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHeader } from '@/components/SectionHeader';
import { FAQ } from '@/components/FAQ';
import { breadcrumbJsonLd, generateCollectionPageSchema } from '@/lib/seo';
import { ORG_SEO_DATA } from '@/lib/org-seo-data';

export const revalidate = 3600;

type Props = {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateStaticParams() {
  return Object.keys(ORG_SEO_DATA).map(slug => ({
    orgSlug: slug,
  }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { orgSlug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net';
  const meta = ORG_SEO_DATA[orgSlug.toLowerCase()];

  if (!meta) return { title: 'Jobs Not Found' };

  // Page 1 canonical should NOT have ?page=1 to avoid duplicate canonical issues
  const canonicalUrl = page > 1
    ? `${siteUrl}/jobs/org/${orgSlug}?page=${page}`
    : `${siteUrl}/jobs/org/${orgSlug}`;

  return {
    title: page > 1
      ? `${meta.shortName} Jobs 2026 — Page ${page} | SarkariPulse`
      : `${meta.emoji} ${meta.shortName} Recruitment 2026 — Latest ${meta.label} Vacancy | SarkariPulse`,
    description: meta.description.slice(0, 160),
    alternates: {
      canonical: canonicalUrl,
    },
    // Noindex pagination pages beyond page 5 to prevent thin content indexing
    ...(page > 5 ? {
      robots: {
        index: false,
        follow: true,
      },
    } : {}),
  };
}

export default async function OrganizationJobsPage({ params, searchParams }: Props) {
  const { orgSlug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const meta = ORG_SEO_DATA[orgSlug.toLowerCase()];

  if (!meta) {
    const { notFound } = await import('next/navigation');
    notFound();
  }

  const { data: jobs, pagination } = await getJobsByOrg(orgSlug, page, 18);

  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Jobs', url: '/jobs' },
    { name: `${meta.shortName} Jobs`, url: `/jobs/org/${orgSlug}` },
  ]);

  const collectionPageSchema = generateCollectionPageSchema(
    'job', jobs, pagination.total
  );

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
        { label: `${meta.shortName} Jobs` },
      ]} />

      <SectionHeader
        title={`${meta.emoji} ${meta.shortName} Sarkari Naukri`}
        subtitle={`${pagination.total.toLocaleString('en-IN')} jobs available`}
        icon={meta.emoji}
      />

      {/* Organization Info Card */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-ink mb-3">
          {meta.label} Jobs 2026
        </h2>
        <p className="text-sm text-muted leading-relaxed mb-4">{meta.description}</p>
        
        {meta.popularExams && meta.popularExams.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">🔥 Popular Exams</h3>
            <div className="flex flex-wrap gap-2">
              {meta.popularExams.map(exam => (
                <span key={exam} className="tag-chip">{exam}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Job Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job, i) => (
          <JobCard key={job.slug} job={job} index={i} />
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-4xl">📭</p>
          <p className="mt-4 font-bold text-muted">
            Abhi {meta.shortName} ke liye koi active vacancy available nahi hai
          </p>
        </div>
      )}

      <Pagination pagination={pagination} basePath={`/jobs/org/${orgSlug}`} />

      {/* FAQ Section */}
      {meta.faq && meta.faq.length > 0 && (
        <div className="mt-8">
          <FAQ items={meta.faq} title={`${meta.shortName} Jobs FAQ`} />
        </div>
      )}
    </div>
  );
}
