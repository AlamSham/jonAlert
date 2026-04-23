import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy — SarkariPulse',
  description: 'SarkariPulse ki cookie policy padhiye. Hum cookies kaise use karte hain, third-party services, aur aap cookies kaise disable kar sakte hain.',
  alternates: { canonical: '/cookie-policy' },
};

export default function CookiePolicyPage() {
  return (
    <div className="container-wrap py-12 animate-fade-in max-w-3xl">
      <h1 className="text-3xl font-black text-ink mb-2">Cookie Policy</h1>
      <p className="text-sm text-muted mb-8">Last Updated: December 15, 2024</p>

      <div className="space-y-6 text-sm leading-relaxed text-ink/85">
        <section>
          <h2 className="text-lg font-bold text-ink mb-2">1. Introduction</h2>
          <p>
            SarkariPulse (&quot;hum&quot;, &quot;hamara&quot;, &quot;website&quot;) cookies aur similar technologies use karta hai aapko better experience dene ke liye. Ye Cookie Policy explain karti hai ki hum cookies kaise use karte hain jab aap hamari website <strong>sarkaripulse.net</strong> visit karte hain.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">2. What Are Cookies?</h2>
          <p>
            Cookies chhote text files hain jo aapke browser mein store hoti hain jab aap website visit karte hain. Ye files website ko aapki preferences remember karne mein help karti hain aur aapka experience improve karti hain.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">3. Cookies We Use</h2>
          <p>SarkariPulse ye cookies aur third-party services use karta hai:</p>
          
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-blue-50/60 border border-blue-200/40 p-4">
              <h3 className="font-bold text-ink mb-1">🔍 Google Analytics</h3>
              <p className="text-xs text-muted">
                Website traffic analyze karne ke liye. Ye cookies anonymous data collect karti hain jaise page views, session duration, aur user behavior.
              </p>
            </div>

            <div className="rounded-2xl bg-green-50/60 border border-green-200/40 p-4">
              <h3 className="font-bold text-ink mb-1">📢 Google AdSense</h3>
              <p className="text-xs text-muted">
                Relevant advertisements dikhane ke liye. Ye cookies aapki interests ke basis par ads personalize karti hain.
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50/60 border border-purple-200/40 p-4">
              <h3 className="font-bold text-ink mb-1">🔔 OneSignal</h3>
              <p className="text-xs text-muted">
                Push notifications bhejne ke liye. Ye service aapko latest job notifications instantly deliver karti hai.
              </p>
            </div>

            <div className="rounded-2xl bg-orange-50/60 border border-orange-200/40 p-4">
              <h3 className="font-bold text-ink mb-1">📊 Vercel Analytics</h3>
              <p className="text-xs text-muted">
                Website performance monitor karne ke liye. Ye cookies page load times aur user experience metrics track karti hain.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">4. Third-Party Services</h2>
          <p>Hamari website ye third-party services use karti hai jo apni cookies set kar sakti hain:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
            <li>
              <strong>Google Analytics & AdSense</strong> —{' '}
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-dark transition"
              >
                Google Privacy Policy
              </a>
            </li>
            <li>
              <strong>OneSignal</strong> —{' '}
              <a 
                href="https://onesignal.com/privacy_policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-dark transition"
              >
                OneSignal Privacy Policy
              </a>
            </li>
            <li>
              <strong>Vercel Analytics</strong> —{' '}
              <a 
                href="https://vercel.com/legal/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-dark transition"
              >
                Vercel Privacy Policy
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">5. How to Disable Cookies</h2>
          <p>Aap apne browser settings se cookies disable kar sakte hain:</p>
          
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="card !p-4">
              <h3 className="font-bold text-ink text-sm mb-1">🌐 Chrome</h3>
              <p className="text-xs text-muted">Settings → Privacy and Security → Cookies and other site data</p>
            </div>
            
            <div className="card !p-4">
              <h3 className="font-bold text-ink text-sm mb-1">🦊 Firefox</h3>
              <p className="text-xs text-muted">Settings → Privacy & Security → Cookies and Site Data</p>
            </div>
            
            <div className="card !p-4">
              <h3 className="font-bold text-ink text-sm mb-1">🧭 Safari</h3>
              <p className="text-xs text-muted">Preferences → Privacy → Manage Website Data</p>
            </div>
            
            <div className="card !p-4">
              <h3 className="font-bold text-ink text-sm mb-1">🌊 Edge</h3>
              <p className="text-xs text-muted">Settings → Cookies and site permissions → Cookies and site data</p>
            </div>
          </div>
          
          <p className="mt-3 text-xs text-muted">
            <strong>Note:</strong> Cookies disable karne se website ki functionality affect ho sakti hai.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">6. Your Choices</h2>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Aap browser settings se cookies accept ya reject kar sakte hain</li>
            <li>Push notifications ko browser settings se disable kar sakte hain</li>
            <li>Google Ads personalization opt-out kar sakte hain{' '}
              <a 
                href="https://adssettings.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-dark transition"
              >
                yahan
              </a>
            </li>
            <li>Analytics tracking opt-out kar sakte hain browser add-ons use karke</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">7. Updates to This Policy</h2>
          <p>
            Hum is Cookie Policy ko samay-samay par update kar sakte hain. Changes is page par post kiye jayenge &quot;Last Updated&quot; date ke saath. Regular basis par is policy ko check karte rahiye.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">8. Contact Us</h2>
          <p>
            Cookie policy se related koi sawal hai? Humse{' '}
            <Link href="/contact" className="text-accent hover:text-accent-dark font-semibold transition">
              Contact Page
            </Link>{' '}
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
          href="/privacy-policy"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-stone-300 px-6 py-3 text-sm font-bold text-ink transition hover:bg-stone-50"
        >
          🔒 Privacy Policy
        </Link>
        <Link
          href="/about"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-stone-300 px-6 py-3 text-sm font-bold text-ink transition hover:bg-stone-50"
        >
          ℹ️ About Us
        </Link>
      </div>
    </div>
  );
}