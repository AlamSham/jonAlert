import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us — SarkariPulse | India\'s Trusted Sarkari Job Portal',
  description: 'SarkariPulse ke baare mein jaaniye. Hum India ka leading government job notification platform hain jo daily 50,000+ students ko latest sarkari naukri updates provide karta hai.',
  alternates: {
    canonical: 'https://sarkaripulse.net/about',
  },
};

export default function AboutPage() {
  return (
    <div className="container-wrap py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-black text-ink mb-4">
            About SarkariPulse 🚀
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            India's Most Trusted Platform for Sarkari Naukri, Admission, Scholarship Updates
          </p>
        </header>

        {/* Mission Section */}
        <section className="card !p-8 mb-8">
          <h2 className="text-2xl font-bold text-ink mb-4 flex items-center gap-2">
            🎯 Our Mission
          </h2>
          <p className="text-base leading-relaxed text-ink/90 mb-4">
            SarkariPulse ka mission hai har Indian student aur job seeker ko <strong>latest government job notifications</strong>, college admissions, scholarships, exam results aur admit cards ki jankari <strong>bilkul free aur real-time</strong> provide karna. Hum chahte hain ki koi bhi deserving candidate sirf information ki kami ke kaaran apna dream sarkari job miss na kare.
          </p>
          <p className="text-base leading-relaxed text-ink/90">
            Humara platform <strong>user-first approach</strong> follow karta hai — simple Hinglish language, mobile-friendly design, aur direct official links ke saath. Hum daily <strong>50,000+ students</strong> ko serve kar rahe hain across India.
          </p>
        </section>

        {/* Why SarkariPulse Section */}
        <section className="card !p-8 mb-8">
          <h2 className="text-2xl font-bold text-ink mb-4 flex items-center gap-2">
            💡 Why SarkariPulse?
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-ink mb-2">✅ 100% Free Forever</h3>
              <p className="text-base leading-relaxed text-ink/90">
                SarkariPulse par koi registration fee, subscription ya hidden charges nahi hai. Sab kuch completely free hai aur hamesha rahega. Humara goal profit nahi, service hai.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-ink mb-2">🤖 Regular Updates</h3>
              <p className="text-base leading-relaxed text-ink/90">
                Humari dedicated editorial team regularly government websites monitor karti hai aur har notification ko verify karke publish karti hai. Updates fast aur accurate hote hain taaki aap koi opportunity miss na karein.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-ink mb-2">🛡️ Verified Information</h3>
              <p className="text-base leading-relaxed text-ink/90">
                Har notification official government sources se verify kiya jata hai. Hum fake news ya misleading information publish nahi karte. Direct official links aur PDF notifications provide karte hain.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-ink mb-2">📱 Mobile-First Design</h3>
              <p className="text-base leading-relaxed text-ink/90">
                90% users mobile se browse karte hain, isliye humara platform mobile-first design pe focus karta hai. Fast loading, easy navigation aur data-friendly experience.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-ink mb-2">🇮🇳 Made for India</h3>
              <p className="text-base leading-relaxed text-ink/90">
                Content Hinglish mein hai — Hindi + English ka perfect mix. Isse tier 2 aur tier 3 cities ke students ko bhi easily samajh aa jata hai. No complex English jargon.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-ink mb-2">⚡ Real-Time Alerts</h3>
              <p className="text-base leading-relaxed text-ink/90">
                WhatsApp, Telegram aur Email ke through instant notifications milte hain. Aap kabhi koi important notification miss nahi karenge.
              </p>
            </div>
          </div>
        </section>

        {/* What We Cover Section */}
        <section className="card !p-8 mb-8">
          <h2 className="text-2xl font-bold text-ink mb-4 flex items-center gap-2">
            📂 What We Cover
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-stone-200 rounded-xl p-4">
              <h3 className="text-base font-bold text-ink mb-2">💼 Sarkari Naukri</h3>
              <p className="text-sm text-muted">UPSC, SSC, Railway, Banking, Police, Defence, State Government jobs aur har level ki bharti notifications.</p>
            </div>
            <div className="border border-stone-200 rounded-xl p-4">
              <h3 className="text-base font-bold text-ink mb-2">🎓 College Admissions</h3>
              <p className="text-sm text-muted">IIT, NIT, Medical, Engineering, Law, Management colleges ke admission notifications aur counselling updates.</p>
            </div>
            <div className="border border-stone-200 rounded-xl p-4">
              <h3 className="text-base font-bold text-ink mb-2">💰 Scholarships</h3>
              <p className="text-sm text-muted">Central aur state government scholarships, PM schemes, minority scholarships aur merit-based yojanas.</p>
            </div>
            <div className="border border-stone-200 rounded-xl p-4">
              <h3 className="text-base font-bold text-ink mb-2">📊 Exam Results</h3>
              <p className="text-sm text-muted">10th, 12th board results, competitive exam results, cutoff marks aur scorecard download links.</p>
            </div>
            <div className="border border-stone-200 rounded-xl p-4">
              <h3 className="text-base font-bold text-ink mb-2">🎫 Admit Cards</h3>
              <p className="text-sm text-muted">Sarkari exam admit cards, hall tickets aur call letters ki download links with instructions.</p>
            </div>
            <div className="border border-stone-200 rounded-xl p-4">
              <h3 className="text-base font-bold text-ink mb-2">🏛️ Sarkari Yojana</h3>
              <p className="text-sm text-muted">PM Kisan, Ayushman Bharat, Mudra Loan aur sabhi government schemes ki complete jankari.</p>
            </div>
          </div>
        </section>

        {/* Our Commitment Section */}
        <section className="card !p-8 mb-8">
          <h2 className="text-2xl font-bold text-ink mb-4 flex items-center gap-2">
            🤝 Our Commitment
          </h2>
          <ul className="space-y-3 text-base leading-relaxed text-ink/90">
            <li className="flex gap-3">
              <span>✅</span>
              <span><strong>Accuracy:</strong> Har notification official sources se verify karke publish karte hain.</span>
            </li>
            <li className="flex gap-3">
              <span>✅</span>
              <span><strong>Timeliness:</strong> Latest notifications turant publish karte hain taaki aap apply kar sakein.</span>
            </li>
            <li className="flex gap-3">
              <span>✅</span>
              <span><strong>Transparency:</strong> Koi hidden charges ya misleading information nahi. Sab kuch clear hai.</span>
            </li>
            <li className="flex gap-3">
              <span>✅</span>
              <span><strong>User Privacy:</strong> Aapka personal data safe aur secure hai. Hum spam nahi karte.</span>
            </li>
            <li className="flex gap-3">
              <span>✅</span>
              <span><strong>Support:</strong> Agar koi query hai to hum help ke liye available hain.</span>
            </li>
          </ul>
        </section>

        {/* Our Team Section */}
        <section className="card !p-8 mb-8">
          <h2 className="text-2xl font-bold text-ink mb-4 flex items-center gap-2">
            👥 Our Team
          </h2>
          <p className="text-base leading-relaxed text-ink/90 mb-4">
            SarkariPulse ki team mein dedicated content writers, editors aur technical experts hain jo government job ecosystem ko deeply understand karte hain. Humari team members khud competitive exams clear kar chuke hain aur students ki struggles ko samajhte hain.
          </p>
          <p className="text-base leading-relaxed text-ink/90">
            Hum believe karte hain ki <strong>right information at the right time</strong> can change lives. Isliye har notification ko carefully review karke, complete details ke saath publish karte hain.
          </p>
        </section>

        {/* Statistics Section */}
        <section className="card !p-8 mb-8 bg-gradient-to-br from-amber-50 to-orange-50">
          <h2 className="text-2xl font-bold text-ink mb-6 text-center">
            📊 SarkariPulse by Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-black text-accent">50K+</p>
              <p className="text-sm text-muted mt-1">Daily Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-accent">5000+</p>
              <p className="text-sm text-muted mt-1">Job Notifications</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-accent">100%</p>
              <p className="text-sm text-muted mt-1">Free Service</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-accent">24/7</p>
              <p className="text-sm text-muted mt-1">Available</p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="card !p-6 mb-8 bg-stone-50">
          <h2 className="text-xl font-bold text-ink mb-3">⚠️ Important Disclaimer</h2>
          <p className="text-sm leading-relaxed text-ink/90">
            SarkariPulse ek <strong>independent information portal</strong> hai. Hum kisi bhi government organization se officially affiliated nahi hain. Humara kaam sirf information provide karna hai, actual recruitment/selection process government authorities handle karti hain. Application forms direct official websites par bharne hote hain, hum beech mein nahi aate.
          </p>
        </section>

        {/* CTA Section */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold text-ink mb-4">
            Ready to Start Your Sarkari Job Journey? 🚀
          </h2>
          <p className="text-base text-muted mb-6">
            Latest notifications browse kariye aur apna dream job dhundiye!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:shadow-xl active:scale-95"
            >
              Browse Latest Jobs
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-accent bg-white px-8 py-3.5 text-sm font-bold text-accent shadow-sm transition hover:bg-accent/5 active:scale-95"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
