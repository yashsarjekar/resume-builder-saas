'use client';

import Link from 'next/link';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: 'IN' | 'INTL';
}

export default function UpgradeModal({ isOpen, onClose, region }: UpgradeModalProps) {
  if (!isOpen) return null;

  const isIndia = region === 'IN';

  const plans = [
    {
      name: 'Starter',
      price: isIndia ? '₹299' : '$12.99',
      period: '/month',
      features: [
        `${isIndia ? '5' : '15'} resumes per month`,
        `${isIndia ? '10' : '15'} ATS analyses per month`,
        'AI-powered optimization',
        'Multiple templates',
      ],
      color: 'blue',
    },
    {
      name: 'Pro',
      price: isIndia ? '₹999' : '$39.99',
      period: '/month',
      badge: 'BEST VALUE',
      features: [
        'Unlimited resumes',
        'Unlimited ATS analyses',
        'Priority AI optimization',
        'All premium templates',
        'Cover letter generator',
      ],
      color: 'purple',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h2>
          <p className="mt-1 text-sm text-gray-500">
            Unlock more resumes, ATS analyses, and AI tools
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative border-2 rounded-xl p-5 ${
                plan.color === 'purple'
                  ? 'border-purple-300 bg-purple-50'
                  : 'border-blue-300 bg-blue-50'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                  {plan.badge}
                </span>
              )}
              <h3
                className={`text-lg font-bold ${
                  plan.color === 'purple' ? 'text-purple-700' : 'text-blue-700'
                }`}
              >
                {plan.name}
              </h3>
              <div className="mt-1">
                <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-sm text-gray-500">{plan.period}</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start text-sm text-gray-700">
                    <svg
                      className={`h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0 ${
                        plan.color === 'purple' ? 'text-purple-500' : 'text-blue-500'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/pricing"
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            View All Plans
          </Link>
          <p className="mt-2 text-xs text-gray-400">
            Save up to 25% with yearly billing
          </p>
        </div>
      </div>
    </div>
  );
}
