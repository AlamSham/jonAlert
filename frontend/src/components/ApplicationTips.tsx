export function ApplicationTips() {
  const tips = [
    {
      icon: '📋',
      title: 'Notification Dhyan Se Padhiye',
      description: 'Puri notification carefully read kariye — eligibility, age limit, aur important dates miss na kariye.'
    },
    {
      icon: '✅',
      title: 'Eligibility Pehle Check Kariye',
      description: 'Apply karne se pehle confirm kar liye ki aap eligible hain — education, age, aur category requirements.'
    },
    {
      icon: '📁',
      title: 'Documents Ready Rakhiye',
      description: 'Saare zaroori documents scan karke ready rakhiye — photo, signature, certificates (proper size mein).'
    },
    {
      icon: '⏰',
      title: 'Last Date Se Pehle Apply Kariye',
      description: 'Last minute mein rush na kariye — 2-3 din pehle hi form submit kar diye. Server busy ho sakta hai.'
    },
    {
      icon: '💾',
      title: 'Receipt Aur Confirmation Save Kariye',
      description: 'Application submit karne ke baad receipt print kariye aur email confirmation save kariye — future reference ke liye.'
    }
  ];

  return (
    <section className="application-tips-section">
      <h2 className="text-lg font-bold text-ink mb-4">
        💡 Application Tips — Success Ke Liye
      </h2>
      
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {tips.map((tip, index) => (
          <div key={index} className="flex gap-3 p-4 rounded-2xl bg-gradient-to-r from-green-50/60 to-emerald-50/60 border border-green-200/40">
            <div className="flex-shrink-0">
              <span className="text-2xl" aria-hidden="true">{tip.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-ink text-sm mb-1">{tip.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-200/40">
        <h3 className="font-bold text-ink text-sm mb-2">🎯 Pro Tips:</h3>
        <ul className="text-xs text-muted space-y-1 leading-relaxed">
          <li>• Multiple attempts allowed hai toh practice test zaroor diye</li>
          <li>• Form fill karte time internet connection stable rakhiye</li>
          <li>• Payment failure ho jaye toh panic na kariye — retry kar sakte hain</li>
          <li>• Admit card download hone ke baad exam center location check kar liye</li>
        </ul>
      </div>
    </section>
  );
}