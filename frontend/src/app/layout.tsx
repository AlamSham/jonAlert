import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { NewsTicker } from '@/components/NewsTicker';
import { Footer } from '@/components/Footer';
import { websiteJsonLd, organizationJsonLd, siteNavigationJsonLd } from '@/lib/seo';
import { BackToTop } from '@/components/BackToTop';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import { WebVitals } from '@/components/WebVitals';
import { ThirdPartyScripts } from '@/components/ThirdPartyScripts';
import { MobileStickySocial } from '@/components/MobileStickySocial';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';

import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Latest Sarkari Naukri 2026 - UPSC, SSC, Railway Jobs | SarkariPulse',
    template: '%s | SarkariPulse',
  },
  description:
    'Latest Sarkari Naukri 2026 alerts for UPSC, SSC, Railway, Police & Banking jobs. Get admit cards, results, scholarship updates. Regularly updated!',
  keywords: [
    'sarkari naukri',
    'government jobs',
    'sarkari result',
    'admit card',
    'sarkari naukri 2026',
    'govt jobs 2026',
    'latest sarkari naukri',
    'sarkari yojana',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net'),
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
  },
  alternates: {
    canonical: 'https://sarkaripulse.net/',
    languages: {
      'hi-IN': 'https://sarkaripulse.net/',
      'x-default': 'https://sarkaripulse.net/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    siteName: 'SarkariPulse',
    title: 'SarkariPulse — Latest Sarkari Naukri, Result, Admit Card',
    description: 'Latest sarkari job alerts verified by our editorial team. UPSC, SSC, Railway, State jobs sab ek jagah.',
    images: [
      {
        url: '/logo.jpg',
        width: 1024,
        height: 1024,
        alt: 'SarkariPulse - Latest Sarkari Naukri Updates',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SarkariPulse — Sarkari Naukri Updates',
    description: 'Latest govt jobs, results, admit cards — regularly updated by our team.',
    images: ['/logo.jpg'],
  },
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="google-adsense-account" content="ca-pub-4518508932731576" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationJsonLd()) }}
        />
      </head>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <NewsTicker />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
        <MobileStickySocial />
        <PwaInstallPrompt />
        <WebVitals />
        {process.env.VERCEL && <Analytics />}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || 'G-KEQLLZWFJJ'} />
        <ThirdPartyScripts />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4518508932731576"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
