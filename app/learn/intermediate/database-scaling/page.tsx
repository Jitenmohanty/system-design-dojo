"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

// ── Cost curve data ──────────────────────────────────────────────────────────
const costData = Array.from({ length: 8 }, (_, i) => {
  const traffic = (i + 1) * 10;
  return {
    traffic,
    vertical: Math.round(100 * Math.pow(1.9, i)),
    horizontal: traffic * 18,
  };
});

// ── Vertical scaling panel ───────────────────────────────────────────────────
function VerticalPanel({ traffic }: { traffic: number }) {
  const cpu = Math.min(100, traffic * 1.25);
  const ram = Math.min(100, traffic * 1.1);
  const exploded = cpu >= 100 || ram >= 100;
  const glow = cpu > 75 ? "var(--neon-red)" : cpu > 45 ? "var(--neon-yellow)" : "var(--neon-green)";

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="mono text-[0.65rem] uppercase tracking-widest text-ink-muted">Vertical</span>
      <motion.div
        className="relative flex flex-col items-center justify-center rounded-2xl border-2 bg-bg-tertiary"
        style={{
          borderColor: glow,
          boxShadow: `0 0 24px -6px ${glow}`,
          width: 80 + traffic * 0.6,
          height: 80 + traffic * 0.6,
          minWidth: 80,
          minHeight: 80,
        }}
        animate={exploded ? { scale: [1, 1.15, 0], opacity: [1, 1, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {exploded ? (
          <span className="text-4xl">💥</span>
        ) : (
          <>
            <span className="text-2xl">🐎</span>
            <span className="mono mt-1 text-[0.55rem]" style={{ color: glow }}>
              {Math.round(cpu)}% CPU
            </span>
          </>
        )}
      </motion.div>

      {/* bars */}
      <div className="w-full space-y-1.5">
        {[
          { label: "CPU", pct: cpu, color: "var(--neon-red)" },
          { label: "RAM", pct: ram, color: "var(--neon-orange)" },
        ].map((b) => (
          <div key={b.label}>
            <div className="mb-0.5 flex justify-between mono text-[0.6rem] text-ink-muted">
              <span>{b.label}</span><span>{Math.min(100, Math.round(b.pct))}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full"
                style={{ background: b.color }}
                animate={{ width: `${Math.min(100, b.pct)}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        ))}
      </div>
      {exploded && (
        <p className="mono text-[0.6rem] text-neon-red animate-pulse-glow text-center">
          💀 Server fried. No more steroids.
        </p>
      )}
    </div>
  );
}

// ── Horizontal scaling panel ─────────────────────────────────────────────────
function HorizontalPanel({ traffic }: { traffic: number }) {
  const count = traffic < 25 ? 1 : traffic < 50 ? 2 : traffic < 75 ? 4 : 8;
  const loadPerServer = Math.round((traffic * 1.1) / count);

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="mono text-[0.65rem] uppercase tracking-widest text-ink-muted">Horizontal</span>
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
            className="flex flex-col items-center rounded-xl border border-neon-green/40 bg-bg-tertiary p-2"
            style={{ boxShadow: "0 0 12px -4px var(--neon-green)" }}
          >
            <span className="text-lg">🐎</span>
            <span className="mono text-[0.5rem] text-neon-green">{loadPerServer}%</span>
          </motion.div>
        ))}
      </div>
      <p className="mono text-[0.65rem] text-neon-green text-center">
        {count} server{count > 1 ? "s" : ""} · {loadPerServer}% each
      </p>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function DatabaseScalingPage() {
  const [traffic, setTraffic] = useState(30);

  return (
    <ConceptPage
      slug="database-scaling"
      analogy={
        <FunnyAnalogy
          emoji="🐎"
          color="var(--neon-orange)"
          alternates={[
            { emoji: "🏋️", text: "Vertical = buying your waiter a jetpack. Horizontal = hiring more waiters." },
            { emoji: "🖥️", text: "Vertical = upgrading from a bike to a Ferrari. Horizontal = adding more bikes." },
          ]}
        >
          <strong className="text-neon-orange">Vertical scaling</strong> = giving your horse steroids 🐎💪.
          There&apos;s a limit before the horse explodes.{" "}
          <strong className="text-neon-green">Horizontal scaling</strong> = buying more horses 🐎🐎🐎.
          Infinitely scalable, just louder.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The core tradeoff" title="One big vs. many small">
          <p className="text-ink-secondary">
            When your database can&apos;t keep up, you have two fundamental options: make the existing
            machine more powerful (<strong className="text-neon-orange">vertical</strong> / scale-up),
            or add more machines (<strong className="text-neon-green">horizontal</strong> / scale-out).
            Both have limits — understanding which to pick, and when to switch, is half the interview.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Interactive" title="Drag the traffic slider">
          <div className="card p-5">
            <div className="mb-4">
              <div className="mb-1 flex justify-between mono text-xs text-ink-secondary">
                <span>Traffic load</span>
                <span className="text-neon-blue">{traffic}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={80}
                value={traffic}
                onChange={(e) => setTraffic(Number(e.target.value))}
                className="w-full accent-[var(--neon-blue)]"
              />
              <div className="flex justify-between mono text-[0.6rem] text-ink-muted">
                <span>Quiet Sunday</span><span>🔥 Black Friday</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 py-2">
              <VerticalPanel traffic={traffic} />
              <HorizontalPanel traffic={traffic} />
            </div>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The math" title="Cost curves (why horizontal wins at scale)">
          <p className="mb-3 text-sm text-ink-secondary">
            Vertical hardware gets exponentially pricier — doubling CPU rarely doubles cost.
            Horizontal just adds commodity nodes at ~linear cost.
          </p>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="traffic" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} label={{ value: "Traffic %", position: "insideBottom", offset: -2, fill: "var(--text-secondary)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 11 }} tickFormatter={(v: any) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 10 }}
                  formatter={(v: any) => [`$${v}`, undefined]}
                  labelFormatter={(l: any) => `Traffic: ${l}%`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="vertical" name="Vertical (💀 exponential)" stroke="var(--neon-red)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="horizontal" name="Horizontal (✅ linear)" stroke="var(--neon-green)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Techniques" title="Horizontal scaling strategies">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { t: "Read Replicas", d: "Copies of your DB that serve read traffic. Master handles writes, replicas absorb SELECTs.", c: "var(--neon-blue)", e: "📖" },
              { t: "Sharding", d: "Split data by key (users A-M / N-Z). Each shard is its own DB server.", c: "var(--neon-purple)", e: "🔪" },
              { t: "Connection Pooling", d: "Reuse DB connections instead of opening a new one per request. Cheap and effective.", c: "var(--neon-yellow)", e: "🏊" },
            ].map((x) => (
              <div key={x.t} className="card p-4">
                <div className="mb-1 text-xl">{x.e}</div>
                <div className="font-display font-semibold" style={{ color: x.c }}>{x.t}</div>
                <p className="mt-1 text-sm text-ink-secondary">{x.d}</p>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="When to use what" title="Decision guide">
          <div className="card space-y-2 p-5 text-sm">
            <p className="text-ink-secondary">🚀 Just launched? Not sure? → <span className="text-neon-orange">Start vertical</span> — simpler, no distributed complexity.</p>
            <p className="text-ink-secondary">💸 Hitting vertical ceiling? → <span className="text-neon-green">Go horizontal</span> — replicas first, then sharding.</p>
            <p className="text-ink-secondary">📖 Read-heavy app (e.g. blog, product catalog)? → <span className="text-neon-blue">Read replicas</span> are your best friend.</p>
            <p className="text-ink-secondary">✍️ Write-heavy? Sharding every table is rough → <span className="text-neon-purple">CQRS + event sourcing</span> might be the real answer.</p>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="database-scaling"
          questions={[
            {
              question: "Vertical scaling means…",
              options: [
                "Adding more servers to the pool",
                "Giving the existing server more CPU/RAM",
                "Splitting the database across machines",
                "Buying a second data center",
              ],
              correct: 1,
              explain: "Vertical = scale-up: one machine, more resources. Horizontal = scale-out: more machines.",
            },
            {
              question: "Why does vertical scaling have a hard ceiling?",
              options: [
                "Laws don't permit it past 128 GB",
                "Physical hardware limits exist, and cost grows exponentially near the top",
                "Databases refuse to use more than 32 cores",
                "Network cards can't handle it",
              ],
              correct: 1,
              explain: "At extreme specs, hardware becomes astronomically expensive or simply unavailable — you hit the wall.",
            },
            {
              question: "Read replicas primarily help with…",
              options: [
                "Write throughput",
                "Durability and backups",
                "Distributing read queries across copies",
                "Sharding the primary key",
              ],
              correct: 2,
              explain: "Replicas absorb SELECT queries, freeing the primary (master) for writes.",
            },
            {
              question: "Sharding splits data by…",
              options: [
                "Query type (reads vs writes)",
                "Time of day the query arrives",
                "A shard key (e.g. user ID range, hash)",
                "Alphabetical table name",
              ],
              correct: 2,
              explain: "A shard key deterministically maps rows to specific shard nodes.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
