import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Resume Builder',
  description: 'Read the terms and conditions for using Resume Builder. Understand your rights and responsibilities when using our AI-powered resume service.',
  alternates: {
    canonical: 'https://resumebuilder.pulsestack.in/terms',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: February 10, 2026</p>

          <div className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using Resume Builder ("Service"), you agree to be bound by these Terms of Service
                ("Terms"). If you do not agree to these Terms, please do not use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                Resume Builder is an AI-powered platform that helps users create, optimize, and manage professional
                resumes. The Service includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Resume creation and editing tools</li>
                <li>ATS (Applicant Tracking System) score analysis</li>
                <li>AI-powered resume optimization</li>
                <li>Cover letter generation</li>
                <li>LinkedIn profile optimization</li>
                <li>Multiple PDF templates</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
              <p className="text-gray-700 mb-4">
                To use the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be at least 16 years of age</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription Plans and Payment</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Plans</h3>
              <p className="text-gray-700 mb-4">
                We offer three subscription tiers:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>FREE:</strong> 1 resume, 2 ATS analyses, 10 AI assists/day</li>
                <li><strong>STARTER:</strong> 5 resumes, 10 ATS analyses, 50 AI assists/day (₹299/month)</li>
                <li><strong>PRO:</strong> Unlimited resumes, unlimited ATS analyses, unlimited AI assists (₹999/month)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Payment</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Payments are processed securely through Razorpay</li>
                <li>Subscriptions are billed monthly unless otherwise specified</li>
                <li>All prices are in Indian Rupees (INR)</li>
                <li>You authorize us to charge your payment method on a recurring basis</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Billing</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Billing occurs at the start of each billing cycle</li>
                <li>Failed payments may result in service suspension</li>
                <li>You are responsible for all applicable taxes</li>
                <li>Price changes will be notified 30 days in advance</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Fair Use Policy</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Usage Limits</h3>
              <p className="text-gray-700 mb-4">
                While PRO plans offer "unlimited" usage, this is subject to fair use:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Maximum 500 AI operations per day</li>
                <li>Maximum 100 resume optimizations per month</li>
                <li>Maximum 50 GB bandwidth per month</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Throttling</h3>
              <p className="text-gray-700 mb-4">
                To ensure service quality for all users, we implement progressive throttling:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Users approaching quota limits may experience slower response times (1-4 second delays)</li>
                <li>This is not a service disruption but a fair use measure</li>
                <li>Light users (70%) are unaffected by throttling</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Prohibited Activities</h3>
              <p className="text-gray-700 mb-4">You may NOT:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Use automated tools or bots to access the Service</li>
                <li>Resell or redistribute our Service</li>
                <li>Share your account with multiple users</li>
                <li>Attempt to reverse engineer or copy our AI algorithms</li>
                <li>Upload malicious content or spam</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Your Content</h3>
              <p className="text-gray-700 mb-4">
                You retain all rights to your resume content. By using the Service, you grant us a license to
                process and store your content solely for the purpose of providing the Service.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Our Content</h3>
              <p className="text-gray-700 mb-4">
                All Service features, templates, design, and AI algorithms are our intellectual property or licensed
                to us. You may not copy, modify, or distribute them without written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. AI-Generated Content</h2>
              <p className="text-gray-700 mb-4">
                Our Service uses AI (Claude by Anthropic) to analyze and optimize resumes. Please note:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>AI suggestions are provided "as-is" without warranties</li>
                <li>You are responsible for reviewing and verifying all AI-generated content</li>
                <li>We do not guarantee specific outcomes (job offers, interview calls, etc.)</li>
                <li>AI may occasionally produce inaccurate or inappropriate suggestions</li>
                <li>You must ensure all resume content is truthful and accurate</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cancellation and Refunds</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Cancellation</h3>
              <p className="text-gray-700 mb-4">
                You may cancel your subscription at any time. Upon cancellation:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Your subscription remains active until the end of the current billing period</li>
                <li>You will not be charged for subsequent periods</li>
                <li>Your account reverts to the FREE plan</li>
                <li>You can reactivate your subscription at any time</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 Refunds</h3>
              <p className="text-gray-700 mb-4">
                Refunds are handled on a case-by-case basis. Please see our{' '}
                <a href="/refund" className="text-blue-600 hover:text-blue-500">Refund Policy</a> for details.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Service Modifications</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Modify or discontinue features with reasonable notice</li>
                <li>Update pricing with 30 days advance notice</li>
                <li>Perform maintenance that may temporarily interrupt service</li>
                <li>Improve and enhance the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Account Termination</h2>
              <p className="text-gray-700 mb-4">
                We may suspend or terminate your account if you:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Violate these Terms of Service</li>
                <li>Engage in fraudulent activity</li>
                <li>Abuse the Service or other users</li>
                <li>Fail to pay subscription fees</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Upon termination, your access to paid features will be revoked. We may delete your data after 90
                days of account closure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Disclaimers and Limitations</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">11.1 No Warranties</h3>
              <p className="text-gray-700 mb-4">
                The Service is provided "AS IS" without warranties of any kind. We do not guarantee:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Uninterrupted or error-free service</li>
                <li>Specific job placement outcomes</li>
                <li>Accuracy of AI-generated content</li>
                <li>Compatibility with all ATS systems</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">11.2 Limitation of Liability</h3>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law, we shall not be liable for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Lost profits or revenue</li>
                <li>Data loss (maintain your own backups)</li>
                <li>Damages exceeding the amount you paid in the last 3 months</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of
                [Your City], India. You agree to submit to the jurisdiction of these courts.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We may update these Terms from time to time. Significant changes will be notified via email or
                in-app notification. Continued use of the Service after changes constitutes acceptance of the
                updated Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@resumebuilder.com<br />
                  <strong>Support:</strong> support@resumebuilder.com
                </p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                By using Resume Builder, you acknowledge that you have read, understood, and agree to be bound by
                these Terms of Service.
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
