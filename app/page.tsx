"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, Cpu, Boxes, Network, Trophy, Quote,
} from "lucide-react";
import {
  LEVEL_ORDER, LEVELS, conceptsByLevel, conceptHref,
} from "@/lib/concepts";
import { useProgress, levelProgress } from "@/lib/progress";
import { BELT_VISUALS } from "@/lib/utils";
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/ui/ScrollReveal";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

const BELT_FOR_LEVEL = {
  beginner: "white", intermediate: "yellow", advanced: "green", expert: "black",
} as const;

const TESTIMONIALS = [
  { quote: "I went from 'what is DNS' to designing YouTube in 3 weeks. My interviewer thought I'd done this for years.", who: "Anonymous Engineer", role: "Now at a FAANG you've heard of" },
  { quote: "The load balancer simulation is genuinely the best explanation I've ever seen. I rewatched it 6 times.", who: "Backend Dev", role: "Recovering monolith maintainer" },
  { quote: "Finally a course that doesn't put me to sleep. The bad jokes are load-bearing.", who: "New Grad", role: "Survived the system design round" },
];

export default function Landing() {
  const { state, isClient } = useProgress();
  const firstConcept = conceptsByLevel("beginner")[0];

  return (
    <div className="relative">
      {/* ---------------- HERO ---------------- */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-bg-secondary/60 px-4 py-1.5 text-sm text-ink-secondary"
        >
          <Sparkles size={14} className="text-neon-yellow" />
          Interactive system design, not death-by-slides
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl font-extrabold leading-[1.05] sm:text-7xl"
        >
          <span className="animate-title-glow neon-text">⚡ System Design</span>
          <br />
          <span className="bg-gradient-to-r from-neon-green via-neon-blue to-neon-purple bg-clip-text text-transparent">
            Dojo
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-lg text-ink-secondary"
        >
          From{" "}
          <span className="mono text-neon-blue">&ldquo;What is a server?&rdquo;</span>{" "}
          to{" "}
          <span className="mono text-neon-green">&ldquo;Design YouTube&rdquo;</span>{" "}
          — with memes, live simulations, and zero boring slides.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href={conceptHref(firstConcept)} className="btn-neon text-base">
            Start Training <ArrowRight size={18} />
          </Link>
          <Link href="/learn" className="btn-ghost text-base">
            View the Roadmap
          </Link>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            { value: 29, suffix: "+", label: "concepts", color: "var(--neon-blue)", raw: "" },
            { value: 7, suffix: "", label: "live simulations", color: "var(--neon-green)", raw: "" },
            { value: 50, suffix: "+", label: "diagrams", color: "var(--neon-purple)", raw: "" },
            { value: 0, suffix: "", label: "bad jokes", color: "var(--neon-yellow)", raw: "∞" },
          ].map((s) => (
            <div key={s.label} className="card card-hover px-4 py-5">
              <div className="font-display text-3xl font-extrabold" style={{ color: s.color }}>
                {s.raw ? s.raw : <AnimatedCounter to={s.value} suffix={s.suffix} />}
              </div>
              <div className="mt-1 mono text-[0.65rem] uppercase tracking-widest text-ink-muted">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ---------------- LEVEL CARDS ---------------- */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <ScrollReveal className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold">Four belts. One path.</h2>
          <p className="mt-2 text-ink-secondary">
            Master every concept in a level to rank up. Train at your own pace.
          </p>
        </ScrollReveal>

        <ScrollRevealGroup className="grid gap-5 md:grid-cols-2" stagger={0.1}>
          {LEVEL_ORDER.map((level) => {
            const meta = LEVELS[level];
            const concepts = conceptsByLevel(level);
            const belt = BELT_FOR_LEVEL[level];
            const visual = BELT_VISUALS[belt];
            const prog = isClient ? levelProgress(state, level) : { done: 0, total: concepts.length, pct: 0 };
            return (
              <ScrollRevealItem key={level} variant="scaleIn">
                <Link href="/learn" className="card card-hover group block overflow-hidden p-6">
                  <div className="flex items-start justify-between">
                    <div
                      className="grid h-12 w-12 place-items-center rounded-xl font-display text-xl font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${visual.color}, ${visual.color}aa)`,
                        color: visual.textColor,
                        boxShadow: `0 0 24px -6px ${visual.glow}`,
                      }}
                    >
                      {LEVEL_ORDER.indexOf(level) + 1}
                    </div>
                    <span className="chip" style={{ borderColor: visual.color, color: visual.color }}>
                      {meta.beltLabel}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-bold text-white">{meta.name}</h3>
                  <p className="mt-1 text-sm text-ink-secondary">{meta.tagline}</p>

                  <div className="mt-5 flex items-center justify-between text-sm">
                    <span className="text-ink-secondary">{concepts.length} concepts</span>
                    <span className="mono text-xs" style={{ color: visual.color }}>
                      {prog.done}/{prog.total} done
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: visual.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${prog.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {concepts.slice(0, 4).map((c) => (
                      <span key={c.slug} className="text-lg" title={c.title}>{c.emoji}</span>
                    ))}
                    {concepts.length > 4 && (
                      <span className="text-sm text-ink-muted">+{concepts.length - 4}</span>
                    )}
                  </div>
                </Link>
              </ScrollRevealItem>
            );
          })}
        </ScrollRevealGroup>
      </section>

      {/* ---------------- FEATURE STRIP ---------------- */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Cpu, title: "Live Simulations", text: "Watch traffic flow, kill servers, and stress-test load balancers in real time.", color: "var(--neon-blue)" },
            { icon: Network, title: "Animated Diagrams", text: "Architecture that moves. See requests travel, caches hit, and shards split.", color: "var(--neon-green)" },
            { icon: Boxes, title: "Real Case Studies", text: "Design YouTube, Twitter, Uber & more — like a real interview, but fun.", color: "var(--neon-purple)" },
          ].map((f, i) => (
            <ScrollReveal key={f.title} variant="fadeUp" delay={i * 0.1}>
              <div className="card card-hover h-full p-6">
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl"
                  style={{ background: `${f.color}1a`, color: f.color }}
                >
                  <f.icon size={20} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm text-ink-secondary">{f.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <ScrollReveal className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold">Definitely real reviews</h2>
          <p className="mt-2 text-sm text-ink-muted">(Totally not made up. Mostly.)</p>
        </ScrollReveal>
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <ScrollReveal key={i} variant="fadeUp" delay={i * 0.1}>
              <figure className="card h-full p-6">
                <Quote size={22} className="text-neon-purple/60" />
                <blockquote className="mt-3 text-sm text-ink-primary">{t.quote}</blockquote>
                <figcaption className="mt-4 border-t border-[var(--border-subtle)] pt-3">
                  <div className="font-display text-sm font-semibold text-white">{t.who}</div>
                  <div className="mono text-[0.65rem] uppercase tracking-wider text-ink-muted">{t.role}</div>
                </figcaption>
              </figure>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <ScrollReveal variant="scaleIn">
          <div className="card neon-border relative overflow-hidden p-10 text-center">
            <Trophy size={36} className="mx-auto text-neon-yellow" />
            <h2 className="mt-4 font-display text-3xl font-bold">Ready to earn your black belt?</h2>
            <p className="mx-auto mt-2 max-w-md text-ink-secondary">
              29 concepts stand between you and &ldquo;Design YouTube&rdquo;. Let&apos;s go.
            </p>
            <Link href={conceptHref(firstConcept)} className="btn-neon mx-auto mt-7 text-base">
              Start with the basics <ArrowRight size={18} />
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <footer className="border-t border-[var(--border-subtle)] py-8 text-center mono text-xs text-ink-muted">
        Built in the Dojo · No real servers were harmed
      </footer>
    </div>
  );
}
