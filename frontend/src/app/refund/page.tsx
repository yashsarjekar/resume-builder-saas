import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | Resume Builder',
  description: 'Learn about our refund policy for Resume Builder subscriptions. Understand the conditions and process for requesting refunds.',
  alternates: {
    canonical: 'https://resumebuilder.pulsestack.in/refund',
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: February 10, 2026</p>

          <div className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Overview</h2>
              <p className="text-gray-700 mb-4">
                At Resume Builder, we strive to provide excellent service. If you're not satisfied with your
                purchase, we offer refunds under specific conditions outlined below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Refund Eligibility</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 7-Day Refund Window</h3>
              <p className="text-gray-700 mb-4">
                You may request a full refund within <strong>7 days</strong> of your initial purchase if:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>You have used less than 20% of your plan's quota</li>
                <li>You have not downloaded more than 2 resumes</li>
                <li>The service has technical issues preventing normal use</li>
                <li>The service does not match the description provided</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Pro-Rated Refunds</h3>
              <p className="text-gray-700 mb-4">
                After the 7-day window, refunds are handled on a case-by-case basis and may be pro-rated based on:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Time remaining in your billing cycle</li>
                <li>Usage of premium features</li>
                <li>Nature of the refund request</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Non-Refundable Situations</h2>
              <p className="text-gray-700 mb-4">
                Refunds will <strong>NOT</strong> be provided in the following cases:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>After using more than 20% of your monthly quota</li>
                <li>For FREE tier accounts (no payment made)</li>
                <li>If your account was terminated for violating Terms of Service</li>
                <li>After downloading 3 or more resumes</li>
                <li>For subscription renewals (cancel before renewal date)</li>
                <li>Change of mind after extensive usage</li>
                <li>Dissatisfaction with AI suggestions (subjective content)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Refund Process</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 How to Request</h3>
              <p className="text-gray-700 mb-4">
                To request a refund:
              </p>
              <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-4">
                <li>Email us at <a href="mailto:refunds@resumebuilder.com" className="text-blue-600 hover:text-blue-500">refunds@resumebuilder.com</a></li>
                <li>Include your account email and order/payment ID</li>
                <li>Provide a brief reason for the refund request</li>
                <li>We will respond within 2-3 business days</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Processing Time</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Approved refunds are processed within 5-7 business days</li>
                <li>Refunds are issued to the original payment method</li>
                <li>Bank processing may take an additional 5-10 business days</li>
                <li>You will receive an email confirmation once processed</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Partial Refunds</h3>
              <p className="text-gray-700 mb-4">
                In some cases, we may offer partial refunds:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Pro-rated amount based on usage</li>
                <li>Credit towards future purchase</li>
                <li>Discount on annual plan upgrade</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Subscription Cancellation</h2>
              <p className="text-gray-700 mb-4">
                Different from refunds, you can cancel your subscription at any time:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Your subscription remains active until the end of the current billing period</li>
                <li>No refund for the current period</li>
                <li>You will not be charged for the next period</li>
                <li>Your account reverts to FREE plan</li>
                <li>All created resumes remain accessible</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Annual Plans</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Refund Terms</h3>
              <p className="text-gray-700 mb-4">
                For annual subscriptions (12-month plans):
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Full refund available within 14 days of purchase (if usage {'<'}20%)</li>
                <li>After 14 days, pro-rated refunds based on unused months</li>
                <li>Minimum 3 months will be charged even for early cancellation</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Example Calculation</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700">
                  <strong>Scenario:</strong> You purchased PRO Annual (₹8,999) and request a refund after 2 months
                  with minimal usage.
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Calculation:</strong> ₹8,999 ÷ 12 = ₹749.92/month<br />
                  <strong>Minimum charge:</strong> 3 months × ₹749.92 = ₹2,249.76<br />
                  <strong>Refund:</strong> ₹8,999 - ₹2,249.76 = <strong>₹6,749.24</strong>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Technical Issues</h2>
              <p className="text-gray-700 mb-4">
                If you experience technical problems preventing service use:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Contact support immediately at <a href="mailto:support@resumebuilder.com" className="text-blue-600 hover:text-blue-500">support@resumebuilder.com</a></li>
                <li>We will attempt to resolve the issue within 48 hours</li>
                <li>If unresolved, a full or partial refund may be offered</li>
                <li>Downtime credits may be issued for service interruptions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Chargebacks</h2>
              <p className="text-gray-700 mb-4">
                Please contact us before initiating a chargeback with your bank:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Chargebacks may result in immediate account suspension</li>
                <li>We are usually able to resolve issues through our refund process</li>
                <li>Chargeback fees may be passed on to you</li>
                <li>Unjustified chargebacks may result in permanent account ban</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Payment Processor</h2>
              <p className="text-gray-700 mb-4">
                We use Razorpay for payment processing. Refunds are subject to Razorpay's terms:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Refunds to credit cards may take 5-10 business days</li>
                <li>UPI/bank transfer refunds are usually faster (2-5 days)</li>
                <li>International payments may have longer processing times</li>
                <li>Currency conversion fees are non-refundable</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Exceptions and Goodwill</h2>
              <p className="text-gray-700 mb-4">
                While we have these policies, we evaluate each case individually. In exceptional circumstances,
                we may offer refunds outside these guidelines as a goodwill gesture.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> If you're unsure about a purchase, start with a monthly plan. You can
                  always upgrade to annual later to save money!
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact for Refunds</h2>
              <p className="text-gray-700 mb-4">
                For any refund-related questions or requests:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Refund Requests:</strong> refunds@resumebuilder.com<br />
                  <strong>General Support:</strong> support@resumebuilder.com<br />
                  <strong>Response Time:</strong> 2-3 business days<br />
                  <strong>Processing Time:</strong> 5-7 business days after approval
                </p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                This Refund Policy is part of our Terms of Service. By purchasing, you agree to these refund terms.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a href="/pricing" className="text-blue-600 hover:text-blue-500">
              ← Back to Pricing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
