"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw, Zap, WifiOff } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
type NodeState = "follower" | "candidate" | "leader" | "down";

interface RaftNode {
  id: number;
  label: string;
  state: NodeState;
  term: number;
  votedFor: number | null;
  votes: number;
  log: number[]; // committed log entries
  partitioned: boolean;
}

// ─── Layout helpers ────────────────────────────────────────────────────────────
const NODE_COUNT = 5;
const CX = 160;
const CY = 160;
const RADIUS = 110;

function nodePos(i: number) {
  const angle = (360 / NODE_COUNT) * i - 90;
  const rad = (angle * Math.PI) / 180;
  return {
    x: CX + RADIUS * Math.cos(rad),
    y: CY + RADIUS * Math.sin(rad),
  };
}

// ─── Initial state ─────────────────────────────────────────────────────────────
function makeInitialNodes(): RaftNode[] {
  return Array.from({ length: NODE_COUNT }, (_, i) => ({
    id: i,
    label: `N${i + 1}`,
    state: "follower" as NodeState,
    term: 0,
    votedFor: null,
    votes: 0,
    log: [],
    partitioned: false,
  }));
}

// ─── Event log message ────────────────────────────────────────────────────────
interface LogEntry {
  id: number;
  text: string;
  color: string;
}

// ─── RAFT Visualization ───────────────────────────────────────────────────────
function RaftViz() {
  const [nodes, setNodes] = useState<RaftNode[]>(makeInitialNodes());
  const [events, setEvents] = useState<LogEntry[]>([]);
  const [playing, setPlaying] = useState(false);
  const [partitionActive, setPartitionActive] = useState(false);
  const [logEntries, setLogEntries] = useState<{ term: number; cmd: string }[]>([]);
  const [phase, setPhase] = useState<"idle" | "election" | "leader" | "replicating">("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const addEvent = useCallback((text: string, color: string) => {
    setEvents((ev) => [{ id: Date.now() + Math.random(), text, color }, ...ev].slice(0, 10));
  }, []);

  const getLeader = useCallback(
    (ns: RaftNode[]) => ns.find((n) => n.state === "leader" && !n.partitioned && n.state !== "down" as NodeState),
    []
  );

  // Start election: pick a random non-down, non-leader follower as candidate
  const startElection = useCallback(() => {
    setNodes((ns) => {
      const eligible = ns.filter((n) => n.state === "follower" && !n.partitioned);
      if (eligible.length === 0) return ns;
      const candidate = eligible[Math.floor(Math.random() * eligible.length)];
      const newTerm = Math.max(...ns.map((n) => n.term)) + 1;
      addEvent(`N${candidate.id + 1} timeout → Candidate (term ${newTerm})`, "var(--neon-yellow)");
      return ns.map((n) => ({
        ...n,
        term: Math.max(n.term, newTerm),
        state: n.id === candidate.id ? ("candidate" as NodeState) : n.state,
        votes: 0,
        votedFor: n.id === candidate.id ? candidate.id : null,
      }));
    });
    setPhase("election");
  }, [addEvent]);

  // Count votes and elect leader
  const conductVote = useCallback(() => {
    setNodes((ns) => {
      const candidate = ns.find((n) => n.state === "candidate");
      if (!candidate) return ns;
      const voters = ns.filter(
        (n) => n.id !== candidate.id && !n.partitioned && n.state !== ("down" as NodeState)
      );
      const votes = voters.filter(() => Math.random() > 0.15).length + 1; // +1 for self
      const majority = Math.floor(NODE_COUNT / 2) + 1;

      if (votes >= majority) {
        addEvent(
          `N${candidate.id + 1} received ${votes}/${NODE_COUNT} votes → LEADER (term ${candidate.term})`,
          "var(--neon-green)"
        );
        setPhase("leader");
        return ns.map((n) => ({
          ...n,
          state: n.id === candidate.id ? ("leader" as NodeState) : n.state === ("candidate" as NodeState) ? "follower" : n.state,
          votes: n.id === candidate.id ? votes : 0,
        }));
      } else {
        addEvent(
          `N${candidate.id + 1} only got ${votes} votes (need ${majority}) → back to Follower`,
          "var(--neon-orange)"
        );
        setPhase("idle");
        return ns.map((n) => ({
          ...n,
          state: n.state === ("candidate" as NodeState) ? "follower" : n.state,
        }));
      }
    });
  }, [addEvent]);

  // Replicate a log entry from leader
  const replicateEntry = useCallback(() => {
    setNodes((ns) => {
      const leader = getLeader(ns);
      if (!leader) return ns;
      const cmd = `cmd_${logEntries.length + 1}`;
      const newEntry = { term: leader.term, cmd };
      setLogEntries((le) => [...le, newEntry]);
      addEvent(
        `Leader N${leader.id + 1} replicates "${cmd}" → followers`,
        "var(--neon-blue)"
      );
      return ns.map((n) => {
        if (n.id === leader.id) return { ...n, log: [...n.log, logEntries.length + 1] };
        if (!n.partitioned && n.state !== ("down" as NodeState)) {
          return { ...n, log: [...n.log, logEntries.length + 1] };
        }
        return n;
      });
    });
  }, [addEvent, getLeader, logEntries.length]);

  // Auto-play logic
  const tick = useCallback(() => {
    const ph = phaseRef.current;
    if (ph === "idle") startElection();
    else if (ph === "election") conductVote();
    else if (ph === "leader") replicateEntry();
  }, [startElection, conductVote, replicateEntry]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(tick, 1200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, tick]);

  const killLeader = useCallback(() => {
    setNodes((ns) => {
      const leader = getLeader(ns);
      if (!leader) {
        addEvent("No active leader to kill!", "var(--neon-red)");
        return ns;
      }
      addEvent(`💥 N${leader.id + 1} (leader, term ${leader.term}) CRASHED!`, "var(--neon-red)");
      setPhase("idle");
      return ns.map((n) =>
        n.id === leader.id
          ? { ...n, state: "down" as NodeState }
          : { ...n, state: "follower" as NodeState }
      );
    });
  }, [addEvent, getLeader]);

  const togglePartition = useCallback(() => {
    const newPartitioned = !partitionActive;
    setPartitionActive(newPartitioned);
    setNodes((ns) => {
      // Partition the minority (nodes 3,4 — indices 3,4)
      const updated = ns.map((n, i) => ({
        ...n,
        partitioned: newPartitioned && i >= 3,
      }));
      if (newPartitioned) {
        addEvent(
          "⚡ Network partition: N4 + N5 isolated from majority (N1+N2+N3)",
          "var(--neon-red)"
        );
        // Check if leader is in minority — force re-election
        const leader = updated.find((n) => n.state === "leader");
        if (leader && leader.partitioned) {
          addEvent("Leader in minority partition → cannot reach quorum → steps down", "var(--neon-orange)");
          setPhase("idle");
          return updated.map((n) =>
            n.state === ("leader" as NodeState) ? { ...n, state: "follower" as NodeState } : n
          );
        }
      } else {
        addEvent("🔧 Partition healed — nodes rejoining cluster", "var(--neon-green)");
      }
      return updated;
    });
  }, [addEvent, partitionActive]);

  const reviveNode = useCallback((id: number) => {
    setNodes((ns) =>
      ns.map((n) =>
        n.id === id ? { ...n, state: "follower" as NodeState } : n
      )
    );
    addEvent(`N${id + 1} rejoined as follower`, "var(--neon-green)");
  }, [addEvent]);

  const reset = useCallback(() => {
    setPlaying(false);
    setPartitionActive(false);
    setPhase("idle");
    setNodes(makeInitialNodes());
    setEvents([]);
    setLogEntries([]);
  }, []);

  const stateColor = (n: RaftNode) => {
    if (n.state === "down") return "var(--neon-red)";
    if (n.partitioned) return "#ff660080";
    if (n.state === "leader") return "var(--neon-green)";
    if (n.state === "candidate") return "var(--neon-yellow)";
    return "var(--neon-blue)";
  };

  const stateEmoji = (n: RaftNode) => {
    if (n.state === "down") return "💀";
    if (n.partitioned) return "🔌";
    if (n.state === "leader") return "👑";
    if (n.state === "candidate") return "🙋";
    return "○";
  };

  const leader = getLeader(nodes);

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] bg-bg-tertiary/40 px-4 py-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="btn-neon px-3 py-1.5 text-xs gap-1.5"
        >
          {playing ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Auto-run</>}
        </button>

        <button onClick={startElection} disabled={phase === "election"} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">
          <Zap size={12} /> Start Election
        </button>

        {phase === "election" && (
          <button onClick={conductVote} className="btn-ghost px-3 py-1.5 text-xs">
            🗳 Cast Votes
          </button>
        )}

        {phase === "leader" && (
          <button onClick={replicateEntry} className="btn-ghost px-3 py-1.5 text-xs">
            ✍ Replicate Entry
          </button>
        )}

        <button
          onClick={killLeader}
          disabled={!leader}
          className="flex items-center gap-1.5 rounded-lg border border-neon-red/60 bg-neon-red/10 px-3 py-1.5 text-xs text-neon-red disabled:opacity-40"
        >
          💀 Kill Leader
        </button>

        <button
          onClick={togglePartition}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition",
            partitionActive
              ? "border-neon-orange/60 bg-neon-orange/10 text-neon-orange"
              : "border-[var(--border-subtle)] text-ink-secondary"
          )}
        >
          <WifiOff size={12} /> {partitionActive ? "Heal Partition" : "Network Partition"}
        </button>

        <button onClick={reset} className="btn-ghost px-3 py-1.5 text-xs">
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Status banner */}
      <AnimatePresence>
        {partitionActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 bg-neon-orange/10 px-4 py-2 text-xs text-neon-orange">
              <WifiOff size={12} />
              Network partition: N4+N5 isolated. Majority (N1+N2+N3) can still elect a leader and commit entries.
              Minority cannot — RAFT&apos;s split-brain prevention works.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:items-start">
        {/* SVG node ring */}
        <svg viewBox="0 0 320 320" width={320} height={320} className="shrink-0" aria-label="RAFT cluster visualization">
          {/* Connection lines between all nodes */}
          {nodes.flatMap((na, i) =>
            nodes.slice(i + 1).map((nb) => {
              const pa = nodePos(na.id);
              const pb = nodePos(nb.id);
              const isLeaderEdge =
                (na.state === "leader" || nb.state === "leader") &&
                !na.partitioned && !nb.partitioned &&
                na.state !== ("down" as NodeState) && nb.state !== ("down" as NodeState);
              const acrossPartition = na.partitioned !== nb.partitioned;
              return (
                <line
                  key={`${na.id}-${nb.id}`}
                  x1={pa.x} y1={pa.y}
                  x2={pb.x} y2={pb.y}
                  stroke={
                    acrossPartition
                      ? "var(--neon-red)"
                      : isLeaderEdge
                      ? "var(--neon-green)"
                      : "var(--border-subtle)"
                  }
                  strokeWidth={acrossPartition ? 1.5 : isLeaderEdge ? 2 : 1}
                  strokeDasharray={acrossPartition ? "4 4" : undefined}
                  strokeOpacity={acrossPartition ? 0.5 : isLeaderEdge ? 0.7 : 0.25}
                />
              );
            })
          )}

          {/* Partition zone indicator */}
          {partitionActive && (
            <>
              <ellipse cx={220} cy={240} rx={70} ry={50} fill="rgba(255,102,0,0.06)" stroke="rgba(255,102,0,0.3)" strokeWidth={1.5} strokeDasharray="6 4" />
              <text x={220} y={298} textAnchor="middle" fontSize={9} fill="rgba(255,102,0,0.7)" fontFamily="monospace">Minority partition</text>
            </>
          )}

          {/* Nodes */}
          {nodes.map((node) => {
            const pos = nodePos(node.id);
            const color = stateColor(node);
            return (
              <motion.g
                key={node.id}
                onClick={() => node.state === ("down" as NodeState) && reviveNode(node.id)}
                style={{ cursor: node.state === ("down" as NodeState) ? "pointer" : "default" }}
              >
                {/* Glow ring for leader */}
                {node.state === "leader" && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={26}
                    fill="none"
                    stroke="var(--neon-green)"
                    strokeWidth={2}
                    animate={{ r: [26, 30, 26], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                {/* Candidate pulse */}
                {node.state === "candidate" && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={22}
                    fill="none"
                    stroke="var(--neon-yellow)"
                    strokeWidth={1.5}
                    animate={{ r: [22, 28, 22], opacity: [0.8, 0.1, 0.8] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}

                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={20}
                  fill={
                    node.state === ("down" as NodeState)
                      ? "rgba(255,51,102,0.15)"
                      : node.partitioned
                      ? "rgba(255,102,0,0.1)"
                      : "var(--bg-tertiary)"
                  }
                  stroke={color}
                  strokeWidth={node.state === "leader" ? 3 : 2}
                  style={{ filter: node.state === "leader" ? "drop-shadow(0 0 8px var(--neon-green))" : undefined }}
                />

                {/* Emoji */}
                <text
                  x={pos.x}
                  y={pos.y - 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={14}
                >
                  {stateEmoji(node)}
                </text>

                {/* Label */}
                <text
                  x={pos.x}
                  y={pos.y + 32}
                  textAnchor="middle"
                  fontSize={9}
                  fill={color}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {node.label}
                </text>

                {/* Term */}
                <text
                  x={pos.x}
                  y={pos.y + 42}
                  textAnchor="middle"
                  fontSize={8}
                  fill="var(--text-secondary)"
                  fontFamily="monospace"
                >
                  t={node.term}
                </text>

                {/* Log length indicator */}
                {node.log.length > 0 && (
                  <text
                    x={pos.x}
                    y={pos.y + 52}
                    textAnchor="middle"
                    fontSize={7}
                    fill="var(--neon-blue)"
                    fontFamily="monospace"
                  >
                    log:{node.log.length}
                  </text>
                )}
              </motion.g>
            );
          })}

          {/* Center info */}
          <text x={CX} y={CY - 6} textAnchor="middle" fontSize={9} fill="var(--text-secondary)" fontFamily="monospace">
            {leader ? `Leader: N${leader.id + 1}` : "No leader"}
          </text>
          <text x={CX} y={CY + 7} textAnchor="middle" fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">
            term {Math.max(...nodes.map((n) => n.term))}
          </text>
          <text x={CX} y={CY + 19} textAnchor="middle" fontSize={7} fill="var(--neon-purple)" fontFamily="monospace">
            {phase === "idle" ? "waiting..." : phase === "election" ? "electing..." : phase === "leader" ? "running" : "replicating"}
          </text>
        </svg>

        {/* Right panel: log + events */}
        <div className="flex-1 space-y-3 min-w-0">
          {/* Legend */}
          <div className="grid grid-cols-2 gap-1.5 text-[0.65rem]">
            {[
              { emoji: "○", label: "Follower", color: "var(--neon-blue)" },
              { emoji: "🙋", label: "Candidate", color: "var(--neon-yellow)" },
              { emoji: "👑", label: "Leader", color: "var(--neon-green)" },
              { emoji: "💀", label: "Down (click=revive)", color: "var(--neon-red)" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span style={{ color: l.color }}>{l.emoji}</span>
                <span className="text-ink-muted">{l.label}</span>
              </div>
            ))}
          </div>

          {/* Committed log */}
          <div className="rounded-xl bg-bg-tertiary/40 p-3">
            <div className="mono mb-1.5 text-[0.6rem] uppercase tracking-widest text-ink-muted">Committed log</div>
            <div className="flex flex-wrap gap-1">
              {logEntries.length === 0 ? (
                <span className="text-xs text-ink-muted italic">No entries yet</span>
              ) : (
                logEntries.map((e, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="rounded bg-neon-blue/20 border border-neon-blue/40 px-1.5 py-0.5 font-mono text-[0.6rem] text-neon-blue"
                  >
                    {e.cmd}
                  </motion.span>
                ))
              )}
            </div>
          </div>

          {/* Event log */}
          <div className="rounded-xl bg-bg-tertiary/40 p-3 max-h-52 overflow-y-auto">
            <div className="mono mb-1.5 text-[0.6rem] uppercase tracking-widest text-ink-muted">RAFT events</div>
            <AnimatePresence>
              {events.length === 0 ? (
                <div className="text-xs text-ink-muted italic">Hit &ldquo;Auto-run&rdquo; or &ldquo;Start Election&rdquo; to begin.</div>
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
    </div>
  );
}

// ─── RAFT Steps explainer ─────────────────────────────────────────────────────
const RAFT_STEPS = [
  {
    step: "1",
    title: "Leader Election",
    color: "var(--neon-yellow)",
    emoji: "⏰",
    body: "Each follower has a random election timeout (150–300ms). When it expires without a heartbeat from a leader, the node becomes a Candidate, increments its term, and requests votes from all other nodes.",
    detail: "If a candidate gets a majority (N/2+1) of votes, it becomes the leader and immediately sends heartbeats to suppress other elections.",
  },
  {
    step: "2",
    title: "Log Replication",
    color: "var(--neon-blue)",
    emoji: "📋",
    body: "All writes go to the leader. The leader appends the entry to its log, then sends it to followers in parallel (AppendEntries RPC). Once a majority acknowledges, the entry is committed.",
    detail: "Followers that are lagging catch up by receiving older log entries from the leader. The leader never overwrites its own log — it just keeps appending.",
  },
  {
    step: "3",
    title: "Safety",
    color: "var(--neon-green)",
    emoji: "🛡️",
    body: "RAFT guarantees that once an entry is committed (majority acknowledged), it will never be overwritten. Any future leader must have all committed entries — candidates only win if their log is at least as up-to-date as any voter.",
    detail: "This is the key insight that makes RAFT correct. No committed entry can ever be lost, even if the leader immediately crashes after committing.",
  },
  {
    step: "4",
    title: "Network Partitions",
    color: "var(--neon-red)",
    emoji: "⚡",
    body: "If a partition splits the cluster, only the majority partition can elect a leader. The minority partition is leaderless and rejects all writes. When the partition heals, the minority catches up from the majority leader.",
    detail: "This means RAFT is CP (consistent + partition tolerant). A minority partition prefers unavailability over returning stale or conflicting data.",
  },
];

// ─── Paxos vs Raft ────────────────────────────────────────────────────────────
const PAXOS_JOKES = [
  "Paxos was described in a paper so confusing that the author wrote a second paper called &lsquo;Paxos Made Simple&rsquo; — which is still not simple.",
  "Understanding Paxos is a hazing ritual for distributed systems engineers. You emerge either enlightened or broken.",
  "RAFT was explicitly designed to be understandable. Paxos was designed to be correct. Coincidence? No.",
  "Multi-Paxos has 4 phases and requires a PhD to implement without bugs. RAFT has 2 phases and a 20-page paper.",
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConsensusAlgorithmsPage() {
  const [jokeIdx, setJokeIdx] = useState(0);

  return (
    <ConceptPage
      slug="consensus-algorithms"
      analogy={
        <FunnyAnalogy
          emoji="🗳️"
          color="var(--neon-purple)"
          alternates={[
            {
              emoji: "🏢",
              text: "RAFT = your company has a CEO who makes all decisions. Everyone follows. Clear, simple, one throat to choke. Paxos = board of directors that votes on every single decision. Good luck getting lunch approved.",
            },
            {
              emoji: "🎓",
              text: "RAFT is the textbook that makes sense. Paxos is the textbook that spawns 47 academic papers clarifying what the original meant. Both teach the same math. Only one teaches it to humans.",
            },
          ]}
        >
          Consensus = getting a bunch of computers to agree on a single value even when some of them
          might be crashing, lying, or simply having a bad network day.{" "}
          <strong className="text-neon-green">RAFT</strong>: elect one leader, they decide everything. Simple.
          {" "}<strong className="text-neon-purple">Paxos</strong>: vote on every individual decision with a
          two-phase protocol that even its creator needed a second paper to explain.
          Both work. Only one is explainable at a dinner party.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="★ The visualization" title="5-Node RAFT Cluster — live">
          <p className="mb-4 text-ink-secondary">
            Hit <strong className="text-neon-green">Auto-run</strong> to watch the full lifecycle: timeout →
            candidate → election → leader → log replication.
            Kill the leader and watch the cluster recover. Trigger a network partition and see the minority freeze.
          </p>
          <RaftViz />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="How RAFT works" title="The four pillars">
          <div className="grid gap-4 sm:grid-cols-2">
            {RAFT_STEPS.map((step) => (
              <motion.div
                key={step.step}
                className="card p-4"
                style={{ borderColor: `${step.color}35` }}
                whileHover={{ borderColor: step.color, scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold"
                    style={{ background: `${step.color}20`, color: step.color, border: `1.5px solid ${step.color}` }}
                  >
                    {step.step}
                  </div>
                  <span className="text-xl">{step.emoji}</span>
                  <div className="font-display font-bold text-white">{step.title}</div>
                </div>
                <p className="text-sm text-ink-secondary mb-2">{step.body}</p>
                <div
                  className="rounded-lg p-2.5 text-xs italic"
                  style={{ background: `${step.color}0d`, borderLeft: `2px solid ${step.color}`, color: step.color }}
                >
                  {step.detail}
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The write path" title="One leader, a majority must agree">
          <p className="mb-4 text-ink-secondary">
            All writes go to the elected <strong className="text-neon-purple">leader</strong>. It appends the entry
            to its log and replicates to the <strong className="text-neon-blue">followers</strong>. The entry only{" "}
            <em>commits</em> once a <strong className="text-neon-green">majority</strong> (here 3 of 5) acknowledge —
            so the system survives up to 2 dead nodes and never splits the truth. Click each box.
          </p>
          <AnimatedDiagram
            height={380}
            nodes={[
              { id: "client", type: "client", label: "Client", position: { x: 8, y: 50 }, status: "active", info: "Sends a write. Only the leader accepts it — followers redirect clients to the leader." },
              { id: "leader", type: "server", label: "Leader", position: { x: 35, y: 50 }, status: "active", info: "Appends to its log, then sends AppendEntries to all followers. Commits once a majority confirm." },
              { id: "f1", type: "server", label: "Follower", position: { x: 72, y: 14 }, status: "busy", info: "Replicates the leader's log and ACKs. Votes in elections if the leader goes silent." },
              { id: "f2", type: "server", label: "Follower", position: { x: 72, y: 38 }, status: "busy", info: "Part of the quorum. Leader + these two = 3/5 majority → entry commits." },
              { id: "f3", type: "server", label: "Follower", position: { x: 72, y: 62 }, status: "idle", info: "Can be slow or briefly down — the write still commits as long as a majority responded." },
              { id: "f4", type: "server", label: "Follower", position: { x: 72, y: 86 }, status: "idle", info: "5 nodes tolerate 2 failures. A bare majority (3) is enough to make progress." },
            ]}
            edges={[
              { from: "client", to: "leader", animated: true, label: "write" },
              { from: "leader", to: "f1", animated: true, color: "var(--neon-green)", label: "AppendEntries" },
              { from: "leader", to: "f2", animated: true, color: "var(--neon-green)" },
              { from: "leader", to: "f3", dashed: true, color: "var(--neon-blue)" },
              { from: "leader", to: "f4", dashed: true, color: "var(--neon-blue)" },
            ]}
          />
          <p className="mt-3 text-xs text-ink-muted">Tip: &ldquo;majority&rdquo; is why clusters are odd-sized (3, 5, 7). With 5 nodes you need 3 to agree — two can fail and the cluster keeps writing.</p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The alternative" title="Paxos — for those who enjoy suffering">
          <div className="card p-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="mono mb-2 text-[0.65rem] uppercase tracking-widest text-neon-purple">Paxos reality check</div>
                <div
                  className="mb-4 rounded-xl border border-neon-purple/30 bg-neon-purple/10 p-4 italic text-sm text-ink-secondary"
                  onClick={() => setJokeIdx((i) => (i + 1) % PAXOS_JOKES.length)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="text-neon-purple">&ldquo;</span>
                  <span dangerouslySetInnerHTML={{ __html: PAXOS_JOKES[jokeIdx] }} />
                  <span className="text-neon-purple">&rdquo;</span>
                  <div className="mt-2 mono text-[0.55rem] text-ink-muted">(click for another)</div>
                </div>
                <div className="grid gap-2 text-xs">
                  {[
                    { label: "Phase 1 (Prepare/Promise)", detail: "Proposer sends Prepare(n) to majority. Acceptors promise not to accept anything with lower n, and return any value they've already accepted." },
                    { label: "Phase 2 (Accept/Accepted)", detail: "Proposer sends Accept(n, v) where v is the highest-numbered value returned in phase 1 (or any new value). Majority must accept." },
                    { label: "Multi-Paxos optimization", detail: "Skip phase 1 for subsequent values by establishing a distinguished leader — which is basically what RAFT does from the start." },
                  ].map((p) => (
                    <div key={p.label} className="rounded-lg bg-bg-tertiary/60 p-2.5">
                      <div className="font-semibold text-neon-purple mb-0.5">{p.label}</div>
                      <div className="text-ink-secondary">{p.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="shrink-0 sm:w-48">
                <div className="mono mb-2 text-[0.6rem] uppercase tracking-widest text-neon-green">RAFT vs Paxos</div>
                {[
                  { label: "Understandability", raft: "★★★★★", paxos: "★☆☆☆☆" },
                  { label: "Correctness proofs", raft: "Complete", paxos: "Complete" },
                  { label: "Leader election", raft: "Built-in", paxos: "External" },
                  { label: "Implementations", raft: "etcd, CockroachDB, TiKV", paxos: "Chubby, Spanner" },
                  { label: "PhD required", raft: "No", paxos: "Recommended" },
                ].map((row) => (
                  <div key={row.label} className="border-b border-[var(--border-subtle)] py-1.5 text-[0.65rem]">
                    <div className="text-ink-muted mb-0.5">{row.label}</div>
                    <div className="flex justify-between">
                      <span className="text-neon-green">{row.raft}</span>
                      <span className="text-neon-purple">{row.paxos}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Real world" title="Who uses consensus algorithms">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                name: "etcd (Kubernetes)",
                emoji: "☸️",
                algo: "RAFT",
                color: "var(--neon-blue)",
                detail: "Every Kubernetes cluster relies on etcd for storing all cluster state — nodes, configs, secrets. etcd uses RAFT to ensure all cluster nodes agree on state.",
              },
              {
                name: "CockroachDB",
                emoji: "🪳",
                algo: "RAFT",
                color: "var(--neon-green)",
                detail: "Each range (shard) of data runs its own RAFT group. Writes commit only when a majority of replicas acknowledge. Allows global, geo-distributed SQL databases.",
              },
              {
                name: "Google Chubby / Spanner",
                emoji: "🌍",
                algo: "Paxos",
                color: "var(--neon-purple)",
                detail: "Chubby is Google's distributed lock service. Spanner uses Paxos for replication across multiple datacenters. Google has the PhD budget for this.",
              },
              {
                name: "Apache ZooKeeper",
                emoji: "🦓",
                algo: "ZAB (Paxos-inspired)",
                color: "var(--neon-yellow)",
                detail: "ZooKeeper Atomic Broadcast is a Paxos variant. Powers coordination in Kafka, Hadoop, and others. Also increasingly replaced by RAFT-based alternatives.",
              },
            ].map((item) => (
              <div key={item.name} className="card p-4 flex gap-3" style={{ borderColor: `${item.color}30` }}>
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-semibold text-white">{item.name}</span>
                    <span
                      className="mono text-[0.55rem] rounded px-1.5 py-0.5"
                      style={{ background: `${item.color}20`, color: item.color }}
                    >
                      {item.algo}
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Byzantine fault tolerance" title="Wait, what if nodes actively lie?">
          <div className="card p-4 border-neon-red/30">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🕵️</span>
              <div>
                <div className="font-display font-bold text-white mb-2">
                  RAFT assumes crash faults, not Byzantine faults
                </div>
                <p className="text-sm text-ink-secondary mb-3">
                  RAFT and Paxos handle nodes that <em>crash and stop</em>. They don&apos;t handle nodes
                  that send <em>malicious or corrupted messages</em> (Byzantine faults).
                  For that, you need <strong className="text-white">BFT algorithms</strong> (Byzantine Fault Tolerant)
                  which require 3f+1 nodes to tolerate f malicious nodes.
                </p>
                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  <div className="rounded-lg bg-bg-tertiary/60 p-2.5">
                    <div className="font-semibold text-neon-orange mb-1">PBFT (Practical BFT)</div>
                    <div className="text-ink-secondary">Classic BFT algorithm. O(n²) messages. Used in permissioned blockchains.</div>
                  </div>
                  <div className="rounded-lg bg-bg-tertiary/60 p-2.5">
                    <div className="font-semibold text-neon-purple mb-1">Bitcoin / Proof of Work</div>
                    <div className="text-ink-secondary">{"Blockchain's answer to Byzantine consensus: make lying expensive through computational work."}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="consensus-algorithms"
          questions={[
            {
              question: "In RAFT, what triggers a leader election?",
              options: [
                "The current leader explicitly steps down",
                "A follower's election timeout expires without receiving a heartbeat from the leader",
                "A majority vote decides to change leaders",
                "The system detects high load on the leader",
              ],
              correct: 1,
              explain: "Each follower has a randomized election timeout (150-300ms). If it doesn't hear from a leader before it fires, it assumes the leader is dead and starts an election.",
            },
            {
              question: "How many nodes can a RAFT cluster lose and still function correctly with 5 total nodes?",
              options: [
                "1 node (majority = 5)",
                "2 nodes (majority = 3)",
                "3 nodes (majority = 2)",
                "4 nodes (majority = 1)",
              ],
              correct: 1,
              explain: "With 5 nodes, a majority is 3. So the cluster can tolerate 2 failures. With 7 nodes it can tolerate 3. General formula: floor(N/2) failures tolerated.",
            },
            {
              question: "What happens in RAFT when a network partition creates two groups of nodes?",
              options: [
                "Both partitions continue accepting writes independently",
                "The smaller partition elects its own leader while the larger one keeps the old leader",
                "Only the partition with a majority can elect/maintain a leader; the minority cannot commit entries",
                "All nodes stop accepting writes until the partition heals",
              ],
              correct: 2,
              explain: "RAFT requires a majority (quorum) to commit any entry. The minority partition can't form a quorum, so it can't elect a leader or commit writes. This prevents split-brain by design.",
            },
            {
              question: "What is the key difference between RAFT and Paxos?",
              options: [
                "RAFT is faster than Paxos in all scenarios",
                "RAFT explicitly elects a single leader for all decisions; Paxos can elect per-value proposers",
                "Paxos provides stronger consistency guarantees than RAFT",
                "RAFT requires more nodes than Paxos to function",
              ],
              correct: 1,
              explain: "RAFT simplifies consensus by using a single leader for all log entries. Paxos's basic form elects a proposer per-value, making it composable but complex. Multi-Paxos optimizes by maintaining a leader — similar to RAFT but arrived at differently.",
            },
            {
              question: "When a RAFT leader commits a log entry, what exactly has happened?",
              options: [
                "The entry is written to the leader's disk",
                "A majority of nodes have acknowledged appending the entry to their logs",
                "All nodes have applied the entry to their state machines",
                "The entry has been sent to all followers",
              ],
              correct: 1,
              explain: "Commit = a majority have appended the entry to their logs (not necessarily applied it). After commit, the entry is guaranteed to survive any future leader change, since the new leader must have a log at least as complete.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
