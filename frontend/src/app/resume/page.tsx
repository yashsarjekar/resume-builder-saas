import { Metadata } from 'next';
import Link from 'next/link';
import { getAllJobSlugs, getAllCompanySlugs, getJobData, getCompanyData } from '@/data/jobs';

export const metadata: Metadata = {
  title: 'Resume Templates for All Job Roles | ATS-Optimized 2025',
  description: 'Browse ATS-optimized resume templates for Software Engineers, Data Analysts, MBA Freshers, and more. Get hired at TCS, Infosys, Wipro with tailored resumes.',
  keywords: [
    'resume templates India',
    'ATS resume templates',
    'job resume format',
    'fresher resume templates',
    'software engineer resume',
    'data analyst resume',
    'MBA fresher resume',
  ],
  openGraph: {
    title: 'Resume Templates for All Job Roles | ATS-Optimized 2025',
    description: 'Browse ATS-optimized resume templates for Software Engineers, Data Analysts, MBA Freshers, and more.',
    type: 'website',
    locale: 'en_IN',
  },
  alternates: {
    canonical: 'https://resumebuilder.pulsestack.in/resume',
  },
};

// Icons for different job categories
const jobIcons: Record<string, { bg: string; color: string; path: string }> = {
  'software-engineer': {
    bg: 'bg-blue-100',
    color: 'text-blue-600',
    path: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  },
  'data-analyst': {
    bg: 'bg-green-100',
    color: 'text-green-600',
    path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  'java-developer': {
    bg: 'bg-orange-100',
    color: 'text-orange-600',
    path: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  'mba-fresher': {
    bg: 'bg-purple-100',
    color: 'text-purple-600',
    path: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  'python-developer': {
    bg: 'bg-yellow-100',
    color: 'text-yellow-600',
    path: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  },
  'web-developer': {
    bg: 'bg-pink-100',
    color: 'text-pink-600',
    path: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
  },
  'devops-engineer': {
    bg: 'bg-indigo-100',
    color: 'text-indigo-600',
    path: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
  },
  'product-manager': {
    bg: 'bg-teal-100',
    color: 'text-teal-600',
    path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  'digital-marketing-manager': {
    bg: 'bg-red-100',
    color: 'text-red-600',
    path: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z',
  },
  'btech-fresher': {
    bg: 'bg-cyan-100',
    color: 'text-cyan-600',
    path: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
  },
};

const defaultIcon = {
  bg: 'bg-gray-100',
  color: 'text-gray-600',
  path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
};

export default function ResumeIndexPage() {
  const jobSlugs = getAllJobSlugs();
  const companySlugs = getAllCompanySlugs();

  // JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Resume Templates',
    description: 'Browse ATS-optimized resume templates for various job roles and companies',
    url: 'https://resumebuilder.pulsestack.in/resume',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: jobSlugs.length + companySlugs.length,
      itemListElement: [
        ...jobSlugs.map((slug, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `https://resumebuilder.pulsestack.in/resume/${slug}`,
          name: getJobData(slug)?.title || slug,
        })),
        ...companySlugs.map((slug, i) => ({
          '@type': 'ListItem',
          position: jobSlugs.length + i + 1,
          url: `https://resumebuilder.pulsestack.in/resume/company/${slug}`,
          name: getCompanyData(slug)?.name || slug,
        })),
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Resume Templates for Every Career
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Choose from ATS-optimized resume templates tailored for your job role or target company.
                Get the format, keywords, and tips that get you shortlisted.
              </p>
              <Link
                href="/builder"
                className="inline-block px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Build Your Resume Free
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 border-b border-gray-200">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{jobSlugs.length}+</div>
                <div className="text-sm text-gray-600">Job Templates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{companySlugs.length}+</div>
                <div className="text-sm text-gray-600">Company Guides</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600">ATS Optimized</div>
              </div>
            </div>
          </div>
        </section>

        {/* Job Templates Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Resume Templates by Job Role</h2>
            <p className="text-gray-600 mb-8">
              Select your target job role to get a tailored resume format with industry-specific keywords.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobSlugs.map((slug) => {
                const job = getJobData(slug);
                if (!job) return null;
                const icon = jobIcons[slug] || defaultIcon;

                return (
                  <Link
                    key={slug}
                    href={`/resume/${slug}`}
                    className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition group"
                  >
                    <div className={`w-12 h-12 ${icon.bg} rounded-lg flex items-center justify-center mb-4`}>
                      <svg className={`w-6 h-6 ${icon.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon.path} />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {job.overview.demandLevel} demand &bull; {job.overview.averageSalaryIndia.fresher} (Fresher)
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {job.resumeSections.atsKeywords.slice(0, 3).map((keyword, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Company Templates Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Resume Templates by Company</h2>
            <p className="text-gray-600 mb-8">
              Applying to a specific company? Get insider tips on their hiring process and ATS keywords.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companySlugs.map((slug) => {
                const company = getCompanyData(slug);
                if (!company) return null;

                return (
                  <Link
                    key={slug}
                    href={`/resume/company/${slug}`}
                    className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition group"
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-indigo-700 font-bold text-lg">
                        {company.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
                      Resume for {company.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {company.industry} &bull; {company.employeeCount} employees
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {company.atsKeywords.slice(0, 3).map((keyword, i) => (
                        <span key={i} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Build Your Resume?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Our AI analyzes job descriptions and optimizes your resume with the right keywords
              to get past ATS systems and land more interviews.
            </p>
            <Link
              href="/builder"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
            >
              Start Building - It&apos;s Free
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
