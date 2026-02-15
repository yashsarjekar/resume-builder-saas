import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up Free | Resume Builder - Create Your Account',
  description: 'Create your free Resume Builder account. Build ATS-optimized resumes with AI assistance, professional templates, and job-specific optimization.',
  alternates: {
    canonical: 'https://resumebuilder.pulsestack.in/signup',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
