/**
 * One-time script: exports all static blogs from blog.ts to JSON
 * so the Python migration script can import them into PostgreSQL.
 *
 * Usage:
 *   cd frontend
 *   npx tsx scripts/export-blogs.ts
 *
 * Output: backend/scripts/static_blogs.json
 */

import { blogPosts } from '../src/data/blog';
import { writeFileSync } from 'fs';
import { join } from 'path';

const outputPath = join(__dirname, '../../backend/scripts/static_blogs.json');

const exported = blogPosts.map((post) => ({
  slug:             post.slug,
  title:            post.title,
  excerpt:          post.excerpt,
  content:          post.content.trim(),
  category:         post.category,
  tags:             post.tags,
  author:           post.author,
  read_time:        post.readTime,
  featured:         post.featured ?? false,
  published_at:     post.publishedAt,
  // SEO defaults — can be enriched later
  meta_description: post.excerpt?.slice(0, 160) ?? null,
  primary_keyword:  post.tags[0] ?? null,
  lsi_keywords:     post.tags.slice(1),
  word_count:       post.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length,
}));

writeFileSync(outputPath, JSON.stringify(exported, null, 2));
console.log(`✅ Exported ${exported.length} blogs → ${outputPath}`);
