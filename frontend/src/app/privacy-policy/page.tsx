import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — SarkariPulse',
  description: 'SarkariPulse ki privacy policy padhiye. Hum aapki personal information ko kaise collect, use, aur protect karte hain.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-wrap py-12 animate-fade-in max-w-3xl">
      <h1 className="text-3xl font-black text-ink mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted mb-8">Last Updated: March 27, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-ink/85">
        <section>
          <h2 className="text-lg font-bold text-ink mb-2">1. Introduction</h2>
          <p>
            SarkariPulse (&quot;hum&quot;, &quot;hamara&quot;, &quot;website&quot;) aapki privacy ko bahut seriously leta hai. Ye Privacy Policy batati hai ki hum aapki personal information ko kaise collect, use, aur protect karte hain jab aap hamari website <strong>sarkaripulse.net</strong> use karte hain.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">2. Information We Collect</h2>
          <p>Hum ye information collect kar sakte hain:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
            <li><strong>Email Address</strong> — agar aap hamari email notifications ke liye subscribe karte hain</li>
            <li><strong>Usage Data</strong> — pages visited, time spent, device type (Google Analytics ke through)</li>
            <li><strong>Push Notification Data</strong> — agar aap browser push notifications allow karte hain (OneSignal ke through)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Aapko latest sarkari job notifications bhejne ke liye</li>
            <li>Website performance improve karne ke liye</li>
            <li>User experience ko better banana ke liye</li>
            <li>Analytics aur statistics ke liye (anonymized data)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">4. Cookies &amp; Third-Party Services</h2>
          <p>Hamari website ye third-party services use karti hai:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
            <li><strong>Google Analytics</strong> — website traffic analysis ke liye</li>
            <li><strong>Google AdSense</strong> — advertisements dikhane ke liye</li>
            <li><strong>OneSignal</strong> — push notifications ke liye</li>
            <li><strong>Vercel Analytics</strong> — performance monitoring ke liye</li>
          </ul>
          <p className="mt-2">Ye services apne cookies use kar sakti hain. Inke baare mein detail ke liye unki respective privacy policies dekhein.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">5. Data Security</h2>
          <p>
            Hum aapki personal information ko protect karne ke liye industry-standard security measures use karte hain. Lekin koi bhi internet transmission 100% secure nahi hota, isliye hum absolute security ki guarantee nahi de sakte.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">6. Your Rights</h2>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Aap kabhi bhi email subscription se unsubscribe kar sakte hain</li>
            <li>Browser settings se push notifications disable kar sakte hain</li>
            <li>Apna data delete karne ka request kar sakte hain humse contact karke</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">7. Children&apos;s Privacy</h2>
          <p>
            Hamari website 13 saal se kam umar ke bachchon se knowingly personal information collect nahi karti. Agar aapko lagta hai ki kisi bachche ne hamein personal information di hai, toh please humse contact karein.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">8. Changes to This Policy</h2>
          <p>
            Hum is Privacy Policy ko samay-samay par update kar sakte hain. Changes is page par post kiye jayenge &quot;Last Updated&quot; date ke saath.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">9. Contact Us</h2>
          <p>
            Privacy se related koi sawal hai? Humse{' '}
            <Link href="/contact" className="text-accent hover:text-accent-dark font-semibold transition">Contact Page</Link>{' '}
            par sampark karein.
          </p>
        </section>
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
