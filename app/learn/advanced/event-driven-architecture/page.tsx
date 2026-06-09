"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventParticle {
  id: number;
  eventType: string;
  color: string;
  targetIds: string[];
  phase: "bus" | "fan" | "done";
  startedAt: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  { id: "order_placed", label: "OrderPlaced", emoji: "🛒", color: "var(--neon-blue)", source: "Shop" },
  { id: "payment_done", label: "PaymentDone", emoji: "💳", color: "var(--neon-green)", source: "Payment" },
  { id: "user_signup", label: "UserSignedUp", emoji: "👤", color: "var(--neon-purple)", source: "Auth" },
  { id: "stock_low", label: "StockLow", emoji: "📦", color: "var(--neon-yellow)", source: "Inventory" },
  { id: "ship_ready", label: "ShipReady", emoji: "🚚", color: "var(--neon-orange)", source: "Warehouse" },
];

const CONSUMERS = [
  { id: "email", label: "Email Service", emoji: "📧", subscribes: ["order_placed", "user_signup", "payment_done"] },
  { id: "analytics", label: "Analytics", emoji: "📊", subscribes: ["order_placed", "payment_done", "user_signup", "stock_low"] },
  { id: "inventory", label: "Inventory", emoji: "🗄️", subscribes: ["order_placed", "stock_low"] },
  { id: "shipping", label: "Shipping", emoji: "🚚", subscribes: ["payment_done", "ship_ready"] },
  { id: "crm", label: "CRM", emoji: "🤝", subscribes: ["user_signup", "order_placed"] },
];

const CONSUMER_COLORS: Record<string, string> = {
  email: "var(--neon-blue)",
  analytics: "var(--neon-green)",
  inventory: "var(--neon-yellow)",
  shipping: "var(--neon-orange)",
  crm: "var(--neon-purple)",
};

const PATTERNS = [
  {
    id: "pubsub",
    label: "Pub/Sub",
    emoji: "📡",
    description: "Publishers fire-and-forget. Subscribers listen for specific topics. Neither knows about the other. Perfect decoupling.",
    pro: "Zero coupling between producer and consumer",
    con: "No delivery guarantee by default — use a broker with durability",
    nodes: [
      { id: "pub1", label: "Publisher A", x: 10, y: 30 },
      { id: "pub2", label: "Publisher B", x: 10, y: 65 },
      { id: "broker", label: "Message Broker", x: 45, y: 47 },
      { id: "sub1", label: "Subscriber 1", x: 80, y: 20 },
      { id: "sub2", label: "Subscriber 2", x: 80, y: 47 },
      { id: "sub3", label: "Subscriber 3", x: 80, y: 74 },
    ],
    edges: [
      { from: "pub1", to: "broker" },
      { from: "pub2", to: "broker" },
      { from: "broker", to: "sub1" },
      { from: "broker", to: "sub2" },
      { from: "broker", to: "sub3" },
    ],
  },
  {
    id: "eventsourcing",
    label: "Event Sourcing",
    emoji: "📜",
    description: "Don't store the current state — store every event that led to it. The log IS your database. Replay it to reconstruct any past state.",
    pro: "Full audit log, time-travel queries, replay bugs",
    con: "Event log grows forever; eventual consistency is hard",
    nodes: [
      { id: "cmd", label: "Command", x: 8, y: 47 },
      { id: "agg", label: "Aggregate", x: 32, y: 47 },
      { id: "log", label: "Event Log", x: 57, y: 47 },
      { id: "v1", label: "View A", x: 82, y: 25 },
      { id: "v2", label: "View B", x: 82, y: 69 },
    ],
    edges: [
      { from: "cmd", to: "agg" },
      { from: "agg", to: "log" },
      { from: "log", to: "v1" },
      { from: "log", to: "v2" },
    ],
  },
  {
    id: "cqrs",
    label: "CQRS",
    emoji: "⚔️",
    description: "Command Query Responsibility Segregation. Reads and writes use SEPARATE models. Writes go to a normalized command DB; reads hit a denormalized read DB — no joins, blazing fast.",
    pro: "Reads scale independently; optimized query models",
    con: "Two databases to keep in sync — eventual consistency",
    nodes: [
      { id: "client", label: "Client", x: 8, y: 47 },
      { id: "cmdb", label: "Write DB", x: 45, y: 25 },
      { id: "readdb", label: "Read DB", x: 45, y: 69 },
      { id: "sync", label: "Event Sync", x: 72, y: 47 },
    ],
    edges: [
      { from: "client", to: "cmdb", label: "Command" },
      { from: "client", to: "readdb", label: "Query" },
      { from: "cmdb", to: "sync" },
      { from: "sync", to: "readdb" },
    ],
  },
];

// ─── Mini Pattern Diagram (inline SVG) ────────────────────────────────────────

function PatternDiagram({ pattern }: { pattern: typeof PATTERNS[0] }) {
  const NODE_W = 80;
  const NODE_H = 28;
  const W = 460;
  const H = 130;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="overflow-visible">
      {/* edges */}
      {pattern.edges.map((e, i) => {
        const from = pattern.nodes.find((n) => n.id === e.from);
        const to = pattern.nodes.find((n) => n.id === e.to);
        if (!from || !to) return null;
        const x1 = (from.x / 100) * W + NODE_W / 2;
        const y1 = (from.y / 100) * H + NODE_H / 2;
        const x2 = (to.x / 100) * W + NODE_W / 2;
        const y2 = (to.y / 100) * H + NODE_H / 2;
        return (
          <g key={i}>
            <motion.line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--neon-blue)"
              strokeWidth={1.5}
              strokeOpacity={0.5}
              strokeDasharray="4 3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            />
            {e.label && (
              <text
                x={(x1 + x2) / 2}
                y={(y1 + y2) / 2 - 4}
                textAnchor="middle"
                fill="var(--neon-blue)"
                fontSize={7}
                fontFamily="monospace"
                opacity={0.7}
              >
                {e.label}
              </text>
            )}
          </g>
        );
      })}
      {/* nodes */}
      {pattern.nodes.map((node) => {
        const x = (node.x / 100) * W;
        const y = (node.y / 100) * H;
        return (
          <motion.g key={node.id}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <rect
              x={x} y={y} width={NODE_W} height={NODE_H} rx={6}
              fill="var(--bg-tertiary)"
              stroke="var(--neon-blue)"
              strokeWidth={1}
              strokeOpacity={0.6}
            />
            <text
              x={x + NODE_W / 2}
              y={y + NODE_H / 2 + 4}
              textAnchor="middle"
              fill="var(--text-primary)"
              fontSize={8.5}
              fontFamily="monospace"
            >
              {node.label}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}

// ─── Event Bus Propagation Visualizer ─────────────────────────────────────────

let _particleId = 0;

function EventBusVisualizer() {
  const [particles, setParticles] = useState<EventParticle[]>([]);
  const [log, setLog] = useState<{ text: string; color: string; id: number }[]>([]);

  const fireEvent = useCallback((evType: typeof EVENT_TYPES[0]) => {
    const subscribers = CONSUMERS.filter((c) => c.subscribes.includes(evType.id));
    const pid = ++_particleId;
    const p: EventParticle = {
      id: pid,
      eventType: evType.label,
      color: evType.color,
      targetIds: subscribers.map((s) => s.id),
      phase: "bus",
      startedAt: Date.now(),
    };
    setParticles((prev) => [...prev.slice(-8), p]);
    setLog((prev) => [
      { text: `${evType.emoji} ${evType.label} → ${subscribers.length} consumer(s)`, color: evType.color, id: pid },
      ...prev.slice(0, 5),
    ]);
    setTimeout(() => {
      setParticles((prev) => prev.map((x) => x.id === pid ? { ...x, phase: "fan" } : x));
    }, 600);
    setTimeout(() => {
      setParticles((prev) => prev.filter((x) => x.id !== pid));
    }, 2200);
  }, []);

  return (
    <div className="card overflow-hidden p-5">
      {/* Fire event buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {EVENT_TYPES.map((et) => (
          <button
            key={et.id}
            onClick={() => fireEvent(et)}
            className="card card-hover flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition"
            style={{ borderColor: `${et.color}55`, color: et.color }}
          >
            {et.emoji} {et.label}
          </button>
        ))}
      </div>

      {/* Diagram */}
      <div className="relative" style={{ height: 320 }}>
        {/* Source label */}
        <div className="absolute left-0 top-0 mono text-[0.6rem] uppercase tracking-widest text-ink-muted">
          Event Sources
        </div>
        <div className="absolute left-[42%] top-0 mono text-[0.6rem] uppercase tracking-widest text-neon-blue">
          Event Bus
        </div>
        <div className="absolute right-0 top-0 mono text-[0.6rem] uppercase tracking-widest text-ink-muted">
          Consumers
        </div>

        {/* Sources */}
        <div className="absolute left-0 top-8 flex flex-col gap-3">
          {EVENT_TYPES.map((et) => (
            <div
              key={et.id}
              className="flex w-28 items-center gap-2 rounded-lg border px-2 py-1.5"
              style={{ borderColor: `${et.color}44`, background: `${et.color}0a` }}
            >
              <span className="text-base">{et.emoji}</span>
              <span className="text-[0.65rem] leading-tight" style={{ color: et.color }}>{et.source}</span>
            </div>
          ))}
        </div>

        {/* Bus node */}
        <motion.div
          className="absolute top-1/2 rounded-xl border-2 border-neon-blue/60 px-4 py-3 text-center"
          style={{
            left: "42%",
            transform: "translate(-50%,-50%)",
            background: "var(--bg-tertiary)",
            boxShadow: "0 0 24px -8px var(--neon-blue)",
            width: 110,
          }}
          animate={{ boxShadow: particles.length > 0 ? "0 0 36px -4px var(--neon-blue)" : "0 0 12px -8px var(--neon-blue)" }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-xl">📡</div>
          <div className="mt-1 mono text-[0.6rem] text-neon-blue">Event Bus</div>
        </motion.div>

        {/* Consumers */}
        <div className="absolute right-0 top-8 flex flex-col gap-3">
          {CONSUMERS.map((c) => {
            const active = particles.some((p) => p.phase === "fan" && p.targetIds.includes(c.id));
            return (
              <motion.div
                key={c.id}
                className="flex w-32 items-center gap-2 rounded-lg border px-2 py-1.5"
                animate={{
                  borderColor: active ? CONSUMER_COLORS[c.id] : "rgba(255,255,255,0.08)",
                  backgroundColor: active ? `${CONSUMER_COLORS[c.id]}18` : "transparent",
                  scale: active ? 1.04 : 1,
                }}
                transition={{ duration: 0.25 }}
              >
                <span className="text-base">{c.emoji}</span>
                <span className="text-[0.65rem] leading-tight text-ink-secondary">{c.label}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Animated particles */}
        <AnimatePresence>
          {particles.map((p) =>
            p.phase === "bus" ? (
              <motion.div
                key={`${p.id}-bus`}
                className="absolute rounded-full text-[0.55rem] font-bold px-2 py-0.5 pointer-events-none"
                style={{
                  background: p.color,
                  color: "var(--bg-primary)",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
                initial={{ left: "14%" }}
                animate={{ left: "36%" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                {p.eventType.slice(0, 8)}
              </motion.div>
            ) : p.phase === "fan" ? (
              p.targetIds.map((tid, ti) => {
                const consumer = CONSUMERS.findIndex((c) => c.id === tid);
                const targetY = 32 + consumer * 52 + 12;
                return (
                  <motion.div
                    key={`${p.id}-fan-${tid}`}
                    className="absolute w-2 h-2 rounded-full pointer-events-none"
                    style={{
                      background: p.color,
                      boxShadow: `0 0 8px ${p.color}`,
                      top: targetY,
                    }}
                    initial={{ left: "46%", opacity: 1 }}
                    animate={{ left: "65%", opacity: 0 }}
                    transition={{ duration: 0.6, delay: ti * 0.07, ease: "easeOut" }}
                  />
                );
              })
            ) : null
          )}
        </AnimatePresence>
      </div>

      {/* Event log */}
      <div className="mt-4 space-y-1 border-t border-[var(--border-subtle)] pt-3">
        <div className="mono text-[0.6rem] uppercase tracking-widest text-ink-muted mb-1">Event Log</div>
        <AnimatePresence>
          {log.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="mono text-xs"
              style={{ color: entry.color }}
            >
              › {entry.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {log.length === 0 && (
          <p className="mono text-xs text-ink-muted">Click an event above to watch it propagate…</p>
        )}
      </div>
    </div>
  );
}

// ─── Pattern Tabs ─────────────────────────────────────────────────────────────

function PatternTabs() {
  const [active, setActive] = useState(0);
  const p = PATTERNS[active];

  return (
    <div className="card overflow-hidden">
      <div className="flex border-b border-[var(--border-subtle)]">
        {PATTERNS.map((pat, i) => (
          <button
            key={pat.id}
            onClick={() => setActive(i)}
            className={cn(
              "flex-1 px-3 py-3 text-sm font-medium transition mono",
              i === active
                ? "border-b-2 border-neon-blue text-neon-blue bg-neon-blue/5"
                : "text-ink-secondary hover:text-white"
            )}
          >
            {pat.emoji} {pat.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="p-5"
        >
          <p className="mb-4 text-sm text-ink-secondary">{p.description}</p>
          <div style={{ height: 160 }}>
            <PatternDiagram pattern={p} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-neon-green/5 border border-neon-green/20 p-3 text-neon-green">
              ✓ {p.pro}
            </div>
            <div className="rounded-lg bg-neon-red/5 border border-neon-red/20 p-3 text-neon-red">
              ✗ {p.con}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventDrivenArchitecturePage() {
  return (
    <ConceptPage
      slug="event-driven-architecture"
      analogy={
        <FunnyAnalogy
          emoji="📰"
          color="var(--neon-blue)"
          alternates={[
            { emoji: "🔔", text: "Like push notifications: you subscribe once and get pinged whenever something happens, instead of refreshing every 5 seconds like an anxious intern." },
            { emoji: "🎸", text: "Radio broadcasting — one station transmits, millions receive. The station doesn't know you exist, and you don't need to call them." },
          ]}
        >
          <strong className="text-neon-blue">Newspaper subscription</strong> vs walking to the newsstand every morning.
          You subscribe once; the publisher pushes new editions to your door. You never block the publisher,
          the publisher never blocks you — and 10,000 other subscribers get the same paper simultaneously.
          That&apos;s event-driven architecture.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The big idea" title="Events over direct calls">
          <p className="text-ink-secondary">
            In a traditional request-driven system, Service A calls Service B and <em>waits</em>.
            In event-driven architecture, A fires an event onto a <strong className="text-neon-blue">bus</strong> and moves on.
            B, C, and D independently pick up the event and handle it. No waiting, no tight coupling —
            just a postal system where everyone gets their mail.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { title: "Decoupling", desc: "Producer doesn't know who consumes — add consumers without changing producers.", emoji: "🔗", color: "var(--neon-blue)" },
              { title: "Scalability", desc: "Each consumer scales independently. Email slow? Scale email pods, not the whole app.", emoji: "📈", color: "var(--neon-green)" },
              { title: "Resilience", desc: "Consumer down? The event stays in the bus. Process it when you revive.", emoji: "🛡️", color: "var(--neon-purple)" },
            ].map((c) => (
              <div key={c.title} className="card p-4">
                <div className="text-xl mb-2">{c.emoji}</div>
                <div className="font-display font-semibold" style={{ color: c.color }}>{c.title}</div>
                <div className="mt-1 text-sm text-ink-secondary">{c.desc}</div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Try it" title="Fire an event, watch it propagate">
          <p className="mb-4 text-sm text-ink-secondary">
            Click any event type to publish it onto the bus. Watch it fan out only to the consumers
            that have subscribed to that event — not everyone, not no one.
          </p>
          <EventBusVisualizer />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The architecture" title="One event, many independent reactions">
          <p className="mb-4 text-ink-secondary">
            The producer doesn&apos;t call anyone — it just publishes <span className="mono text-neon-blue">OrderPlaced</span>{" "}
            to the <strong className="text-neon-orange">broker</strong> and moves on. Each{" "}
            <strong className="text-neon-green">consumer</strong> reacts on its own, owns its own data, and can fail
            or scale without touching the others. Add a new consumer? The producer never changes. Click each box.
          </p>
          <AnimatedDiagram
            height={360}
            nodes={[
              { id: "order", type: "server", label: "Order Service", position: { x: 8, y: 50 }, status: "busy", info: "The producer. Saves the order and emits an OrderPlaced event. It doesn't know or care who listens." },
              { id: "bus", type: "queue", label: "Event Broker", position: { x: 36, y: 50 }, status: "active", info: "Kafka / SNS / EventBridge. Durably stores the event and delivers a copy to every subscriber (fan-out)." },
              { id: "email", type: "server", label: "Email Svc", position: { x: 72, y: 16 }, status: "busy", info: "Subscribes to OrderPlaced → sends a confirmation email. If it's down, the event waits for it." },
              { id: "inv", type: "server", label: "Inventory Svc", position: { x: 72, y: 50 }, status: "busy", info: "Subscribes to the same event → decrements stock. Completely unaware of the email service." },
              { id: "analytics", type: "server", label: "Analytics Svc", position: { x: 72, y: 84 }, status: "busy", info: "Also subscribes → updates dashboards. Added last week without changing the producer at all." },
            ]}
            edges={[
              { from: "order", to: "bus", animated: true, color: "var(--neon-blue)", label: "OrderPlaced" },
              { from: "bus", to: "email", animated: true, color: "var(--neon-green)" },
              { from: "bus", to: "inv", animated: true, color: "var(--neon-green)" },
              { from: "bus", to: "analytics", animated: true, color: "var(--neon-green)" },
            ]}
          />
          <p className="mt-3 text-xs text-ink-muted">Tip: contrast with direct calls — order service calling email, then inventory, then analytics in a chain. One slow call stalls the whole order. The broker breaks that coupling.</p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Patterns" title="Three ways to do event-driven">
          <PatternTabs />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Trade-offs" title="When events bite back">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: "Eventual consistency", desc: "Your read DB will be a few milliseconds behind your write DB. Live with it or design around it.", emoji: "⏱️", color: "var(--neon-yellow)" },
              { title: "Debugging hell", desc: "A chain of 12 async events is really hard to trace. You need distributed tracing (Jaeger, Zipkin).", emoji: "🔍", color: "var(--neon-red)" },
              { title: "Schema evolution", desc: "Changing an event schema breaks all consumers. Version your events. Always.", emoji: "📐", color: "var(--neon-orange)" },
              { title: "Ordering guarantees", desc: "Kafka gives ordered events per partition. Most brokers don't. Design accordingly.", emoji: "🔢", color: "var(--neon-purple)" },
            ].map((t) => (
              <div key={t.title} className="card p-4 flex gap-3">
                <span className="text-2xl">{t.emoji}</span>
                <div>
                  <div className="font-semibold" style={{ color: t.color }}>{t.title}</div>
                  <div className="mt-1 text-sm text-ink-secondary">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="event-driven-architecture"
          questions={[
            {
              question: "In Pub/Sub, what happens if a consumer is offline when an event fires?",
              options: [
                "The event is lost forever — classic programmer trauma",
                "The producer waits synchronously for the consumer to come back",
                "With a durable broker (Kafka, SQS), the event is stored and delivered when the consumer reconnects",
                "All other consumers are also blocked",
              ],
              correct: 2,
              explain: "Durable brokers persist events so offline consumers catch up. This is one of the key advantages over direct RPC calls.",
            },
            {
              question: "Event Sourcing stores…",
              options: [
                "Only the current state of each entity (like a normal DB)",
                "Every event that ever changed an entity — the log IS the database",
                "Events compressed into daily snapshots only",
                "The diff between the last two states",
              ],
              correct: 1,
              explain: "Event Sourcing records every mutation as an immutable event. Replay the log → reconstruct any past state. Very powerful, very verbose.",
            },
            {
              question: "CQRS splits the system into…",
              options: [
                "CPU and RAM — like hardware",
                "Separate models for handling Commands (writes) and Queries (reads)",
                "Synchronous and asynchronous services",
                "European and US data centers",
              ],
              correct: 1,
              explain: "Command Query Responsibility Segregation: writes hit the command model (normalized), reads hit the query model (denormalized for speed). Two models, zero joins in the read path.",
            },
            {
              question: "The biggest operational challenge of event-driven systems is…",
              options: [
                "They use too much memory",
                "Distributed tracing — following a single user action across 10 async events is genuinely hard",
                "They are slower than REST APIs",
                "Kafka is too expensive",
              ],
              correct: 1,
              explain: "Debugging async event chains is notoriously painful. Invest in distributed tracing (Jaeger, Zipkin, Datadog APM) from day one.",
            },
            {
              question: "Which pattern is best described as: 'Don&apos;t call us, we&apos;ll call you'?",
              options: ["REST polling", "Pub/Sub push events", "SQL SELECT loop", "gRPC bidirectional streaming"],
              correct: 1,
              explain: "Pub/Sub is the classic inversion of control: instead of consumers polling for updates, the broker pushes events to all registered subscribers.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
