'use client';

import React, { useState, useEffect } from 'react';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user previously dismissed
      const dismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      window.location.href = '/app';
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-14 left-3 right-3 z-50 md:hidden animate-slide-up">
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-3 text-white shadow-2xl border border-blue-400/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl shadow-inner backdrop-blur-md">
            📲
          </span>
          <div className="truncate">
            <p className="text-xs font-black truncate text-white leading-tight">
              SarkariPulse Official App
            </p>
            <p className="text-[11px] text-blue-100 truncate">
              Fast Notifications & 1-Click Apply
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-black text-stone-900 shadow-md transition active:scale-95 hover:bg-amber-300 flex items-center gap-1"
            id="pwa-install-btn"
          >
            ⚡ Install
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-lg p-1 text-blue-200 hover:text-white text-xs"
            aria-label="Dismiss app prompt"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
