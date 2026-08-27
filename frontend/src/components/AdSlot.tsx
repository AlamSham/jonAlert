'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  zoneId?: string;
  format?: 'banner' | 'in-feed' | 'native';
  className?: string;
}

export function AdSlot({ zoneId = '11552173', className = '' }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current || !zoneId) return;

    // Create container for Monetag / AdSense banner
    const container = adRef.current;
    if (container.children.length > 0) return; // Prevent duplicate script injection

    try {
      const script = document.createElement('script');
      script.src = 'https://nap5k.com/tag.min.js';
      script.async = true;
      script.setAttribute('data-zone', zoneId);
      container.appendChild(script);
    } catch (e) {
      console.error('AdSlot script error:', e);
    }
  }, [zoneId]);

  return (
    <div className={`my-6 flex flex-col items-center justify-center min-h-[90px] rounded-xl border border-stone-200/60 bg-stone-50/50 p-2 text-center overflow-hidden ${className}`}>
      <span className="text-[9px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
        Advertisement
      </span>
      <div ref={adRef} className="w-full flex justify-center items-center">
        {/* Monetag or AdSense container */}
      </div>
    </div>
  );
}
