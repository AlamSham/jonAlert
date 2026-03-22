'use client';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';

export function SearchForm({ initialQuery = '', large = false }: { initialQuery?: string; large?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full" id="search-form">
      <div className={`relative flex items-center ${large ? 'max-w-2xl mx-auto' : ''}`}>
        <span className="absolute left-4 text-stone-400 text-base pointer-events-none">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs, results, admit cards..."
          className={`w-full rounded-2xl border border-stone-200 bg-white pl-11 pr-24 text-sm text-ink placeholder:text-stone-400 transition focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none ${
            large ? 'py-4 text-base shadow-card' : 'py-3 shadow-sm'
          }`}
          id="search-input"
        />
        <button
          type="submit"
          className={`absolute right-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-bold text-white shadow-md transition hover:shadow-lg active:scale-95 ${
            large ? 'px-5 py-2.5 text-sm' : 'px-4 py-2 text-xs'
          }`}
          id="search-submit"
        >
          Search
        </button>
      </div>
    </form>
  );
}
