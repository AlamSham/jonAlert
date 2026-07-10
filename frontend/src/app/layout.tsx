import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';
import { Header } from '@/components/Header';
import { NewsTicker } from '@/components/NewsTicker';
import { websiteJsonLd, organizationJsonLd } from '@/lib/seo';
import { BackToTop } from '@/components/BackToTop';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import { WebVitals } from '@/components/WebVitals';

// Lazy load heavy components (improves FCP & LCP)
const Footer = dynamic(() => import('@/components/Footer').then(mod => ({ default: mod.Footer })), {
  ssr: true, // Still render on server for SEO
});

const ThirdPartyScripts = dynamic(() => import('@/components/ThirdPartyScripts').then(mod => ({ default: mod.ThirdPartyScripts })), {
  ssr: false, // Client-side only, no need for SSR
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: '🔥 Latest Sarkari Naukri 2026 - UPSC, SSC, Railway Jobs | SarkariPulse',
    template: '%s | SarkariPulse',
  },
  description:
    '⚡ BREAKING: Latest Sarkari Naukri alerts! UPSC, SSC, Railway, Police jobs - har 10 minute update. 50,000+ students trust us. Free notifications, instant alerts! 🚀',
  keywords: [
    // Primary Keywords (High Volume)
    'sarkari naukri', 'government jobs', 'sarkari result', 'admit card',
    'sarkari naukri 2026', 'govt jobs 2026', 'latest sarkari naukri',
    
    // Organization Keywords
    'UPSC', 'SSC', 'Railway', 'Railway jobs', 'police vacancy', 'banking jobs',
    'UPSC notification', 'SSC CGL', 'SSC CHSL', 'RRB', 'IBPS',
    
    // Category Keywords
    'college admission', 'scholarship', 'exam form', 'sarkari bharti',
    'admission notification', 'sarkari scholarship', 'exam result',
    'answer key', 'cut off marks', 'merit list',
    
    // Government Schemes Keywords (NEW)
    'government schemes', 'sarkari yojana', 'PM Kisan', 'Ayushman Bharat',
    'pradhan mantri yojana', 'central government schemes', 'state government schemes',
    'PM Awas Yojana', 'Mudra loan', 'farmer schemes', 'women schemes',
    
    // Qualification Keywords
    '10th pass jobs', '12th pass jobs', 'graduate jobs', 'ITI jobs',
    'diploma jobs', 'engineering jobs', 'medical jobs',
    
    // State Keywords (Top States)
    'UP sarkari naukri', 'Bihar govt jobs', 'Jharkhand jobs', 'MP jobs',
    'Rajasthan jobs', 'Maharashtra jobs', 'Delhi jobs',
    
    // Action Keywords
    'online apply', 'application form', 'how to apply', 'eligibility',
    'last date', 'vacancy details', 'notification PDF',
    
    // Hinglish Keywords
    'sarkari naukri kaise milegi', 'government job kaise paye',
    'admit card download', 'result kaise check kare',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net'),
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
  },
  alternates: {
    canonical: '/',
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
        {/* Google AdSense */}
        <meta name="google-adsense-account" content="ca-pub-4518508932731576" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4518508932731576"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
      </head>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <NewsTicker />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
        <WebVitals />
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        <ThirdPartyScripts />
      </body>
    </html>
  );
}
