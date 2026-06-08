"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Zap, Shield, AlertTriangle } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { cn } from "@/lib/utils";

// ── Back-of-envelope calculator ───────────────────────────────
function EnvelopeCalc() {
  const [nodes, setNodes] = useState(10);
  const [rps, setRps] = useState(100000);
  const rpsPerNode = Math.round(rps / nodes);
  const redisOpsPerReq = 2; // INCR + EXPIRE or GET
  const redisQPS = rps * redisOpsPerReq;
  const raceWindowMs = 5;
  const raceProb = (rps * raceWindowMs) / (1000 * nodes * nodes);
  const storageKBperUser = 0.1;

  const rows = [
    { label: "API nodes", value: `${nodes}`, color: "var(--neon-blue)" },
    { label: "Total RPS", value: `${(rps / 1000).toFixed(0)}K`, color: "var(--neon-blue)" },
    { label: "RPS per node", value: `${(rpsPerNode / 1000).toFixed(1)}K`, color: "var(--neon-yellow)" },
    { label: "Redis ops / sec", value: `${(redisQPS / 1000).toFixed(0)}K`, color: "var(--neon-green)" },
    { label: "Race condition probability", value: `${Math.min(100, raceProb * 100).toFixed(1)}%`, color: raceProb > 0.01 ? "var(--neon-red)" : "var(--neon-green)" },
    { label: "Storage per user (counters)", value: `${storageKBperUser * 1024} bytes`, color: "var(--neon-purple)" },
    { label: "Redis RAM (1M users)", value: "~100 MB", color: "var(--neon-orange)" },
    { label: "Latency overhead", value: "< 1ms (Redis pipeline)", color: "var(--neon-green)" },
  ];

  return (
    <div className="card p-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <span className="mono text-xs text-neon-blue uppercase tracking-widest w-16 shrink-0">Nodes</span>
          <input type="range" min={1} max={50} value={nodes} onChange={(e) => setNodes(Number(e.target.value))} className="flex-1 accent-blue-400" />
          <span className="mono text-neon-blue font-bold w-8 text-right">{nodes}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="mono text-xs text-neon-yellow uppercase tracking-widest w-16 shrink-0">RPS</span>
          <input type="range" min={1000} max={1000000} step={1000} value={rps} onChange={(e) => setRps(Number(e.target.value))} className="flex-1 accent-yellow-400" />
          <span className="mono text-neon-yellow font-bold w-12 text-right">{(rps / 1000).toFixed(0)}K</span>
        </div>
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

// ── Race condition vs atomic fix animation ────────────────────
type RaceMode = "race" | "atomic";

function RaceConditionDemo() {
  const [mode, setMode] = useState<RaceMode>("race");
  const [animating, setAnimating] = useState(false);
  const [nodeA, setNodeA] = useState({ counter: 0, allowed: false, requesting: false });
  const [nodeB, setNodeB] = useState({ counter: 0, allowed: false, requesting: false });
  const [redisCounter, setRedisCounter] = useState(0);
  const [limit] = useState(5);
  const [outcome, setOutcome] = useState<"ok" | "race-bug" | "atomic-fix" | null>(null);
  const animRef = useRef(false);

  const reset = () => {
    setNodeA({ counter: 0, allowed: false, requesting: false });
    setNodeB({ counter: 0, allowed: false, requesting: false });
    setRedisCounter(0);
    setOutcome(null);
    animRef.current = false;
  };

  const run = useCallback(() => {
    if (animRef.current) return;
    animRef.current = true;
    setAnimating(true);
    reset();

    if (mode === "race") {
      // Both nodes read 4 simultaneously → both think they can go → both write 5 → actual = 6 (bug)
      setTimeout(() => setRedisCounter(4), 200); // pre-seed at limit-1
      setTimeout(() => {
        setNodeA((n) => ({ ...n, requesting: true }));
        setNodeB((n) => ({ ...n, requesting: true }));
      }, 600);
      setTimeout(() => {
        setNodeA((n) => ({ ...n, counter: 4 })); // both read 4
        setNodeB((n) => ({ ...n, counter: 4 }));
      }, 1200);
      setTimeout(() => {
        setNodeA((n) => ({ ...n, counter: 4, allowed: true })); // both allow (4 < 5)
        setNodeB((n) => ({ ...n, counter: 4, allowed: true }));
      }, 1800);
      setTimeout(() => {
        setRedisCounter(6); // both increment independently: 4+1=5, 4+1=5 → non-atomic → 6
        setOutcome("race-bug");
        setAnimating(false);
        animRef.current = false;
      }, 2600);
    } else {
      // Atomic INCR: node A gets 5 (allowed), node B gets 6 (rejected)
      setTimeout(() => setRedisCounter(4), 200);
      setTimeout(() => {
        setNodeA((n) => ({ ...n, requesting: true }));
        setNodeB((n) => ({ ...n, requesting: true }));
      }, 600);
      setTimeout(() => {
        setRedisCounter(5);
        setNodeA((n) => ({ ...n, counter: 5, allowed: true })); // first INCR → 5 → allowed
      }, 1200);
      setTimeout(() => {
        setRedisCounter(6);
        setNodeB((n) => ({ ...n, counter: 6, allowed: false })); // second INCR → 6 → rejected
        setOutcome("atomic-fix");
        setAnimating(false);
        animRef.current = false;
      }, 2000);
    }
  }, [mode]);

  return (
    <div className="card p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => { setMode("race"); reset(); }}
          className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold border transition", mode === "race" ? "border-neon-red/50 bg-neon-red/10 text-neon-red" : "border-[var(--border-subtle)] text-ink-secondary")}
        >
          ⚠️ Race Condition
        </button>
        <button
          onClick={() => { setMode("atomic"); reset(); }}
          className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold border transition", mode === "atomic" ? "border-neon-green/50 bg-neon-green/10 text-neon-green" : "border-[var(--border-subtle)] text-ink-secondary")}
        >
          ✅ Atomic Fix (Redis INCR)
        </button>
      </div>

      {/* Visualization */}
      <div className="grid grid-cols-3 gap-3 items-center">
        {/* Node A */}
        <div className="space-y-2">
          <div className={cn("rounded-xl border-2 p-3 text-center transition", nodeA.requesting ? "border-neon-blue" : "border-[var(--border-subtle)]")}>
            <div className="mono text-xs text-neon-blue mb-1">Node A</div>
            <div className="text-2xl">🖥️</div>
            {nodeA.requesting && (
              <div className="mt-1 mono text-[0.6rem]" style={{ color: nodeA.allowed ? "var(--neon-green)" : "var(--neon-red)" }}>
                counter = {nodeA.counter}
                {nodeA.allowed !== undefined && nodeA.counter > 0 && (
                  <div>{nodeA.allowed ? "✅ ALLOW" : "🚫 BLOCK"}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Redis */}
        <div className="space-y-2 text-center">
          <div className={cn("rounded-xl border-2 p-3 transition", redisCounter > limit ? "border-neon-red" : "border-neon-yellow")}>
            <div className="mono text-xs text-neon-yellow mb-1">Redis Counter</div>
            <div className="text-2xl">⚡</div>
            <motion.div
              key={redisCounter}
              initial={{ scale: 1.4, color: "var(--neon-yellow)" }}
              animate={{ scale: 1 }}
              className="font-display text-2xl font-bold"
              style={{ color: redisCounter > limit ? "var(--neon-red)" : "var(--neon-green)" }}
            >
              {redisCounter}
            </motion.div>
            <div className="mono text-[0.6rem] text-ink-muted">limit = {limit}</div>
          </div>
          <div className="mono text-[0.55rem] text-ink-muted">
            {mode === "race" ? "Non-atomic GET + SET" : "Atomic INCR"}
          </div>
        </div>

        {/* Node B */}
        <div className="space-y-2">
          <div className={cn("rounded-xl border-2 p-3 text-center transition", nodeB.requesting ? "border-neon-purple" : "border-[var(--border-subtle)]")}>
            <div className="mono text-xs text-neon-purple mb-1">Node B</div>
            <div className="text-2xl">🖥️</div>
            {nodeB.requesting && (
              <div className="mt-1 mono text-[0.6rem]" style={{ color: nodeB.allowed ? "var(--neon-green)" : "var(--neon-red)" }}>
                counter = {nodeB.counter}
                {nodeB.allowed !== undefined && nodeB.counter > 0 && (
                  <div>{nodeB.allowed ? "✅ ALLOW" : "🚫 BLOCK"}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Outcome */}
      <AnimatePresence>
        {outcome && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn("rounded-xl border p-4 text-sm", outcome === "race-bug" ? "border-neon-red/50 bg-neon-red/10" : "border-neon-green/50 bg-neon-green/10")}
          >
            {outcome === "race-bug" ? (
              <>
                <div className="font-bold text-neon-red mb-1">🐛 Race Condition Bug!</div>
                <p className="text-ink-secondary">Both nodes read counter = 4 (below limit). Both allowed the request. Both incremented independently. Redis now shows {redisCounter}, but the limit is {limit}. <strong className="text-white">One request slipped through at {redisCounter}!</strong></p>
                <p className="mt-2 text-neon-red font-semibold">This is the distributed rate limiter race condition. Two nodes, one window, double trouble.</p>
              </>
            ) : (
              <>
                <div className="font-bold text-neon-green mb-1">✅ Atomic Fix Works!</div>
                <p className="text-ink-secondary">Node A&apos;s INCR returned 5 → allowed (≤ limit). Node B&apos;s INCR returned 6 → blocked (&gt; limit). Redis INCR is atomic — no two nodes can get the same incremented value. <strong className="text-white">Exactly one request allowed at the boundary.</strong></p>
                <p className="mt-2 text-neon-green font-semibold">INCR returns the new value atomically. If new value ≤ limit → allow. Else → reject. Simple and correct.</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={run}
        disabled={animating}
        className={cn("btn-neon text-xs w-full justify-center", animating && "opacity-50 cursor-not-allowed")}
      >
        {animating ? "Simulating…" : "▶ Run Simulation"}
      </button>
    </div>
  );
}

// ── Algorithm selector ────────────────────────────────────────
type AlgoTab = "token" | "sliding" | "fixed" | "leaky";

function AlgorithmTabs() {
  const [tab, setTab] = useState<AlgoTab>("token");
  const [tokens, setTokens] = useState(10);
  const [count, setCount] = useState(0);
  const [windowStart] = useState(Date.now());
  const maxTokens = 10;
  const refillRate = 2;

  useEffect(() => {
    if (tab !== "token") return;
    const interval = setInterval(() => {
      setTokens((t) => Math.min(maxTokens, t + refillRate));
    }, 2000);
    return () => clearInterval(interval);
  }, [tab]);

  const request = () => {
    if (tab === "token") {
      if (tokens >= 1) { setTokens((t) => t - 1); return true; }
      return false;
    }
    setCount((c) => c + 1);
    return count < 10;
  };

  const ALGOS: Record<AlgoTab, { label: string; color: string; description: string; pro: string; con: string }> = {
    token: {
      label: "Token Bucket", color: "var(--neon-blue)",
      description: "A bucket holds tokens (capacity = max burst). Each request consumes one token. Tokens refill at a constant rate. If empty → request rejected.",
      pro: "Allows bursts (drain the bucket). Simple to implement. Smooth average rate.",
      con: "Burst at the start of every refill window possible. Memory: one counter per user.",
    },
    sliding: {
      label: "Sliding Window Log", color: "var(--neon-green)",
      description: "Keeps a timestamp log of every request. On each request, remove entries older than the window, count remaining. If count < limit → allow.",
      pro: "Most accurate. No edge-case spikes at window boundaries.",
      con: "Memory-heavy: stores every timestamp. O(N) per request for cleanup.",
    },
    fixed: {
      label: "Fixed Window", color: "var(--neon-yellow)",
      description: "Divide time into fixed windows (e.g., 1-minute buckets). Count requests per window. Reset at window boundary.",
      pro: "O(1) memory. Trivial to implement. Redis counter + TTL.",
      con: "Boundary spike: 100 requests at 00:59, 100 at 01:00 → 200 in 2 seconds.",
    },
    leaky: {
      label: "Leaky Bucket", color: "var(--neon-purple)",
      description: "Requests enter a queue (bucket). Processed at a fixed rate (the leak). Bucket overflows → requests dropped. Output rate is smooth.",
      pro: "Perfectly smooth output rate. Good for protecting downstream services.",
      con: "Old requests can wait indefinitely. Burst not absorbed — excess is dropped immediately.",
    },
  };

  const algo = ALGOS[tab];

  return (
    <div className="card p-5 space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(ALGOS) as AlgoTab[]).map((k) => (
          <button
            key={k}
            onClick={() => { setTab(k); setCount(0); setTokens(maxTokens); }}
            className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold border transition", tab === k ? "text-white" : "border-[var(--border-subtle)] text-ink-secondary")}
            style={tab === k ? { borderColor: ALGOS[k].color, background: `${ALGOS[k].color}18`, color: ALGOS[k].color } : {}}
          >
            {ALGOS[k].label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-3"
        >
          <p className="text-sm text-ink-secondary">{algo.description}</p>

          {/* Token bucket visualization */}
          {tab === "token" && (
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-24 rounded-xl border-2 border-neon-blue/40 overflow-hidden bg-bg-tertiary">
                <motion.div
                  className="absolute bottom-0 left-0 right-0 rounded-b-xl"
                  animate={{ height: `${(tokens / maxTokens) * 100}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  style={{ background: "linear-gradient(0deg, var(--neon-blue)55, var(--neon-blue)22)" }}
                />
                <div className="absolute inset-0 flex items-center justify-center mono text-sm font-bold text-neon-blue">
                  {tokens}
                </div>
              </div>
              <div className="text-xs text-ink-secondary space-y-1">
                <div>Capacity: {maxTokens} tokens</div>
                <div>Refill: +{refillRate}/2s</div>
                <div className="text-neon-blue font-semibold">Current: {tokens} tokens</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-neon-green/10 border border-neon-green/30 p-2">
              <div className="text-neon-green font-semibold mb-1">✓ Pro</div>
              <div className="text-ink-secondary">{algo.pro}</div>
            </div>
            <div className="rounded-lg bg-neon-red/10 border border-neon-red/30 p-2">
              <div className="text-neon-red font-semibold mb-1">✗ Con</div>
              <div className="text-ink-secondary">{algo.con}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Deep dive components ──────────────────────────────────────
const COMPONENTS = [
  {
    icon: <Zap size={18} />, title: "Redis Atomic Counter (INCR)", color: "var(--neon-yellow)",
    content: "The foundation of distributed rate limiting. INCR key increments atomically and returns the new value — no race condition possible. On first call, Redis auto-creates the key at 0 then increments to 1. SET key 1 EX window_seconds only if key doesn&apos;t exist (SET NX EX) starts the TTL window. The entire check-and-increment is a single round trip.",
  },
  {
    icon: <Shield size={18} />, title: "Sliding Window with Sorted Sets", color: "var(--neon-blue)",
    content: "Redis ZADD key timestamp member; ZREMRANGEBYSCORE key 0 (now-window); ZCARD key to count. All in a Lua script for atomicity. This implements the sliding window log exactly: timestamps as scores, requests as members. ZCARD gives the count. If count < limit → ZADD and allow. Else reject. O(log N) per request.",
  },
  {
    icon: <AlertTriangle size={18} />, title: "Lua Scripts for Atomicity", color: "var(--neon-green)",
    content: "Multiple Redis commands need to be atomic. The solution: Redis Lua scripts execute atomically (no interleaving). A token bucket implemented in Lua: EVAL script computes refill, checks balance, decrements — all in one atomic transaction. No two nodes can interleave their reads and writes during the script execution.",
  },
  {
    icon: <Zap size={18} />, title: "Node-Local Cache + Redis Sync", color: "var(--neon-purple)",
    content: "For very high traffic, even Redis can become a bottleneck. Solution: each node maintains a local token bucket in memory (atomic via mutex). Every N requests, sync the local count to Redis. Trade-off: slightly less accurate (may over-allow by N during the sync interval) but massively more scalable. Used by Cloudflare for edge rate limiting.",
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
    problem: "Redis becomes the single point of failure — if it goes down, all rate limiting disappears.",
    solution: "Redis Sentinel or Redis Cluster for HA. On Redis failure: fail-open (allow traffic) or fail-closed (block all) based on the business context. For an auth API: fail-closed. For a search API: fail-open with local memory-based fallback rate limiter.",
    color: "var(--neon-red)",
  },
  {
    problem: "Redis can&apos;t handle 1M INCR/sec — each command is a round trip, overhead stacks up.",
    solution: "Redis pipelining: batch multiple commands in one TCP round trip. Lua scripts: multiple operations in one atomic call. Node-local counting with periodic Redis sync (accept slight over-counting for massive throughput gain). Redis Cluster scales horizontally by sharding rate limit keys across nodes.",
    color: "var(--neon-yellow)",
  },
  {
    problem: "Fixed window allows 2x the limit at window boundaries — a known attack vector.",
    solution: "Switch to sliding window counter (hybrid approach): a fixed window for N and N-1, weighted by how far into the current window we are. current = prev_window_count × (1 - elapsed/window) + current_count. One INCR and one GET per request — O(1), accurate, no boundary spike.",
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
  const [mode, setMode] = useState<"centralized" | "local">("centralized");
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => setMode("centralized")}
          className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition", mode === "centralized" ? "bg-neon-green/20 text-neon-green border border-neon-green/40" : "text-ink-secondary")}
        >
          Centralized Redis
        </button>
        <span className="text-ink-muted text-sm">vs</span>
        <button
          onClick={() => setMode("local")}
          className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition", mode === "local" ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/40" : "text-ink-secondary")}
        >
          Local + Sync
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
          {mode === "centralized" ? (
            <>
              <p>✅ <strong className="text-white">Exact counting</strong> — every request checked against the single source of truth in Redis.</p>
              <p>✅ <strong className="text-white">Consistent across nodes</strong> — Node A and Node B see the same counter.</p>
              <p>⚠️ <strong className="text-white">Latency overhead</strong> — each request pays a Redis round trip (~0.3ms). At 1M RPS, this is significant.</p>
              <p>⚠️ <strong className="text-white">Redis is SPOF</strong> — need Redis Cluster + Sentinel for HA.</p>
              <p className="text-neon-green">Correct choice for most use cases where accuracy matters (auth, payments).</p>
            </>
          ) : (
            <>
              <p>✅ <strong className="text-white">Zero Redis round trips</strong> — local memory check, sync to Redis every 100ms.</p>
              <p>✅ <strong className="text-white">Handles millions of RPS</strong> — local counter is a simple atomic integer. Cloudflare-scale.</p>
              <p>⚠️ <strong className="text-white">Slightly over-allows</strong> — during the sync interval, N nodes can each allow up to the limit locally.</p>
              <p>⚠️ <strong className="text-white">Complex implementation</strong> — sync logic, clock drift, what to do during Redis downtime.</p>
              <p className="text-neon-blue">Used when rate limiting is a best-effort safeguard, not a hard security guarantee (CDN edge).</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Summary decisions ─────────────────────────────────────────
const KEY_DECISIONS = [
  { label: "Atomicity", value: "Redis INCR (returns new value atomically — no GET+SET race)", color: "var(--neon-yellow)" },
  { label: "Algorithm", value: "Sliding window counter (prev_window × weight + current) — O(1), no boundary spike", color: "var(--neon-blue)" },
  { label: "Storage key", value: "rate:{user_id}:{window} with EXPIRE = window duration", color: "var(--neon-green)" },
  { label: "HA / redundancy", value: "Redis Cluster with Sentinel. Fail-open vs fail-closed per API criticality", color: "var(--neon-purple)" },
  { label: "Header response", value: "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset", color: "var(--neon-orange)" },
  { label: "Burst handling", value: "Token bucket for burst allowance; INCR + EXPIRE for fixed windows", color: "var(--neon-red)" },
];

export default function DesignRateLimiterPage() {
  return (
    <ConceptPage
      slug="design-rate-limiter"
      analogy={
        <FunnyAnalogy
          emoji="🧮"
          color="var(--neon-red)"
          alternates={[
            { emoji: "🚦", text: "A traffic light that adjusts its timing based on current congestion. One car every 2 seconds, no exceptions — unless you&apos;re an ambulance (bypass for internal services)." },
            { emoji: "🍺", text: "A bartender who remembers your face and your tab. If you&apos;ve had 5 drinks this hour, you get cut off — regardless of which bar in the chain you walk into next." },
          ]}
        >
          A distributed rate limiter is <strong className="text-neon-red">a bouncer that works across 50 clubs simultaneously</strong>.
          The problem: two bouncers both checking the same clicker at the same moment.
          The fix: one atomic clicker they can&apos;t interfere with — Redis INCR.
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
                  "Limit requests per user per time window",
                  "Support multiple algorithms (token bucket, sliding window)",
                  "Apply limits per API key / IP / user ID",
                  "Return rate limit headers (remaining, reset time)",
                  "Different limits per endpoint / tier",
                  "Whitelist certain IPs / users (internal services)",
                  "Log rejected requests for analysis",
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
                  "Accurate across all distributed nodes",
                  "Low latency — rate limit check < 1ms",
                  "Highly available — must work even under DDoS",
                  "Race-condition free (atomic operations)",
                  "Scalable — handles 1M+ RPS globally",
                  "Fault tolerant — Redis downtime has a defined fallback",
                  "No false positives — never block legit requests",
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
          <p className="mb-3 text-sm text-ink-secondary">Adjust nodes and RPS — watch the race condition probability emerge:</p>
          <EnvelopeCalc />
        </Section>
      </ScrollReveal>

      {/* 3. Architecture */}
      <ScrollReveal>
        <Section kicker="Step 3" title="High-Level Architecture">
          <p className="mb-3 text-sm text-ink-secondary">Click any node for details. Hover to highlight connections.</p>
          <AnimatedDiagram
            height={380}
            nodes={[
              { id: "clients", type: "client", label: "Clients", position: { x: 7, y: 50 }, status: "active", info: "All API requests flow through the rate limiter before reaching backend services." },
              { id: "lb", type: "loadbalancer", label: "Load Balancer", position: { x: 22, y: 50 }, status: "active", info: "Distributes traffic across API gateway nodes. No rate limiting state here." },
              { id: "gw1", type: "gateway", label: "API Node 1", position: { x: 40, y: 25 }, status: "busy", info: "Checks rate limit before forwarding. Middleware intercepts every request. Calls Redis atomically." },
              { id: "gw2", type: "gateway", label: "API Node 2", position: { x: 40, y: 50 }, status: "busy", info: "Another API node. Both check the SAME Redis — this is the key. Shared state = accurate counting." },
              { id: "gw3", type: "gateway", label: "API Node 3", position: { x: 40, y: 75 }, status: "busy", info: "Third node. Scale horizontally — each node is stateless for rate limiting; Redis holds all state." },
              { id: "redis", type: "cache", label: "Redis Cluster", position: { x: 62, y: 50 }, status: "active", info: "Shared rate limit counters. INCR + EXPIRE per window. Lua scripts for atomic multi-step operations. Replicated for HA." },
              { id: "rules", type: "database", label: "Rules DB", position: { x: 62, y: 20 }, status: "active", info: "PostgreSQL: rate limit rules per user tier, endpoint, API key. Cached in Redis (15-min TTL). Rules rarely change." },
              { id: "backend", type: "server", label: "Backend Services", position: { x: 82, y: 50 }, status: "active", info: "Only receives requests that passed rate limiting. Protected from traffic spikes and abuse." },
              { id: "analytics", type: "database", label: "Reject Log", position: { x: 82, y: 80 }, status: "idle", info: "Cassandra: logs all rejected requests. Used for abuse detection, analytics, quota reporting." },
            ]}
            edges={[
              { from: "clients", to: "lb", animated: true, color: "var(--neon-blue)" },
              { from: "lb", to: "gw1", animated: true, color: "var(--neon-blue)" },
              { from: "lb", to: "gw2", animated: true, color: "var(--neon-blue)" },
              { from: "lb", to: "gw3", animated: true, color: "var(--neon-blue)" },
              { from: "gw1", to: "redis", animated: true, color: "var(--neon-yellow)", label: "INCR" },
              { from: "gw2", to: "redis", animated: true, color: "var(--neon-yellow)" },
              { from: "gw3", to: "redis", animated: true, color: "var(--neon-yellow)" },
              { from: "rules", to: "redis", dashed: true, label: "cache" },
              { from: "gw1", to: "backend", color: "var(--neon-green)" },
              { from: "gw2", to: "backend", color: "var(--neon-green)" },
              { from: "gw3", to: "backend", color: "var(--neon-green)" },
              { from: "gw1", to: "analytics", dashed: true },
            ]}
          />
        </Section>
      </ScrollReveal>

      {/* 4. Race condition demo */}
      <ScrollReveal>
        <Section kicker="Step 4 — Star Feature" title="Race Condition vs Atomic Fix">
          <p className="mb-3 text-sm text-ink-secondary">
            This is the <strong className="text-neon-red">core distributed rate limiter interview question</strong>. Watch the race condition happen, then see how Redis INCR fixes it atomically:
          </p>
          <RaceConditionDemo />
        </Section>
      </ScrollReveal>

      {/* 4b. Algorithm recap */}
      <ScrollReveal>
        <Section kicker="Step 4b" title="Algorithm Comparison">
          <p className="mb-3 text-sm text-ink-secondary">Each algorithm has different burst behavior — see the trade-offs:</p>
          <AlgorithmTabs />
        </Section>
      </ScrollReveal>

      {/* 5. Component deep dives */}
      <ScrollReveal>
        <Section kicker="Step 5" title="Component Deep Dives">
          <div className="space-y-2">
            {COMPONENTS.map((c, i) => <DeepDiveCard key={c.title} comp={c} idx={i} />)}
          </div>
        </Section>
      </ScrollReveal>

      {/* 6. Bottleneck analysis */}
      <ScrollReveal>
        <Section kicker="Step 6" title="Bottleneck Analysis">
          <div className="space-y-3">
            {BOTTLENECKS.map((b, i) => <BottleneckCard key={i} item={b} idx={i} />)}
          </div>
        </Section>
      </ScrollReveal>

      {/* 7. Trade-offs */}
      <ScrollReveal>
        <Section kicker="Step 7" title="Trade-offs: Centralized vs Local+Sync">
          <TradeoffToggle />
        </Section>
      </ScrollReveal>

      {/* ComparisonBattle */}
      <ScrollReveal>
        <Section kicker="Head to head" title="Token Bucket vs Sliding Window">
          <ComparisonBattle
            left={{ name: "Token Bucket", emoji: "🪣", color: "var(--neon-blue)", bestFor: "APIs that allow bursts — e.g., search APIs where a user might spam quickly but smooths out." }}
            right={{ name: "Sliding Window", emoji: "🪟", color: "var(--neon-green)", bestFor: "Strict per-minute limits with no boundary spikes — auth APIs, payment APIs, SMS." }}
            features={[
              { label: "Burst allowance", a: "Yes (drain bucket)", b: "No (counted)", winner: "a" },
              { label: "Accuracy", a: 80, b: 100, max: 100, unit: "%", winner: "b" },
              { label: "Memory usage", a: "O(1)", b: "O(N logs)", winner: "a" },
              { label: "Redis complexity", a: "Low", b: "Medium", winner: "a" },
              { label: "Boundary spike", a: "Possible", b: "None", winner: "b" },
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
          slug="design-rate-limiter"
          questions={[
            {
              question: "Two API nodes both read a rate limit counter of 4 (limit is 5) simultaneously. Both allow the request and increment. What is the bug and how do you fix it?",
              options: [
                "This is fine — race conditions in rate limiting are acceptable",
                "Use a database transaction with SERIALIZABLE isolation instead of Redis",
                "Race condition: both nodes allowed when only one should. Fix: use Redis INCR which is atomic — returns new value, no separate GET needed",
                "Add a distributed lock around the GET + SET operations",
              ],
              correct: 2,
              explain: "Redis INCR is atomic by design. It reads, increments, and returns the new value in a single operation. If INCR returns a value > limit, the request is rejected. No two nodes can get the same incremented value — the race condition is eliminated.",
            },
            {
              question: "What is the fixed window boundary spike problem?",
              options: [
                "Windows can&apos;t shrink below 1 second",
                "100 requests at 00:59 + 100 at 01:00 = 200 requests in 2 seconds, even with a 100/minute limit",
                "The window boundaries are different on each server due to clock drift",
                "Redis TTL expires at an inaccurate time",
              ],
              correct: 1,
              explain: "Fixed windows reset at boundaries. An attacker can burst exactly at the end of one window and start of the next — effectively doubling the limit over any 2-second span that crosses a boundary. Sliding windows eliminate this.",
            },
            {
              question: "Your rate limiter uses Redis. Redis goes down. What should the rate limiter do?",
              options: [
                "Always fail-closed (block all requests)",
                "Always fail-open (allow all requests)",
                "It depends on the API — fail-closed for auth/payments, fail-open for search/read APIs",
                "Switch to a SQL database automatically",
              ],
              correct: 2,
              explain: "There&apos;s no universal answer. Auth and payment APIs should fail-closed (deny requests) — over-allowing could be dangerous. Search and content APIs should fail-open — degraded but available service is better than a complete outage. Define your policy per API.",
            },
            {
              question: "Which Redis command combination implements an atomic sliding window rate limiter?",
              options: [
                "GET + SET with optimistic locking using WATCH",
                "ZADD (timestamp as score) + ZREMRANGEBYSCORE (prune old) + ZCARD (count) — all in a Lua script",
                "INCR + EXPIRE with a 1-minute TTL",
                "RPUSH + LLEN with a list data structure",
              ],
              correct: 1,
              explain: "A Redis Sorted Set stores request timestamps as scores. ZREMRANGEBYSCORE removes entries outside the window. ZCARD gives the count. Wrapped in a Lua script, this is atomic — no race conditions. If ZCARD < limit, ZADD the new request and allow.",
            },
            {
              question: "A user has a 100 requests/minute limit. They send 100 requests in 10 seconds, then nothing for 50 seconds. Token bucket allows this. Why?",
              options: [
                "Token bucket always allows exactly 100 requests per minute evenly spaced",
                "The bucket was full (100 tokens). The burst drained it. No more tokens until they refill at ~1.67/sec. The burst was within bucket capacity.",
                "Token bucket doesn&apos;t actually limit requests — it just tracks them",
                "Token bucket uses a 10-second window, not a 60-second window",
              ],
              correct: 1,
              explain: "Token bucket allows bursts up to the bucket capacity. 100 tokens in the bucket → 100 requests at once is fine. Then the bucket is empty — requests wait for tokens to refill at the configured rate (100/minute = 1.67/sec). Average rate is enforced; instantaneous burst is allowed.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
