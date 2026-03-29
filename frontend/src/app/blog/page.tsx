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
  'resume-tips': 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  'interview-prep': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  'career-advice': 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
};

export default function BlogPage() {
  const featuredPosts = getFeaturedPosts();
  const resumeTips = getPostsByCategory('resume-tips');
  const interviewPrep = getPostsByCategory('interview-prep');
  const careerAdvice = getPostsByCategory('career-advice');

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

      <div className="bg-[#050816] min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="text-center">
              <span className="inline-block px-4 py-1.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-full text-sm font-medium mb-6">
                Career Resources
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Career Blog
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Expert tips on resume writing, interview preparation, and landing your dream job at top companies.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-12 border-b border-white/10">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="text-2xl font-bold text-white mb-8">Featured Articles</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {featuredPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group glass-card rounded-xl p-6 block"
                  >
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${categoryColors[post.category]}`}>
                      {categoryLabels[post.category]}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 mb-4 line-clamp-2">
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
              <h2 className="text-2xl font-bold text-white">Resume Tips</h2>
              <span className="text-sm text-gray-500">{resumeTips.length} articles</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {resumeTips.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group glass-card rounded-xl p-6 block"
                >
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${categoryColors[post.category]}`}>
                    {categoryLabels[post.category]}
                  </span>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
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
        <section className="py-12 bg-white/[0.02]">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Interview Preparation</h2>
              <span className="text-sm text-gray-500">{interviewPrep.length} articles</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {interviewPrep.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group glass-card rounded-xl p-6 block"
                >
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${categoryColors[post.category]}`}>
                    {categoryLabels[post.category]}
                  </span>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-300 transition line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
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

        {/* Career Advice Section */}
        {careerAdvice.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Career Advice</h2>
                <span className="text-sm text-gray-500">{careerAdvice.length} articles</span>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {careerAdvice.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group glass-card rounded-xl p-6 block"
                  >
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${categoryColors[post.category]}`}>
                      {categoryLabels[post.category]}
                    </span>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
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
        )}

        {/* CTA Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.10) 50%, rgba(6,182,212,0.08) 100%)' }} />
          <div className="absolute inset-0 border-y border-white/10" />
          <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Build Your Resume?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Put these tips into action with our AI-powered resume builder.
            </p>
            <Link href="/builder" className="btn-primary inline-block px-8 py-4 text-lg">
              Create Your Resume Free
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
