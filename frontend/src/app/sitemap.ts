import { MetadataRoute } from 'next';
import { getAllJobSlugs, getAllCompanySlugs } from '@/data/jobs';
import { fetchSitemapData } from '@/lib/blog-api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://resumebuilder.pulsestack.in';

  // Static pages - homepage has trailing slash (how browsers/Google crawl it)
  // All other pages have NO trailing slash (how Next.js serves them)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date('2026-06-14'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date('2026-06-14'),
      changeFrequency: 'weekly',
      priority: 0.9,
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
      url: `${baseUrl}/tools/cover-letter`,
      lastModified: new Date('2026-03-25'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/keywords`,
      lastModified: new Date('2026-03-25'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/linkedin`,
      lastModified: new Date('2026-03-25'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified: new Date('2026-02-20'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date('2026-06-14'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date('2026-06-14'),
      changeFrequency: 'daily',
      priority: 0.9,
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

  // Blog posts — wrapped in try/catch so a slow/down API never breaks
  // the entire sitemap (which causes GSC "Temporary processing error")
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const sitemapData = await fetchSitemapData();
    blogPages = sitemapData.map((entry) => ({
      url: `${baseUrl}/blog/${entry.slug}`,
      lastModified: entry.updated_at
        ? new Date(entry.updated_at)
        : entry.published_at
          ? new Date(entry.published_at)
          : new Date('2026-06-14'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // Return sitemap without blog posts rather than failing entirely
  }

  return [...staticPages, ...jobPages, ...companyPages, ...blogPages];
}
