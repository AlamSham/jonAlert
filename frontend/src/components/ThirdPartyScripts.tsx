'use client';

import { useEffect } from 'react';

const ONESIGNAL_SCRIPT_ID = 'onesignal-sdk-script';

function appendScript(id: string, src: string, attributes: Record<string, string> = {}) {
  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;

  Object.entries(attributes).forEach(([name, value]) => {
    script.setAttribute(name, value);
  });

  document.body.appendChild(script);
}

export function ThirdPartyScripts() {
  useEffect(() => {
    // Defer script loading until after page is interactive
    // This improves FCP and LCP scores significantly
    const loadScripts = () => {
      appendScript(
        ONESIGNAL_SCRIPT_ID,
        'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
      );

      const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
      if (!appId) {
        return;
      }

      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        await OneSignal.init({
          appId,
          notifyButton: { enable: true },
        });
      });
    };

    // Load after 2 seconds or on user interaction (whichever comes first)
    let loaded = false;
    const load = () => {
      if (!loaded) {
        loaded = true;
        loadScripts();
      }
    };

    // Option 1: Load after 2 seconds
    const timer = setTimeout(load, 2000);

    // Option 2: Load on first user interaction
    const events = ['mousedown', 'touchstart', 'keydown', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, load, { once: true, passive: true });
    });

    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, load));
    };
  }, []);

  return null;
}

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
  }
}
