"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";
import { cn } from "@/lib/utils";
import { Plus, Minus, RotateCcw } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ServerNode {
  id: string;
  label: string;
  color: string;
  angle: number; // 0..360 degrees
}

interface DataKey {
  id: string;
  label: string;
  angle: number; // position on ring
  serverId: string; // which server owns it
  moved?: boolean; // highlight when recently moved
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SERVER_COLORS = [
  "var(--neon-blue)",
  "var(--neon-green)",
  "var(--neon-purple)",
  "var(--neon-orange)",
  "var(--neon-red)",
];

const INITIAL_SERVERS: ServerNode[] = [
  { id: "s1", label: "S1", color: SERVER_COLORS[0], angle: 0 },
  { id: "s2", label: "S2", color: SERVER_COLORS[1], angle: 120 },
  { id: "s3", label: "S3", color: SERVER_COLORS[2], angle: 240 },
];

// Generate some data keys spread around the ring
function generateKeys(count: number): Omit<DataKey, "serverId">[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `k${i}`,
    label: `key${i}`,
    angle: (360 / count) * i + 15, // slightly offset from server positions
  }));
}

// Find the server responsible for a given angle (clockwise next server)
function findOwner(angle: number, servers: ServerNode[]): string {
  if (servers.length === 0) return "";
  const sorted = [...servers].sort((a, b) => a.angle - b.angle);
  // find next clockwise
  for (const s of sorted) {
    if (s.angle >= angle) return s.id;
  }
  return sorted[0].id; // wrap around
}

function assignKeys(
  rawKeys: Omit<DataKey, "serverId">[],
  servers: ServerNode[]
): DataKey[] {
  return rawKeys.map((k) => ({
    ...k,
    serverId: findOwner(k.angle, servers),
    moved: false,
  }));
}

// Convert polar (angle, radius) to SVG coordinates centered at (cx, cy)
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ─── Virtual node helpers ──────────────────────────────────────────────────────
function getVirtualAngles(
  server: ServerNode,
  count: number
): number[] {
  // evenly space `count` virtual nodes around the ring, anchored at server.angle
  return Array.from(
    { length: count },
    (_, i) => (server.angle + (360 / count) * i * (360 / (SERVER_COLORS.length * count))) % 360
  );
}

// ─── Hash Ring Visualization ──────────────────────────────────────────────────
const KEY_COUNT = 12;
const RAW_KEYS = generateKeys(KEY_COUNT);

function HashRing() {
  const [servers, setServers] = useState<ServerNode[]>(INITIAL_SERVERS);
  const [virtualNodes, setVirtualNodes] = useState(false);
  const [movedKeyIds, setMovedKeyIds] = useState<Set<string>>(new Set());
  const [serverCount, setServerCount] = useState(3);

  const CX = 160;
  const CY = 160;
  const RING_R = 120;
  const KEY_R = 105;
  const SERVER_R = 135;
  const VIRTUAL_R = 128;

  const keys: DataKey[] = useMemo(
    () => assignKeys(RAW_KEYS, servers),
    [servers]
  );

  const addServer = useCallback(() => {
    if (servers.length >= 5) return;
    const newId = `s${servers.length + 1 + Date.now() % 100}`;
    const newAngle = (serverCount * 67 + 30) % 360; // pseudo-random placement
    const newColor = SERVER_COLORS[servers.length % SERVER_COLORS.length];
    const newServer: ServerNode = { id: newId, label: `S${servers.length + 1}`, color: newColor, angle: newAngle };
    const oldKeys = assignKeys(RAW_KEYS, servers);
    const newServers = [...servers, newServer];
    const newKeys = assignKeys(RAW_KEYS, newServers);
    const moved = new Set<string>();
    oldKeys.forEach((k) => {
      const nk = newKeys.find((x) => x.id === k.id);
      if (nk && nk.serverId !== k.serverId) moved.add(k.id);
    });
    setServers(newServers);
    setServerCount((c) => c + 1);
    setMovedKeyIds(moved);
    setTimeout(() => setMovedKeyIds(new Set()), 2500);
  }, [servers, serverCount]);

  const removeServer = useCallback(() => {
    if (servers.length <= 1) return;
    const oldKeys = assignKeys(RAW_KEYS, servers);
    const removed = servers[servers.length - 1];
    const newServers = servers.slice(0, -1);
    const newKeys = assignKeys(RAW_KEYS, newServers);
    const moved = new Set<string>();
    oldKeys.forEach((k) => {
      if (k.serverId === removed.id) moved.add(k.id);
      else {
        const nk = newKeys.find((x) => x.id === k.id);
        if (nk && nk.serverId !== k.serverId) moved.add(k.id);
      }
    });
    setServers(newServers);
    setMovedKeyIds(moved);
    setTimeout(() => setMovedKeyIds(new Set()), 2500);
  }, [servers]);

  const reset = useCallback(() => {
    setServers(INITIAL_SERVERS);
    setServerCount(3);
    setMovedKeyIds(new Set());
  }, []);

  const movedPct = Math.round((movedKeyIds.size / KEY_COUNT) * 100);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] bg-bg-tertiary/40 px-4 py-3">
        <button onClick={addServer} disabled={servers.length >= 5} className="btn-neon gap-1 px-3 py-1.5 text-xs disabled:opacity-40">
          <Plus size={13} /> Add Server
        </button>
        <button onClick={removeServer} disabled={servers.length <= 1} className="btn-ghost gap-1 px-3 py-1.5 text-xs disabled:opacity-40">
          <Minus size={13} /> Remove Server
        </button>
        <button
          onClick={() => setVirtualNodes((v) => !v)}
          className={cn(
            "rounded-lg border px-3 py-1.5 mono text-xs transition",
            virtualNodes
              ? "border-neon-purple/60 bg-neon-purple/10 text-neon-purple"
              : "border-[var(--border-subtle)] text-ink-secondary"
          )}
        >
          {virtualNodes ? "✦ Virtual Nodes: ON" : "○ Virtual Nodes: OFF"}
        </button>
        <button onClick={reset} className="btn-ghost px-3 py-1.5 text-xs">
          <RotateCcw size={12} /> Reset
        </button>

        <AnimatePresence>
          {movedKeyIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="ml-auto mono text-xs text-neon-yellow"
            >
              ⚡ {movedKeyIds.size}/{KEY_COUNT} keys moved ({movedPct}%)
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-6 p-4 sm:flex-row sm:items-start">
        {/* SVG Ring */}
        <svg
          viewBox="0 0 320 320"
          width={320}
          height={320}
          className="shrink-0"
          aria-label="Consistent hash ring"
        >
          {/* Background ring */}
          <circle
            cx={CX}
            cy={CY}
            r={RING_R}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth={2}
          />

          {/* Server arc segments */}
          {servers.map((srv) => {
            const sortedServers = [...servers].sort((a, b) => a.angle - b.angle);
            const sortedIdx = sortedServers.findIndex((s) => s.id === srv.id);
            const nextSorted = sortedServers[(sortedIdx + 1) % sortedServers.length];
            let arcEnd = nextSorted.angle;
            if (arcEnd <= srv.angle) arcEnd += 360;
            const span = arcEnd - srv.angle;
            const startP = polar(CX, CY, RING_R, srv.angle);
            const endP = polar(CX, CY, RING_R, srv.angle + span - 1);
            const largeArc = span > 180 ? 1 : 0;
            return (
              <path
                key={srv.id}
                d={`M ${startP.x} ${startP.y} A ${RING_R} ${RING_R} 0 ${largeArc} 1 ${endP.x} ${endP.y}`}
                fill="none"
                stroke={srv.color}
                strokeWidth={4}
                strokeOpacity={0.5}
              />
            );
          })}

          {/* Virtual node markers */}
          {virtualNodes &&
            servers.flatMap((srv) =>
              getVirtualAngles(srv, 3).slice(1).map((va, vi) => {
                const p = polar(CX, CY, VIRTUAL_R, va);
                return (
                  <motion.circle
                    key={`${srv.id}-v${vi}`}
                    cx={p.x}
                    cy={p.y}
                    r={5}
                    fill={srv.color}
                    fillOpacity={0.4}
                    stroke={srv.color}
                    strokeWidth={1}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                );
              })
            )}

          {/* Data keys on ring */}
          {keys.map((key) => {
            const p = polar(CX, CY, KEY_R, key.angle);
            const srv = servers.find((s) => s.id === key.serverId);
            const isMoved = movedKeyIds.has(key.id);
            return (
              <motion.g key={key.id} animate={isMoved ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.5 }}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={7}
                  fill={srv?.color ?? "var(--neon-blue)"}
                  fillOpacity={isMoved ? 0.9 : 0.5}
                  stroke={isMoved ? "var(--neon-yellow)" : (srv?.color ?? "var(--neon-blue)")}
                  strokeWidth={isMoved ? 2.5 : 1}
                >
                  {isMoved && (
                    <animate attributeName="stroke-opacity" values="1;0.2;1" dur="0.6s" repeatCount="3" />
                  )}
                </circle>
              </motion.g>
            );
          })}

          {/* Server nodes */}
          {servers.map((srv) => {
            const p = polar(CX, CY, SERVER_R, srv.angle);
            return (
              <motion.g
                key={srv.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={16}
                  fill="var(--bg-tertiary)"
                  stroke={srv.color}
                  strokeWidth={2.5}
                  style={{ filter: `drop-shadow(0 0 6px ${srv.color})` }}
                />
                <text
                  x={p.x}
                  y={p.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={9}
                  fill={srv.color}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {srv.label}
                </text>
              </motion.g>
            );
          })}

          {/* Center label */}
          <text x={CX} y={CY - 8} textAnchor="middle" fontSize={11} fill="var(--text-secondary)" fontFamily="monospace">
            Hash Ring
          </text>
          <text x={CX} y={CY + 8} textAnchor="middle" fontSize={9} fill="var(--text-secondary)" fontFamily="monospace">
            {servers.length} servers · {KEY_COUNT} keys
          </text>
        </svg>

        {/* Legend + stats */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="mono mb-2 text-[0.6rem] uppercase tracking-widest text-ink-muted">Server ownership</div>
            {servers.map((srv) => {
              const ownedKeys = keys.filter((k) => k.serverId === srv.id);
              const pct = Math.round((ownedKeys.length / KEY_COUNT) * 100);
              return (
                <div key={srv.id} className="mb-2">
                  <div className="mb-1 flex justify-between text-xs">
                    <span style={{ color: srv.color }} className="font-mono font-bold">{srv.label}</span>
                    <span className="text-ink-muted">{ownedKeys.length} keys ({pct}%)</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: srv.color }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl bg-bg-tertiary/60 p-3 text-xs text-ink-secondary space-y-1">
            <div className="mono text-[0.6rem] uppercase tracking-widest text-neon-blue mb-2">Legend</div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-neon-blue/60" />
              Colored circles = data keys (owned by matching server)
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-neon-yellow/90 ring-2 ring-neon-yellow" />
              Yellow ring = key just moved to new server
            </div>
            {virtualNodes && (
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-neon-purple/40 ring-1 ring-neon-purple" />
                Faint circles = virtual node positions
              </div>
            )}
          </div>

          <div className="rounded-xl border border-neon-green/30 bg-neon-green/5 p-3 text-xs">
            <div className="font-mono font-bold text-neon-green mb-1">Consistent Hashing win</div>
            <div className="text-ink-secondary">
              Adding/removing a server only moves <strong className="text-white">~1/N of keys</strong>.
              With 3 servers: only ~33% max. Compare to modulo: nearly 100%.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modulo vs Consistent Comparison Demo ─────────────────────────────────────
function ModuloVsConsistent() {
  const [serversBefore, setServersBefore] = useState(3);
  const [serversAfter, setServersAfter] = useState(4);
  const KEYS = 20;

  const moduloKeys = Array.from({ length: KEYS }, (_, i) => ({
    id: i,
    before: i % serversBefore,
    after: i % serversAfter,
  }));
  const consistentMovePct = Math.round((1 / serversAfter) * 100);
  const moduloMovePct = moduloKeys.filter((k) => k.before !== k.after).length;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Modulo hashing */}
      <div className="card p-4">
        <div className="mono mb-3 text-[0.65rem] uppercase tracking-widest text-neon-red">
          ☠ Modulo Hashing (key % N)
        </div>
        <div className="grid grid-cols-10 gap-1 mb-3">
          {moduloKeys.map((k) => {
            const moved = k.before !== k.after;
            return (
              <motion.div
                key={k.id}
                className="h-5 w-5 rounded text-center font-mono text-[8px] leading-5"
                animate={{
                  background: moved ? "rgba(255,51,102,0.7)" : "rgba(0,212,255,0.25)",
                  borderColor: moved ? "var(--neon-red)" : "var(--neon-blue)",
                }}
                style={{ border: "1px solid" }}
                title={`key${k.id}: S${k.before}→S${k.after}`}
              >
                {k.id}
              </motion.div>
            );
          })}
        </div>
        <div className="mono text-xs text-neon-red font-bold">
          🔥 {moduloMovePct}/{KEYS} keys moved ({Math.round((moduloMovePct / KEYS) * 100)}%)
        </div>
        <p className="mt-1 text-[0.7rem] text-ink-muted">
          Nearly every key reassigns. Your cache goes cold. 💀
        </p>
      </div>

      {/* Consistent hashing */}
      <div className="card p-4">
        <div className="mono mb-3 text-[0.65rem] uppercase tracking-widest text-neon-green">
          ✓ Consistent Hashing (ring)
        </div>
        <div className="grid grid-cols-10 gap-1 mb-3">
          {moduloKeys.map((k, i) => {
            // Only keys in the arc between old last server and new server move
            const moved = i < Math.floor(KEYS / serversAfter);
            return (
              <motion.div
                key={k.id}
                className="h-5 w-5 rounded text-center font-mono text-[8px] leading-5"
                animate={{
                  background: moved ? "rgba(255,211,0,0.5)" : "rgba(0,255,136,0.25)",
                  borderColor: moved ? "var(--neon-yellow)" : "var(--neon-green)",
                }}
                style={{ border: "1px solid" }}
              >
                {k.id}
              </motion.div>
            );
          })}
        </div>
        <div className="mono text-xs text-neon-green font-bold">
          ✨ ~{consistentMovePct}% keys moved (only the new server&apos;s arc)
        </div>
        <p className="mt-1 text-[0.7rem] text-ink-muted">
          Most cache stays warm. Minimal disruption. 🏆
        </p>
      </div>

      {/* Controls */}
      <div className="sm:col-span-2 flex flex-wrap gap-4 items-center rounded-xl bg-bg-tertiary/50 p-3">
        <label className="flex items-center gap-2 text-xs text-ink-secondary">
          Servers before:
          <input
            type="range" min={2} max={5} value={serversBefore}
            onChange={(e) => setServersBefore(Number(e.target.value))}
            className="w-24"
          />
          <span className="mono text-white">{serversBefore}</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-ink-secondary">
          Servers after:
          <input
            type="range" min={2} max={8} value={serversAfter}
            onChange={(e) => setServersAfter(Number(e.target.value))}
            className="w-24"
          />
          <span className="mono text-white">{serversAfter}</span>
        </label>
        <div className="ml-auto mono text-xs text-neon-yellow">
          Keys moved: <span className="text-neon-red font-bold">{Math.round((moduloMovePct / KEYS) * 100)}% (modulo)</span>
          {" "}vs{" "}
          <span className="text-neon-green font-bold">~{consistentMovePct}% (consistent)</span>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConsistentHashingPage() {
  return (
    <ConceptPage
      slug="consistent-hashing"
      analogy={
        <FunnyAnalogy
          emoji="💍"
          color="var(--neon-blue)"
          alternates={[
            {
              emoji: "🎡",
              text: "A Ferris wheel with seats (servers). Each passenger (data key) sits in the next available seat clockwise. Add a new seat — only a few passengers shift.",
            },
            {
              emoji: "🕰️",
              text: "Clock face with labels at 3, 6, 9, 12. Add a label at 4 — only the slice from 3→4 moves. Not the whole clock.",
            },
          ]}
        >
          Imagine a circular dial with your servers placed around it. Every data key hashes to a point on
          that dial, and travels <strong className="text-neon-blue">clockwise</strong> until it hits a server.
          Add a new server? Only the keys between it and its predecessor move.
          Instead of reshuffling <strong className="text-neon-red">78% of keys</strong>,
          you move about <strong className="text-neon-green">12%</strong>. Your cache doesn&apos;t cry.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The Art Piece" title="Live Hash Ring Visualization">
          <p className="mb-4 text-ink-secondary">
            Each colored circle on the ring is a <strong className="text-white">data key</strong>.
            It belongs to the server whose arc it falls within (clockwise routing).
            Hit <strong className="text-neon-blue">Add Server</strong> — watch only the affected keys
            flash yellow and migrate. Toggle <strong className="text-neon-purple">Virtual Nodes</strong> to
            see each server claim multiple ring positions for better balance.
          </p>
          <HashRing />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The chaos comparison" title="Modulo Hashing vs Consistent Hashing">
          <p className="mb-4 text-ink-secondary">
            Red squares = keys that moved when a server was added.
            Drag the sliders and watch modulo hashing nuke your cache while consistent hashing stays chill.
          </p>
          <ModuloVsConsistent />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The magic trick" title="Virtual Nodes — balancing the ring">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                emoji: "⚠️",
                title: "Problem: uneven load",
                color: "var(--neon-red)",
                body: "With only 3 real nodes on a ring, one server might happen to own a huge arc (40% of keys) while another owns 10%. Not very equal.",
              },
              {
                emoji: "✦",
                title: "Solution: virtual nodes",
                color: "var(--neon-purple)",
                body: "Each physical server gets 100–200 virtual node positions spread around the ring. The key routes to the virtual node, which maps back to the physical server.",
              },
              {
                emoji: "⚖️",
                title: "Result: smooth distribution",
                color: "var(--neon-green)",
                body: "Law of large numbers kicks in. Each server ends up with ~1/N of keys. More powerful servers can simply have more virtual nodes for weighted distribution.",
              },
            ].map((card) => (
              <div key={card.title} className="card p-4" style={{ borderColor: `${card.color}40` }}>
                <div className="text-2xl mb-2">{card.emoji}</div>
                <div className="font-display font-semibold mb-1" style={{ color: card.color }}>{card.title}</div>
                <p className="text-sm text-ink-secondary">{card.body}</p>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Head to head" title="Consistent vs Modulo: the score">
          <ComparisonBattle
            left={{
              name: "Modulo Hashing",
              emoji: "💣",
              color: "var(--neon-red)",
              bestFor: "Toy projects with a fixed server count that never changes. If you're okay with a cache apocalypse on every resize.",
            }}
            right={{
              name: "Consistent Hashing",
              emoji: "💍",
              color: "var(--neon-green)",
              bestFor: "Any distributed cache, DHT, or database cluster where nodes come and go. Memcached, Redis Cluster, Cassandra, DynamoDB all use it.",
            }}
            features={[
              { label: "Keys moved on resize", a: "~78%", b: "~12%", winner: "b" },
              { label: "Implementation simplicity", a: 9, b: 5, max: 10, winner: "a" },
              { label: "Cache hit preservation", a: 2, b: 9, max: 10, winner: "b" },
              { label: "Load balancing", a: "Even", b: "Even+", winner: "b" },
              { label: "Hot shard risk", a: "Low", b: "Low w/vnodes", winner: "tie" },
              { label: "Supports weighted servers", a: "No", b: "Yes (vnodes)", winner: "b" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Real-world sightings" title="Who uses this in production">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { name: "Amazon DynamoDB", detail: "Uses consistent hashing to distribute data across partitions. Adding capacity is gradual, not catastrophic.", emoji: "🛒" },
              { name: "Apache Cassandra", detail: "The entire data model is a ring. Each node owns a token range. Virtual nodes (vnodes) are enabled by default.", emoji: "☁️" },
              { name: "Memcached clients", detail: "libketama — the original consistent hashing implementation. Every cache client library has this built in.", emoji: "⚡" },
              { name: "Discord / Riak", detail: "Any serious distributed key-value store. If your system has more data than one machine, consistent hashing is how you split it without crying.", emoji: "💬" },
            ].map((item) => (
              <div key={item.name} className="card p-4 flex gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <div className="font-display font-semibold text-white">{item.name}</div>
                  <p className="mt-1 text-sm text-ink-secondary">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="consistent-hashing"
          questions={[
            {
              question: "In consistent hashing, when you add a new server, which keys need to move?",
              options: [
                "All keys are rehashed and reassigned",
                "Only keys in the arc between the new server and its predecessor",
                "No keys move — the new server starts empty",
                "Keys are randomly redistributed across all servers",
              ],
              correct: 1,
              explain: "Only the arc immediately before (counter-clockwise of) the new server node needs to redistribute. Everything else stays put. This is the whole point.",
            },
            {
              question: "What problem do virtual nodes (vnodes) solve in consistent hashing?",
              options: [
                "Reducing network latency between servers",
                "Enabling encryption of ring positions",
                "Ensuring even distribution when physical nodes happen to cluster together",
                "Handling node authentication",
              ],
              correct: 2,
              explain: "With only a few physical nodes, random placement on the ring can create big arcs (hot servers) and tiny arcs (underloaded servers). Vnodes spread each server across many positions for statistical balance.",
            },
            {
              question: "Modulo hashing (key % N) has a fatal flaw. What is it?",
              options: [
                "It's too slow to compute",
                "Adding or removing a server changes almost all key mappings",
                "It doesn't work with string keys",
                "It requires synchronous replication",
              ],
              correct: 1,
              explain: "key % 3 vs key % 4 gives completely different results for most keys. So every node addition/removal invalidates the majority of cache entries.",
            },
            {
              question: "A data key on the hash ring routes to which server?",
              options: [
                "The server with the closest hash value regardless of direction",
                "The first server encountered going clockwise from the key's position",
                "A random server from the ring",
                "The server with the lightest load",
              ],
              correct: 1,
              explain: "Clockwise routing is the convention. The key lands on the ring at its hash point and travels clockwise until it hits a server node. That server owns the key.",
            },
            {
              question: "Which real database uses consistent hashing with virtual nodes as a core design principle?",
              options: [
                "PostgreSQL",
                "MySQL with replication",
                "Apache Cassandra",
                "SQLite",
              ],
              correct: 2,
              explain: "Cassandra was designed around consistent hashing from day one. Every node owns token ranges on the ring, and vnodes (enabled by default since Cassandra 1.2) ensure even distribution.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
