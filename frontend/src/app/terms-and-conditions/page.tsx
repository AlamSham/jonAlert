import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms and Conditions — SarkariPulse',
  description: 'SarkariPulse ke terms and conditions padhiye. Hamari website aur services ke use ke rules aur guidelines.',
  alternates: { canonical: '/terms-and-conditions' },
};

export default function TermsAndConditionsPage() {
  return (
    <div className="container-wrap py-12 animate-fade-in max-w-3xl">
      <h1 className="text-3xl font-black text-ink mb-2">Terms and Conditions</h1>
      <p className="text-sm text-muted mb-8">Last Updated: December 15, 2024</p>

      <div className="space-y-6 text-sm leading-relaxed text-ink/85">
        <section>
          <h2 className="text-lg font-bold text-ink mb-2">1. Acceptance of Terms</h2>
          <p>
            SarkariPulse (<strong>sarkaripulse.net</strong>) ko use karke aap hamare Terms and Conditions ko accept karte hain. Agar aap in terms se agree nahi karte, toh please hamari website use na karein.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">2. Use of Site &amp; Services</h2>
          <p>
            Hum aapko latest government jobs notifications, admission updates, results, answer keys aur admit cards ki information provide karte hain.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
            <li>Aap is website ko sirf personal aur non-commercial use ke liye access kar sakte hain.</li>
            <li>Website ke content ko automate download (scraping) karna without written permission strictly prohibited hai.</li>
            <li>Aap website par koi harmful ya malicious activity perform nahi karenge.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">3. Accuracy of Content &amp; Job Details</h2>
          <p>
            SarkariPulse ek news, education, aur job updates aggregator portal hai. Hum sabhi updates public resources aur official notifications se verify karke publish karte hain. Lekin user ki responsibility hai ki kisi form ko apply karne ya fees pay karne se pehle <strong>original official government notification</strong> aur unki website check karein.
          </p>
          <p className="mt-2">
            Kisi bhi visual representation ya text compilation mein human/technical errors hone par hum responsible nahi hain. Hamesha department ki official guidelines follow karein.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">4. Third-Party Websites &amp; Resources</h2>
          <p>
            Hamare pages mein job application forms aur official advertisements ke links hote hain jo third-party networks (government websites aur departments) par direct karte hain. In sources par transition karne ke baad aap unki native policies ke under aate hain. Hum in links ke safety, uptime, ya policy deviations ke liye responsible nahi hain.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">5. User Registration &amp; Alerts</h2>
          <p>
            Push notification, newsletter, WhatsApp group updates, ya email subscriptions aap completely voluntarily use karte hain. Aap kabhi bhi in options se unsubscribe/opt-out kar sakte hain. Hum kisi bhi alert delivery delay ke liye responsible nahi hain.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">6. Limitation of Liability</h2>
          <p>
            SarkariPulse, iske developers aur associates kisi bhi economic, career, data, ya platform accessibility related loss ke liye liable nahi hain. Platform usage 'As Is' aur 'As Available' basis par dynamic search optimization logic use karke kiya jata hai.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">7. Intellectual Property</h2>
          <p>
            Website par available logo, designs, UI elements, custom text formatting aur structures hamari assets hain. Government departments ke logos aur official notification circular drafts unke respective owners ke copyright properties hain.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">8. Changes to Terms</h2>
          <p>
            Hum in Terms of Service aur Privacy Guidelines ko kisi bhi samay scale/modify kar sakte hain. Updates direct is page par post honge.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-2">9. Contact Us</h2>
          <p>
            Agar aapko hamari Terms of Service ya kisi other policy se related koi clarity chahiye, toh aap hamare{' '}
            <Link href="/contact" className="text-accent hover:text-accent-dark font-semibold transition">Contact Page</Link>{' '}
            par message drop kar sakte hain.
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
