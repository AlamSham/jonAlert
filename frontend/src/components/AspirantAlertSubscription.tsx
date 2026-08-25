"use client";

import { useState } from 'react';

const EXAM_PREFERENCES = [
  { id: 'ssc', label: 'SSC (CGL, CHSL, MTS, GD)', icon: '🦅', color: 'border-blue-300 bg-blue-50 text-blue-800' },
  { id: 'upsc', label: 'UPSC & State PSC (IAS, PCS)', icon: '🏛️', color: 'border-amber-300 bg-amber-50 text-amber-800' },
  { id: 'railway', label: 'Railways (RRB NTPC, Group D, ALP)', icon: '🚆', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  { id: 'banking', label: 'Banking (IBPS, SBI PO & Clerk)', icon: '🏦', color: 'border-purple-300 bg-purple-50 text-purple-800' },
  { id: 'police', label: 'Police & Defence (Army, SI, Constable)', icon: '🛡️', color: 'border-red-300 bg-red-50 text-red-800' },
  { id: 'teaching', label: 'Teaching (CTET, State TET, REET)', icon: '🎓', color: 'border-teal-300 bg-teal-50 text-teal-800' },
];

export function AspirantAlertSubscription() {
  const [selectedExams, setSelectedExams] = useState<string[]>(['ssc', 'railway']);
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const toggleExam = (id: string) => {
    if (selectedExams.includes(id)) {
      if (selectedExams.length === 1) return; // Keep at least one selected
      setSelectedExams(selectedExams.filter((e) => e !== id));
    } else {
      setSelectedExams([...selectedExams, id]);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          whatsapp,
          examCategories: selectedExams,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Subscription failed');

      setStatus('success');
      setMessage('🎉 Awesome! Direct Exam Alerts updated successfully!');
      setEmail('');
      setWhatsapp('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Could not save alerts. Try again.');
    }
  };

  const whatsappGroupLink = process.env.NEXT_PUBLIC_WHATSAPP_GROUP || 'https://whatsapp.com/channel/0029VaDUx1m1yT2D0Q7g7Q1h';
  const telegramBotLink = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || 'https://t.me/sarkaripulse';

  return (
    <section
      id="aspirant-alert-center"
      className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 p-6 sm:p-10 text-white shadow-2xl overflow-hidden my-10"
    >
      {/* Background Subtle Glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="max-w-2xl text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1 text-xs font-bold text-indigo-300 mb-3">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            PERSONALIZED ASPIRANT ALERTS
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Apne Targeted Exam Ke Alerts Payein Direct WhatsApp & Email Par! 🎯
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Faltu ki 20 websites check karna chhodiye! Apna exam select kariye — Admit Card, Result, aur Job Notification aate hi turant aapke phone par alert chala jayega.
          </p>
        </div>

        {/* Step 1: Select Exam Categories */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Step 1: Select Your Target Exam Categories:
          </label>
          <div className="flex flex-wrap gap-2.5">
            {EXAM_PREFERENCES.map((exam) => {
              const isSelected = selectedExams.includes(exam.id);
              return (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => toggleExam(exam.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-400 text-white shadow-lg shadow-orange-950/40 ring-2 ring-amber-400/50 scale-105'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <span>{exam.icon}</span>
                  <span>{exam.label}</span>
                  {isSelected && <span className="ml-1 text-xs font-black">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Form & Fast Channels */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Subscription Form */}
          <form onSubmit={handleSubscribe} className="lg:col-span-7 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Step 2: Enter Email / WhatsApp For Instant Alerts:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email Address..."
                className="w-full rounded-xl bg-slate-900/90 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp No. (Optional)..."
                className="w-full rounded-xl bg-slate-900/90 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-sm shadow-lg hover:shadow-orange-950/50 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
            >
              {status === 'loading' ? 'Saving Preferences...' : '🔔 Get My Exam Alerts'}
            </button>

            {message && (
              <p
                className={`text-xs font-bold ${
                  status === 'success' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {message}
              </p>
            )}
          </form>

          {/* Instant Channels CTA */}
          <div className="lg:col-span-5 bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 flex flex-col justify-center space-y-3">
            <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>⚡ Or Join Instant Community Channels:</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={whatsappGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2.5 text-xs font-extrabold text-white shadow transition active:scale-95"
              >
                <span>💬</span> WhatsApp Channel
              </a>
              <a
                href={telegramBotLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-3.5 py-2.5 text-xs font-extrabold text-white shadow transition active:scale-95"
              >
                <span>✈️</span> Telegram Channel
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
