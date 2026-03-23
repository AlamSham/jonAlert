"use client";

import { useState } from 'react';

export function SubscribeCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_GROUP || '#';
  const telegramLink = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || '#';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setStatus('success');
      setMessage('Successfully subscribed! 🎉');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to subscribe. Try again.');
    }
  };

  return (
    <section className="rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-fuchsia-50 border border-purple-200/50 p-6 sm:p-8" id="subscribe-cta">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
            <span className="text-4xl">📬</span>
            <h3 className="text-2xl font-black text-ink">Sarkari Updates Direct & Instant</h3>
          </div>
          <p className="mt-2 text-sm text-muted leading-relaxed max-w-xl mx-auto lg:mx-0">
            Get instant email alerts for new Sarkari Naukri, Admit Cards, and Results. Zero spam. One-click unsubscribe. Plus, join our fast WhatsApp/Telegram communities!
          </p>
          
          <form onSubmit={handleSubmit} className="mt-6 flex max-w-md mx-auto lg:mx-0 drop-shadow-sm">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              placeholder="Enter your email address..."
              className="flex-1 rounded-l-xl border-y border-l border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:bg-stone-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="rounded-r-xl border border-purple-600 bg-purple-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-700 active:scale-95 disabled:bg-purple-400 disabled:border-purple-400"
            >
              {status === 'loading' ? 'Loading...' : 'Subscribe'}
            </button>
          </form>
          {message && (
            <p className={`mt-2 text-sm font-semibold ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-green-700 hover:shadow-lg active:scale-95"
            id="cta-whatsapp"
          >
            💬 WhatsApp Join
          </a>
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-600 hover:shadow-lg active:scale-95"
            id="cta-telegram"
          >
            ✈️ Telegram Join
          </a>
        </div>
      </div>
    </section>
  );
}
