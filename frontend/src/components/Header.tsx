'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const primaryLinks = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/jobs', label: 'Jobs', icon: '💼' },
  { href: '/schemes', label: 'Schemes', icon: '🏛️' },
  { href: '/admit-card', label: 'Admit Card', icon: '🎫' },
  { href: '/result', label: 'Results', icon: '📊' },
];

const dropdownLinks = [
  { href: '/today', label: 'Aaj Ki updates', icon: '📅' },
  { href: '/closing-soon', label: 'Closing Soon', icon: '⏰' },
  { href: '/admission', label: 'Admission', icon: '🎓' },
  { href: '/scholarship', label: 'Scholarship', icon: '💰' },
  { href: '/exam-form', label: 'Exam Form', icon: '📝' },
];

const allLinks = [...primaryLinks, ...dropdownLinks];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isDropdownActive = () => {
    return dropdownLinks.some((link) => isActive(link.href));
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-stone-200/60">
      <div className="container-wrap flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2 group shrink-0" id="header-logo">
          <img
            src="/logo.jpg"
            alt="SarkariPulse logo"
            className="h-9 w-9 rounded-xl object-cover shadow-sm"
          />
          <span className="text-xl font-black tracking-tight whitespace-nowrap">
            Sarkari<span className="text-accent">Pulse</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" id="desktop-nav">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                isActive(link.href)
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:bg-stone-100 hover:text-ink'
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}

          {/* Hover Dropdown Menu */}
          <div className="relative group">
            <button
              className={`relative rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                isDropdownActive()
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:bg-stone-100 hover:text-ink'
              }`}
            >
              <span>✨</span>
              More
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180 text-stone-400 group-hover:text-ink"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className="absolute right-0 mt-1 w-56 rounded-xl border border-stone-200/60 bg-white/95 backdrop-blur-md p-1.5 shadow-lg opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
              {dropdownLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-150 ${
                    isActive(link.href)
                      ? 'bg-accent/10 text-accent'
                      : 'text-muted hover:bg-stone-50 hover:text-ink'
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

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
            {allLinks.map((link) => (
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

