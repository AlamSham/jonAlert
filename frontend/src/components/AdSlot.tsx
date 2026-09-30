'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  /**
   * AdSense Ad Unit Slot ID (from AdSense -> Ads -> By ad unit).
   * If not provided, fallback to process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID.
   */
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const ADSENSE_CLIENT = 'ca-pub-4518508932731576';
const DEFAULT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID || '';

export function AdSlot({
  slot = DEFAULT_SLOT,
  format = 'auto',
  responsive = true,
  variant = 'primary',
  className = '',
}: AdSlotProps) {
  const isPushed = useRef(false);

  useEffect(() => {
    if (!slot) return;

    // Push ad unit once mounted
    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        isPushed.current = true;
      }
    } catch (err) {
      // Gracefully handle ad-blocker or duplicate push
    }
  }, [slot]);

  // If no manual slot is provided, Auto Ads via layout.tsx handles placements automatically
  if (!slot) {
    return null;
  }

  return (
    <div
      className={`ad-slot-container my-6 w-full overflow-hidden text-center transition ${
        variant === 'secondary'
          ? 'rounded-2xl border border-indigo-100 bg-indigo-50/20 p-2 sm:p-3'
          : 'rounded-2xl border border-stone-200/70 bg-stone-50/40 p-2 sm:p-3'
      } ${className}`}
      style={{
        // Reserve space to prevent CLS (Cumulative Layout Shift)
        minHeight: format === 'rectangle' ? '280px' : format === 'horizontal' ? '100px' : '120px',
        contain: 'layout',
      }}
    >
      <div className="mb-1 text-[9px] uppercase tracking-widest text-stone-400 font-semibold select-none">
        Advertisement
      </div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );

}
