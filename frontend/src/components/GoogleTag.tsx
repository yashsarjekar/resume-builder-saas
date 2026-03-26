/**
 * Google Tags Component
 *
 * Loads Google Analytics (GA4) and Google Ads gtag.js scripts
 * Only loads in production when IDs are configured
 */

'use client';

import Script from 'next/script';

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleTag() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  // Use GA4 ID if available, fall back to Ads ID
  const primaryId = GA_MEASUREMENT_ID || GOOGLE_ADS_ID;

  if (!primaryId) {
    return null;
  }

  return (
    <>
      <Script
        id="google-gtag-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="lazyOnload"
      />

      <Script
        id="google-gtag-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}');` : ''}
            ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}
          `,
        }}
      />
    </>
  );
}
