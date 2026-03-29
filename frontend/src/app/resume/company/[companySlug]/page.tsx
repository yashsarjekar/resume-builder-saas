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

      <div className="bg-[#050816] min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-15%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <div className="text-center">
              <span className="inline-block px-4 py-1.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-full text-sm font-medium mb-6">
                {company.industry}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Resume for {company.name}
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
                Get your resume shortlisted at {company.name}. Learn the hiring process, ATS keywords,
                and resume tips specific to {company.name}.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/builder?company=${companySlug}`} className="btn-primary px-8 py-4 text-lg">
                  Build Your Resume - Free
                </Link>
                <Link href="#hiring-process" className="btn-ghost px-8 py-4 text-lg">
                  View Hiring Process
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Company Quick Info */}
        <section className="py-8 border-b border-white/10">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-lg font-bold text-white">{company.industry}</div>
                <div className="text-sm text-gray-500">Industry</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{company.headquarter}</div>
                <div className="text-sm text-gray-500">Headquarters</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{company.employeeCount}</div>
                <div className="text-sm text-gray-500">Employees</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{company.popularRoles.length}+</div>
                <div className="text-sm text-gray-500">Popular Roles</div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 max-w-5xl">

          {/* About Company */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">About {company.name}</h2>
            <p className="text-gray-400 leading-relaxed">{company.description}</p>
          </section>

          {/* Popular Roles */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Popular Roles at {company.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {company.popularRoles.map((role, i) => (
                <div
                  key={i}
                  className="glass-card rounded-xl p-4 text-center"
                >
                  <span className="font-medium text-gray-300">{role}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Hiring Process */}
          <section id="hiring-process" className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              {company.name} Hiring Process
            </h2>
            <div className="space-y-4">
              {company.hiringProcess.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{i + 1}</span>
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-gray-300">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Resume Tips */}
          <section className="mb-12 glass-card rounded-xl p-6 border-l-4 border-emerald-500/60">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Resume Tips for {company.name}
            </h2>
            <ul className="space-y-4">
              {company.resumeTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ATS Keywords */}
          <section className="mb-12 glass-card rounded-xl p-6 border-l-4 border-amber-500/60">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              ATS Keywords for {company.name} Resume
            </h2>
            <p className="text-gray-400 mb-4">
              Include these keywords in your resume to pass {company.name}&apos;s Applicant Tracking System:
            </p>
            <div className="flex flex-wrap gap-2">
              {company.atsKeywords.map((keyword, i) => (
                <span
                  key={i}
                  className="bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-gray-300 mb-2">
                <strong className="text-white">Pro Tip:</strong> Our AI analyzes {company.name} job descriptions and automatically
                optimizes your resume with relevant keywords.
              </p>
              <Link href="/builder" className="text-indigo-400 font-semibold hover:text-indigo-300 transition">
                Try the AI Resume Builder
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Frequently Asked Questions about {company.name}
            </h2>
            <div className="space-y-4">
              {company.faqs.map((faq, i) => (
                <details key={i} className="glass-card rounded-xl group">
                  <summary className="p-4 cursor-pointer font-semibold text-white hover:text-indigo-300 flex items-center justify-between transition">
                    {faq.question}
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 text-gray-400">{faq.answer}</div>
                </details>
              ))}
            </div>
          </section>

          {/* Related Companies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Similar Companies</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {company.relatedCompanies.map((relatedSlug, i) => (
                <Link
                  key={i}
                  href={`/resume/company/${relatedSlug}`}
                  className="glass-card rounded-xl p-4 text-center block hover:border-indigo-500/40 transition"
                >
                  <span className="text-gray-300 capitalize">
                    {relatedSlug.replace(/-/g, ' ').toUpperCase()}
                  </span>
                  <span className="text-indigo-400 ml-1">&rarr;</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="relative rounded-2xl p-8 text-center overflow-hidden">
            <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.20) 50%, rgba(6,182,212,0.12) 100%)' }} />
            <div className="absolute inset-0 rounded-2xl border border-indigo-500/30" />
            <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to Apply at {company.name}?
              </h2>
              <p className="mb-6 text-gray-400 max-w-2xl mx-auto">
                Create an ATS-optimized resume tailored for {company.name}. Our AI helps you include
                the right keywords and format your resume for success.
              </p>
              <Link href={`/builder?company=${companySlug}`} className="btn-primary inline-block px-8 py-4 text-lg">
                Create Your Resume - It&apos;s Free
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
