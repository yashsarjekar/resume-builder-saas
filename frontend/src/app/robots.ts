import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://resumebuilder.pulsestack.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/builder', '/api/', '/login', '/signup', '/forgot-password', '/reset-password'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
