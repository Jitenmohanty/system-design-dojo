"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { cn } from "@/lib/utils";
import { Zap, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

// ─── Service definitions ─────────────────────────────────────────────────────
const SERVICES = [
  { id: "user",         label: "User",         emoji: "👤", color: "var(--neon-blue)",   col: 1, row: 0 },
  { id: "auth",         label: "Auth",          emoji: "🔐", color: "var(--neon-purple)", col: 2, row: 0 },
  { id: "order",        label: "Order",         emoji: "📦", color: "var(--neon-green)",  col: 0, row: 1 },
  { id: "payment",      label: "Payment",       emoji: "💳", color: "var(--neon-yellow)", col: 1, row: 1 },
  { id: "inventory",    label: "Inventory",     emoji: "🏪", color: "var(--neon-orange)", col: 2, row: 1 },
  { id: "notification", label: "Notification",  emoji: "🔔", color: "var(--neon-red)",    col: 3, row: 1 },
  { id: "search",       label: "Search",        emoji: "🔍", color: "var(--neon-blue)",   col: 0, row: 2 },
  { id: "analytics",    label: "Analytics",     emoji: "📊", color: "var(--neon-purple)", col: 3, row: 0 },
] as const;

// service edges (dependencies)
const EDGES: Array<{ from: string; to: string }> = [
  { from: "user",    to: "auth" },
  { from: "order",   to: "payment" },
  { from: "order",   to: "inventory" },
  { from: "order",   to: "notification" },
  { from: "payment", to: "notification" },
  { from: "user",    to: "order" },
  { from: "search",  to: "inventory" },
  { from: "user",    to: "analytics" },
  { from: "order",   to: "analytics" },
];

type ServiceId = (typeof SERVICES)[number]["id"];

// who depends on whom (who breaks when a service goes down)
const DEPENDENTS: Record<ServiceId, ServiceId[]> = {
  user:         ["order", "analytics"],
  auth:         ["user"],
  order:        ["payment", "inventory", "notification", "analytics"],
  payment:      ["notification"],
  inventory:    ["order", "search"],
  notification: [],
  search:       [],
  analytics:    [],
};

// ─── Microservices Diagram ────────────────────────────────────────────────────
function MicroservicesDiagram() {
  const [deadServices, setDeadServices] = useState<Set<ServiceId>>(new Set());
  const [circuitBreaker, setCircuitBreaker] = useState(true);
  const [monolithView, setMonolithView] = useState(false);

  const toggleService = (id: ServiceId) => {
    setDeadServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // cascade if circuit breaker is OFF
        if (!circuitBreaker) {
          const cascade = (svcId: ServiceId, depth: number) => {
            if (depth > 3) return;
            (DEPENDENTS[svcId] ?? []).forEach((dep) => {
              next.add(dep as ServiceId);
              cascade(dep as ServiceId, depth + 1);
            });
          };
          cascade(id, 0);
        }
      }
      return next;
    });
  };

  const reset = () => setDeadServices(new Set());

  // grid positions: 4 cols × 3 rows
  const COL_W = 100 / 4;
  const ROW_H = 100 / 3;

  const pos = (col: number, row: number) => ({
    x: COL_W * col + COL_W / 2,
    y: ROW_H * row + ROW_H / 2,
  });

  return (
    <div className="card overflow-hidden">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] bg-bg-tertiary/40 px-4 py-3">
        <button
          onClick={() => setMonolithView((v) => !v)}
          className="btn-neon px-3 py-1.5 text-xs"
        >
          {monolithView ? "🧩 Microservices View" : "🪨 Monolith View"}
        </button>
        <button
          onClick={() => setCircuitBreaker((v) => !v)}
          className={cn(
            "rounded-lg border px-3 py-1.5 mono text-xs transition",
            circuitBreaker
              ? "border-neon-green/60 bg-neon-green/10 text-neon-green"
              : "border-neon-red/60 bg-neon-red/10 text-neon-red"
          )}
        >
          {circuitBreaker ? "⚡ Circuit Breaker: ON" : "☠️ Circuit Breaker: OFF"}
        </button>
        <button onClick={reset} className="btn-ghost px-3 py-1.5 text-xs">
          Reset
        </button>
        <span className="ml-auto mono text-[0.65rem] text-ink-muted">
          Click a service to kill it
        </span>
      </div>

      {/* status banner */}
      <AnimatePresence>
        {deadServices.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs",
                circuitBreaker
                  ? "bg-neon-yellow/10 text-neon-yellow"
                  : "bg-neon-red/10 text-neon-red animate-pulse"
              )}
            >
              {circuitBreaker ? (
                <>
                  <CheckCircle size={14} />
                  Circuit breaker engaged — dependents degrading gracefully, not crashing
                </>
              ) : (
                <>
                  <AlertTriangle size={14} />
                  CASCADING FAILURE — {deadServices.size} service(s) down, domino effect spreading!
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* diagram */}
      <AnimatePresence mode="wait">
        {monolithView ? (
          <motion.div
            key="monolith"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center p-8"
            style={{ minHeight: 280 }}
          >
            <motion.div
              className="relative flex flex-col items-center justify-center rounded-3xl border-2 p-10 text-center"
              style={{
                borderColor: "var(--neon-purple)",
                background: "var(--bg-secondary)",
                boxShadow: "0 0 40px -10px var(--neon-purple)",
                width: 260,
                height: 260,
              }}
              animate={{ boxShadow: ["0 0 20px -10px var(--neon-purple)", "0 0 50px -5px var(--neon-purple)", "0 0 20px -10px var(--neon-purple)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-4xl">🪨</div>
              <div className="mt-3 font-display text-xl font-bold text-white">The Monolith</div>
              <div className="mt-2 text-sm text-ink-secondary">All 8 services crammed into one deployable blob.</div>
              <div className="mt-3 mono text-[0.65rem] text-neon-red">
                Drop one thing → whole thing goes down
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1">
                {SERVICES.map((s) => (
                  <span key={s.id} className="text-lg">{s.emoji}</span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="microservices"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative"
            style={{ height: 320 }}
          >
            {/* SVG edges */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none">
              {EDGES.map((edge) => {
                const fromSvc = SERVICES.find((s) => s.id === edge.from);
                const toSvc = SERVICES.find((s) => s.id === edge.to);
                if (!fromSvc || !toSvc) return null;
                const p1 = pos(fromSvc.col, fromSvc.row);
                const p2 = pos(toSvc.col, toSvc.row);
                const fromDead = deadServices.has(edge.from as ServiceId);
                const toDead = deadServices.has(edge.to as ServiceId);
                const broken = fromDead || toDead;
                return (
                  <motion.line
                    key={`${edge.from}-${edge.to}`}
                    x1={`${p1.x}%`} y1={`${p1.y}%`}
                    x2={`${p2.x}%`} y2={`${p2.y}%`}
                    stroke={broken ? (circuitBreaker ? "var(--neon-yellow)" : "var(--neon-red)") : "var(--neon-blue)"}
                    strokeWidth={broken ? 2 : 1.5}
                    strokeDasharray={broken ? "4 4" : undefined}
                    opacity={broken ? 0.7 : 0.4}
                    animate={broken && !circuitBreaker ? { opacity: [0.7, 0.2, 0.7] } : {}}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                );
              })}
            </svg>

            {/* Service nodes */}
            {SERVICES.map((svc) => {
              const { x, y } = pos(svc.col, svc.row);
              const isDead = deadServices.has(svc.id);
              return (
                <motion.div
                  key={svc.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => toggleService(svc.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={
                    isDead && !circuitBreaker
                      ? { x: [0, -4, 4, -3, 3, 0], transition: { duration: 0.5, repeat: Infinity } }
                      : {}
                  }
                >
                  <div className="flex flex-col items-center gap-1">
                    <motion.div
                      className="grid place-items-center rounded-xl border-2 text-lg"
                      style={{
                        width: 48, height: 48,
                        borderColor: isDead ? "var(--neon-red)" : svc.color,
                        background: isDead ? "rgba(255,51,102,0.15)" : "var(--bg-tertiary)",
                        boxShadow: isDead
                          ? "0 0 16px -2px var(--neon-red)"
                          : `0 0 12px -4px ${svc.color}`,
                      }}
                      animate={
                        isDead
                          ? { borderColor: ["var(--neon-red)", "#ff000080", "var(--neon-red)"] }
                          : {}
                      }
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      {isDead ? "💀" : svc.emoji}
                    </motion.div>
                    <span
                      className="mono whitespace-nowrap rounded px-1 text-[0.6rem]"
                      style={{ color: isDead ? "var(--neon-red)" : "var(--text-secondary)" }}
                    >
                      {svc.label}
                    </span>
                    {isDead && (
                      <motion.span
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mono text-[0.55rem] text-neon-red"
                      >
                        {circuitBreaker ? "degraded" : "FAILED"}
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-[var(--border-subtle)] px-4 py-3 flex flex-wrap gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5"><XCircle size={13} className="text-neon-red" /> Dead service</span>
        <span className="flex items-center gap-1.5"><Zap size={13} className="text-neon-yellow" /> Circuit breaker open (degraded gracefully)</span>
        <span className="flex items-center gap-1.5 text-neon-red">⚠ Circuit breaker OFF = cascading doom</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MicroservicesPage() {
  return (
    <ConceptPage
      slug="microservices"
      analogy={
        <FunnyAnalogy
          emoji="🧩"
          color="var(--neon-green)"
          alternates={[
            { emoji: "🏢", text: "A huge company splits into specialized departments. HR goes down → Finance keeps running. Nobody in Accounting ever learned HR anyway." },
            { emoji: "🚢", text: "A ship with watertight compartments. One floods → the rest stays afloat. A monolith is a ship with no compartments — enjoy your swim." },
          ]}
        >
          Monolith = Swiss Army knife. One drop and the whole tool is out of commission.{" "}
          Microservices = <strong className="text-neon-green">toolbox</strong>. Drop the hammer,
          the screwdriver still works. Deploy the screwdriver without touching the hammer.
          The only downside: you now own a whole toolbox.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The big picture" title="8 services, infinite chaos">
          <p className="mb-4 text-ink-secondary">
            Each microservice owns exactly one thing and communicates via APIs.
            Kill a service. Toggle the circuit breaker. Watch how ON vs OFF changes whether
            the failure stays contained or devours everything like a digital zombie plague.
          </p>
          <MicroservicesDiagram />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Pattern" title="Circuit Breaker — the hero we need">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                state: "CLOSED",
                color: "var(--neon-green)",
                desc: "Everything flows normally. Requests go through. No drama.",
                emoji: "🟢",
              },
              {
                state: "OPEN",
                color: "var(--neon-red)",
                desc: "Too many failures. Breaker trips — requests fail fast, no queueing. Downstream survives.",
                emoji: "🔴",
              },
              {
                state: "HALF-OPEN",
                color: "var(--neon-yellow)",
                desc: "Tentative probe: lets one request through to test recovery. Success → CLOSED. Fail → OPEN again.",
                emoji: "🟡",
              },
            ].map((s) => (
              <div
                key={s.state}
                className="card p-4"
                style={{ borderColor: `${s.color}40` }}
              >
                <div className="text-2xl">{s.emoji}</div>
                <div className="mt-2 font-display font-bold" style={{ color: s.color }}>
                  {s.state}
                </div>
                <p className="mt-1 text-sm text-ink-secondary">{s.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The reference shape" title="Gateway, services, a database each">
          <p className="mb-4 text-ink-secondary">
            The defining rule: <strong className="text-white">each service owns its own database</strong> — no shared
            tables. An <strong className="text-neon-orange">API gateway</strong> fronts them all, and they
            coordinate asynchronously through an <strong className="text-neon-orange">event bus</strong> instead of
            chatty direct calls. Click each box.
          </p>
          <AnimatedDiagram
            height={400}
            nodes={[
              { id: "client", type: "client", label: "Client", position: { x: 6, y: 50 }, status: "active", info: "Talks to one address — the gateway. It has no idea how many services live behind it." },
              { id: "gw", type: "gateway", label: "API Gateway", position: { x: 22, y: 50 }, status: "busy", info: "Single entry point. Handles auth, routing, and rate limits, then forwards to the right service." },
              { id: "s1", type: "server", label: "Users Svc", position: { x: 46, y: 18 }, status: "busy", info: "Owns everything about users. Deployed, scaled, and released independently of the others." },
              { id: "s2", type: "server", label: "Orders Svc", position: { x: 46, y: 50 }, status: "busy", info: "Owns orders. To learn a user's name it calls the Users API — it cannot read the Users DB directly." },
              { id: "s3", type: "server", label: "Payments Svc", position: { x: 46, y: 82 }, status: "busy", info: "Owns payments. A bug here can't corrupt orders or users — blast radius is contained." },
              { id: "db1", type: "database", label: "Users DB", position: { x: 70, y: 18 }, status: "active", info: "Private to the Users service. This isolation is what lets each team pick its own schema and tech." },
              { id: "db2", type: "database", label: "Orders DB", position: { x: 70, y: 50 }, status: "active", info: "Private to Orders. No shared database = no hidden coupling between teams." },
              { id: "db3", type: "database", label: "Payments DB", position: { x: 70, y: 82 }, status: "active", info: "Private to Payments. The trade-off: cross-service queries now need API calls or events, not JOINs." },
              { id: "bus", type: "queue", label: "Event Bus", position: { x: 92, y: 50 }, status: "active", info: "Services publish events (OrderPlaced, PaymentCaptured) here so others react without direct coupling." },
            ]}
            edges={[
              { from: "client", to: "gw", animated: true },
              { from: "gw", to: "s1", animated: true, color: "var(--neon-orange)" },
              { from: "gw", to: "s2", animated: true, color: "var(--neon-orange)" },
              { from: "gw", to: "s3", animated: true, color: "var(--neon-orange)" },
              { from: "s1", to: "db1", animated: true, color: "var(--neon-green)" },
              { from: "s2", to: "db2", animated: true, color: "var(--neon-green)" },
              { from: "s3", to: "db3", animated: true, color: "var(--neon-green)" },
              { from: "s2", to: "bus", dashed: true, color: "var(--neon-orange)", label: "events" },
              { from: "s3", to: "bus", dashed: true, color: "var(--neon-orange)" },
            ]}
          />
          <p className="mt-3 text-xs text-ink-muted">Tip: &ldquo;database per service&rdquo; is the line between real microservices and a distributed monolith. Share a database and you get all the operational pain with none of the independence.</p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Head to head" title="Monolith vs Microservices">
          <ComparisonBattle
            left={{
              name: "Monolith",
              emoji: "🪨",
              color: "var(--neon-purple)",
              bestFor: "Early-stage startups where simplicity and speed of development beat everything.",
            }}
            right={{
              name: "Microservices",
              emoji: "🧩",
              color: "var(--neon-green)",
              bestFor: "Large orgs with multiple teams needing independent deployment and fault isolation.",
            }}
            features={[
              { label: "Deploy speed", a: 9, b: 6, max: 10, winner: "a" },
              { label: "Fault isolation", a: 2, b: 9, max: 10, winner: "b" },
              { label: "Team independence", a: 3, b: 10, max: 10, winner: "b" },
              { label: "Operational complexity", a: "Low", b: "High", winner: "a" },
              { label: "Horizontal scale", a: 4, b: 9, max: 10, winner: "b" },
              { label: "Debug simplicity", a: "Easy", b: "Painful", winner: "a" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Pitfalls" title="The microservices tax you &apos;ll pay">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: "🌐", title: "Network latency", body: "Every inter-service call is a network hop. What was a function call is now HTTP with retries, timeouts, and TLS handshakes." },
              { emoji: "🔍", title: "Distributed tracing", body: "A bug spans 4 services. Good luck with console.log. You&apos;ll need Jaeger, Zipkin, or OpenTelemetry." },
              { emoji: "🗄️", title: "Data consistency", body: "Each service owns its DB. Cross-service transactions are hard. Welcome to eventual consistency and sagas." },
              { emoji: "📋", title: "Service discovery", body: "With 50+ services, how do they find each other? You need a service registry (Consul, Kubernetes DNS) before anything talks." },
            ].map((p) => (
              <div key={p.title} className="card p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{p.emoji}</span>
                  <div>
                    <div className="font-display font-semibold text-white">{p.title}</div>
                    <p className="mt-1 text-sm text-ink-secondary">{p.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="microservices"
          questions={[
            {
              question: "What does a circuit breaker do when it &apos;trips&apos; (opens)?",
              options: [
                "Retries the failed request infinitely",
                "Fails fast — returns an error immediately without calling the downstream service",
                "Reboots the failed microservice",
                "Logs a warning and continues normally",
              ],
              correct: 1,
              explain: "An open circuit breaker stops the cascade by failing immediately, protecting downstream services from being overwhelmed.",
            },
            {
              question: "A monolith&apos;s payment module crashes. What happens?",
              options: [
                "Only payment is affected — other modules keep running",
                "The whole application goes down",
                "A circuit breaker isolates it automatically",
                "Kubernetes restarts only the payment pod",
              ],
              correct: 1,
              explain: "In a monolith everything shares one process. One module&apos;s crash typically brings down the whole app.",
            },
            {
              question: "Which is NOT a genuine advantage of microservices?",
              options: [
                "Independent deployment per service",
                "Fault isolation between services",
                "Simpler debugging with console.log",
                "Teams can use different tech stacks per service",
              ],
              correct: 2,
              explain: "Distributed systems make debugging harder, not easier. You need distributed tracing tools like Jaeger.",
            },
            {
              question: "The Order service calls Payment, which is slow. Circuit breaker is OFF. What likely happens?",
              options: [
                "Order gracefully returns a cached result",
                "Order&apos;s thread pool fills up waiting for Payment, causing Order to fail too",
                "Payment auto-scales and recovers",
                "The API gateway retries successfully",
              ],
              correct: 1,
              explain: "Without a circuit breaker, slow downstream services exhaust the caller&apos;s thread pool — cascading failure in action.",
            },
            {
              question: "When is a monolith the BETTER choice?",
              options: [
                "You have 200+ engineers and 50+ services",
                "You need per-service auto-scaling",
                "You&apos;re an early startup that needs to ship fast and iterate quickly",
                "Your services have very different traffic patterns",
              ],
              correct: 2,
              explain: "Microservices add huge operational overhead. Early-stage products benefit from monolith simplicity until scale demands otherwise.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
