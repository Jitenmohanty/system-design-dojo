"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";
import { cn } from "@/lib/utils";
import { Plus, Shuffle } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface DataPoint {
  id: number;
  key: string;
  value: string;
  shard: number;
  emoji: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EMOJIS = ["🍕", "🎸", "🚀", "🐧", "🦊", "🌮", "🎯", "💎", "🔮", "🌊"];
const KEYS = ["alice", "bob", "charlie", "dave", "eve", "frank", "grace", "heidi", "ivan", "judy",
              "kyle", "luna", "mike", "nina", "oscar", "petra", "quinn", "rosa", "sam", "tina"];

function hashKey(key: string, shards: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return h % shards;
}

function rangeKey(key: string, shards: number): number {
  const c = key.charCodeAt(0);
  const bucketSize = Math.ceil(26 / shards);
  return Math.min(Math.floor((c - 97) / bucketSize), shards - 1);
}

// ─── Sharding Simulation ──────────────────────────────────────────────────────
function ShardingSimulation() {
  const [sharded, setSharded] = useState(false);
  const [shardCount, setShardCount] = useState(4);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [strategy, setStrategy] = useState<"hash" | "range">("hash");
  const [resharding, setResharding] = useState(false);
  const [hotShard, setHotShard] = useState<number | null>(null);
  const [nextId, setNextId] = useState(0);

  const getShardForKey = useCallback((key: string, shards: number) => {
    return strategy === "hash" ? hashKey(key, shards) : rangeKey(key, shards);
  }, [strategy]);

  const addDataPoint = () => {
    const keyIdx = nextId % KEYS.length;
    const key = KEYS[keyIdx];
    const shard = sharded ? getShardForKey(key, shardCount) : 0;
    const newPoint: DataPoint = {
      id: nextId,
      key,
      value: `val_${nextId}`,
      shard,
      emoji: EMOJIS[nextId % EMOJIS.length],
    };
    setNextId((n) => n + 1);
    setDataPoints((prev) => [...prev, newPoint]);

    // detect hot shard (shard with >40% of data)
    const counts: Record<number, number> = {};
    [...dataPoints, newPoint].forEach((d) => {
      counts[d.shard] = (counts[d.shard] ?? 0) + 1;
    });
    const total = dataPoints.length + 1;
    const hot = Object.entries(counts).find(([, cnt]) => cnt / total > 0.4);
    setHotShard(hot ? parseInt(hot[0]) : null);
  };

  const triggerShard = () => {
    setSharded(true);
    setDataPoints((prev) =>
      prev.map((d) => ({ ...d, shard: getShardForKey(d.key, shardCount) }))
    );
  };

  const triggerReshard = async () => {
    setResharding(true);
    const newShards = shardCount === 4 ? 8 : 4;
    setShardCount(newShards);
    setTimeout(() => {
      setDataPoints((prev) =>
        prev.map((d) => ({ ...d, shard: getShardForKey(d.key, newShards) }))
      );
      setHotShard(null);
      setResharding(false);
    }, 800);
  };

  const reset = () => {
    setSharded(false);
    setShardCount(4);
    setDataPoints([]);
    setHotShard(null);
    setNextId(0);
    setResharding(false);
  };

  const shardGroups: DataPoint[][] = Array.from({ length: shardCount }, (_, i) =>
    dataPoints.filter((d) => d.shard === i)
  );

  const shardColors = [
    "var(--neon-blue)", "var(--neon-green)", "var(--neon-purple)", "var(--neon-orange)",
    "var(--neon-red)", "var(--neon-yellow)", "var(--neon-blue)", "var(--neon-green)",
  ];

  const SHARD_LABELS = ["A–F", "G–L", "M–R", "S–Z", "A–C", "D–F", "G–I", "J–Z"];

  return (
    <div className="card overflow-hidden">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] bg-bg-tertiary/40 px-4 py-3">
        <div className="flex gap-1 rounded-lg border border-[var(--border-subtle)] bg-bg-primary/60 p-0.5">
          {(["hash", "range"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStrategy(s)}
              className={cn(
                "rounded-md px-3 py-1 mono text-xs transition",
                strategy === s ? "bg-neon-blue/20 text-neon-blue" : "text-ink-muted hover:text-white"
              )}
            >
              {s === "hash" ? "Hash-based" : "Range-based"}
            </button>
          ))}
        </div>

        <button onClick={addDataPoint} className="btn-ghost px-3 py-1.5 text-xs gap-1">
          <Plus size={13} /> Add Record
        </button>

        {!sharded ? (
          <button onClick={triggerShard} className="btn-neon px-3 py-1.5 text-xs">
            Shard! ✂️
          </button>
        ) : (
          <button
            onClick={triggerReshard}
            disabled={resharding}
            className="btn-neon px-3 py-1.5 text-xs gap-1"
          >
            <Shuffle size={13} />
            {resharding ? "Resharding…" : `Reshard → ${shardCount === 4 ? "8" : "4"} shards`}
          </button>
        )}

        <button onClick={reset} className="btn-ghost px-3 py-1.5 text-xs">
          Reset
        </button>
      </div>

      {/* Hot shard warning */}
      <AnimatePresence>
        {hotShard !== null && sharded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 bg-neon-red/10 px-4 py-2 text-xs text-neon-red">
              🔥 <strong>Hot Shard detected!</strong> Shard {hotShard} holds &gt;40% of data.
              Click &ldquo;Reshard&rdquo; to redistribute.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diagram */}
      <div className="p-4">
        {!sharded ? (
          /* Single overloaded DB */
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="mono text-xs text-ink-muted text-center">
              Single DB — all {dataPoints.length} records piling up here
            </p>
            <motion.div
              className="relative rounded-2xl border-2 p-6 flex flex-wrap gap-2 justify-center min-h-[80px] max-w-xs"
              style={{
                borderColor: dataPoints.length > 8 ? "var(--neon-red)" : "var(--neon-blue)",
                background: "var(--bg-secondary)",
                boxShadow: dataPoints.length > 8 ? "0 0 24px -4px var(--neon-red)" : "0 0 12px -4px var(--neon-blue)",
              }}
              animate={
                dataPoints.length > 8
                  ? { x: [0, -2, 2, -1, 1, 0], transition: { duration: 0.4, repeat: Infinity } }
                  : {}
              }
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-bg-primary px-2 mono text-[0.6rem]"
                style={{ color: dataPoints.length > 8 ? "var(--neon-red)" : "var(--neon-blue)" }}>
                🗄️ Single DB {dataPoints.length > 8 ? "⚠ OVERLOADED" : ""}
              </div>
              <AnimatePresence>
                {dataPoints.map((d) => (
                  <motion.span
                    key={d.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xl"
                    title={d.key}
                  >
                    {d.emoji}
                  </motion.span>
                ))}
              </AnimatePresence>
              {dataPoints.length === 0 && (
                <span className="text-xs text-ink-muted">Add some records first…</span>
              )}
            </motion.div>
          </div>
        ) : (
          /* Sharded DBs */
          <div className={cn("grid gap-3", shardCount <= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-4")}>
            {shardGroups.map((group, i) => {
              const isHot = hotShard === i;
              const color = shardColors[i];
              return (
                <motion.div
                  key={i}
                  layout
                  className="rounded-xl border-2 p-3 min-h-[80px]"
                  style={{
                    borderColor: isHot ? "var(--neon-red)" : color,
                    background: "var(--bg-secondary)",
                    boxShadow: isHot ? "0 0 20px -4px var(--neon-red)" : `0 0 10px -6px ${color}`,
                  }}
                  animate={resharding ? { y: [0, -8, 0] } : {}}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <div className="mono text-[0.6rem] mb-2 flex items-center justify-between"
                    style={{ color: isHot ? "var(--neon-red)" : color }}>
                    <span>Shard {i} {strategy === "range" ? `(${SHARD_LABELS[i]})` : ""}</span>
                    {isHot && <span className="text-neon-red animate-pulse">🔥 HOT</span>}
                  </div>
                  <div className="flex flex-wrap gap-1 min-h-[32px]">
                    <AnimatePresence>
                      {group.map((d) => (
                        <motion.span
                          key={d.id}
                          layout
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          title={`${d.key}: ${d.value}`}
                          className="text-base"
                        >
                          {d.emoji}
                        </motion.span>
                      ))}
                    </AnimatePresence>
                    {group.length === 0 && (
                      <span className="text-[0.6rem] text-ink-muted">empty</span>
                    )}
                  </div>
                  <div className="mt-1.5 mono text-[0.55rem] text-ink-muted">{group.length} records</div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary bar */}
      {dataPoints.length > 0 && sharded && (
        <div className="border-t border-[var(--border-subtle)] px-4 py-2 flex flex-wrap gap-3">
          {shardGroups.map((g, i) => {
            const pct = dataPoints.length > 0 ? Math.round((g.length / dataPoints.length) * 100) : 0;
            return (
              <div key={i} className="flex items-center gap-1.5">
                <span className="mono text-[0.6rem] text-ink-muted">Shard {i}:</span>
                <div className="h-1.5 w-16 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: shardColors[i] }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="mono text-[0.6rem]" style={{ color: shardColors[i] }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Strategy Tabs ─────────────────────────────────────────────────────────────
const STRATEGIES = [
  {
    key: "range",
    label: "Range-based",
    emoji: "📚",
    color: "var(--neon-blue)",
    pro: "Simple, great for range queries (get all users A–M)",
    con: "Hotspots when data is skewed (most users start with A–D)",
    example: "Users A–M → Shard 0 | N–Z → Shard 1",
  },
  {
    key: "hash",
    label: "Hash-based",
    emoji: "#️⃣",
    color: "var(--neon-green)",
    pro: "Even distribution, no hotspots",
    con: "Range queries need to hit all shards",
    example: "hash(user_id) % 4 → Shard 0, 1, 2, or 3",
  },
  {
    key: "directory",
    label: "Directory-based",
    emoji: "📋",
    color: "var(--neon-purple)",
    pro: "Flexible — any routing logic you want",
    con: "Directory becomes a bottleneck + single point of failure",
    example: "Lookup table: user 1–1000 → Shard 0, 1001–2000 → Shard 1…",
  },
  {
    key: "geo",
    label: "Geographic",
    emoji: "🌍",
    color: "var(--neon-orange)",
    pro: "Data sovereignty, low latency for users in region",
    con: "Uneven growth per region; migrations are painful",
    example: "US users → US Shard | EU users → EU Shard (GDPR ✅)",
  },
];

function StrategyTabs() {
  const [active, setActive] = useState("range");
  const strat = STRATEGIES.find((s) => s.key === active)!;

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap border-b border-[var(--border-subtle)]">
        {STRATEGIES.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-3 mono text-xs transition border-b-2",
              active === s.key
                ? "text-white border-current"
                : "text-ink-muted border-transparent hover:text-white"
            )}
            style={active === s.key ? { color: s.color, borderColor: s.color } : {}}
          >
            <span>{s.emoji}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{strat.emoji}</span>
            <span className="font-display text-lg font-bold" style={{ color: strat.color }}>
              {strat.label}
            </span>
          </div>
          <div className="rounded-lg bg-bg-tertiary/60 p-3 mono text-xs text-neon-blue mb-4">
            {strat.example}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-neon-green/5 border border-neon-green/20 p-3">
              <span className="mono text-[0.6rem] text-neon-green uppercase tracking-wider">Pro</span>
              <p className="mt-1 text-sm text-ink-primary">{strat.pro}</p>
            </div>
            <div className="rounded-lg bg-neon-red/5 border border-neon-red/20 p-3">
              <span className="mono text-[0.6rem] text-neon-red uppercase tracking-wider">Con</span>
              <p className="mt-1 text-sm text-ink-primary">{strat.con}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DatabaseShardingPage() {
  return (
    <ConceptPage
      slug="database-sharding"
      analogy={
        <FunnyAnalogy
          emoji="🔪"
          color="var(--neon-orange)"
          alternates={[
            { emoji: "📞", text: "The old phonebook: A–M goes in Volume 1, N–Z in Volume 2. Nobody asks Volume 1 where Zara is." },
            { emoji: "🏪", text: "A supermarket with 50 checkout lanes instead of one. Each lane handles a slice of the queue. One lane breaks — 49 keep going." },
          ]}
        >
          One massive phonebook that every librarian in the world is grabbing at once? Chaos.
          Split it: <strong className="text-neon-orange">A–M goes in one room, N–Z in another</strong>.
          Now half the librarians never even need to go to the second room.
          That&apos;s sharding — horizontal partitioning of your data across multiple databases.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="Try it" title="Interactive Sharding Simulator">
          <p className="mb-4 text-ink-secondary">
            Add records to a single overloaded DB, then click <strong className="text-neon-orange">Shard!</strong>{" "}
            to watch data redistribute across 4 shards. Toggle between hash-based and range-based routing.
            Keep adding to trigger a hot shard, then reshard to fix it.
          </p>
          <ShardingSimulation />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Strategies" title="How do you decide which shard?">
          <p className="mb-4 text-ink-secondary">
            The routing strategy determines which record goes where — and each has a completely
            different failure mode waiting to ruin your Tuesday.
          </p>
          <StrategyTabs />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The dark side" title="Problems sharding creates">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "Cross-shard queries",
                emoji: "🤯",
                color: "var(--neon-red)",
                body: "SELECT * WHERE name LIKE &apos;A%&apos; with hash sharding? You&apos;re querying ALL shards and merging. Scatter-gather: slow, expensive.",
              },
              {
                title: "Hot shards",
                emoji: "🔥",
                color: "var(--neon-orange)",
                body: "Range-based sharding on usernames? If 40% of your users are named &apos;A-something&apos;, Shard 0 is crying while the others nap.",
              },
              {
                title: "Resharding pain",
                emoji: "😱",
                color: "var(--neon-yellow)",
                body: "Growing from 4 to 8 shards? Almost every record needs to move. Double the nodes, double the migration headache. Plan your shard count early.",
              },
              {
                title: "No ACID across shards",
                emoji: "💀",
                color: "var(--neon-purple)",
                body: "Transfer $100 from user on Shard 0 to user on Shard 1? No single transaction covers both. Welcome to 2-phase commit or eventual consistency.",
              },
            ].map((p) => (
              <div key={p.title} className="card p-4" style={{ borderColor: `${p.color}30` }}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{p.emoji}</span>
                  <div>
                    <div className="font-display font-semibold" style={{ color: p.color }}>{p.title}</div>
                    <p className="mt-1 text-sm text-ink-secondary">{p.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Head to head" title="Range vs Hash Sharding">
          <ComparisonBattle
            left={{
              name: "Range-based",
              emoji: "📚",
              color: "var(--neon-blue)",
              bestFor: "When you need efficient range queries and your data is evenly distributed.",
            }}
            right={{
              name: "Hash-based",
              emoji: "#️⃣",
              color: "var(--neon-green)",
              bestFor: "When even distribution matters more than range query efficiency.",
            }}
            features={[
              { label: "Even distribution", a: 5, b: 9, max: 10, winner: "b" },
              { label: "Range queries", a: 9, b: 3, max: 10, winner: "a" },
              { label: "Hot shard risk", a: "High", b: "Low", winner: "b" },
              { label: "Query routing", a: "Simple", b: "Simple", winner: "tie" },
              { label: "Reshard complexity", a: "Medium", b: "High", winner: "a" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="database-sharding"
          questions={[
            {
              question: "What is a &apos;hot shard&apos; in database sharding?",
              options: [
                "A shard that is physically overheating in the data center",
                "A shard that receives a disproportionately large amount of traffic or data",
                "A shard that has been recently created",
                "A shard reserved for premium users",
              ],
              correct: 1,
              explain: "A hot shard gets way more reads/writes than others — often from skewed key distribution. It becomes the new bottleneck you were trying to escape.",
            },
            {
              question: "Why does cross-shard JOIN become painful?",
              options: [
                "Databases don&apos;t support JOIN at all",
                "JOINs require all shards to be on the same machine",
                "You must query each shard separately and merge results in application code",
                "JOIN only works with primary keys",
              ],
              correct: 2,
              explain: "Without a single DB engine covering all shards, cross-shard queries scatter across nodes and merge at the app layer — slow and complex.",
            },
            {
              question: "You&apos;re sharding a social network by user_id. Which strategy distributes data most evenly?",
              options: [
                "Range-based: user_id 1–1M on Shard 0, 1M–2M on Shard 1",
                "Geographic: US users on Shard 0, EU on Shard 1",
                "Hash-based: hash(user_id) % num_shards",
                "Directory-based with a lookup table",
              ],
              correct: 2,
              explain: "Hash-based sharding distributes records pseudo-randomly — reducing hot shards. Range-based can hotspot if early users are more active.",
            },
            {
              question: "You double your shard count from 4 to 8. What happens to existing data?",
              options: [
                "Nothing — shards auto-expand",
                "Data must be remapped: almost all records move to a new shard",
                "Only new data goes to the new shards",
                "Old shards are cloned into the new ones",
              ],
              correct: 1,
              explain: "With hash sharding, changing the shard count changes hash(key) % N for almost every key — triggering a massive data migration.",
            },
            {
              question: "Which sharding strategy is best for GDPR compliance (EU data must stay in EU)?",
              options: [
                "Hash-based",
                "Range-based",
                "Geographic",
                "Directory-based",
              ],
              correct: 2,
              explain: "Geographic sharding routes data by user region — keeping EU users&apos; data in EU shards, satisfying data residency requirements.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
