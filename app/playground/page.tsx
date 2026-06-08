"use client";

import Link from "next/link";
import { Gamepad2, ArrowRight, Scale, Zap, CircleDot, ListOrdered, ShieldAlert } from "lucide-react";
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/ui/ScrollReveal";

const SIMS = [
  { href: "/playground/load-balancer", title: "Load Balancer", icon: Scale, color: "var(--neon-purple)", desc: "6 algorithms, live traffic, kill servers and watch traffic reroute.", badge: "Full screen" },
  { href: "/learn/beginner/caching-basics", title: "Cache Simulator", icon: Zap, color: "var(--neon-yellow)", desc: "Hit/miss ratios, the slow path vs the fast path." },
  { href: "/learn/advanced/consistent-hashing", title: "Consistent Hashing", icon: CircleDot, color: "var(--neon-green)", desc: "The hash ring. Add/remove nodes, watch keys (barely) move." },
  { href: "/learn/intermediate/message-queues", title: "Message Queue", icon: ListOrdered, color: "var(--neon-orange)", desc: "Producers vs consumers, backpressure, draining the queue." },
  { href: "/learn/intermediate/rate-limiting", title: "Rate Limiter", icon: ShieldAlert, color: "var(--neon-red)", desc: "Token bucket, leaky bucket & windows under a flood attack." },
];

export default function PlaygroundHub() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-20 pt-10">
      <ScrollReveal className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-bg-secondary/60 px-4 py-1.5 text-sm text-ink-secondary">
          <Gamepad2 size={14} className="text-neon-green" /> No theory, just knobs
        </div>
        <h1 className="font-display text-4xl font-extrabold sm:text-5xl">
          The <span className="neon-text">Playground</span>
        </h1>
        <p className="mt-2 text-ink-secondary">Hands-on simulations. Break things. Learn why they broke.</p>
      </ScrollReveal>

      <ScrollRevealGroup className="grid gap-5 sm:grid-cols-2" stagger={0.08}>
        {SIMS.map((s) => (
          <ScrollRevealItem key={s.href} variant="scaleIn">
            <Link href={s.href} className="card card-hover group block p-6">
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: `${s.color}1a`, color: s.color }}>
                  <s.icon size={22} />
                </span>
                {s.badge && <span className="chip" style={{ color: s.color, borderColor: s.color }}>{s.badge}</span>}
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-white">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-secondary">{s.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm" style={{ color: s.color }}>
                Launch <ArrowRight size={15} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          </ScrollRevealItem>
        ))}
      </ScrollRevealGroup>
    </div>
  );
}
