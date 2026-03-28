import { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'Free AI Resume Builder | Create ATS-Optimized Resumes Online',
  description: 'Build ATS-friendly resumes with AI optimization. Get more interviews with professional templates and keyword extraction.',
  keywords: [
    'AI resume builder',
    'ATS resume',
    'resume builder India',
    'free resume maker',
    'resume optimization',
    'ATS friendly resume',
    'job resume format',
    'professional resume templates',
  ],
  openGraph: {
    title: 'Free AI Resume Builder | Create ATS-Optimized Resumes Online',
    description: 'Build ATS-friendly resumes with AI optimization. Get more interviews with professional templates.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Resume Builder',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Resume Builder | Create ATS-Optimized Resumes Online',
    description: 'Build ATS-friendly resumes with AI. Get more interviews with optimized templates.',
  },
  alternates: {
    canonical: 'https://resumebuilder.pulsestack.in/',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  return (
    <>
      <StructuredData />
      <LandingPage />
    </>
  );
}
