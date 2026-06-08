"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Wifi, MessageSquare, Lock, Users, Server } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { cn } from "@/lib/utils";

// ── Back-of-envelope calculator ───────────────────────────────
function EnvelopeCalc() {
  const [users, setUsers] = useState(2000);
  const dau = Math.round(users * 0.5);
  const msgsPerDayPerUser = 40;
  const msgsPerDay = dau * msgsPerDayPerUser;
  const writeQPS = Math.round(msgsPerDay / 86400);
  const avgMsgSizeKB = 0.1;
  const storageTBperDay = (msgsPerDay * avgMsgSizeKB) / (1024 * 1024 * 1024);
  const wsConnections = dau; // each DAU = 1 WebSocket connection
  const bwGBperDay = Math.round((msgsPerDay * avgMsgSizeKB * 2) / (1024 * 1024));

  const rows = [
    { label: "Monthly Active Users", value: `${users}M`, color: "var(--neon-blue)" },
    { label: "Daily Active Users (50%)", value: `${dau}M`, color: "var(--neon-blue)" },
    { label: "Messages / day", value: `${(msgsPerDay / 1e9).toFixed(1)}B`, color: "var(--neon-green)" },
    { label: "Write QPS (messages)", value: `${(writeQPS / 1000).toFixed(0)}K`, color: "var(--neon-green)" },
    { label: "Concurrent WebSockets", value: `${dau}M`, color: "var(--neon-yellow)" },
    { label: "Storage / day (text only)", value: `${storageTBperDay.toFixed(2)} TB`, color: "var(--neon-purple)" },
    { label: "Bandwidth / day", value: `${bwGBperDay} GB`, color: "var(--neon-red)" },
    { label: "Avg message size", value: `${avgMsgSizeKB * 1024} bytes`, color: "var(--neon-orange)" },
  ];

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="mono text-xs text-neon-green uppercase tracking-widest">MAU (millions)</span>
        <input
          type="range" min={100} max={3000} step={100} value={users}
          onChange={(e) => setUsers(Number(e.target.value))}
          className="flex-1 accent-green-400"
        />
        <span className="mono text-neon-green font-bold w-16 text-right">{users}M</span>
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

// ── WebSocket connection lifecycle animation ──────────────────
type MsgState = "idle" | "sending" | "sent" | "delivered" | "read";

function MessageLifecycle() {
  const [state, setState] = useState<MsgState>("idle");
  const [recipientOnline, setRecipientOnline] = useState(true);
  const [animating, setAnimating] = useState(false);

  const TICK_STEPS: { label: string; tick: string; color: string; delay: number }[] = [
    { label: "Message sent to server", tick: "✓", color: "var(--neon-yellow)", delay: 0 },
    { label: recipientOnline ? "Delivered to recipient" : "Stored (offline delivery)", tick: "✓✓", color: "var(--neon-green)", delay: 800 },
    { label: "Read by recipient", tick: "✓✓", color: "var(--neon-blue)", delay: 1600 },
  ];

  const send = () => {
    if (animating) return;
    setAnimating(true);
    setState("sending");
    setTimeout(() => setState("sent"), 400);
    setTimeout(() => setState("delivered"), 1200);
    setTimeout(() => setState("read"), 2000);
    setTimeout(() => setAnimating(false), 2400);
  };

  const stateToStep = { idle: -1, sending: -1, sent: 0, delivered: 1, read: 2 };
  const currentStep = stateToStep[state];

  const STORE_STEPS = [
    "Sender sends message",
    "Chat Service checks: is recipient online?",
    recipientOnline ? "✅ Online → Push via WebSocket" : "❌ Offline → Store in message DB",
    recipientOnline ? "Recipient receives, sends ACK" : "Recipient connects later, fetches messages",
    "Single ✓ → Double ✓ → Blue ✓✓",
  ];

  return (
    <div className="card p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="font-display font-semibold text-white">Message Delivery Lifecycle</span>
        <label className="flex items-center gap-2 text-sm text-ink-secondary cursor-pointer">
          <span>Recipient:</span>
          <button
            onClick={() => { setRecipientOnline((o) => !o); setState("idle"); }}
            className={cn("rounded-full px-3 py-1 text-xs font-semibold transition", recipientOnline ? "bg-neon-green/20 text-neon-green border border-neon-green/40" : "bg-neon-red/20 text-neon-red border border-neon-red/40")}
          >
            {recipientOnline ? "🟢 Online" : "🔴 Offline"}
          </button>
        </label>
      </div>

      {/* Message bubble with tick indicator */}
      <div className="flex justify-end">
        <div className="max-w-[200px] rounded-2xl rounded-tr-sm bg-neon-green/15 border border-neon-green/30 px-4 py-3">
          <p className="text-sm text-white">Hey, are you there? 👋</p>
          <div className="mt-1 flex items-center justify-end gap-1">
            <span className="text-[0.6rem] text-ink-muted">12:34</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={state}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mono text-xs font-bold"
                style={{
                  color: state === "read" ? "var(--neon-blue)"
                    : state === "delivered" ? "var(--neon-green)"
                    : state === "sent" ? "var(--text-secondary)"
                    : "transparent"
                }}
              >
                {state === "idle" ? "" : state === "sending" ? "⏳" : state === "sent" ? "✓" : state === "delivered" ? "✓✓" : "✓✓"}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Tick legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {TICK_STEPS.map((t, i) => (
          <div key={t.tick + i} className={cn("flex items-center gap-1.5 rounded-lg border px-2 py-1 transition", currentStep >= i ? "opacity-100" : "opacity-30")}
            style={currentStep >= i ? { borderColor: t.color, background: `${t.color}15` } : {}}>
            <span className="mono font-bold" style={{ color: t.color }}>{t.tick}</span>
            <span className="text-ink-secondary">{t.label}</span>
          </div>
        ))}
      </div>

      {/* Flow steps */}
      <div className="rounded-xl bg-bg-tertiary/50 p-3 space-y-1.5">
        <div className="mono text-[0.6rem] uppercase tracking-widest text-neon-blue mb-2">Message Flow</div>
        {STORE_STEPS.map((s, i) => (
          <div key={s} className={cn("flex items-center gap-2 text-xs transition", currentStep + 1 >= i ? "text-white" : "text-ink-muted")}>
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", currentStep + 1 >= i ? "bg-neon-green" : "bg-ink-muted")} />
            {s}
          </div>
        ))}
      </div>

      <button
        onClick={send}
        disabled={animating}
        className={cn("btn-neon text-xs w-full justify-center", animating && "opacity-50 cursor-not-allowed")}
      >
        {animating ? "Delivering…" : "▶ Send Message"}
      </button>
    </div>
  );
}

// ── Group fan-out visualization ───────────────────────────────
function GroupFanout() {
  const [memberCount, setMemberCount] = useState(5);
  const [sent, setSent] = useState(false);
  const [deliveredTo, setDeliveredTo] = useState<number[]>([]);

  const members = Array.from({ length: memberCount }, (_, i) => i);

  const send = () => {
    setSent(true);
    setDeliveredTo([]);
    members.forEach((m) => {
      setTimeout(() => setDeliveredTo((prev) => [...prev, m]), m * 150 + 200);
    });
  };

  const reset = () => { setSent(false); setDeliveredTo([]); };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold text-white">Group Message Fan-out</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-secondary">Members:</span>
          <input type="range" min={2} max={256} step={1} value={memberCount}
            onChange={(e) => { setMemberCount(Number(e.target.value)); reset(); }}
            className="w-24 accent-purple-400" />
          <span className="mono text-neon-purple text-sm font-bold w-8">{memberCount}</span>
        </div>
      </div>

      <div className="rounded-xl bg-bg-tertiary/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl border-2 border-neon-purple bg-neon-purple/20 flex items-center justify-center">
            <span className="text-lg">👤</span>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-white">Sender</div>
            <div className="text-xs text-ink-muted">Posting to group</div>
          </div>
        </div>

        {/* Connection lines to members */}
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <motion.div
              key={m}
              className={cn("rounded-lg border px-2 py-1 text-xs transition")}
              animate={{
                borderColor: deliveredTo.includes(m) ? "var(--neon-green)" : "var(--border-subtle)",
                background: deliveredTo.includes(m) ? "rgba(0,255,136,0.1)" : "transparent",
              }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-ink-secondary">M{m + 1}</span>
              {deliveredTo.includes(m) && <span className="ml-1 text-neon-green">✓</span>}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="text-xs text-ink-secondary rounded-lg bg-bg-tertiary/50 p-3">
        {memberCount <= 100
          ? <><span className="text-neon-green font-semibold">Direct fan-out:</span> Chat Service writes to each member&apos;s message store directly. Fine for small groups.</>
          : <><span className="text-neon-yellow font-semibold">Queue-based fan-out:</span> For large groups ({memberCount} members), a Kafka job fans out asynchronously to avoid blocking. Meta broadcasts are ≥ 1K member groups.</>
        }
      </div>

      <div className="flex gap-2">
        <button onClick={send} disabled={sent} className={cn("btn-neon text-xs flex-1 justify-center", sent && "opacity-50 cursor-not-allowed")}>
          ▶ Send to Group
        </button>
        <button onClick={reset} className="btn-ghost text-xs">Reset</button>
      </div>
    </div>
  );
}

// ── E2E encryption key exchange ───────────────────────────────
function E2EKeyExchange() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "Alice generates key pair (public + private)", color: "var(--neon-blue)", note: "Private key NEVER leaves Alice&apos;s device. Ever." },
    { label: "Alice uploads public key to WhatsApp server", color: "var(--neon-green)", note: "Server stores public keys only — useless without the private key." },
    { label: "Bob wants to message Alice — fetches Alice&apos;s public key", color: "var(--neon-yellow)", note: "Bob&apos;s app downloads Alice&apos;s public key from the server." },
    { label: "Bob encrypts message with Alice&apos;s public key", color: "var(--neon-purple)", note: "Only Alice&apos;s private key can decrypt this ciphertext." },
    { label: "Encrypted message sent to server, forwarded to Alice", color: "var(--neon-orange)", note: "WhatsApp server sees only ciphertext — it cannot read the message." },
    { label: "Alice decrypts with her private key → reads message", color: "var(--neon-green)", note: "End-to-end encrypted. Even WhatsApp can&apos;t read it." },
  ];

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold text-white">E2E Encryption (Signal Protocol)</span>
        <Lock size={16} className="text-neon-green" />
      </div>

      <div className="space-y-2">
        {steps.map((s, i) => (
          <motion.button
            key={s.label}
            onClick={() => setStep(i)}
            className={cn(
              "w-full text-left rounded-xl border px-4 py-3 transition",
              step === i ? "border-current" : "border-[var(--border-subtle)] hover:border-white/20"
            )}
            style={step === i ? { borderColor: s.color, background: `${s.color}12` } : {}}
            animate={{ opacity: step >= i ? 1 : 0.5 }}
          >
            <div className="flex items-center gap-2">
              <span className="mono text-xs" style={{ color: s.color }}>Step {i + 1}</span>
              <span className="text-sm text-white">{s.label}</span>
            </div>
            <AnimatePresence>
              {step === i && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-1 text-xs text-ink-secondary"
                >
                  💡 {s.note}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      <div className="rounded-xl bg-neon-green/10 border border-neon-green/30 p-3 text-xs text-neon-green">
        🔐 WhatsApp uses the <strong>Signal Protocol</strong> (Double Ratchet + X3DH). Messages are encrypted before leaving your device. The server is just a relay — it can&apos;t read your messages.
      </div>
    </div>
  );
}

// ── Deep dive components ──────────────────────────────────────
const COMPONENTS = [
  {
    icon: <Wifi size={18} />, title: "WebSocket Layer", color: "var(--neon-blue)",
    content: "Each mobile client maintains a persistent WebSocket connection to a Chat Server. At 2B DAU × 50% online = 1B concurrent connections. These are distributed across a fleet of stateless Chat Servers behind a load balancer. Connection state (which server holds which user) is tracked in Redis for routing.",
  },
  {
    icon: <MessageSquare size={18} />, title: "Chat Service", color: "var(--neon-green)",
    content: "Receives messages from WebSocket layer. Looks up recipient&apos;s connection in Redis. If online: push directly via WebSocket ACK. If offline: write to Message DB (Cassandra), queue a push notification. Each message gets a unique server-generated ID for ordering.",
  },
  {
    icon: <Server size={18} />, title: "Message Store", color: "var(--neon-purple)",
    content: "Cassandra: write-heavy, partition by chat_id, sort by message_id. Supports millions of writes/sec. Messages are NOT stored forever on the server — WhatsApp deletes from server after delivery ACK. Client devices store message history locally (SQLite). Server is just a relay.",
  },
  {
    icon: <Users size={18} />, title: "Group Messaging", color: "var(--neon-yellow)",
    content: "Small groups (< 100 members): direct fan-out — Chat Service writes to each member individually. Large groups (1000+ members like broadcast lists): Kafka-based async fan-out. Group metadata (membership list) is sharded and cached in Redis. Group message IDs are globally ordered via a distributed sequence generator.",
  },
  {
    icon: <Lock size={18} />, title: "E2E Encryption", color: "var(--neon-orange)",
    content: "Signal Protocol: each user has a long-term identity key pair and a set of one-time pre-keys uploaded to the server. The Double Ratchet algorithm generates a new encryption key for every message — compromise of one key doesn&apos;t expose past or future messages. WhatsApp&apos;s servers only see ciphertext.",
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
    problem: "1B concurrent WebSocket connections — single load balancer can&apos;t hold them all.",
    solution: "WebSocket connections are sticky — a client connects to the same Chat Server for its session. A consistent-hash-based load balancer routes by user_id. Redis tracks the user_id → Chat Server mapping. When a Chat Server dies, clients reconnect and the mapping is updated.",
    color: "var(--neon-red)",
  },
  {
    problem: "Message ordering in group chats — two servers write simultaneously, messages appear out of order.",
    solution: "Each message gets a Lamport timestamp or a distributed sequence number (Snowflake ID). Cassandra sorts by message_id. Clients apply vector clocks for local ordering before display. Server assigns a monotonically increasing sequence ID per chat_id.",
    color: "var(--neon-yellow)",
  },
  {
    problem: "Push notifications fail — APNs/FCM rate limits or drops during a spike.",
    solution: "Retry queue with exponential backoff. Each failed push is re-queued with a delay. If the device comes online via WebSocket before the push is delivered, the notification is cancelled (already delivered). Client pulls missed messages on reconnect regardless.",
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
  const [mode, setMode] = useState<"e2e" | "server">("e2e");
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => setMode("e2e")}
          className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition", mode === "e2e" ? "bg-neon-green/20 text-neon-green border border-neon-green/40" : "text-ink-secondary")}
        >
          E2E Encrypted (WhatsApp)
        </button>
        <span className="text-ink-muted text-sm">vs</span>
        <button
          onClick={() => setMode("server")}
          className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition", mode === "server" ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/40" : "text-ink-secondary")}
        >
          Server-Side Encryption
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
          {mode === "e2e" ? (
            <>
              <p>✅ <strong className="text-white">Maximum privacy</strong> — server sees only ciphertext. Can&apos;t be court-ordered to hand over messages.</p>
              <p>✅ <strong className="text-white">Forward secrecy</strong> — Double Ratchet means past messages are safe even if current key is compromised.</p>
              <p>⚠️ <strong className="text-white">No server-side search</strong> — can&apos;t search messages on a new device without local backup.</p>
              <p>⚠️ <strong className="text-white">Backup is a weak point</strong> — iCloud/Google Drive backups may not be E2E encrypted.</p>
              <p className="text-neon-green">WhatsApp uses E2E by default since 2016 via the Signal Protocol.</p>
            </>
          ) : (
            <>
              <p>✅ <strong className="text-white">Server-side search</strong> — index and search messages across devices.</p>
              <p>✅ <strong className="text-white">Easier moderation</strong> — server can detect spam, CSAM, illegal content.</p>
              <p>⚠️ <strong className="text-white">Privacy risk</strong> — server operator can read all messages; government requests are viable.</p>
              <p>⚠️ <strong className="text-white">Single point of compromise</strong> — breach of server key exposes all messages ever sent.</p>
              <p className="text-neon-blue">Most enterprise Slack-style tools use server-side encryption for compliance reasons.</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Summary ───────────────────────────────────────────────────
const KEY_DECISIONS = [
  { label: "Real-time transport", value: "WebSocket for online users, APNs/FCM for offline push", color: "var(--neon-blue)" },
  { label: "Message store", value: "Cassandra partitioned by chat_id, sorted by message_id", color: "var(--neon-green)" },
  { label: "Delivery ACKs", value: "Single ✓ (server got it), Double ✓ (delivered), Blue ✓✓ (read)", color: "var(--neon-yellow)" },
  { label: "Server-side retention", value: "Deleted after delivery ACK — server is a relay, not storage", color: "var(--neon-purple)" },
  { label: "Group fan-out", value: "Direct for small groups; Kafka-based async for large groups", color: "var(--neon-orange)" },
  { label: "Encryption", value: "Signal Protocol (Double Ratchet + X3DH), E2E by default", color: "var(--neon-red)" },
];

export default function DesignWhatsAppPage() {
  return (
    <ConceptPage
      slug="design-whatsapp"
      analogy={
        <FunnyAnalogy
          emoji="💬"
          color="var(--neon-green)"
          alternates={[
            { emoji: "📮", text: "If the recipient is home, the postman knocks (WebSocket push). If they&apos;re out, the letter is held at the post office (store-and-forward) until they return." },
            { emoji: "🔐", text: "WhatsApp is like sending a locked safe. Only the recipient has the key. Even the delivery truck (server) can&apos;t open it." },
          ]}
        >
          WhatsApp is a <strong className="text-neon-green">real-time message relay with a brilliant fallback</strong>:
          if you&apos;re online, you get it instantly via WebSocket. If you&apos;re not, it waits patiently.
          The ticks are just receipts — and the server can&apos;t read a single word.
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
                  "1:1 and group messaging (text, media)",
                  "Message delivery receipts (sent / delivered / read)",
                  "Online presence (last seen)",
                  "Push notifications for offline users",
                  "Group chats (up to 1024 members)",
                  "End-to-end encryption",
                  "Voice and video calls",
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
                  "2B MAU, ~100B messages/day",
                  "Message delivery < 100ms (online to online)",
                  "Highly available — messages must never be lost",
                  "Low server storage — relay model, not archive",
                  "E2E encryption mandatory",
                  "Works on low-bandwidth mobile networks",
                  "Global — sub-100ms to nearest server",
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
          <p className="mb-3 text-sm text-ink-secondary">Drag the MAU slider — watch the scale of this beast:</p>
          <EnvelopeCalc />
        </Section>
      </ScrollReveal>

      {/* 3. High-level architecture */}
      <ScrollReveal>
        <Section kicker="Step 3" title="High-Level Architecture">
          <p className="mb-3 text-sm text-ink-secondary">Click any node for details. Hover to highlight connections.</p>
          <AnimatedDiagram
            height={400}
            nodes={[
              { id: "clientA", type: "client", label: "Alice (Sender)", position: { x: 8, y: 30 }, status: "active", info: "Holds a persistent WebSocket to a Chat Server. Encrypts message locally before sending." },
              { id: "clientB", type: "client", label: "Bob (Recipient)", position: { x: 8, y: 70 }, status: "active", info: "If online: receives message via WebSocket push. If offline: gets APNs/FCM notification, fetches on reconnect." },
              { id: "lb", type: "loadbalancer", label: "WS Load Balancer", position: { x: 28, y: 50 }, status: "active", info: "Routes WebSocket connections to Chat Servers. Consistent hashing by user_id for sticky sessions." },
              { id: "chat1", type: "server", label: "Chat Server 1", position: { x: 48, y: 25 }, status: "busy", info: "Holds WebSocket connections. Routes messages. Checks recipient status in Redis." },
              { id: "chat2", type: "server", label: "Chat Server 2", position: { x: 48, y: 75 }, status: "busy", info: "Another Chat Server. Each holds ~50K persistent connections." },
              { id: "redis", type: "cache", label: "Presence Cache", position: { x: 68, y: 50 }, status: "active", info: "Redis: user_id → {server_id, last_seen}. Heartbeats update every 30s. TTL of 60s marks you offline." },
              { id: "msgdb", type: "database", label: "Message Store", position: { x: 85, y: 25 }, status: "active", info: "Cassandra: chat_id (partition) + message_id (sort). Write-optimized. Messages deleted after delivery ACK." },
              { id: "notif", type: "server", label: "Push Notification", position: { x: 85, y: 75 }, status: "active", info: "Sends APNs (iOS) / FCM (Android) notifications for offline users. Retries with backoff." },
              { id: "keyserver", type: "database", label: "Key Server", position: { x: 68, y: 15 }, status: "active", info: "Stores public keys for E2E encryption. Private keys NEVER leave the device." },
            ]}
            edges={[
              { from: "clientA", to: "lb", animated: true, color: "var(--neon-green)" },
              { from: "clientB", to: "lb", animated: true, color: "var(--neon-blue)" },
              { from: "lb", to: "chat1", animated: true, color: "var(--neon-green)" },
              { from: "lb", to: "chat2", animated: true, color: "var(--neon-blue)" },
              { from: "chat1", to: "redis", animated: true, color: "var(--neon-yellow)", label: "presence" },
              { from: "chat2", to: "redis", animated: true, color: "var(--neon-yellow)" },
              { from: "chat1", to: "msgdb", color: "var(--neon-purple)" },
              { from: "chat2", to: "msgdb", color: "var(--neon-purple)" },
              { from: "chat1", to: "notif", dashed: true, label: "offline" },
              { from: "chat2", to: "notif", dashed: true },
              { from: "clientA", to: "keyserver", dashed: true, label: "pubkey" },
            ]}
          />
        </Section>
      </ScrollReveal>

      {/* 4. Message lifecycle */}
      <ScrollReveal>
        <Section kicker="Step 4a — Star Feature" title="Message Delivery & Tick Animation">
          <p className="mb-3 text-sm text-ink-secondary">Toggle the recipient online/offline — see how the delivery flow changes:</p>
          <MessageLifecycle />
        </Section>
      </ScrollReveal>

      {/* 4b. Group fan-out */}
      <ScrollReveal>
        <Section kicker="Step 4b" title="Group Message Fan-out">
          <p className="mb-3 text-sm text-ink-secondary">Adjust group size to see when fan-out strategy switches from direct to queue-based:</p>
          <GroupFanout />
        </Section>
      </ScrollReveal>

      {/* 4c. E2E encryption */}
      <ScrollReveal>
        <Section kicker="Step 4c" title="End-to-End Encryption Key Exchange">
          <p className="mb-3 text-sm text-ink-secondary">Click each step to walk through the Signal Protocol key exchange:</p>
          <E2EKeyExchange />
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
        <Section kicker="Step 7" title="Trade-offs: E2E Encryption vs Server-Side">
          <TradeoffToggle />
        </Section>
      </ScrollReveal>

      {/* ComparisonBattle */}
      <ScrollReveal>
        <Section kicker="Head to head" title="WebSocket vs HTTP Polling">
          <ComparisonBattle
            left={{ name: "WebSocket", emoji: "⚡", color: "var(--neon-green)", bestFor: "Real-time chat, presence, live notifications — persistent bidirectional channel." }}
            right={{ name: "HTTP Long Polling", emoji: "🔄", color: "var(--neon-blue)", bestFor: "Environments where WebSockets are blocked (strict firewalls). Higher overhead." }}
            features={[
              { label: "Latency", a: "< 50ms", b: "500-1000ms", winner: "a" },
              { label: "Server connections", a: "Persistent", b: "New per poll", winner: "a" },
              { label: "Bandwidth overhead", a: 10, b: 80, max: 100, unit: "%", winner: "a" },
              { label: "Firewall friendly", a: "Usually", b: "Always", winner: "b" },
              { label: "Server complexity", a: "High", b: "Low", winner: "b" },
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
          slug="design-whatsapp"
          questions={[
            {
              question: "What happens when you send a WhatsApp message to an offline user?",
              options: [
                "The message is lost — WhatsApp only supports real-time delivery",
                "The message is stored in Cassandra on the server and pushed via APNs/FCM when the user reconnects",
                "The message stays in the sender&apos;s outbox until the recipient comes online",
                "The message is sent via SMS as fallback",
              ],
              correct: 1,
              explain: "Store-and-forward: the server persists the encrypted message in Cassandra and sends a push notification. When the recipient opens the app, it fetches and delivers the message, then the server deletes its copy.",
            },
            {
              question: "What does the double blue tick (✓✓) in WhatsApp indicate?",
              options: [
                "The message was sent to WhatsApp&apos;s server",
                "The message was delivered to the recipient&apos;s device",
                "The recipient has opened and read the message",
                "The message was encrypted successfully",
              ],
              correct: 2,
              explain: "Single grey ✓ = server received it. Double grey ✓✓ = delivered to recipient&apos;s device. Double blue ✓✓ = recipient opened the chat and read the message.",
            },
            {
              question: "Why does WhatsApp use Cassandra for message storage?",
              options: [
                "Because it supports SQL joins for group message queries",
                "For strong ACID guarantees on message delivery",
                "Write-heavy workload with simple access patterns — partition by chat_id, sort by message_id",
                "It&apos;s cheaper than MySQL",
              ],
              correct: 2,
              explain: "Cassandra is optimized for high-write throughput. Partitioning by chat_id means all messages for a conversation are co-located. Sorting by message_id gives efficient ordered retrieval. No complex joins needed.",
            },
            {
              question: "How does WhatsApp handle 1B concurrent WebSocket connections?",
              options: [
                "A single massive server with 1B threads",
                "Stateless HTTP requests without persistent connections",
                "A fleet of Chat Servers each holding ~50K connections; Redis tracks user → server mapping for routing",
                "Clients poll every second instead of maintaining connections",
              ],
              correct: 2,
              explain: "No single server handles 1B connections. A fleet of Chat Servers distributes the load. Redis caches which server holds which user. When routing a message, the Chat Service looks up Redis to find the recipient&apos;s server.",
            },
            {
              question: "Can WhatsApp read your messages?",
              options: [
                "Yes — they store decrypted messages for ad targeting",
                "No — messages are E2E encrypted with the Signal Protocol; server only sees ciphertext",
                "Only group messages — 1:1 messages are E2E encrypted",
                "Yes — but only government-requested messages",
              ],
              correct: 1,
              explain: "The Signal Protocol encrypts messages on the sender&apos;s device. The server is a relay that only sees ciphertext. Even WhatsApp engineers with DB access cannot read your messages. The private key never leaves your device.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
