import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJobData, getAllJobSlugs } from '@/data/jobs';

interface PageProps {
  params: Promise<{ jobTitle: string }>;
}

// Generate static paths for all job titles
export async function generateStaticParams() {
  const slugs = getAllJobSlugs();
  return slugs.map((jobTitle) => ({ jobTitle }));
}

// Dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { jobTitle } = await params;
  const job = getJobData(jobTitle);
  if (!job) return {};

  const title = `${job.title} Resume Template India 2025 | Free ATS-Friendly Format`;
  const description = `Create a professional ${job.title} resume with our AI-powered builder. ATS-optimized templates, real examples, and expert tips for Indian job market. Average salary: ${job.overview.averageSalaryIndia.fresher} to ${job.overview.averageSalaryIndia.senior}.`;

  return {
    title,
    description,
    keywords: [
      `${job.title} resume`,
      `${job.title} resume format`,
      `${job.title} resume India`,
      `ATS resume for ${job.title}`,
      `${job.title} resume for freshers`,
      ...job.resumeSections.atsKeywords.slice(0, 5),
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'en_IN',
    },
    alternates: {
      canonical: `https://resumebuilder.in/resume/${jobTitle}`,
    },
  };
}

export default async function JobResumePage({ params }: PageProps) {
  const { jobTitle } = await params;
  const job = getJobData(jobTitle);
  if (!job) notFound();

  // JSON-LD Schema for rich snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${job.title} Resume Template India 2025`,
    description: `Professional resume guide for ${job.title} positions in India`,
    author: { '@type': 'Organization', name: 'ResumeBuilder.in' },
    publisher: { '@type': 'Organization', name: 'ResumeBuilder.in' },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: job.faqs.map((faq) => ({
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
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center">
              <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                {job.overview.demandLevel} Demand in India
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {job.title} Resume Template India
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Create an ATS-friendly {job.title} resume in minutes. Get more interviews with our
                AI-powered resume builder optimized for Indian job market.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/builder?template=${jobTitle}`}
                  className="px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  Build Your Resume - Free
                </Link>
                <Link
                  href="#examples"
                  className="px-8 py-4 text-lg font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition border border-gray-300"
                >
                  View Examples
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8 border-b border-gray-200">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{job.overview.averageSalaryIndia.fresher}</div>
                <div className="text-sm text-gray-600">Fresher Salary</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{job.overview.averageSalaryIndia.mid}</div>
                <div className="text-sm text-gray-600">Mid-Level Salary</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{job.overview.averageSalaryIndia.senior}</div>
                <div className="text-sm text-gray-600">Senior Salary</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{job.overview.topHiringCompanies.length}+</div>
                <div className="text-sm text-gray-600">Top Companies Hiring</div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About {job.title} Role</h2>
            <p className="text-gray-600 leading-relaxed">{job.overview.description}</p>
          </section>

          {/* Skills Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Skills to Include in Your {job.title} Resume
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4 text-green-800 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Must-Have Skills
                </h3>
                <ul className="space-y-2">
                  {job.resumeSections.mustHaveSkills.map((skill, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4 text-blue-800 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nice-to-Have Skills
                </h3>
                <ul className="space-y-2">
                  {job.resumeSections.niceToHaveSkills.map((skill, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ATS Keywords */}
          <section className="mb-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              ATS Keywords for {job.title} Resume
            </h2>
            <p className="text-gray-600 mb-4">
              Include these keywords to pass Applicant Tracking Systems used by{' '}
              {job.overview.topHiringCompanies.slice(0, 3).join(', ')} and other top companies:
            </p>
            <div className="flex flex-wrap gap-2">
              {job.resumeSections.atsKeywords.map((keyword, i) => (
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
                <strong>Pro Tip:</strong> Our AI automatically adds relevant ATS keywords to your resume
                based on the job description you provide.
              </p>
              <Link href="/builder" className="text-blue-600 font-semibold hover:underline">
                Try the AI Resume Builder
              </Link>
            </div>
          </section>

          {/* Resume Summary Examples */}
          <section id="examples" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {job.title} Resume Summary Examples
            </h2>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-700 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
                  For Freshers (0-1 years)
                </h3>
                <blockquote className="bg-gray-50 p-4 rounded border-l-4 border-green-500 text-gray-700 italic">
                  &quot;{job.summaryExamples.fresher}&quot;
                </blockquote>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-700 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
                  Mid-Level (2-5 years)
                </h3>
                <blockquote className="bg-gray-50 p-4 rounded border-l-4 border-blue-500 text-gray-700 italic">
                  &quot;{job.summaryExamples.midLevel}&quot;
                </blockquote>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-purple-700 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2 text-sm">3</span>
                  Senior Level (5+ years)
                </h3>
                <blockquote className="bg-gray-50 p-4 rounded border-l-4 border-purple-500 text-gray-700 italic">
                  &quot;{job.summaryExamples.senior}&quot;
                </blockquote>
              </div>
            </div>
          </section>

          {/* Experience Bullet Examples */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Experience Section Examples
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                Use these bullet points as inspiration for describing your work experience:
              </p>
              <ul className="space-y-3">
                {job.experienceBullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <span className="text-blue-600 font-bold">•</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Action Verbs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Power Words for Your {job.title} Resume
            </h2>
            <p className="text-gray-600 mb-4">Start your bullet points with these action verbs:</p>
            <div className="flex flex-wrap gap-2">
              {job.resumeSections.actionVerbs.map((verb, i) => (
                <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                  {verb}
                </span>
              ))}
            </div>
          </section>

          {/* Certifications */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Recommended Certifications
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {job.resumeSections.certifications.map((cert, i) => (
                <div key={i} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{cert}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Top Hiring Companies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Top Companies Hiring {job.title}s in India
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {job.overview.topHiringCompanies.map((company, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 hover:border-blue-300 transition"
                >
                  <span className="font-medium text-gray-700">{company}</span>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {job.faqs.map((faq, i) => (
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

          {/* Related Jobs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Resume Guides</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {job.relatedJobs.map((relatedSlug, i) => (
                <Link
                  key={i}
                  href={`/resume/${relatedSlug}`}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition text-center"
                >
                  <span className="text-gray-700 capitalize">
                    {relatedSlug.replace(/-/g, ' ')} Resume
                  </span>
                  <span className="text-blue-600 ml-1">&rarr;</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Build Your {job.title} Resume?
            </h2>
            <p className="mb-6 text-blue-100 max-w-2xl mx-auto">
              Join thousands of professionals who landed their dream jobs with our AI-powered resume builder.
              Get started in minutes - no credit card required.
            </p>
            <Link
              href={`/builder?template=${jobTitle}`}
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
            >
              Create Your Resume - It&apos;s Free
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
