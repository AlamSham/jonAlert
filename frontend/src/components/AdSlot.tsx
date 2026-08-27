'use client';

interface AdSlotProps {
  directLink?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const DEFAULT_DIRECT_LINK = 'https://omg10.com/4/11665703';

export function AdSlot({
  directLink = DEFAULT_DIRECT_LINK,
  variant = 'primary',
  className = '',
}: AdSlotProps) {
  if (!directLink) return null;

  if (variant === 'secondary') {
    return (
      <div className={`my-6 overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-blue-50/60 to-indigo-50/90 p-4 sm:p-5 shadow-sm transition hover:shadow-md ${className}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-left">
            <span className="text-2xl mt-0.5">🔥</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-700 bg-indigo-200/60 px-2 py-0.5 rounded-full border border-indigo-300">
                  Recommended Update
                </span>
                <span className="text-[10px] text-stone-400 font-medium">✨ Direct Access</span>
              </div>
              <h4 className="text-sm font-bold text-stone-800 leading-snug">
                Latest Government Recruitment & Scheme Direct Portal 2026
              </h4>
              <p className="text-xs text-stone-600 mt-1">
                Click below to view official online form updates, syllabus and answer keys.
              </p>
            </div>
          </div>

          <a
            href={directLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:from-indigo-700 hover:to-blue-700 hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <span>Explore Updates</span>
            <span>→</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`my-6 overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 p-4 sm:p-5 shadow-sm transition hover:shadow-md ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3 text-left">
          <span className="text-2xl mt-0.5">📢</span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] uppercase font-bold tracking-wider text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full border border-amber-300">
                Sponsored Alert
              </span>
              <span className="text-[10px] text-stone-400 font-medium">⚡ Fast Portal</span>
            </div>
            <h4 className="text-sm font-bold text-stone-800 leading-snug">
              Check Special Recruitment & Official Notification Releases 2026
            </h4>
            <p className="text-xs text-stone-600 mt-1">
              Direct application links, state-wise vacancies, and immediate updates.
            </p>
          </div>
        </div>

        <a
          href={directLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:from-amber-700 hover:to-orange-700 hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <span>View Details Now</span>
          <span>→</span>
        </a>
      </div>
    </div>
  );
}




