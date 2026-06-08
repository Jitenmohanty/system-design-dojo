"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Play, Trophy } from "lucide-react";
import {
  LEVEL_ORDER, LEVELS, conceptsByLevel, conceptHref, ORDERED_CONCEPTS,
} from "@/lib/concepts";
import { useProgress, levelProgress, overallProgress } from "@/lib/progress";
import { BELT_VISUALS, cn } from "@/lib/utils";
import { BeltBadge } from "@/components/layout/BeltBadge";

const BELT_FOR_LEVEL = {
  beginner: "white", intermediate: "yellow", advanced: "green", expert: "black",
} as const;

export default function LearnRoadmap() {
  const { state, isClient } = useProgress();
  const overall = isClient ? overallProgress(state) : { done: 0, total: ORDERED_CONCEPTS.length, pct: 0 };

  // the first not-completed concept = "current"
  const currentSlug = ORDERED_CONCEPTS.find((c) => !state.completed.includes(c.slug))?.slug;

  return (
    <div className="mx-auto max-w-4xl px-6 pb-20 pt-10">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-extrabold sm:text-5xl">
          The <span className="neon-text">Roadmap</span>
        </h1>
        <p className="mt-2 text-ink-secondary">
          {overall.done} of {overall.total} concepts mastered. Follow the path.
        </p>
        <div className="mx-auto mt-5 max-w-md">
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-neon-green via-neon-blue to-neon-purple"
              initial={{ width: 0 }}
              animate={{ width: `${overall.pct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="mt-1.5 mono text-xs text-ink-muted">{overall.pct}% complete</div>
        </div>
      </div>

      {/* Levels */}
      <div className="space-y-12">
        {LEVEL_ORDER.map((level, li) => {
          const meta = LEVELS[level];
          const belt = BELT_FOR_LEVEL[level];
          const visual = BELT_VISUALS[belt];
          const concepts = conceptsByLevel(level);
          const prog = isClient ? levelProgress(state, level) : { done: 0, total: concepts.length, pct: 0 };
          const levelDone = prog.done === prog.total;

          return (
            <motion.section
              key={level}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Level header */}
              <div className="mb-5 flex items-center gap-3">
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-lg font-extrabold"
                  style={{ background: visual.color, color: visual.textColor, boxShadow: `0 0 22px -6px ${visual.glow}` }}
                >
                  {levelDone ? <Trophy size={20} /> : li + 1}
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-bold text-white">{meta.name}</h2>
                  <p className="text-sm text-ink-secondary">{meta.tagline}</p>
                </div>
                <BeltBadge belt={belt} size="sm" showLabel={false} />
              </div>

              {/* Timeline of concepts */}
              <div className="relative pl-6">
                {/* spine */}
                <div className="absolute left-[10px] top-2 bottom-2 w-0.5 bg-white/8" />
                <motion.div
                  className="absolute left-[10px] top-2 w-0.5 origin-top"
                  style={{ background: visual.color, boxShadow: `0 0 8px ${visual.glow}` }}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${prog.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />

                <div className="space-y-2.5">
                  {concepts.map((c) => {
                    const done = isClient && state.completed.includes(c.slug);
                    const isCurrent = c.slug === currentSlug;
                    return (
                      <div key={c.slug} className="relative">
                        {/* node dot */}
                        <span
                          className="absolute -left-[22px] top-4 grid h-4 w-4 place-items-center rounded-full border-2"
                          style={{
                            borderColor: done ? visual.color : isCurrent ? "var(--neon-blue)" : "var(--border-subtle)",
                            background: done ? visual.color : "var(--bg-primary)",
                            boxShadow: isCurrent ? "0 0 10px var(--neon-blue)" : undefined,
                          }}
                        >
                          {done && <Check size={9} strokeWidth={4} color={visual.textColor} />}
                        </span>

                        <Link
                          href={conceptHref(c)}
                          className={cn(
                            "card card-hover group flex items-center gap-3 p-3.5",
                            isCurrent && "ring-1 ring-neon-blue/40"
                          )}
                        >
                          <span className="text-xl">{c.emoji}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-display font-semibold text-white">{c.title}</span>
                              {isCurrent && (
                                <span className="chip shrink-0" style={{ color: "var(--neon-blue)", borderColor: "var(--neon-blue)" }}>
                                  <Play size={9} /> Up next
                                </span>
                              )}
                            </div>
                            <p className="truncate text-xs text-ink-secondary">{c.blurb}</p>
                          </div>
                          <span className="mono text-[0.6rem] text-ink-muted">{c.minutes}m</span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
