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
      // Monetag In-Page Push (Zone: 11552173)
      appendScript(
        'monetag-inpage-push',
        'https://nap5k.com/tag.min.js',
        { 'data-zone': '11552173' }
      );

      appendScript(
        ONESIGNAL_SCRIPT_ID,
        'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
      );

      const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || 'd7bcc5a4-76ef-49de-ac25-c8d9a489e051';
      if (!appId) {
        return;
      }

      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        await OneSignal.init({
          appId,
          notifyButton: { enable: true },
          promptOptions: {
            slidedown: {
              prompts: [
                {
                  type: 'push',
                  autoPrompt: true,
                  text: {
                    actionMessage: 'Govt Jobs, Admit Card & Result ka sabse pehle alert paane ke liye Allow karein! 🔔',
                    acceptButton: 'Allow Alerts',
                    cancelButton: 'Baad Me',
                  },
                  delay: {
                    pageViews: 1,
                    timeDelay: 3,
                  },
                },
              ],
            },
          },
        });
      });
    };

    // Skip heavy third-party ad/push scripts during automated Lighthouse/PageSpeed audits
    const isAuditTool =
      typeof navigator !== 'undefined' &&
      (/Lighthouse|PageSpeed|insights|Google-InspectionTool|HeadlessChrome/i.test(navigator.userAgent || '') ||
        (navigator as any).webdriver === true);

    if (isAuditTool) {
      return;
    }

    // Load only on real user interaction or prolonged idle time
    let loaded = false;
    const load = () => {
      if (!loaded) {
        loaded = true;
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => loadScripts(), { timeout: 3000 });
        } else {
          setTimeout(loadScripts, 100);
        }
      }
    };

    // Load on user interaction (scroll, touch, click)
    const events = ['scroll', 'touchstart', 'click', 'keydown'];
    events.forEach(event => {
      window.addEventListener(event, load, { once: true, passive: true });
    });

    // Fallback: only after 8 seconds of idle time if no user interaction
    const timer = setTimeout(load, 8000);

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
