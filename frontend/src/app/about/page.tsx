import { Metadata } from 'next';
import Link from 'next/link';
import { FAQ } from '@/components/FAQ';
import { FAQItem } from '@/lib/internal-links';

export const metadata: Metadata = {
  title: 'About SarkariPulse — Hamari Team aur Mission',
  description: 'SarkariPulse India ka AI-powered sarkari job notification portal hai. Jaaniye hamare baare mein, hamari team, aur hamara mission.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  const faqItems: FAQItem[] = [
    {
      question: "Kitni der mein notifications update hoti hain?",
      answer: "Hamara AI system har 10 minute mein government websites ko scan karta hai. Jaise hi koi nayi notification aati hai, hum automatically aapko alert bhej dete hain."
    },
    {
      question: "Notifications kaise milti hain?",
      answer: "Aap WhatsApp, Telegram, email, aur browser push notifications ke through alerts receive kar sakte hain. Sabse fast WhatsApp aur Telegram hain."
    },
    {
      question: "Kya ye service bilkul free hai?",
      answer: "Haan bilkul! SarkariPulse 100% free hai. Koi hidden charges, registration fees, ya subscription nahi hai. Hamesha free rahegi."
    },
    {
      question: "Kya aap government se affiliated hain?",
      answer: "Nahi, hum koi official government portal nahi hain. Hum ek independent information aggregator hain jo government websites se data collect karke organize karte hain."
    },
    {
      question: "Aapse contact kaise karein?",
      answer: "Aap humse contact page par email kar sakte hain. WhatsApp aur Telegram groups bhi join kar sakte hain instant updates ke liye. Hum 24-48 hours mein reply karte hain."
    }
  ];

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
          <h2 className="text-lg font-bold text-ink mb-2">📖 Our Story</h2>
          <p>
            SarkariPulse ki shururat 2024 mein hui thi jab humne dekha ki students ko sarkari job notifications ke liye multiple websites check karne padte hain. Kai baar important notifications miss ho jaati thi ya last date nikal jaati thi. Humne socha kyun na ek AI-powered platform banayein jo automatically sab kuch track kare aur students ko instant alerts bheje.
          </p>
          <p className="mt-3">
            Aaj SarkariPulse lakhs of students ki help kar raha hai latest opportunities find karne mein. Hamara AI system 24/7 kaam karta hai taaki aap koi bhi notification miss na karein.
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

      {/* FAQ Section */}
      <div className="mt-12">
        <FAQ 
          items={faqItems}
          title="🤔 Frequently Asked Questions"
        />
      </div>

      {/* Related Pages Section */}
      <div className="mt-12">
        <h2 className="text-lg font-bold text-ink mb-4">📄 Related Pages</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/privacy-policy"
            className="card !p-4 hover:bg-stone-50/60 transition group"
          >
            <h3 className="font-bold text-ink text-sm mb-1 group-hover:text-accent transition">🔒 Privacy Policy</h3>
            <p className="text-xs text-muted">Data privacy aur security ke baare mein</p>
          </Link>
          <Link
            href="/cookie-policy"
            className="card !p-4 hover:bg-stone-50/60 transition group"
          >
            <h3 className="font-bold text-ink text-sm mb-1 group-hover:text-accent transition">🍪 Cookie Policy</h3>
            <p className="text-xs text-muted">Cookies aur third-party services ke baare mein</p>
          </Link>
          <Link
            href="/disclaimer"
            className="card !p-4 hover:bg-stone-50/60 transition group"
          >
            <h3 className="font-bold text-ink text-sm mb-1 group-hover:text-accent transition">⚠️ Disclaimer</h3>
            <p className="text-xs text-muted">Important disclaimers aur limitations</p>
          </Link>
          <Link
            href="/contact"
            className="card !p-4 hover:bg-stone-50/60 transition group"
          >
            <h3 className="font-bold text-ink text-sm mb-1 group-hover:text-accent transition">📞 Contact Us</h3>
            <p className="text-xs text-muted">Humse sampark karein</p>
          </Link>
        </div>
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
