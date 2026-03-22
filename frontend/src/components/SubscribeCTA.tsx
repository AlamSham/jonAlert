import Link from 'next/link';

export function SubscribeCTA() {
  const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_GROUP || '#';
  const telegramLink = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || '#';

  return (
    <section className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-teal-200/50 p-6 sm:p-8" id="subscribe-cta">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="text-5xl">📲</div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-black text-ink">Koi Update Miss Mat Karo!</h3>
          <p className="mt-1 text-sm text-muted leading-relaxed">
            Latest jobs, admission, scholarship aur exam form updates seedha apne phone pe — join karo humara channel!
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-green-700 hover:shadow-lg active:scale-95"
            id="cta-whatsapp"
          >
            💬 WhatsApp Join
          </a>
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg active:scale-95"
            id="cta-telegram"
          >
            ✈️ Telegram Join
          </a>
        </div>
      </div>
    </section>
  );
}
