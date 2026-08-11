import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Download Official SarkariPulse Android App — Latest Sarkari Naukri & Result',
  description: 'Download SarkariPulse App for instant Sarkari Naukri alerts, Admit Card downloads, Result notifications, Age Calculator & Resizer tools directly on your phone.',
  keywords: ['SarkariPulse App', 'Sarkari Job Alert App', 'Sarkari Result App Download', 'Sarkari Naukri Android App'],
};

export default function AppLandingPage() {
  return (
    <div className="animate-fade-in py-10 container-wrap max-w-4xl">
      {/* App Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-stone-900 p-8 sm:p-12 text-white shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-5xl shadow-2xl backdrop-blur-xl border border-white/20 mb-6">
            📲
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            SarkariPulse Official Android App
          </h1>
          <p className="mt-4 text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Sabse Fast Sarkari Naukri Notifications, Admit Card Links, Results, Age Calculator aur Candidate Tools — Ab Aapke Mobile Screen Par 24x7!
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://t.me/govtjob_alert_job_alert_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-amber-400 px-8 py-4 text-base font-black text-stone-900 shadow-xl transition hover:bg-amber-300 active:scale-95 flex items-center gap-2"
              id="download-app-cta"
            >
              <span>⚡</span> Join Telegram & Get App Link
            </a>
            <Link
              href="/"
              className="rounded-2xl bg-white/10 border border-white/20 px-8 py-4 text-base font-bold text-white shadow-md transition hover:bg-white/20 active:scale-95"
            >
              Browse Website →
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-6 border border-stone-200 hover:border-blue-500 transition">
          <span className="text-3xl">⚡</span>
          <h3 className="text-lg font-black text-ink mt-3">Instant Notification</h3>
          <p className="text-xs text-muted mt-2 leading-relaxed">
            UPSC, SSC, Railway, Bank, Police job notifications website se bhi pehle direct mobile screen par!
          </p>
        </div>

        <div className="card p-6 border border-stone-200 hover:border-blue-500 transition">
          <span className="text-3xl">🧮</span>
          <h3 className="text-lg font-black text-ink mt-3">Free Candidate Tools</h3>
          <p className="text-xs text-muted mt-2 leading-relaxed">
            Age Calculator & Sarkari Photo/Signature Resizer inbuilt app me available hai.
          </p>
        </div>

        <div className="card p-6 border border-stone-200 hover:border-blue-500 transition">
          <span className="text-3xl">🏛️</span>
          <h3 className="text-lg font-black text-ink mt-3">Direct Official Links</h3>
          <p className="text-xs text-muted mt-2 leading-relaxed">
            Har job post me direct official government portal PDF & Apply links, no fake news!
          </p>
        </div>
      </div>

      {/* How to Install Guide */}
      <div className="mt-12 rounded-2xl bg-stone-50 border border-stone-200 p-6 sm:p-8">
        <h2 className="text-xl font-black text-ink mb-4">
          📲 Chrome Mobile Se App Kaise Install Karein (PWA Method)
        </h2>
        <ol className="space-y-3 text-sm text-muted list-decimal list-inside leading-relaxed">
          <li>Apne mobile browser me <strong>SarkariPulse.net</strong> open karein.</li>
          <li>Screen ke top-right 3-dots (⋮) menu par click karein.</li>
          <li><strong>"Add to Home Screen"</strong> ya <strong>"Install App"</strong> par click karein.</li>
          <li>App aapke mobile home screen par instant install ho jayegi!</li>
        </ol>
      </div>
    </div>
  );
}
