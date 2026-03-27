'use client';

import { useState, useEffect } from 'react';

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-all hover:bg-accent-dark hover:shadow-xl active:scale-90 animate-fade-in"
      aria-label="Back to top"
      id="back-to-top"
    >
      ↑
    </button>
  );
}
