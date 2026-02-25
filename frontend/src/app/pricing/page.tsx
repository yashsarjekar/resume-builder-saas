'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { trackStarterPurchase, trackProPurchase } from '@/lib/tracking';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PricingPlan {
  name: string;
  priceINR: { [key: number]: number };
  priceUSD: { [key: number]: number };
  features: string[];
  resume_limit: number | string;
  ats_analysis_limit: number | string;
}

type BillingCycle = 1 | 3 | 6 | 12;

const billingOptions: { value: BillingCycle; label: string; discount?: string }[] = [
  { value: 1, label: 'Monthly' },
  { value: 3, label: 'Quarterly', discount: '10% off' },
  { value: 6, label: 'Half-Yearly', discount: '17% off' },
  { value: 12, label: 'Yearly', discount: '25% off' },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [countryLoading, setCountryLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(1);

  // Plans with region-specific limits and multi-duration pricing
  const getPlans = (isIndia: boolean): PricingPlan[] => [
    {
      name: 'FREE',
      priceINR: { 1: 0, 3: 0, 6: 0, 12: 0 },
      priceUSD: { 1: 0, 3: 0, 6: 0, 12: 0 },
      resume_limit: isIndia ? 1 : 5,
      ats_analysis_limit: isIndia ? 2 : 5,
      features: isIndia ? [
        '1 Resume Creation',
        '2 ATS Analyses',
        '10 AI Assists per day',
        'Basic Templates',
        'PDF Export',
        'Email Support'
      ] : [
        '5 Resume Creations',
        '5 ATS Analyses',
        '10 AI Assists per day',
        'Basic Templates',
        'PDF Export',
        'Email Support'
      ]
    },
    {
      name: 'STARTER',
      priceINR: { 1: 299, 3: 799, 6: 1499, 12: 2699 },
      priceUSD: { 1: 12.99, 3: 34.99, 6: 64.99, 12: 119.99 },
      resume_limit: isIndia ? 5 : 15,
      ats_analysis_limit: isIndia ? 10 : 15,
      features: isIndia ? [
        '5 Resume Creations',
        '10 ATS Analyses',
        '50 AI Assists per day',
        'AI Resume Optimization',
        'Cover Letter Generator',
        'Keyword Extraction',
        '4 Premium Templates',
        'Email Support'
      ] : [
        '15 Resume Creations',
        '15 ATS Analyses',
        '50 AI Assists per day',
        'AI Resume Optimization',
        'Cover Letter Generator',
        'Keyword Extraction',
        '4 Premium Templates',
        'Email Support'
      ]
    },
    {
      name: 'PRO',
      priceINR: { 1: 999, 3: 2699, 6: 4999, 12: 8999 },
      priceUSD: { 1: 39.99, 3: 109.99, 6: 199.99, 12: 359.99 },
      resume_limit: 'Unlimited',
      ats_analysis_limit: 'Unlimited',
      features: [
        'Unlimited Resume Creations',
        'Unlimited ATS Analyses',
        'Unlimited AI Assists',
        'AI Resume Optimization',
        'Cover Letter Generator',
        'LinkedIn Profile Optimizer',
        'Keyword Extraction',
        '4 Premium Templates',
        'Priority Email Support',
        'Early Access to Features'
      ]
    }
  ];

  const plans = getPlans(userCountry === 'IN');

  // Detect user's country on mount
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setUserCountry(data.country_code || 'US');
      } catch (error) {
        console.log('Country detection failed, defaulting to US');
        setUserCountry('US'); // Default to international (Dodo)
      } finally {
        setCountryLoading(false);
      }
    };

    detectCountry();
  }, []);

  // Load Razorpay script for Indian users
  useEffect(() => {
    if (userCountry === 'IN') {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [userCountry]);

  const isIndian = userCountry === 'IN';

  const getPrice = (plan: PricingPlan) => {
    const price = isIndian ? plan.priceINR[billingCycle] : plan.priceUSD[billingCycle];
    if (price === 0) return isIndian ? '₹0' : '$0';
    return isIndian ? `₹${price}` : `$${price}`;
  };

  const getBillingLabel = () => {
    const option = billingOptions.find(o => o.value === billingCycle);
    return option?.label.toLowerCase() || 'month';
  };

  const handleUpgrade = async (planName: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (planName === 'FREE') {
      return;
    }

    setLoading(true);
    setSelectedPlan(planName);

    try {
      // Create order with country and duration for gateway routing
      const orderResponse = await api.post('/api/payment/create-order', {
        plan: planName.toLowerCase(),
        duration_months: billingCycle,
        country: userCountry || 'US'
      });

      const { order_id, amount, currency, payment_gateway, checkout_url, key_id } = orderResponse.data;

      if (payment_gateway === 'dodo' && checkout_url) {
        // Dodo Payments - redirect to hosted checkout
        window.location.href = checkout_url;
        return;
      }

      // Razorpay - use in-page modal
      const options = {
        key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: amount,
        currency: currency,
        name: 'Resume Builder',
        description: `${planName} Plan - ${getBillingLabel()}`,
        order_id: order_id,
        handler: async function (response: any) {
          try {
            // Verify payment
            await api.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planName.toLowerCase()
            });

            // Track conversion based on plan
            const userEmail = user?.email;
            if (planName.toLowerCase() === 'starter') {
              trackStarterPurchase(response.razorpay_payment_id, userEmail);
            } else if (planName.toLowerCase() === 'pro') {
              trackProPurchase(response.razorpay_payment_id, userEmail);
            }

            alert('Payment successful! Your account has been upgraded.');
            router.push('/dashboard');
          } catch (error: any) {
            console.error('Payment verification failed:', error);

            let errorMessage = 'Payment verification failed. Please contact support.';
            if (error.response?.data?.detail) {
              errorMessage = `Payment verification failed: ${error.response.data.detail}`;
            } else if (error.message) {
              errorMessage = `Payment verification failed: ${error.message}`;
            }

            alert(errorMessage);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setSelectedPlan('');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Failed to create order:', error);

      let errorMessage = 'Failed to create order. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      alert(errorMessage);
      setLoading(false);
      setSelectedPlan('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Affordable AI-Powered Resume Building
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Affordable pricing for everyone. Start free, upgrade anytime.
            {isIndian ? (
              <span className="block text-green-600 font-semibold mt-2">Starting at just ₹299/month</span>
            ) : (
              <span className="block text-green-600 font-semibold mt-2">Starting at just $12.99/month</span>
            )}
            <span className="block text-sm text-gray-500 mt-2">
              {countryLoading ? 'Detecting your location...' : (
                isIndian ? '🇮🇳 Indian Rupee pricing' : '🌍 International pricing (USD)'
              )}
            </span>
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white rounded-lg shadow-sm p-1 border border-gray-200">
            {billingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setBillingCycle(option.value)}
                className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === option.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {option.label}
                {option.discount && billingCycle === option.value && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {option.discount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Savings Banner */}
        {billingCycle > 1 && (
          <div className="text-center mb-8">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              Save up to {billingCycle === 12 ? '25%' : billingCycle === 6 ? '17%' : '10%'} with {getBillingLabel()} billing
            </span>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                plan.name === 'PRO' ? 'ring-2 ring-blue-600 transform scale-105' : ''
              }`}
            >
              {plan.name === 'PRO' && (
                <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                  BEST VALUE
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{getPrice(plan)}</span>
                  {plan.priceINR[1] > 0 && (
                    <span className="text-gray-600">/{getBillingLabel()}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={
                    loading ||
                    countryLoading ||
                    (user?.subscription_type === plan.name.toLowerCase()) ||
                    (plan.name === 'FREE')
                  }
                  className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                    plan.name === 'PRO'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                      : plan.name === 'STARTER'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading && selectedPlan === plan.name
                    ? 'Processing...'
                    : user?.subscription_type === plan.name.toLowerCase()
                    ? 'Current Plan'
                    : plan.name === 'FREE'
                    ? 'Free Forever'
                    : 'Upgrade Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center space-y-4">
          <p className="text-gray-600">
            Need a custom plan?{' '}
            <a href="mailto:resumebuilder.pulsestack@gmail.com" className="text-blue-600 hover:text-blue-500">
              Contact us
            </a>
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <a href="/privacy" className="hover:text-blue-600 transition">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-blue-600 transition">
              Terms of Service
            </a>
            <span>•</span>
            <a href="/refund" className="hover:text-blue-600 transition">
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
