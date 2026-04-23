import Link from 'next/link';

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      emoji: '🔍',
      title: 'Browse',
      subtitle: 'Latest Notifications',
      description: 'SarkariPulse par latest job notifications, results, admit cards browse kariye. AI-powered updates har 10 minute.',
      action: 'Browse Jobs',
      href: '/jobs',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      number: 2,
      emoji: '📖',
      title: 'Read',
      subtitle: 'Complete Details',
      description: 'Job ki complete details padhiye — eligibility, last date, salary, vacancy count. Hinglish mein easy language.',
      action: 'View Sample',
      href: '/jobs',
      color: 'from-purple-500 to-pink-500'
    },
    {
      number: 3,
      emoji: '🚀',
      title: 'Apply',
      subtitle: 'Direct Official Links',
      description: 'Direct official website par jaayiye aur apply kariye. Step-by-step guide aur tips bhi milte hain.',
      action: 'Start Applying',
      href: '/jobs',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <section className="how-it-works-section">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black text-ink mb-3">
          Kaise Kaam Karta Hai <span className="gradient-text">SarkariPulse</span>? 🤔
        </h2>
        <p className="text-sm text-muted max-w-2xl mx-auto leading-relaxed">
          Sirf 3 simple steps mein latest sarkari job notifications se lekar application tak — 
          sab kuch ek hi jagah, bilkul free!
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.number} className="relative">
            {/* Connection Line (hidden on mobile) */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-16 left-full w-8 h-0.5 bg-gradient-to-r from-stone-300 to-stone-200 z-0" />
            )}
            
            <div className="card !p-6 text-center relative z-10 group hover:shadow-xl transition-all duration-300">
              {/* Step Number Badge */}
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${step.color} text-white text-lg font-black mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {step.number}
              </div>
              
              {/* Emoji */}
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {step.emoji}
              </div>
              
              {/* Title & Subtitle */}
              <h3 className="text-lg font-black text-ink mb-1 group-hover:text-accent transition">
                {step.title}
              </h3>
              <p className="text-sm font-bold text-accent mb-3">
                {step.subtitle}
              </p>
              
              {/* Description */}
              <p className="text-xs text-muted leading-relaxed mb-4">
                {step.description}
              </p>
              
              {/* Action Button */}
              <Link
                href={step.href}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${step.color} text-white text-xs font-bold shadow-sm transition hover:shadow-md hover:scale-105`}
              >
                {step.action} →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 text-center">
        <div className="inline-block p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
          <h3 className="text-lg font-black text-amber-800 mb-2">
            🎯 Ready to Start?
          </h3>
          <p className="text-sm text-amber-700 mb-4 max-w-md">
            Abhi browse kariye latest notifications aur apna dream job dhundiye!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-white text-sm font-bold shadow-sm transition hover:bg-accent-dark hover:shadow-md"
            >
              🚀 Browse Latest Jobs
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-accent text-accent text-sm font-bold transition hover:bg-accent hover:text-white"
            >
              🔍 Search Specific Job
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}