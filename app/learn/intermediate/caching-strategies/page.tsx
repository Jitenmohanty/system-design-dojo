"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";

// ── Strategy data ─────────────────────────────────────────────────────────────
const STRATEGIES = [
  {
    key: "write-through",
    title: "Write-Through",
    emoji: "✏️",
    color: "var(--neon-blue)",
    quip: "The perfectionist: writes to cache AND DB simultaneously. Sleep well knowing nothing is lost.",
    read: ["App", "→", "Cache", "→", "App"],
    write: ["App", "→", "Cache", "→", "DB"],
    readColor: ["text-ink-muted", "text-neon-blue", "text-neon-blue", "text-ink-muted", "text-ink-muted"],
    writeColor: ["text-ink-muted", "text-neon-blue", "text-neon-blue", "text-neon-blue", "text-ink-muted"],
    crashNote: "Cache crash? No data loss — DB always has the latest.",
    consistency: "Strong",
    perf: "Moderate",
    complexity: "Low",
    dataLoss: "None",
  },
  {
    key: "write-behind",
    title: "Write-Behind",
    emoji: "⏰",
    color: "var(--neon-orange)",
    quip: "The procrastinator: 'I&apos;ll write to DB later' 🤞. Blazing fast writes, terrifying crashes.",
    read: ["App", "→", "Cache", "→", "App"],
    write: ["App", "→", "Cache", "⟳ later", "DB"],
    readColor: ["text-ink-muted", "text-neon-orange", "text-neon-orange", "text-ink-muted", "text-ink-muted"],
    writeColor: ["text-ink-muted", "text-neon-orange", "text-neon-yellow", "text-neon-orange", "text-ink-muted"],
    crashNote: "Cache crash before flush? That data is gone. 🪦 Great write perf though.",
    consistency: "Eventual",
    perf: "High",
    complexity: "High",
    dataLoss: "Possible",
  },
  {
    key: "write-around",
    title: "Write-Around",
    emoji: "🏃",
    color: "var(--neon-yellow)",
    quip: "The sneaky one: bypasses cache on write. Cache gets cold — 'discover' the data on next read.",
    read: ["App", "→", "Cache", "→ miss →", "DB", "→ warm cache"],
    write: ["App", "→ skip cache →", "DB"],
    readColor: ["text-ink-muted", "text-neon-yellow", "text-neon-yellow", "text-neon-yellow", "text-neon-yellow", "text-neon-green"],
    writeColor: ["text-ink-muted", "text-neon-red", "text-neon-yellow"],
    crashNote: "Cache crash? Irrelevant — DB is the ground truth, cache auto-warms on reads.",
    consistency: "Strong",
    perf: "Low initially",
    complexity: "Low",
    dataLoss: "None",
  },
  {
    key: "cache-aside",
    title: "Cache-Aside",
    emoji: "🎯",
    color: "var(--neon-green)",
    quip: "The DIY hipster: app manages the cache manually. 'I know best when to populate you.'",
    read: ["App", "→ check →", "Cache hit?", "→ yes: App", "→ no: DB → fill cache"],
    write: ["App", "→", "DB", "→ invalidate cache"],
    readColor: ["text-ink-muted", "text-neon-green", "text-neon-green", "text-neon-green", "text-neon-blue"],
    writeColor: ["text-ink-muted", "text-neon-green", "text-neon-green", "text-neon-red"],
    crashNote: "Cache crash? App falls back to DB automatically. Very resilient.",
    consistency: "Strong (explicit invalidation)",
    perf: "High",
    complexity: "Medium",
    dataLoss: "None",
  },
  {
    key: "read-through",
    title: "Read-Through",
    emoji: "📖",
    color: "var(--neon-purple)",
    quip: "The butler: app asks cache, cache fetches from DB if missing. App never touches the DB directly.",
    read: ["App", "→", "Cache", "→ miss →", "DB", "→ cache stores → App"],
    write: ["App", "→ directly →", "DB (+ invalidate)"],
    readColor: ["text-ink-muted", "text-neon-purple", "text-neon-purple", "text-neon-purple", "text-neon-purple", "text-neon-green"],
    writeColor: ["text-ink-muted", "text-neon-purple", "text-neon-green"],
    crashNote: "Cache crash? Reads slow down (all go to DB) but nothing lost.",
    consistency: "Strong",
    perf: "High (after warm-up)",
    complexity: "Low (cache handles it)",
    dataLoss: "None",
  },
];

type StrategyKey = typeof STRATEGIES[number]["key"];

function PathRow({ items, colors }: { items: string[]; colors: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1 mono text-xs">
      {items.map((item, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={colors[i] ?? "text-ink-muted"}
        >
          {item}
        </motion.span>
      ))}
    </div>
  );
}

function StrategyCard({ s, active, onClick }: { s: typeof STRATEGIES[0]; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="card card-hover p-4 text-left transition-all"
      style={{
        borderColor: active ? s.color : undefined,
        boxShadow: active ? `0 0 18px -6px ${s.color}` : undefined,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{s.emoji}</span>
        <span className="font-display font-semibold" style={{ color: s.color }}>{s.title}</span>
      </div>
      <p className="text-xs text-ink-muted line-clamp-2">{s.quip.replace("&apos;", "'")}</p>
    </motion.button>
  );
}

export default function CachingStrategiesPage() {
  const [active, setActive] = useState<StrategyKey>("cache-aside");
  const s = STRATEGIES.find((x) => x.key === active) ?? STRATEGIES[0];

  return (
    <ConceptPage
      slug="caching-strategies"
      analogy={
        <FunnyAnalogy
          emoji="🗂️"
          color="var(--neon-green)"
          alternates={[
            { emoji: "✏️", text: "Write-Through: write on both your notepad AND whiteboard simultaneously." },
            { emoji: "📬", text: "Write-Behind: jot on the notepad now, sync to the whiteboard at the end of the day." },
          ]}
        >
          There are five ways to keep a cache and a database in sync. Choose poorly and you get{" "}
          <strong className="text-neon-red">stale data</strong>,{" "}
          <strong className="text-neon-orange">data loss</strong>, or{" "}
          <strong className="text-neon-yellow">horrific complexity</strong>.
          Choose well and your app flies. Let&apos;s meet the candidates.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="Pick your fighter" title="5 caching strategies">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {STRATEGIES.map((x) => (
              <StrategyCard key={x.key} s={x} active={active === x.key} onClick={() => setActive(x.key as StrategyKey)} />
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The layout" title="What the strategies are really choosing">
          <p className="mb-4 text-ink-secondary">
            Every strategy is just a different answer to one question: <em>which arrows fire, and in what order?</em>{" "}
            The pieces are always the same — app, <strong className="text-neon-yellow">cache</strong>, and{" "}
            <strong className="text-neon-green">database</strong>. Read paths (blue) and write paths (orange/green)
            differ per strategy. Click each box.
          </p>
          <AnimatedDiagram
            height={340}
            nodes={[
              { id: "app", type: "server", label: "App", position: { x: 10, y: 50 }, status: "busy", info: "Talks to the cache and DB. The strategy decides whether IT manages the cache (cache-aside) or the cache does (read/write-through)." },
              { id: "cache", type: "cache", label: "Cache", position: { x: 50, y: 26 }, status: "active", info: "Fast in-memory layer. The question each strategy answers: on a write, update this now, later, or skip it?" },
              { id: "db", type: "database", label: "Database", position: { x: 50, y: 80 }, status: "active", info: "Source of truth. Write-through hits it synchronously; write-back hits it later (faster writes, risk of loss)." },
            ]}
            edges={[
              { from: "app", to: "cache", animated: true, color: "var(--neon-blue)", label: "read" },
              { from: "cache", to: "db", dashed: true, color: "var(--neon-red)", label: "miss → load / write-back" },
              { from: "app", to: "db", animated: true, color: "var(--neon-green)", label: "write" },
            ]}
          />
          <p className="mt-3 text-xs text-ink-muted">Tip: read strategies (cache-aside vs read-through) decide WHO loads on a miss; write strategies (write-through vs write-back vs write-around) decide WHEN the database gets updated. Same boxes, different arrows.</p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Deep dive" title="Strategy breakdown">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="card p-5 space-y-4"
              style={{ borderColor: `${s.color}40` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{s.emoji}</span>
                <div>
                  <h3 className="font-display text-xl font-bold" style={{ color: s.color }}>{s.title}</h3>
                  <p className="text-sm text-ink-secondary italic">&ldquo;{s.quip.replace("&apos;", "'")} &rdquo;</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-bg-tertiary/50 p-3">
                  <div className="mono mb-2 text-[0.6rem] uppercase tracking-wider text-neon-blue">Read Path</div>
                  <PathRow items={s.read} colors={s.readColor} />
                </div>
                <div className="rounded-xl bg-bg-tertiary/50 p-3">
                  <div className="mono mb-2 text-[0.6rem] uppercase tracking-wider text-neon-orange">Write Path</div>
                  <PathRow items={s.write} colors={s.writeColor} />
                </div>
              </div>

              <div
                className="rounded-xl border p-3 text-sm"
                style={{ borderColor: `${s.color}40`, background: `${s.color}0a` }}
              >
                <span className="mono text-[0.6rem] uppercase tracking-wider" style={{ color: s.color }}>
                  💀 If cache crashes:
                </span>
                <p className="mt-1 text-ink-secondary">{s.crashNote}</p>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Consistency", val: s.consistency },
                  { label: "Performance", val: s.perf },
                  { label: "Complexity", val: s.complexity },
                  { label: "Data Loss Risk", val: s.dataLoss },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg bg-bg-tertiary/60 p-2 text-center">
                    <div className="mono text-[0.5rem] uppercase tracking-wider text-ink-muted">{m.label}</div>
                    <div className="mt-0.5 text-xs font-semibold text-white">{m.val}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Head to head" title="Cache-Aside vs Write-Through">
          <ComparisonBattle
            left={{ name: "Cache-Aside", emoji: "🎯", color: "var(--neon-green)", bestFor: "General-purpose. You control what gets cached; great for read-heavy apps with complex invalidation logic." }}
            right={{ name: "Write-Through", emoji: "✏️", color: "var(--neon-blue)", bestFor: "Write-heavy apps where consistency matters more than write speed. No stale data ever." }}
            features={[
              { label: "Read Perf", a: 9, b: 9, max: 10, winner: "tie" },
              { label: "Write Perf", a: 9, b: 6, max: 10, winner: "a" },
              { label: "Consistency", a: "Explicit", b: "Automatic", winner: "b" },
              { label: "Data Loss", a: "None", b: "None", winner: "tie" },
              { label: "Complexity", a: "Medium", b: "Low", winner: "b" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Cheat sheet" title="Which to pick?">
          <div className="card space-y-2 p-5 text-sm">
            <p className="text-ink-secondary">📖 <strong className="text-white">Read-heavy</strong> app, simple model → <span className="text-neon-green">Cache-Aside</span> or <span className="text-neon-purple">Read-Through</span></p>
            <p className="text-ink-secondary">✍️ <strong className="text-white">Every write must be durable</strong> → <span className="text-neon-blue">Write-Through</span></p>
            <p className="text-ink-secondary">⚡ <strong className="text-white">Speed over safety</strong>, can tolerate loss → <span className="text-neon-orange">Write-Behind</span></p>
            <p className="text-ink-secondary">📝 <strong className="text-white">Infrequent reads of written data</strong> (logs, audit) → <span className="text-neon-yellow">Write-Around</span></p>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="caching-strategies"
          questions={[
            {
              question: "Write-Behind (lazy write) has what major downside?",
              options: [
                "Writes are very slow",
                "Data in cache not yet flushed can be lost if cache crashes",
                "It only works with SQL databases",
                "It requires double the memory",
              ],
              correct: 1,
              explain: "Write-Behind buffers writes in cache before flushing to DB asynchronously — a crash can lose unflushed data.",
            },
            {
              question: "Cache-Aside (lazy loading) is also known as…",
              options: ["Read-Through", "Lazy Loading", "Write-Behind", "Write-Around"],
              correct: 1,
              explain: "Cache-Aside / Lazy Loading: populate the cache only on a cache miss, not proactively.",
            },
            {
              question: "In Write-Through, when does data reach the database?",
              options: [
                "Only on the next read",
                "Asynchronously after a delay",
                "Synchronously at the same time as the cache write",
                "Never — it stays in cache",
              ],
              correct: 2,
              explain: "Write-Through writes to cache and DB in the same operation — consistency guaranteed.",
            },
            {
              question: "Write-Around is best suited for…",
              options: [
                "Data read immediately after writing",
                "Data written once but rarely (or never) read back through cache",
                "High-frequency updates",
                "Preventing all cache misses",
              ],
              correct: 1,
              explain: "Write-Around skips the cache on write — useful for logs or bulk data rarely re-read.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
