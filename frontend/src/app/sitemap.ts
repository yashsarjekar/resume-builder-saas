import { MetadataRoute } from 'next';
import { getAllJobSlugs, getAllCompanySlugs } from '@/data/jobs';
import { getAllBlogSlugs, getBlogPost } from '@/data/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://resumebuilder.pulsestack.in';

  // Static pages with realistic last-modified dates
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date('2026-02-25'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date('2026-02-10'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date('2025-12-01'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date('2025-12-01'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2025-10-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2025-10-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund`,
      lastModified: new Date('2025-10-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified: new Date('2026-02-20'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date('2026-02-25'),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Job resume pages
  const jobSlugs = getAllJobSlugs();
  const jobPages: MetadataRoute.Sitemap = jobSlugs.map((slug) => ({
    url: `${baseUrl}/resume/${slug}`,
    lastModified: new Date('2026-02-15'),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Company resume pages
  const companySlugs = getAllCompanySlugs();
  const companyPages: MetadataRoute.Sitemap = companySlugs.map((slug) => ({
    url: `${baseUrl}/resume/company/${slug}`,
    lastModified: new Date('2026-02-15'),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Blog posts - use actual publishedAt dates
  const blogSlugs = getAllBlogSlugs();
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => {
    const post = getBlogPost(slug);
    return {
      url: `${baseUrl}/blog/${slug}`,
      lastModified: post ? new Date(post.publishedAt) : new Date('2026-02-20'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    };
  });

  return [...staticPages, ...jobPages, ...companyPages, ...blogPages];
}
