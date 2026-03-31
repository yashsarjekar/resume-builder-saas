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

const categoryGradients = {
  'resume-tips': 'from-indigo-600 via-blue-600 to-indigo-800',
  'interview-prep': 'from-emerald-600 via-teal-600 to-emerald-800',
  'career-advice': 'from-purple-600 via-violet-600 to-purple-800',
};

const categoryIcons = {
  'resume-tips': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  'interview-prep': 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  'career-advice': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
};

function BlogCard({ post, featured = false }: { post: typeof blogPosts[0]; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group glass-card rounded-xl overflow-hidden block h-full"
    >
      {/* Gradient thumbnail */}
      <div className={`relative bg-gradient-to-br ${categoryGradients[post.category]} overflow-hidden ${featured ? 'h-44' : 'h-36'}`}>
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 25% 40%, rgba(255,255,255,0.4), transparent 55%)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={categoryIcons[post.category]} />
          </svg>
        </div>
        {/* Read time badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm text-white/80 text-xs px-2.5 py-1 rounded-full">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {post.readTime} min
        </div>
        {post.featured && (
          <div className="absolute top-3 left-3 bg-amber-400/90 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${categoryColors[post.category]}`}>
          {categoryLabels[post.category]}
        </span>
        <h3 className={`font-bold text-white mb-2 group-hover:text-indigo-300 transition line-clamp-2 leading-snug ${featured ? 'text-lg' : 'text-base'}`}>
          {post.title}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span className="text-indigo-400 group-hover:text-indigo-300 transition font-medium">Read more →</span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const featuredPosts = getFeaturedPosts();
  const resumeTips = getPostsByCategory('resume-tips');
  const interviewPrep = getPostsByCategory('interview-prep');
  const careerAdvice = getPostsByCategory('career-advice');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Resume Builder Career Blog',
    description: 'Expert advice on resume writing, interview preparation, and career development',
    url: 'https://resumebuilder.pulsestack.in/blog',
    publisher: { '@type': 'Organization', name: 'ResumeBuilder.in' },
    blogPost: blogPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `https://resumebuilder.pulsestack.in/blog/${post.slug}`,
      datePublished: post.publishedAt,
      author: { '@type': 'Organization', name: post.author },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-[#050816] min-h-screen">

        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 max-w-6xl relative z-10 text-center">
            <span className="inline-block px-4 py-1.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-full text-sm font-medium mb-6">
              Career Resources
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Career Blog
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Expert tips on resume writing, interview prep, and landing your dream job at top companies.
            </p>
            {/* Stats */}
            <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                {blogPosts.length} Articles
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                3 Categories
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                Free to Read
              </span>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="pb-14 border-b border-white/10">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex items-center gap-3 mb-8">
                <span className="w-1 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500 inline-block" />
                <h2 className="text-2xl font-bold text-white">Featured Articles</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredPosts.map((post) => (
                  <BlogCard key={post.slug} post={post} featured />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Resume Tips */}
        <section className="py-14">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-blue-500 inline-block" />
                <h2 className="text-2xl font-bold text-white">Resume Tips</h2>
              </div>
              <span className="text-sm text-gray-600">{resumeTips.length} articles</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {resumeTips.map((post) => <BlogCard key={post.slug} post={post} />)}
            </div>
          </div>
        </section>

        {/* Interview Prep */}
        <section className="py-14 bg-white/[0.02]">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500 inline-block" />
                <h2 className="text-2xl font-bold text-white">Interview Preparation</h2>
              </div>
              <span className="text-sm text-gray-600">{interviewPrep.length} articles</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {interviewPrep.map((post) => <BlogCard key={post.slug} post={post} />)}
            </div>
          </div>
        </section>

        {/* Career Advice */}
        {careerAdvice.length > 0 && (
          <section className="py-14">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <span className="w-1 h-6 rounded-full bg-gradient-to-b from-purple-500 to-violet-500 inline-block" />
                  <h2 className="text-2xl font-bold text-white">Career Advice</h2>
                </div>
                <span className="text-sm text-gray-600">{careerAdvice.length} articles</span>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {careerAdvice.map((post) => <BlogCard key={post.slug} post={post} />)}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.10) 50%, rgba(6,182,212,0.08) 100%)' }} />
          <div className="absolute inset-0 border-y border-white/10" />
          <div className="container mx-auto px-4 max-w-3xl text-center relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Build Your Resume?</h2>
            <p className="text-gray-400 mb-8 text-lg">
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
