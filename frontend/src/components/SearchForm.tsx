'use client';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { trackSearch, trackFormSubmission } from '@/lib/analytics';

export function SearchForm({ initialQuery = '', large = false }: { initialQuery?: string; large?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const trimmedQuery = query.trim();
      
      // Track the search query
      trackSearch(trimmedQuery, 0, 'general'); // Results count will be updated on search page
      trackFormSubmission('search', true);
      
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    } else {
      trackFormSubmission('search', false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full" id="search-form">
      <div className={`relative flex items-center ${large ? 'max-w-2xl mx-auto' : ''}`}>
        <span className="absolute left-4 text-stone-400 text-base pointer-events-none z-10">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs, results, admit cards..."
          style={{
            // Mobile-first optimizations with inline styles for test compatibility
            height: '48px',
            fontSize: '16px',
            minHeight: '48px',
            // Ensure proper touch interaction on all mobile devices
            touchAction: 'manipulation',
          }}
          className={`w-full rounded-2xl border border-stone-200 bg-white pl-11 pr-24 text-ink placeholder:text-stone-400 transition focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none
          /* Tailwind classes for visual styling */
          h-12 text-base
          /* Mobile optimizations */
          sm:pr-20
          /* Desktop overrides */
          md:h-auto ${
            large 
              ? 'md:py-4 md:text-base shadow-card' 
              : 'md:py-3 md:text-sm shadow-sm'
          }`}
          id="search-input"
        />
        <button
          type="submit"
          style={{
            // Mobile-first touch targets with inline styles for test compatibility
            height: '44px',
            minHeight: '44px',
            minWidth: '44px',
            // Ensure proper touch interaction on all mobile devices
            touchAction: 'manipulation',
          }}
          className={`absolute right-2 rounded-xl bg-accent font-bold text-white shadow-sm transition hover:bg-accent-dark active:scale-95 
          /* Tailwind classes for visual styling */
          h-11 w-16 flex items-center justify-center text-xs
          /* Desktop overrides */
          ${large ? 'md:px-5 md:py-2.5 md:text-sm md:w-auto md:h-auto' : 'md:px-4 md:py-2 md:text-xs md:w-auto md:h-auto'}`}
          id="search-submit"
        >
          Search
        </button>
      </div>
    </form>
  );
}
