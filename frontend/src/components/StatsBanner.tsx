import { StatsData } from '@/lib/types';

export function StatsBanner({ stats }: { stats: StatsData }) {
  const items = [
    { label: 'Total Jobs', value: stats.totalJobs, icon: '💼', color: 'from-blue-500 to-indigo-600' },
    { label: 'Added Today', value: stats.last24Hours, icon: '🔥', color: 'from-emerald-500 to-teal-500' },
    { label: 'Categories', value: Object.keys(stats.categories).length, icon: '📂', color: 'from-indigo-400 to-purple-500' },
    { label: 'States', value: stats.topStates.length, icon: '📍', color: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 px-4 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4" id="stats-banner">
      {items.map((item) => (
        <div key={item.label} className="stat-glow card text-center !p-4 group min-h-[44px] mb-2 sm:mb-0">
          <span className="text-2xl">{item.icon}</span>
          <p className={`mt-2 text-xl sm:text-2xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
            {item.value.toLocaleString('en-IN')}
          </p>
          <p className="mt-0.5 text-sm sm:text-[11px] font-semibold uppercase tracking-wider text-muted">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
