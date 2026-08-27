'use client';

import { useEffect, useRef, useState } from 'react';

interface AdSlotProps {
  zoneId?: string;
  scriptSrc?: string;
  className?: string;
}

export function AdSlot({ zoneId, scriptSrc, className = '' }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [hasBanner, setHasBanner] = useState<boolean>(false);

  useEffect(() => {
    // Monetag zone 11552173 is an In-Page Push zone that renders floating popups (handled in ThirdPartyScripts.tsx).
    // Inline banner boxes should only display when an explicit inline banner script/zoneId is configured.
    if (!scriptSrc && (!zoneId || zoneId === '11552173')) {
      setHasBanner(false);
      return;
    }

    if (!adRef.current) return;
    const container = adRef.current;
    if (container.children.length > 0) return; // Prevent duplicate injection

    try {
      const script = document.createElement('script');
      script.src = scriptSrc || 'https://nap5k.com/tag.min.js';
      script.async = true;
      if (zoneId) {
        script.setAttribute('data-zone', zoneId);
      }
      container.appendChild(script);
      setHasBanner(true);
    } catch (e) {
      console.error('AdSlot script error:', e);
    }
  }, [zoneId, scriptSrc]);

  if (!hasBanner) {
    return null; // Don't show empty placeholder box if no inline banner code is active
  }

  return (
    <div className={`my-6 flex flex-col items-center justify-center rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 text-center overflow-hidden ${className}`}>
      <span className="text-[9px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
        Advertisement
      </span>
      <div ref={adRef} className="w-full flex justify-center items-center">
        {/* Banner container */}
      </div>
    </div>
  );
}

