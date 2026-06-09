"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type DisasterPhase = "idle" | "disaster" | "solution";

interface NodeState {
  id: string;
  label: string;
  x: number;
  y: number;
  status: "ok" | "down" | "partitioned" | "desync" | "duplicate";
  value?: string;
}

interface Scenario {
  id: string;
  label: string;
  emoji: string;
  color: string;
  tagline: string;
  realWorld: string;
  disasterNodes: NodeState[];
  solutionNodes: NodeState[];
  disasterEdges: { from: string; to: string; broken?: boolean; label?: string }[];
  solutionEdges: { from: string; to: string; label?: string; color?: string }[];
  disasterDesc: string;
  solutionDesc: string;
}

// ─── Scenarios ────────────────────────────────────────────────────────────────

const SCENARIOS: Scenario[] = [
  {
    id: "network-partition",
    label: "Network Partition",
    emoji: "✂️",
    color: "var(--neon-red)",
    tagline: "The cable gets cut. Half the cluster thinks the other half is dead.",
    realWorld: "AWS us-east-1 losing connectivity to eu-west-1 mid-transaction in 2011.",
    disasterNodes: [
      { id: "n1", label: "Node A", x: 15, y: 40, status: "partitioned" },
      { id: "n2", label: "Node B", x: 15, y: 75, status: "partitioned" },
      { id: "n3", label: "Node C", x: 75, y: 40, status: "partitioned" },
      { id: "n4", label: "Node D", x: 75, y: 75, status: "partitioned" },
    ],
    solutionNodes: [
      { id: "n1", label: "Node A", x: 15, y: 40, status: "ok", value: "read-only" },
      { id: "n2", label: "Node B", x: 15, y: 75, status: "ok", value: "read-only" },
      { id: "n3", label: "Node C", x: 75, y: 40, status: "ok" },
      { id: "n4", label: "Node D", x: 75, y: 75, status: "ok" },
    ],
    disasterEdges: [
      { from: "n1", to: "n2" },
      { from: "n3", to: "n4" },
      { from: "n1", to: "n3", broken: true },
      { from: "n2", to: "n4", broken: true },
    ],
    solutionEdges: [
      { from: "n1", to: "n2", color: "var(--neon-green)" },
      { from: "n3", to: "n4", color: "var(--neon-green)" },
      { from: "n1", to: "n3", label: "quorum only", color: "var(--neon-yellow)" },
    ],
    disasterDesc: "Network split: nodes can't reach each other. Writes to both sides diverge — you now have two conflicting truths.",
    solutionDesc: "CP systems (like Zookeeper) require a majority quorum: minority partitions go read-only. No divergence — just temporary unavailability.",
  },
  {
    id: "clock-drift",
    label: "Clock Drift",
    emoji: "⏰",
    color: "var(--neon-yellow)",
    tagline: "Every server has its own clock. They all lie. Slightly differently.",
    realWorld: "Google Spanner built TrueTime (atomic clocks + GPS) to solve this. Spanner cost ~$1B to build.",
    disasterNodes: [
      { id: "n1", label: "Server A", x: 20, y: 50, status: "desync", value: "T+0ms" },
      { id: "n2", label: "Server B", x: 50, y: 25, status: "desync", value: "T+43ms" },
      { id: "n3", label: "Server C", x: 80, y: 50, status: "desync", value: "T-12ms" },
    ],
    solutionNodes: [
      { id: "n1", label: "Server A", x: 20, y: 50, status: "ok", value: "NTP synced" },
      { id: "n2", label: "Server B", x: 50, y: 25, status: "ok", value: "NTP synced" },
      { id: "n3", label: "Server C", x: 80, y: 50, status: "ok", value: "NTP synced" },
      { id: "ntp", label: "NTP Server", x: 50, y: 75, status: "ok", value: "⏱ atomic" },
    ],
    disasterEdges: [
      { from: "n1", to: "n2", broken: true },
      { from: "n2", to: "n3", broken: true },
    ],
    solutionEdges: [
      { from: "ntp", to: "n1", color: "var(--neon-green)", label: "sync" },
      { from: "ntp", to: "n2", color: "var(--neon-green)", label: "sync" },
      { from: "ntp", to: "n3", color: "var(--neon-green)", label: "sync" },
    ],
    disasterDesc: "Each server's clock drifts independently. A transaction stamped T=5 on Server A might arrive after T=4 on Server B — event ordering breaks completely.",
    solutionDesc: "Use NTP for coarse sync, logical clocks (Lamport / vector clocks) for ordering, or Hybrid Logical Clocks. Never trust wall-clock time for distributed ordering.",
  },
  {
    id: "split-brain",
    label: "Split Brain",
    emoji: "🧠",
    color: "var(--neon-purple)",
    tagline: "Two leaders elected simultaneously. Your cluster has two personalities now.",
    realWorld: "MongoDB's old election algorithm had a brief window where two primaries could exist, causing silent data loss.",
    disasterNodes: [
      { id: "n1", label: "Leader 1", x: 20, y: 45, status: "partitioned", value: "LEADER 👑" },
      { id: "n2", label: "Leader 2", x: 75, y: 45, status: "partitioned", value: "LEADER 👑" },
      { id: "n3", label: "Follower", x: 48, y: 75, status: "down", value: "confused 😵" },
    ],
    solutionNodes: [
      { id: "n1", label: "Leader", x: 48, y: 25, status: "ok", value: "LEADER 👑" },
      { id: "n2", label: "Follower A", x: 20, y: 65, status: "ok", value: "follower" },
      { id: "n3", label: "Follower B", x: 75, y: 65, status: "ok", value: "follower" },
    ],
    disasterEdges: [
      { from: "n1", to: "n2", broken: true },
      { from: "n1", to: "n3" },
    ],
    solutionEdges: [
      { from: "n1", to: "n2", color: "var(--neon-purple)", label: "replicate" },
      { from: "n1", to: "n3", color: "var(--neon-purple)", label: "replicate" },
    ],
    disasterDesc: "Both nodes think they're the leader and accept writes. When the partition heals — conflicting data. Whoever 'wins' makes the other's writes disappear.",
    solutionDesc: "Raft and Paxos prevent this with strict majority quorums. A node only becomes leader if ≥ ⌊N/2⌋+1 nodes vote for it. No majority, no leader.",
  },
  {
    id: "duplicate-processing",
    label: "Duplicate Processing",
    emoji: "🔁",
    color: "var(--neon-orange)",
    tagline: "Message delivered, ACK lost. Consumer processes it twice. Customer charged twice. You get fired.",
    realWorld: "Stripe's idempotency keys exist precisely because networks can't promise 'exactly once'. Even their own docs say so.",
    disasterNodes: [
      { id: "prod", label: "Producer", x: 15, y: 50, status: "ok" },
      { id: "broker", label: "Broker", x: 48, y: 50, status: "desync", value: "msg #42" },
      { id: "cons", label: "Consumer", x: 80, y: 50, status: "duplicate", value: "processed×2 💸" },
    ],
    solutionNodes: [
      { id: "prod", label: "Producer", x: 15, y: 50, status: "ok" },
      { id: "broker", label: "Broker", x: 48, y: 50, status: "ok", value: "msg #42" },
      { id: "cons", label: "Consumer", x: 80, y: 50, status: "ok", value: "idempotent ✓" },
      { id: "db", label: "Dedup Store", x: 48, y: 80, status: "ok", value: "seen: #42" },
    ],
    disasterEdges: [
      { from: "prod", to: "broker" },
      { from: "broker", to: "cons", label: "×2 retry" },
    ],
    solutionEdges: [
      { from: "prod", to: "broker", color: "var(--neon-green)" },
      { from: "broker", to: "cons", color: "var(--neon-green)" },
      { from: "cons", to: "db", label: "check seen?", color: "var(--neon-yellow)" },
    ],
    disasterDesc: "Message delivered. Consumer processes it. ACK lost in transit. Broker retries. Consumer processes it AGAIN. At-least-once delivery strikes again.",
    solutionDesc: "Make your consumers idempotent: store processed message IDs and skip duplicates. Or use transactional outbox + exactly-once Kafka semantics.",
  },
];

// ─── Node renderer ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<NodeState["status"], string> = {
  ok: "var(--neon-green)",
  down: "#555",
  partitioned: "var(--neon-red)",
  desync: "var(--neon-yellow)",
  duplicate: "var(--neon-orange)",
};

function DisasterCanvas({
  nodes,
  edges,
  phase,
}: {
  nodes: NodeState[];
  edges: { from: string; to: string; broken?: boolean; label?: string; color?: string }[];
  phase: "disaster" | "solution";
}) {
  const W = 400;
  const H = 160;
  const NODE_R = 28;

  const getPos = (id: string) => {
    const n = nodes.find((x) => x.id === id);
    if (!n) return { cx: 0, cy: 0 };
    return { cx: (n.x / 100) * W, cy: (n.y / 100) * H };
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="overflow-visible">
      {/* edges */}
      {edges.map((e, i) => {
        const { cx: x1, cy: y1 } = getPos(e.from);
        const { cx: x2, cy: y2 } = getPos(e.to);
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        return (
          <g key={i}>
            <motion.line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={e.broken ? "var(--neon-red)" : (e.color ?? "rgba(255,255,255,0.2)")}
              strokeWidth={e.broken ? 1.5 : 1.5}
              strokeDasharray={e.broken ? "4 4" : "none"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
            />
            {e.broken && (
              <text x={midX} y={midY - 5} textAnchor="middle" fill="var(--neon-red)" fontSize={12}>✂</text>
            )}
            {e.label && !e.broken && (
              <text x={midX} y={midY - 5} textAnchor="middle" fill={e.color ?? "rgba(255,255,255,0.5)"} fontSize={7} fontFamily="monospace">
                {e.label}
              </text>
            )}
          </g>
        );
      })}
      {/* nodes */}
      {nodes.map((node) => {
        const cx = (node.x / 100) * W;
        const cy = (node.y / 100) * H;
        const color = STATUS_COLORS[node.status];
        return (
          <motion.g
            key={node.id}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <circle
              cx={cx} cy={cy} r={NODE_R}
              fill="var(--bg-tertiary)"
              stroke={color}
              strokeWidth={2}
              style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
            />
            <text x={cx} y={cy - 5} textAnchor="middle" fill={color} fontSize={9} fontFamily="monospace" fontWeight="bold">
              {node.label}
            </text>
            {node.value && (
              <text x={cx} y={cy + 9} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={7} fontFamily="monospace">
                {node.value}
              </text>
            )}
            {node.status !== "ok" && phase === "disaster" && (
              <motion.circle
                cx={cx} cy={cy} r={NODE_R + 4}
                fill="none"
                stroke={color}
                strokeWidth={1}
                strokeOpacity={0.4}
                animate={{ r: [NODE_R + 2, NODE_R + 10], opacity: [0.6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

// ─── Disaster Simulator ───────────────────────────────────────────────────────

function DisasterSimulator() {
  const [active, setActive] = useState<string | null>(null);
  const [phase, setPhase] = useState<DisasterPhase>("idle");

  const scenario = SCENARIOS.find((s) => s.id === active);

  const handleSelect = (id: string) => {
    if (active === id && phase === "solution") {
      setActive(null);
      setPhase("idle");
      return;
    }
    setActive(id);
    setPhase("disaster");
    setTimeout(() => setPhase("solution"), 2400);
  };

  return (
    <div className="space-y-4">
      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelect(s.id)}
            className={cn(
              "card card-hover flex flex-col items-center gap-1.5 p-4 text-center transition",
              active === s.id && "neon-border"
            )}
            style={{
              borderColor: active === s.id ? s.color : undefined,
              background: active === s.id ? `${s.color}0d` : undefined,
            }}
          >
            <span className="text-2xl">{s.emoji}</span>
            <span className="text-xs font-medium" style={{ color: active === s.id ? s.color : "var(--text-primary)" }}>
              {s.label}
            </span>
          </button>
        ))}
      </div>

      {/* Simulation stage */}
      <AnimatePresence mode="wait">
        {scenario && phase !== "idle" && (
          <motion.div
            key={scenario.id + phase}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="card overflow-hidden"
          >
            {/* Header */}
            <div
              className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-5 py-3"
              style={{ background: `${scenario.color}0d` }}
            >
              <span className="text-xl">{scenario.emoji}</span>
              <span className="font-display font-semibold" style={{ color: scenario.color }}>
                {scenario.label}
              </span>
              <span className="ml-auto mono text-[0.6rem] uppercase tracking-widest text-ink-muted">
                {phase === "disaster" ? "💥 disaster playing…" : "✅ solution applied"}
              </span>
            </div>

            <div className="p-5">
              {/* Before / After */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-neon-red/5 border border-neon-red/20 p-4">
                  <div className="mono mb-2 text-[0.6rem] uppercase tracking-widest text-neon-red">The Disaster</div>
                  <div style={{ height: 170 }}>
                    <AnimatePresence mode="wait">
                      {phase === "disaster" && (
                        <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <DisasterCanvas nodes={scenario.disasterNodes} edges={scenario.disasterEdges} phase="disaster" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {phase === "solution" && (
                      <DisasterCanvas nodes={scenario.disasterNodes} edges={scenario.disasterEdges} phase="disaster" />
                    )}
                  </div>
                  <p className="mt-2 text-xs text-ink-secondary">{scenario.disasterDesc}</p>
                </div>
                <div className="rounded-xl bg-neon-green/5 border border-neon-green/20 p-4">
                  <div className="mono mb-2 text-[0.6rem] uppercase tracking-widest text-neon-green">The Solution</div>
                  <div style={{ height: 170 }}>
                    <AnimatePresence mode="wait">
                      {phase === "solution" && (
                        <motion.div key="s" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                          <DisasterCanvas nodes={scenario.solutionNodes} edges={scenario.solutionEdges} phase="solution" />
                        </motion.div>
                      )}
                      {phase === "disaster" && (
                        <motion.div key="wait" className="flex h-full items-center justify-center text-ink-muted text-xs mono">
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>
                            computing solution…
                          </motion.span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="mt-2 text-xs text-ink-secondary">{scenario.solutionDesc}</p>
                </div>
              </div>

              {/* Real world */}
              <div className="mt-4 rounded-xl bg-neon-blue/5 border border-neon-blue/20 p-3 text-sm">
                <span className="mono text-[0.65rem] uppercase tracking-widest text-neon-blue">Real world · </span>
                <span className="text-ink-secondary">{scenario.realWorld}</span>
              </div>
            </div>
          </motion.div>
        )}
        {!scenario && (
          <motion.div
            key="empty"
            className="card flex items-center justify-center py-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div>
              <div className="text-4xl mb-2">💥</div>
              <p className="text-ink-muted text-sm">Pick a disaster scenario above to witness the chaos — and the fix.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── The 8 Fallacies (static) ─────────────────────────────────────────────────

const FALLACIES = [
  { f: "The network is reliable", reality: "It isn't. Packets drop, cables get cut, routers crash.", emoji: "🌐" },
  { f: "Latency is zero", reality: "Speed of light. Physics doesn't care about your SLA.", emoji: "⚡" },
  { f: "Bandwidth is infinite", reality: "Your 10Gbps link has 47 things saturating it right now.", emoji: "🔀" },
  { f: "The network is secure", reality: "It isn't. mTLS everything, zero trust.", emoji: "🔒" },
  { f: "Topology doesn't change", reality: "Nodes go down, IPs change, cloud regions move.", emoji: "🗺️" },
  { f: "There is one administrator", reality: "Three teams all own the same service. No one owns anything.", emoji: "👥" },
  { f: "Transport cost is zero", reality: "Cross-AZ traffic costs real money. Know your data flows.", emoji: "💰" },
  { f: "The network is homogeneous", reality: "Old VMs, new containers, a Raspberry Pi in the corner.", emoji: "🖥️" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DistributedSystemsPage() {
  return (
    <ConceptPage
      slug="distributed-systems"
      analogy={
        <FunnyAnalogy
          emoji="🔥"
          color="var(--neon-red)"
          alternates={[
            { emoji: "👥", text: "A group project where everyone has their own copy of the document, everyone edits simultaneously, and nobody agreed on a merge strategy. Google Docs is the solution." },
            { emoji: "🌍", text: "Running a global business across 12 time zones. By the time you sync on a decision, the situation has already changed." },
          ]}
        >
          Distributed systems are what happen when you spread work across multiple machines.
          Sounds sensible until the <strong className="text-neon-red">network</strong> between them
          misbehaves — which it will, at 3 AM, on a Friday.
          Welcome to the disaster simulator.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The foundation" title="Why distributed? Why not just one big box?">
          <p className="text-ink-secondary">
            A single machine has a ceiling — Moore&apos;s Law is slowing down.
            Distribution lets you scale horizontally (add more boxes), survive hardware failure,
            and serve users from nearby data centers. The cost? Every assumption about local computing breaks.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { title: "Horizontal Scale", desc: "Add nodes → add capacity. No single point of failure.", emoji: "📈", color: "var(--neon-green)" },
              { title: "Fault Tolerance", desc: "One node dies → others pick up the slack. Business continues.", emoji: "🛡️", color: "var(--neon-blue)" },
              { title: "Geo Distribution", desc: "Serve users from their nearest region. Sub-50ms latency.", emoji: "🌍", color: "var(--neon-purple)" },
            ].map((c) => (
              <div key={c.title} className="card p-4">
                <div className="text-2xl mb-2">{c.emoji}</div>
                <div className="font-display font-semibold" style={{ color: c.color }}>{c.title}</div>
                <div className="mt-1 text-sm text-ink-secondary">{c.desc}</div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="No single point of failure" title="The same app, spread across regions">
          <p className="mb-4 text-ink-secondary">
            Distribution means <em>every</em> box is redundant. A <strong className="text-neon-purple">global load
            balancer</strong> sends users to their nearest region; each region runs its own servers and a{" "}
            <strong className="text-neon-green">replicated</strong> copy of the data. Any single node can die and
            the system keeps serving. Click each box.
          </p>
          <AnimatedDiagram
            height={380}
            nodes={[
              { id: "users", type: "client", label: "Users", position: { x: 8, y: 50 }, status: "active", info: "Spread around the world. Routed by latency/geo to whichever region is closest and healthy." },
              { id: "lb", type: "loadbalancer", label: "Global LB", position: { x: 28, y: 50 }, status: "active", info: "Anycast / geo-DNS. If a whole region goes dark, it reroutes traffic to a surviving one." },
              { id: "us", type: "server", label: "US Region", position: { x: 54, y: 22 }, status: "busy", info: "A full stack of app servers in us-east. Serves nearby users in <50ms." },
              { id: "eu", type: "server", label: "EU Region", position: { x: 54, y: 78 }, status: "busy", info: "An independent identical stack in eu-west. Kill US and EU keeps the business running." },
              { id: "dbus", type: "database", label: "US Data", position: { x: 84, y: 22 }, status: "active", info: "Regional data store. Reads/writes locally for speed." },
              { id: "dbeu", type: "database", label: "EU Data", position: { x: 84, y: 78 }, status: "active", info: "Replicated copy. Cross-region replication keeps both in sync (eventually) — the CAP trade-off in the wild." },
            ]}
            edges={[
              { from: "users", to: "lb", animated: true },
              { from: "lb", to: "us", animated: true, color: "var(--neon-purple)" },
              { from: "lb", to: "eu", animated: true, color: "var(--neon-purple)" },
              { from: "us", to: "dbus", animated: true, color: "var(--neon-green)" },
              { from: "eu", to: "dbeu", animated: true, color: "var(--neon-green)" },
              { from: "dbus", to: "dbeu", dashed: true, color: "var(--neon-yellow)", label: "replicate (cross-region)" },
            ]}
          />
          <p className="mt-3 text-xs text-ink-muted">Tip: redundancy is the upside; the network between these boxes is the downside. Every arrow that crosses a region can be slow, drop, or partition — which is exactly what the 8 fallacies below warn about.</p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="★ The simulator" title="Distributed Systems Disaster Simulator">
          <p className="mb-4 text-sm text-ink-secondary">
            Click a failure mode to watch the disaster unfold — then see the industry-standard solution materialize.
          </p>
          <DisasterSimulator />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The classics" title="8 Fallacies of Distributed Computing">
          <p className="mb-4 text-sm text-ink-secondary">
            Peter Deutsch wrote these in 1994. Engineers still violate every single one daily.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {FALLACIES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card flex gap-3 p-3"
              >
                <span className="text-xl">{f.emoji}</span>
                <div>
                  <div className="text-sm font-medium text-neon-red line-through">{f.f}</div>
                  <div className="mt-0.5 text-xs text-ink-secondary">{f.reality}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The holy trinity" title="Consistency, Availability, Partition Tolerance">
          <div className="card p-5">
            <p className="text-sm text-ink-secondary mb-4">
              The CAP theorem (Brewer, 2000) says: pick two. In practice, partitions always happen — so
              you&apos;re really choosing between <strong className="text-neon-blue">Consistency</strong> or{" "}
              <strong className="text-neon-green">Availability</strong> during a partition.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "CP Systems", examples: "Zookeeper, HBase, MongoDB (w/ strong read concern)", desc: "Returns an error rather than stale data. Safe. Briefly unavailable during partition.", color: "var(--neon-blue)" },
                { label: "AP Systems", examples: "Cassandra, CouchDB, DynamoDB (default)", desc: "Always available. May return stale/conflicting data. Resolves conflicts eventually.", color: "var(--neon-green)" },
                { label: "CA Systems", examples: "Single-node PostgreSQL, SQLite", desc: "Consistent and available, but only works without network partitions — i.e., one machine.", color: "var(--neon-yellow)" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-4 border" style={{ borderColor: `${s.color}40`, background: `${s.color}08` }}>
                  <div className="font-display font-semibold" style={{ color: s.color }}>{s.label}</div>
                  <div className="mt-1 text-xs text-ink-secondary">{s.desc}</div>
                  <div className="mt-2 mono text-[0.6rem] text-ink-muted">{s.examples}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="distributed-systems"
          questions={[
            {
              question: "What does a network partition mean in distributed systems?",
              options: [
                "Splitting a hard drive into multiple volumes",
                "A network failure that prevents some nodes from communicating with others",
                "Partitioning a database table by date range",
                "Deploying to multiple AWS regions",
              ],
              correct: 1,
              explain: "A network partition is a split in the communication path between nodes. CAP theorem is specifically about how systems behave during partitions.",
            },
            {
              question: "Clock drift is a problem because…",
              options: [
                "It wastes CPU cycles",
                "Servers in different timezones have different local times",
                "Without synchronized clocks, event ordering across nodes is unreliable",
                "NTP servers are expensive",
              ],
              correct: 2,
              explain: "If Server A's clock is 100ms ahead of Server B, a 'later' event on B might look earlier than an 'earlier' event on A. Distributed ordering requires logical clocks (Lamport / vector clocks).",
            },
            {
              question: "The 'split brain' problem refers to…",
              options: [
                "A developer who maintains both front-end and back-end code",
                "Two nodes simultaneously believing they are the leader, causing conflicting writes",
                "A database with too many indexes",
                "Load balancer routing to different data centers",
              ],
              correct: 1,
              explain: "Split brain means two leaders accept writes simultaneously. When the partition heals, data conflicts. Raft/Paxos prevent this with strict majority quorums.",
            },
            {
              question: "To handle duplicate message processing, your consumer should be…",
              options: [
                "Faster, to process messages before duplicates arrive",
                "Idempotent — processing the same message twice has the same effect as once",
                "Running in a single-threaded mode",
                "Rejecting all retries",
              ],
              correct: 1,
              explain: "Idempotency is the key. Store processed message IDs and skip duplicates. Or use database upserts with the message ID as a unique key.",
            },
            {
              question: "Which of the 8 Fallacies is most commonly violated in new microservice designs?",
              options: [
                "The network is reliable",
                "Latency is zero (calling internal services as if they were function calls)",
                "Bandwidth is infinite",
                "The network is homogeneous",
              ],
              correct: 1,
              explain: "New engineers treat inter-service HTTP calls like function calls. They're not. Every call adds latency, can fail, can time out, and can cascade failures. Design for it.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
