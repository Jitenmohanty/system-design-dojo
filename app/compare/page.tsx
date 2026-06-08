"use client";

import Link from "next/link";
import { GitCompare, ArrowRight } from "lucide-react";
import { COMPARISONS } from "@/lib/compare";
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/ui/ScrollReveal";

export default function CompareHub() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-20 pt-10">
      <ScrollReveal className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-bg-secondary/60 px-4 py-1.5 text-sm text-ink-secondary">
          <GitCompare size={14} className="text-neon-purple" /> Pick your fighter
        </div>
        <h1 className="font-display text-4xl font-extrabold sm:text-5xl">
          The <span className="neon-text">Versus</span> Hub
        </h1>
        <p className="mt-2 text-ink-secondary">
          Head-to-head breakdowns of the technologies you&apos;ll get grilled on.
        </p>
      </ScrollReveal>

      <ScrollRevealGroup className="grid gap-5 sm:grid-cols-2" stagger={0.08}>
        {COMPARISONS.map((c) => (
          <ScrollRevealItem key={c.slug} variant="scaleIn">
            <Link href={`/compare/${c.slug}`} className="card card-hover group block p-6">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{c.emoji}</span>
                <ArrowRight size={18} className="text-ink-muted transition group-hover:translate-x-1 group-hover:text-neon-blue" />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className="font-display text-2xl font-bold" style={{ color: c.colorA }}>{c.a}</span>
                <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border-neon)] mono text-[0.6rem] font-bold text-ink-secondary">VS</span>
                <span className="font-display text-2xl font-bold" style={{ color: c.colorB }}>{c.b}</span>
                {c.c && (
                  <>
                    <span className="text-ink-muted">/</span>
                    <span className="font-display text-2xl font-bold text-neon-green">{c.c}</span>
                  </>
                )}
              </div>
              <p className="mt-2 text-sm text-ink-secondary">{c.blurb}</p>
            </Link>
          </ScrollRevealItem>
        ))}
      </ScrollRevealGroup>
    </div>
  );
}
