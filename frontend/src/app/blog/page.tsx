import { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts, getFeaturedPosts, getPostsByCategory } from '@/data/blog';

export const metadata: Metadata = {
  title: 'Career Blog | Resume Tips, Interview Prep & Job Search Advice',
  description: 'Expert advice on resume writing, interview preparation, and career development. Tips for TCS, Infosys, Wipro interviews and ATS-friendly resume formats.',
  keywords: [
    'resume tips',
    'interview preparation',
    'career advice',
    'TCS interview questions',
    'Infosys interview',
    'ATS resume',
    'fresher job tips',
  ],
  openGraph: {
    title: 'Career Blog | Resume Tips & Interview Prep',
    description: 'Expert advice on resume writing, interview preparation, and career development.',
    type: 'website',
    locale: 'en_IN',
  },
  alternates: {
    canonical: 'https://resumebuilder.pulsestack.in/blog',
  },
};

const categoryLabels = {
  'resume-tips': 'Resume Tips',
  'interview-prep': 'Interview Prep',
  'career-advice': 'Career Advice',
};

const categoryColors = {
  'resume-tips': 'bg-blue-100 text-blue-700',
  'interview-prep': 'bg-green-100 text-green-700',
  'career-advice': 'bg-purple-100 text-purple-700',
};

export default function BlogPage() {
  const featuredPosts = getFeaturedPosts();
  const resumeTips = getPostsByCategory('resume-tips');
  const interviewPrep = getPostsByCategory('interview-prep');

  // JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Resume Builder Career Blog',
    description: 'Expert advice on resume writing, interview preparation, and career development',
    url: 'https://resumebuilder.pulsestack.in/blog',
    publisher: {
      '@type': 'Organization',
      name: 'ResumeBuilder.in',
    },
    blogPost: blogPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `https://resumebuilder.pulsestack.in/blog/${post.slug}`,
      datePublished: post.publishedAt,
      author: {
        '@type': 'Organization',
        name: post.author,
      },
    })),
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
                Career Blog
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Expert tips on resume writing, interview preparation, and landing your dream job at top companies.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-12 border-b border-gray-200">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Articles</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {featuredPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 hover:border-blue-300 hover:shadow-lg transition"
                  >
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${categoryColors[post.category]}`}>
                      {categoryLabels[post.category]}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{post.readTime} min read</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Resume Tips Section */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Resume Tips</h2>
              <span className="text-sm text-gray-500">{resumeTips.length} articles</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {resumeTips.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition"
                >
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${categoryColors[post.category]}`}>
                    {categoryLabels[post.category]}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="text-sm text-gray-500">
                    {post.readTime} min read
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Interview Prep Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Interview Preparation</h2>
              <span className="text-sm text-gray-500">{interviewPrep.length} articles</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {interviewPrep.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-md transition"
                >
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${categoryColors[post.category]}`}>
                    {categoryLabels[post.category]}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="text-sm text-gray-500">
                    {post.readTime} min read
                  </div>
                </Link>
              ))}
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
              Put these tips into action with our AI-powered resume builder.
            </p>
            <Link
              href="/builder"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
            >
              Create Your Resume Free
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
