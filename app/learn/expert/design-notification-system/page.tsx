"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Bell, Mail, Smartphone, MessageSquare, Filter, Layers } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { cn } from "@/lib/utils";

// ── Back-of-envelope calculator ───────────────────────────────
function EnvelopeCalc() {
  const [users, setUsers] = useState(100);
  const notifsPerDayPerUser = 20;
  const notifsPerDay = users * notifsPerDayPerUser * 1_000_000;
  const writeQPS = Math.round(notifsPerDay / 86400);
  const pushPct = 0.7;
  const smsPct = 0.05;
  const emailPct = 0.25;
  const pushQPS = Math.round(writeQPS * pushPct);
  const smsQPS = Math.round(writeQPS * smsPct);
  const emailQPS = Math.round(writeQPS * emailPct);
  const storageTBperDay = (notifsPerDay * 0.5) / (1024 * 1024 * 1024 * 1024);

  const rows = [
    { label: "Monthly Active Users (M)", value: `${users}M`, color: "var(--neon-blue)" },
    { label: "Notifications / day", value: `${(notifsPerDay / 1e9).toFixed(1)}B`, color: "var(--neon-blue)" },
    { label: "Total QPS", value: `${(writeQPS / 1000).toFixed(0)}K`, color: "var(--neon-yellow)" },
    { label: "Push QPS (70%)", value: `${(pushQPS / 1000).toFixed(0)}K`, color: "var(--neon-green)" },
    { label: "Email QPS (25%)", value: `${(emailQPS / 1000).toFixed(0)}K`, color: "var(--neon-orange)" },
    { label: "SMS QPS (5%)", value: `${smsQPS.toLocaleString()}`, color: "var(--neon-purple)" },
    { label: "Storage / day", value: `${storageTBperDay.toFixed(2)} TB`, color: "var(--neon-red)" },
    { label: "Dedup window", value: "5 minutes per (user, template)", color: "var(--neon-yellow)" },
  ];

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="mono text-xs text-neon-blue uppercase tracking-widest">MAU (millions)</span>
        <input
          type="range" min={10} max={500} step={10} value={users}
          onChange={(e) => setUsers(Number(e.target.value))}
          className="flex-1 accent-blue-400"
        />
        <span className="mono text-neon-blue font-bold w-16 text-right">{users}M</span>
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

// ── Priority Queue Simulation ─────────────────────────────────
type QueueItem = { id: number; type: "urgent" | "normal" | "marketing"; msg: string; priority: number };
let queueIdCounter = 0;

const URGENT_MESSAGES = [
  "🚨 Your account was accessed from a new device",
  "💳 Large transaction detected: $5,200",
  "🔐 2FA code: 847291 (expires in 60s)",
];
const NORMAL_MESSAGES = [
  "💬 Alice commented on your post",
  "👍 Bob liked your photo",
  "🔔 Your order shipped",
];
const MARKETING_MESSAGES = [
  "🛍️ Flash sale: 50% off today only!",
  "🎁 You have rewards to redeem",
  "📢 New features available",
];

function PriorityQueueSim() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processing, setProcessing] = useState<QueueItem | null>(null);
  const [processed, setProcessed] = useState<QueueItem[]>([]);
  const processingRef = useRef(false);

  const enqueue = (type: QueueItem["type"]) => {
    const msgs = type === "urgent" ? URGENT_MESSAGES : type === "normal" ? NORMAL_MESSAGES : MARKETING_MESSAGES;
    const priority = type === "urgent" ? 100 : type === "normal" ? 50 : 10;
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    const item: QueueItem = { id: queueIdCounter++, type, msg, priority };
    setQueue((prev) => {
      const next = [...prev, item].sort((a, b) => b.priority - a.priority);
      return next;
    });
  };

  useEffect(() => {
    if (processingRef.current || queue.length === 0) return;
    processingRef.current = true;
    const [next, ...rest] = queue;
    setQueue(rest);
    setProcessing(next);
    const timeout = setTimeout(() => {
      setProcessed((prev) => [next, ...prev].slice(0, 5));
      setProcessing(null);
      processingRef.current = false;
    }, 1200);
    return () => clearTimeout(timeout);
  }, [queue, processing]);

  const COLOR = { urgent: "var(--neon-red)", normal: "var(--neon-green)", marketing: "var(--neon-blue)" };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold text-white">Priority Queue Simulation</span>
        <span className="mono text-xs text-ink-muted">{queue.length} queued</span>
      </div>

      {/* Enqueue buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => enqueue("urgent")} className="rounded-lg px-3 py-2 text-xs font-semibold border border-neon-red/50 bg-neon-red/10 text-neon-red hover:bg-neon-red/20 transition">
          + Urgent 🚨
        </button>
        <button onClick={() => enqueue("normal")} className="rounded-lg px-3 py-2 text-xs font-semibold border border-neon-green/50 bg-neon-green/10 text-neon-green hover:bg-neon-green/20 transition">
          + Normal 🔔
        </button>
        <button onClick={() => enqueue("marketing")} className="rounded-lg px-3 py-2 text-xs font-semibold border border-neon-blue/50 bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 transition">
          + Marketing 📢
        </button>
      </div>

      {/* Queue visualization */}
      <div className="rounded-xl bg-bg-tertiary/50 p-3 min-h-[120px]">
        <div className="mono text-[0.6rem] uppercase tracking-widest text-neon-yellow mb-2">Queue (highest priority first)</div>
        <div className="space-y-1.5 max-h-36 overflow-y-auto">
          <AnimatePresence>
            {queue.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs"
                style={{ background: `${COLOR[item.type]}15`, borderLeft: `3px solid ${COLOR[item.type]}` }}
              >
                <span className="mono font-bold" style={{ color: COLOR[item.type] }}>{item.priority}</span>
                <span className="text-white truncate">{item.msg}</span>
                <span className="ml-auto mono text-[0.6rem] text-ink-muted">#{i + 1}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {queue.length === 0 && !processing && (
            <div className="text-center text-xs text-ink-muted py-4">Queue is empty — add some notifications!</div>
          )}
        </div>
      </div>

      {/* Processing indicator */}
      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-xl border p-3 text-xs"
            style={{ borderColor: COLOR[processing.type], background: `${COLOR[processing.type]}10` }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="h-3 w-3 rounded-full border-2 border-t-transparent"
                style={{ borderColor: COLOR[processing.type] }}
              />
              <span style={{ color: COLOR[processing.type] }}>Processing:</span>
              <span className="text-white">{processing.msg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processed */}
      {processed.length > 0 && (
        <div className="space-y-1">
          <div className="mono text-[0.6rem] uppercase tracking-widest text-ink-muted">Recently sent</div>
          <AnimatePresence>
            {processed.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                className="text-xs text-ink-muted flex gap-2"
              >
                <span>✓</span>
                <span className="truncate">{item.msg}</span>
                <span className="ml-auto mono text-[0.55rem] capitalize" style={{ color: COLOR[item.type] }}>{item.type}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ── Rate limiter per user ─────────────────────────────────────
function RateLimiterDemo() {
  const [counts, setCounts] = useState<Record<string, { push: number; email: number; sms: number }>>({
    "user_alice": { push: 0, email: 0, sms: 0 },
    "user_bob": { push: 0, email: 0, sms: 0 },
  });
  const [blocked, setBlocked] = useState<string[]>([]);
  const LIMITS = { push: 5, email: 3, sms: 2 };

  const send = (user: string, channel: "push" | "email" | "sms") => {
    const key = `${user}:${channel}`;
    const current = counts[user][channel];
    const limit = LIMITS[channel];
    if (current >= limit) {
      setBlocked((prev) => [...prev.filter((b) => b !== key), key]);
      setTimeout(() => setBlocked((prev) => prev.filter((b) => b !== key)), 2000);
      return;
    }
    setCounts((prev) => ({ ...prev, [user]: { ...prev[user], [channel]: prev[user][channel] + 1 } }));
  };

  const reset = () => {
    setCounts({ "user_alice": { push: 0, email: 0, sms: 0 }, "user_bob": { push: 0, email: 0, sms: 0 } });
    setBlocked([]);
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold text-white">Per-User Rate Limiting</span>
        <button onClick={reset} className="btn-ghost text-xs">Reset</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(counts).map(([user, channels]) => (
          <div key={user} className="rounded-xl bg-bg-tertiary/50 p-3 space-y-2">
            <div className="font-display text-sm font-semibold text-white capitalize">{user.replace("_", " ")}</div>
            {(["push", "email", "sms"] as const).map((ch) => {
              const limit = LIMITS[ch];
              const count = channels[ch];
              const pct = (count / limit) * 100;
              const isBlocked = blocked.includes(`${user}:${ch}`);
              return (
                <div key={ch} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="mono text-xs text-ink-secondary capitalize">{ch}</span>
                    <span className="mono text-xs" style={{ color: pct >= 100 ? "var(--neon-red)" : pct >= 60 ? "var(--neon-yellow)" : "var(--neon-green)" }}>
                      {count}/{limit}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      animate={{ width: `${Math.min(100, pct)}%` }}
                      transition={{ duration: 0.3 }}
                      style={{ background: pct >= 100 ? "var(--neon-red)" : pct >= 60 ? "var(--neon-yellow)" : "var(--neon-green)" }}
                    />
                  </div>
                  <motion.button
                    onClick={() => send(user, ch)}
                    whileTap={isBlocked ? { x: [-4, 4, -4, 4, 0] } : { scale: 0.95 }}
                    className={cn(
                      "w-full rounded-lg px-2 py-1 text-[0.65rem] transition",
                      count >= limit ? "bg-neon-red/10 text-neon-red border border-neon-red/30 cursor-not-allowed"
                        : "bg-white/5 text-ink-secondary hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {isBlocked ? "🚫 Rate limited!" : `Send ${ch}`}
                  </motion.button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-bg-tertiary/50 p-3 text-xs text-ink-secondary">
        <strong className="text-white">In production:</strong> Limits reset hourly (push: 20/hr, email: 5/hr, SMS: 3/hr). Stored as Redis counters with TTL. Emergency/security notifications bypass rate limits entirely.
      </div>
    </div>
  );
}

// ── Deduplication demo ────────────────────────────────────────
function DeduplicationDemo() {
  const [events, setEvents] = useState<{ id: number; msg: string; status: "sending" | "deduped" | "sent"; time: number }[]>([]);
  let evCounter = useRef(0);

  const trigger = (msg: string) => {
    const now = Date.now();
    const id = evCounter.current++;
    const isDup = events.some((e) => e.msg === msg && now - e.time < 5000 && e.status !== "deduped");
    setEvents((prev) => [
      { id, msg, status: isDup ? "deduped" : "sending", time: now },
      ...prev.slice(0, 6),
    ]);
    if (!isDup) {
      setTimeout(() => {
        setEvents((prev) => prev.map((e) => e.id === id ? { ...e, status: "sent" } : e));
      }, 600);
    }
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold text-white">Deduplication (5-min window)</span>
        <span className="mono text-xs text-ink-muted">Click same button twice fast</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {["Order shipped 📦", "Payment confirmed 💳", "New message 💬"].map((msg) => (
          <button key={msg} onClick={() => trigger(msg)} className="rounded-lg px-3 py-2 text-xs bg-bg-tertiary border border-[var(--border-subtle)] hover:border-[var(--border-neon)] text-ink-secondary hover:text-white transition">
            {msg}
          </button>
        ))}
      </div>

      <div className="space-y-1.5 min-h-[100px]">
        <AnimatePresence>
          {events.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
                e.status === "deduped" ? "bg-neon-red/10 border border-neon-red/30" : "bg-neon-green/10 border border-neon-green/30"
              )}
            >
              <span>{e.status === "deduped" ? "🚫" : e.status === "sending" ? "⏳" : "✓"}</span>
              <span className="text-white">{e.msg}</span>
              <span className="ml-auto mono" style={{ color: e.status === "deduped" ? "var(--neon-red)" : "var(--neon-green)" }}>
                {e.status === "deduped" ? "DEDUPED" : e.status === "sending" ? "…" : "SENT"}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {events.length === 0 && <div className="text-center text-xs text-ink-muted py-4">Click buttons above to simulate events</div>}
      </div>
    </div>
  );
}

// ── Deep dive components ──────────────────────────────────────
const COMPONENTS = [
  {
    icon: <Bell size={18} />, title: "Notification Service (Core)", color: "var(--neon-yellow)",
    content: "Event-driven entry point. Receives trigger events from all upstream services (payment, social, marketing). Validates the event, looks up user preferences (opt-ins, quiet hours, channel preferences), assigns a priority tier, and enqueues to the appropriate Kafka topic. Acts as the smart router — knows who gets what via which channel.",
  },
  {
    icon: <Smartphone size={18} />, title: "Push Notification Handler", color: "var(--neon-green)",
    content: "Consumes from the push topic. Formats the payload for APNs (iOS) and FCM (Android). Handles device token management (tokens expire — keep a clean token registry). Sends in batches of up to 500 per APNs request. Failed tokens trigger a cleanup job. Tracks delivery receipts via APNs feedback service.",
  },
  {
    icon: <Mail size={18} />, title: "Email Handler", color: "var(--neon-blue)",
    content: "Uses SendGrid/SES for actual delivery. Renders HTML templates via a template engine (Handlebars / Jinja2). Templates are versioned and A/B tested. Handles bounces (hard bounce → unsubscribe; soft bounce → retry 3x). DKIM/SPF configured for deliverability. Unsubscribe links are HMAC-signed.",
  },
  {
    icon: <MessageSquare size={18} />, title: "SMS Handler", color: "var(--neon-purple)",
    content: "Twilio / AWS SNS for SMS. Smallest channel by volume but highest cost. Used for time-sensitive: OTPs, fraud alerts, delivery confirmations. Rate-limited per user (max 5/day) to avoid carrier spam flags. International routing respects local regulations (India DLT, EU GDPR). Content truncated to 160 chars.",
  },
  {
    icon: <Filter size={18} />, title: "Template Engine", color: "var(--neon-orange)",
    content: "Centralized template registry. Templates are parameterized (user name, order ID, amount). Supports localization — 40+ languages, right-to-left, date/currency formatting. Templates are fetched from a template DB (PostgreSQL) and cached in Redis (1h TTL). A/B test variants are stored as template variants with traffic split.",
  },
  {
    icon: <Layers size={18} />, title: "Deduplication Service", color: "var(--neon-red)",
    content: "Prevents notification spam during retries or duplicate events. Uses a Redis hash: key = hash(user_id + template_id + content_hash), TTL = dedup window (5 minutes to 24 hours based on notification type). Before enqueuing, check if this exact notification was already sent. Emergency notifications (fraud, 2FA) bypass dedup.",
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
    problem: "A viral event causes 10M notifications to queue simultaneously — the system falls behind by hours.",
    solution: "Priority lanes in Kafka: urgent (OTP, fraud) → high-priority partition consumed first. Normal social → standard lane. Marketing → bulk lane processed off-peak. Workers per lane are independently scaled. APNs allows batch sending of 500 devices per request to reduce connection overhead.",
    color: "var(--neon-red)",
  },
  {
    problem: "APNs rate limits hit — too many concurrent connections from notification workers.",
    solution: "Connection pool to APNs (HTTP/2 multiplexing — one connection per worker, not per request). Token-based auth (JWT) instead of certificate — tokens are generated per request, no expiry issues. Exponential backoff on 429 responses. Stagger sends by user geo-region.",
    color: "var(--neon-yellow)",
  },
  {
    problem: "User opted out of push but still gets notifications — stale preference cache.",
    solution: "User preference DB is the source of truth (PostgreSQL). Redis cache of preferences with 5-minute TTL. On cache miss, fetch from DB. Opt-outs are immediately propagated via a Kafka event that invalidates the cache key. Critical: never cache &apos;opted in&apos; for more than 5 minutes.",
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
  const [mode, setMode] = useState<"sync" | "async">("async");
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => setMode("async")}
          className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition", mode === "async" ? "bg-neon-green/20 text-neon-green border border-neon-green/40" : "text-ink-secondary")}
        >
          Async (Recommended)
        </button>
        <span className="text-ink-muted text-sm">vs</span>
        <button
          onClick={() => setMode("sync")}
          className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition", mode === "sync" ? "bg-neon-red/20 text-neon-red border border-neon-red/40" : "text-ink-secondary")}
        >
          Synchronous
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
          {mode === "async" ? (
            <>
              <p>✅ <strong className="text-white">Decoupled</strong> — payment service just fires an event; notification delivery doesn&apos;t block the payment completion.</p>
              <p>✅ <strong className="text-white">Scalable</strong> — notification workers scale independently from the triggering services.</p>
              <p>✅ <strong className="text-white">Retry built-in</strong> — Kafka retains events; failed deliveries can be retried without re-triggering the source.</p>
              <p>⚠️ <strong className="text-white">Slight delay</strong> — notification may arrive 1-5 seconds after the event. Fine for most use cases.</p>
              <p className="text-neon-green">All production notification systems use async. Kafka/SQS is the backbone.</p>
            </>
          ) : (
            <>
              <p>✅ <strong className="text-white">Immediate delivery</strong> — notification sent inline with the triggering action.</p>
              <p>⚠️ <strong className="text-white">Tight coupling</strong> — APNs being slow makes your payment API slow. Cascading failure risk.</p>
              <p>⚠️ <strong className="text-white">No retry</strong> — if APNs fails, the notification is lost unless you build manual retry logic.</p>
              <p>⚠️ <strong className="text-white">Terrible for bursts</strong> — 10M event spike blocks all upstream services.</p>
              <p className="text-neon-red">Synchronous notifications are an anti-pattern. Never do this in production at scale.</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Summary decisions ─────────────────────────────────────────
const KEY_DECISIONS = [
  { label: "Event ingestion", value: "Kafka topics per priority: urgent / normal / marketing", color: "var(--neon-yellow)" },
  { label: "Channel routing", value: "User preference DB (PostgreSQL) + Redis cache (5min TTL)", color: "var(--neon-blue)" },
  { label: "Push delivery", value: "APNs HTTP/2 (connection pool) + FCM for Android", color: "var(--neon-green)" },
  { label: "Deduplication", value: "Redis key (user+template+hash), TTL per notification type", color: "var(--neon-purple)" },
  { label: "Rate limiting", value: "Redis counters per (user, channel), reset hourly", color: "var(--neon-orange)" },
  { label: "Templates", value: "PostgreSQL registry + Redis cache, A/B variants supported", color: "var(--neon-red)" },
];

export default function DesignNotificationSystemPage() {
  return (
    <ConceptPage
      slug="design-notification-system"
      analogy={
        <FunnyAnalogy
          emoji="🔔"
          color="var(--neon-yellow)"
          alternates={[
            { emoji: "📮", text: "A post office that sorts mail into urgent (registered), standard (letter), and bulk (flyer) piles — processed in that order, at different prices." },
            { emoji: "🍔", text: "A kitchen with separate cook stations for burgers (SMS), salads (email), and fries (push) — all fired from one order ticket (the event)." },
          ]}
        >
          A notification system is a <strong className="text-neon-yellow">multi-channel broadcast dispatcher</strong>
          with a bouncer at the door (rate limiter), a duplicate checker (dedup), and a VIP lane (priority queue)
          — because nobody wants 47 &ldquo;your order shipped&rdquo; emails.
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
                  "Send Push / SMS / Email notifications",
                  "User preference management (opt-in/out per channel)",
                  "Priority queuing (urgent > normal > marketing)",
                  "Deduplication within a time window",
                  "Rate limiting per user per channel",
                  "Template engine with localization",
                  "Delivery tracking and analytics",
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
                  "1-10B notifications/day across channels",
                  "Urgent notifications delivered < 5 seconds",
                  "High availability — critical alerts must arrive",
                  "At-least-once delivery (idempotent handlers)",
                  "GDPR compliance — opt-out must be instant",
                  "Scalable: burst from viral events (10M+/minute)",
                  "Extensible: new channels (WhatsApp, Slack) via plugin",
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
          <p className="mb-3 text-sm text-ink-secondary">Adjust MAU — watch the QPS per channel split:</p>
          <EnvelopeCalc />
        </Section>
      </ScrollReveal>

      {/* 3. Architecture */}
      <ScrollReveal>
        <Section kicker="Step 3" title="High-Level Architecture">
          <p className="mb-3 text-sm text-ink-secondary">Click any node for details. Hover to highlight connections.</p>
          <AnimatedDiagram
            height={420}
            nodes={[
              { id: "events", type: "server", label: "Event Sources", position: { x: 7, y: 50 }, status: "active", info: "Payment service, social service, marketing platform, security service. All fire events via REST or Kafka." },
              { id: "notif", type: "server", label: "Notification Svc", position: { x: 25, y: 50 }, status: "busy", info: "Core router. Validates event, checks user preferences, assigns priority, deduplicates, enqueues." },
              { id: "prefs", type: "database", label: "Preference DB", position: { x: 25, y: 20 }, status: "active", info: "PostgreSQL: user opt-ins per channel, quiet hours, language. Redis caches for 5 minutes." },
              { id: "dedup", type: "cache", label: "Dedup Cache", position: { x: 45, y: 20 }, status: "active", info: "Redis: hash(user+template+content) with TTL. Prevents duplicate notifications on retries." },
              { id: "kurgent", type: "queue", label: "Urgent Queue", position: { x: 45, y: 40 }, status: "busy", info: "Kafka topic: high-priority. Fraud alerts, OTPs, security notifications. Processed first." },
              { id: "knormal", type: "queue", label: "Normal Queue", position: { x: 45, y: 60 }, status: "active", info: "Kafka topic: standard. Social, transactional. Processed behind urgent." },
              { id: "kmarketing", type: "queue", label: "Marketing Queue", position: { x: 45, y: 80 }, status: "idle", info: "Kafka topic: bulk. Promotional. Processed off-peak (early morning, rate-limited)." },
              { id: "push", type: "server", label: "Push Handler", position: { x: 70, y: 30 }, status: "busy", info: "Formats APNs/FCM payloads. Connection pool to APNs HTTP/2. Batch sends. Token management." },
              { id: "email", type: "server", label: "Email Handler", position: { x: 70, y: 55 }, status: "active", info: "SendGrid/SES. Renders templates. DKIM signing. Bounce handling. Unsubscribe management." },
              { id: "sms", type: "server", label: "SMS Handler", position: { x: 70, y: 80 }, status: "active", info: "Twilio/SNS. Rate limited. International routing. 160-char content limit enforced." },
              { id: "delivery", type: "database", label: "Delivery Log", position: { x: 88, y: 50 }, status: "active", info: "Cassandra: tracks sent/delivered/failed per notification. Powers delivery analytics dashboard." },
            ]}
            edges={[
              { from: "events", to: "notif", animated: true, color: "var(--neon-blue)" },
              { from: "notif", to: "prefs", dashed: true, label: "check" },
              { from: "notif", to: "dedup", dashed: true, label: "dedup" },
              { from: "notif", to: "kurgent", animated: true, color: "var(--neon-red)" },
              { from: "notif", to: "knormal", animated: true, color: "var(--neon-yellow)" },
              { from: "notif", to: "kmarketing", animated: true, color: "var(--neon-blue)" },
              { from: "kurgent", to: "push", animated: true, color: "var(--neon-red)" },
              { from: "knormal", to: "email", animated: true, color: "var(--neon-yellow)" },
              { from: "knormal", to: "sms", animated: true, color: "var(--neon-purple)" },
              { from: "kmarketing", to: "email", dashed: true },
              { from: "push", to: "delivery" },
              { from: "email", to: "delivery" },
              { from: "sms", to: "delivery" },
            ]}
          />
        </Section>
      </ScrollReveal>

      {/* 4. Priority queue sim */}
      <ScrollReveal>
        <Section kicker="Step 4a — Star Feature" title="Interactive Priority Queue">
          <p className="mb-3 text-sm text-ink-secondary">
            Add notifications of different priorities. Watch <strong className="text-neon-red">urgent (100)</strong> always jump ahead of <strong className="text-neon-blue">marketing (10)</strong>:
          </p>
          <PriorityQueueSim />
        </Section>
      </ScrollReveal>

      {/* 4b. Rate limiter */}
      <ScrollReveal>
        <Section kicker="Step 4b" title="Per-User Rate Limiting">
          <p className="mb-3 text-sm text-ink-secondary">Send notifications to each user — hit the per-channel limit to see rate limiting in action:</p>
          <RateLimiterDemo />
        </Section>
      </ScrollReveal>

      {/* 4c. Deduplication */}
      <ScrollReveal>
        <Section kicker="Step 4c" title="Deduplication Window">
          <p className="mb-3 text-sm text-ink-secondary">Click the same button twice within the 5-minute window — the second one gets deduped:</p>
          <DeduplicationDemo />
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
        <Section kicker="Step 7" title="Trade-offs: Async vs Synchronous Delivery">
          <TradeoffToggle />
        </Section>
      </ScrollReveal>

      {/* ComparisonBattle */}
      <ScrollReveal>
        <Section kicker="Head to head" title="Push vs Email vs SMS">
          <ComparisonBattle
            left={{ name: "Push Notification", emoji: "📱", color: "var(--neon-green)", bestFor: "Real-time alerts for app users. Zero cost, instant delivery. Requires app install and opt-in." }}
            right={{ name: "Email", emoji: "📧", color: "var(--neon-blue)", bestFor: "Rich content, receipts, digests. Works without the app. Slower (minutes), but universal." }}
            features={[
              { label: "Delivery speed", a: "< 5s", b: "10-60s", winner: "a" },
              { label: "Open rate", a: 90, b: 22, max: 100, unit: "%", winner: "a" },
              { label: "Cost per send", a: "Free", b: "$0.001", winner: "a" },
              { label: "Requires app", a: "Yes", b: "No", winner: "b" },
              { label: "Rich content", a: "Limited", b: "Full HTML", winner: "b" },
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
          slug="design-notification-system"
          questions={[
            {
              question: "A user receives the same &ldquo;order shipped&rdquo; notification 47 times because the payment service retried the event. What prevents this?",
              options: [
                "The user manually dismisses duplicates",
                "Deduplication using a Redis key (user_id + template_id + content hash) with a TTL",
                "The notification service counts sends per user per day",
                "APNs filters duplicates automatically",
              ],
              correct: 1,
              explain: "A Redis key containing a hash of the (user, template, content) is set on first send with a TTL. Subsequent identical events within the TTL window are dropped. Emergency notifications bypass this check.",
            },
            {
              question: "Your notification system receives 10M events in 30 seconds from a viral campaign. How do you prevent it from overwhelming your push delivery workers?",
              options: [
                "Reject all non-urgent notifications during spikes",
                "Add more push delivery servers instantly via auto-scaling",
                "Priority Kafka queues: marketing events go to a low-priority topic processed by workers at a controlled rate",
                "Batch all 10M into a single APNs request",
              ],
              correct: 2,
              explain: "Marketing notifications go into a separate Kafka topic with fewer consumer workers. They drip into APNs at a safe rate. Urgent notifications in their own topic are unaffected. The queue acts as a shock absorber.",
            },
            {
              question: "A user opts out of push notifications. 10 seconds later, they still receive one. What went wrong?",
              options: [
                "APNs has a delivery lag that can&apos;t be avoided",
                "The user preference Redis cache had a 5-minute TTL and served a stale &ldquo;opted in&rdquo; value",
                "The notification was already in the queue before the opt-out",
                "Push notifications cannot be revoked once sent",
              ],
              correct: 1,
              explain: "Stale preference cache is a classic bug. The opt-out must immediately invalidate the Redis cache key (via Kafka event), not just update the DB. For critical compliance (GDPR), preference checks should always go to the DB for opt-outs.",
            },
            {
              question: "Why do notification systems use &ldquo;at-least-once&rdquo; delivery semantics instead of &ldquo;exactly-once&rdquo;?",
              options: [
                "Exactly-once delivery is impossible with Kafka",
                "It&apos;s cheaper — fewer messages to track",
                "At-least-once with idempotent handlers is simpler and more reliable; deduplication handles duplicates at the application layer",
                "Notification systems don&apos;t need delivery guarantees",
              ],
              correct: 2,
              explain: "Exactly-once across distributed systems (Kafka + APNs + DB) is extremely hard and expensive. At-least-once with application-layer dedup (Redis key check) achieves the same practical result with much simpler infrastructure.",
            },
            {
              question: "What is the role of the template engine in a notification system?",
              options: [
                "It compresses notification payloads to reduce bandwidth",
                "It personalizes notifications with user data, handles localization, and enables A/B testing without code deploys",
                "It converts push notifications to SMS when the app is uninstalled",
                "It deduplicates similar notifications before they reach the queue",
              ],
              correct: 1,
              explain: "Templates separate content from logic. &ldquo;Hello {name}, your order {order_id} shipped!&rdquo; is rendered server-side with real values. Localization, emoji support, and A/B variants are managed in the template registry — no code deploys needed for notification copy changes.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
