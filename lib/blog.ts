// ============================================================
// SYSTEM DESIGN DOJO — Blog content registry
// Reads MDX files from /content/blog, parses frontmatter.
// Server-only (uses fs). Drives /blog and /blog/[slug].
// ============================================================

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  /** ISO date string, e.g. "2026-06-08" */
  date: string;
  author: string;
  emoji: string;
  /** css var or hex used as the post accent */
  accent: string;
  tags: string[];
  minutes: number;
}

export interface Post extends PostMeta {
  /** raw MDX body (frontmatter stripped) */
  content: string;
}

function readRaw(slug: string): string | null {
  const file = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, "utf8");
}

function toMeta(slug: string, data: Record<string, unknown>): PostMeta {
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? "1970-01-01"),
    author: String(data.author ?? "System Design Dojo"),
    emoji: String(data.emoji ?? "📝"),
    accent: String(data.accent ?? "var(--neon-blue)"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    minutes: Number(data.minutes ?? 5),
  };
}

/** All post slugs (filenames without .mdx). */
export function getPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/** Metadata for every post, newest first. */
export function getAllPosts(): PostMeta[] {
  return getPostSlugs()
    .map((slug) => {
      const raw = readRaw(slug);
      if (!raw) return null;
      const { data } = matter(raw);
      return toMeta(slug, data);
    })
    .filter((p): p is PostMeta => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Full post (meta + MDX body) or null if missing. */
export function getPost(slug: string): Post | null {
  const raw = readRaw(slug);
  if (!raw) return null;
  const { data, content } = matter(raw);
  return { ...toMeta(slug, data), content };
}

/** Up to `n` other posts, sharing a tag if possible. */
export function getRelatedPosts(slug: string, n = 2): PostMeta[] {
  const all = getAllPosts().filter((p) => p.slug !== slug);
  const current = getAllPosts().find((p) => p.slug === slug);
  if (!current) return all.slice(0, n);
  const scored = all
    .map((p) => ({ p, score: p.tags.filter((t) => current.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, n).map((s) => s.p);
}
