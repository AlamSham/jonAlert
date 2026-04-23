import Link from 'next/link';

interface HowToApplyProps {
  applyLink: string;
  title: string;
}

export function HowToApply({ applyLink, title }: HowToApplyProps) {
  const steps = [
    {
      number: 1,
      title: 'Official Website Visit Karein',
      description: 'Sabse pehle official website par jaayiye aur notification carefully padhiye.',
      icon: '🌐'
    },
    {
      number: 2,
      title: 'Online Application Form Bhariye',
      description: 'Registration kariye aur application form mein saari details accurately fill kariye.',
      icon: '📝'
    },
    {
      number: 3,
      title: 'Documents Upload Kariye',
      description: 'Zaroori documents jaise photo, signature, certificates upload kariye (proper format mein).',
      icon: '📎'
    },
    {
      number: 4,
      title: 'Application Fee Pay Kariye',
      description: 'Agar application fee hai toh online payment kariye (debit/credit card ya net banking se).',
      icon: '💳'
    },
    {
      number: 5,
      title: 'Submit Karke Receipt Save Kariye',
      description: 'Form submit karne ke baad confirmation page ka printout zaroor liye aur receipt save kariye.',
      icon: '✅'
    }
  ];

  return (
    <section className="how-to-apply-section">
      <h2 className="text-lg font-bold text-ink mb-4">
        🚀 {title} ke liye Kaise Apply Karein?
      </h2>
      
      <div className="space-y-4 mb-6">
        {steps.map((step) => (
          <div key={step.number} className="flex gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border border-blue-200/40">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white text-sm font-bold">
                {step.number}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg" aria-hidden="true">{step.icon}</span>
                <h3 className="font-bold text-ink text-sm">{step.title}</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={applyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-accent-dark hover:shadow-md"
        >
          🔗 Official Website Par Apply Karein
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-stone-300 px-6 py-3 text-sm font-bold text-ink transition hover:bg-stone-50"
        >
          ❓ Help Chahiye?
        </Link>
      </div>

      <div className="mt-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/40">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>⚠️ Important:</strong> Hamesha official website se hi apply kariye. Fake websites se bachiye aur koi bhi third-party ke through payment na kariye. Last date se pehle apply kar diye.
        </p>
      </div>
    </section>
  );
}