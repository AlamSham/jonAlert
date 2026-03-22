'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/jobs', label: 'Jobs', icon: '💼' },
  { href: '/result', label: 'Results', icon: '📊' },
  { href: '/admit-card', label: 'Admit Card', icon: '🎫' },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-stone-200/60">
      <div className="container-wrap flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2 group" id="header-logo">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-black text-white shadow-md transition group-hover:shadow-glow">
            S
          </span>
          <span className="text-xl font-black tracking-tight">
            Sarkari<span className="gradient-text">Pulse</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" id="desktop-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                isActive(link.href)
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:bg-stone-100 hover:text-ink'
              }`}
            >
              <span className="mr-1.5">{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <Link
            href="/search"
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-muted transition hover:bg-accent/10 hover:text-accent"
            id="search-icon"
            aria-label="Search"
          >
            🔍
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-lg"
          aria-label="Toggle menu"
          id="mobile-menu-btn"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-stone-200/60 bg-white/95 backdrop-blur animate-slide-up" id="mobile-nav">
          <div className="container-wrap py-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive(link.href)
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:bg-stone-50'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <Link
              href="/search"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted hover:bg-stone-50"
            >
              <span className="text-lg">🔍</span>
              Search Jobs
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
