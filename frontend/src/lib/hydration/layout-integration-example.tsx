/**
 * Example: Layout Integration with JSONLDHandler
 * 
 * This file demonstrates how to integrate the JSONLDHandler with the existing layout.tsx
 * to prevent hydration mismatches while maintaining SEO benefits
 * 
 * This is an EXAMPLE file showing how to modify layout.tsx - not the actual implementation
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BackToTop } from '@/components/BackToTop';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import { WebVitals } from '@/components/WebVitals';
import Script from 'next/script';

// Import hydration-safe components
import { SSRSafeJSONLD } from '@/components/HydrationSafeJSONLD';
import { websiteJsonLd, organizationJsonLd } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  // ... existing metadata configuration
  title: {
    default: '🔥 Latest Sarkari Naukri 2026 - UPSC, SSC, Railway Jobs | SarkariPulse',
    template: '%s | SarkariPulse',
  },
  description:
    '⚡ BREAKING: Latest Sarkari Naukri alerts! UPSC, SSC, Railway, Police jobs - har 10 minute update. 50,000+ students trust us. Free notifications, instant alerts! 🚀',
  // ... rest of metadata
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
        
        {/* 
          BEFORE (Hydration Mismatch Risk):
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
          />
        */}
        
        {/* 
          AFTER (Hydration Safe):
          Use SSRSafeJSONLD for consistent serialization during SSR
        */}
        <SSRSafeJSONLD data={websiteJsonLd()} id="website" />
        <SSRSafeJSONLD data={organizationJsonLd()} id="organization" />
        
        <Script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" strategy="beforeInteractive" />
      </head>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
        <WebVitals />
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        
        {/* 
          BEFORE (Hydration Mismatch Risk):
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
        */}
        
        {/* 
          AFTER (Hydration Safe):
          Use HydrationSafeScript component (to be implemented in task 7.2)
          or defer script loading until after hydration
        */}
        {process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID && (
          <Script 
            id="onesignal-init" 
            strategy="afterInteractive"
            onLoad={() => {
              // Initialize OneSignal after script loads and hydration completes
              if (typeof window !== 'undefined' && window.OneSignal) {
                window.OneSignalDeferred = window.OneSignalDeferred || [];
                window.OneSignalDeferred.push(async function(OneSignal: any) {
                  await OneSignal.init({
                    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
                    notifyButton: { enable: true },
                  });
                });
              }
            }}
          />
        )}
      </body>
    </html>
  );
}

/*
  MIGRATION NOTES:
  
  1. Replace direct dangerouslySetInnerHTML JSON-LD scripts with SSRSafeJSONLD components
  2. Use consistent serialization from JSONLDHandler for all structured data
  3. Defer OneSignal initialization to prevent hydration mismatches
  4. Consider using HydrationSafeScript component for other dynamic scripts
  
  BENEFITS:
  
  1. Eliminates hydration mismatch errors from JSON-LD scripts
  2. Maintains SEO benefits with consistent structured data
  3. Provides validation and error handling for structured data
  4. Enables priority-based structured data management
  5. Supports dependency tracking between structured data elements
  
  REQUIREMENTS ADDRESSED:
  
  - Requirement 2.1: Identical JSON-LD content between server and client
  - Requirement 2.2: Consistent data serialization
  - Requirement 2.3: JSON-LD syntax validation
  - Requirement 2.5: SEO benefits preservation during initial page load
*/