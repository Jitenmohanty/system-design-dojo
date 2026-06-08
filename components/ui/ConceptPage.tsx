"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { Clock, Check, ArrowRight, ArrowLeft, Keyboard } from "lucide-react";
import {
  getConcept, getNeighbors, conceptHref, LEVELS, TOPIC_LABELS,
} from "@/lib/concepts";
import { useProgress } from "@/lib/progress";
import { BELT_VISUALS, TOPIC_COLORS, cn } from "@/lib/utils";

const BELT_FOR_LEVEL = {
  beginner: "white", intermediate: "yellow", advanced: "green", expert: "black",
} as const;

export function ConceptPage({
  slug,
  analogy,
  children,
}: {
  slug: string;
  analogy?: React.ReactNode;
  children: React.ReactNode;
}) {
  const concept = getConcept(slug);
  const { state, toggleComplete, markVisited, isClient } = useProgress();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    if (concept) markVisited(concept.slug);
  }, [concept, markVisited]);

  if (!concept) {
    return <div className="p-10 text-center text-ink-secondary">Concept not found.</div>;
  }

  const meta = LEVELS[concept.level];
  const belt = BELT_FOR_LEVEL[concept.level];
  const visual = BELT_VISUALS[belt];
  const done = isClient && state.completed.includes(slug);
  const { prev, next } = getNeighbors(slug);

  return (
    <div className="relative">
      {/* scroll progress bar */}
      <motion.div
        className="fixed left-0 top-14 z-40 h-0.5 w-full origin-left"
        style={{ scaleX, background: `linear-gradient(90deg, ${visual.color}, var(--neon-purple))` }}
      />

      <article className="mx-auto max-w-4xl px-6 pb-20 pt-10">
        {/* Header */}
        <header className="mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip" style={{ borderColor: visual.color, color: visual.color }}>
              {meta.beltLabel}
            </span>
            <span className="chip inline-flex items-center gap-1">
              <Clock size={11} /> {concept.minutes} min
            </span>
            {concept.topics.map((t) => (
              <span key={t} className="chip" style={{ color: TOPIC_COLORS[t] }}>
                {TOPIC_LABELS[t]}
              </span>
            ))}
          </div>

          <h1 className="mt-4 flex items-center gap-3 font-display text-4xl font-extrabold sm:text-5xl">
            <span className="text-4xl sm:text-5xl">{concept.emoji}</span>
            <span>{concept.title}</span>
          </h1>
          <p className="mt-2 text-lg text-ink-secondary">{concept.blurb}</p>
        </header>

        {analogy}

        {/* Body */}
        <div className="concept-body space-y-10">{children}</div>

        {/* Footer: mark complete + nav */}
        <footer className="mt-14 border-t border-[var(--border-subtle)] pt-8">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-bg-secondary/60 p-6 text-center">
            <p className="text-sm text-ink-secondary">
              {done ? "Nice. This one's in the bag." : "Got it? Lock it in."}
            </p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => toggleComplete(slug)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-6 py-3 font-display font-semibold transition",
                done
                  ? "border border-neon-green/40 bg-neon-green/10 text-neon-green"
                  : "btn-neon"
              )}
            >
              {done ? <Check size={18} strokeWidth={3} /> : <Check size={18} />}
              {done ? "Completed!" : "Mark Complete"}
            </motion.button>
          </div>

          <nav className="mt-6 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={conceptHref(prev)} className="card card-hover group flex items-center gap-3 p-4">
                <ArrowLeft size={18} className="shrink-0 text-ink-muted transition group-hover:text-neon-blue" />
                <div className="min-w-0 text-left">
                  <div className="mono text-[0.6rem] uppercase tracking-widest text-ink-muted">Previous · P</div>
                  <div className="truncate font-display font-semibold text-white">{prev.emoji} {prev.title}</div>
                </div>
              </Link>
            ) : <div />}
            {next ? (
              <Link href={conceptHref(next)} className="card card-hover group flex items-center justify-end gap-3 p-4 text-right">
                <div className="min-w-0">
                  <div className="mono text-[0.6rem] uppercase tracking-widest text-ink-muted">Next · N</div>
                  <div className="truncate font-display font-semibold text-white">{next.title} {next.emoji}</div>
                </div>
                <ArrowRight size={18} className="shrink-0 text-ink-muted transition group-hover:text-neon-blue" />
              </Link>
            ) : <div />}
          </nav>

          <p className="mt-5 flex items-center justify-center gap-1.5 mono text-[0.65rem] text-ink-muted">
            <Keyboard size={12} /> Tip: press <kbd className="rounded bg-bg-tertiary px-1.5 py-0.5">N</kbd> / <kbd className="rounded bg-bg-tertiary px-1.5 py-0.5">P</kbd> to navigate
          </p>
        </footer>
      </article>
    </div>
  );
}

/** Section heading helper used inside concept bodies. */
export function Section({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      {kicker && (
        <div className="mono mb-1 text-[0.65rem] uppercase tracking-[0.25em] text-neon-blue">{kicker}</div>
      )}
      <h2 className="mb-4 font-display text-2xl font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}
