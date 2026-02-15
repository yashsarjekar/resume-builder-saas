import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing Plans | Resume Builder - Free, Starter & Pro',
  description: 'Choose the perfect Resume Builder plan. Free tier available. Starter plan at ₹299/month and Pro plan at ₹999/month with unlimited AI-powered features.',
  keywords: [
    'resume builder pricing',
    'AI resume builder cost',
    'resume builder subscription',
    'professional resume plans',
    'ATS resume pricing India',
  ],
  alternates: {
    canonical: 'https://resumebuilder.pulsestack.in/pricing',
  },
  openGraph: {
    title: 'Pricing Plans | Resume Builder',
    description: 'Choose the perfect Resume Builder plan. Free tier available with paid plans starting at ₹299/month.',
    type: 'website',
    locale: 'en_IN',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
