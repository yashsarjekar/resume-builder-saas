import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicPortfolioClient from './PublicPortfolioClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function fetchPortfolio(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/portfolio/p/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchPortfolio(slug);
  if (!data) return { title: 'Portfolio Not Found' };
  return {
    title: `${data.name} — Portfolio`,
    description: data.bio?.slice(0, 160) ?? `${data.name}'s personal portfolio`,
    openGraph: {
      title: `${data.name} — ${data.title ?? 'Portfolio'}`,
      description: data.bio?.slice(0, 160) ?? '',
      type: 'profile',
    },
  };
}

export default async function PortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await fetchPortfolio(slug);
  if (!data) notFound();
  return <PublicPortfolioClient data={data} />;
}
