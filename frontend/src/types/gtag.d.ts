/**
 * Google Ads (gtag.js) TypeScript Declarations
 *
 * Provides type safety for Google Ads conversion tracking
 */

export interface GtagConversionParams {
  send_to: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
}

export interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: any;
}

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: GtagConversionParams | GtagEventParams
    ) => void;
    dataLayer?: any[];
  }
}

export {};
