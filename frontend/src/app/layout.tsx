import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { websiteJsonLd } from '@/lib/seo';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'SarkariPulse — Latest Sarkari Naukri, Result, Admit Card 2026',
    template: '%s | SarkariPulse',
  },
  description:
    'SarkariPulse par paayein latest Sarkari Naukri, college admission, scholarship, exam results, aur admit card updates — AI-powered, auto-updated har 10 minute.',
  keywords: [
    'sarkari naukri', 'government jobs', 'sarkari result', 'admit card',
    'UPSC', 'SSC', 'Railway', 'police vacancy', 'govt jobs 2026',
    'college admission', 'scholarship', 'exam form', 'sarkari bharti',
    'admission notification', 'sarkari scholarship',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net'),
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
  },
  alternates: {
    canonical: '/',
    languages: {
      'hi-IN': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    siteName: 'SarkariPulse',
    title: 'SarkariPulse — Latest Sarkari Naukri, Result, Admit Card',
    description: 'AI-powered sarkari job alerts in Hinglish. UPSC, SSC, Railway, State jobs sab ek jagah.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SarkariPulse — Sarkari Naukri Updates',
    description: 'Latest govt jobs, results, admit cards — auto-updated har 10 minute.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  appleWebApp: {
    title: 'SarkariPulse',
    statusBarStyle: 'default',
    capable: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <Script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" strategy="beforeInteractive" />
      </head>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        {process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID && (
          <Script id="onesignal-init" strategy="afterInteractive" dangerouslySetInnerHTML={{
            __html: `
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              OneSignalDeferred.push(async function(OneSignal) {
                await OneSignal.init({
                  appId: "${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID}",
                  notifyButton: { enable: true },
                });
              });
            `
          }} />
        )}
      </body>
    </html>
  );
}
