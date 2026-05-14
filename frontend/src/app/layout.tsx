import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { websiteJsonLd, organizationJsonLd } from '@/lib/seo';
import { BackToTop } from '@/components/BackToTop';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import { WebVitals } from '@/components/WebVitals';
import { ThirdPartyScripts } from '@/components/ThirdPartyScripts';

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
    images: [
      {
        url: 'https://sarkaripulse.net/api/og?title=SarkariPulse&subtitle=Latest%20Sarkari%20Naukri%20Updates',
        width: 1200,
        height: 630,
        alt: 'SarkariPulse - Latest Sarkari Naukri Updates',
      },
    ],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Google AdSense */}
        <meta name="google-adsense-account" content="ca-pub-4518508932731576" />
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
