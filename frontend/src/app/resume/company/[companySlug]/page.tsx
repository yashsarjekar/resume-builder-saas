import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCompanyData, getAllCompanySlugs } from '@/data/jobs';

interface PageProps {
  params: Promise<{ companySlug: string }>;
}

// Generate static paths for all companies
export async function generateStaticParams() {
  const slugs = getAllCompanySlugs();
  return slugs.map((companySlug) => ({ companySlug }));
}

// Dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { companySlug } = await params;
  const company = getCompanyData(companySlug);
  if (!company) return {};

  const title = `Resume for ${company.name} | Format, Tips & ATS Keywords 2025`;
  const description = `Create the perfect resume for ${company.name}. Get insider tips on ${company.name} hiring process, ATS keywords, and resume format that gets shortlisted.`;

  return {
    title,
    description,
    keywords: [
      `resume for ${company.name}`,
      `${company.name} resume format`,
      `${company.name} hiring process`,
      `${company.name} jobs`,
      `${company.name} interview`,
      ...company.atsKeywords.slice(0, 5),
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'en_IN',
    },
    alternates: {
      canonical: `https://resumebuilder.pulsestack.in/resume/company/${companySlug}`,
    },
  };
}

export default async function CompanyResumePage({ params }: PageProps) {
  const { companySlug } = await params;
  const company = getCompanyData(companySlug);
  if (!company) notFound();

  // JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Resume for ${company.name} - Complete Guide`,
    description: `How to create a resume for ${company.name} that gets shortlisted`,
    author: { '@type': 'Organization', name: 'ResumeBuilder.in' },
    publisher: { '@type': 'Organization', name: 'ResumeBuilder.in' },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: company.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-50 to-purple-100 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center">
              <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                {company.industry}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Resume for {company.name}
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Get your resume shortlisted at {company.name}. Learn the hiring process, ATS keywords,
                and resume tips specific to {company.name}.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/builder?company=${companySlug}`}
                  className="px-8 py-4 text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                >
                  Build Your Resume - Free
                </Link>
                <Link
                  href="#hiring-process"
                  className="px-8 py-4 text-lg font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition border border-gray-300"
                >
                  View Hiring Process
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Company Quick Info */}
        <section className="py-8 border-b border-gray-200">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{company.industry}</div>
                <div className="text-sm text-gray-600">Industry</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{company.headquarter}</div>
                <div className="text-sm text-gray-600">Headquarters</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{company.employeeCount}</div>
                <div className="text-sm text-gray-600">Employees</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{company.popularRoles.length}+</div>
                <div className="text-sm text-gray-600">Popular Roles</div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* About Company */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About {company.name}</h2>
            <p className="text-gray-600 leading-relaxed">{company.description}</p>
          </section>

          {/* Popular Roles */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Popular Roles at {company.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {company.popularRoles.map((role, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 hover:border-indigo-300 transition"
                >
                  <span className="font-medium text-gray-700">{role}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Hiring Process */}
          <section id="hiring-process" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {company.name} Hiring Process
            </h2>
            <div className="space-y-4">
              {company.hiringProcess.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-700 font-bold">{i + 1}</span>
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-gray-700">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Resume Tips */}
          <section className="mb-12 bg-green-50 border border-green-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Resume Tips for {company.name}
            </h2>
            <ul className="space-y-4">
              {company.resumeTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ATS Keywords */}
          <section className="mb-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              ATS Keywords for {company.name} Resume
            </h2>
            <p className="text-gray-600 mb-4">
              Include these keywords in your resume to pass {company.name}&apos;s Applicant Tracking System:
            </p>
            <div className="flex flex-wrap gap-2">
              {company.atsKeywords.map((keyword, i) => (
                <span
                  key={i}
                  className="bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg border border-yellow-300">
              <p className="text-gray-700 mb-2">
                <strong>Pro Tip:</strong> Our AI analyzes {company.name} job descriptions and automatically
                optimizes your resume with relevant keywords.
              </p>
              <Link href="/builder" className="text-indigo-600 font-semibold hover:underline">
                Try the AI Resume Builder
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions about {company.name}
            </h2>
            <div className="space-y-4">
              {company.faqs.map((faq, i) => (
                <details key={i} className="border border-gray-200 rounded-lg group">
                  <summary className="p-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                    {faq.question}
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
                </details>
              ))}
            </div>
          </section>

          {/* Related Companies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Similar Companies</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {company.relatedCompanies.map((relatedSlug, i) => (
                <Link
                  key={i}
                  href={`/resume/company/${relatedSlug}`}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-indigo-300 transition text-center"
                >
                  <span className="text-gray-700 capitalize">
                    {relatedSlug.replace(/-/g, ' ').toUpperCase()}
                  </span>
                  <span className="text-indigo-600 ml-1">&rarr;</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Apply at {company.name}?
            </h2>
            <p className="mb-6 text-indigo-100 max-w-2xl mx-auto">
              Create an ATS-optimized resume tailored for {company.name}. Our AI helps you include
              the right keywords and format your resume for success.
            </p>
            <Link
              href={`/builder?company=${companySlug}`}
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
            >
              Create Your Resume - It&apos;s Free
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
