'use client';

import React, { useState, useEffect } from 'react';

export const MobileStickySocial: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const telegramLink = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || 'https://t.me/sarkaripulse';
  const facebookLink = process.env.NEXT_PUBLIC_FACEBOOK_PAGE || 'https://www.facebook.com/share/1Ea8Q3zg84/';

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-stone-900/95 backdrop-blur-lg border-t border-stone-800 p-2.5 shadow-2xl animate-slide-up">
      <div className="flex items-center justify-between gap-2 container-wrap">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-xl animate-bounce">✈️</span>
          <div className="truncate">
            <p className="text-xs font-black text-white truncate">Sarkari Job Alert Telegram</p>
            <p className="text-[10px] text-stone-400 truncate">Sabse Pehle Instant Notification</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-black text-white shadow transition active:scale-95 flex items-center gap-1"
            id="sticky-mobile-telegram"
          >
            <span>✈️</span> Join
          </a>
          <a
            href={facebookLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-black text-white shadow transition active:scale-95 flex items-center gap-1"
            id="sticky-mobile-facebook"
          >
            <span>📘</span> Follow
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1 text-stone-400 hover:text-white text-xs ml-1"
            aria-label="Close social banner"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
