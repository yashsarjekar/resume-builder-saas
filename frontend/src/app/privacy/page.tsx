import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Resume Builder',
  description: 'Learn how Resume Builder collects, uses, and protects your personal information. Read our comprehensive privacy policy.',
  alternates: {
    canonical: 'https://resumebuilder.pulsestack.in/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: February 10, 2026</p>

          <div className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to Resume Builder ("we," "our," or "us"). We are committed to protecting your personal
                information and your right to privacy. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you use our resume building service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Personal Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Name and email address (for account creation)</li>
                <li>Payment information (processed securely through Razorpay)</li>
                <li>Resume content (work experience, education, skills, etc.)</li>
                <li>Profile information (LinkedIn data if you choose to upload)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>IP address and browser type</li>
                <li>Usage data and analytics</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-3">We use your information to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide and maintain our resume building service</li>
                <li>Process your payments and manage subscriptions</li>
                <li>Analyze resumes using AI (Claude by Anthropic)</li>
                <li>Improve our services and develop new features</li>
                <li>Send you service updates and promotional materials (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. AI Processing</h2>
              <p className="text-gray-700 mb-4">
                We use Claude AI (by Anthropic) to analyze and optimize your resume content. Your resume data is
                processed through Anthropic's API. Anthropic's data processing practices are governed by their
                privacy policy. We do not store your resume content on Anthropic's servers permanently.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-3">We may share your information with:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Service Providers:</strong> Razorpay (payments), Anthropic (AI processing), email service providers</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              </ul>
              <p className="text-gray-700 mt-4">
                <strong>We do NOT:</strong> Sell your personal data to third parties or share your resume content
                with employers without your explicit consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational security measures to protect your personal
                information, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Secure password hashing (bcrypt)</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Secure payment processing (PCI-DSS compliant through Razorpay)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information for as long as your account is active or as needed to provide
                services. You can request deletion of your account and data at any time by contacting us.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Resume data: Retained while your account is active</li>
                <li>Payment records: Retained for 7 years (legal requirement)</li>
                <li>Analytics data: Anonymized after 90 days</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Rights</h2>
              <p className="text-gray-700 mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct your information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your resume data in PDF/JSON format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
                <li><strong>Object:</strong> Object to processing of your data for certain purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to enhance your experience. You can control cookies through
                your browser settings. Essential cookies are required for the service to function.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Essential cookies: Authentication and security</li>
                <li>Analytics cookies: Usage statistics (can be opted out)</li>
                <li>Preference cookies: Your settings and preferences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our service is not intended for children under 16 years of age. We do not knowingly collect personal
                information from children. If you believe we have collected data from a child, please contact us
                immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than India. We ensure
                appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any significant changes
                by email or through the service. Your continued use of the service after changes constitutes
                acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@resumebuilder.com<br />
                  <strong>Support:</strong> support@resumebuilder.com
                </p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                By using our service, you acknowledge that you have read and understood this Privacy Policy.
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
