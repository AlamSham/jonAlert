import Link from 'next/link';

const footerLinks = [
  {
    title: 'Categories',
    links: [
      { href: '/jobs', label: 'All Jobs' },
      { href: '/result', label: 'Results' },
      { href: '/admit-card', label: 'Admit Cards' },
    ],
  },
  {
    title: 'Top States',
    links: [
      { href: '/jobs/state/All India', label: 'All India' },
      { href: '/jobs/state/Uttar Pradesh', label: 'Uttar Pradesh' },
      { href: '/jobs/state/Bihar', label: 'Bihar' },
      { href: '/jobs/state/Rajasthan', label: 'Rajasthan' },
      { href: '/jobs/state/Madhya Pradesh', label: 'Madhya Pradesh' },
      { href: '/jobs/state/Maharashtra', label: 'Maharashtra' },
    ],
  },
  {
    title: 'Quick Links',
    links: [
      { href: '/search', label: 'Search Jobs' },
      { href: '/jobs', label: 'Trending Jobs' },
      { href: '/', label: 'Latest Updates' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white/60 backdrop-blur" id="site-footer">
      <div className="container-wrap py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-black text-white">
                S
              </span>
              <span className="text-lg font-black tracking-tight">
                Sarkari<span className="gradient-text">Pulse</span>
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              Latest Sarkari Naukri, Exam Results, aur Admit Card updates — AI-powered, auto-updated har 10 minute.
            </p>
          </div>

          {/* Link Columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink">{group.title}</h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-6 sm:flex-row">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} SarkariPulse. All rights reserved.
          </p>
          <p className="text-xs text-stone-400">
            Made with ❤️ for Sarkari Job Aspirants
          </p>
        </div>
      </div>
    </footer>
  );
}
