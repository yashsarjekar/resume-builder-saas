/**
 * Google Ads Tag Component
 *
 * Loads Google Ads gtag.js script for conversion tracking
 * Only loads in production when GOOGLE_ADS_ID is configured
 */

'use client';

import Script from 'next/script';
import { useEffect } from 'react';

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export function GoogleTag() {
  // Don't load in development or if not configured
  if (!GOOGLE_ADS_ID || process.env.NODE_ENV !== 'production') {
    return null;
  }

  useEffect(() => {
    // Log when tracking is loaded
    if (window.gtag) {
      console.log('[Google Ads] Tracking initialized:', GOOGLE_ADS_ID);
    }
  }, []);

  return (
    <>
      {/* Google Ads Global Site Tag (gtag.js) */}
      <Script
        id="google-ads-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />

      {/* Initialize gtag */}
      <Script
        id="google-ads-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `,
        }}
      />
    </>
  );
}
