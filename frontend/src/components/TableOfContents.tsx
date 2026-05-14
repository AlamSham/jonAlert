'use client';

import { useState } from 'react';

type TOCItem = { id: string; label: string; emoji: string };

export function TableOfContents({ items, variant = 'both' }: { items: TOCItem[], variant?: 'mobile' | 'desktop' | 'both' }) {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setOpen(false);
    }
  };

  const mobileView = (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-4 text-base font-bold text-ink transition hover:bg-stone-100 min-h-[48px]"
        id="toc-toggle"
        aria-expanded={open}
        aria-controls="toc-mobile"
        style={{ fontSize: '16px' }}
      >
        <span className="flex items-center gap-2" style={{ fontSize: '16px' }}>
          <span style={{ fontSize: '16px' }}>📑</span>
          <span style={{ fontSize: '16px' }}>Table of Contents</span>
        </span>
        <span 
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
          aria-hidden="true"
          style={{ fontSize: '16px' }}
        >
          ▼
        </span>
      </button>
      {open && (
        <nav 
          className="mt-2 rounded-xl border border-stone-200 bg-white p-4 animate-slide-up mobile-toc-nav shadow-sm" 
          id="toc-mobile" 
          style={{ maxHeight: '30vh', overflowY: 'auto' }}
          role="navigation"
          aria-label="Table of Contents"
        >
          <ol className="space-y-2">
            {items.map((item, i) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollTo(item.id)}
                  className="w-full text-left rounded-lg px-4 py-3 text-base text-ink transition hover:bg-accent/10 hover:text-accent min-h-[48px] flex items-center touch-manipulation"
                  aria-label={`Navigate to ${item.label}`}
                  style={{ fontSize: '16px' }}
                >
                  <span className="mr-3 text-stone-500 font-medium" style={{ fontSize: '14px' }}>{i + 1}.</span>
                  <span className="mr-2" style={{ fontSize: '16px' }}>{item.emoji}</span>
                  <span className="font-medium" style={{ fontSize: '16px' }}>{item.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </div>
  );

  const desktopView = (
    <aside className="hidden lg:block sticky top-24 self-start w-56 shrink-0" id="toc-desktop">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">📑 Contents</h4>
      <nav className="rounded-xl border border-stone-200 bg-white p-3">
        <ol className="space-y-0.5">
          {items.map((item, i) => (
            <li key={item.id}>
              <button
                onClick={() => scrollTo(item.id)}
                className="w-full text-left rounded-lg px-3 py-2 text-xs font-medium text-muted transition hover:bg-accent/5 hover:text-accent"
              >
                <span className="mr-1.5 text-stone-400">{i + 1}.</span>
                <span className="mr-1">{item.emoji}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );

  return (
    <>
      {(variant === 'both' || variant === 'mobile') && mobileView}
      {(variant === 'both' || variant === 'desktop') && desktopView}
    </>
  );
}
