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
  const description = `Create a professional ${job.title} resume with our AI-powered builder. ATS-optimized templates, real examples, and expert tips.`;

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
      canonical: `https://resumebuilder.pulsestack.in/resume/${jobTitle}`,
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
                {job.overview.demandLevel} Demand in India
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {job.title} Resume Template India
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
                Create an ATS-friendly {job.title} resume in minutes. Get more interviews with our
                AI-powered resume builder optimized for Indian job market.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/builder?template=${jobTitle}`} className="btn-primary px-8 py-4 text-lg">
                  Build Your Resume - Free
                </Link>
                <Link
                  href="#examples"
                  className="btn-ghost px-8 py-4 text-lg"
                >
                  View Examples
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8 border-b border-white/10">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-400">{job.overview.averageSalaryIndia.fresher}</div>
                <div className="text-sm text-gray-500">Fresher Salary</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-400">{job.overview.averageSalaryIndia.mid}</div>
                <div className="text-sm text-gray-500">Mid-Level Salary</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">{job.overview.averageSalaryIndia.senior}</div>
                <div className="text-sm text-gray-500">Senior Salary</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-400">{job.overview.topHiringCompanies.length}+</div>
                <div className="text-sm text-gray-500">Top Companies Hiring</div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 max-w-5xl">

          {/* Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">About {job.title} Role</h2>
            <p className="text-gray-400 leading-relaxed">{job.overview.description}</p>
          </section>

          {/* Skills Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Skills to Include in Your {job.title} Resume
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-6 border-l-4 border-emerald-500/60">
                <h3 className="font-semibold text-lg mb-4 text-emerald-300 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Must-Have Skills
                </h3>
                <ul className="space-y-2">
                  {job.resumeSections.mustHaveSkills.map((skill, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card rounded-xl p-6 border-l-4 border-indigo-500/60">
                <h3 className="font-semibold text-lg mb-4 text-indigo-300 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nice-to-Have Skills
                </h3>
                <ul className="space-y-2">
                  {job.resumeSections.niceToHaveSkills.map((skill, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ATS Keywords */}
          <section className="mb-12 glass-card rounded-xl p-6 border-l-4 border-amber-500/60">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              ATS Keywords for {job.title} Resume
            </h2>
            <p className="text-gray-400 mb-4">
              Include these keywords to pass Applicant Tracking Systems used by{' '}
              {job.overview.topHiringCompanies.slice(0, 3).join(', ')} and other top companies:
            </p>
            <div className="flex flex-wrap gap-2">
              {job.resumeSections.atsKeywords.map((keyword, i) => (
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
                <strong className="text-white">Pro Tip:</strong> Our AI automatically adds relevant ATS keywords to your resume
                based on the job description you provide.
              </p>
              <Link href="/builder" className="text-indigo-400 font-semibold hover:text-indigo-300 transition">
                Try the AI Resume Builder
              </Link>
            </div>
          </section>

          {/* Resume Summary Examples */}
          <section id="examples" className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              {job.title} Resume Summary Examples
            </h2>

            <div className="space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold text-emerald-300 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mr-2 text-sm text-emerald-300">1</span>
                  For Freshers (0-1 years)
                </h3>
                <blockquote className="bg-white/5 p-4 rounded border-l-4 border-emerald-500/60 text-gray-300 italic">
                  &quot;{job.summaryExamples.fresher}&quot;
                </blockquote>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold text-indigo-300 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-indigo-500/20 border border-indigo-500/30 rounded-full flex items-center justify-center mr-2 text-sm text-indigo-300">2</span>
                  Mid-Level (2-5 years)
                </h3>
                <blockquote className="bg-white/5 p-4 rounded border-l-4 border-indigo-500/60 text-gray-300 italic">
                  &quot;{job.summaryExamples.midLevel}&quot;
                </blockquote>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold text-purple-300 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center mr-2 text-sm text-purple-300">3</span>
                  Senior Level (5+ years)
                </h3>
                <blockquote className="bg-white/5 p-4 rounded border-l-4 border-purple-500/60 text-gray-300 italic">
                  &quot;{job.summaryExamples.senior}&quot;
                </blockquote>
              </div>
            </div>
          </section>

          {/* Experience Bullet Examples */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Experience Section Examples
            </h2>
            <div className="glass-card rounded-xl p-6">
              <p className="text-gray-400 mb-4">
                Use these bullet points as inspiration for describing your work experience:
              </p>
              <ul className="space-y-3">
                {job.experienceBullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <span className="text-indigo-400 font-bold">•</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Action Verbs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              Power Words for Your {job.title} Resume
            </h2>
            <p className="text-gray-400 mb-4">Start your bullet points with these action verbs:</p>
            <div className="flex flex-wrap gap-2">
              {job.resumeSections.actionVerbs.map((verb, i) => (
                <span key={i} className="bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 px-3 py-1 rounded text-sm">
                  {verb}
                </span>
              ))}
            </div>
          </section>

          {/* Certifications */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              Recommended Certifications
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {job.resumeSections.certifications.map((cert, i) => (
                <div key={i} className="flex items-center gap-3 p-4 glass-card rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <span className="text-gray-300">{cert}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Top Hiring Companies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Top Companies Hiring {job.title}s in India
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {job.overview.topHiringCompanies.map((company, i) => (
                <div
                  key={i}
                  className="glass-card rounded-xl p-4 text-center"
                >
                  <span className="font-medium text-gray-300">{company}</span>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {job.faqs.map((faq, i) => (
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

          {/* Related Jobs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Related Resume Guides</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {job.relatedJobs.map((relatedSlug, i) => (
                <Link
                  key={i}
                  href={`/resume/${relatedSlug}`}
                  className="glass-card rounded-xl p-4 text-center block hover:border-indigo-500/40 transition"
                >
                  <span className="text-gray-300 capitalize">
                    {relatedSlug.replace(/-/g, ' ')} Resume
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
                Ready to Build Your {job.title} Resume?
              </h2>
              <p className="mb-6 text-gray-400 max-w-2xl mx-auto">
                Join thousands of professionals who landed their dream jobs with our AI-powered resume builder.
                Get started in minutes - no credit card required.
              </p>
              <Link href={`/builder?template=${jobTitle}`} className="btn-primary inline-block px-8 py-4 text-lg">
                Create Your Resume - It&apos;s Free
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
