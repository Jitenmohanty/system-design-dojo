import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { getPost, getPostSlugs, getRelatedPosts } from "@/lib/blog";
import { mdxComponents } from "@/components/blog/mdx";

const prettyCodeOptions = {
  // Atom One Dark — warm token palette that reads well on the dojo's dark UI
  theme: "one-dark-pro",
  // we paint our own panel background to match the site; keep only token colors
  keepBackground: false,
};

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: "article" },
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();
  const related = getRelatedPosts(params.slug, 2);

  return (
    <article className="mx-auto max-w-3xl px-6 pb-24 pt-10">
      <Link href="/blog" className="inline-flex items-center gap-1.5 mono text-[0.7rem] uppercase tracking-widest text-ink-muted transition hover:text-neon-blue">
        <ArrowLeft size={13} /> All posts
      </Link>

      {/* Header */}
      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2 text-[0.7rem]">
          <span className="mono text-ink-muted">{formatDate(post.date)}</span>
          <span className="chip inline-flex items-center gap-1">
            <Clock size={11} /> {post.minutes} min read
          </span>
          {post.tags.map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
        <h1 className="mt-4 flex items-start gap-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
          <span className="text-4xl sm:text-5xl">{post.emoji}</span>
          <span>{post.title}</span>
        </h1>
        <p className="mt-3 text-lg text-ink-secondary">{post.description}</p>
        <div className="mt-4 mono text-xs text-ink-muted">By {post.author}</div>
      </header>

      <div
        className="mt-8 h-px w-full"
        style={{ background: `linear-gradient(90deg, ${post.accent}, transparent)` }}
      />

      {/* Body */}
      <div className="mt-2">
        <MDXRemote
          source={post.content}
          components={mdxComponents}
          // blockJS:false re-enables JSX expression props (e.g. <AnimatedDiagram nodes={[...]} />),
          // which next-mdx-remote v6 blocks by default. Safe here: posts are authored in-repo,
          // not user input. blockDangerousJS stays true (default) — eval/Function/require remain blocked.
          options={{
            mdxOptions: { rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]] },
            blockJS: false,
          }}
        />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <footer className="mt-16 border-t border-[var(--border-subtle)] pt-8">
          <div className="mono mb-4 text-[0.65rem] uppercase tracking-[0.25em] text-neon-blue">Keep reading</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="card card-hover group flex items-center gap-3 p-4">
                <span className="text-2xl">{r.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display font-semibold text-white transition group-hover:text-neon-blue">{r.title}</div>
                  <div className="mono text-[0.6rem] text-ink-muted">{r.minutes} min</div>
                </div>
                <ArrowRight size={16} className="shrink-0 text-ink-muted transition group-hover:text-neon-blue" />
              </Link>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}
