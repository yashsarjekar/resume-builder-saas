import { Metadata } from 'next';
import Link from 'next/link';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'AI Resume Builder | ATS-Optimized Resumes Free',
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
    title: 'AI Resume Builder | ATS-Optimized Resumes Free',
    description: 'Build ATS-friendly resumes with AI optimization. Get more interviews with professional templates.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Resume Builder',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Builder | ATS-Optimized Resumes Free',
    description: 'Build ATS-friendly resumes with AI. Get more interviews with optimized templates.',
  },
  alternates: {
    canonical: 'https://resumebuilder.pulsestack.in',
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
      <div className="bg-white">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Build Your Dream Resume with
          <span className="text-blue-600"> AI-Powered</span> Optimization
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Get past ATS systems and land more interviews. Our AI analyzes job descriptions
          and optimizes your resume for maximum impact.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Get Started Free
          </Link>
          <Link
            href="#features"
            className="px-8 py-4 text-lg font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            See How It Works
          </Link>
        </div>
      </section>

        {/* Problem Section */}
        <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Your Resume Isn&apos;t Getting Responses
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ATS Rejection</h3>
              <p className="text-gray-600">
                75% of resumes never reach human eyes due to ATS filtering systems.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Generic Content</h3>
              <p className="text-gray-600">
                One-size-fits-all resumes don&apos;t match specific job requirements.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Time Consuming</h3>
              <p className="text-gray-600">
                Manually tailoring resumes for each application takes hours.
              </p>
            </div>
          </div>
        </div>
      </section>

        {/* Features Section */}
        <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Features That Get You Hired
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ATS Optimization</h3>
              <p className="text-gray-600">
                AI analyzes job descriptions and optimizes your resume to pass ATS filters with high scores.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Keyword Extraction</h3>
              <p className="text-gray-600">
                Automatically extract key skills and requirements from job postings.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Templates</h3>
              <p className="text-gray-600">
                Choose from ATS-friendly templates designed by hiring experts.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cover Letter Generator</h3>
              <p className="text-gray-600">
                Generate personalized cover letters tailored to each job posting.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">LinkedIn Optimization</h3>
              <p className="text-gray-600">
                Optimize your LinkedIn profile with AI-generated headlines and summaries.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">PDF Export</h3>
              <p className="text-gray-600">
                Download your optimized resume as a professionally formatted PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

        {/* Resume Templates Section */}
        <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Resume Templates by Job Role
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Get started with ATS-optimized resume templates tailored for your specific job role and experience level.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Link
              href="/resume/software-engineer"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Software Engineer</h3>
              <p className="text-gray-600 text-sm">ATS-optimized templates for developers</p>
            </Link>
            <Link
              href="/resume/data-analyst"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Analyst</h3>
              <p className="text-gray-600 text-sm">Templates with analytics keywords</p>
            </Link>
            <Link
              href="/resume/java-developer"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Java Developer</h3>
              <p className="text-gray-600 text-sm">Spring Boot &amp; enterprise focused</p>
            </Link>
            <Link
              href="/resume/mba-fresher"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">MBA Fresher</h3>
              <p className="text-gray-600 text-sm">Management trainee templates</p>
            </Link>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/resume"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all resume templates &rarr;
            </Link>
          </div>
        </div>
      </section>

        {/* Career Tips & Blog Section */}
        <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Career Tips & Resources
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expert advice to help you succeed in your job search
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Link
              href="/blog/how-to-write-ats-friendly-resume"
              className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition border border-gray-200"
            >
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mb-3">
                Resume Tips
              </span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                How to Write an ATS-Friendly Resume
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Learn how to create a resume that passes Applicant Tracking Systems and lands you more interviews.
              </p>
              <span className="text-blue-600 font-medium text-sm">Read article &rarr;</span>
            </Link>
            <Link
              href="/blog/fresher-resume-mistakes"
              className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition border border-gray-200"
            >
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium mb-3">
                For Freshers
              </span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Top 10 Resume Mistakes Freshers Make
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Avoid these common errors that prevent fresh graduates from getting interview calls.
              </p>
              <span className="text-blue-600 font-medium text-sm">Read article &rarr;</span>
            </Link>
            <Link
              href="/blog/coding-interview-tips-for-beginners"
              className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition border border-gray-200"
            >
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium mb-3">
                Interview Prep
              </span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Coding Interview Tips for Beginners
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Essential tips to prepare for technical coding interviews at top companies.
              </p>
              <span className="text-blue-600 font-medium text-sm">Read article &rarr;</span>
            </Link>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all career tips &rarr;
            </Link>
          </div>
        </div>
      </section>

        {/* CTA Section */}
        <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have successfully optimized their resumes with AI.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-lg hover:bg-gray-100 transition"
          >
            Start Building for Free
          </Link>
        </div>
        </section>
      </div>
    </>
  );
}
