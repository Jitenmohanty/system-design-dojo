import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// Custom blocks authors can use inside .mdx posts
// ------------------------------------------------------------

const CALLOUT_STYLES: Record<string, { border: string; bg: string; label: string }> = {
  tip: { border: "var(--neon-green)", bg: "rgba(0,255,136,0.08)", label: "Tip" },
  warn: { border: "var(--neon-orange)", bg: "rgba(255,138,61,0.08)", label: "Heads up" },
  info: { border: "var(--neon-blue)", bg: "rgba(0,212,255,0.08)", label: "Note" },
  danger: { border: "var(--neon-red)", bg: "rgba(255,51,102,0.08)", label: "Gotcha" },
};

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: keyof typeof CALLOUT_STYLES;
  title?: string;
  children: ReactNode;
}) {
  const s = CALLOUT_STYLES[type] ?? CALLOUT_STYLES.info;
  return (
    <div
      className="my-6 rounded-xl border-l-2 p-4"
      style={{ borderColor: s.border, background: s.bg }}
    >
      <div className="mono mb-1 text-[0.65rem] uppercase tracking-widest" style={{ color: s.border }}>
        {title ?? s.label}
      </div>
      <div className="text-sm text-ink-secondary [&>p]:m-0 [&>p+p]:mt-2">{children}</div>
    </div>
  );
}

/** A diagram with an optional caption — wraps AnimatedDiagram for posts. */
export function Figure({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <figure className="my-7">
      {children}
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-ink-muted">{caption}</figcaption>
      )}
    </figure>
  );
}

// ------------------------------------------------------------
// Styled HTML elements for rendered markdown
// ------------------------------------------------------------

function Anchor({ href = "", children }: { href?: string; children?: ReactNode }) {
  const external = /^https?:\/\//.test(href);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-neon-blue underline decoration-neon-blue/40 underline-offset-2 hover:decoration-neon-blue">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className="text-neon-blue underline decoration-neon-blue/40 underline-offset-2 hover:decoration-neon-blue">
      {children}
    </Link>
  );
}

export const mdxComponents = {
  // custom blocks
  AnimatedDiagram,
  Callout,
  Figure,

  // headings
  h1: (p: any) => <h1 className="mt-10 font-display text-3xl font-extrabold text-white sm:text-4xl" {...p} />,
  h2: (p: any) => (
    <h2 className="mt-12 border-t border-[var(--border-subtle)] pt-8 font-display text-2xl font-bold text-white" {...p} />
  ),
  h3: (p: any) => <h3 className="mt-8 font-display text-xl font-semibold text-white" {...p} />,

  // text
  p: (p: any) => <p className="mt-4 leading-relaxed text-ink-secondary" {...p} />,
  a: Anchor,
  strong: (p: any) => <strong className="font-semibold text-white" {...p} />,
  em: (p: any) => <em className="text-ink-secondary" {...p} />,

  // lists
  ul: (p: any) => <ul className="mt-4 list-disc space-y-1.5 pl-5 text-ink-secondary marker:text-ink-muted" {...p} />,
  ol: (p: any) => <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-ink-secondary marker:text-ink-muted" {...p} />,
  li: (p: any) => <li className="leading-relaxed" {...p} />,

  // code — inline gets the neon chip; highlighted blocks keep their Shiki token colors
  code: ({ className, ...p }: any) => {
    const isBlock =
      p["data-language"] != null ||
      (typeof className === "string" && className.startsWith("language-"));
    if (isBlock) return <code className={className} {...p} />;
    return (
      <code
        className="mono rounded-md border border-[var(--border-subtle)] bg-bg-tertiary px-1.5 py-0.5 text-[0.85em] text-neon-blue"
        {...p}
      />
    );
  },
  // syntax-highlighted blocks arrive wrapped in <figure> by rehype-pretty-code
  figure: ({ className, ...p }: any) => <figure className={cn("my-6", className)} {...p} />,
  pre: ({ className, ...p }: any) => (
    <pre
      className={cn(
        "mono overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-bg-tertiary/60 p-4 text-sm leading-relaxed text-ink-secondary",
        className,
      )}
      {...p}
    />
  ),

  // misc
  blockquote: (p: any) => (
    <blockquote className="my-6 border-l-2 border-neon-purple/50 pl-4 text-ink-secondary italic" {...p} />
  ),
  hr: () => <hr className="my-10 border-[var(--border-subtle)]" />,
  img: (p: any) => <img className="my-6 rounded-xl border border-[var(--border-subtle)]" {...p} />,
  table: (p: any) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
      <table className="w-full text-left text-sm" {...p} />
    </div>
  ),
  th: (p: any) => <th className="border-b border-[var(--border-subtle)] bg-bg-tertiary/60 px-3 py-2 font-display text-xs uppercase tracking-wide text-ink-muted" {...p} />,
  td: (p: any) => <td className="border-t border-[var(--border-subtle)] px-3 py-2 text-ink-secondary" {...p} />,
};
