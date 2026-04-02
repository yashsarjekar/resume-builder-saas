'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [countryLoading, setCountryLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(1);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);

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
      priceINR: { 1: 50, 3: 799, 6: 1499, 12: 2699 },
      priceUSD: { 1: 1, 3: 34.99, 6: 64.99, 12: 119.99 },
      resume_limit: isIndia ? 5 : 15,
      ats_analysis_limit: isIndia ? 10 : 15,
      features: isIndia ? [
        '5 Resume Creations',
        '10 ATS Analyses',
        '50 AI Assists per day',
        'AI Resume Optimization',
        'Cover Letter Generator',
        'Keyword Extraction',
        'AI Mock Interview (3/day)',
        '4 Premium Templates',
        'Access & apply first to 100,000+ remote jobs from 10,000+ top companies',
        'Email Support'
      ] : [
        '15 Resume Creations',
        '15 ATS Analyses',
        '50 AI Assists per day',
        'AI Resume Optimization',
        'Cover Letter Generator',
        'Keyword Extraction',
        'AI Mock Interview (3/day)',
        '4 Premium Templates',
        'Access & apply first to 100,000+ remote jobs from 10,000+ top companies',
        'Email Support'
      ]
    },
    {
      name: 'PRO',
      priceINR: { 1: 100, 3: 2699, 6: 4999, 12: 8999 },
      priceUSD: { 1: 2, 3: 109.99, 6: 199.99, 12: 359.99 },
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
        'AI Mock Interview (10/day)',
        '4 Premium Templates',
        'Access & apply first to 100,000+ remote jobs from 10,000+ top companies',
        'Priority Email Support',
        'Early Access to Features'
      ]
    }
  ];

  const plans = getPlans(userCountry === 'IN');

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setUserCountry(data.country_code || 'US');
      } catch (error) {
        console.log('Country detection failed, defaulting to US');
        setUserCountry('US');
      } finally {
        setCountryLoading(false);
      }
    };
    detectCountry();
  }, []);

  useEffect(() => {
    const urlCoupon = searchParams.get('coupon');
    if (urlCoupon && userCountry) {
      setCouponInput(urlCoupon);
      validateCoupon(urlCoupon);
    }
  }, [searchParams, userCountry]);

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

  const validateCoupon = async (code: string) => {
    if (!code.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const region = isIndian ? 'IN' : 'INTL';
      const response = await api.post('/api/coupon/validate', {
        code: code.trim(),
        plan: 'both',
        region,
      });
      if (response.data.valid) {
        setCouponCode(response.data.code);
        setCouponDiscount(response.data.discount_percent);
        setCouponApplied(true);
        setCouponError('');
      } else {
        setCouponError(response.data.error || 'Invalid coupon code');
        setCouponApplied(false);
        setCouponDiscount(0);
        setCouponCode('');
      }
    } catch (error: any) {
      setCouponError(error.response?.data?.detail || 'Failed to validate coupon');
      setCouponApplied(false);
      setCouponDiscount(0);
      setCouponCode('');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
    setCouponError('');
    setCouponInput('');
  };

  const getPrice = (plan: PricingPlan) => {
    const price = isIndian ? plan.priceINR[billingCycle] : plan.priceUSD[billingCycle];
    if (price === 0) return isIndian ? '₹0' : '$0';
    return isIndian ? `₹${price}` : `$${price}`;
  };

  const getDiscountedPrice = (plan: PricingPlan) => {
    if (!couponApplied || couponDiscount === 0 || plan.name === 'FREE') return null;
    const price = isIndian ? plan.priceINR[billingCycle] : plan.priceUSD[billingCycle];
    if (price === 0) return null;
    const discounted = price - (price * couponDiscount / 100);
    const rounded = Math.round(discounted * 100) / 100;
    return isIndian ? `₹${Math.round(rounded)}` : `$${rounded.toFixed(2)}`;
  };

  const getBillingLabel = () => {
    const option = billingOptions.find(o => o.value === billingCycle);
    return option?.label.toLowerCase() || 'month';
  };

  const handleUpgrade = async (planName: string) => {
    if (!isAuthenticated) {
      const currentUrl = couponCode ? `/pricing?coupon=${couponCode}` : '/pricing';
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }
    if (planName === 'FREE') return;

    setLoading(true);
    setSelectedPlan(planName);

    try {
      const orderPayload: any = {
        plan: planName.toLowerCase(),
        duration_months: billingCycle,
        country: userCountry || 'US',
      };
      if (couponCode) orderPayload.coupon_code = couponCode;

      const orderResponse = await api.post('/api/payment/create-order', orderPayload);
      const { order_id, amount, currency, payment_gateway, checkout_url, key_id } = orderResponse.data;

      if (payment_gateway === 'dodo' && checkout_url) {
        window.location.href = checkout_url;
        return;
      }

      const options = {
        key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount,
        currency,
        name: 'Resume Builder',
        description: `${planName} Plan - ${getBillingLabel()}`,
        order_id,
        handler: async function (response: any) {
          try {
            await api.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planName.toLowerCase()
            });
            const userEmail = user?.email;
            if (planName.toLowerCase() === 'starter') trackStarterPurchase(response.razorpay_payment_id, userEmail);
            else if (planName.toLowerCase() === 'pro') trackProPurchase(response.razorpay_payment_id, userEmail);
            alert('Payment successful! Your account has been upgraded.');
            router.push('/dashboard');
          } catch (error: any) {
            let errorMessage = 'Payment verification failed. Please contact support.';
            if (error.response?.data?.detail) errorMessage = `Payment verification failed: ${error.response.data.detail}`;
            else if (error.message) errorMessage = `Payment verification failed: ${error.message}`;
            alert(errorMessage);
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#6366f1' },
        modal: { ondismiss: function() { setLoading(false); setSelectedPlan(''); } }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      let errorMessage = 'Failed to create order. Please try again.';
      if (error.response?.data?.detail) errorMessage = error.response.data.detail;
      else if (error.message) errorMessage = error.message;
      else if (typeof error === 'string') errorMessage = error;
      alert(errorMessage);
      setLoading(false);
      setSelectedPlan('');
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 relative overflow-hidden">
      {/* Aurora orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-3xl animate-[blob_14s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/8 blur-3xl animate-[blob_18s_ease-in-out_infinite_3s]" />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full bg-cyan-600/5 blur-3xl animate-[blob_20s_ease-in-out_infinite_6s]" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Affordable <span className="gradient-text">AI-Powered</span> Resume Building
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
          </p>
          <p className="mt-2 text-sm">
            {countryLoading ? (
              <span className="text-gray-600">Detecting your location...</span>
            ) : isIndian ? (
              <span className="text-emerald-400 font-semibold">Starting at just ₹50/month · Indian Rupee pricing</span>
            ) : (
              <span className="text-emerald-400 font-semibold">Starting at just $1/month · International pricing (USD)</span>
            )}
          </p>
        </div>

        {/* Coupon Applied Banner */}
        {couponApplied && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-emerald-300 text-sm font-medium">
                  Coupon <span className="font-mono font-bold">{couponCode}</span> applied &mdash; {couponDiscount}% off!
                </span>
              </div>
              <button onClick={removeCoupon} className="text-emerald-500 hover:text-emerald-300 text-xs font-medium transition-colors">
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Coupon Input */}
        {!couponApplied && (
          <div className="max-w-md mx-auto mb-10">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Have a coupon code?"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors text-sm"
              />
              <button
                onClick={() => validateCoupon(couponInput)}
                disabled={couponLoading || !couponInput.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {couponLoading ? 'Checking...' : 'Apply'}
              </button>
            </div>
            {couponError && (
              <p className="mt-2 text-xs text-red-400">{couponError}</p>
            )}
          </div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex glass rounded-xl p-1 gap-1">
            {billingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setBillingCycle(option.value)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingCycle === option.value
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {option.label}
                {option.discount && (
                  <span className="absolute -top-2.5 -right-2 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
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
            <span className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium">
              Save up to {billingCycle === 12 ? '25%' : billingCycle === 6 ? '17%' : '10%'} with {getBillingLabel()} billing
            </span>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const discountedPrice = getDiscountedPrice(plan);
            const isPro = plan.name === 'PRO';
            const isCurrentPlan = user?.subscription_type === plan.name.toLowerCase();

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  isPro
                    ? 'ring-2 ring-indigo-500/50 shadow-2xl shadow-indigo-500/10 scale-[1.02]'
                    : 'glass hover:border-white/15'
                }`}
              >
                {isPro && (
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/5 to-purple-600/5 pointer-events-none" />
                )}
                {isPro && (
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-2 text-xs font-bold tracking-widest uppercase">
                    Most Popular
                  </div>
                )}

                <div className="p-7">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <div className="mb-6 mt-3">
                    {discountedPrice ? (
                      <div>
                        <span className="text-xl text-gray-600 line-through mr-2">{getPrice(plan)}</span>
                        <span className="text-4xl font-black text-emerald-400">{discountedPrice}</span>
                        {plan.priceINR[1] > 0 && <span className="text-gray-500 text-sm ml-1">/{getBillingLabel()}</span>}
                        <p className="text-xs text-emerald-500 mt-1">{couponDiscount}% off with coupon</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-black text-white">{getPrice(plan)}</span>
                        {plan.priceINR[1] > 0 && <span className="text-gray-500 text-sm ml-1">/{getBillingLabel()}</span>}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-7">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-400 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={loading || countryLoading || isCurrentPlan || plan.name === 'FREE'}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isPro
                        ? 'btn-primary'
                        : plan.name === 'STARTER'
                        ? 'bg-white/10 border border-white/15 text-white hover:bg-white/15'
                        : 'bg-white/5 border border-white/10 text-gray-500 cursor-default'
                    }`}
                  >
                    {loading && selectedPlan === plan.name
                      ? 'Processing...'
                      : isCurrentPlan
                      ? 'Current Plan'
                      : plan.name === 'FREE'
                      ? 'Free Forever'
                      : 'Upgrade Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center space-y-4">
          <p className="text-gray-500 text-sm">
            Need a custom plan?{' '}
            <a href="mailto:resumebuilder.pulsestack@gmail.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Contact us
            </a>
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
            <a href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</a>
            <span>·</span>
            <a href="/refund" className="hover:text-gray-400 transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading pricing...</div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
