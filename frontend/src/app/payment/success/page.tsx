'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { trackStarterPurchase, trackProPurchase } from '@/lib/tracking';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface VerificationResult {
  success: boolean;
  status: string;
  message: string;
  subscription_type?: string;
  subscription_expiry?: string;
}

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'verifying' | 'success' | 'pending' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  // Use refs to prevent re-running verification after success
  const isVerifiedRef = useRef(false);
  const isVerifyingRef = useRef(false);

  const verifyPayment = useCallback(async (paymentId: string) => {
    // Don't re-verify if already successful or currently verifying
    if (isVerifiedRef.current || isVerifyingRef.current) {
      return;
    }

    isVerifyingRef.current = true;
    setStatus('verifying');

    try {
      const response = await api.post<VerificationResult>('/api/payment/verify-dodo', {
        payment_id: paymentId
      });

      const result = response.data;

      if (result.success) {
        // Mark as verified to prevent re-runs
        isVerifiedRef.current = true;
        isVerifyingRef.current = false;
        setStatus('success');

        // Track the conversion
        if (user?.email && result.subscription_type) {
          if (result.subscription_type === 'starter') {
            trackStarterPurchase(paymentId, user.email);
          } else if (result.subscription_type === 'pro') {
            trackProPurchase(paymentId, user.email);
          }
        }

        // Refresh user data to get updated subscription
        if (refreshUser) {
          await refreshUser();
        }

        // Redirect to dashboard after a moment
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);

      } else if (result.status === 'pending') {
        isVerifyingRef.current = false;
        // Payment still processing - retry
        if (retryCount < maxRetries) {
          setStatus('pending');
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 3000); // Retry every 3 seconds
        } else {
          setStatus('error');
          setErrorMessage('Payment is still processing. Please check your dashboard in a few minutes.');
        }
      } else {
        isVerifyingRef.current = false;
        setStatus('error');
        setErrorMessage(result.message || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      isVerifyingRef.current = false;

      // If user not logged in, might need to re-authenticate
      if (error.response?.status === 401) {
        setStatus('error');
        setErrorMessage('Please log in to verify your payment.');
      } else if (retryCount < maxRetries) {
        // Network error - retry
        setStatus('pending');
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 3000);
      } else {
        setStatus('error');
        setErrorMessage('Failed to verify payment. Please contact support if your subscription is not active.');
      }
    }
  }, [user?.email, refreshUser, router, retryCount]);

  // Initial effect - only runs once on mount
  useEffect(() => {
    const paymentId = searchParams.get('payment_id') || searchParams.get('session_id');

    if (!paymentId) {
      // No payment ID in URL - might be Razorpay redirect, show success
      isVerifiedRef.current = true;
      setStatus('success');
      return;
    }

    verifyPayment(paymentId);
  }, [searchParams, verifyPayment]);

  // Retry effect - only runs when retryCount changes and not yet verified
  useEffect(() => {
    if (retryCount === 0 || isVerifiedRef.current) return;

    const paymentId = searchParams.get('payment_id') || searchParams.get('session_id');
    if (paymentId) {
      verifyPayment(paymentId);
    }
  }, [retryCount, searchParams, verifyPayment]);

  return (
    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
      {(status === 'loading' || status === 'verifying') && (
        <>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Payment...
          </h1>
          <p className="text-gray-600">
            Please wait while we confirm your payment.
          </p>
        </>
      )}

      {status === 'pending' && (
        <>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Processing Payment...
          </h1>
          <p className="text-gray-600 mb-4">
            Your payment is being processed. This may take a moment.
          </p>
          <p className="text-sm text-gray-500">
            Attempt {retryCount + 1} of {maxRetries}...
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your subscription has been activated.
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/builder"
              className="block w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Create a Resume
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Redirecting to dashboard in a few seconds...
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verification Issue
          </h1>
          <p className="text-gray-600 mb-6">
            {errorMessage}
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
            <a
              href="mailto:support@resumebuilder.com"
              className="block w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Contact Support
            </a>
          </div>
        </>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Loading...
      </h1>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Suspense fallback={<LoadingFallback />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
