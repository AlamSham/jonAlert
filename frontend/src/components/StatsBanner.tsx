import { StatsData } from '@/lib/types';
import Link from 'next/link';

export function StatsBanner({ stats }: { stats: StatsData }) {
  const items = [
    { label: 'Total Jobs', value: stats.totalJobs, icon: '💼', color: 'from-blue-500 to-indigo-600' },
    { label: 'Added Today', value: stats.last24Hours, icon: '🔥', color: 'from-red-500 to-orange-500', href: '/today', badge: true },
    { label: 'Categories', value: Object.keys(stats.categories).length, icon: '📂', color: 'from-indigo-400 to-purple-500' },
    { label: 'States', value: stats.topStates.length, icon: '📍', color: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 px-4 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4" id="stats-banner">
      {items.map((item) => {
        const cardClass = `stat-glow card text-center !p-4 group min-h-[44px] mb-2 sm:mb-0 h-full flex flex-col items-center justify-center relative ${
          item.href ? 'hover:border-red-400/50 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer bg-red-50/10' : ''
        }`;

        const content = (
          <div className={cardClass}>
            {item.badge && (
              <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
            <span className="text-2xl">{item.icon}</span>
            <p className={`mt-2 text-xl sm:text-2xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
              {item.value.toLocaleString('en-IN')}
            </p>
            <p className="mt-0.5 text-sm sm:text-[11px] font-semibold uppercase tracking-wider text-muted">{item.label}</p>
          </div>
        );

        if (item.href) {
          return (
            <Link key={item.label} href={item.href} className="block h-full no-underline">
              {content}
            </Link>
          );
        }

        return <div key={item.label} className="h-full">{content}</div>;
      })}
    </div>
  );
}

