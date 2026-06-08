"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Hash, Database, ArrowRight, RefreshCw, ExternalLink, CheckCircle, AlertTriangle } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";

// ─── Animated back-of-envelope calculator ───────────────────────────────────
function EstimationCalculator() {
  const [step, setStep] = useState(0);

  const steps = [
    { label: "Daily active URLs created", value: "100M / day", detail: "100 million new short URLs per day", color: "var(--neon-blue)" },
    { label: "Write QPS", value: "~1,157 / s", detail: "100M ÷ 86,400s = ~1,157 writes/sec", color: "var(--neon-green)" },
    { label: "Read:Write ratio", value: "100 : 1", detail: "URL redirects vastly outnumber creations", color: "var(--neon-yellow)" },
    { label: "Read QPS", value: "~115,700 / s", detail: "1,157 × 100 = ~115,700 reads/sec", color: "var(--neon-purple)" },
    { label: "Avg URL size", value: "~500 bytes", detail: "Long URL + metadata + indexes", color: "var(--neon-orange)" },
    { label: "5-year storage", value: "~183 TB", detail: "100M/day × 365 × 5 × 500B ≈ 91B records × 500B", color: "var(--neon-red)" },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-bg-tertiary/40 px-4 py-3">
        <span className="mono text-xs font-semibold uppercase tracking-[0.25em] text-neon-blue">Back-of-Envelope Calculator</span>
        <button onClick={() => setStep(0)} className="btn-ghost px-2 py-1 text-xs">
          <RefreshCw size={12} /> Reset
        </button>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: i <= step ? 1 : 0.2, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-bg-secondary/50 p-3"
              style={i <= step ? { borderColor: `${s.color}40` } : {}}
            >
              <span className="mono w-5 text-center text-xs text-ink-muted">{i + 1}</span>
              <div className="flex-1">
                <div className="text-xs text-ink-secondary">{s.label}</div>
                <div className="text-xs text-ink-muted">{s.detail}</div>
              </div>
              <AnimatePresence>
                {i <= step && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mono rounded-lg px-2 py-1 text-xs font-bold"
                    style={{ color: s.color, background: `${s.color}15` }}
                  >
                    {s.value}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        {step < steps.length - 1 ? (
          <button onClick={() => setStep((s) => s + 1)} className="btn-neon mt-4 w-full justify-center text-sm">
            Next calculation →
          </button>
        ) : (
          <div className="mt-4 rounded-xl border border-neon-green/30 bg-neon-green/10 p-3 text-center text-sm text-neon-green">
            ✅ Estimation complete — we need ~183 TB over 5 years and ~115K read QPS
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Base62 hash animation ───────────────────────────────────────────────────
const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function toBase62(n: number): string {
  if (n === 0) return "0";
  let result = "";
  while (n > 0) {
    result = BASE62[n % 62] + result;
    n = Math.floor(n / 62);
  }
  return result;
}

type HashPhase = "idle" | "hashing" | "collision-check" | "storing" | "done";

function URLHashDemo() {
  const [url, setUrl] = useState("https://www.example.com/very-long-path/that-nobody-wants-to-type");
  const [phase, setPhase] = useState<HashPhase>("idle");
  const [hashValue, setHashValue] = useState<string>("");
  const [shortCode, setShortCode] = useState<string>("");
  const [collisionDetected, setCollisionDetected] = useState(false);
  const [redirectPhase, setRedirectPhase] = useState<"idle" | "resolving" | "done">("idle");

  const runHash = () => {
    if (!url.trim()) return;
    setPhase("hashing");
    setCollisionDetected(false);
    setRedirectPhase("idle");

    // Simulate MD5-like hash then base62 encode first 7 chars
    let h = 0;
    for (let i = 0; i < url.length; i++) {
      h = (Math.imul(31, h) + url.charCodeAt(i)) | 0;
    }
    const absH = Math.abs(h);
    const b62 = toBase62(absH).slice(0, 7).padStart(7, "0");
    setHashValue(b62);

    setTimeout(() => setPhase("collision-check"), 900);
    setTimeout(() => {
      // 20% chance of simulated collision for demo
      const collision = url.length % 5 === 0;
      setCollisionDetected(collision);
      if (collision) {
        // regenerate with +1
        setHashValue(toBase62(absH + 1).slice(0, 7).padStart(7, "0"));
      }
      setPhase("storing");
    }, 1800);
    setTimeout(() => {
      setShortCode(b62);
      setPhase("done");
    }, 2700);
  };

  const simulateRedirect = () => {
    setRedirectPhase("resolving");
    setTimeout(() => setRedirectPhase("done"), 1200);
  };

  const PHASE_LABELS: Record<HashPhase, string> = {
    idle: "Waiting for URL…",
    hashing: "Computing MD5 → Base62 encoding…",
    "collision-check": "Checking DB for collision…",
    storing: "Writing to database…",
    done: "Short URL ready!",
  };

  return (
    <div className="card overflow-hidden">
      {/* URL input */}
      <div className="border-b border-[var(--border-subtle)] bg-bg-tertiary/40 p-4">
        <div className="flex gap-2">
          <input
            value={url}
            onChange={(e) => { setUrl(e.target.value); setPhase("idle"); setRedirectPhase("idle"); }}
            className="field flex-1 mono text-xs"
            placeholder="https://example.com/your-long-url"
          />
          <button onClick={runHash} disabled={phase !== "idle" && phase !== "done"} className="btn-neon px-4 py-2 text-sm">
            <Hash size={14} /> Shorten
          </button>
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="p-4">
        <div className="flex items-start gap-2 overflow-x-auto pb-2">
          {(["hashing", "collision-check", "storing", "done"] as HashPhase[]).map((p, i) => {
            const reached = phase === p || (phase === "done" && i < 4);
            const labels = ["Hash Function", "Collision Check", "Store in DB", "Return URL"];
            const icons = ["🔐", collisionDetected ? "⚠️" : "✅", "💾", "🔗"];
            const colors = ["var(--neon-blue)", collisionDetected ? "var(--neon-yellow)" : "var(--neon-green)", "var(--neon-purple)", "var(--neon-green)"];
            const isActive = phase === p;
            return (
              <div key={p} className="flex items-center gap-2 shrink-0">
                <motion.div
                  className="flex flex-col items-center gap-1"
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.6, repeat: isActive ? Infinity : 0 }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl border-2 text-xl"
                    style={{
                      borderColor: reached ? colors[i] : "var(--border-subtle)",
                      background: reached ? `${colors[i]}15` : "var(--bg-tertiary)",
                    }}
                  >
                    {icons[i]}
                  </div>
                  <span className="mono text-center text-[0.6rem] text-ink-muted">{labels[i]}</span>
                </motion.div>
                {i < 3 && (
                  <ArrowRight size={16} className="shrink-0 mt-[-20px]" style={{ color: reached ? colors[i] : "var(--border-subtle)" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Status banner */}
        <div className="mt-3 rounded-lg bg-bg-tertiary/60 px-4 py-2 mono text-xs" style={{ color: phase === "done" ? "var(--neon-green)" : "var(--neon-blue)" }}>
          {PHASE_LABELS[phase]}
        </div>

        {/* Hash value display */}
        <AnimatePresence>
          {hashValue && phase !== "idle" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 overflow-hidden rounded-xl border border-neon-blue/30 bg-bg-secondary/50 p-3"
            >
              <div className="mono text-[0.65rem] text-ink-muted">MD5 → Base62 (first 7 chars)</div>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className="mono text-xs text-ink-secondary break-all">{url.slice(0, 30)}…</span>
                <ArrowRight size={14} className="text-neon-blue shrink-0" />
                <span className="mono text-base font-bold tracking-widest text-neon-blue">{hashValue}</span>
              </div>
              {collisionDetected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 flex items-center gap-1.5 text-xs text-neon-yellow"
                >
                  <AlertTriangle size={12} /> Collision detected! Regenerated with offset +1
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Short URL result + redirect demo */}
        <AnimatePresence>
          {phase === "done" && shortCode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 space-y-3"
            >
              <div className="flex items-center gap-3 rounded-xl border border-neon-green/40 bg-neon-green/10 p-3">
                <CheckCircle size={16} className="text-neon-green shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="mono text-[0.65rem] text-ink-muted">Short URL</div>
                  <div className="mono text-sm font-bold text-neon-green">dojo.ly/{shortCode}</div>
                </div>
                <button onClick={simulateRedirect} disabled={redirectPhase !== "idle"} className="btn-ghost px-3 py-1.5 text-xs shrink-0">
                  <ExternalLink size={12} /> Click it
                </button>
              </div>

              <AnimatePresence>
                {redirectPhase !== "idle" && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl border border-[var(--border-subtle)] bg-bg-tertiary/60 p-3 text-xs space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${redirectPhase === "resolving" ? "animate-pulse bg-neon-yellow" : "bg-neon-green"}`} />
                      <span className="mono text-ink-secondary">Browser → dojo.ly/{shortCode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${redirectPhase === "resolving" ? "animate-pulse bg-neon-yellow" : "bg-neon-green"}`} />
                      <span className="mono text-ink-secondary">Cache lookup (Redis)… hit!</span>
                    </div>
                    {redirectPhase === "done" && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-neon-green" />
                        <span className="mono text-neon-green">301 Redirect → {url.slice(0, 40)}…</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Requirements list ───────────────────────────────────────────────────────
function RequirementsList() {
  const [expanded, setExpanded] = useState<number[]>([]);
  const toggle = (i: number) => setExpanded((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);

  const reqs = [
    {
      type: "Functional",
      color: "var(--neon-blue)",
      items: [
        { title: "Shorten a long URL to a 7-char code", detail: "POST /shorten → returns short URL. Codes must be unique." },
        { title: "Redirect short URL to original", detail: "GET /{code} → 301 (cacheable) or 302 (analytics-friendly) redirect." },
        { title: "Custom aliases (optional)", detail: "Users can pick vanity slugs like dojo.ly/my-link if available." },
        { title: "URL expiration (optional)", detail: "TTL on links; expired links return 410 Gone." },
      ],
    },
    {
      type: "Non-Functional",
      color: "var(--neon-purple)",
      items: [
        { title: "High availability (99.99%)", detail: "Redirects must work even if write path is degraded." },
        { title: "Low latency redirects (<10ms p99)", detail: "Users should never notice the hop. Cache is key." },
        { title: "Scale to 100M URLs/day writes", detail: "~1,157 writes/sec burst; read QPS 100× higher." },
        { title: "No collisions", detail: "Two long URLs must never map to the same short code." },
      ],
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {reqs.map((group, gi) => (
        <div key={group.type} className="card p-4">
          <div className="mono mb-3 text-[0.65rem] uppercase tracking-[0.25em]" style={{ color: group.color }}>
            {group.type} Requirements
          </div>
          <div className="space-y-2">
            {group.items.map((item, ii) => {
              const key = gi * 10 + ii;
              const open = expanded.includes(key);
              return (
                <div key={ii}>
                  <button
                    onClick={() => toggle(key)}
                    className="flex w-full items-start gap-2 text-left text-sm hover:text-white transition"
                  >
                    <span className="mt-0.5 shrink-0 text-base">{open ? "▾" : "▸"}</span>
                    <span className={open ? "text-white" : "text-ink-secondary"}>{item.title}</span>
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="ml-5 mt-1 text-xs text-ink-muted">{item.detail}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Bottleneck reveal ───────────────────────────────────────────────────────
function BottleneckAnalysis() {
  const [revealed, setRevealed] = useState<number[]>([]);
  const toggle = (i: number) => setRevealed((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);

  const items = [
    {
      problem: "DB read hotspot — same popular short URLs hit DB on every redirect",
      emoji: "🔥",
      solution: "Add a Redis cache in front of the DB. 301 redirects are cached by browsers too — set Cache-Control: max-age on them.",
    },
    {
      problem: "Hash collisions — two URLs map to the same 7-char code",
      emoji: "💥",
      solution: "Check for collision on write; if found, apply +1 offset or append a random suffix and retry (max 3 attempts). Use UUID-based ID → Base62 to guarantee global uniqueness.",
    },
    {
      problem: "Single-point write bottleneck — one DB can&apos;t handle 1,157 writes/sec at scale",
      emoji: "🐌",
      solution: "Shard the URL table by short code hash. Use an ID generation service (Snowflake/Sonyflake) to guarantee uniqueness across shards without coordination.",
    },
    {
      problem: "Analytics overhead — counting every redirect slows the hot path",
      emoji: "📊",
      solution: "Fire-and-forget analytics to a Kafka topic. The redirect service writes to a log stream; a separate consumer aggregates click counts asynchronously.",
    },
  ];

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="card overflow-hidden">
          <button
            onClick={() => toggle(i)}
            className="flex w-full items-start gap-3 p-4 text-left hover:bg-neon-red/5 transition"
          >
            <span className="text-xl shrink-0">{item.emoji}</span>
            <div className="flex-1 text-sm text-ink-secondary">{item.problem}</div>
            <span className="mono text-[0.65rem] text-neon-red shrink-0">{revealed.includes(i) ? "Hide fix ↑" : "Show fix →"}</span>
          </button>
          <AnimatePresence>
            {revealed.includes(i) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-neon-green/20"
              >
                <div className="bg-neon-green/5 p-4 text-sm text-ink-secondary">
                  <span className="text-neon-green font-semibold">Fix: </span>
                  {item.solution}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ─── Trade-offs toggle ───────────────────────────────────────────────────────
function TradeoffToggle() {
  const [mode, setMode] = useState<"301" | "302">("301");
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-sm text-ink-secondary font-semibold">Redirect type:</span>
        <div className="flex gap-2">
          {(["301", "302"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="rounded-lg px-3 py-1.5 mono text-sm font-bold transition"
              style={{
                background: mode === m ? (m === "301" ? "var(--neon-green)" : "var(--neon-orange)") + "20" : "transparent",
                color: mode === m ? (m === "301" ? "var(--neon-green)" : "var(--neon-orange)") : "var(--text-secondary)",
                border: `1px solid ${mode === m ? (m === "301" ? "var(--neon-green)" : "var(--neon-orange)") : "var(--border-subtle)"}`,
              }}
            >
              {m} Permanent
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-2 text-sm text-ink-secondary"
        >
          {mode === "301" ? (
            <>
              <p><span className="text-neon-green">✓ Browser caches the redirect</span> — subsequent clicks skip your servers entirely.</p>
              <p><span className="text-neon-green">✓ Lower server load at scale</span> — popular links get free CDN-level caching.</p>
              <p><span className="text-neon-red">✗ You can&apos;t update or expire the redirect</span> — browser has already cached it forever.</p>
              <p><span className="text-neon-red">✗ Click analytics are unreliable</span> — cached redirects never hit your servers.</p>
              <p className="text-ink-muted text-xs">Use when: links are permanent, analytics not required.</p>
            </>
          ) : (
            <>
              <p><span className="text-neon-green">✓ Every click hits your servers</span> — perfect for click-counting analytics.</p>
              <p><span className="text-neon-green">✓ Redirect destination is updatable</span> — change the long URL without breaking the short one.</p>
              <p><span className="text-neon-red">✗ Higher latency on every click</span> — no browser caching of the redirect.</p>
              <p><span className="text-neon-red">✗ Higher server load</span> — every redirect is a real request.</p>
              <p className="text-ink-muted text-xs">Use when: analytics matter, or links need to be mutable.</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DesignURLShortenerPage() {
  return (
    <ConceptPage
      slug="design-url-shortener"
      analogy={
        <FunnyAnalogy
          emoji="✂️"
          color="var(--neon-blue)"
          alternates={[
            { emoji: "📬", text: "Like a PO box: people send mail to a short address, the postal service knows the real location." },
            { emoji: "🏷️", text: "A price tag barcode — tiny scannable code that maps to a full product record in a DB." },
          ]}
        >
          A URL shortener is a <strong className="text-neon-blue">fancy redirect service</strong> with a dictionary: short code → long URL.
          It&apos;s the &ldquo;Hello World&rdquo; of system design interviews — deceptively simple, with surprising depth in scale, collisions, and caching.
        </FunnyAnalogy>
      }
    >
      {/* 1 Requirements */}
      <ScrollReveal>
        <Section kicker="Step 1" title="Requirements">
          <p className="mb-4 text-ink-secondary text-sm">Before writing a single line of architecture, nail down what the system must and must not do. Expand each item.</p>
          <RequirementsList />
        </Section>
      </ScrollReveal>

      {/* 2 Estimation */}
      <ScrollReveal>
        <Section kicker="Step 2" title="Back-of-envelope estimation">
          <p className="mb-4 text-ink-secondary text-sm">
            Every interviewer loves seeing you compute. Walk through each row — QPS drives server count, storage drives DB choice.
          </p>
          <EstimationCalculator />
        </Section>
      </ScrollReveal>

      {/* 3 Architecture */}
      <ScrollReveal>
        <Section kicker="Step 3" title="High-level architecture">
          <p className="mb-4 text-ink-secondary text-sm">
            Write path (rare) and read path (very hot) are designed separately. Click any node for details.
          </p>
          <AnimatedDiagram
            height={400}
            nodes={[
              { id: "client", type: "client", label: "Browser / App", position: { x: 8, y: 50 }, status: "active", info: "Makes POST /shorten and GET /{code} requests." },
              { id: "lb", type: "loadbalancer", label: "Load Balancer", position: { x: 24, y: 50 }, status: "active", info: "Distributes traffic. Read & write paths diverge here." },
              { id: "write-svc", type: "server", label: "Write Service", position: { x: 44, y: 22 }, status: "busy", info: "Validates URL, generates short code, checks collision, stores in DB." },
              { id: "read-svc", type: "server", label: "Read Service", position: { x: 44, y: 72 }, status: "busy", info: "Looks up short code → issues redirect. Hits cache first." },
              { id: "cache", type: "cache", label: "Redis Cache", position: { x: 66, y: 72 }, status: "active", info: "Caches code→URL mappings. O(1) lookup. Alleviates ~95% of DB reads." },
              { id: "db-primary", type: "database", label: "Primary DB", position: { x: 66, y: 22 }, status: "active", info: "MySQL/PostgreSQL. Receives all writes. ~1,157 writes/sec." },
              { id: "db-replica", type: "database", label: "DB Replica", position: { x: 84, y: 50 }, status: "idle", info: "Read replica for consistency. Cache misses fall through here." },
              { id: "analytics", type: "queue", label: "Analytics Queue", position: { x: 84, y: 78 }, status: "idle", info: "Kafka topic: fire-and-forget click events. Async consumers tally stats." },
            ]}
            edges={[
              { from: "client", to: "lb", animated: true },
              { from: "lb", to: "write-svc", animated: true, color: "var(--neon-green)" },
              { from: "lb", to: "read-svc", animated: true, color: "var(--neon-blue)" },
              { from: "write-svc", to: "db-primary", animated: true, color: "var(--neon-green)" },
              { from: "read-svc", to: "cache", animated: true, color: "var(--neon-yellow)" },
              { from: "cache", to: "db-replica", dashed: true, color: "var(--neon-yellow)", label: "miss" },
              { from: "db-primary", to: "db-replica", dashed: true, label: "replicate" },
              { from: "read-svc", to: "analytics", dashed: true, color: "var(--neon-orange)" },
            ]}
          />
          <p className="mt-3 text-xs text-ink-muted">Tip: The read path (bottom) is completely decoupled from writes — cache absorbs ~95% of traffic so DB replicas handle the rest.</p>
        </Section>
      </ScrollReveal>

      {/* 4 Interactive demo */}
      <ScrollReveal>
        <Section kicker="Step 4 — Try it" title="Watch a URL get shortened">
          <p className="mb-4 text-ink-secondary text-sm">
            Enter any URL and watch it travel through the pipeline: MD5 hash → Base62 encode → collision check → store → short URL → redirect.
          </p>
          <URLHashDemo />
        </Section>
      </ScrollReveal>

      {/* 5 Deep dives */}
      <ScrollReveal>
        <Section kicker="Step 5" title="Deep dive: ID generation strategies">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { name: "MD5 + Base62 trim", desc: "Hash URL, take first 7 chars. Simple but collisions increase as corpus grows (birthday problem).", color: "var(--neon-blue)", pros: "Deterministic — same URL gives same code.", cons: "Collision handling required." },
              { name: "Auto-increment ID → Base62", desc: "DB auto-increments a row ID; convert that integer to Base62. Clean but ID reveals insert order.", color: "var(--neon-green)", pros: "Zero collisions, predictable code length.", cons: "Single point of failure for ID generation." },
              { name: "Snowflake / Sonyflake", desc: "Distributed 64-bit ID: timestamp + datacenter ID + machine ID + sequence. Safe for multiple write nodes.", color: "var(--neon-purple)", pros: "Globally unique, no coordination, sortable.", cons: "Slightly more complex setup; requires clock sync." },
            ].map((s) => (
              <div key={s.name} className="card p-4">
                <div className="font-display font-semibold text-sm mb-1" style={{ color: s.color }}>{s.name}</div>
                <p className="text-xs text-ink-secondary mb-2">{s.desc}</p>
                <div className="text-xs text-neon-green">✓ {s.pros}</div>
                <div className="text-xs text-neon-red">✗ {s.cons}</div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      {/* 6 Bottlenecks */}
      <ScrollReveal>
        <Section kicker="Step 6" title="Bottleneck analysis">
          <p className="mb-4 text-ink-secondary text-sm">Click each bottleneck to reveal the solution — this is exactly how you should think aloud in an interview.</p>
          <BottleneckAnalysis />
        </Section>
      </ScrollReveal>

      {/* 7 Trade-offs */}
      <ScrollReveal>
        <Section kicker="Step 7" title="Trade-offs: 301 vs 302 redirects">
          <p className="mb-4 text-ink-secondary text-sm">This is the classic interview follow-up. Toggle between the two and understand when each wins.</p>
          <TradeoffToggle />
        </Section>
      </ScrollReveal>

      {/* Comparison */}
      <ScrollReveal>
        <Section kicker="Hashing approaches" title="MD5 truncation vs auto-increment ID">
          <ComparisonBattle
            left={{ name: "MD5 + Base62", emoji: "#️⃣", color: "var(--neon-blue)", bestFor: "Idempotent shortening — the same URL always produces the same code without extra state." }}
            right={{ name: "Auto-increment ID", emoji: "🔢", color: "var(--neon-green)", bestFor: "Guaranteed uniqueness with zero collision handling. Simpler code path." }}
            features={[
              { label: "Uniqueness", a: "Probabilistic", b: "Guaranteed", winner: "b" },
              { label: "Collision risk", a: "Yes", b: "None", winner: "b" },
              { label: "Idempotent", a: "Yes", b: "No", winner: "a" },
              { label: "Reveals order", a: "No", b: "Yes", winner: "a" },
              { label: "Distributed", a: 9, b: 4, max: 10, winner: "a" },
            ]}
          />
        </Section>
      </ScrollReveal>

      {/* 8 Summary */}
      <ScrollReveal>
        <Section kicker="Key decisions" title="Summary card">
          <div className="card p-5 space-y-2 text-sm">
            {[
              ["Short code generation", "Snowflake ID → Base62, 7 chars. Globally unique, no coordination."],
              ["Storage", "Sharded MySQL by code hash; Redis cache in front for reads."],
              ["Redirect", "302 if analytics needed, 301 if pure performance."],
              ["Read path", "Redis (O(1) → 95% hit rate) → DB replica → Primary."],
              ["Analytics", "Async Kafka: redirect service fires events, consumers aggregate."],
              ["Availability", "Read service is stateless → deploy multi-region behind Anycast."],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3 border-b border-[var(--border-subtle)] pb-2 last:border-0 last:pb-0">
                <span className="text-neon-blue font-semibold shrink-0">{k}:</span>
                <span className="text-ink-secondary">{v}</span>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      {/* Quiz */}
      <ScrollReveal>
        <InteractiveQuiz
          slug="design-url-shortener"
          questions={[
            {
              question: "Why is a 302 redirect preferred when you need accurate click analytics?",
              options: [
                "It&apos;s faster than 301",
                "Browsers don&apos;t cache 302, so every click reaches your server",
                "302 uses less bandwidth",
                "It supports HTTPS better",
              ],
              correct: 1,
              explain: "301 gets cached by the browser — subsequent clicks never reach your servers. 302 is temporary so the browser always re-fetches, letting you count every redirect.",
            },
            {
              question: "What is the main purpose of the Redis cache in the read path?",
              options: [
                "To store new short URLs",
                "To handle user authentication",
                "To absorb the vast majority of redirect lookups and avoid DB reads",
                "To generate new short codes",
              ],
              correct: 2,
              explain: "With a ~100:1 read/write ratio, caching popular codes in Redis absorbs ~95% of traffic so your DB only handles cold lookups.",
            },
            {
              question: "Which ID generation strategy prevents collisions in a distributed write cluster?",
              options: ["MD5 + truncation", "UUID v4", "Snowflake (timestamp + machine ID + sequence)", "Random Base62"],
              correct: 2,
              explain: "Snowflake-style IDs encode time, machine, and sequence — guaranteed uniqueness across nodes without central coordination.",
            },
            {
              question: "What is the 'birthday problem' risk in MD5 + truncation?",
              options: [
                "Two different URLs produce the same short code",
                "The hash takes too long to compute",
                "URLs longer than 256 chars fail",
                "MD5 is too slow for high QPS",
              ],
              correct: 0,
              explain: "As the corpus grows, the probability of a hash collision (two URLs mapping to the same 7-char prefix) increases — you need explicit collision-detection and retry logic.",
            },
            {
              question: "Why should analytics writes go to a Kafka queue rather than the same DB as URL mappings?",
              options: [
                "Kafka is cheaper than a database",
                "Analytics DB needs NoSQL",
                "Decoupling analytics prevents spiky click traffic from impacting redirect latency",
                "The DB can&apos;t store time-series data",
              ],
              correct: 2,
              explain: "The redirect hot path must be low-latency. Synchronous analytics writes would add latency and compete for DB resources. Fire-and-forget to Kafka keeps the read path fast.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
