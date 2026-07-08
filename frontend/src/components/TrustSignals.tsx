export function TrustSignals() {
  const signals = [
    {
      emoji: '🔄',
      title: 'Regular Updates',
      description: 'Frequently updated by our editorial team — koi notification miss nahi hoga',
      highlight: 'Regularly Updated'
    },
    {
      emoji: '⚡',
      title: 'Real-Time Alerts',
      description: 'Turant push notification WhatsApp, Telegram aur email par',
      highlight: 'Instant Alerts'
    },
    {
      emoji: '🎯',
      title: '100% Free Service',
      description: 'Koi registration ya hidden charges nahi — sab kuch bilkul free hai',
      highlight: 'Always Free'
    },
    {
      emoji: '🛡️',
      title: 'Trusted Source',
      description: 'Sirf official government sources se verified data — fake news nahi',
      highlight: 'Verified Data'
    },
    {
      emoji: '📱',
      title: 'Mobile Friendly',
      description: 'Phone, tablet, laptop — har device par perfect experience',
      highlight: 'All Devices'
    },
    {
      emoji: '🇮🇳',
      title: 'Made for India',
      description: 'Hinglish mein content — samajhna easy, padhna simple',
      highlight: 'Hinglish Content'
    }
  ];

  return (
    <section className="trust-signals-section">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-ink mb-3">
          Kyun Chune <span className="gradient-text">SarkariPulse</span>? ⭐
        </h2>
        <p className="text-sm text-muted max-w-2xl mx-auto leading-relaxed">
          Lakhs of students trust karte hain SarkariPulse ko latest sarkari job updates ke liye. 
          Jaaniye kya hai special hamare platform mein!
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {signals.map((signal, index) => (
          <div key={index} className="card !p-6 text-center group hover:shadow-lg transition-all duration-300">
            <div className="mb-4">
              <span className="text-4xl block mb-2 transition group-hover:scale-110 duration-300">
                {signal.emoji}
              </span>
              <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold">
                {signal.highlight}
              </div>
            </div>
            
            <h3 className="font-bold text-ink text-sm mb-2 group-hover:text-accent transition">
              {signal.title}
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              {signal.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <span className="text-2xl">🎉</span>
          <div className="text-left">
            <p className="text-sm font-bold text-green-800">2+ Lakh Students Trust Us</p>
            <p className="text-xs text-green-600">Daily 50,000+ notifications deliver karte hain</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3 text-center">
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/40">
          <p className="text-lg font-black text-blue-800">10 Min</p>
          <p className="text-xs text-blue-600">Update Frequency</p>
        </div>
        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/40">
          <p className="text-lg font-black text-purple-800">24/7</p>
          <p className="text-xs text-purple-600">Service Available</p>
        </div>
        <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/40">
          <p className="text-lg font-black text-orange-800">100%</p>
          <p className="text-xs text-orange-600">Free Forever</p>
        </div>
      </div>
    </section>
  );
}