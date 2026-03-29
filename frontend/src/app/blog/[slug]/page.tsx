import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllBlogSlugs, getBlogPost, getRelatedPosts } from '@/data/blog';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Resume Builder Blog`,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      locale: 'en_IN',
    },
    alternates: {
      canonical: `https://resumebuilder.pulsestack.in/blog/${slug}`,
    },
  };
}

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

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const relatedPosts = getRelatedPosts(slug, 3);

  // JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ResumeBuilder.in',
    },
    datePublished: post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://resumebuilder.pulsestack.in/blog/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-[#050816] min-h-screen">
        {/* Article Header */}
        <header className="relative py-14 border-b border-white/10 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm">
              <Link href="/blog" className="text-gray-500 hover:text-gray-300 transition">
                Blog
              </Link>
              <span className="mx-2 text-gray-600">/</span>
              <span className="text-gray-400">{categoryLabels[post.category]}</span>
            </nav>

            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${categoryColors[post.category]}`}>
              {categoryLabels[post.category]}
            </span>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {post.title}
            </h1>

            <p className="text-xl text-gray-400 mb-6">
              {post.excerpt}
            </p>

            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium text-gray-400">{post.author}</span>
              <span className="mx-2">•</span>
              <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="mx-2">•</span>
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div
              className="prose prose-lg max-w-none prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-li:text-gray-300 prose-strong:text-white prose-blockquote:border-indigo-500 prose-blockquote:text-gray-400 prose-code:text-indigo-300 prose-code:bg-white/10 prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-hr:border-white/10"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-12 bg-white/[0.02] border-t border-white/10">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="text-2xl font-bold text-white mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="group glass-card rounded-xl p-6 block"
                  >
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${categoryColors[relatedPost.category]}`}>
                      {categoryLabels[relatedPost.category]}
                    </span>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-12 relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.10) 50%, rgba(6,182,212,0.08) 100%)' }} />
          <div className="absolute inset-0 border-y border-white/10" />
          <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Apply These Tips?
            </h2>
            <p className="text-lg text-gray-400 mb-6">
              Create your ATS-optimized resume with our AI-powered builder.
            </p>
            <Link href="/builder" className="btn-primary inline-block px-6 py-3">
              Build Your Resume Free
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
