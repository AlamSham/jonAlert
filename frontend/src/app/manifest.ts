import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SarkariPulse — Sarkari Naukri, Result, Admit Card',
    short_name: 'SarkariPulse',
    description: 'Latest Sarkari Naukri 2026, Exam Results, Admit Cards, Scholarships — AI-powered updates har 10 minute.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    orientation: 'portrait-primary',
    categories: ['education', 'news', 'government'],
    lang: 'hi',
    icons: [
      {
        src: '/logo.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'any',
      },
      {
        src: '/logo.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any',
      },
      {
        src: '/logo.jpg',
        sizes: '1024x1024',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
    ],
  };
}
