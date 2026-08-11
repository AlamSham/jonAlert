'use client';

import React from 'react';

interface SocialJoinBannerProps {
  variant?: 'banner' | 'compact' | 'sticky';
}

export const SocialJoinBanner: React.FC<SocialJoinBannerProps> = ({ variant = 'banner' }) => {
  const telegramLink = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || 'https://t.me/govtjob_alert_job_alert_bot';
  const facebookLink = process.env.NEXT_PUBLIC_FACEBOOK_PAGE || 'https://www.facebook.com/share/1Ea8Q3zg84/';
  const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_GROUP || 'https://whatsapp.com';

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✈️</span>
          <div>
            <h4 className="font-bold text-sm">Join Official Telegram Channel</h4>
            <p className="text-xs text-blue-100">Sabse Pehle Instant Sarkari Job Alerts Paayein</p>
          </div>
        </div>
        <a
          href={telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-white px-4 py-2 text-xs font-black text-blue-700 shadow transition hover:bg-blue-50 active:scale-95 shrink-0"
        >
          Join Now 🚀
        </a>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white shadow-xl relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md">
            🔥 50,000+ Aspirants Joined
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Sarkari Job Update Telegram & Facebook Par Sabse Pehle!
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Google search me late notification milne se pehle humare official channels join karein. Har bharti, result aur admit card ka instant alert paayein!
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 shrink-0 w-full md:w-auto">
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-blue-600 shadow-lg transition hover:bg-blue-50 hover:shadow-xl active:scale-95"
            id="banner-telegram-btn"
          >
            <span className="text-lg">✈️</span>
            Join Telegram
          </a>
          <a
            href={facebookLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800/80 border border-white/20 px-5 py-3 text-sm font-black text-white shadow-lg backdrop-blur-md transition hover:bg-blue-800 active:scale-95"
            id="banner-facebook-btn"
          >
            <span className="text-lg">📘</span>
            Follow Facebook
          </a>
        </div>
      </div>
    </div>
  );
};
