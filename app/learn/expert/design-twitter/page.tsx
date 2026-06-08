"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Users, Zap, Search, Bell, TrendingUp } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { cn } from "@/lib/utils";

// ── Back-of-envelope calculator ───────────────────────────────
function EnvelopeCalc() {
  const [users, setUsers] = useState(300);
  const dau = Math.round(users * 0.2);
  const tweetsPerDayPerUser = 2;
  const tweetsPerDay = dau * tweetsPerDayPerUser;
  const writeQPS = Math.round(tweetsPerDay / 86400);
  const readQPS = writeQPS * 100; // reads >> writes
  const avgFollowers = 200;
  const fanoutWrites = tweetsPerDay * avgFollowers;
  const storagePerTweet = 0.001; // 1KB
  const storageTBperDay = (tweetsPerDay * storagePerTweet * 1024) / 1e9;
  const bwGBperDay = Math.round((readQPS * 86400 * 2) / 1024);

  const rows = [
    { label: "Monthly Active Users", value: `${users}M`, color: "var(--neon-blue)" },
    { label: "Daily Active Users (20%)", value: `${dau}M`, color: "var(--neon-blue)" },
    { label: "Tweets / day", value: `${(tweetsPerDay / 1e6).toFixed(0)}M`, color: "var(--neon-yellow)" },
    { label: "Write QPS (tweets)", value: `${writeQPS.toLocaleString()}`, color: "var(--neon-yellow)" },
    { label: "Read QPS (timeline)", value: `${(readQPS / 1000).toFixed(0)}K`, color: "var(--neon-green)" },
    { label: "Fan-out writes / day", value: `${(fanoutWrites / 1e9).toFixed(1)}B`, color: "var(--neon-purple)" },
    { label: "Storage / day", value: `${storageTBperDay.toFixed(2)} TB`, color: "var(--neon-red)" },
    { label: "Bandwidth / day", value: `${bwGBperDay} GB`, color: "var(--neon-orange)" },
  ];

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="mono text-xs text-neon-yellow uppercase tracking-widest">MAU (millions)</span>
        <input
          type="range" min={50} max={1000} step={50} value={users}
          onChange={(e) => setUsers(Number(e.target.value))}
          className="flex-1 accent-yellow-400"
        />
        <span className="mono text-neon-yellow font-bold w-16 text-right">{users}M</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map((r, i) => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between rounded-lg bg-bg-tertiary/60 px-3 py-2"
          >
            <span className="text-xs text-ink-secondary">{r.label}</span>
            <span className="mono text-sm font-bold" style={{ color: r.color }}>{r.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Fan-out comparison ────────────────────────────────────────
type FanoutMode = "write" | "read" | "hybrid";

function FanoutDemo() {
  const [mode, setMode] = useState<FanoutMode>("write");
  const [animating, setAnimating] = useState(false);
  const [step, setStep] = useState(0);

  const WRITE_STEPS = [
    "✍️ Celebrity posts tweet",
    "📬 Push to 50M follower timelines",
    "⏱️ Write latency: ~5 seconds",
    "✅ Timeline reads are instant (pre-computed)",
  ];

  const READ_STEPS = [
    "✍️ Celebrity posts tweet (stored once)",
    "👤 Follower opens timeline",
    "🔍 Fetch tweets from all followees",
    "📦 Merge, sort, paginate — latency ~2s",
  ];

  const HYBRID_STEPS = [
    "✍️ Normal user tweets → fan-out to followers",
    "⭐ Celebrity tweets → stored, NOT fanned out",
    "👤 Follower reads timeline",
    "🔀 Merge pre-computed + celebrity tweets at read",
    "⚡ Best of both worlds!",
  ];

  const steps = mode === "write" ? WRITE_STEPS : mode === "read" ? READ_STEPS : HYBRID_STEPS;

  const run = () => {
    if (animating) return;
    setAnimating(true);
    setStep(0);
    steps.forEach((_, i) => {
      setTimeout(() => setStep(i + 1), i * 800);
    });
    setTimeout(() => setAnimating(false), steps.length * 800 + 400);
  };

  const modeConfig = {
    write: { label: "Fan-out on Write", color: "var(--neon-yellow)", emoji: "📬" },
    read: { label: "Fan-out on Read", color: "var(--neon-blue)", emoji: "🔍" },
    hybrid: { label: "Hybrid (Twitter&apos;s approach)", color: "var(--neon-green)", emoji: "🔀" },
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["write", "read", "hybrid"] as FanoutMode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setStep(0); }}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
              mode === m
                ? "text-white border"
                : "text-ink-secondary hover:text-white"
            )}
            style={mode === m ? { borderColor: modeConfig[m].color, background: `${modeConfig[m].color}18`, color: modeConfig[m].color } : {}}
          >
            {modeConfig[m].emoji} {modeConfig[m].label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-xl bg-bg-tertiary/50 p-4 min-h-[140px]"
        >
          <div className="space-y-2">
            {steps.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0.2 }}
                animate={{ opacity: step > i ? 1 : 0.2 }}
                transition={{ duration: 0.3 }}
                className={cn("flex items-center gap-2 text-sm", step > i ? "text-white" : "text-ink-muted")}
              >
                <span className={cn("h-2 w-2 rounded-full shrink-0 transition", step > i ? "bg-current" : "bg-transparent border border-current")}
                  style={{ color: modeConfig[mode].color }} />
                {s}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={run}
        disabled={animating}
        className={cn("btn-neon text-xs w-full justify-center", animating && "opacity-50 cursor-not-allowed")}
      >
        {animating ? "Running…" : "▶ Simulate"}
      </button>
    </div>
  );
}

// ── Deep dive components ──────────────────────────────────────
const COMPONENTS = [
  {
    icon: <Zap size={18} />, title: "Tweet Service", color: "var(--neon-yellow)",
    content: "Accepts tweet creation (POST /tweets). Validates content length (≤280 chars), attaches metadata (user ID, timestamp, geo, client). Writes to a Tweet Store (sharded by tweet_id). Emits a TweetPosted event to Kafka. For fan-out-on-write users, the Fan-out Service consumes this event immediately.",
  },
  {
    icon: <Users size={18} />, title: "Timeline Service", color: "var(--neon-blue)",
    content: "Serves the home timeline for a user. For normal users: reads the pre-computed timeline from Redis (a sorted set of tweet IDs). For celebrities: reads their tweets from a separate index and merges at read time. Timeline cache per user is 800 tweet IDs max; older ones fall off.",
  },
  {
    icon: <Search size={18} />, title: "Search", color: "var(--neon-orange)",
    content: "Elasticsearch cluster indexes all tweets in near real-time (< 5s delay). Full-text search on tweet content + hashtags + user handles. Twitter&apos;s search is recency-biased — breaking news surfaces in seconds. The index is massive: 500B+ tweets, but only recent ones live in hot storage.",
  },
  {
    icon: <TrendingUp size={18} />, title: "Trending Topics", color: "var(--neon-purple)",
    content: "Counts hashtag mentions in a sliding 1-hour window using a Redis sorted set per region. A Storm/Flink streaming job aggregates in real-time. Trending is computed per region (what&apos;s trending in Tokyo differs from New York). Results are cached and refreshed every 30 seconds.",
  },
  {
    icon: <Bell size={18} />, title: "Notifications", color: "var(--neon-green)",
    content: "Event-driven: when you get a like/retweet/mention, an event goes to the Notification Service. It checks your preferences, deduplicates (no 50 alerts for a viral tweet), then pushes via APNs/FCM. Non-urgent notifications are batched hourly to avoid waking you up repeatedly.",
  },
];

function DeepDiveCard({ comp, idx }: { comp: typeof COMPONENTS[0]; idx: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.07 }}
      className="card cursor-pointer"
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-center gap-3 p-4">
        <span style={{ color: comp.color }}>{comp.icon}</span>
        <span className="font-display font-semibold text-white flex-1">{comp.title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-ink-muted" />
        </motion.span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--border-subtle)] px-4 pb-4 pt-3 text-sm text-ink-secondary">
              {comp.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Bottleneck analysis ───────────────────────────────────────
const BOTTLENECKS = [
  {
    problem: "Lady Gaga has 80M followers. A single tweet fans out to 80M timeline writes — server meltdown.",
    solution: "The celebrity threshold (~1M followers) skips fan-out. Their tweets are fetched lazily at read time and merged into follower timelines. ~0.01% of accounts are celebrities but cause 99% of fan-out pain.",
    color: "var(--neon-red)",
  },
  {
    problem: "Timeline Redis cache evicted — cold cache causes 1000x DB reads on startup or failover.",
    solution: "Timeline reconstructed asynchronously on cache miss. The first read pays the slow DB query; subsequent reads hit cache. A background job pre-warms timelines for high-DAU users overnight.",
    color: "var(--neon-yellow)",
  },
  {
    problem: "Trending topics lag during breaking news — Kafka consumer falls behind on spike.",
    solution: "Partition the Trending Kafka topic by region. Scale consumers horizontally per region. Use a sliding 10-min window (not 1-hour) during detected spike mode. Degrade gracefully: show last-known trending if pipeline lags.",
    color: "var(--neon-orange)",
  },
];

function BottleneckCard({ item, idx }: { item: typeof BOTTLENECKS[0]; idx: number }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      className="card overflow-hidden"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="text-2xl shrink-0">⚠️</span>
        <div className="flex-1">
          <p className="text-sm text-white">{item.problem}</p>
          <button
            onClick={() => setRevealed((r) => !r)}
            className="mt-2 btn-ghost text-xs"
            style={{ color: item.color }}
          >
            {revealed ? "Hide solution" : "Click to reveal solution →"}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div
              className="border-t px-4 pb-4 pt-3 text-sm"
              style={{ borderColor: item.color, background: `${item.color}0d`, color: "var(--text-primary)" }}
            >
              ✅ <strong>Solution:</strong> {item.solution}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Trade-offs toggle ─────────────────────────────────────────
function TradeoffToggle() {
  const [mode, setMode] = useState<"write" | "read">("write");
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => setMode("write")}
          className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition", mode === "write" ? "bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/40" : "text-ink-secondary")}
        >
          Fan-out on Write
        </button>
        <span className="text-ink-muted text-sm">vs</span>
        <button
          onClick={() => setMode("read")}
          className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition", mode === "read" ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/40" : "text-ink-secondary")}
        >
          Fan-out on Read
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-2 text-sm text-ink-secondary"
        >
          {mode === "write" ? (
            <>
              <p>✅ <strong className="text-white">Timeline reads are O(1)</strong> — Redis lookup of pre-computed sorted set, sub-millisecond.</p>
              <p>✅ <strong className="text-white">Great for low-follower accounts</strong> — fan-out to 200 followers is trivial.</p>
              <p>⚠️ <strong className="text-white">Celebrities break this model</strong> — 80M writes per tweet is untenable.</p>
              <p>⚠️ <strong className="text-white">Storage overhead</strong> — same tweet ID stored N times (once per follower timeline).</p>
              <p className="text-neon-yellow">Twitter uses this for ~99.99% of accounts (those with &lt; 1M followers).</p>
            </>
          ) : (
            <>
              <p>✅ <strong className="text-white">Write is cheap</strong> — tweet stored once, no immediate fan-out.</p>
              <p>✅ <strong className="text-white">No celebrity problem</strong> — everyone reads from the source.</p>
              <p>⚠️ <strong className="text-white">Timeline reads are expensive</strong> — must fetch from all followees, merge, sort.</p>
              <p>⚠️ <strong className="text-white">Latency at read time</strong> — if you follow 2000 accounts, that&apos;s 2000 DB lookups per page.</p>
              <p className="text-neon-blue">Twitter uses this exclusively for celebrity accounts to avoid write amplification.</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Summary decisions ─────────────────────────────────────────
const KEY_DECISIONS = [
  { label: "Tweet store", value: "Sharded MySQL by tweet_id + Cassandra for timelines", color: "var(--neon-yellow)" },
  { label: "Fan-out strategy", value: "Hybrid: write fan-out for normal users, read fan-out for celebrities (>1M followers)", color: "var(--neon-purple)" },
  { label: "Timeline cache", value: "Redis sorted set (tweet_id + timestamp score), 800 entries per user", color: "var(--neon-blue)" },
  { label: "Search", value: "Elasticsearch with async Kafka indexing, recency-weighted", color: "var(--neon-orange)" },
  { label: "Trending", value: "Redis sorted set + sliding window, partitioned by region", color: "var(--neon-green)" },
  { label: "Notifications", value: "Event-driven via Kafka, debounced per user to avoid spam", color: "var(--neon-red)" },
];

export default function DesignTwitterPage() {
  return (
    <ConceptPage
      slug="design-twitter"
      analogy={
        <FunnyAnalogy
          emoji="🐦"
          color="var(--neon-blue)"
          alternates={[
            { emoji: "📰", text: "A tweet is a newspaper headline. Fan-out on write pre-prints 80M copies. Fan-out on read lets everyone fetch it themselves. Celebrities break the printing press." },
            { emoji: "📡", text: "Broadcasting: either the station sends one signal everyone tunes into, or everyone drives to the studio to pick up their copy. Twitter does both, depending on who you are." },
          ]}
        >
          Twitter is basically a <strong className="text-neon-blue">message fan-out machine with a celebrity exception clause</strong>.
          Your 200-follower tweet is cloned and pushed instantly. Lady Gaga&apos;s tweet politely says &ldquo;come fetch me yourself.&rdquo;
        </FunnyAnalogy>
      }
    >
      {/* 1. Requirements */}
      <ScrollReveal>
        <Section kicker="Step 1" title="Requirements">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-4">
              <div className="mono mb-2 text-[0.65rem] uppercase tracking-widest text-neon-green">Functional</div>
              <ul className="space-y-1.5 text-sm text-ink-secondary">
                {[
                  "Post tweets (text, images, videos)",
                  "Follow / unfollow users",
                  "Home timeline feed (chronological + ranked)",
                  "Search tweets and users",
                  "Trending topics by region",
                  "Like, retweet, reply, quote-tweet",
                  "Notifications (mentions, likes, retweets)",
                ].map((r) => (
                  <motion.li key={r} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-start gap-2">
                    <span className="text-neon-green mt-0.5">▸</span>{r}
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="card p-4">
              <div className="mono mb-2 text-[0.65rem] uppercase tracking-widest text-neon-blue">Non-Functional</div>
              <ul className="space-y-1.5 text-sm text-ink-secondary">
                {[
                  "300M MAU, 500M tweets/day",
                  "Timeline load < 200ms p99",
                  "High availability (outage = viral PR disaster)",
                  "Read-heavy: 100:1 read-to-write ratio",
                  "Eventual consistency on timelines is fine",
                  "Celebrity accounts need special treatment",
                  "Global — multi-region, low latency worldwide",
                ].map((r) => (
                  <motion.li key={r} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-start gap-2">
                    <span className="text-neon-blue mt-0.5">▸</span>{r}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      </ScrollReveal>

      {/* 2. Back-of-envelope */}
      <ScrollReveal>
        <Section kicker="Step 2" title="Back-of-Envelope Estimation">
          <p className="mb-3 text-sm text-ink-secondary">Drag the MAU slider — watch the fan-out math cascade:</p>
          <EnvelopeCalc />
        </Section>
      </ScrollReveal>

      {/* 3. High-level architecture */}
      <ScrollReveal>
        <Section kicker="Step 3" title="High-Level Architecture">
          <p className="mb-3 text-sm text-ink-secondary">Click any node for details. Hover to highlight connections.</p>
          <AnimatedDiagram
            height={420}
            nodes={[
              { id: "client", type: "client", label: "Browser / App", position: { x: 7, y: 50 }, status: "active", info: "Reads timeline from cache via Timeline Service. Posts tweets to Tweet Service." },
              { id: "apigate", type: "gateway", label: "API Gateway", position: { x: 22, y: 50 }, status: "active", info: "Auth, rate limiting, routing. JWT validation per request." },
              { id: "tweet", type: "server", label: "Tweet Service", position: { x: 40, y: 25 }, status: "busy", info: "Accepts tweet creation. Validates content, writes to Tweet Store, emits Kafka event." },
              { id: "timeline", type: "server", label: "Timeline Service", position: { x: 40, y: 75 }, status: "active", info: "Serves home timeline from Redis cache. Merges celebrity tweets at read time for hybrid approach." },
              { id: "fanout", type: "queue", label: "Fan-out Service", position: { x: 60, y: 25 }, status: "busy", info: "Consumes TweetPosted events. Writes tweet_id into follower timeline caches in Redis. Skips celebrities." },
              { id: "redis", type: "cache", label: "Timeline Cache", position: { x: 78, y: 50 }, status: "active", info: "Redis sorted sets per user. Score = tweet timestamp. 800 entries per user. Sub-ms reads." },
              { id: "tweetdb", type: "database", label: "Tweet Store", position: { x: 60, y: 75 }, status: "active", info: "Sharded MySQL by tweet_id. Stores tweet content, metadata, author. Celebrity tweets read directly here." },
              { id: "userdb", type: "database", label: "User / Graph DB", position: { x: 78, y: 15 }, status: "active", info: "Social graph: follow relationships. Cassandra for write-heavy follower lists. Redis caches follower IDs." },
              { id: "search", type: "server", label: "Search Service", position: { x: 55, y: 50 }, status: "active", info: "Elasticsearch cluster. Indexes tweets async via Kafka. Recency-weighted ranking." },
              { id: "notif", type: "server", label: "Notification Svc", position: { x: 88, y: 75 }, status: "active", info: "Event-driven. Debounces per user. Pushes via APNs / FCM / WebSocket." },
            ]}
            edges={[
              { from: "client", to: "apigate", animated: true, color: "var(--neon-blue)" },
              { from: "apigate", to: "tweet", animated: true, color: "var(--neon-yellow)" },
              { from: "apigate", to: "timeline", animated: true, color: "var(--neon-green)" },
              { from: "apigate", to: "search", animated: true, color: "var(--neon-orange)" },
              { from: "tweet", to: "fanout", animated: true, color: "var(--neon-yellow)", label: "event" },
              { from: "tweet", to: "tweetdb" },
              { from: "fanout", to: "redis", animated: true, color: "var(--neon-purple)" },
              { from: "fanout", to: "userdb", dashed: true, label: "followers" },
              { from: "timeline", to: "redis", animated: true, color: "var(--neon-green)" },
              { from: "timeline", to: "tweetdb", dashed: true, label: "celebrity" },
              { from: "tweet", to: "notif", dashed: true },
              { from: "tweetdb", to: "search", dashed: true },
            ]}
          />
        </Section>
      </ScrollReveal>

      {/* 4. Fan-out demo */}
      <ScrollReveal>
        <Section kicker="Step 4 — Star Feature" title="Fan-out on Write vs Fan-out on Read">
          <p className="mb-3 text-sm text-ink-secondary">
            This is the <strong className="text-neon-yellow">core interview question for Twitter</strong>. Switch modes and hit simulate to see exactly what happens:
          </p>
          <FanoutDemo />
        </Section>
      </ScrollReveal>

      {/* 5. Component deep dives */}
      <ScrollReveal>
        <Section kicker="Step 5" title="Component Deep Dives">
          <p className="mb-3 text-sm text-ink-secondary">Click each component to expand the design details:</p>
          <div className="space-y-2">
            {COMPONENTS.map((c, i) => <DeepDiveCard key={c.title} comp={c} idx={i} />)}
          </div>
        </Section>
      </ScrollReveal>

      {/* 6. Bottleneck analysis */}
      <ScrollReveal>
        <Section kicker="Step 6" title="Bottleneck Analysis">
          <p className="mb-3 text-sm text-ink-secondary">Three real production headaches — click to reveal the fix:</p>
          <div className="space-y-3">
            {BOTTLENECKS.map((b, i) => <BottleneckCard key={i} item={b} idx={i} />)}
          </div>
        </Section>
      </ScrollReveal>

      {/* 7. Trade-offs */}
      <ScrollReveal>
        <Section kicker="Step 7" title="Trade-offs: Write vs Read Fan-out">
          <TradeoffToggle />
        </Section>
      </ScrollReveal>

      {/* ComparisonBattle */}
      <ScrollReveal>
        <Section kicker="Head to head" title="Fan-out Approaches Compared">
          <ComparisonBattle
            left={{ name: "Fan-out on Write", emoji: "📬", color: "var(--neon-yellow)", bestFor: "Normal users with ≤ 1M followers. Timeline reads must be instant." }}
            right={{ name: "Fan-out on Read", emoji: "🔍", color: "var(--neon-blue)", bestFor: "Celebrities (>1M followers). Avoids write amplification at the cost of slower reads." }}
            features={[
              { label: "Read latency", a: "< 1ms", b: "100-500ms", winner: "a" },
              { label: "Write amplification", a: "High (×followers)", b: "None", winner: "b" },
              { label: "Storage overhead", a: "High", b: "Low", winner: "b" },
              { label: "Celebrity support", a: "Breaks at scale", b: "Fine", winner: "b" },
              { label: "Timeline freshness", a: 95, b: 80, max: 100, unit: "%", winner: "a" },
            ]}
          />
        </Section>
      </ScrollReveal>

      {/* 8. Summary */}
      <ScrollReveal>
        <Section kicker="Summary" title="Key Design Decisions">
          <div className="grid gap-2 sm:grid-cols-2">
            {KEY_DECISIONS.map((d) => (
              <div key={d.label} className="rounded-xl bg-bg-secondary/80 border border-[var(--border-subtle)] px-4 py-3">
                <div className="mono text-[0.6rem] uppercase tracking-widest mb-1" style={{ color: d.color }}>{d.label}</div>
                <div className="text-sm text-ink-primary">{d.value}</div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      {/* Quiz */}
      <ScrollReveal>
        <InteractiveQuiz
          slug="design-twitter"
          questions={[
            {
              question: "Why does Twitter use fan-out on write for normal users but fan-out on read for celebrities?",
              options: [
                "Celebrity accounts are verified and get special DB access",
                "Fanning out Lady Gaga&apos;s tweet to 80M timelines would cause a write storm — lazy fetch at read time is cheaper",
                "Read-heavy accounts always prefer fan-out on read",
                "Fan-out on write doesn&apos;t support images",
              ],
              correct: 1,
              explain: "80M writes per tweet would saturate the fan-out service for a single post. The hybrid approach writes once and merges celebrity tweets into timelines at read time.",
            },
            {
              question: "What data structure does Twitter use to store per-user timelines in Redis?",
              options: [
                "Hash map of tweet objects",
                "Sorted set scored by tweet timestamp",
                "Linked list of tweet IDs",
                "Bloom filter for deduplication",
              ],
              correct: 1,
              explain: "A Redis sorted set with tweet_id as member and creation timestamp as score allows O(log N) inserts and O(N) range queries for pagination. Perfect for chronological timelines.",
            },
            {
              question: "A user posts a tweet. Which components are involved in the write path?",
              options: [
                "Only the Tweet Service and the Tweet database",
                "Tweet Service → Tweet DB + Kafka event → Fan-out Service → Redis timelines",
                "Timeline Service reads the tweet from DB directly",
                "The CDN caches the tweet for followers",
              ],
              correct: 1,
              explain: "The write path: Tweet Service validates and writes to Tweet DB, then emits a Kafka event. The Fan-out Service consumes it and writes the tweet_id into the Redis sorted sets of all followers.",
            },
            {
              question: "How does Twitter&apos;s trending topics service know what&apos;s trending right now?",
              options: [
                "Manual editorial curation every hour",
                "Full database scan of all tweets daily",
                "Kafka + streaming aggregation counting hashtag mentions in a sliding time window, per region",
                "ML model trained on historical data",
              ],
              correct: 2,
              explain: "A streaming job (Storm/Flink) consumes the tweet stream, increments Redis sorted set counters for hashtags in a 1-hour sliding window, partitioned by region. Near real-time with O(1) top-N lookups.",
            },
            {
              question: "If Twitter&apos;s timeline cache (Redis) crashes, what happens?",
              options: [
                "Users see an empty timeline forever",
                "Fan-out resumes immediately from where it left off",
                "The first timeline load is slow (DB query), subsequent loads re-populate the cache",
                "Tweets are permanently lost",
              ],
              correct: 2,
              explain: "Cache-aside pattern: on cache miss, the Timeline Service fetches from the Tweet DB directly (slow), then populates the cache. First visitor pays the price; everyone after hits cache.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
