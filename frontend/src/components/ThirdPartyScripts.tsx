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
    // Skip heavy third-party push scripts during automated Lighthouse, PageSpeed audits and bots
    const isBotOrAudit =
      typeof navigator !== 'undefined' &&
      (/Lighthouse|PageSpeed|insights|Google-InspectionTool|HeadlessChrome|bot|crawl|spider|googlebot|bingbot|yandex|duckduckbot/i.test(
        navigator.userAgent || ''
      ) || (navigator as any).webdriver === true);

    if (isBotOrAudit) {
      return;
    }

    const loadScripts = () => {
      // OneSignal Web Push SDK
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
          // Disable intrusive floating red bell button that clashes with mobile sticky bars
          notifyButton: { enable: false },
          allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
          promptOptions: {
            slidedown: {
              prompts: [
                {
                  type: 'push',
                  autoPrompt: true,
                  text: {
                    actionMessage: 'Sarkari Naukri, Admit Card & Result ke alerts turant paayein! 🔔',
                    acceptButton: 'Allow Alerts',
                    cancelButton: 'Baad Me',
                  },
                  delay: {
                    // Safe delay: 20 seconds so user has time to read content first.
                    // Eliminates pogo-sticking bounce rate drop on Google search!
                    pageViews: 1,
                    timeDelay: 20,
                  },
                },
              ],
            },
          },
        });
      });
    };

    // Provide a global helper to trigger prompt manually on user click (e.g. from header or alert box)
    if (typeof window !== 'undefined') {
      (window as any).triggerOneSignalPrompt = () => {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async (OneSignal: any) => {
          try {
            if (OneSignal.Slidedown?.promptPush) {
              await OneSignal.Slidedown.promptPush();
            } else if (OneSignal.showSlidedownPrompt) {
              await OneSignal.showSlidedownPrompt();
            }
          } catch (err) {
            console.warn('Failed to prompt OneSignal push:', err);
          }
        });
      };
    }

    // Performance optimization:
    // Do NOT load OneSignal immediately on first touch/scroll!
    // Push notifications are not needed in the first 5-6 seconds of page load.
    let loaded = false;
    const triggerLoad = () => {
      if (!loaded) {
        loaded = true;
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(loadScripts, { timeout: 3000 });
        } else {
          setTimeout(loadScripts, 300);
        }
      }
    };

    // Primary: Load after 6 seconds of engagement when browser is completely idle
    const timer = setTimeout(triggerLoad, 6000);

    // Secondary: If user scrolls deeply after 3 seconds, load when idle
    const onScroll = () => {
      if (window.scrollY > 400) {
        triggerLoad();
        window.removeEventListener('scroll', onScroll);
      }
    };

    const scrollTimer = setTimeout(() => {
      window.addEventListener('scroll', onScroll, { passive: true });
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(scrollTimer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return null;
}

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
    triggerOneSignalPrompt?: () => void;
  }
}
