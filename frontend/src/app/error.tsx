'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-wrap py-20 text-center animate-fade-in">
      <p className="text-6xl">⚠️</p>
      <h1 className="mt-6 text-3xl font-black text-ink">Kuch Galat Ho Gaya!</h1>
      <p className="mt-3 text-muted max-w-md mx-auto">
        Server se data load karte waqt koi error aaya hai. Thodi der baad dobara try karein.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl active:scale-95"
        >
          🔄 Dobara Try Karein
        </button>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-stone-300 px-6 py-3 text-sm font-bold text-ink transition hover:bg-stone-50 active:scale-95"
        >
          🏠 Home Page
        </a>
      </div>
    </div>
  );
}
