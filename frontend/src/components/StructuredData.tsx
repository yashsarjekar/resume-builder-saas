export default function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Resume Builder AI',
    url: 'https://resumebuilder.pulsestack.in',
    logo: 'https://resumebuilder.pulsestack.in/opengraph-image',
    description: 'AI-powered resume builder with ATS optimization',
    sameAs: [
      'https://www.instagram.com/resumebuilder.pulsestack.in/',
      'https://www.youtube.com/@resumebuilder.pulsestack',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Resume Builder AI',
    url: 'https://resumebuilder.pulsestack.in',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://resumebuilder.pulsestack.in/resume?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Resume Builder AI',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free AI resume builder with ATS optimization',
      },
      {
        '@type': 'Offer',
        name: 'Pro Plan',
        price: '9.99',
        priceCurrency: 'USD',
        description: 'Unlimited AI optimizations, premium templates, cover letter generator',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '100',
      bestRating: '5',
      worstRating: '1',
    },
    description: 'Build ATS-friendly resumes with AI optimization. Get more interviews with professional templates and keyword extraction.',
    featureList: [
      'AI-powered resume optimization',
      'ATS compatibility scoring',
      'Job description keyword matching',
      'Professional resume templates',
      'Cover letter generator',
      'LinkedIn profile optimizer',
      'PDF download',
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this AI resume builder free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Resume Builder AI offers a free plan that lets you create and download ATS-optimized resumes. A Pro plan is available for unlimited AI optimizations and premium templates.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is an ATS resume and why does it matter?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An ATS (Applicant Tracking System) resume is formatted so that automated software used by employers can correctly parse your experience and skills. Over 98% of Fortune 500 companies use ATS software — a resume that fails ATS scanning never reaches a human recruiter.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the AI resume optimization work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You paste the job description and upload your resume. Our AI analyzes both, identifies missing keywords, scores your ATS compatibility, and rewrites your bullet points to match what the employer is looking for — all in under 60 seconds.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I download my resume as a PDF?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. All resumes can be downloaded as PDF with multiple professional templates including a LaTeX-compiled formal CV format that is completely ATS-clean.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does it work for jobs outside India?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Resume Builder AI supports job applications in the US, UK, Canada, Australia, and India. The AI optimization is tailored to the target market based on the job description you provide.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
