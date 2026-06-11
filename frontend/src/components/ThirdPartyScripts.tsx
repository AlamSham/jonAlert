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
  }, []);

  return null;
}

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
  }
}
