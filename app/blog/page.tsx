import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Deep dives & war stories",
  description:
    "Long-form system design articles with the same live, interactive diagrams as the lessons. Deep dives, trade-offs, and how real companies scaled.",
};

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-5xl px-6 pb-20 pt-10">
      <header className="mb-10">
        <div className="mono mb-2 text-[0.65rem] uppercase tracking-[0.25em] text-neon-blue">The Dojo Journal</div>
        <h1 className="font-display text-4xl font-extrabold sm:text-5xl">
          Deep dives & <span className="neon-text">war stories</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-secondary">
          Long-form articles that go beyond the lessons — trade-offs, real outages, and how the big systems
          actually scaled. Same live diagrams, more story.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="card p-10 text-center text-ink-secondary">
          No posts yet. Drop an <span className="mono text-neon-blue">.mdx</span> file in{" "}
          <span className="mono text-neon-blue">/content/blog</span> to publish one.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card card-hover group flex flex-col p-6"
              style={{ ["--tw-accent" as string]: post.accent }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border text-2xl"
                  style={{ borderColor: `${post.accent}40`, background: "var(--bg-tertiary)" }}
                >
                  {post.emoji}
                </span>
                <div className="flex flex-wrap items-center gap-2 text-[0.65rem]">
                  <span className="mono text-ink-muted">{formatDate(post.date)}</span>
                  <span className="chip inline-flex items-center gap-1">
                    <Clock size={10} /> {post.minutes} min
                  </span>
                </div>
              </div>

              <h2 className="mt-4 font-display text-xl font-bold text-white transition group-hover:text-neon-blue">
                {post.title}
              </h2>
              <p className="mt-2 flex-1 text-sm text-ink-secondary">{post.description}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((t) => (
                    <span key={t} className="chip">{t}</span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 mono text-[0.65rem] text-ink-muted transition group-hover:text-neon-blue">
                  Read <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
