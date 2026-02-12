/**
 * Google Ads Conversion Tracking Utility
 *
 * Handles all conversion tracking events with error handling and type safety
 */

import { GtagConversionParams } from '@/types/gtag';

// Configuration
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const SIGNUP_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL;
const PURCHASE_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL;

/**
 * Check if Google Ads tracking is enabled and configured
 */
export const isTrackingEnabled = (): boolean => {
  return !!(
    typeof window !== 'undefined' &&
    window.gtag &&
    GOOGLE_ADS_ID &&
    (SIGNUP_LABEL || PURCHASE_LABEL)
  );
};

/**
 * Generic function to send conversion events to Google Ads
 */
const sendConversion = (
  label: string | undefined,
  params?: Omit<GtagConversionParams, 'send_to'>
): void => {
  if (!isTrackingEnabled()) {
    console.log('[Tracking] Google Ads not configured, skipping conversion');
    return;
  }

  if (!label) {
    console.error('[Tracking] Conversion label not configured');
    return;
  }

  try {
    const send_to = `${GOOGLE_ADS_ID}/${label}`;

    window.gtag!('event', 'conversion', {
      send_to,
      ...params,
    });

    console.log('[Tracking] Conversion sent:', send_to, params);
  } catch (error) {
    console.error('[Tracking] Failed to send conversion:', error);
  }
};

/**
 * Track user signup (free plan)
 *
 * @param email - User's email (for enhanced conversions)
 */
export const trackSignup = (email?: string): void => {
  sendConversion(SIGNUP_LABEL, {
    value: 0, // Free signup has no monetary value
    currency: 'INR',
    ...(email && { email_address: email }),
  });

  // Also track as a custom event for analytics
  if (window.gtag) {
    window.gtag('event', 'sign_up', {
      event_category: 'engagement',
      event_label: 'free_signup',
    });
  }
};

/**
 * Track subscription purchase
 *
 * @param plan - Subscription plan (starter/pro)
 * @param amount - Amount in INR (rupees, not paise)
 * @param orderId - Razorpay order ID or payment ID (for deduplication)
 * @param email - User's email (for enhanced conversions)
 */
export const trackPurchase = (
  plan: 'starter' | 'pro',
  amount: number,
  orderId?: string,
  email?: string
): void => {
  sendConversion(PURCHASE_LABEL, {
    value: amount,
    currency: 'INR',
    transaction_id: orderId,
    ...(email && { email_address: email }),
  });

  // Also track as a purchase event for analytics
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      event_category: 'ecommerce',
      event_label: plan,
      value: amount,
      currency: 'INR',
      transaction_id: orderId,
    });
  }
};

/**
 * Track Starter plan purchase (₹299)
 *
 * @param orderId - Razorpay order/payment ID
 * @param email - User's email
 */
export const trackStarterPurchase = (orderId?: string, email?: string): void => {
  trackPurchase('starter', 299, orderId, email);
};

/**
 * Track Pro plan purchase (₹999)
 *
 * @param orderId - Razorpay order/payment ID
 * @param email - User's email
 */
export const trackProPurchase = (orderId?: string, email?: string): void => {
  trackPurchase('pro', 999, orderId, email);
};

/**
 * Track custom events (for additional insights)
 *
 * @param eventName - Name of the event
 * @param params - Additional parameters
 */
export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
): void => {
  if (!isTrackingEnabled()) {
    return;
  }

  try {
    window.gtag!('event', eventName, params);
    console.log('[Tracking] Event sent:', eventName, params);
  } catch (error) {
    console.error('[Tracking] Failed to send event:', error);
  }
};

/**
 * Track page views (optional, for enhanced tracking)
 *
 * @param url - Page URL
 */
export const trackPageView = (url: string): void => {
  if (!isTrackingEnabled()) {
    return;
  }

  try {
    window.gtag!('config', GOOGLE_ADS_ID!, {
      page_path: url,
    });
  } catch (error) {
    console.error('[Tracking] Failed to track page view:', error);
  }
};

/**
 * Debug: Log tracking configuration
 */
export const debugTracking = (): void => {
  console.group('[Tracking] Configuration');
  console.log('Google Ads ID:', GOOGLE_ADS_ID || 'NOT SET');
  console.log('Signup Label:', SIGNUP_LABEL || 'NOT SET');
  console.log('Purchase Label:', PURCHASE_LABEL || 'NOT SET');
  console.log('Tracking Enabled:', isTrackingEnabled());
  console.log('gtag available:', typeof window !== 'undefined' && !!window.gtag);
  console.groupEnd();
};
