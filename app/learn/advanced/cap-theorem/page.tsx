"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { cn } from "@/lib/utils";
import { WifiOff, AlertTriangle, CheckCircle } from "lucide-react";

// ─── CAP Triangle ─────────────────────────────────────────────────────────────
type CAPChoice = "CA" | "CP" | "AP" | null;

const CAP_INFO: Record<Exclude<CAPChoice, null>, {
  label: string;
  color: string;
  tagline: string;
  description: string;
  examples: { name: string; emoji: string; detail: string }[];
}> = {
  CA: {
    label: "Consistent + Available",
    color: "var(--neon-blue)",
    tagline: "Works great — until the network sneezes.",
    description:
      "CA systems are consistent and available when there are no network partitions. But the CAP theorem says partitions WILL happen (cables fail, routers drop packets, AWS has bad days). When a partition hits, a CA system has to choose: break consistency or become unavailable. So CA is really just CP or AP with its head in the sand.",
    examples: [
      { name: "PostgreSQL (single node)", emoji: "🐘", detail: "One machine = no partition possible. But it also means one point of failure." },
      { name: "MySQL (single node)", emoji: "🐬", detail: "Again, partitions only happen in distributed setups. A single node sidesteps the tradeoff." },
    ],
  },
  CP: {
    label: "Consistent + Partition-tolerant",
    color: "var(--neon-purple)",
    tagline: "Truth first, availability second.",
    description:
      "CP systems refuse to serve stale data. If a network partition isolates some nodes, those nodes stop accepting writes (or reads) until they can confirm consistency with the rest of the cluster. You may get errors or timeouts, but never wrong data. Great for financial systems.",
    examples: [
      { name: "Apache Zookeeper", emoji: "🦓", detail: "Coordination service. Your config must be correct. A minority partition stops accepting writes." },
      { name: "HBase", emoji: "🗄️", detail: "Built on HDFS. Strong consistency, sacrifices availability during partition." },
      { name: "MongoDB (w:majority)", emoji: "🍃", detail: "With write concern majority, writes only succeed when a quorum confirms. Partition = writes rejected." },
      { name: "Redis (single)", emoji: "🔴", detail: "Single-node Redis is CP by default. Redis Cluster trades some consistency for availability." },
    ],
  },
  AP: {
    label: "Available + Partition-tolerant",
    color: "var(--neon-green)",
    tagline: "Always answers. Sometimes lies.",
    description:
      "AP systems keep serving requests even when nodes can't talk to each other. Each partition continues accepting reads and writes independently. When the partition heals, you've got conflicting data — and now you need a conflict resolution strategy. Great for social feeds, shopping carts, DNS.",
    examples: [
      { name: "Apache Cassandra", emoji: "☁️", detail: "Tunable consistency. Defaults to AP — always available, eventually consistent across replicas." },
      { name: "DynamoDB", emoji: "🛒", detail: "Amazon built it for the shopping cart. Must always add to cart. Eventual consistency is fine." },
      { name: "CouchDB", emoji: "🛋️", detail: "Multi-master with built-in conflict detection. Merges conflicts post-partition." },
      { name: "DNS", emoji: "🌐", detail: "Returns cached (possibly stale) answers even when authoritative servers are unreachable. Classic AP." },
    ],
  },
};

function CAPTriangle() {
  const [selected, setSelected] = useState<CAPChoice>(null);

  // Triangle vertices (SVG coordinate space 0..300 x 0..260)
  const C = { x: 150, y: 20 };   // Consistency (top)
  const A = { x: 290, y: 250 };  // Availability (bottom right)
  const P = { x: 10, y: 250 };   // Partition tolerance (bottom left)

  // Edge midpoints
  const edgeCA = { x: (C.x + A.x) / 2, y: (C.y + A.y) / 2 };
  const edgeCP = { x: (C.x + P.x) / 2, y: (C.y + P.y) / 2 };
  const edgeAP = { x: (A.x + P.x) / 2, y: (A.y + P.y) / 2 };

  const isActive = (edge: Exclude<CAPChoice, null>) => selected === edge;

  const edgeColor = (edge: Exclude<CAPChoice, null>) =>
    isActive(edge) ? CAP_INFO[edge].color : "var(--border-subtle)";

  const edgeWidth = (edge: Exclude<CAPChoice, null>) =>
    isActive(edge) ? 3.5 : 1.5;

  return (
    <div className="grid gap-6 sm:grid-cols-2 items-start">
      {/* Triangle SVG */}
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 300 280" width={300} height={280} aria-label="CAP theorem triangle">
          {/* Background fill */}
          <polygon
            points={`${C.x},${C.y} ${A.x},${A.y} ${P.x},${P.y}`}
            fill="var(--bg-secondary)"
            stroke="none"
          />

          {/* CA edge */}
          <line
            x1={C.x} y1={C.y} x2={A.x} y2={A.y}
            stroke={edgeColor("CA")} strokeWidth={edgeWidth("CA")}
            className="cursor-pointer transition-all duration-300"
            onClick={() => setSelected(selected === "CA" ? null : "CA")}
          />
          {/* CP edge */}
          <line
            x1={C.x} y1={C.y} x2={P.x} y2={P.y}
            stroke={edgeColor("CP")} strokeWidth={edgeWidth("CP")}
            className="cursor-pointer transition-all duration-300"
            onClick={() => setSelected(selected === "CP" ? null : "CP")}
          />
          {/* AP edge */}
          <line
            x1={A.x} y1={A.y} x2={P.x} y2={P.y}
            stroke={edgeColor("AP")} strokeWidth={edgeWidth("AP")}
            className="cursor-pointer transition-all duration-300"
            onClick={() => setSelected(selected === "AP" ? null : "AP")}
          />

          {/* Edge click zones (wider invisible lines) */}
          <line
            x1={C.x} y1={C.y} x2={A.x} y2={A.y}
            stroke="transparent" strokeWidth={20}
            className="cursor-pointer"
            onClick={() => setSelected(selected === "CA" ? null : "CA")}
          />
          <line
            x1={C.x} y1={C.y} x2={P.x} y2={P.y}
            stroke="transparent" strokeWidth={20}
            className="cursor-pointer"
            onClick={() => setSelected(selected === "CP" ? null : "CP")}
          />
          <line
            x1={A.x} y1={A.y} x2={P.x} y2={P.y}
            stroke="transparent" strokeWidth={20}
            className="cursor-pointer"
            onClick={() => setSelected(selected === "AP" ? null : "AP")}
          />

          {/* Vertex labels */}
          <circle cx={C.x} cy={C.y} r={18} fill="var(--bg-tertiary)" stroke="var(--neon-blue)" strokeWidth={2} />
          <text x={C.x} y={C.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="var(--neon-blue)" fontFamily="monospace" fontWeight="bold">C</text>
          <text x={C.x} y={C.y - 25} textAnchor="middle" fontSize={9} fill="var(--text-secondary)" fontFamily="monospace">Consistency</text>

          <circle cx={A.x} cy={A.y} r={18} fill="var(--bg-tertiary)" stroke="var(--neon-green)" strokeWidth={2} />
          <text x={A.x} y={A.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="var(--neon-green)" fontFamily="monospace" fontWeight="bold">A</text>
          <text x={A.x + 5} y={A.y + 20} textAnchor="middle" fontSize={9} fill="var(--text-secondary)" fontFamily="monospace">Availability</text>

          <circle cx={P.x} cy={P.y} r={18} fill="var(--bg-tertiary)" stroke="var(--neon-yellow)" strokeWidth={2} />
          <text x={P.x} y={P.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="var(--neon-yellow)" fontFamily="monospace" fontWeight="bold">P</text>
          <text x={P.x - 5} y={P.y + 20} textAnchor="middle" fontSize={9} fill="var(--text-secondary)" fontFamily="monospace">Partition</text>

          {/* Edge labels */}
          <text x={edgeCA.x + 14} y={edgeCA.y} textAnchor="middle" fontSize={9} fill={edgeColor("CA")} fontFamily="monospace" className="cursor-pointer" onClick={() => setSelected(selected === "CA" ? null : "CA")}>CA</text>
          <text x={edgeCP.x - 14} y={edgeCP.y} textAnchor="middle" fontSize={9} fill={edgeColor("CP")} fontFamily="monospace" className="cursor-pointer" onClick={() => setSelected(selected === "CP" ? null : "CP")}>CP</text>
          <text x={edgeAP.x} y={edgeAP.y + 14} textAnchor="middle" fontSize={9} fill={edgeColor("AP")} fontFamily="monospace" className="cursor-pointer" onClick={() => setSelected(selected === "AP" ? null : "AP")}>AP</text>
        </svg>
        <p className="text-center text-xs text-ink-muted">Click an edge to explore that choice</p>
      </div>

      {/* Info panel */}
      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key={selected}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="card p-4"
            style={{ borderColor: `${CAP_INFO[selected].color}40` }}
          >
            <div
              className="mono mb-1 text-[0.65rem] uppercase tracking-widest"
              style={{ color: CAP_INFO[selected].color }}
            >
              {selected} Systems
            </div>
            <div className="font-display text-lg font-bold text-white mb-1">
              {CAP_INFO[selected].label}
            </div>
            <div className="italic text-sm mb-3" style={{ color: CAP_INFO[selected].color }}>
              &ldquo;{CAP_INFO[selected].tagline}&rdquo;
            </div>
            <p className="text-sm text-ink-secondary mb-4">
              {CAP_INFO[selected].description}
            </p>
            <div className="mono mb-2 text-[0.6rem] uppercase tracking-widest text-ink-muted">Real examples</div>
            <div className="space-y-2">
              {CAP_INFO[selected].examples.map((ex) => (
                <div key={ex.name} className="flex gap-2 rounded-lg bg-bg-tertiary/60 p-2.5 text-xs">
                  <span className="text-base leading-none">{ex.emoji}</span>
                  <div>
                    <div className="font-semibold text-white">{ex.name}</div>
                    <div className="text-ink-secondary">{ex.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border-subtle)] p-8 text-center"
          >
            <div className="text-4xl">🔺</div>
            <p className="text-sm text-ink-secondary">
              The holy trinity of distributed systems. Pick any two.
              <br />
              <span className="text-ink-muted">(Click an edge above to pick your poison.)</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Partition Demo ───────────────────────────────────────────────────────────
type SystemMode = "cp" | "ap";

interface NodeState {
  id: string;
  label: string;
  value: number;
  status: "ok" | "isolated" | "diverged";
}

function PartitionDemo() {
  const [partitioned, setPartitioned] = useState(false);
  const [mode, setMode] = useState<SystemMode>("cp");
  const [writes, setWrites] = useState(0);
  const [nodes, setNodes] = useState<NodeState[]>([
    { id: "n1", label: "Node A", value: 42, status: "ok" },
    { id: "n2", label: "Node B", value: 42, status: "ok" },
    { id: "n3", label: "Node C", value: 42, status: "ok" },
  ]);
  const [events, setEvents] = useState<{ id: number; text: string; color: string }[]>([]);

  const addEvent = (text: string, color: string) => {
    const id = Date.now();
    setEvents((ev) => [{ id, text, color }, ...ev].slice(0, 6));
  };

  const triggerWrite = () => {
    const newVal = writes + 1;
    setWrites(newVal);

    if (!partitioned) {
      // Normal: all nodes update
      setNodes((ns) => ns.map((n) => ({ ...n, value: newVal, status: "ok" })));
      addEvent(`✓ Write ${newVal} replicated to all 3 nodes`, "var(--neon-green)");
    } else if (mode === "cp") {
      // CP: majority partition accepts, minority refuses
      setNodes((ns) =>
        ns.map((n, i) =>
          i < 2
            ? { ...n, value: newVal, status: "ok" }
            : { ...n, status: "isolated" }
        )
      );
      addEvent(`⛔ CP: Node C isolated → write rejected on C (consistent!)`, "var(--neon-purple)");
    } else {
      // AP: all accept, diverge
      setNodes((ns) =>
        ns.map((n, i) => ({
          ...n,
          value: i === 2 ? newVal - 1 : newVal, // stale on isolated node
          status: i === 2 ? "diverged" : "ok",
        }))
      );
      addEvent(`⚡ AP: Node C kept old value → data diverged! (available!)`, "var(--neon-yellow)");
    }
  };

  const togglePartition = () => {
    setPartitioned((p) => {
      if (p) {
        // Heal partition
        if (mode === "ap") {
          addEvent(`🔧 Partition healed — AP must now reconcile conflicts...`, "var(--neon-orange)");
        } else {
          addEvent(`🔧 Partition healed — CP nodes sync automatically`, "var(--neon-green)");
        }
        setNodes((ns) => ns.map((n) => ({ ...n, status: "ok", value: writes })));
      } else {
        addEvent(`💥 Network partition! Node C cut off from A & B`, "var(--neon-red)");
        setNodes((ns) => ns.map((n, i) => ({ ...n, status: i === 2 ? "isolated" : "ok" })));
      }
      return !p;
    });
  };

  const reset = () => {
    setPartitioned(false);
    setWrites(0);
    setNodes([
      { id: "n1", label: "Node A", value: 42, status: "ok" },
      { id: "n2", label: "Node B", value: 42, status: "ok" },
      { id: "n3", label: "Node C", value: 42, status: "ok" },
    ]);
    setEvents([]);
  };

  const statusColor = (status: NodeState["status"]) => {
    if (status === "ok") return "var(--neon-green)";
    if (status === "isolated") return "var(--neon-red)";
    return "var(--neon-yellow)";
  };

  const statusLabel = (status: NodeState["status"], mode: SystemMode) => {
    if (status === "ok") return "✓ OK";
    if (status === "isolated") return mode === "cp" ? "⛔ REJECTED" : "⚡ DIVERGED";
    return "⚠ STALE";
  };

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] bg-bg-tertiary/40 px-4 py-3">
        <div className="flex rounded-lg overflow-hidden border border-[var(--border-subtle)]">
          <button
            onClick={() => setMode("cp")}
            className={cn(
              "px-3 py-1.5 text-xs mono transition",
              mode === "cp"
                ? "bg-neon-purple/20 text-neon-purple font-bold"
                : "text-ink-secondary hover:text-white"
            )}
          >
            CP System
          </button>
          <button
            onClick={() => setMode("ap")}
            className={cn(
              "px-3 py-1.5 text-xs mono transition border-l border-[var(--border-subtle)]",
              mode === "ap"
                ? "bg-neon-green/20 text-neon-green font-bold"
                : "text-ink-secondary hover:text-white"
            )}
          >
            AP System
          </button>
        </div>

        <button
          onClick={togglePartition}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition",
            partitioned
              ? "border-neon-red/60 bg-neon-red/10 text-neon-red"
              : "border-[var(--border-subtle)] text-ink-secondary hover:border-neon-red/60 hover:text-neon-red"
          )}
        >
          <WifiOff size={12} />
          {partitioned ? "Heal Partition" : "Trigger Network Partition"}
        </button>

        <button onClick={triggerWrite} className="btn-neon px-3 py-1.5 text-xs">
          ✍ Send Write (value = {writes + 1})
        </button>

        <button onClick={reset} className="btn-ghost px-3 py-1.5 text-xs">
          Reset
        </button>
      </div>

      {/* Network partition indicator */}
      <AnimatePresence>
        {partitioned && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 bg-neon-red/10 px-4 py-2 text-xs text-neon-red">
              <AlertTriangle size={13} />
              Network partition active — Node C cannot communicate with A &amp; B
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nodes */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {nodes.map((node, i) => (
            <motion.div
              key={node.id}
              className="card p-3 text-center"
              style={{ borderColor: `${statusColor(node.status)}40` }}
              animate={
                node.status === "diverged"
                  ? { borderColor: ["rgba(255,211,0,0.4)", "rgba(255,211,0,0.8)", "rgba(255,211,0,0.4)"] }
                  : {}
              }
              transition={{ duration: 1, repeat: node.status === "diverged" ? Infinity : 0 }}
            >
              <div className="text-lg mb-1">
                {node.status === "ok" ? "🖥️" : node.status === "isolated" ? "🔴" : "⚠️"}
              </div>
              <div className="font-mono font-bold text-white text-sm">{node.label}</div>

              {/* Partition wall */}
              {partitioned && i === 1 && (
                <div className="absolute right-0 top-0 h-full w-px bg-neon-red/60"
                  style={{ position: "relative", marginTop: 4 }}>
                </div>
              )}

              <div className="mt-2 rounded bg-bg-tertiary/60 p-1.5">
                <div className="mono text-[0.6rem] text-ink-muted">value</div>
                <motion.div
                  className="font-display text-xl font-bold"
                  animate={{ color: statusColor(node.status) }}
                >
                  {node.value}
                </motion.div>
              </div>

              <div
                className="mt-2 mono text-[0.55rem] font-bold"
                style={{ color: statusColor(node.status) }}
              >
                {statusLabel(node.status, mode)}
              </div>

              {mode === "cp" && node.status === "isolated" && (
                <div className="mt-1 text-[0.55rem] text-neon-purple">
                  refuses writes
                </div>
              )}
              {mode === "ap" && node.status === "diverged" && (
                <div className="mt-1 text-[0.55rem] text-neon-yellow">
                  conflict!
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Partition wall visual */}
        {partitioned && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="relative mb-4 flex items-center justify-center"
          >
            <div className="h-px w-full bg-neon-red/40" />
            <div className="absolute rounded-full bg-bg-secondary px-2 py-0.5 mono text-[0.6rem] text-neon-red border border-neon-red/40">
              ⚡ PARTITION
            </div>
          </motion.div>
        )}

        {/* Event log */}
        <div className="rounded-xl bg-bg-tertiary/40 p-3">
          <div className="mono mb-2 text-[0.6rem] uppercase tracking-widest text-ink-muted">Event log</div>
          <AnimatePresence>
            {events.length === 0 ? (
              <div className="text-xs text-ink-muted italic">No events yet — try sending a write or triggering a partition.</div>
            ) : (
              events.map((ev) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-1 flex items-start gap-2 text-xs"
                >
                  <span className="shrink-0" style={{ color: ev.color }}>›</span>
                  <span className="text-ink-secondary">{ev.text}</span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mode summary */}
      <div className="border-t border-[var(--border-subtle)] px-4 py-3 grid grid-cols-2 gap-3 text-xs">
        <div className={cn("rounded-lg p-2 transition", mode === "cp" ? "bg-neon-purple/10 border border-neon-purple/30" : "opacity-40")}>
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle size={11} className="text-neon-purple" />
            <span className="font-mono font-bold text-neon-purple">CP during partition</span>
          </div>
          <span className="text-ink-secondary">Rejects writes to isolated nodes. Data stays consistent, some requests fail.</span>
        </div>
        <div className={cn("rounded-lg p-2 transition", mode === "ap" ? "bg-neon-green/10 border border-neon-green/30" : "opacity-40")}>
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle size={11} className="text-neon-green" />
            <span className="font-mono font-bold text-neon-green">AP during partition</span>
          </div>
          <span className="text-ink-secondary">Accepts writes everywhere. Data diverges. Conflict resolution needed on heal.</span>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CAPTheoremPage() {
  return (
    <ConceptPage
      slug="cap-theorem"
      analogy={
        <FunnyAnalogy
          emoji="🔺"
          color="var(--neon-yellow)"
          alternates={[
            {
              emoji: "🧑‍🎓",
              text: "Sleep, social life, career — you get two. All three? Sure, try it. Let us know how your 4am study sessions AND Friday parties AND A-grades work out.",
            },
            {
              emoji: "🍕",
              text: "Fast, cheap, good — pick two. CAP is just the distributed systems version of the pizza triangle.",
            },
          ]}
        >
          <strong className="text-neon-yellow">C</strong>onsistency,{" "}
          <strong className="text-neon-green">A</strong>vailability,{" "}
          <strong className="text-neon-blue">P</strong>artition tolerance.
          {" "}Pick two. Eric Brewer proved in 2000 that no distributed system can guarantee all three simultaneously.
          The catch: partition tolerance isn&apos;t optional in any real network. So really you&apos;re choosing between
          <strong className="text-neon-purple"> CP</strong> (tell me the truth, even if you go quiet) and{" "}
          <strong className="text-neon-green"> AP</strong> (always answer, even if you&apos;re not sure).
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The theorem" title="Pick your two — click to explore">
          <p className="mb-4 text-ink-secondary">
            Click any edge of the triangle to see which databases live there and why they made that choice.
            The CA corner is mostly theoretical — in practice, network partitions happen whether you want them to or not.
          </p>
          <CAPTriangle />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="What a 'partition' is" title="The moment you're forced to choose">
          <p className="mb-4 text-ink-secondary">
            CAP only bites during a <strong className="text-neon-red">partition</strong> — when the network link
            between replicas breaks. A write lands on Replica A but can&apos;t reach Replica B. Now a reader on B is
            stuck: serve <strong className="text-neon-green">stale data (AP)</strong> or refuse to answer until it
            heals <strong className="text-neon-purple">(CP)</strong>. You cannot have both. Click each box.
          </p>
          <AnimatedDiagram
            height={340}
            nodes={[
              { id: "w", type: "client", label: "Writer", position: { x: 8, y: 28 }, status: "active", info: "Writes x = 1. It reaches Replica A successfully." },
              { id: "r", type: "client", label: "Reader", position: { x: 8, y: 72 }, status: "active", info: "Reads x from Replica B — which never received the update because the link is down." },
              { id: "a", type: "database", label: "Replica A", position: { x: 50, y: 28 }, status: "active", info: "Has the fresh value x = 1. Wants to share it with B but the network is cut." },
              { id: "b", type: "database", label: "Replica B", position: { x: 50, y: 72 }, status: "busy", info: "Still holds the old x = 0. CP: reject the read (stay consistent). AP: return stale x = 0 (stay available)." },
            ]}
            edges={[
              { from: "w", to: "a", animated: true, color: "var(--neon-green)", label: "write x=1 ✓" },
              { from: "r", to: "b", animated: true, color: "var(--neon-blue)", label: "read x?" },
              { from: "a", to: "b", dashed: true, color: "var(--neon-red)", label: "✕ partition" },
            ]}
          />
          <p className="mt-3 text-xs text-ink-muted">Tip: when there&apos;s NO partition you get both C and A — that&apos;s why PACELC adds &ldquo;else, latency vs consistency.&rdquo; CAP is only about the failure moment.</p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Live demo" title="Watch the tradeoff in action">
          <p className="mb-4 text-ink-secondary">
            Three nodes sharing a value. Trigger a network partition, then try to write.
            Watch <strong className="text-neon-purple">CP mode</strong> reject the write on the isolated node (consistent but unavailable)
            vs <strong className="text-neon-green">AP mode</strong> accept it everywhere (available but diverged).
          </p>
          <PartitionDemo />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Beyond the basics" title="PACELC — the more nuanced model">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-4">
              <div className="font-display font-bold text-white mb-2">CAP: the partition story</div>
              <p className="text-sm text-ink-secondary">
                CAP only addresses behavior during a partition. But most of the time your network is fine.
                What&apos;s the tradeoff then? CAP has no answer.
              </p>
            </div>
            <div className="card p-4 border-neon-blue/30">
              <div className="font-display font-bold text-neon-blue mb-2">PACELC: the whole story</div>
              <p className="text-sm text-ink-secondary">
                If there&apos;s a <strong className="text-white">P</strong>artition → choose between{" "}
                <strong className="text-white">A</strong>vailability and{" "}
                <strong className="text-white">C</strong>onsistency.
                <em>E</em>lse (no partition) → choose between{" "}
                <strong className="text-white">L</strong>atency and{" "}
                <strong className="text-white">C</strong>onsistency.
                DynamoDB is PA/EL. Cassandra too. HBase is PC/EC.
              </p>
            </div>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Quick reference" title="C, A, P — what they actually mean">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                letter: "C",
                name: "Consistency",
                color: "var(--neon-blue)",
                body: "Every read gets the most recent write, or an error. No stale data. All nodes agree on the current state at all times.",
                notMeans: "Not the same as ACID consistency! CAP consistency = linearizability.",
              },
              {
                letter: "A",
                name: "Availability",
                color: "var(--neon-green)",
                body: "Every request receives a non-error response — though it might not contain the most recent data. The system is always up.",
                notMeans: "Doesn't mean the data is fresh. Just that a response comes back.",
              },
              {
                letter: "P",
                name: "Partition Tolerance",
                color: "var(--neon-yellow)",
                body: "The system continues operating even when network messages between nodes are dropped or delayed. Practically mandatory.",
                notMeans: "Doesn't mean you can avoid choosing between C and A when a partition hits.",
              },
            ].map((item) => (
              <div key={item.letter} className="card p-4" style={{ borderColor: `${item.color}40` }}>
                <div
                  className="font-display text-3xl font-extrabold mb-1"
                  style={{ color: item.color }}
                >
                  {item.letter}
                </div>
                <div className="font-semibold text-white mb-2">{item.name}</div>
                <p className="text-xs text-ink-secondary mb-2">{item.body}</p>
                <div
                  className="rounded bg-bg-tertiary/60 p-2 text-[0.65rem] italic"
                  style={{ color: item.color, borderLeft: `2px solid ${item.color}` }}
                >
                  {item.notMeans}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="cap-theorem"
          questions={[
            {
              question: "Why is the CA combination mostly theoretical in distributed systems?",
              options: [
                "Network partitions never happen in practice",
                "CA systems are too expensive to build",
                "Partition tolerance is practically mandatory — real networks do drop packets",
                "CA means the same as CP in practice",
              ],
              correct: 2,
              explain: "Any realistic distributed system must handle network partitions. If you don't design for it, you'll be surprised when it inevitably happens. So the real choice is CP vs AP.",
            },
            {
              question: "A CP system receives a write during a network partition. What happens?",
              options: [
                "It accepts the write and marks it as eventual",
                "It rejects the write to preserve consistency",
                "It forwards the write to a backup datacenter",
                "It broadcasts the write to all nodes immediately",
              ],
              correct: 1,
              explain: "CP = consistency over availability. When partitioned, isolated nodes refuse writes rather than risk serving stale or conflicting data.",
            },
            {
              question: "Which database is a classic example of an AP system?",
              options: [
                "HBase (CP)",
                "ZooKeeper (CP)",
                "Apache Cassandra (AP)",
                "PostgreSQL single node (CA)",
              ],
              correct: 2,
              explain: "Cassandra is designed to always accept writes and reads, trading consistency for availability. It uses tunable consistency levels and eventual consistency.",
            },
            {
              question: "What does 'eventual consistency' mean in an AP system?",
              options: [
                "The system will crash eventually",
                "Data will eventually be consistent across all nodes after the partition heals",
                "Writes eventually get rejected",
                "Only some nodes will eventually receive the update",
              ],
              correct: 1,
              explain: "AP systems accept divergent writes during partitions. When the partition heals, a reconciliation process runs to merge the diverged state — eventually making all nodes agree.",
            },
            {
              question: "PACELC extends CAP by also addressing what?",
              options: [
                "Security vs performance tradeoffs",
                "Latency vs consistency when there is NO partition",
                "Read vs write performance ratios",
                "The number of replicas needed",
              ],
              correct: 1,
              explain: "CAP only talks about partition scenarios. PACELC adds: when the network is healthy (Else), you still must choose between lower Latency (accept some inconsistency) or strong Consistency (pay with latency).",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
