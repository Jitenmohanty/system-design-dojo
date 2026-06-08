"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// ===================== TOKEN BUCKET =====================
function TokenBucket() {
  const MAX_TOKENS = 8;
  const [tokens, setTokens] = useState(MAX_TOKENS);
  const [log, setLog] = useState<{ id: number; text: string; ok: boolean }[]>([]);
  const [rejected, setRejected] = useState(false);
  const counterRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTokens((t) => Math.min(MAX_TOKENS, t + 1));
    }, 1200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const addLog = (text: string, ok: boolean) => {
    const id = ++counterRef.current;
    setLog((l) => [{ id, text, ok }, ...l].slice(0, 5));
  };

  const sendRequest = () => {
    setTokens((t) => {
      if (t <= 0) {
        addLog("Request REJECTED — bucket empty 🚫", false);
        setRejected(true);
        setTimeout(() => setRejected(false), 600);
        return 0;
      }
      addLog(`Request OK — token consumed (${t - 1} left)`, true);
      return t - 1;
    });
  };

  const floodAttack = () => {
    for (let i = 0; i < 6; i++) setTimeout(sendRequest, i * 60);
  };

  const pct = (tokens / MAX_TOKENS) * 100;
  const bucketColor = pct > 60 ? "var(--neon-green)" : pct > 25 ? "var(--neon-yellow)" : "var(--neon-red)";

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start gap-6">
        {/* Bucket visual */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <motion.div
            className="relative rounded-b-xl border-2 overflow-hidden"
            style={{ width: 64, height: 80, borderColor: bucketColor, borderTop: "none" }}
            animate={rejected ? { x: [-4, 4, -4, 4, 0] } : {}}
            transition={{ duration: 0.3 }}
          >
            {/* Water */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 rounded-b-xl"
              style={{ background: bucketColor, opacity: 0.7 }}
              animate={{ height: `${pct}%` }}
              transition={{ duration: 0.4 }}
            />
            {/* Token count */}
            <div className="absolute inset-0 flex items-center justify-center font-display text-xl font-extrabold text-white z-10">
              {tokens}
            </div>
          </motion.div>
          {/* Drop animation */}
          <div className="h-4 flex items-center">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--neon-blue)" }}
              animate={{ y: [0, 12, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <span className="mono text-[0.6rem] text-ink-muted">tokens</span>
        </div>

        <div className="flex-1 space-y-3">
          <p className="text-sm text-ink-secondary">
            Bucket fills at <span className="text-neon-blue mono">+1 token/1.2s</span>. Each request costs 1 token.
            Empty bucket = rejected.
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={sendRequest} className="btn-neon text-sm">Send Request</button>
            <button onClick={floodAttack} className="btn-ghost text-sm text-neon-red border-neon-red/30 hover:bg-neon-red/10">
              🌊 Flood Attack
            </button>
          </div>
        </div>
      </div>

      {/* Log */}
      <div className="space-y-1 max-h-28 overflow-y-auto">
        <AnimatePresence initial={false}>
          {log.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="mono text-xs flex items-center gap-2"
            >
              <span style={{ color: e.ok ? "var(--neon-green)" : "var(--neon-red)" }}>
                {e.ok ? "✓" : "✗"}
              </span>
              <span style={{ color: e.ok ? "var(--text-secondary)" : "var(--neon-red)" }}>{e.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {log.length === 0 && <p className="text-xs text-ink-muted">Hit &quot;Send Request&quot; to begin</p>}
      </div>
    </div>
  );
}

// ===================== LEAKY BUCKET =====================
function LeakyBucket() {
  const MAX_WATER = 10;
  const [water, setWater] = useState(0);
  const [log, setLog] = useState<{ id: number; text: string; ok: boolean }[]>([]);
  const counterRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Leak at constant rate
    intervalRef.current = setInterval(() => {
      setWater((w) => Math.max(0, w - 0.5));
    }, 600);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const addLog = (text: string, ok: boolean) => {
    const id = ++counterRef.current;
    setLog((l) => [{ id, text, ok }, ...l].slice(0, 5));
  };

  const sendRequest = () => {
    setWater((w) => {
      if (w >= MAX_WATER) {
        addLog("Request DROPPED — bucket overflow 💦", false);
        return w;
      }
      addLog(`Request queued (queue: ${Math.ceil(w + 1)}/${MAX_WATER})`, true);
      return Math.min(MAX_WATER, w + 2);
    });
  };

  const floodAttack = () => {
    for (let i = 0; i < 8; i++) setTimeout(sendRequest, i * 50);
  };

  const pct = (water / MAX_WATER) * 100;
  const bucketColor = pct > 80 ? "var(--neon-red)" : pct > 50 ? "var(--neon-yellow)" : "var(--neon-blue)";

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start gap-6">
        {/* Bucket visual */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div
            className="relative rounded-b-xl border-2 overflow-hidden"
            style={{ width: 64, height: 80, borderColor: bucketColor, borderTop: "none" }}
          >
            <motion.div
              className="absolute bottom-0 left-0 right-0"
              style={{ background: bucketColor, opacity: 0.7 }}
              animate={{ height: `${pct}%` }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-white z-10">
              {Math.ceil(water)}
            </div>
          </div>
          {/* Steady leak */}
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--neon-blue)" }}
            animate={{ y: [0, 16], opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeIn" }}
          />
          <span className="mono text-[0.6rem] text-ink-muted">queue</span>
        </div>

        <div className="flex-1 space-y-3">
          <p className="text-sm text-ink-secondary">
            Queue processes at constant <span className="text-neon-blue mono">0.5 req/0.6s</span>. Overflow = dropped.
            Bursts accepted up to capacity.
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={sendRequest} className="btn-neon text-sm">Send Request</button>
            <button onClick={floodAttack} className="btn-ghost text-sm text-neon-red border-neon-red/30 hover:bg-neon-red/10">
              🌊 Flood Attack
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1 max-h-28 overflow-y-auto">
        <AnimatePresence initial={false}>
          {log.map((e) => (
            <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mono text-xs flex items-center gap-2">
              <span style={{ color: e.ok ? "var(--neon-green)" : "var(--neon-red)" }}>{e.ok ? "✓" : "✗"}</span>
              <span style={{ color: e.ok ? "var(--text-secondary)" : "var(--neon-red)" }}>{e.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {log.length === 0 && <p className="text-xs text-ink-muted">Hit &quot;Send Request&quot; to begin</p>}
      </div>
    </div>
  );
}

// ===================== FIXED WINDOW =====================
function FixedWindow() {
  const LIMIT = 5;
  const WINDOW_MS = 6000;
  const [count, setCount] = useState(0);
  const [windowStart, setWindowStart] = useState(() => Date.now());
  const [timeLeft, setTimeLeft] = useState(WINDOW_MS / 1000);
  const [log, setLog] = useState<{ id: number; text: string; ok: boolean }[]>([]);
  const counterRef = useRef(0);

  const resetWindow = useCallback(() => {
    setWindowStart(Date.now());
    setCount(0);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - windowStart;
      const left = Math.max(0, (WINDOW_MS - elapsed) / 1000);
      setTimeLeft(parseFloat(left.toFixed(1)));
      if (elapsed >= WINDOW_MS) resetWindow();
    }, 100);
    return () => clearInterval(interval);
  }, [windowStart, resetWindow]);

  const addLog = (text: string, ok: boolean) => {
    const id = ++counterRef.current;
    setLog((l) => [{ id, text, ok }, ...l].slice(0, 5));
  };

  const sendRequest = () => {
    setCount((c) => {
      if (c >= LIMIT) {
        addLog(`REJECTED — limit ${LIMIT} reached, reset in ${timeLeft.toFixed(1)}s 🚫`, false);
        return c;
      }
      addLog(`OK — request ${c + 1}/${LIMIT} in current window`, true);
      return c + 1;
    });
  };

  const floodAttack = () => {
    for (let i = 0; i < 8; i++) setTimeout(sendRequest, i * 50);
  };

  const pct = (count / LIMIT) * 100;
  const barColor = pct >= 100 ? "var(--neon-red)" : pct >= 80 ? "var(--neon-yellow)" : "var(--neon-green)";
  const windowPct = ((WINDOW_MS - timeLeft * 1000) / WINDOW_MS) * 100;

  return (
    <div className="card p-5 space-y-4">
      {/* Window progress */}
      <div>
        <div className="flex justify-between mono text-[0.65rem] text-ink-muted mb-1">
          <span>Window progress</span>
          <span>resets in {timeLeft.toFixed(1)}s</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--neon-blue)", width: `${windowPct}%` }}
          />
        </div>
      </div>

      {/* Counter */}
      <div>
        <div className="flex justify-between mono text-[0.65rem] text-ink-muted mb-1">
          <span>Requests this window</span>
          <span style={{ color: barColor }}>{count}/{LIMIT}</span>
        </div>
        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: barColor }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      <p className="text-sm text-ink-secondary">
        Max <span className="mono text-neon-blue">{LIMIT} req/{WINDOW_MS / 1000}s</span>. Counter resets hard at window boundary — classic boundary burst problem.
      </p>

      <div className="flex flex-wrap gap-2">
        <button onClick={sendRequest} className="btn-neon text-sm">Send Request</button>
        <button onClick={floodAttack} className="btn-ghost text-sm text-neon-red border-neon-red/30 hover:bg-neon-red/10">
          🌊 Flood Attack
        </button>
      </div>

      <div className="space-y-1 max-h-24 overflow-y-auto">
        <AnimatePresence initial={false}>
          {log.map((e) => (
            <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mono text-xs flex items-center gap-2">
              <span style={{ color: e.ok ? "var(--neon-green)" : "var(--neon-red)" }}>{e.ok ? "✓" : "✗"}</span>
              <span style={{ color: e.ok ? "var(--text-secondary)" : "var(--neon-red)" }}>{e.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {log.length === 0 && <p className="text-xs text-ink-muted">Hit &quot;Send Request&quot; to begin</p>}
      </div>
    </div>
  );
}

// ===================== SLIDING WINDOW =====================
function SlidingWindow() {
  const LIMIT = 5;
  const WINDOW_MS = 6000;
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [log, setLog] = useState<{ id: number; text: string; ok: boolean }[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = Date.now();
      setNow(t);
      setTimestamps((ts) => ts.filter((x) => t - x < WINDOW_MS));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const addLog = (text: string, ok: boolean) => {
    const id = ++counterRef.current;
    setLog((l) => [{ id, text, ok }, ...l].slice(0, 5));
  };

  const sendRequest = () => {
    const t = Date.now();
    setTimestamps((ts) => {
      const valid = ts.filter((x) => t - x < WINDOW_MS);
      if (valid.length >= LIMIT) {
        addLog(`REJECTED — ${LIMIT} requests in rolling 6s window 🚫`, false);
        return valid;
      }
      addLog(`OK — ${valid.length + 1}/${LIMIT} in rolling window`, true);
      return [...valid, t];
    });
    setNow(t);
  };

  const floodAttack = () => {
    for (let i = 0; i < 8; i++) setTimeout(sendRequest, i * 50);
  };

  const validCount = timestamps.filter((x) => now - x < WINDOW_MS).length;
  const pct = (validCount / LIMIT) * 100;
  const barColor = pct >= 100 ? "var(--neon-red)" : pct >= 80 ? "var(--neon-yellow)" : "var(--neon-green)";

  return (
    <div className="card p-5 space-y-4">
      {/* Rolling window visualization */}
      <div>
        <div className="flex justify-between mono text-[0.65rem] text-ink-muted mb-2">
          <span>Rolling 6s window</span>
          <span style={{ color: barColor }}>{validCount}/{LIMIT} requests</span>
        </div>
        <div className="relative h-8 rounded-lg bg-white/5 overflow-hidden">
          {timestamps
            .filter((x) => now - x < WINDOW_MS)
            .map((ts) => {
              const age = (now - ts) / WINDOW_MS; // 0=newest,1=oldest
              return (
                <motion.div
                  key={ts}
                  className="absolute top-1 bottom-1 w-4 rounded"
                  style={{
                    right: `${age * 100}%`,
                    background: "var(--neon-purple)",
                    opacity: 1 - age * 0.6,
                  }}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 - age * 0.6 }}
                />
              );
            })}
        </div>
        <div className="flex justify-between mono text-[0.55rem] text-ink-muted mt-0.5">
          <span>now</span><span>← 6s ago</span>
        </div>
      </div>

      <p className="text-sm text-ink-secondary">
        Counts requests in a <span className="text-neon-purple mono">rolling 6s window</span>. No hard boundary —
        smooth and fair, but slightly more complex to implement.
      </p>

      <div className="flex flex-wrap gap-2">
        <button onClick={sendRequest} className="btn-neon text-sm">Send Request</button>
        <button onClick={floodAttack} className="btn-ghost text-sm text-neon-red border-neon-red/30 hover:bg-neon-red/10">
          🌊 Flood Attack
        </button>
      </div>

      <div className="space-y-1 max-h-24 overflow-y-auto">
        <AnimatePresence initial={false}>
          {log.map((e) => (
            <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mono text-xs flex items-center gap-2">
              <span style={{ color: e.ok ? "var(--neon-green)" : "var(--neon-red)" }}>{e.ok ? "✓" : "✗"}</span>
              <span style={{ color: e.ok ? "var(--text-secondary)" : "var(--neon-red)" }}>{e.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {log.length === 0 && <p className="text-xs text-ink-muted">Hit &quot;Send Request&quot; to begin</p>}
      </div>
    </div>
  );
}

// ===================== TAB WRAPPER =====================
type TabId = "token" | "leaky" | "fixed" | "sliding";

const TABS: { id: TabId; label: string; emoji: string; color: string; desc: string }[] = [
  { id: "token", label: "Token Bucket", emoji: "🪣", color: "var(--neon-blue)", desc: "Tokens fill at constant rate. Requests consume tokens. Bursts allowed up to bucket capacity." },
  { id: "leaky", label: "Leaky Bucket", emoji: "💧", color: "var(--neon-purple)", desc: "Queue fills with incoming requests. Processed at constant output rate. Overflow dropped." },
  { id: "fixed", label: "Fixed Window", emoji: "⬛", color: "var(--neon-yellow)", desc: "Hard counter per fixed time window. Simple but vulnerable to boundary bursts (2x limit in edge case)." },
  { id: "sliding", label: "Sliding Window", emoji: "🔄", color: "var(--neon-green)", desc: "Rolling time window. Smooth, no boundary problem. Slightly higher memory (stores per-request timestamps)." },
];

function AlgorithmTabs() {
  const [tab, setTab] = useState<TabId>("token");
  const current = TABS.find((t) => t.id === tab)!;

  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <motion.button
            key={t.id}
            onClick={() => setTab(t.id)}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all"
            style={{
              borderColor: tab === t.id ? t.color : "var(--border-subtle)",
              color: tab === t.id ? t.color : "var(--text-secondary)",
              background: tab === t.id ? `${t.color}12` : "transparent",
              boxShadow: tab === t.id ? `0 0 14px -4px ${t.color}` : "none",
            }}
          >
            <span>{t.emoji}</span>
            {t.label}
          </motion.button>
        ))}
      </div>

      {/* Description */}
      <div
        className="rounded-xl border p-3 text-sm text-ink-secondary"
        style={{ borderColor: `${current.color}30`, background: `${current.color}08` }}
      >
        <span className="font-semibold" style={{ color: current.color }}>{current.emoji} {current.label}: </span>
        {current.desc}
      </div>

      {/* Algorithm demo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "token" && <TokenBucket />}
          {tab === "leaky" && <LeakyBucket />}
          {tab === "fixed" && <FixedWindow />}
          {tab === "sliding" && <SlidingWindow />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ===================== COMPARISON TABLE =====================
const COMPARISON_ROWS = [
  { label: "Burst tolerance", token: "✓ Yes (up to capacity)", leaky: "✗ No (constant rate)", fixed: "⚠ Yes (at boundary)", sliding: "✓ Smooth" },
  { label: "Memory", token: "Low (one counter)", leaky: "Low (queue size)", fixed: "Very low", sliding: "Medium (timestamps)" },
  { label: "Fairness", token: "Good", leaky: "Excellent", fixed: "Poor (boundary bug)", sliding: "Excellent" },
  { label: "Complexity", token: "Low", leaky: "Low", fixed: "Lowest", sliding: "Medium" },
  { label: "Best for", token: "APIs, user quotas", leaky: "Outbound services", fixed: "Simple systems", sliding: "Production APIs" },
];

export default function RateLimitingPage() {
  return (
    <ConceptPage
      slug="rate-limiting"
      analogy={
        <FunnyAnalogy
          emoji="🚫"
          color="var(--neon-red)"
          alternates={[
            { emoji: "🚦", text: "A traffic light — cars can go, but not all at once. Controlled throughput, not zero throughput." },
            { emoji: "🏧", text: "ATM daily withdrawal limit — the bank doesn't hate you, it just prevents someone else from draining your account in 0.3 seconds." },
          ]}
        >
          Rate limiting is the <strong className="text-neon-red">bouncer at a club</strong>. 100 people per hour — after that,
          you&apos;re getting a <span className="mono text-neon-yellow">429 Too Many Requests</span> and a judgy look. No exceptions.
          Not even for you, Mr. Script-Kiddie.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="Why it matters" title="Without rate limiting, you&apos;re handing over the keys">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: "💸", title: "Cost explosion", desc: "Bots scraping your API 10,000x/min. Your serverless bill: 💀." },
              { icon: "🔥", title: "Server meltdown", desc: "A single bad client brings down everyone&apos;s experience. DDoS via normal-looking traffic." },
              { icon: "🔑", title: "Credential stuffing", desc: "Unlimited login attempts = automated password guessing at scale." },
            ].map((item) => (
              <div key={item.title} className="card p-4">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-display font-semibold text-sm text-white mb-1">{item.title}</div>
                <p className="text-xs text-ink-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="4 algorithms" title="Pick your bouncer style">
          <AlgorithmTabs />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Algorithm comparison" title="All four side-by-side">
          <div className="card overflow-x-auto">
            <table className="w-full mono text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-bg-tertiary/50">
                  <th className="px-4 py-3 text-left text-ink-muted">Property</th>
                  <th className="px-4 py-3 text-left text-neon-blue">Token Bucket 🪣</th>
                  <th className="px-4 py-3 text-left text-neon-purple">Leaky Bucket 💧</th>
                  <th className="px-4 py-3 text-left text-neon-yellow">Fixed Window ⬛</th>
                  <th className="px-4 py-3 text-left text-neon-green">Sliding Window 🔄</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? "bg-bg-tertiary/20" : ""}>
                    <td className="px-4 py-2 text-ink-muted font-medium">{row.label}</td>
                    <td className="px-4 py-2 text-ink-secondary">{row.token}</td>
                    <td className="px-4 py-2 text-ink-secondary">{row.leaky}</td>
                    <td className="px-4 py-2 text-ink-secondary">{row.fixed}</td>
                    <td className="px-4 py-2 text-ink-secondary">{row.sliding}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Where to enforce" title="Rate limiting layers">
          <div className="card divide-y divide-[var(--border-subtle)]">
            {[
              { layer: "API Gateway", color: "var(--neon-orange)", desc: "First line of defense. Cheapest to enforce — rejected before reaching any service." },
              { layer: "Application code", color: "var(--neon-blue)", desc: "Per-user, per-feature granularity. Use Redis for distributed counters." },
              { layer: "Database", color: "var(--neon-green)", desc: "Last resort. Protect expensive queries, but adds DB load — defeats the purpose if overused." },
              { layer: "CDN / Edge", color: "var(--neon-purple)", desc: "Geographic rate limiting, DDoS protection. Cloudflare does this at the network layer." },
            ].map((item) => (
              <div key={item.layer} className="flex items-start gap-3 p-4">
                <div
                  className="mono text-[0.65rem] shrink-0 rounded-md px-2 py-1 mt-0.5"
                  style={{ color: item.color, background: `${item.color}15` }}
                >
                  {item.layer}
                </div>
                <p className="text-sm text-ink-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="rate-limiting"
          questions={[
            {
              question: "What HTTP status code does a rate-limited response return?",
              options: ["400 Bad Request", "401 Unauthorized", "429 Too Many Requests", "503 Service Unavailable"],
              correct: 2,
              explain: "429 Too Many Requests is the standard status for rate limiting. Retry-After header tells the client when to try again.",
            },
            {
              question: "Which algorithm is most vulnerable to a 'boundary burst' attack?",
              options: ["Token Bucket", "Leaky Bucket", "Fixed Window", "Sliding Window"],
              correct: 2,
              explain: "Fixed Window allows 2x the limit in a short burst by sending requests at the end of one window and start of the next.",
            },
            {
              question: "You need to limit API calls to exactly 100/hour with smooth distribution. Which is best?",
              options: ["Fixed Window — simple counter", "Leaky Bucket — constant output rate", "Token Bucket — bursty but fair", "None — just hope for the best"],
              correct: 1,
              explain: "Leaky Bucket processes at a constant rate — smooth, predictable throughput with no burst spikes.",
            },
            {
              question: "Why use Redis for distributed rate limiting?",
              options: ["It's the fastest database", "Multiple servers need to share counter state atomically", "It automatically blocks bad clients", "It&apos;s free"],
              correct: 1,
              explain: "With multiple app servers, each needs to see the same counter. Redis INCR is atomic — safe for concurrent increments across nodes.",
            },
            {
              question: "Token Bucket allows bursts because…",
              options: ["It ignores rate limits", "Tokens accumulate when not used, allowing a burst up to bucket capacity", "It has no limit", "Tokens are refilled instantly"],
              correct: 1,
              explain: "Idle time builds up saved tokens. A user can burst up to the bucket size — useful for real-world usage patterns that aren&apos;t perfectly uniform.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
