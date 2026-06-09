"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Database, Sparkles } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";

function SplitRace() {
  const [run, setRun] = useState(0);
  return (
    <div className="card p-5">
      <button onClick={() => setRun((r) => r + 1)} className="btn-neon mb-4 text-sm">
        ▶ Race them
      </button>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { title: "Without cache", dur: 3, color: "var(--neon-red)", label: "DB round-trip · 3s", icon: Database },
          { title: "With cache", dur: 0.25, color: "var(--neon-green)", label: "Cache hit · 200ms", icon: Zap },
        ].map((x) => {
          const Icon = x.icon;
          return (
            <div key={x.title} className="rounded-xl border border-[var(--border-subtle)] bg-bg-tertiary/30 p-4">
              <div className="flex items-center gap-2">
                <Icon size={16} style={{ color: x.color }} />
                <span className="font-display text-sm font-semibold text-white">{x.title}</span>
              </div>
              <div className="relative mt-4 h-10 rounded-lg bg-bg-primary/60">
                <motion.div
                  key={run}
                  className="absolute top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-bg-primary"
                  style={{ background: x.color }}
                  initial={{ left: "2%" }}
                  animate={run ? { left: "88%" } : { left: "2%" }}
                  transition={{ duration: x.dur, ease: "easeInOut" }}
                >
                  <Icon size={14} />
                </motion.div>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xl">🎯</span>
              </div>
              <div className="mt-2 mono text-xs" style={{ color: x.color }}>{x.label}</div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-ink-muted">Same request. The cache keeps the answer nearby, so it skips the slow trip.</p>
    </div>
  );
}

function CacheDemo() {
  const [cache, setCache] = useState<Set<string>>(new Set());
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [last, setLast] = useState<{ key: string; hit: boolean } | null>(null);
  const keys = ["A", "B", "C", "D", "E", "F"];

  const fetchKey = (k: string) => {
    const hit = cache.has(k);
    if (hit) setHits((h) => h + 1);
    else { setMisses((m) => m + 1); setCache((c) => new Set(c).add(k)); }
    setLast({ key: k, hit });
  };

  const total = hits + misses;
  const ratio = total ? Math.round((hits / total) * 100) : 0;

  return (
    <div className="card p-5">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {keys.map((k) => {
          const cached = cache.has(k);
          const isLast = last?.key === k;
          return (
            <motion.button
              key={k}
              onClick={() => fetchKey(k)}
              whileTap={{ scale: 0.92 }}
              animate={isLast ? { scale: [1, 1.08, 1] } : {}}
              className="relative grid aspect-square place-items-center rounded-xl border-2 font-display text-xl font-bold transition"
              style={{
                borderColor: cached ? "var(--neon-green)" : "var(--border-subtle)",
                color: cached ? "var(--neon-green)" : "var(--text-secondary)",
                background: cached ? "rgba(0,255,136,0.08)" : "var(--bg-tertiary)",
                boxShadow: isLast && cached ? "0 0 18px -4px var(--neon-green)" : isLast ? "0 0 18px -4px var(--neon-red)" : undefined,
              }}
            >
              {k}
              {cached && <Sparkles size={12} className="absolute right-1.5 top-1.5 text-neon-green" />}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {last && (
          <span
            className="rounded-lg px-3 py-1.5 mono text-xs font-bold"
            style={{
              background: last.hit ? "rgba(0,255,136,0.12)" : "rgba(255,51,102,0.12)",
              color: last.hit ? "var(--neon-green)" : "var(--neon-red)",
            }}
          >
            {last.key}: {last.hit ? "CACHE HIT ⚡" : "CACHE MISS 🐌 (fetched from DB)"}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-[var(--border-subtle)]">
        {[
          { l: "Hits", v: hits, c: "var(--neon-green)" },
          { l: "Misses", v: misses, c: "var(--neon-red)" },
          { l: "Hit ratio", v: `${ratio}%`, c: "var(--neon-blue)" },
        ].map((m) => (
          <div key={m.l} className="bg-bg-secondary px-3 py-2.5 text-center">
            <div className="mono text-[0.55rem] uppercase tracking-wider text-ink-muted">{m.l}</div>
            <div className="font-display text-xl font-bold" style={{ color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-ink-muted">Click a button: first time misses (slow), click again for an instant hit ✨</p>
    </div>
  );
}

export default function CachingBasicsPage() {
  return (
    <ConceptPage
      slug="caching-basics"
      analogy={
        <FunnyAnalogy
          emoji="📺"
          color="var(--neon-yellow)"
          alternates={[
            { emoji: "🧠", text: "Memorizing your best friend's number instead of looking it up every time." },
            { emoji: "🥤", text: "Keeping snacks on your desk instead of walking to the kitchen each craving." },
          ]}
        >
          Caching is keeping the <strong className="text-neon-yellow">TV remote on the armrest</strong> instead
          of walking to the drawer every single time. Store the answer close by, and skip the slow trip when
          you need it again.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="Why bother" title="The slow path vs the fast path">
          <p className="text-ink-secondary">
            Reading from a database can take time. A cache is a small, fast store (often in memory) that holds
            recently-used data so repeat requests are near-instant. Watch the difference:
          </p>
          <div className="mt-4"><SplitRace /></div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Hit or miss" title="Feel the cache working">
          <CacheDemo />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The pattern" title="Cache-aside: check fast, fall back to slow">
          <p className="mb-4 text-ink-secondary">
            Here&apos;s the wiring almost every app uses. The server asks the <strong className="text-neon-yellow">cache</strong>{" "}
            first. On a <strong className="text-neon-green">hit</strong> it returns instantly. On a{" "}
            <strong className="text-neon-red">miss</strong> it goes to the slow database, then{" "}
            <em>stores the answer in the cache</em> so the next request is fast too. Click each box.
          </p>
          <AnimatedDiagram
            height={320}
            nodes={[
              { id: "client", type: "client", label: "Client", position: { x: 8, y: 50 }, status: "active", info: "Asks for some data — say, a user's profile." },
              { id: "server", type: "server", label: "App Server", position: { x: 35, y: 50 }, status: "busy", info: "Checks the cache first. Only touches the database if the cache doesn't have it." },
              { id: "cache", type: "cache", label: "Cache (Redis)", position: { x: 64, y: 24 }, status: "active", info: "In-memory store. Returns in ~1ms on a hit. Holds recently-used data with a TTL." },
              { id: "db", type: "database", label: "Database", position: { x: 64, y: 78 }, status: "idle", info: "The slow source of truth (~50ms). Only hit on a cache miss — then the result is written back to the cache." },
            ]}
            edges={[
              { from: "client", to: "server", animated: true },
              { from: "server", to: "cache", animated: true, color: "var(--neon-yellow)", label: "1. check → hit ⚡" },
              { from: "server", to: "db", dashed: true, color: "var(--neon-red)", label: "2. on miss → fetch" },
              { from: "db", to: "cache", dashed: true, color: "var(--neon-yellow)", label: "3. backfill" },
            ]}
          />
          <p className="mt-3 text-xs text-ink-muted">Tip: a good cache turns ~95% of reads into 1ms hits, so the database only handles the rare miss. That single box is why huge sites feel instant.</p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The catches" title="Caching isn't free">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { t: "Hit vs Miss", d: "A hit = found in cache (fast). A miss = not there, go fetch it (slow).", c: "var(--neon-green)" },
              { t: "TTL", d: "Cached data expires after a time-to-live so it doesn't go stale forever.", c: "var(--neon-yellow)" },
              { t: "Eviction", d: "Cache is small. When full, something gets kicked out (e.g. least-recently-used).", c: "var(--neon-red)" },
            ].map((x) => (
              <div key={x.t} className="card p-4">
                <div className="font-display font-semibold" style={{ color: x.c }}>{x.t}</div>
                <p className="mt-1 text-sm text-ink-secondary">{x.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            &ldquo;There are only two hard things in computer science: cache invalidation and naming things.&rdquo; 😅
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="caching-basics"
          questions={[
            {
              question: "A 'cache hit' means…",
              options: ["The cache crashed", "The data was found in the cache", "The cache was deleted", "You hit the cache with a hammer"],
              correct: 1,
              explain: "A hit = the requested data was already in the cache, so we skip the slow source.",
            },
            {
              question: "What is TTL used for?",
              options: ["Encrypting the cache", "Deciding how long cached data stays fresh", "Counting hits", "Adding servers"],
              correct: 1,
              explain: "Time-To-Live expires cached entries so they get refreshed and don't go stale.",
            },
            {
              question: "When a cache is full, eviction policies decide…",
              options: ["Which server to add", "Which entry to remove to make room", "How to encrypt data", "When to restart"],
              correct: 1,
              explain: "Caches are small; policies like LRU pick what to drop when space runs out.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
