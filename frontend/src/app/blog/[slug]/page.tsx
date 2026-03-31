import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllBlogSlugs, getBlogPost, getRelatedPosts } from '@/data/blog';
import ReadingProgress from '@/components/blog/ReadingProgress';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

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

const categoryGradients = {
  'resume-tips': 'from-indigo-600 to-blue-600',
  'interview-prep': 'from-emerald-600 to-teal-600',
  'career-advice': 'from-purple-600 to-violet-600',
};

const categoryIcons = {
  'resume-tips': (
    <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  'interview-prep': (
    <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  'career-advice': (
    <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
};

// Extract headings from HTML for TOC
function extractHeadings(html: string) {
  const regex = /<h([23])[^>]*>([\s\S]*?)<\/h[23]>/gi;
  const headings: { level: number; text: string; id: string }[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    const id = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/(^-|-$)/g, '');
    headings.push({ level: parseInt(match[1]), text, id });
  }
  return headings;
}

// Inject id attributes into headings for anchor links
function injectHeadingIds(html: string): string {
  return html.replace(/<h([23])(\s[^>]*)?>(\s*)([\s\S]*?)<\/h[23]>/gi, (_match, level, attrs, space, content) => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const id = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/(^-|-$)/g, '');
    return `<h${level}${attrs || ''} id="${id}">${space}${content}</h${level}>`;
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const relatedPosts = getRelatedPosts(slug, 3);
  const headings = extractHeadings(post.content);
  const processedContent = injectHeadingIds(post.content);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: 'ResumeBuilder.in' },
    datePublished: post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://resumebuilder.pulsestack.in/blog/${slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress />

      <div className="bg-[#050816] min-h-screen">

        {/* ── Article Header ── */}
        <header className="relative overflow-hidden border-b border-white/10">
          {/* Gradient band */}
          <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradients[post.category]} opacity-10`} />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-40%] right-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 max-w-5xl py-14 relative z-10">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm flex items-center gap-2">
              <Link href="/blog" className="text-gray-500 hover:text-gray-300 transition">Blog</Link>
              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-400">{categoryLabels[post.category]}</span>
            </nav>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-5 ${categoryColors[post.category]}`}>
              {categoryIcons[post.category] && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              )}
              {categoryLabels[post.category]}
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-[2.6rem] font-black text-white leading-[1.15] tracking-tight mb-5 max-w-3xl">
              {post.title}
            </h1>

            <p className="text-lg text-gray-400 mb-7 max-w-2xl leading-relaxed">
              {post.excerpt}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                  {post.author.charAt(0)}
                </div>
                <span className="text-gray-300 font-medium">{post.author}</span>
              </div>
              <span className="text-gray-700">•</span>
              <span className="text-gray-500">
                {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="text-gray-700">•</span>
              <span className="flex items-center gap-1.5 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {post.readTime} min read
              </span>
            </div>
          </div>
        </header>

        {/* ── Content + Sidebar ── */}
        <div className="container mx-auto px-4 max-w-6xl py-12">
          <div className="lg:grid lg:grid-cols-[1fr_272px] gap-12 items-start">

            {/* Article body */}
            <article id="article-body">
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 rounded-full text-sm hover:border-indigo-500/40 hover:text-gray-300 transition cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author card */}
              <div className="mt-10 glass-card rounded-xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">{post.author}</p>
                  <p className="text-sm text-gray-400">Career experts helping job seekers build better resumes and land their dream jobs at top companies across India.</p>
                </div>
              </div>
            </article>

            {/* Sticky sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-8 space-y-5">

                {/* Table of Contents */}
                {headings.length > 0 && (
                  <div className="glass-card rounded-xl p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                      Table of Contents
                    </p>
                    <nav className="space-y-0.5">
                      {headings.map((h, i) => (
                        <a
                          key={i}
                          href={`#${h.id}`}
                          className={`toc-link block py-1.5 text-sm text-gray-400 hover:text-indigo-300 border-l-2 border-transparent hover:border-indigo-500/60 transition-all ${h.level === 3 ? 'pl-6' : 'pl-3'}`}
                        >
                          {h.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Sidebar CTA */}
                <div className="glass-card rounded-xl p-5 text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">Build your resume</p>
                  <p className="text-xs text-gray-500 mb-4">ATS-optimized, AI-powered, free forever.</p>
                  <Link href="/builder" className="btn-primary block text-sm py-2.5 px-4 rounded-xl">
                    Start Free →
                  </Link>
                </div>

                {/* Read time pill */}
                <div className="glass rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Estimated read</span>
                  <span className="text-sm font-semibold text-indigo-300">{post.readTime} min</span>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* ── Related Posts ── */}
        {relatedPosts.length > 0 && (
          <section className="py-14 bg-white/[0.02] border-t border-white/10">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="text-2xl font-bold text-white mb-8">Continue Reading</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((rp) => (
                  <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group glass-card rounded-xl overflow-hidden block">
                    {/* Mini gradient thumbnail */}
                    <div className={`h-28 bg-gradient-to-br ${categoryGradients[rp.category]} opacity-80 flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3), transparent 60%)' }} />
                    </div>
                    <div className="p-5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${categoryColors[rp.category]}`}>
                        {categoryLabels[rp.category]}
                      </span>
                      <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-indigo-300 transition line-clamp-2 leading-snug">
                        {rp.title}
                      </h3>
                      <p className="text-gray-500 text-xs">{rp.readTime} min read</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="py-14 relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.10), rgba(6,182,212,0.08))' }} />
          <div className="absolute inset-0 border-y border-white/10" />
          <div className="container mx-auto px-4 max-w-3xl text-center relative z-10">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Apply These Tips?</h2>
            <p className="text-gray-400 mb-7">
              Create your ATS-optimized resume with our AI-powered builder. Free forever.
            </p>
            <Link href="/builder" className="btn-primary inline-block px-8 py-3.5">
              Build Your Resume Free
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
