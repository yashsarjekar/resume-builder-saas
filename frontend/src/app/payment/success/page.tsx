'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { trackStarterPurchase, trackProPurchase } from '@/lib/tracking';
import { useAuthStore } from '@/store/authStore';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'pending'>('loading');

  useEffect(() => {
    // Get session ID from URL params (if Dodo passes it)
    const sessionId = searchParams.get('session_id') || searchParams.get('payment_id');

    // Track the conversion (we don't know the exact plan here, but we can track a general purchase)
    // The webhook will handle the actual subscription upgrade
    if (sessionId && user?.email) {
      // We'll track as a general purchase - webhook handles the specifics
      trackStarterPurchase(sessionId, user.email);
    }

    // Show success immediately - webhook handles backend
    // Wait a moment to let webhook process
    const timer = setTimeout(() => {
      setStatus('success');
    }, 2000);

    // Redirect to dashboard after 5 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, [searchParams, user, router]);

  return (
    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
      {status === 'loading' ? (
        <>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Processing Payment...
          </h1>
          <p className="text-gray-600">
            Please wait while we confirm your payment.
          </p>
        </>
      ) : (
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
