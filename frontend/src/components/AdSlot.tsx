'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  zoneId?: string;
  scriptSrc?: string;
  className?: string;
}

export function AdSlot({
  zoneId = '273631',
  scriptSrc = 'https://quge5.com/88/tag.min.js',
  className = '',
}: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;
    const container = adRef.current;
    if (container.children.length > 0) return; // Prevent duplicate injection

    try {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      if (zoneId) {
        script.setAttribute('data-zone', zoneId);
      }
      container.appendChild(script);
    } catch (e) {
      console.error('AdSlot script error:', e);
    }
  }, [zoneId, scriptSrc]);

  return (
    <div className={`my-6 flex flex-col items-center justify-center min-h-[90px] rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 text-center overflow-hidden ${className}`}>
      <span className="text-[9px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
        Advertisement
      </span>
      <div ref={adRef} className="w-full flex justify-center items-center min-h-[50px]">
        {/* Monetag Multitag Container */}
      </div>
    </div>
  );
}


