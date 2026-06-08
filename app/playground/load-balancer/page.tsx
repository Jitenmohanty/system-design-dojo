"use client";

import Link from "next/link";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { LoadBalancerSim } from "@/components/simulations/LoadBalancerSim";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const TIPS = [
  { t: "Round Robin", d: "Watch the rotating pointer — perfectly even, blind to load." },
  { t: "Least Connections", d: "Crank RPS and see it favor the least-busy server." },
  { t: "Weighted", d: "Bump one server's weight to 5× and watch it soak up traffic." },
  { t: "IP Hash", d: "The same client IPs stick to the same server — sticky sessions." },
  { t: "Kill a server", d: "Hit 'Kill' under load and watch the others' CPU spike as traffic reroutes." },
];

export default function LoadBalancerPlayground() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-8">
      <Link href="/playground" className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-secondary transition hover:text-white">
        <ArrowLeft size={15} /> All simulations
      </Link>

      <header className="mb-6">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
          Load Balancer <span className="neon-text">Lab</span>
        </h1>
        <p className="mt-1 text-ink-secondary">Full-screen sandbox. Switch algorithms, flood it, and break a server.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <ScrollReveal className="min-w-0">
          <LoadBalancerSim />
        </ScrollReveal>

        <aside className="space-y-3">
          <div className="card p-4">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb size={16} className="text-neon-yellow" />
              <h2 className="font-display text-sm font-bold text-white">Things to try</h2>
            </div>
            <ul className="space-y-3">
              {TIPS.map((tip) => (
                <li key={tip.t}>
                  <div className="font-display text-sm font-semibold text-neon-blue">{tip.t}</div>
                  <p className="text-xs text-ink-secondary">{tip.d}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-4 text-xs text-ink-muted">
            Want the full lesson with the comparison battle and decision tree?{" "}
            <Link href="/learn/intermediate/load-balancing" className="text-neon-blue hover:underline">
              Read the Load Balancing concept →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
