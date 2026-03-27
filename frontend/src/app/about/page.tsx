import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About SarkariPulse — Hamari Team aur Mission',
  description: 'SarkariPulse India ka AI-powered sarkari job notification portal hai. Jaaniye hamare baare mein, hamari team, aur hamara mission.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="container-wrap py-12 animate-fade-in max-w-3xl">
      <h1 className="text-3xl font-black text-ink mb-6">About SarkariPulse</h1>

      <div className="space-y-6 text-sm leading-relaxed text-ink/85">
        <section>
          <h2 className="text-lg font-bold text-ink mb-2">🎯 Hamara Mission</h2>
          <p>
            SarkariPulse ka mission hai har ek Indian student aur job seeker tak <strong>latest sarkari naukri, admission, scholarship, exam results, aur admit card</strong> ki jankari sabse pehle pahunchana — bilkul free aur bina kisi registration ke.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">🤖 AI-Powered Platform</h2>
          <p>
            Hum Artificial Intelligence ka use karte hain jo har <strong>10 minute</strong> mein government websites, official portals, aur employment news ko scan karta hai. Jab bhi koi nayi notification aati hai, hamara system automatically usse process karta hai aur aapko <strong>WhatsApp, Telegram, email, aur push notification</strong> ke through alert bhejta hai.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">📊 Kya Milega Yahan?</h2>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Sarkari Naukri</strong> — UPSC, SSC, Railway, Banking, Police, State Govt jobs</li>
            <li><strong>College Admission</strong> — University aur college admission notifications</li>
            <li><strong>Scholarship</strong> — Government scholarship schemes for students</li>
            <li><strong>Exam Results</strong> — Board results, competitive exam results</li>
            <li><strong>Admit Card</strong> — Download hall tickets aur admit cards</li>
            <li><strong>Exam Form</strong> — Online application forms aur registration links</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">✅ Kyun Choose Karein SarkariPulse?</h2>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>100% Free — koi hidden charges nahi</li>
            <li>AI-powered real-time updates</li>
            <li>Hinglish mein easy-to-read content</li>
            <li>Official government sources se verified data</li>
            <li>Instant WhatsApp aur Telegram alerts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">📬 Contact Us</h2>
          <p>
            Koi sawal ya feedback hai? Hum se contact karein{' '}
            <Link href="/contact" className="text-accent hover:text-accent-dark font-semibold transition">
              Contact Page
            </Link>{' '}
            par.
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-accent-dark"
        >
          🏠 Home Page
        </Link>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-stone-300 px-6 py-3 text-sm font-bold text-ink transition hover:bg-stone-50"
        >
          💼 Browse Jobs
        </Link>
      </div>
    </div>
  );
}
