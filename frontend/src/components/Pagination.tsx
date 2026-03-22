import Link from 'next/link';
import { Pagination as PaginationType } from '@/lib/types';

type Props = {
  pagination: PaginationType;
  basePath: string;
  extraParams?: string;
};

export function Pagination({ pagination, basePath, extraParams = '' }: Props) {
  const { page, totalPages, hasNext, hasPrev, total } = pagination;

  if (totalPages <= 1) return null;

  const buildUrl = (p: number) => {
    const params = new URLSearchParams(extraParams);
    params.set('page', String(p));
    return `${basePath}?${params.toString()}`;
  };

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="mt-10 flex flex-col items-center gap-4" aria-label="Pagination" id="pagination">
      <div className="flex items-center gap-2">
        {hasPrev && (
          <Link
            href={buildUrl(page - 1)}
            className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-muted transition hover:bg-stone-50 hover:text-ink"
          >
            ← Prev
          </Link>
        )}

        {start > 1 && (
          <>
            <Link href={buildUrl(1)} className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-muted hover:bg-stone-100">1</Link>
            {start > 2 && <span className="text-stone-300">…</span>}
          </>
        )}

        {pages.map((p) => (
          <Link
            key={p}
            href={buildUrl(p)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition ${
              p === page
                ? 'bg-accent text-white shadow-md'
                : 'text-muted hover:bg-stone-100'
            }`}
          >
            {p}
          </Link>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-stone-300">…</span>}
            <Link href={buildUrl(totalPages)} className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-muted hover:bg-stone-100">{totalPages}</Link>
          </>
        )}

        {hasNext && (
          <Link
            href={buildUrl(page + 1)}
            className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-muted transition hover:bg-stone-50 hover:text-ink"
          >
            Next →
          </Link>
        )}
      </div>
      <p className="text-xs text-stone-400">
        Page {page} of {totalPages} • {total.toLocaleString('en-IN')} total results
      </p>
    </nav>
  );
}
