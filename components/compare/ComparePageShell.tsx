"use client";

import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function ComparePageShell({
  emoji,
  title,
  subtitle,
  verdict,
  children,
}: {
  emoji: string;
  title: React.ReactNode;
  subtitle: string;
  verdict: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-6 pb-20 pt-10">
      <Link href="/compare" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-secondary transition hover:text-white">
        <ArrowLeft size={15} /> All comparisons
      </Link>

      <header className="mb-8">
        <div className="text-4xl">{emoji}</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">{title}</h1>
        <p className="mt-2 text-lg text-ink-secondary">{subtitle}</p>
      </header>

      <div className="space-y-10">{children}</div>

      <ScrollReveal variant="scaleIn">
        <div className="card neon-border mt-12 p-6">
          <div className="mb-3 flex items-center gap-2">
            <Trophy size={20} className="text-neon-yellow" />
            <h2 className="font-display text-xl font-bold text-white">The verdict</h2>
          </div>
          <div className="text-ink-secondary">{verdict}</div>
        </div>
      </ScrollReveal>
    </div>
  );
}

export function CompareSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ScrollReveal>
      <section>
        <h2 className="mb-4 font-display text-2xl font-bold text-white">{title}</h2>
        {children}
      </section>
    </ScrollReveal>
  );
}
