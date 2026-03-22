import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-wrap py-20 text-center animate-fade-in">
      <p className="text-6xl">🔍</p>
      <h1 className="mt-6 text-3xl font-black text-ink">Page Not Found</h1>
      <p className="mt-3 text-muted max-w-md mx-auto">
        Ye page exist nahi karta ya hata diya gaya hai. Neeche diye links se apni zaroorat ki cheez dhundein!
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl active:scale-95"
        >
          🏠 Home Page
        </Link>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-stone-300 px-6 py-3 text-sm font-bold text-ink transition hover:bg-stone-50 active:scale-95"
        >
          💼 Browse Jobs
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-stone-300 px-6 py-3 text-sm font-bold text-ink transition hover:bg-stone-50 active:scale-95"
        >
          🔍 Search
        </Link>
      </div>
    </div>
  );
}
