'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PricingPlan {
  name: string;
  price: number;
  features: string[];
  resume_limit: number | string;
  ats_analysis_limit: number | string;
}

export default function PricingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  const plans: PricingPlan[] = [
    {
      name: 'FREE',
      price: 0,
      resume_limit: 1,
      ats_analysis_limit: 2,
      features: [
        '1 Resume Creation',
        '2 ATS Analyses',
        '10 AI Assists per day',
        'Basic Templates',
        'PDF Export',
        'Email Support'
      ]
    },
    {
      name: 'STARTER',
      price: 299,
      resume_limit: 5,
      ats_analysis_limit: 10,
      features: [
        '5 Resume Creations',
        '10 ATS Analyses',
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
      price: 999,
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

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
      // Create order
      const orderResponse = await api.post('/api/payment/create-order', {
        plan: planName.toLowerCase(),
        duration_months: 1  // Default to 1 month (monthly subscription)
      });

      const { order_id, amount, currency } = orderResponse.data;

      // Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: amount,
        currency: currency,
        name: 'Resume Builder',
        description: `${planName} Plan Subscription`,
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

            alert('Payment successful! Your account has been upgraded.');
            router.push('/dashboard');
          } catch (error: any) {
            console.error('Payment verification failed:', error);

            // Extract error message
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

      // Extract error message properly
      let errorMessage = 'Failed to create order. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
      setSelectedPlan('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Affordable AI-Powered Resume Building
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pricing designed for India. Start free, upgrade anytime.
            <span className="block text-green-600 font-semibold mt-2">Starting at just ₹299/month</span>
          </p>
        </div>

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
                  BEST VALUE 🔥
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                  {plan.price > 0 && <span className="text-gray-600">/month</span>}
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
            <a href="mailto:support@resumebuilder.com" className="text-blue-600 hover:text-blue-500">
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
