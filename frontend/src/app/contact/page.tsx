import { Metadata } from 'next';
import Link from 'next/link';
import { FAQ } from '@/components/FAQ';
import { FAQItem } from '@/lib/internal-links';

export const metadata: Metadata = {
  title: 'Contact Us — SarkariPulse',
  description: 'SarkariPulse se contact karein. Koi sawal, feedback, ya suggestion hai? Humse yahan sampark karein.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  const faqItems: FAQItem[] = [
    {
      question: "Kya aap job applications accept karte hain?",
      answer: "Nahi, hum sirf information provide karte hain. Job applications ke liye aapko official government website par jaana hoga jo hamari notification mein di gayi hoti hai."
    },
    {
      question: "Notification miss ho gayi, kya kar sakte hain?",
      answer: "Aap hamari website par search kar sakte hain ya WhatsApp/Telegram groups join kar sakte hain. Hum regular updates bhejte rehte hain."
    },
    {
      question: "Koi technical problem hai website mein?",
      answer: "Agar website load nahi ho rahi ya koi error aa rahi hai, toh humse email karein. Hum jaldi fix kar denge."
    },
    {
      question: "Fake notification report kaise karein?",
      answer: "Agar aapko lagta hai koi notification fake hai, toh humse turant contact karein. Hum verify karke action lenge."
    },
    {
      question: "Suggestion ya feedback kaise dein?",
      answer: "Aap email kar sakte hain ya WhatsApp group mein message kar sakte hain. Hamein user feedback bahut pasand hai!"
    }
  ];

  return (
    <div className="container-wrap py-12 animate-fade-in max-w-3xl">
      <h1 className="text-3xl font-black text-ink mb-6">Contact Us</h1>

      <div className="space-y-6 text-sm leading-relaxed text-ink/85">
        <p>
          SarkariPulse se contact karne ke liye neeche diye gaye tarike use karein. Hum aapki baat sunne ke liye hamesha tayyar hain! 😊
        </p>

        {/* FAQ Section - Before Contact Form */}
        <div className="mt-8">
          <FAQ 
            items={faqItems}
            title="🤔 Frequently Asked Questions"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mt-8">
          <div className="card !p-6 text-center">
            <span className="text-4xl block mb-3">📧</span>
            <h3 className="font-bold text-ink mb-1">Email</h3>
            <a href="mailto:contact@sarkaripulse.net" className="text-accent hover:text-accent-dark transition font-medium">
              contact@sarkaripulse.net
            </a>
          </div>

          <div className="card !p-6 text-center">
            <span className="text-4xl block mb-3">💬</span>
            <h3 className="font-bold text-ink mb-1">WhatsApp</h3>
            <p className="text-muted text-xs">Join our WhatsApp group for instant updates</p>
          </div>

          <div className="card !p-6 text-center">
            <span className="text-4xl block mb-3">✈️</span>
            <h3 className="font-bold text-ink mb-1">Telegram</h3>
            <p className="text-muted text-xs">Follow our Telegram channel for daily alerts</p>
          </div>

          <div className="card !p-6 text-center">
            <span className="text-4xl block mb-3">🕐</span>
            <h3 className="font-bold text-ink mb-1">Response Time</h3>
            <p className="text-muted text-xs">Hum usually 24-48 hours mein reply karte hain</p>
          </div>
        </div>

        <section className="rounded-2xl bg-amber-50/60 border border-amber-200/40 p-5">
          <h2 className="text-base font-bold text-ink mb-2">📝 Feedback &amp; Suggestions</h2>
          <p>
            Agar aapko hamari website mein koi improvement dikhta hai, koi bug milta hai, ya koi feature suggestion hai — toh zaroor batayein. Hum user feedback ko bahut seriously lete hain.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-ink mb-2">⚠️ Important Note</h2>
          <p>
            SarkariPulse ek <strong>independent information portal</strong> hai. Hum kisi government department se affiliated nahi hain. Job applications ya official queries ke liye respective <strong>government department se directly contact</strong> karein.
          </p>
        </section>
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
            href="/about"
            className="card !p-4 hover:bg-stone-50/60 transition group"
          >
            <h3 className="font-bold text-ink text-sm mb-1 group-hover:text-accent transition">ℹ️ About Us</h3>
            <p className="text-xs text-muted">SarkariPulse ke baare mein jaaniye</p>
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
