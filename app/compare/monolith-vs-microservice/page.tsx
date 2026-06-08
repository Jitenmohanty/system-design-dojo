"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ComparePageShell, CompareSection } from "@/components/compare/ComparePageShell";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";

const GREEN = "var(--neon-green)";
const PURPLE = "var(--neon-purple)";

function TeamSlider() {
  const [team, setTeam] = useState(5);
  const rec = team <= 8 ? "monolith" : team <= 25 ? "either" : "microservices";
  return (
    <div className="card p-6">
      <label className="flex items-center justify-between mono text-xs text-ink-muted">
        <span>Team size</span><span className="text-neon-blue">{team} engineers</span>
      </label>
      <input type="range" min={1} max={60} value={team} onChange={(e) => setTeam(+e.target.value)} className="mt-2 w-full accent-[var(--neon-blue)]" />
      <motion.div
        key={rec}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-xl p-4 text-center"
        style={{
          background: rec === "monolith" ? "rgba(0,255,136,0.08)" : rec === "microservices" ? "rgba(168,85,247,0.08)" : "rgba(0,212,255,0.08)",
          border: `1px solid ${rec === "monolith" ? GREEN : rec === "microservices" ? PURPLE : "var(--neon-blue)"}40`,
        }}
      >
        <div className="font-display text-lg font-bold text-white">
          {rec === "monolith" ? "🏗️ Start with a Monolith" : rec === "microservices" ? "🧩 Microservices pay off" : "🤷 Either works — modular monolith is a great middle ground"}
        </div>
        <p className="mt-1 text-sm text-ink-secondary">
          {rec === "monolith"
            ? "Small teams ship faster in one codebase. Don't pay the distributed-systems tax you don't need yet."
            : rec === "microservices"
            ? "At this size, independent teams owning independent services reduces coordination overhead."
            : "Keep clean module boundaries so you can split later if you must."}
        </p>
      </motion.div>
    </div>
  );
}

export default function MonolithVsMicroservice() {
  return (
    <ComparePageShell
      emoji="🏗️"
      title={<><span style={{ color: GREEN }}>Monolith</span> vs <span style={{ color: PURPLE }}>Microservices</span></>}
      subtitle="One deployable vs many. Spoiler: most companies should start with the monolith."
      verdict={
        <p>
          <strong style={{ color: GREEN }}>Monoliths</strong> win for small teams and early products: one repo, one
          deploy, easy local dev, simple transactions. <strong style={{ color: PURPLE }}>Microservices</strong> win
          at organizational scale — when many teams need to deploy independently and scale components separately.
          The cost is real: network calls, distributed debugging, eventual consistency, and ops overhead. Don&apos;t
          adopt microservices for resume points — adopt them when team coordination becomes the bottleneck.
        </p>
      }
    >
      <CompareSection title="Round-by-round">
        <ComparisonBattle
          left={{ name: "Monolith", emoji: "🏗️", color: GREEN, bestFor: "Small/medium teams, early products, simple ops, fast iteration." }}
          right={{ name: "Microservices", emoji: "🧩", color: PURPLE, bestFor: "Large orgs, independent deploys, component-level scaling, polyglot teams." }}
          features={[
            { label: "Initial speed", a: 10, b: 5, max: 10, winner: "a" },
            { label: "Deploy independence", a: 3, b: 10, max: 10, winner: "b" },
            { label: "Local dev ease", a: "Trivial", b: "Painful", winner: "a" },
            { label: "Debugging", a: "Stack trace", b: "Distributed tracing", winner: "a" },
            { label: "Scale granularity", a: "All-or-nothing", b: "Per service", winner: "b" },
            { label: "Fault isolation", a: 4, b: 9, max: 10, winner: "b" },
            { label: "Ops overhead", a: "Low", b: "High", winner: "a" },
            { label: "Team autonomy", a: 4, b: 10, max: 10, winner: "b" },
          ]}
        />
      </CompareSection>

      <CompareSection title="Deployment, side by side">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="card p-4">
            <div className="font-display font-semibold" style={{ color: GREEN }}>Monolith deploy</div>
            <p className="mt-1 text-sm text-ink-secondary">Build one artifact → deploy everywhere. A typo in billing? The whole app redeploys. Simple, but coupled.</p>
          </div>
          <div className="card p-4">
            <div className="font-display font-semibold" style={{ color: PURPLE }}>Microservices deploy</div>
            <p className="mt-1 text-sm text-ink-secondary">Each service ships on its own schedule. Billing deploys 20×/day without touching search. Freedom, but you now run 20 pipelines.</p>
          </div>
        </div>
      </CompareSection>

      <CompareSection title="What does your team size say?">
        <TeamSlider />
      </CompareSection>
    </ComparePageShell>
  );
}
