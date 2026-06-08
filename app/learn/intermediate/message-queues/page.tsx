"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SimulationWrapper } from "@/components/simulations/SimulationWrapper";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Msg {
  id: number;
  label: string;
  color: string;
}

interface SimEvent {
  id: number;
  time: string;
  text: string;
  color?: string;
}

const MSG_COLORS = [
  "var(--neon-blue)", "var(--neon-green)", "var(--neon-orange)",
  "var(--neon-purple)", "var(--neon-yellow)",
];

// ── Queue Simulation ──────────────────────────────────────────────────────────
function QueueSim() {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [producerRate, setProducerRate] = useState(2);
  const [consumerRate, setConsumerRate] = useState(2);
  const [numConsumers, setNumConsumers] = useState(2);

  const [queue, setQueue] = useState<Msg[]>([]);
  const [processed, setProcessed] = useState(0);
  const [dropped, setDropped] = useState(0);
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [depthHistory, setDepthHistory] = useState<{ t: number; depth: number }[]>([]);

  const tickRef = useRef(0);
  const msgIdRef = useRef(0);
  const evIdRef = useRef(0);

  const addEvent = useCallback((text: string, color?: string) => {
    const now = new Date();
    const time = `${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    setEvents((prev) => [{ id: evIdRef.current++, time, text, color }, ...prev].slice(0, 40));
  }, []);

  const reset = useCallback(() => {
    setPlaying(false);
    setQueue([]);
    setProcessed(0);
    setDropped(0);
    setEvents([]);
    setDepthHistory([]);
    tickRef.current = 0;
    msgIdRef.current = 0;
    evIdRef.current = 0;
  }, []);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current;

      setQueue((prev) => {
        let q = [...prev];

        // produce
        const toAdd = Math.floor(producerRate * speed);
        for (let i = 0; i < toAdd; i++) {
          if (q.length >= 30) {
            setDropped((d) => d + 1);
            if (i === 0) addEvent("⚠️ Queue full! Message dropped (dead-letter)", "var(--neon-red)");
          } else {
            const id = msgIdRef.current++;
            q.push({ id, label: `#${id}`, color: MSG_COLORS[id % MSG_COLORS.length] });
            if (id % 5 === 0) addEvent(`📩 Msg ${id} enqueued`, "var(--neon-blue)");
          }
        }

        // consume
        const totalRate = Math.floor(consumerRate * numConsumers * speed);
        const consumed = Math.min(totalRate, q.length);
        if (consumed > 0) {
          const ids = q.slice(0, consumed).map((m) => m.id);
          q = q.slice(consumed);
          setProcessed((p) => p + consumed);
          if (ids.length > 0 && t % 3 === 0) addEvent(`✅ Consumed ${consumed} msg(s)`, "var(--neon-green)");
        }

        setDepthHistory((h) => [...h, { t, depth: q.length }].slice(-60));
        return q;
      });
    }, 500 / speed);

    return () => clearInterval(interval);
  }, [playing, speed, producerRate, consumerRate, numConsumers, addEvent]);

  const depth = queue.length;
  const backpressure = depth > 20;

  const controls = (
    <div className="space-y-4">
      {[
        { label: "Producer rate (msg/s)", value: producerRate, min: 0, max: 6, step: 1, set: setProducerRate, color: "var(--neon-blue)" },
        { label: "Consumer rate (msg/s each)", value: consumerRate, min: 0, max: 6, step: 1, set: setConsumerRate, color: "var(--neon-green)" },
        { label: "# Consumers", value: numConsumers, min: 1, max: 6, step: 1, set: setNumConsumers, color: "var(--neon-purple)" },
      ].map((c) => (
        <div key={c.label}>
          <div className="mb-1 flex justify-between mono text-[0.6rem] uppercase tracking-wider text-ink-muted">
            <span>{c.label}</span>
            <span style={{ color: c.color }}>{c.value}</span>
          </div>
          <input
            type="range"
            min={c.min} max={c.max} step={c.step}
            value={c.value}
            onChange={(e) => c.set(Number(e.target.value))}
            className="w-full accent-[var(--neon-blue)]"
          />
        </div>
      ))}
      <div className="flex gap-2">
        <button
          className="btn-ghost flex-1 text-xs"
          onClick={() => { setNumConsumers(1); addEvent("🔥 Consumer killed! Backpressure building…", "var(--neon-red)"); }}
        >
          Kill Consumer 💀
        </button>
        <button
          className="btn-neon flex-1 text-xs"
          onClick={() => { setNumConsumers((n) => Math.min(6, n + 1)); addEvent("✨ Consumer added", "var(--neon-green)"); }}
        >
          Add Consumer ➕
        </button>
      </div>
    </div>
  );

  const simEvents = events.map((e) => ({ id: e.id, time: e.time, text: e.text, color: e.color }));

  return (
    <SimulationWrapper
      title="Message Queue Sim"
      playing={playing}
      onPlayPause={() => setPlaying((p) => !p)}
      onReset={reset}
      speed={speed}
      onSpeed={setSpeed}
      metrics={[
        { label: "Queue depth", value: depth, color: backpressure ? "var(--neon-red)" : "var(--neon-green)" },
        { label: "Processed", value: processed, color: "var(--neon-blue)" },
        { label: "Dropped (DLQ)", value: dropped, color: "var(--neon-red)" },
        { label: "Consumers", value: numConsumers, color: "var(--neon-purple)" },
      ]}
      events={simEvents}
      controls={controls}
      canvasHeight={320}
    >
      {/* Queue visualisation */}
      <div className="flex h-full flex-col items-center justify-center gap-4 px-4 py-3">
        <div className="w-full">
          <div className="mb-1 flex justify-between mono text-[0.6rem] text-ink-muted">
            <span>Queue ({depth}/30)</span>
            {backpressure && <span className="text-neon-red animate-pulse-glow">⚠️ BACKPRESSURE</span>}
          </div>
          <div
            className="relative flex h-12 items-center gap-1 overflow-x-auto rounded-xl border px-2 py-1"
            style={{ borderColor: backpressure ? "var(--neon-red)" : "var(--border-subtle)", background: backpressure ? "rgba(255,51,102,0.06)" : "var(--bg-tertiary)" }}
          >
            <AnimatePresence initial={false}>
              {queue.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="shrink-0 rounded-md px-1.5 py-0.5 mono text-[0.55rem] font-bold text-bg-primary"
                  style={{ background: m.color }}
                >
                  {m.label}
                </motion.div>
              ))}
            </AnimatePresence>
            {queue.length === 0 && <span className="text-ink-muted mono text-xs mx-auto">Queue is empty — hit Play ▶</span>}
          </div>
        </div>

        {/* Depth chart */}
        <div className="w-full" style={{ height: 140 }}>
          <div className="mono mb-1 text-[0.6rem] uppercase tracking-wider text-ink-muted">Queue depth over time</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={depthHistory} margin={{ top: 2, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="t" hide />
              <YAxis domain={[0, 30]} tick={{ fill: "var(--text-secondary)", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 8 }}
                formatter={(v: any) => [v, "depth"]}
              />
              <Line
                type="monotone"
                dataKey="depth"
                stroke={backpressure ? "var(--neon-red)" : "var(--neon-green)"}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SimulationWrapper>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MessageQueuesPage() {
  return (
    <ConceptPage
      slug="message-queues"
      analogy={
        <FunnyAnalogy
          emoji="🎫"
          color="var(--neon-orange)"
          alternates={[
            { emoji: "📬", text: "A mailbox: sender drops letter in, postal worker picks it up later. They never need to be there at the same time." },
            { emoji: "🍔", text: "A fast-food ticket system: cashier (producer) takes orders, kitchen (consumer) processes them. Kitchen overwhelmed? Tickets pile up." },
          ]}
        >
          Message queues are the <strong className="text-neon-orange">&ldquo;Now Serving #47&rdquo;</strong> system
          at the DMV. Producers hand out tickets; consumers call numbers when ready.
          Nobody has to stand face-to-face — and the DMV never crashes from a rush of people. Mostly.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="Why queues exist" title="Decoupling producers from consumers">
          <p className="text-ink-secondary">
            Without a queue, service A calls service B directly. If B is slow or down, A blocks or crashes.
            A queue sits between them: A drops work in, B picks it up when ready. They&apos;re
            <strong className="text-white"> asynchronously decoupled</strong> — neither needs to know the other&apos;s address or availability.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="★ Live simulation" title="Watch backpressure in real time">
          <p className="mb-3 text-sm text-ink-secondary">
            Ramp up producer speed, kill a consumer, and watch the queue fill (turns red = backpressure).
            Messages that exceed the limit go to the <strong className="text-neon-red">dead-letter queue</strong>.
          </p>
          <QueueSim />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Core concepts" title="The vocabulary">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "FIFO", d: "First In, First Out — messages processed in arrival order. Like a fair line.", c: "var(--neon-blue)", e: "1️⃣" },
              { t: "Priority Queue", d: "Higher-priority msgs jump the queue. Your CEO&apos;s report before intern&apos;s cron job.", c: "var(--neon-orange)", e: "⭐" },
              { t: "Dead-Letter Queue", d: "Failed or expired messages go here. Inspect them later without losing them.", c: "var(--neon-red)", e: "💀" },
              { t: "Delivery Guarantees", d: "At-most-once / at-least-once / exactly-once. Pick your poison (hint: exactly-once is hard).", c: "var(--neon-purple)", e: "📦" },
            ].map((x) => (
              <div key={x.t} className="card p-4">
                <div className="mb-1 text-2xl">{x.e}</div>
                <div className="font-display font-semibold" style={{ color: x.c }}>{x.t}</div>
                <p className="mt-1 text-xs text-ink-secondary">{x.d.replace("&apos;", "'")}</p>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Backpressure" title="When consumers can&apos;t keep up">
          <div className="card p-5 space-y-3">
            <p className="text-ink-secondary text-sm">
              Backpressure is when producers outpace consumers. The queue grows until it either{" "}
              <span className="text-neon-red">overflows (messages dropped)</span> or{" "}
              <span className="text-neon-orange">slows the producer</span>. Solutions:
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { s: "Scale consumers", d: "Add more consumer instances — horizontal scaling.", c: "var(--neon-green)" },
                { s: "Rate limit producers", d: "Tell producers to slow down. Explicit flow control.", c: "var(--neon-yellow)" },
                { s: "Increase queue capacity", d: "Buy time, but doesn&apos;t fix the root cause.", c: "var(--neon-blue)" },
              ].map((x) => (
                <div key={x.s} className="rounded-xl bg-bg-tertiary/50 p-3">
                  <div className="font-semibold text-sm" style={{ color: x.c }}>{x.s}</div>
                  <p className="text-xs text-ink-muted mt-0.5">{x.d.replace("&apos;", "'")}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="message-queues"
          questions={[
            {
              question: "What problem do message queues primarily solve?",
              options: [
                "Making databases faster",
                "Decoupling producers and consumers so they don't need to be available simultaneously",
                "Encrypting messages in transit",
                "Replacing REST APIs",
              ],
              correct: 1,
              explain: "Queues decouple services in time and availability — the producer and consumer never need to be online together.",
            },
            {
              question: "A dead-letter queue (DLQ) stores…",
              options: [
                "Messages successfully delivered",
                "Messages that failed processing or expired and couldn't be delivered",
                "The fastest messages",
                "Encrypted messages",
              ],
              correct: 1,
              explain: "DLQs catch poison pills and expired messages for inspection, preventing data loss.",
            },
            {
              question: "Backpressure occurs when…",
              options: [
                "Consumers are faster than producers",
                "The network drops packets",
                "Producers generate messages faster than consumers can process them",
                "The queue is empty",
              ],
              correct: 2,
              explain: "Backpressure = producers winning the race. Queue grows, and eventually something gives.",
            },
            {
              question: "Which delivery guarantee is hardest to achieve?",
              options: [
                "At-most-once",
                "At-least-once",
                "Exactly-once",
                "Best-effort",
              ],
              correct: 2,
              explain: "Exactly-once requires distributed coordination to prevent duplicates AND ensure delivery — very expensive.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
