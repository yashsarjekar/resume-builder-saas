/**
 * Blog API client — server-side only (Next.js Server Components + ISR).
 *
 * All functions use native fetch() with Next.js ISR cache tags so that
 * Railway revalidates stale pages automatically every hour. No axios,
 * no localStorage — these run on the server.
 *
 * API base: NEXT_PUBLIC_API_URL (e.g. https://…railway.app)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Shared fetch helper ────────────────────────────────────────────────────

async function apiFetch<T>(path: string, revalidate = 3600): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate },
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // API unavailable during build or network error — return null gracefully
    return null;
  }
}

// ── Types (matches existing BlogPost interface in blog.ts) ─────────────────

export interface BlogPost {
  slug:        string;
  title:       string;
  excerpt:     string;
  content:     string;
  category:    'resume-tips' | 'interview-prep' | 'career-advice';
  tags:        string[];
  author:      string;
  publishedAt: string;   // ISO date string
  readTime:    number;
  featured?:   boolean;
  metaDescription?: string;
  primaryKeyword?:  string;
}

// ── Raw API response shapes ────────────────────────────────────────────────

interface ApiPost {
  id:               number;
  slug:             string;
  title:            string;
  excerpt:          string | null;
  content?:         string | null;
  category:         string;
  tags:             string[];
  author:           string;
  read_time:        number;
  featured:         boolean;
  status:           string;
  meta_description: string | null;
  primary_keyword:  string | null;
  published_at:     string | null;
}

interface ApiListResponse {
  posts:       ApiPost[];
  total:       number;
  page:        number;
  per_page:    number;
  total_pages: number;
}

// ── Transform snake_case API → camelCase BlogPost ──────────────────────────

function toPost(raw: ApiPost): BlogPost {
  return {
    slug:             raw.slug,
    title:            raw.title,
    excerpt:          raw.excerpt ?? '',
    content:          raw.content ?? '',
    category:         raw.category as BlogPost['category'],
    tags:             raw.tags ?? [],
    author:           raw.author,
    publishedAt:      raw.published_at ?? new Date().toISOString(),
    readTime:         raw.read_time,
    featured:         raw.featured,
    metaDescription:  raw.meta_description ?? undefined,
    primaryKeyword:   raw.primary_keyword ?? undefined,
  };
}

// ── Public API functions ───────────────────────────────────────────────────

/**
 * Fetch all published posts (up to 100).
 * Used for JSON-LD schema on the blog index page.
 */
export async function fetchAllPosts(): Promise<BlogPost[]> {
  const data = await apiFetch<ApiListResponse>('/api/blog?per_page=100');
  return data?.posts.map(toPost) ?? [];
}

/**
 * Fetch featured posts only.
 */
export async function fetchFeaturedPosts(): Promise<BlogPost[]> {
  const data = await apiFetch<ApiListResponse>('/api/blog?featured=true&per_page=10');
  return data?.posts.map(toPost) ?? [];
}

/**
 * Fetch posts by category (up to 50).
 */
export async function fetchPostsByCategory(category: string): Promise<BlogPost[]> {
  const data = await apiFetch<ApiListResponse>(
    `/api/blog?category=${encodeURIComponent(category)}&per_page=50`,
  );
  return data?.posts.map(toPost) ?? [];
}

/**
 * Fetch a single post by slug including full HTML content.
 * Returns null if not found (triggers Next.js notFound()).
 */
export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  const raw = await apiFetch<ApiPost>(`/api/blog/${encodeURIComponent(slug)}`);
  return raw ? toPost(raw) : null;
}

/**
 * Fetch all published slugs for generateStaticParams().
 */
export async function fetchAllSlugs(): Promise<string[]> {
  const data = await apiFetch<{ slug: string }[]>('/api/blog/slugs');
  return data?.map((e) => e.slug) ?? [];
}

// ── Sitemap entry ──────────────────────────────────────────────────────────

export interface BlogSitemapEntry {
  slug:         string;
  published_at: string | null;
  updated_at:   string | null;
}

/**
 * Fetch slug + dates for all published posts (used by sitemap.ts).
 */
export async function fetchSitemapData(): Promise<BlogSitemapEntry[]> {
  const data = await apiFetch<BlogSitemapEntry[]>('/api/blog/sitemap-data');
  return data ?? [];
}

/**
 * Fetch related posts: same category, excluding the given slug (up to `limit`).
 */
export async function fetchRelatedPosts(slug: string, category: string, limit = 3): Promise<BlogPost[]> {
  const data = await apiFetch<ApiListResponse>(
    `/api/blog?category=${encodeURIComponent(category)}&per_page=${limit + 1}`,
  );
  const posts = data?.posts.map(toPost) ?? [];
  return posts.filter((p) => p.slug !== slug).slice(0, limit);
}
