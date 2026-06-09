"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw, AlertTriangle, WifiOff } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
type ReplicationMode = "single-leader" | "multi-leader" | "leaderless";

interface DBNode {
  id: string;
  label: string;
  role: "leader" | "follower" | "candidate" | "none";
  value: number;
  lag: number; // replication lag in simulated ms
  status: "ok" | "down" | "syncing" | "conflict";
}

// ─── Replication Simulation ───────────────────────────────────────────────────
function ReplicationSim() {
  const [mode, setMode] = useState<ReplicationMode>("single-leader");
  const [networkDelay, setNetworkDelay] = useState(false);
  const [leaderDown, setLeaderDown] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [writeCount, setWriteCount] = useState(0);
  const [events, setEvents] = useState<{ id: number; text: string; color: string }[]>([]);
  const [nodes, setNodes] = useState<DBNode[]>([
    { id: "n1", label: "DB-1", role: "leader", value: 0, lag: 0, status: "ok" },
    { id: "n2", label: "DB-2", role: "follower", value: 0, lag: 0, status: "ok" },
    { id: "n3", label: "DB-3", role: "follower", value: 0, lag: 0, status: "ok" },
  ]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addEvent = useCallback((text: string, color: string) => {
    const id = Date.now() + Math.random();
    setEvents((ev) => [{ id, text, color }, ...ev].slice(0, 8));
  }, []);

  const sendWrite = useCallback(() => {
    const val = writeCount + 1;
    setWriteCount(val);

    if (mode === "single-leader") {
      if (leaderDown) {
        // Check if failover has happened
        const currentLeader = nodes.find((n) => n.role === "leader");
        if (!currentLeader || currentLeader.status === "down") {
          addEvent("⛔ Write rejected — no leader available!", "var(--neon-red)");
          return;
        }
      }
      // Leader gets write immediately
      setNodes((ns) =>
        ns.map((n) => {
          if (n.role === "leader" && n.status !== "down") {
            return { ...n, value: val, status: "ok" };
          }
          if (n.role === "follower" && n.status !== "down") {
            const lag = networkDelay ? Math.floor(Math.random() * 3) + 1 : 0;
            return { ...n, value: lag === 0 ? val : n.value, lag, status: lag > 0 ? "syncing" : "ok" };
          }
          return n;
        })
      );
      addEvent(
        networkDelay
          ? `✍ Write ${val} → Leader. Followers syncing (delayed ${networkDelay ? "1-3s lag" : "~0ms"})`
          : `✍ Write ${val} → Leader → replicated to all followers`,
        "var(--neon-blue)"
      );

      // Apply lagged followers after delay
      if (networkDelay) {
        setTimeout(() => {
          setNodes((ns) =>
            ns.map((n) =>
              n.role === "follower" && n.status !== "down"
                ? { ...n, value: val, lag: 0, status: "ok" }
                : n
            )
          );
          addEvent(`⚡ Followers caught up to value ${val}`, "var(--neon-green)");
        }, 2000);
      }
    } else if (mode === "multi-leader") {
      // Two leaders can both accept writes — simulate conflict
      const conflict = val % 3 === 0;
      setNodes((ns) =>
        ns.map((n, i) => {
          if (i === 0) return { ...n, value: val, status: "ok", role: "leader" };
          if (i === 1) {
            const conflictVal = conflict ? val - 1 : val; // simulate out-of-order
            return { ...n, value: conflictVal, status: conflict ? "conflict" : "ok", role: "leader" };
          }
          return { ...n, value: val, status: "ok", role: "follower" };
        })
      );
      if (conflict) {
        addEvent(`⚠ Write ${val} — CONFLICT DETECTED between DC-1 and DC-2! Resolving...`, "var(--neon-red)");
        setTimeout(() => {
          setNodes((ns) => ns.map((n) => ({ ...n, value: val, status: "ok" })));
          addEvent(`🔧 Conflict resolved via last-write-wins (value = ${val})`, "var(--neon-yellow)");
        }, 1500);
      } else {
        addEvent(`✍ Write ${val} accepted by both leaders, propagating...`, "var(--neon-green)");
      }
    } else {
      // Leaderless: quorum write (W=2, N=3)
      const quorumMet = true; // 2/3 nodes agree
      setNodes((ns) =>
        ns.map((n, i) => {
          const accepted = i < 2 || !networkDelay;
          return { ...n, value: accepted ? val : n.value, status: accepted ? "ok" : "syncing", role: "none" };
        })
      );
      addEvent(
        quorumMet
          ? `✍ Write ${val} — quorum W=2/3 acknowledged ✓ (eventually consistent)`
          : `⛔ Write ${val} — quorum not met, rejected`,
        "var(--neon-purple)"
      );
      if (networkDelay) {
        setTimeout(() => {
          setNodes((ns) => ns.map((n) => ({ ...n, value: val, lag: 0, status: "ok" })));
          addEvent(`📡 Read repair propagated value ${val} to all replicas`, "var(--neon-blue)");
        }, 2000);
      }
    }
  }, [mode, leaderDown, networkDelay, writeCount, nodes, addEvent]);

  // Auto-write when playing
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        sendWrite();
      }, 1500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, sendWrite]);

  const handleLeaderFailover = () => {
    if (!leaderDown) {
      // Kill the leader
      setLeaderDown(true);
      setNodes((ns) =>
        ns.map((n, i) => {
          if (i === 0) return { ...n, status: "down", role: "leader" };
          return n;
        })
      );
      addEvent("💥 Leader DB-1 is DOWN! Initiating failover...", "var(--neon-red)");
      // Promote follower after delay
      setTimeout(() => {
        setNodes((ns) =>
          ns.map((n, i) => {
            if (i === 0) return { ...n, status: "down" };
            if (i === 1) return { ...n, role: "leader", status: "ok" };
            return n;
          })
        );
        addEvent("✓ DB-2 promoted to leader! Accepting writes.", "var(--neon-green)");
      }, 2000);
    } else {
      // Revive
      setLeaderDown(false);
      setNodes((ns) =>
        ns.map((n, i) => {
          if (i === 0) return { ...n, status: "ok", role: "follower" };
          if (i === 1) return { ...n, role: "leader" };
          return n;
        })
      );
      addEvent("🔧 DB-1 rejoined as follower. DB-2 remains leader.", "var(--neon-blue)");
    }
  };

  const reset = () => {
    setPlaying(false);
    setWriteCount(0);
    setLeaderDown(false);
    setNetworkDelay(false);
    setEvents([]);
    setNodes([
      { id: "n1", label: "DB-1", role: mode === "leaderless" ? "none" : "leader", value: 0, lag: 0, status: "ok" },
      { id: "n2", label: "DB-2", role: mode === "leaderless" ? "none" : "follower", value: 0, lag: 0, status: "ok" },
      { id: "n3", label: "DB-3", role: mode === "leaderless" ? "none" : "follower", value: 0, lag: 0, status: "ok" },
    ]);
  };

  const changeMode = (m: ReplicationMode) => {
    setMode(m);
    setPlaying(false);
    setLeaderDown(false);
    setWriteCount(0);
    setEvents([]);
    setNodes([
      { id: "n1", label: "DB-1", role: m === "leaderless" ? "none" : "leader", value: 0, lag: 0, status: "ok" },
      { id: "n2", label: "DB-2", role: m === "leaderless" ? "none" : m === "multi-leader" ? "leader" : "follower", value: 0, lag: 0, status: "ok" },
      { id: "n3", label: "DB-3", role: m === "leaderless" ? "none" : "follower", value: 0, lag: 0, status: "ok" },
    ]);
  };

  const nodeColor = (n: DBNode) => {
    if (n.status === "down") return "var(--neon-red)";
    if (n.status === "conflict") return "var(--neon-orange)";
    if (n.status === "syncing") return "var(--neon-yellow)";
    if (n.role === "leader") return "var(--neon-blue)";
    if (n.role === "none") return "var(--neon-purple)";
    return "var(--neon-green)";
  };

  const nodeEmoji = (n: DBNode) => {
    if (n.status === "down") return "💀";
    if (n.status === "conflict") return "⚠️";
    if (n.status === "syncing") return "⏳";
    if (n.role === "leader") return "👑";
    if (n.role === "none") return "🗄️";
    return "📋";
  };

  const roleBadge = (n: DBNode) => {
    if (n.status === "down") return "DOWN";
    if (mode === "leaderless") return "replica";
    return n.role.toUpperCase();
  };

  return (
    <div className="card overflow-hidden">
      {/* Mode tabs */}
      <div className="flex flex-wrap gap-0 border-b border-[var(--border-subtle)]">
        {(["single-leader", "multi-leader", "leaderless"] as ReplicationMode[]).map((m) => (
          <button
            key={m}
            onClick={() => changeMode(m)}
            className={cn(
              "px-4 py-2.5 text-xs mono transition border-b-2 -mb-px",
              mode === m
                ? "border-neon-blue text-neon-blue bg-neon-blue/5"
                : "border-transparent text-ink-secondary hover:text-white"
            )}
          >
            {m === "single-leader" ? "👑 Single Leader" : m === "multi-leader" ? "👑👑 Multi-Leader" : "🗳 Leaderless"}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] bg-bg-tertiary/40 px-4 py-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="btn-neon px-3 py-1.5 text-xs gap-1.5"
        >
          {playing ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Auto Write</>}
        </button>
        <button onClick={sendWrite} className="btn-ghost px-3 py-1.5 text-xs">
          ✍ Send Write
        </button>

        <button
          onClick={() => setNetworkDelay((d) => !d)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition",
            networkDelay
              ? "border-neon-yellow/60 bg-neon-yellow/10 text-neon-yellow"
              : "border-[var(--border-subtle)] text-ink-secondary"
          )}
        >
          <WifiOff size={12} /> Network Delay
        </button>

        {mode === "single-leader" && (
          <button
            onClick={handleLeaderFailover}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition",
              leaderDown
                ? "border-neon-green/60 bg-neon-green/10 text-neon-green"
                : "border-neon-red/60 bg-neon-red/10 text-neon-red"
            )}
          >
            <AlertTriangle size={12} /> {leaderDown ? "Revive Leader" : "Kill Leader"}
          </button>
        )}

        <button onClick={reset} className="btn-ghost px-3 py-1.5 text-xs">
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Nodes display */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              className="card p-3 text-center"
              style={{ borderColor: `${nodeColor(node)}40` }}
              animate={
                node.status === "syncing"
                  ? { opacity: [1, 0.6, 1] }
                  : {}
              }
              transition={{ duration: 0.8, repeat: node.status === "syncing" ? Infinity : 0 }}
            >
              <div className="text-xl mb-1">{nodeEmoji(node)}</div>
              <div className="font-mono font-bold text-white text-sm">{node.label}</div>
              <div
                className="mono text-[0.55rem] uppercase font-bold mb-2"
                style={{ color: nodeColor(node) }}
              >
                {roleBadge(node)}
              </div>

              <div className="rounded bg-bg-tertiary/60 p-1.5">
                <div className="mono text-[0.55rem] text-ink-muted">value</div>
                <motion.div
                  className="font-display text-xl font-bold"
                  animate={{ color: nodeColor(node) }}
                >
                  {node.value}
                </motion.div>
                {node.lag > 0 && (
                  <div className="mono text-[0.5rem] text-neon-yellow">
                    lag: ~{node.lag}s
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Write flow arrows */}
        <div className="mb-4 flex items-center justify-center gap-2 text-xs text-ink-muted">
          {mode === "single-leader" && (
            <>
              <span className="rounded bg-bg-tertiary px-2 py-1 font-mono text-neon-blue">Client</span>
              <span>→</span>
              <span className="rounded bg-bg-tertiary px-2 py-1 font-mono text-neon-blue">Leader (DB-1)</span>
              <span>→</span>
              <span className="rounded bg-bg-tertiary px-2 py-1 font-mono text-neon-green">Followers</span>
            </>
          )}
          {mode === "multi-leader" && (
            <>
              <span className="rounded bg-bg-tertiary px-2 py-1 font-mono text-neon-blue">DC-1 writes</span>
              <span>⇔</span>
              <span className="rounded bg-bg-tertiary px-2 py-1 font-mono text-neon-green">DC-2 writes</span>
              <span className="text-neon-orange ml-2">⚠ conflicts possible</span>
            </>
          )}
          {mode === "leaderless" && (
            <>
              <span className="rounded bg-bg-tertiary px-2 py-1 font-mono text-neon-purple">Client</span>
              <span>→</span>
              <span className="rounded bg-bg-tertiary px-2 py-1 font-mono text-neon-purple">W=2/3 nodes</span>
              <span className="text-ink-muted ml-2">(quorum)</span>
            </>
          )}
        </div>

        {/* Event log */}
        <div className="rounded-xl bg-bg-tertiary/40 p-3 max-h-40 overflow-y-auto">
          <div className="mono mb-2 text-[0.6rem] uppercase tracking-widest text-ink-muted">Replication log</div>
          <AnimatePresence>
            {events.length === 0 ? (
              <div className="text-xs text-ink-muted italic">Send a write to see replication in action.</div>
            ) : (
              events.map((ev) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-1 flex items-start gap-2 text-xs"
                >
                  <span className="shrink-0 mt-px" style={{ color: ev.color }}>›</span>
                  <span className="text-ink-secondary">{ev.text}</span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Mode explainer cards ─────────────────────────────────────────────────────
const MODE_CARDS = [
  {
    title: "Single-Leader Replication",
    emoji: "👑",
    color: "var(--neon-blue)",
    pros: ["Simple to reason about", "No write conflicts", "Strong read consistency (from leader)"],
    cons: ["Leader is a bottleneck for writes", "Failover takes time (seconds to minutes)", "Followers can lag behind"],
    when: "Most relational databases: PostgreSQL streaming replication, MySQL binlog, MongoDB replica sets.",
  },
  {
    title: "Multi-Leader Replication",
    emoji: "👑👑",
    color: "var(--neon-orange)",
    pros: ["Write to nearest datacenter (low latency)", "Survives whole-DC outage", "More write throughput"],
    cons: ["Conflicts are now YOUR problem", "Complex conflict resolution logic", "Operational nightmare to debug"],
    when: "Multi-datacenter setups. CouchDB, MySQL with Tungsten, some PostgreSQL configs. Also: Google Docs concurrent editing.",
  },
  {
    title: "Leaderless Replication (Dynamo-style)",
    emoji: "🗳",
    color: "var(--neon-purple)",
    pros: ["No single point of failure", "Tunable consistency (R+W>N)", "Write to any node"],
    cons: ["Eventual consistency by default", "Read repair & anti-entropy needed", "Quorum math gets tricky"],
    when: "Apache Cassandra, Amazon DynamoDB, Riak. Best when availability > consistency and you have massive write scale.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReplicationPage() {
  return (
    <ConceptPage
      slug="replication"
      analogy={
        <FunnyAnalogy
          emoji="🖨️"
          color="var(--neon-green)"
          alternates={[
            {
              emoji: "📚",
              text: "A library keeping backup copies of rare books in 3 branches. One branch burns down — the book survives. The head librarian (leader) decides which copy is canonical.",
            },
            {
              emoji: "👯",
              text: "Backing up your phone to the cloud. Your phone is the leader. The cloud is the follower. Your phone dies → restore from cloud. Except now the cloud is the leader. Congratulations on your promotion, cloud.",
            },
          ]}
        >
          Replication = keeping <strong className="text-neon-green">multiple copies</strong> of your data on separate machines.
          One machine dies? Others serve reads. Disaster strikes your datacenter?
          Other datacenters have fresh copies. The catch: keeping all those copies in sync
          is where distributed systems get genuinely hard.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="Live simulation" title="Watch data replicate in real time">
          <p className="mb-4 text-ink-secondary">
            Switch between replication strategies. Toggle <strong className="text-neon-yellow">Network Delay</strong> to
            see replication lag. In Single-Leader mode, <strong className="text-neon-red">Kill the Leader</strong> and
            watch automatic failover promote a follower to leader.
          </p>
          <ReplicationSim />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The three strategies" title="How replication actually works">
          <div className="space-y-4">
            {MODE_CARDS.map((card) => (
              <div key={card.title} className="card p-4" style={{ borderColor: `${card.color}30` }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{card.emoji}</span>
                  <div className="font-display font-bold text-white">{card.title}</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <div className="mono text-[0.6rem] uppercase tracking-widest text-neon-green mb-1">Pros</div>
                    <ul className="text-xs text-ink-secondary space-y-1">
                      {card.pros.map((p) => <li key={p} className="flex gap-1.5"><span className="text-neon-green">+</span>{p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="mono text-[0.6rem] uppercase tracking-widest text-neon-red mb-1">Cons</div>
                    <ul className="text-xs text-ink-secondary space-y-1">
                      {card.cons.map((c) => <li key={c} className="flex gap-1.5"><span className="text-neon-red">-</span>{c}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="mono text-[0.6rem] uppercase tracking-widest mb-1" style={{ color: card.color }}>Used by</div>
                    <p className="text-xs text-ink-secondary">{card.when}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Single-leader, drawn" title="Where lag sneaks in">
          <p className="mb-4 text-ink-secondary">
            Writes hit the <strong className="text-neon-green">leader</strong>, which streams changes to followers.
            A <strong className="text-neon-blue">sync</strong> follower must confirm before the write returns (safe,
            slower); <strong className="text-neon-orange">async</strong> followers confirm later (fast, but can serve
            <em> stale</em> reads). That gap is replication lag. Click each box.
          </p>
          <AnimatedDiagram
            height={360}
            nodes={[
              { id: "w", type: "client", label: "Writer", position: { x: 8, y: 28 }, status: "active", info: "All writes go to the leader — there's only one writable copy in single-leader replication." },
              { id: "rd", type: "client", label: "Reader", position: { x: 8, y: 78 }, status: "active", info: "Reads from a follower to offload the leader — but may see data that's milliseconds-to-seconds behind." },
              { id: "leader", type: "database", label: "Leader", position: { x: 40, y: 28 }, status: "active", info: "Accepts writes, orders them, and ships the change log to every follower." },
              { id: "s1", type: "database", label: "Sync Follower", position: { x: 76, y: 14 }, status: "active", info: "Leader waits for THIS one to ACK before confirming the write. Guarantees a durable copy; costs latency." },
              { id: "s2", type: "database", label: "Async Follower", position: { x: 76, y: 50 }, status: "busy", info: "Receives changes after the fact. Fast, but a reader here might miss the latest write (replication lag)." },
              { id: "s3", type: "database", label: "Async Follower", position: { x: 76, y: 86 }, status: "busy", info: "If the leader dies, an async follower promoted to leader can lose its last un-replicated writes." },
            ]}
            edges={[
              { from: "w", to: "leader", animated: true, color: "var(--neon-green)", label: "write" },
              { from: "leader", to: "s1", animated: true, color: "var(--neon-blue)", label: "sync" },
              { from: "leader", to: "s2", dashed: true, color: "var(--neon-orange)", label: "async" },
              { from: "leader", to: "s3", dashed: true, color: "var(--neon-orange)" },
              { from: "rd", to: "s2", animated: true, color: "var(--neon-yellow)", label: "read (maybe stale)" },
            ]}
          />
          <p className="mt-3 text-xs text-ink-muted">Tip: &ldquo;read-your-own-writes&rdquo; breaks here — you write to the leader, then read from a lagging follower and your change is gone. Fix: read from the leader for a few seconds after writing.</p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The hard problem" title="Replication lag & what goes wrong">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                emoji: "📖",
                title: "Read-your-own-writes problem",
                body: "You submit a form, get redirected, immediately re-read the page — but hit a stale follower. Your changes appear to vanish. Fix: route reads-after-writes to the leader or wait for follower to catch up.",
                color: "var(--neon-red)",
              },
              {
                emoji: "⏪",
                title: "Monotonic reads problem",
                body: "You query follower A (value=5), then follower B (value=3 — more lagged). Time appears to go backwards. Fix: ensure each user always reads from the same replica.",
                color: "var(--neon-yellow)",
              },
              {
                emoji: "🔀",
                title: "Causality violation",
                body: "Alice replies to Bob&apos;s comment. A reader sees Alice&apos;s reply before Bob&apos;s original comment (because replicas have different lag). Fix: consistent prefix reads or vector clocks.",
                color: "var(--neon-orange)",
              },
              {
                emoji: "⚔️",
                title: "Write conflicts (multi-leader)",
                body: "Two users edit the same document simultaneously on different leaders. Both writes succeed locally. Who wins? Last-write-wins (LWW), merge, or application-level resolution.",
                color: "var(--neon-red)",
              },
            ].map((item) => (
              <div key={item.title} className="card p-4" style={{ borderColor: `${item.color}30` }}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <div className="font-display font-semibold text-white mb-1">{item.title}</div>
                    <p className="text-sm text-ink-secondary">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Head to head" title="Single-Leader vs Leaderless">
          <ComparisonBattle
            left={{
              name: "Single Leader",
              emoji: "👑",
              color: "var(--neon-blue)",
              bestFor: "Relational workloads needing strong consistency and simple mental model. PostgreSQL, MySQL, MongoDB (replica set).",
            }}
            right={{
              name: "Leaderless",
              emoji: "🗳",
              color: "var(--neon-purple)",
              bestFor: "Planet-scale write workloads needing maximum availability. Cassandra, DynamoDB. You handle eventual consistency.",
            }}
            features={[
              { label: "Write throughput", a: 6, b: 9, max: 10, winner: "b" },
              { label: "Consistency", a: 9, b: 5, max: 10, winner: "a" },
              { label: "Availability", a: 6, b: 9, max: 10, winner: "b" },
              { label: "Operational simplicity", a: 8, b: 4, max: 10, winner: "a" },
              { label: "Conflict handling", a: "None (single write path)", b: "Your problem™", winner: "a" },
              { label: "Latency (multi-DC)", a: "High (writes → leader)", b: "Low (write locally)", winner: "b" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Quorum math" title="R + W &gt; N — the leaderless magic formula">
          <div className="card p-4">
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div className="rounded-xl bg-bg-tertiary/60 p-3 text-center">
                <div className="font-display text-3xl font-extrabold text-neon-blue mb-1">N</div>
                <div className="font-semibold text-white">Total Replicas</div>
                <p className="text-ink-secondary text-xs mt-1">How many copies of each data item. Typically 3 in production.</p>
              </div>
              <div className="rounded-xl bg-bg-tertiary/60 p-3 text-center">
                <div className="font-display text-3xl font-extrabold text-neon-green mb-1">W</div>
                <div className="font-semibold text-white">Write Quorum</div>
                <p className="text-ink-secondary text-xs mt-1">How many nodes must acknowledge a write. High W = durable but slow.</p>
              </div>
              <div className="rounded-xl bg-bg-tertiary/60 p-3 text-center">
                <div className="font-display text-3xl font-extrabold text-neon-purple mb-1">R</div>
                <div className="font-semibold text-white">Read Quorum</div>
                <p className="text-ink-secondary text-xs mt-1">How many nodes must respond to a read. High R = consistent but slower reads.</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-neon-yellow/30 bg-neon-yellow/5 p-3 text-sm">
              <div className="font-mono font-bold text-neon-yellow mb-1">The rule: R + W &gt; N guarantees you see the latest write</div>
              <div className="text-ink-secondary text-xs">
                With N=3, W=2, R=2: any read sees at least one node that has the latest write.
                Set W=3 for durability. Set R=1 for speed. Trade off as needed.
              </div>
            </div>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="replication"
          questions={[
            {
              question: "In single-leader replication, why can reads from followers return stale data?",
              options: [
                "Followers don&apos;t store the data, only metadata",
                "Replication lag — followers receive updates asynchronously from the leader",
                "Followers compress data before storing it",
                "The leader only sends updates once per hour",
              ],
              correct: 1,
              explain: "Followers replicate asynchronously. There&apos;s a delay between the leader committing a write and the follower applying it. During this window, reads from followers return old data.",
            },
            {
              question: "What is the &apos;read-your-own-writes&apos; problem in replication?",
              options: [
                "A user can't read data they didn't write",
                "After writing to the leader, reading from a lagging follower makes your write appear to vanish",
                "Reading data creates write locks on all replicas",
                "Writes are automatically deduplicated across replicas",
              ],
              correct: 1,
              explain: "Classic UX bug: you submit a form, get redirected, your browser hits a lagging replica. Your changes seem lost. Fix by routing post-write reads to the leader or waiting for replica sync.",
            },
            {
              question: "In leaderless replication with N=5, W=3, R=3, what guarantees that reads see recent writes?",
              options: [
                "Because W + R > N (6 > 5), there's always at least 1 node in common between write and read sets",
                "The coordinator node always has the latest data",
                "Reads are automatically directed to the most-recently-written node",
                "W and R must always equal each other",
              ],
              correct: 0,
              explain: "R + W > N (3+3 > 5) means any read quorum of 3 must overlap with any write quorum of 3 by at least 1 node. That overlapping node has the latest write, so reads always include fresh data.",
            },
            {
              question: "What is the main tradeoff of multi-leader replication?",
              options: [
                "Lower write throughput per datacenter",
                "Write conflicts when two leaders accept writes to the same data simultaneously",
                "Single point of failure at the coordinator",
                "Reads must always go to the primary leader",
              ],
              correct: 1,
              explain: "When two leaders accept conflicting writes, you now have two different versions of truth. You need conflict resolution: last-write-wins, application merges, or CRDTs. It's genuinely hard.",
            },
            {
              question: "When a leader fails in single-leader replication, what is automatic failover?",
              options: [
                "The old leader restarts itself automatically",
                "All writes are rejected until a human picks a new leader",
                "The system detects the failure and promotes the most up-to-date follower to leader",
                "Data is restored from a backup snapshot",
              ],
              correct: 2,
              explain: "Automated failover detects leader death (via heartbeats), selects the follower with the most complete replication log, promotes it to leader, and updates routing. In Kubernetes, this is often handled by operators.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
