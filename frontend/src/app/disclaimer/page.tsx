import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Disclaimer — SarkariPulse',
  description: 'SarkariPulse ka disclaimer padhiye. Hum official government portal nahi hain, sirf ek information aggregator hain.',
  alternates: { canonical: '/disclaimer' },
};

export default function DisclaimerPage() {
  return (
    <div className="container-wrap py-12 animate-fade-in max-w-3xl">
      <h1 className="text-3xl font-black text-ink mb-2">Disclaimer</h1>
      <p className="text-sm text-muted mb-8">Last Updated: December 15, 2024</p>

      <div className="space-y-6 text-sm leading-relaxed text-ink/85">
        <section>
          <h2 className="text-lg font-bold text-ink mb-2">1. General Information</h2>
          <p>
            SarkariPulse (<strong>sarkaripulse.net</strong>) ek <strong>information aggregator website</strong> hai. Hum koi official government portal nahi hain. Hamari website par di gayi saari jankari various official government websites, employment newspapers, aur public sources se collect ki jaati hai.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">2. Accuracy of Information</h2>
          <p>
            Hum poori koshish karte hain ki hamari website par di gayi jankari accurate aur up-to-date rahe. Lekin hum <strong>100% accuracy ki guarantee nahi</strong> de sakte. Kisi bhi job notification, admission, ya exam ke liye apply karne se pehle <strong>official website</strong> par zaroor verify karein.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">3. Not a Government Website</h2>
          <p>
            SarkariPulse kisi bhi sarkari department, ministry, ya organization se affiliated nahi hai. Hum sirf publicly available government notifications ko ek organized format mein present karte hain.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">4. External Links</h2>
          <p>
            Hamari website par kuch links external websites (jaise official government portals, apply links) par point kar sakti hain. Hum in external websites ke content, privacy policies, ya practices ke liye responsible nahi hain.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">5. No Liability</h2>
          <p>
            SarkariPulse aur iski team kisi bhi direct, indirect, incidental, ya consequential damages ke liye liable nahi hogi jo hamari website par di gayi information ke use se ho sakti hai. Users apni responsibility par information use karein.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">6. Content Verification</h2>
          <p>
            Hamari editorial team content ko summarize aur organize karti hai official sources se. Summaries mein minor variations ho sakte hain. Hamesha <strong>official notification</strong> ko refer karein final decision ke liye.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">7. Contact</h2>
          <p>
            Is disclaimer ke baare mein koi sawal hai? Humse{' '}
            <Link href="/contact" className="text-accent hover:text-accent-dark font-semibold transition">Contact Page</Link>{' '}
            par sampark karein.
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
            href="/about"
            className="card !p-4 hover:bg-stone-50/60 transition group"
          >
            <h3 className="font-bold text-ink text-sm mb-1 group-hover:text-accent transition">ℹ️ About Us</h3>
            <p className="text-xs text-muted">SarkariPulse ke baare mein jaaniye</p>
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

      <div className="mt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-accent-dark"
        >
          🏠 Home Page
        </Link>
      </div>
    </div>
  );
}
