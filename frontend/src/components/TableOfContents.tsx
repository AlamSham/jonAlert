'use client';

import { useState } from 'react';

type TOCItem = { id: string; label: string; emoji: string };

export function TableOfContents({ items }: { items: TOCItem[] }) {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setOpen(false);
    }
  };

  return (
    <>
      {/* Mobile: Collapsible */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-bold text-ink transition hover:bg-stone-100"
          id="toc-toggle"
        >
          <span>📑 Table of Contents</span>
          <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {open && (
          <nav className="mt-2 rounded-xl border border-stone-200 bg-white p-3 animate-slide-up" id="toc-mobile">
            <ol className="space-y-1">
              {items.map((item, i) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className="w-full text-left rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-accent/5 hover:text-accent"
                  >
                    <span className="mr-2 text-stone-400">{i + 1}.</span>
                    <span className="mr-1.5">{item.emoji}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      {/* Desktop: Sticky Sidebar */}
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
    </>
  );
}
