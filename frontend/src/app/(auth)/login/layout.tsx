import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Resume Builder - AI-Powered Resume Creation',
  description: 'Sign in to your Resume Builder account. Access your AI-powered resume builder, ATS score analysis, and professional templates.',
  alternates: {
    canonical: 'https://resumebuilder.pulsestack.in/login',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
