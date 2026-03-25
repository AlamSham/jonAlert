'use client';

import { CATEGORY_LABELS, type JobCategory } from '@/lib/types';

type Props = {
  title: string;
  slug: string;
  category: JobCategory;
};

export function ShareButtons({ title, slug, category }: Props) {
  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/job/${slug}`
    : `https://sarkaripulse.net/job/${slug}`;

  const categoryLabel = CATEGORY_LABELS[category] || category;
  const shareText = `📢 ${title}\n\n🔗 ${categoryLabel} update on SarkariPulse\n👉 ${pageUrl}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(`📢 ${title} — ${categoryLabel} update`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`📢 ${title}`)}&url=${encodeURIComponent(pageUrl)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      const btn = document.getElementById('copy-btn');
      if (btn) {
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = '🔗 Copy Link'; }, 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-muted mr-1">Share:</span>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3.5 py-1.5 text-xs font-bold text-green-700 transition hover:bg-green-200 active:scale-95"
        id="share-whatsapp"
      >
        💬 WhatsApp
      </a>
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-200 active:scale-95"
        id="share-telegram"
      >
        ✈️ Telegram
      </a>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3.5 py-1.5 text-xs font-bold text-sky-700 transition hover:bg-sky-200 active:scale-95"
        id="share-twitter"
      >
        🐦 Twitter
      </a>
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3.5 py-1.5 text-xs font-bold text-stone-600 transition hover:bg-stone-200 active:scale-95"
        id="copy-btn"
      >
        🔗 Copy Link
      </button>
    </div>
  );
}
