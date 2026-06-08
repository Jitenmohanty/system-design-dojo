"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Play, UploadCloud, Cpu, HardDrive, Globe, Search, Star, Eye } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { cn } from "@/lib/utils";

// ── Back-of-envelope calculator ──────────────────────────────
function EnvelopeCalc() {
  const [users, setUsers] = useState(2000);
  const activeRatio = 0.1;
  const uploadsPerDayPerActive = 0.001;
  const viewsPerDayPerActive = 5;
  const avgVideoSizeGB = 1;
  const avgVideoSizeMB = avgVideoSizeGB * 1024;

  const dau = Math.round(users * activeRatio);
  const uploadsPerDay = Math.round(dau * uploadsPerDayPerActive);
  const uploadQPS = (uploadsPerDay / 86400).toFixed(2);
  const viewsPerDay = Math.round(dau * viewsPerDayPerActive);
  const readQPS = Math.round(viewsPerDay / 86400);
  const storagePerDayGB = (uploadsPerDay * avgVideoSizeMB * 5) / 1024; // 5 quality variants
  const bwTBperDay = (viewsPerDay * 0.5) / 1024; // avg 500MB stream

  const rows = [
    { label: "Monthly Active Users", value: `${users}M`, color: "var(--neon-blue)" },
    { label: "Daily Active Users (10%)", value: `${dau}M`, color: "var(--neon-blue)" },
    { label: "Uploads / day", value: `${uploadsPerDay.toLocaleString()}`, color: "var(--neon-yellow)" },
    { label: "Upload QPS", value: uploadQPS, color: "var(--neon-yellow)" },
    { label: "Views / day", value: `${(viewsPerDay / 1e6).toFixed(0)}M`, color: "var(--neon-green)" },
    { label: "Read QPS (streams)", value: `${readQPS.toLocaleString()}`, color: "var(--neon-green)" },
    { label: "Storage / day (5 variants)", value: `${storagePerDayGB.toFixed(0)} GB`, color: "var(--neon-purple)" },
    { label: "Bandwidth / day (streaming)", value: `${bwTBperDay.toFixed(1)} TB`, color: "var(--neon-red)" },
  ];

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="mono text-xs text-neon-yellow uppercase tracking-widest">MAU (millions)</span>
        <input
          type="range" min={100} max={5000} step={100} value={users}
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

// ── Transcoding Pipeline Animation ──────────────────────────
const TRANSCODE_STAGES = [
  { id: "raw", label: "Raw Upload", icon: "📁", color: "var(--neon-yellow)" },
  { id: "split", label: "Split into chunks", icon: "✂️", color: "var(--neon-blue)" },
  { id: "encode", label: "Parallel Encode", icon: "⚙️", color: "var(--neon-purple)" },
  { id: "merge", label: "Merge Segments", icon: "🔗", color: "var(--neon-green)" },
  { id: "cdn", label: "Push to CDN", icon: "🌍", color: "var(--neon-red)" },
];

const QUALITY_VARIANTS = ["144p", "360p", "480p", "720p", "1080p", "4K"];

function TranscodingPipeline() {
  const [activeStage, setActiveStage] = useState(-1);
  const [running, setRunning] = useState(false);
  const [activeQualities, setActiveQualities] = useState<string[]>([]);

  const run = () => {
    if (running) return;
    setRunning(true);
    setActiveStage(-1);
    setActiveQualities([]);
    TRANSCODE_STAGES.forEach((_, i) => {
      setTimeout(() => {
        setActiveStage(i);
        if (i === 2) {
          QUALITY_VARIANTS.forEach((q, qi) => {
            setTimeout(() => setActiveQualities((prev) => [...prev, q]), qi * 200);
          });
        }
      }, i * 900);
    });
    setTimeout(() => setRunning(false), TRANSCODE_STAGES.length * 900 + 500);
  };

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display font-semibold text-white">Transcoding Pipeline</span>
        <button onClick={run} disabled={running} className={cn("btn-neon text-xs", running && "opacity-50 cursor-not-allowed")}>
          <Play size={13} /> {running ? "Processing…" : "Upload Video"}
        </button>
      </div>

      {/* Stage flow */}
      <div className="flex items-center gap-1 flex-wrap mb-4">
        {TRANSCODE_STAGES.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            <motion.div
              className="flex flex-col items-center gap-1 rounded-xl border px-3 py-2 min-w-[80px]"
              animate={{
                borderColor: activeStage >= i ? s.color : "var(--border-subtle)",
                background: activeStage === i ? `${s.color}18` : "transparent",
                boxShadow: activeStage === i ? `0 0 16px -4px ${s.color}` : "none",
              }}
              transition={{ duration: 0.4 }}
            >
              <span className="text-xl">{s.icon}</span>
              <span className="mono text-[0.6rem] text-center" style={{ color: activeStage >= i ? s.color : "var(--text-secondary)" }}>{s.label}</span>
            </motion.div>
            {i < TRANSCODE_STAGES.length - 1 && (
              <ChevronRight size={14} className="shrink-0" style={{ color: activeStage > i ? "var(--neon-green)" : "var(--border-subtle)" }} />
            )}
          </div>
        ))}
      </div>

      {/* Quality variants */}
      <AnimatePresence>
        {activeQualities.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-xl bg-bg-tertiary/50 p-3">
              <div className="mono text-[0.6rem] uppercase tracking-widest text-neon-purple mb-2">Encoding quality variants in parallel:</div>
              <div className="flex flex-wrap gap-2">
                {QUALITY_VARIANTS.map((q) => (
                  <AnimatePresence key={q}>
                    {activeQualities.includes(q) && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="chip"
                        style={{ borderColor: "var(--neon-purple)", color: "var(--neon-purple)" }}
                      >
                        {q}
                      </motion.span>
                    )}
                  </AnimatePresence>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Deep dive expandable cards ────────────────────────────────
const COMPONENTS = [
  {
    icon: <UploadCloud size={18} />, title: "Upload Service", color: "var(--neon-yellow)",
    content: "Uses resumable uploads (TUS protocol) chunked at 5MB each. Each chunk is stored in object storage (S3-like) and a manifest tracks progress. Clients can resume after connection drops. Multiple upload workers run in parallel.",
  },
  {
    icon: <Cpu size={18} />, title: "Transcoding Pipeline", color: "var(--neon-purple)",
    content: "Raw video is split into 2-minute segments. A job queue (Kafka) distributes segments to a fleet of transcoding workers. Workers use FFmpeg to encode each segment at 6 quality levels in parallel. Segments are merged and pushed to CDN-compatible object storage.",
  },
  {
    icon: <HardDrive size={18} />, title: "Metadata DB", color: "var(--neon-green)",
    content: "Video metadata (title, uploader, description, tags, timestamps) lives in a relational DB (MySQL/Postgres) behind a read replica layer. A separate NoSQL store (Cassandra) handles high-write telemetry like view counts per video per minute.",
  },
  {
    icon: <Globe size={18} />, title: "CDN Layer", color: "var(--neon-blue)",
    content: "Video segments are stored on edge servers near users. The manifest file (HLS .m3u8) is fetched from the origin; individual .ts segments come from the nearest CDN PoP. Adaptive Bitrate (ABR) streaming switches quality based on bandwidth in real-time.",
  },
  {
    icon: <Search size={18} />, title: "Search & Indexing", color: "var(--neon-orange)",
    content: "A dedicated search cluster (Elasticsearch) indexes video titles, descriptions, and tags. Events published via Kafka trigger async index updates. Typeahead suggestions come from a separate prefix-trie service backed by Redis.",
  },
  {
    icon: <Star size={18} />, title: "Recommendations", color: "var(--neon-red)",
    content: "A two-stage system: candidate generation (collaborative filtering via matrix factorization) narrows 1B videos to ~500 candidates. A ranking model (neural net) scores those 500 by predicted watch time. Results are cached per user with a 1-hour TTL.",
  },
  {
    icon: <Eye size={18} />, title: "View Counter", color: "var(--neon-green)",
    content: "High-write problem: 50K view events/sec. Solution: front-end increments a Redis counter. A background job (every minute) flushes Redis increments to the DB. Eventual consistency is acceptable — slight lag is fine. API reads from the DB, not Redis.",
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
    problem: "Video transcoding is slow — users wait minutes before video is watchable",
    solution: "Prioritize 360p encoding first. Publish the low-quality version within 30s. Higher qualities upload progressively. The video is &ldquo;live&rdquo; immediately at low quality.",
    color: "var(--neon-red)",
  },
  {
    problem: "View counter DB gets hammered — 50K writes/sec directly to MySQL kills it",
    solution: "Redis-based buffering: each view hits Redis INCR (atomic, in-memory). A background job drains the buffer to DB every minute. Burst is absorbed, DB stays happy.",
    color: "var(--neon-yellow)",
  },
  {
    problem: "Search index falls behind — videos aren&apos;t searchable for hours after upload",
    solution: "Async Kafka pipeline: upload events trigger search index updates immediately. Elasticsearch handles eventual consistency gracefully. Typical index lag: under 30 seconds.",
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
              dangerouslySetInnerHTML={{ __html: `✅ <strong>Solution:</strong> ${item.solution}` }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Trade-offs toggle ─────────────────────────────────────────
function TradeoffToggle() {
  const [mode, setMode] = useState<"consistency" | "availability">("availability");
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => setMode("availability")}
          className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition", mode === "availability" ? "bg-neon-green/20 text-neon-green border border-neon-green/40" : "text-ink-secondary")}
        >
          Favor Availability
        </button>
        <span className="text-ink-muted text-sm">vs</span>
        <button
          onClick={() => setMode("consistency")}
          className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition", mode === "consistency" ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/40" : "text-ink-secondary")}
        >
          Favor Consistency
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
          {mode === "availability" ? (
            <>
              <p>✅ <strong className="text-white">View counts may lag by ~60s</strong> — acceptable for YouTube. Users don&apos;t care if a video shows 1.2M vs 1.201M views.</p>
              <p>✅ <strong className="text-white">Eventual consistency in search</strong> — new uploads appear in search within 30s, not immediately.</p>
              <p>✅ <strong className="text-white">CDN stale content OK</strong> — video files are immutable once transcoded; thumbnails have 5-minute TTL.</p>
              <p className="text-neon-green">YouTube chooses availability: the video player must never show a 503, even during DB maintenance.</p>
            </>
          ) : (
            <>
              <p>⚠️ <strong className="text-white">Synchronous view writes</strong> — every view hits the DB directly. High consistency, but bottleneck at scale.</p>
              <p>⚠️ <strong className="text-white">Blocking search indexing</strong> — upload fails if search cluster is down. Consistent, but less resilient.</p>
              <p>⚠️ <strong className="text-white">No CDN stale content</strong> — every request validates with origin. Consistent, but much higher origin load.</p>
              <p className="text-neon-red">Strong consistency costs dearly in throughput and resilience at YouTube&apos;s scale.</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Summary card ───────────────────────────────────────────────
const KEY_DECISIONS = [
  { label: "Upload storage", value: "Chunked → Object Store (S3)", color: "var(--neon-yellow)" },
  { label: "Transcoding", value: "Async job queue (Kafka) + parallel FFmpeg workers", color: "var(--neon-purple)" },
  { label: "Video delivery", value: "HLS/DASH segments via global CDN", color: "var(--neon-blue)" },
  { label: "Metadata", value: "MySQL with read replicas + Cassandra for view counters", color: "var(--neon-green)" },
  { label: "Search", value: "Elasticsearch + async indexing via Kafka", color: "var(--neon-orange)" },
  { label: "Recommendations", value: "Offline ML pipeline, cached results per user", color: "var(--neon-red)" },
  { label: "View counter", value: "Redis buffer → batch flush to DB every 60s", color: "var(--neon-green)" },
];

export default function DesignYouTubePage() {
  return (
    <ConceptPage
      slug="design-youtube"
      analogy={
        <FunnyAnalogy
          emoji="📺"
          color="var(--neon-red)"
          alternates={[
            { emoji: "📮", text: "You mail a package (upload), the post office sorts and routes copies to local depots (CDN edge) so the recipient (viewer) picks it up nearby." },
            { emoji: "🎬", text: "A film studio converts a raw reel into different screening formats (IMAX, standard, streaming), then distributes to cinemas worldwide." },
          ]}
        >
          YouTube is basically a <strong className="text-neon-red">video laundromat at planetary scale</strong>:
          dirty raw footage goes in, multiple clean encoded copies come out,
          and 2 billion people grab the version that fits their bandwidth pipe.
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
                {["Upload videos (large files, resumable)", "Stream videos at multiple quality levels", "Search videos by title/tag", "Like, comment, subscribe", "Recommendations / homepage feed", "View counts in near-real-time"].map((r) => (
                  <motion.li key={r} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-start gap-2">
                    <span className="text-neon-green mt-0.5">▸</span>{r}
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="card p-4">
              <div className="mono mb-2 text-[0.65rem] uppercase tracking-widest text-neon-blue">Non-Functional</div>
              <ul className="space-y-1.5 text-sm text-ink-secondary">
                {["2B MAU, 500 hours of video uploaded per minute", "Highly available — video playback never goes down", "Low-latency streaming (sub-100ms buffer start)", "Eventual consistency on counters is fine", "Durability — no video lost after upload", "Global CDN for < 50ms TTFB on segments"].map((r) => (
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
          <p className="mb-3 text-sm text-ink-secondary">Drag the MAU slider — watch every downstream number cascade:</p>
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
              { id: "client", type: "client", label: "Browser / App", position: { x: 8, y: 50 }, status: "active", info: "Streams HLS video segments directly from CDN. Uploads go to a dedicated Upload Service." },
              { id: "cdn", type: "cdn", label: "Global CDN", position: { x: 28, y: 25 }, status: "active", info: "Edge servers cache video segments (.ts files) near viewers. Cache hit rate > 90%." },
              { id: "apigate", type: "gateway", label: "API Gateway", position: { x: 28, y: 75 }, status: "active", info: "Routes API traffic: auth, rate-limiting, request routing to upstream services." },
              { id: "upload", type: "server", label: "Upload Service", position: { x: 50, y: 85 }, status: "busy", info: "Accepts chunked resumable uploads. Writes raw chunks to object storage (S3). Emits a Kafka event on completion." },
              { id: "transcode", type: "queue", label: "Transcode Queue", position: { x: 72, y: 85 }, status: "busy", info: "Kafka-based job queue. Each upload event spawns 6 parallel encoding tasks (one per quality level)." },
              { id: "workers", type: "server", label: "Encode Workers", position: { x: 88, y: 70 }, status: "busy", info: "Stateless FFmpeg workers. Scale horizontally. Each worker pulls a segment + quality target from the queue." },
              { id: "objstore", type: "database", label: "Object Store", position: { x: 88, y: 40 }, status: "active", info: "S3-compatible storage for raw uploads and encoded segments. Immutable. CDN pulls from here." },
              { id: "metadb", type: "database", label: "Metadata DB", position: { x: 72, y: 20 }, status: "active", info: "MySQL + read replicas for video metadata (title, description, uploader). Cassandra for view counts." },
              { id: "search", type: "server", label: "Search Service", position: { x: 50, y: 10 }, status: "active", info: "Elasticsearch cluster. Async indexing via Kafka. Handles full-text search and typeahead." },
              { id: "rec", type: "server", label: "Recommendation", position: { x: 50, y: 50 }, status: "active", info: "Two-stage: candidate generation (collab filtering) + ranking (neural net). Results cached in Redis per user." },
            ]}
            edges={[
              { from: "client", to: "cdn", animated: true, color: "var(--neon-blue)", label: "stream" },
              { from: "client", to: "apigate", animated: true, color: "var(--neon-blue)" },
              { from: "apigate", to: "upload", animated: true, color: "var(--neon-yellow)" },
              { from: "apigate", to: "search", animated: true, color: "var(--neon-orange)" },
              { from: "apigate", to: "rec", animated: true, color: "var(--neon-red)" },
              { from: "upload", to: "transcode", animated: true, color: "var(--neon-yellow)" },
              { from: "transcode", to: "workers", animated: true, color: "var(--neon-purple)" },
              { from: "workers", to: "objstore" },
              { from: "objstore", to: "cdn", dashed: true, label: "pull" },
              { from: "upload", to: "metadb" },
              { from: "workers", to: "metadb", dashed: true },
              { from: "metadb", to: "search", dashed: true },
              { from: "metadb", to: "rec", dashed: true },
            ]}
          />
        </Section>
      </ScrollReveal>

      {/* 4. Transcoding pipeline deep dive */}
      <ScrollReveal>
        <Section kicker="Step 4a" title="Transcoding Pipeline — Animated">
          <TranscodingPipeline />
        </Section>
      </ScrollReveal>

      {/* 4. Component deep-dives */}
      <ScrollReveal>
        <Section kicker="Step 4b" title="Component Deep Dives">
          <p className="mb-3 text-sm text-ink-secondary">Click each component to expand the design details:</p>
          <div className="space-y-2">
            {COMPONENTS.map((c, i) => <DeepDiveCard key={c.title} comp={c} idx={i} />)}
          </div>
        </Section>
      </ScrollReveal>

      {/* 5. Bottleneck analysis */}
      <ScrollReveal>
        <Section kicker="Step 5" title="Bottleneck Analysis">
          <p className="mb-3 text-sm text-ink-secondary">Every system has failure points. Click to reveal the battle-tested solution:</p>
          <div className="space-y-3">
            {BOTTLENECKS.map((b, i) => <BottleneckCard key={i} item={b} idx={i} />)}
          </div>
        </Section>
      </ScrollReveal>

      {/* 6. Trade-offs */}
      <ScrollReveal>
        <Section kicker="Step 6" title="Trade-offs: Availability vs Consistency">
          <TradeoffToggle />
        </Section>
      </ScrollReveal>

      {/* 7. ComparisonBattle — storage tiers */}
      <ScrollReveal>
        <Section kicker="Storage tiers" title="Hot vs Cold Storage">
          <ComparisonBattle
            left={{ name: "Hot Storage (CDN/SSD)", emoji: "🔥", color: "var(--neon-red)", bestFor: "Trending videos with millions of views — needs sub-50ms segment delivery." }}
            right={{ name: "Cold Storage (S3 Glacier)", emoji: "🧊", color: "var(--neon-blue)", bestFor: "Videos with < 1000 views/month, archival, originals after encoding." }}
            features={[
              { label: "Latency", a: "< 50ms", b: "3–12 hrs", winner: "a" },
              { label: "Cost / GB", a: "$0.085", b: "$0.004", winner: "b" },
              { label: "Availability", a: 99, b: 70, max: 100, unit: "%", winner: "a" },
              { label: "Retrieval speed", a: "Instant", b: "Hours", winner: "a" },
              { label: "Storage cost", a: "High", b: "Very Low", winner: "b" },
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
          slug="design-youtube"
          questions={[
            {
              question: "Why does YouTube transcode videos into multiple quality variants instead of storing one version?",
              options: ["To compress the file size only", "To support Adaptive Bitrate streaming — client switches quality based on bandwidth", "Because different countries have different codecs", "To make the upload faster"],
              correct: 1,
              explain: "ABR streaming lets the player seamlessly switch between 144p and 4K based on the viewer&apos;s network. Without multiple variants, poor connections would just buffer forever.",
            },
            {
              question: "Why use Redis as a view counter buffer instead of writing directly to MySQL?",
              options: ["Redis has better replication", "To batch writes and avoid 50K writes/sec hammering MySQL", "MySQL doesn&apos;t support integers", "View counts don&apos;t need to be stored"],
              correct: 1,
              explain: "Redis INCR is atomic and in-memory — millions of increments per second are fine. Flushing to MySQL every 60s collapses 50K writes into one batch update.",
            },
            {
              question: "What is the role of Kafka in the YouTube transcoding pipeline?",
              options: ["It stores the video files", "It serves as a job queue decoupling the upload service from transcoding workers", "It handles CDN cache invalidation", "It is the search index"],
              correct: 1,
              explain: "Kafka decouples upload completion from transcoding. Workers consume at their own pace, and the queue absorbs traffic spikes without losing events.",
            },
            {
              question: "A video just finished uploading. When does it first become watchable?",
              options: ["Only after all 6 quality variants are ready", "After 360p encoding completes (30 seconds) — other qualities upload progressively", "After CDN propagation (24 hours)", "After manual review"],
              correct: 1,
              explain: "YouTube prioritizes the lowest quality first so the video is live fast. Higher resolutions become available as they finish encoding in the background.",
            },
            {
              question: "Why is eventual consistency acceptable for YouTube view counts but not for bank balances?",
              options: ["It isn&apos;t — YouTube uses strong consistency", "No one sues YouTube for showing 1.2M instead of 1.201M views", "CDN latency makes consistency impossible", "YouTube uses blockchain"],
              correct: 1,
              explain: "View counts are informational — a 60-second lag is imperceptible and harmless. Bank balances have financial and legal consequences if wrong, so they need strong consistency.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
