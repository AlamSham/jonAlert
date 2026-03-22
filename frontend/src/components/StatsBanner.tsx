import { StatsData } from '@/lib/types';

export function StatsBanner({ stats }: { stats: StatsData }) {
  const items = [
    { label: 'Total Jobs', value: stats.totalJobs, icon: '💼', color: 'from-amber-500 to-orange-500' },
    { label: 'Added Today', value: stats.last24Hours, icon: '🔥', color: 'from-rose-500 to-pink-500' },
    { label: 'Categories', value: Object.keys(stats.categories).length, icon: '📂', color: 'from-blue-500 to-indigo-500' },
    { label: 'States', value: stats.topStates.length, icon: '📍', color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" id="stats-banner">
      {items.map((item) => (
        <div key={item.label} className="stat-glow card text-center !p-4 group">
          <span className="text-2xl">{item.icon}</span>
          <p className={`mt-2 text-2xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
            {item.value.toLocaleString('en-IN')}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
