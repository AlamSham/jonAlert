import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us — SarkariPulse | Get in Touch',
  description: 'SarkariPulse se contact karne ke liye email, social media links aur response time ki jankari. Hum aapki queries ka 24-48 hours mein reply karte hain.',
  alternates: {
    canonical: 'https://sarkaripulse.net/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="container-wrap py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-black text-ink mb-4">
            Contact Us 📧
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            Koi query hai? Hum help ke liye available hain!
          </p>
        </header>

        {/* Contact Info */}
        <section className="card !p-8 mb-8">
          <h2 className="text-2xl font-bold text-ink mb-6">
            Get in Touch
          </h2>
          
          <div className="space-y-6">
            {/* Email */}
            <div className="flex gap-4 items-start">
              <span className="text-3xl">📧</span>
              <div>
                <h3 className="text-lg font-bold text-ink mb-2">Email</h3>
                <p className="text-base text-muted mb-2">
                  General queries, feedback ya suggestions ke liye:
                </p>
                <a 
                  href="mailto:contact@sarkaripulse.net" 
                  className="text-accent font-semibold hover:underline"
                >
                  contact@sarkaripulse.net
                </a>
                <p className="text-sm text-muted mt-2">
                  Response time: 24-48 hours
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-4 items-start">
              <span className="text-3xl">💬</span>
              <div>
                <h3 className="text-lg font-bold text-ink mb-2">Social Media</h3>
                <p className="text-base text-muted mb-3">
                  Daily updates aur instant notifications ke liye follow karein:
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://whatsapp.com/channel/0029VaDUx1m1yT2D0Q7g7Q1h"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href="https://t.me/sarkaripulse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition"
                  >
                    ✈️ Telegram
                  </a>
                </div>
              </div>
            </div>

            {/* Office Address */}
            <div className="flex gap-4 items-start">
              <span className="text-3xl">📍</span>
              <div>
                <h3 className="text-lg font-bold text-ink mb-2">Office Address</h3>
                <p className="text-base text-ink/90">
                  SarkariPulse<br />
                  Online Information Portal<br />
                  India
                </p>
                <p className="text-sm text-muted mt-2">
                  Note: Hum ek digital-first platform hain. Physical walk-ins ke liye prior appointment zaroor lein.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Can Help With */}
        <section className="card !p-8 mb-8">
          <h2 className="text-2xl font-bold text-ink mb-4">
            🤝 What We Can Help With
          </h2>
          <ul className="space-y-3 text-base leading-relaxed text-ink/90">
            <li className="flex gap-3">
              <span>✅</span>
              <span><strong>Job Notifications:</strong> Specific job ki jankari ya status update</span>
            </li>
            <li className="flex gap-3">
              <span>✅</span>
              <span><strong>Website Issues:</strong> Technical problems, broken links, display issues</span>
            </li>
            <li className="flex gap-3">
              <span>✅</span>
              <span><strong>Content Feedback:</strong> Wrong information report karna ya suggestions</span>
            </li>
            <li className="flex gap-3">
              <span>✅</span>
              <span><strong>Partnership Queries:</strong> Advertising, collaborations, business inquiries</span>
            </li>
            <li className="flex gap-3">
              <span>✅</span>
              <span><strong>General Support:</strong> Platform use karne mein help</span>
            </li>
          </ul>
        </section>

        {/* What We Cannot Help With */}
        <section className="card !p-8 mb-8 bg-orange-50 border-orange-200">
          <h2 className="text-2xl font-bold text-ink mb-4">
            ⚠️ Important Note
          </h2>
          <p className="text-base leading-relaxed text-ink/90 mb-4">
            <strong>Please note:</strong> SarkariPulse ek information portal hai. Hum help nahi kar sakte in matters mein:
          </p>
          <ul className="space-y-2 text-base leading-relaxed text-ink/90">
            <li className="flex gap-3">
              <span>❌</span>
              <span>Application form bharne mein direct help (official websites par khud bharein)</span>
            </li>
            <li className="flex gap-3">
              <span>❌</span>
              <span>Exam dates change karna ya admit card issues (recruitment authority se contact karein)</span>
            </li>
            <li className="flex gap-3">
              <span>❌</span>
              <span>Result declaration ya selection process (government authorities handle karti hain)</span>
            </li>
            <li className="flex gap-3">
              <span>❌</span>
              <span>Job guarantee ya placement assurance (hum sirf information provide karte hain)</span>
            </li>
          </ul>
          <p className="text-sm text-muted mt-4">
            In matters ke liye please official recruitment authority se contact karein. Har notification mein official website link diya hota hai.
          </p>
        </section>

        {/* FAQ Section */}
        <section className="card !p-8 mb-8">
          <h2 className="text-2xl font-bold text-ink mb-4">
            ❓ Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-ink mb-2">Q: Email ka response kitne time mein milta hai?</h3>
              <p className="text-base text-ink/90">
                A: Normally 24-48 hours mein reply karte hain. Weekend/holidays par thoda delay ho sakta hai.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink mb-2">Q: Kya aap application form bharne mein help karte ho?</h3>
              <p className="text-base text-ink/90">
                A: Nahi, hum sirf information provide karte hain. Application direct official website par khud bharna hota hai. Humari website par step-by-step guides available hain.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink mb-2">Q: Wrong information report kaise karein?</h3>
              <p className="text-base text-ink/90">
                A: Email karein contact@sarkaripulse.net par. Please mention karein kis notification mein kya wrong hai, taaki hum turant fix kar sakein.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink mb-2">Q: Partnership/advertising opportunities hain?</h3>
              <p className="text-base text-ink/90">
                A: Haan, legitimate businesses ke liye advertising options available hain. Email karein with your proposal.
              </p>
            </div>
          </div>
        </section>

        {/* Alternative Contact Methods */}
        <section className="card !p-8 mb-8 bg-gradient-to-br from-amber-50 to-orange-50">
          <h2 className="text-2xl font-bold text-ink mb-4">
            📱 Stay Connected
          </h2>
          <p className="text-base text-muted mb-4">
            Instant updates aur community support ke liye WhatsApp/Telegram groups join karein:
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://whatsapp.com/channel/0029VaDUx1m1yT2D0Q7g7Q1h"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[200px] text-center rounded-xl bg-white border-2 border-green-500 px-6 py-4 font-bold text-green-700 hover:bg-green-50 transition"
            >
              💬 Join WhatsApp Channel
            </a>
            <a
              href="https://t.me/sarkaripulse"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[200px] text-center rounded-xl bg-white border-2 border-blue-500 px-6 py-4 font-bold text-blue-700 hover:bg-blue-50 transition"
            >
              ✈️ Join Telegram Channel
            </a>
          </div>
        </section>

        {/* Browse Jobs CTA */}
        <section className="text-center py-8">
          <p className="text-base text-muted mb-6">
            Abhi koi query nahi? Latest job notifications browse karein!
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:shadow-xl active:scale-95"
          >
            Browse Latest Jobs →
          </Link>
        </section>
      </div>
    </div>
  );
}
