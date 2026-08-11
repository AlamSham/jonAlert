import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Free Sarkari Candidate Utility Tools — Age Calculator & Photo Resizer 2026',
  description: 'Free online candidate utility tools for Sarkari Naukri applications: Sarkari Job Age Calculator, Photo & Signature Resizer (20KB/50KB), Typing Test & Salary Calculator.',
  keywords: ['Sarkari Job Age Calculator', 'Photo Resizer for Sarkari Form', 'Signature Resizer 20KB', 'Sarkari Tools'],
};

export default function ToolsHubPage() {
  const tools = [
    {
      id: 'age-calculator',
      title: '🧮 Sarkari Job Age Calculator',
      description: 'Calculate your exact age (Years, Months, Days) as of any recruitment cut-off date (e.g. 01 Jan 2026, 01 Aug 2026) required by UPSC, SSC, Railway & Police forms.',
      href: '/tools/age-calculator',
      badge: 'POPULAR 🔥',
      badgeColor: 'bg-red-100 text-red-700',
    },
    {
      id: 'photo-resizer',
      title: '🖼️ Sarkari Photo & Signature Resizer',
      description: 'Resize & compress candidate photo and signature to exact KB limits (20KB, 50KB, 100KB) and pixel dimensions required for online recruitment forms.',
      href: '/tools/photo-resizer',
      badge: 'FREE TOOL ⚡',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
  ];

  return (
    <div className="animate-fade-in py-10 container-wrap max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-ink sm:text-4xl">
          Free Sarkari Candidate <span className="gradient-text">Utility Tools</span>
        </h1>
        <p className="mt-3 text-sm text-muted max-w-xl mx-auto leading-relaxed">
          Online recruitment form bharne ke liye essential utility tools — 100% Free, Fast & Private (Processing happens right in your browser).
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="card p-6 border border-stone-200 hover:border-accent transition hover:shadow-lg group flex flex-col justify-between"
            id={`tool-${tool.id}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`badge ${tool.badgeColor}`}>{tool.badge}</span>
                <span className="text-xs text-muted">100% Free</span>
              </div>
              <h2 className="text-xl font-black text-ink group-hover:text-accent transition">
                {tool.title}
              </h2>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                {tool.description}
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-stone-100 text-xs font-bold text-accent group-hover:translate-x-1 transition inline-flex items-center gap-1">
              Use Tool Now →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
