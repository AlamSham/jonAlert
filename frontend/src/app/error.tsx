'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-wrap py-20 text-center animate-fade-in">
      {/* Header */}
      <p className="text-6xl mb-6">⚠️</p>
      <h1 className="text-3xl font-black text-ink mb-4">Kuch Galat Ho Gaya!</h1>
      <p className="text-muted max-w-md mx-auto mb-8">
        Server se data load karte waqt koi technical error aaya hai. Hum jaldi se fix kar denge. Thodi der baad dobara try karein ya humse contact karein.
      </p>

      {/* Apology Message */}
      <div className="max-w-lg mx-auto mb-8 p-6 bg-red-50/60 border border-red-200/40 rounded-2xl">
        <h2 className="text-lg font-bold text-red-800 mb-2">🙏 Maafi Chahte Hain</h2>
        <p className="text-sm text-red-700">
          Ye technical problem hai jo kabhi-kabhi hoti hai. Hamari team isko fix karne mein lagi hui hai. 
          Aap thodi der baad try kar sakte hain ya humse contact kar sakte hain.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl active:scale-95"
        >
          🔄 Dobara Try Karein
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-stone-300 px-6 py-3 text-sm font-bold text-ink transition hover:bg-stone-50 active:scale-95"
        >
          🏠 Home Page
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-accent px-6 py-3 text-sm font-bold text-accent transition hover:bg-accent/5 active:scale-95"
        >
          📧 Contact Us
        </Link>
      </div>

      {/* Help Section */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-lg font-bold text-ink mb-4">🤔 Kya Kar Sakte Hain?</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card !p-4 text-left">
            <h3 className="font-bold text-ink text-sm mb-2">🔄 Page Refresh Karein</h3>
            <p className="text-xs text-muted">
              Browser refresh (Ctrl+F5) karke dobara try karein. Kabhi-kabhi temporary issue hoti hai.
            </p>
          </div>
          
          <div className="card !p-4 text-left">
            <h3 className="font-bold text-ink text-sm mb-2">⏰ Thodi Der Baad Try Karein</h3>
            <p className="text-xs text-muted">
              5-10 minute baad dobara visit karein. Server load kam hone par problem solve ho sakti hai.
            </p>
          </div>
          
          <div className="card !p-4 text-left">
            <h3 className="font-bold text-ink text-sm mb-2">📱 Different Device Use Karein</h3>
            <p className="text-xs text-muted">
              Mobile se desktop ya desktop se mobile try karein. Different browser bhi use kar sakte hain.
            </p>
          </div>
          
          <div className="card !p-4 text-left">
            <h3 className="font-bold text-ink text-sm mb-2">📧 Humse Contact Karein</h3>
            <p className="text-xs text-muted">
              Agar problem persist kare toh humse email karein. Hum 24-48 hours mein reply karenge.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-8 p-4 bg-stone-50/60 border border-stone-200/40 rounded-2xl max-w-md mx-auto">
        <h3 className="font-bold text-ink text-sm mb-2">📞 Emergency Contact</h3>
        <p className="text-xs text-muted mb-2">
          Urgent issue hai toh direct email karein:
        </p>
        <a 
          href="mailto:contact@sarkaripulse.net?subject=Technical%20Error%20Report"
          className="text-accent hover:text-accent-dark transition font-medium text-sm"
        >
          contact@sarkaripulse.net
        </a>
      </div>

      {/* Error Details (for debugging) */}
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-8 text-left max-w-2xl mx-auto">
          <summary className="cursor-pointer text-sm font-medium text-stone-600 hover:text-stone-800">
            🔧 Technical Details (Development Only)
          </summary>
          <pre className="mt-2 p-4 bg-stone-100 rounded-lg text-xs overflow-auto text-stone-700">
            {error.message}
            {error.stack && '\n\n' + error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
