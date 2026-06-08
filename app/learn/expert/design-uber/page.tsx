"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, Navigation, Clock, Zap } from "lucide-react";
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
  const ridesPerDay = users * 2;
  const writeQPS = Math.round(ridesPerDay * 1000 / 86400); // 1000 location updates per ride
  const readQPS = writeQPS * 5;
  const activeDrivers = Math.round(users * 0.1);
  const locationUpdateQPS = activeDrivers * 4; // update every 5s
  const storageTBperDay = (locationUpdateQPS * 86400 * 0.05) / (1024 * 1024 * 1024);
  const bwGBperDay = Math.round((locationUpdateQPS * 86400 * 0.05 * 2) / (1024 * 1024));

  const rows = [
    { label: "Daily Active Riders (M)", value: `${users}M`, color: "var(--neon-blue)" },
    { label: "Rides / day", value: `${(ridesPerDay / 1e6).toFixed(0)}M`, color: "var(--neon-blue)" },
    { label: "Active Drivers (10% of riders)", value: `${activeDrivers}M`, color: "var(--neon-yellow)" },
    { label: "Location updates QPS", value: `${(locationUpdateQPS / 1000).toFixed(0)}K`, color: "var(--neon-green)" },
    { label: "Read QPS (search area)", value: `${(readQPS / 1000).toFixed(0)}K`, color: "var(--neon-green)" },
    { label: "Storage / day (locations)", value: `${storageTBperDay.toFixed(2)} TB`, color: "var(--neon-purple)" },
    { label: "Bandwidth / day", value: `${bwGBperDay} GB`, color: "var(--neon-red)" },
    { label: "Avg ETA accuracy target", value: "< 2 min error", color: "var(--neon-orange)" },
  ];

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="mono text-xs text-neon-blue uppercase tracking-widest">Daily Active Riders (M)</span>
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

// ── Interactive map with rider & driver dots ──────────────────
type Dot = { id: number; x: number; y: number; type: "rider" | "driver"; matched?: boolean };

function InteractiveMap() {
  const [dots, setDots] = useState<Dot[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<{ rider: Dot; driver: Dot }[]>([]);
  const [etaMs, setEtaMs] = useState<number | null>(null);
  const nextId = useRef(0);

  const initDots = useCallback(() => {
    const initial: Dot[] = [];
    for (let i = 0; i < 4; i++) {
      initial.push({ id: nextId.current++, x: 10 + Math.random() * 80, y: 10 + Math.random() * 80, type: "driver" });
    }
    for (let i = 0; i < 3; i++) {
      initial.push({ id: nextId.current++, x: 10 + Math.random() * 80, y: 10 + Math.random() * 80, type: "rider" });
    }
    setDots(initial);
    setMatchedPairs([]);
    setEtaMs(null);
  }, []);

  useEffect(() => { initDots(); }, [initDots]);

  const match = () => {
    const riders = dots.filter((d) => d.type === "rider" && !d.matched);
    const drivers = dots.filter((d) => d.type === "driver" && !d.matched);
    if (riders.length === 0 || drivers.length === 0) return;

    const pairs: { rider: Dot; driver: Dot }[] = [];
    const usedDrivers = new Set<number>();

    riders.forEach((r) => {
      let bestDriver: Dot | undefined;
      let minDist = Infinity;
      for (const d of drivers) {
        if (usedDrivers.has(d.id)) continue;
        const dist = Math.hypot(r.x - d.x, r.y - d.y);
        if (dist < minDist) { minDist = dist; bestDriver = d; }
      }
      if (bestDriver) {
        usedDrivers.add(bestDriver.id);
        pairs.push({ rider: r, driver: bestDriver });
      }
    });

    setMatchedPairs(pairs);
    const avgDist = pairs.reduce((acc, p) => acc + Math.hypot(p.rider.x - p.driver.x, p.rider.y - p.driver.y), 0) / pairs.length;
    setEtaMs(Math.round(avgDist * 0.5)); // fake ETA formula
    setDots((prev) => prev.map((d) => {
      const inPair = pairs.find((p) => p.rider.id === d.id || p.driver.id === d.id);
      return inPair ? { ...d, matched: true } : d;
    }));
  };

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold text-white">Matching Algorithm</span>
        <div className="flex gap-2 text-xs">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-neon-blue" />Rider</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-neon-green" />Driver</span>
        </div>
      </div>

      {/* Map canvas */}
      <div className="relative w-full rounded-xl overflow-hidden border border-[var(--border-subtle)]" style={{ height: 240, background: "linear-gradient(135deg, #12121a 0%, #1a1a2e 100%)" }}>
        {/* Grid lines */}
        {[25, 50, 75].map((p) => (
          <div key={p}>
            <div className="absolute inset-y-0" style={{ left: `${p}%`, borderLeft: "1px solid rgba(255,255,255,0.04)" }} />
            <div className="absolute inset-x-0" style={{ top: `${p}%`, borderTop: "1px solid rgba(255,255,255,0.04)" }} />
          </div>
        ))}

        {/* Match lines */}
        <svg className="absolute inset-0 w-full h-full">
          {matchedPairs.map((pair, i) => {
            const rx = (pair.rider.x / 100) * 100;
            const ry = (pair.rider.y / 100) * 100;
            const dx = (pair.driver.x / 100) * 100;
            const dy = (pair.driver.y / 100) * 100;
            return (
              <motion.line
                key={i}
                x1={`${rx}%`} y1={`${ry}%`}
                x2={`${dx}%`} y2={`${dy}%`}
                stroke="var(--neon-yellow)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            );
          })}
        </svg>

        {/* Dots */}
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            className="absolute"
            style={{ left: `${dot.x}%`, top: `${dot.y}%`, transform: "translate(-50%, -50%)" }}
            animate={dot.matched ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div
              className="h-4 w-4 rounded-full border-2 flex items-center justify-center text-[8px]"
              style={{
                background: dot.type === "rider" ? "var(--neon-blue)" : "var(--neon-green)",
                borderColor: dot.matched ? "var(--neon-yellow)" : "transparent",
                boxShadow: dot.matched ? "0 0 12px var(--neon-yellow)" : undefined,
              }}
            >
              {dot.type === "rider" ? "👤" : "🚗"}
            </div>
          </motion.div>
        ))}

        {/* ETA badge */}
        <AnimatePresence>
          {etaMs !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-2 right-2 rounded-xl border border-neon-yellow/40 bg-neon-yellow/15 px-3 py-1.5"
            >
              <div className="mono text-[0.6rem] text-neon-yellow uppercase">Avg ETA</div>
              <div className="font-display text-lg font-bold text-neon-yellow">{etaMs} min</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        <button onClick={match} className="btn-neon text-xs flex-1 justify-center">
          ⚡ Run Matching (nearest driver)
        </button>
        <button onClick={initDots} className="btn-ghost text-xs">Reset</button>
      </div>
    </div>
  );
}

// ── QuadTree visualization ────────────────────────────────────
type Cell = { x: number; y: number; w: number; h: number; depth: number; drivers: number };

function QuadTreeViz() {
  const [cells, setCells] = useState<Cell[]>([{ x: 0, y: 0, w: 100, h: 100, depth: 0, drivers: 12 }]);
  const [selected, setSelected] = useState<Cell | null>(null);

  const subdivide = (cell: Cell) => {
    if (cell.depth >= 3) return;
    const hw = cell.w / 2;
    const hh = cell.h / 2;
    const baseDrivers = Math.max(1, Math.floor(cell.drivers / 4));
    const newCells: Cell[] = [
      { x: cell.x, y: cell.y, w: hw, h: hh, depth: cell.depth + 1, drivers: baseDrivers + Math.floor(Math.random() * 3) },
      { x: cell.x + hw, y: cell.y, w: hw, h: hh, depth: cell.depth + 1, drivers: baseDrivers + Math.floor(Math.random() * 3) },
      { x: cell.x, y: cell.y + hh, w: hw, h: hh, depth: cell.depth + 1, drivers: baseDrivers + Math.floor(Math.random() * 3) },
      { x: cell.x + hw, y: cell.y + hh, w: hw, h: hh, depth: cell.depth + 1, drivers: baseDrivers + Math.floor(Math.random() * 3) },
    ];
    setCells((prev) => prev.filter((c) => c !== cell).concat(newCells));
    setSelected(null);
  };

  const reset = () => {
    setCells([{ x: 0, y: 0, w: 100, h: 100, depth: 0, drivers: 12 }]);
    setSelected(null);
  };

  const DEPTH_COLORS = ["var(--neon-blue)", "var(--neon-green)", "var(--neon-yellow)", "var(--neon-red)"];

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold text-white">QuadTree Geospatial Index</span>
        <button onClick={reset} className="btn-ghost text-xs">Reset</button>
      </div>

      <p className="text-xs text-ink-secondary">Click a cell to subdivide it (like Uber zooming into a dense area). Max 3 levels deep.</p>

      <div className="relative w-full rounded-xl border border-[var(--border-subtle)] overflow-hidden" style={{ height: 220, background: "#0a0a0f" }}>
        {cells.map((cell, i) => {
          const color = DEPTH_COLORS[cell.depth];
          const isSelected = selected === cell;
          return (
            <motion.div
              key={`${cell.x}-${cell.y}-${cell.w}-${cell.depth}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute cursor-pointer"
              style={{
                left: `${cell.x}%`, top: `${cell.y}%`,
                width: `${cell.w}%`, height: `${cell.h}%`,
                border: `1px solid ${color}${isSelected ? "ff" : "44"}`,
                background: isSelected ? `${color}20` : `${color}08`,
              }}
              onClick={() => setSelected(isSelected ? null : cell)}
            >
              <div className="absolute top-1 left-1 flex flex-col">
                <span className="mono text-[8px]" style={{ color }}>{cell.drivers}🚗</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-bg-tertiary/60 p-3 space-y-2">
              <div className="text-sm text-white font-semibold">Cell: depth {selected.depth}, {selected.drivers} drivers</div>
              <div className="text-xs text-ink-secondary">
                {selected.depth < 3
                  ? `This cell covers a large area. Uber subdivides dense cells to narrow the search radius.`
                  : `Maximum depth reached. This cell is a leaf node — search within it for the nearest driver.`}
              </div>
              {selected.depth < 3 && (
                <button onClick={() => subdivide(selected)} className="btn-neon text-xs">
                  Subdivide this cell →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-xs text-ink-secondary rounded-lg bg-bg-tertiary/50 p-3">
        <strong className="text-white">How it works:</strong> The map is recursively divided into quadrants. Cells with many drivers subdivide further. To find the nearest driver, start from the rider&apos;s cell, search leaf cells within radius, expand outward if too few drivers found. O(log N) vs O(N) for naive search.
      </div>
    </div>
  );
}

// ── Surge pricing heat map ────────────────────────────────────
function SurgePricingMap() {
  const [demand, setDemand] = useState(50);

  const ZONES = [
    { label: "Downtown", x: 30, y: 35, baseDemand: 80 },
    { label: "Airport", x: 70, y: 20, baseDemand: 60 },
    { label: "Stadium", x: 55, y: 65, baseDemand: 40 },
    { label: "Suburbs", x: 15, y: 60, baseDemand: 20 },
    { label: "Mall", x: 80, y: 70, baseDemand: 50 },
  ];

  const getSurge = (baseDemand: number) => {
    const effective = Math.min(100, baseDemand * (demand / 50));
    if (effective < 40) return { mult: 1.0, color: "var(--neon-green)", label: "Normal" };
    if (effective < 65) return { mult: 1.5, color: "var(--neon-yellow)", label: "1.5x" };
    if (effective < 80) return { mult: 2.0, color: "var(--neon-orange)", label: "2.0x" };
    return { mult: 2.5, color: "var(--neon-red)", label: "2.5x 🔥" };
  };

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold text-white">Surge Pricing Heat Map</span>
        <div className="flex items-center gap-2 text-xs text-ink-secondary">
          <Zap size={12} className="text-neon-yellow" /> Demand multiplier
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="mono text-xs text-neon-yellow">Low demand</span>
        <input type="range" min={10} max={100} value={demand} onChange={(e) => setDemand(Number(e.target.value))} className="flex-1 accent-yellow-400" />
        <span className="mono text-xs text-neon-red">Rush hour 🚦</span>
      </div>

      <div className="relative w-full rounded-xl border border-[var(--border-subtle)] overflow-hidden" style={{ height: 220, background: "#0d0d1a" }}>
        {/* streets */}
        {[25, 50, 75].map((p) => (
          <div key={p}>
            <div className="absolute inset-y-0" style={{ left: `${p}%`, borderLeft: "1px solid rgba(255,255,255,0.06)" }} />
            <div className="absolute inset-x-0" style={{ top: `${p}%`, borderTop: "1px solid rgba(255,255,255,0.06)" }} />
          </div>
        ))}

        {ZONES.map((zone) => {
          const surge = getSurge(zone.baseDemand);
          const radius = 18 + (surge.mult - 1) * 20;
          return (
            <div key={zone.label} className="absolute" style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: "translate(-50%, -50%)" }}>
              <motion.div
                animate={{ width: radius * 2, height: radius * 2, opacity: 0.3 + surge.mult * 0.15 }}
                transition={{ duration: 0.5 }}
                className="rounded-full absolute"
                style={{
                  background: surge.color,
                  left: -radius, top: -radius,
                  filter: "blur(12px)",
                }}
              />
              <div className="relative z-10 flex flex-col items-center">
                <div className="mono text-[0.6rem] text-white/80">{zone.label}</div>
                <motion.div
                  animate={{ color: surge.color }}
                  className="mono text-xs font-bold"
                >
                  {surge.label}
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-ink-secondary rounded-lg bg-bg-tertiary/50 p-3">
        <strong className="text-white">Surge algorithm:</strong> Supply/demand ratio per geospatial cell, updated every 5 minutes. Surge = demand / supply (capped). Notified via app with an accept screen. Automatically decreases as more drivers enter the zone.
      </div>
    </div>
  );
}

// ── Deep dive components ──────────────────────────────────────
const COMPONENTS = [
  {
    icon: <MapPin size={18} />, title: "Location Service", color: "var(--neon-green)",
    content: "Drivers broadcast GPS coordinates every 5 seconds via HTTP or WebSocket. The Location Service writes to Redis geospatial index (GEOADD) and to Cassandra for historical data. Redis GEORADIUS queries find all drivers within N km in O(N+log M) time. Location data is ephemeral — cached in Redis for active drivers.",
  },
  {
    icon: <Navigation size={18} />, title: "Matching Service", color: "var(--neon-blue)",
    content: "When a rider requests a ride: 1) QuadTree lookup finds candidate drivers within 2km. 2) Filter by availability, car type, rating. 3) Sort by ETA (distance ÷ estimated speed). 4) Send offer to top driver (15s to accept). 5) If rejected, offer to next driver. Typical match time: < 30 seconds.",
  },
  {
    icon: <Clock size={18} />, title: "ETA Service", color: "var(--neon-yellow)",
    content: "Combines real-time traffic data (Google Maps / HERE API), historical trip data by time-of-day and route, and ML models trained on millions of completed trips. ETA is recalculated every 30 seconds during the ride. Error target: within 2 minutes for 95% of trips.",
  },
  {
    icon: <Zap size={18} />, title: "Surge Pricing", color: "var(--neon-red)",
    content: "Computes supply (available drivers) ÷ demand (ride requests) per geospatial cell every 5 minutes. If ratio < threshold, apply surge multiplier. Surge notified to riders before booking. Drivers are incentivized to move to surge zones. Algorithm is proprietary but similar to a simple price elasticity model.",
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
    problem: "Location updates overwhelm DB — 1M drivers × every 5s = 200K writes/sec to Cassandra.",
    solution: "Write to Redis geospatial index first (in-memory, fast). Cassandra gets batched writes every 30s for historical data. Active driver locations only live in Redis (TTL = 60s). If Redis fails, drivers re-register. Cassandra is the audit log, not the live index.",
    color: "var(--neon-red)",
  },
  {
    problem: "Rider requests a ride but no drivers are nearby — matching fails silently.",
    solution: "Expand search radius incrementally (1km → 2km → 5km) with a timeout per step. Show the rider live feedback ('looking for drivers…'). After 60s without match, show surge zone map and suggest nearby pickup point. Log all failed matches for demand modeling.",
    color: "var(--neon-yellow)",
  },
  {
    problem: "Two matching services both offer the same driver to two riders simultaneously.",
    solution: "Optimistic locking: when the match service selects a driver, it writes a lock (driver_id, ride_id) to Redis with a 15-second TTL using SET NX (atomic). First writer wins. Loser retries with the next candidate. The driver&apos;s status is also updated in the DB with a CAS operation.",
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
  const [mode, setMode] = useState<"quadtree" | "geohash">("quadtree");
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => setMode("quadtree")}
          className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition", mode === "quadtree" ? "bg-neon-green/20 text-neon-green border border-neon-green/40" : "text-ink-secondary")}
        >
          QuadTree Index
        </button>
        <span className="text-ink-muted text-sm">vs</span>
        <button
          onClick={() => setMode("geohash")}
          className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition", mode === "geohash" ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/40" : "text-ink-secondary")}
        >
          Geohash (Redis)
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
          {mode === "quadtree" ? (
            <>
              <p>✅ <strong className="text-white">Adaptive density</strong> — cells subdivide where drivers cluster (cities), stay large in rural areas.</p>
              <p>✅ <strong className="text-white">Efficient range queries</strong> — search a cell and its neighbors only. O(log N) per query.</p>
              <p>⚠️ <strong className="text-white">In-memory only</strong> — QuadTree must live in RAM. Reconstruct on restart from DB.</p>
              <p>⚠️ <strong className="text-white">Rebalancing is complex</strong> — need to redistribute cells as driver density changes over the day.</p>
              <p className="text-neon-green">Uber&apos;s actual geospatial matching uses a variant of this with H3 hexagonal indexing.</p>
            </>
          ) : (
            <>
              <p>✅ <strong className="text-white">Simple to implement</strong> — Redis GEOADD / GEORADIUS built-in. String prefix = geographic proximity.</p>
              <p>✅ <strong className="text-white">Persistent &amp; distributed</strong> — Redis cluster handles updates naturally. Survives restarts.</p>
              <p>⚠️ <strong className="text-white">Edge cases at cell boundaries</strong> — a nearby driver in adjacent geohash bucket might be missed.</p>
              <p>⚠️ <strong className="text-white">Fixed precision</strong> — geohash precision is uniform, not adaptive to density.</p>
              <p className="text-neon-blue">Redis GEORADIUS is the fastest path to a working prototype. Production systems combine both approaches.</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Summary decisions ─────────────────────────────────────────
const KEY_DECISIONS = [
  { label: "Location store (live)", value: "Redis GEOADD with 60s TTL per driver", color: "var(--neon-green)" },
  { label: "Location store (historical)", value: "Cassandra, batched writes every 30s", color: "var(--neon-blue)" },
  { label: "Geospatial index", value: "QuadTree in-memory + Redis GEORADIUS for queries", color: "var(--neon-yellow)" },
  { label: "Matching", value: "Nearest-driver with optimistic locking (Redis SET NX)", color: "var(--neon-purple)" },
  { label: "ETA", value: "ML model + real-time traffic, recalculated every 30s during ride", color: "var(--neon-orange)" },
  { label: "Surge pricing", value: "Supply/demand ratio per cell, updated every 5 minutes", color: "var(--neon-red)" },
];

export default function DesignUberPage() {
  return (
    <ConceptPage
      slug="design-uber"
      analogy={
        <FunnyAnalogy
          emoji="🚗"
          color="var(--neon-green)"
          alternates={[
            { emoji: "📡", text: "Every driver is a GPS beacon pinging their location every 5 seconds. Uber&apos;s backend is just a very sophisticated beacon aggregator with a price tag." },
            { emoji: "🎯", text: "Finding the nearest driver is like finding the nearest pizza shop on Yelp — except the shops are all moving, and you need the answer in under 100ms." },
          ]}
        >
          Uber is a <strong className="text-neon-green">real-time geospatial matchmaker</strong>.
          The hard part isn&apos;t the app — it&apos;s efficiently finding which of 1 million moving cars is closest
          to you, matching you atomically (no double-booking), and pricing it all in under a second.
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
                  "Rider requests a ride from current location",
                  "Match rider to nearest available driver",
                  "Real-time location tracking (rider + driver)",
                  "ETA calculation and updates",
                  "Dynamic surge pricing by area",
                  "Trip history, receipts, ratings",
                  "Driver goes online/offline",
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
                  "100M+ DAU, 15M rides/day",
                  "Match latency < 5 seconds (ideally < 1s)",
                  "Location update frequency: every 5 seconds",
                  "No double-booking (atomic matching)",
                  "Highly available — no lost ride requests",
                  "ETA accuracy: ±2 minutes for 95% of trips",
                  "Global, multi-region, low-latency",
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
          <p className="mb-3 text-sm text-ink-secondary">Drag the slider — the location update QPS is the dominant traffic pattern:</p>
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
              { id: "rider", type: "client", label: "Rider App", position: { x: 7, y: 30 }, status: "active", info: "Sends ride request with GPS coords. Receives real-time driver location updates via WebSocket." },
              { id: "driver", type: "client", label: "Driver App", position: { x: 7, y: 70 }, status: "busy", info: "Broadcasts GPS location every 5s. Receives ride offers. Accepts/rejects via API." },
              { id: "apigate", type: "gateway", label: "API Gateway", position: { x: 25, y: 50 }, status: "active", info: "Routes requests. Auth via JWT. Rate limiting. WebSocket upgrade for live location streaming." },
              { id: "location", type: "server", label: "Location Service", position: { x: 45, y: 75 }, status: "busy", info: "Receives location pings from drivers. Writes to Redis GEOADD. Batches to Cassandra every 30s." },
              { id: "matching", type: "server", label: "Matching Service", position: { x: 45, y: 30 }, status: "busy", info: "On ride request: QuadTree lookup → filter → sort by ETA → offer to top driver with Redis SET NX lock." },
              { id: "eta", type: "server", label: "ETA Service", position: { x: 65, y: 50 }, status: "active", info: "ML model + real-time traffic. Called during matching and every 30s during an active trip." },
              { id: "redis", type: "cache", label: "Redis (Geo)", position: { x: 65, y: 20 }, status: "active", info: "GEOADD for driver locations. GEORADIUS for proximity search. Matching locks (SET NX). TTL 60s per driver." },
              { id: "tripdb", type: "database", label: "Trip DB", position: { x: 82, y: 40 }, status: "active", info: "MySQL sharded by trip_id. Stores all trip states: requested, accepted, in-progress, completed." },
              { id: "locationdb", type: "database", label: "Location History", position: { x: 82, y: 75 }, status: "active", info: "Cassandra: driver_id (partition) + timestamp (sort). Used for replay, disputes, and ML training." },
              { id: "surge", type: "server", label: "Surge Pricing", position: { x: 45, y: 10 }, status: "active", info: "Computes supply/demand per geospatial cell every 5 minutes. Updates surge multipliers. Notifies riders." },
            ]}
            edges={[
              { from: "rider", to: "apigate", animated: true, color: "var(--neon-blue)" },
              { from: "driver", to: "apigate", animated: true, color: "var(--neon-green)" },
              { from: "apigate", to: "matching", animated: true, color: "var(--neon-blue)" },
              { from: "apigate", to: "location", animated: true, color: "var(--neon-green)", label: "GPS" },
              { from: "matching", to: "redis", animated: true, color: "var(--neon-yellow)", label: "lock" },
              { from: "matching", to: "eta", animated: true, color: "var(--neon-orange)" },
              { from: "matching", to: "tripdb" },
              { from: "location", to: "redis", animated: true, color: "var(--neon-green)" },
              { from: "location", to: "locationdb", dashed: true },
              { from: "eta", to: "tripdb", dashed: true },
              { from: "surge", to: "redis", dashed: true },
            ]}
          />
        </Section>
      </ScrollReveal>

      {/* 4. Interactive map */}
      <ScrollReveal>
        <Section kicker="Step 4a — Star Feature" title="Matching Algorithm — Interactive Map">
          <p className="mb-3 text-sm text-ink-secondary">Watch the nearest-driver matching in action — yellow dashed lines show matched pairs:</p>
          <InteractiveMap />
        </Section>
      </ScrollReveal>

      {/* 4b. QuadTree */}
      <ScrollReveal>
        <Section kicker="Step 4b" title="QuadTree Geospatial Index">
          <p className="mb-3 text-sm text-ink-secondary">Click cells to subdivide them — this is how Uber finds drivers near you efficiently:</p>
          <QuadTreeViz />
        </Section>
      </ScrollReveal>

      {/* 4c. Surge pricing */}
      <ScrollReveal>
        <Section kicker="Step 4c" title="Surge Pricing Heat Map">
          <p className="mb-3 text-sm text-ink-secondary">Drag the demand slider — watch surge zones light up:</p>
          <SurgePricingMap />
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
        <Section kicker="Step 7" title="Trade-offs: Geospatial Indexing Strategies">
          <TradeoffToggle />
        </Section>
      </ScrollReveal>

      {/* ComparisonBattle */}
      <ScrollReveal>
        <Section kicker="Head to head" title="Location Storage Compared">
          <ComparisonBattle
            left={{ name: "Redis Geo (live)", emoji: "⚡", color: "var(--neon-yellow)", bestFor: "Active driver tracking — needs sub-millisecond GEORADIUS queries during matching." }}
            right={{ name: "Cassandra (history)", emoji: "🗄️", color: "var(--neon-blue)", bestFor: "Trip replay, dispute resolution, ML training on millions of historical routes." }}
            features={[
              { label: "Query latency", a: "< 1ms", b: "10-50ms", winner: "a" },
              { label: "Write throughput", a: 90, b: 95, max: 100, unit: "%", winner: "b" },
              { label: "Data retention", a: "60s TTL", b: "Years", winner: "b" },
              { label: "Geo query support", a: "Native", b: "None", winner: "a" },
              { label: "Horizontal scale", a: "Limited", b: "Unlimited", winner: "b" },
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
          slug="design-uber"
          questions={[
            {
              question: "How does Uber efficiently find the nearest available driver to a rider?",
              options: [
                "Full table scan of all driver locations in MySQL",
                "Google Maps API query for each ride request",
                "Geospatial index (QuadTree or Redis GEORADIUS) querying drivers within a radius, expanding if needed",
                "Broadcasting the request to all drivers and picking the first responder",
              ],
              correct: 2,
              explain: "A QuadTree or Redis GEORADIUS query finds drivers within a 2km radius in O(log N) time. If too few results, the radius expands. This is orders of magnitude faster than a full scan of 1M+ driver locations.",
            },
            {
              question: "Why does Uber store active driver locations in Redis with a TTL instead of directly in a relational database?",
              options: [
                "Redis is cheaper than a relational database",
                "Redis supports geospatial queries (GEOADD/GEORADIUS) natively and handles 200K+ writes/sec in-memory",
                "Relational databases don&apos;t support GPS coordinates",
                "For compliance reasons, live locations must be in-memory only",
              ],
              correct: 1,
              explain: "200K driver location writes per second would crush a relational database. Redis handles this in-memory with its native geo commands. The 60s TTL automatically removes offline drivers. Historical data is batched to Cassandra separately.",
            },
            {
              question: "Two matching services both try to assign the same driver to different riders. How does Uber prevent this?",
              options: [
                "Database-level foreign key constraint",
                "Only one matching service runs at a time (single-threaded)",
                "Optimistic locking using Redis SET NX — first writer wins, loser retries with next candidate",
                "Drivers can accept multiple rides simultaneously",
              ],
              correct: 2,
              explain: "Redis SET NX (set if not exists) is atomic. The first matching service to claim the driver wins. The second service gets a failure response and immediately tries the next closest driver. No coordination overhead.",
            },
            {
              question: "What triggers surge pricing in a specific area?",
              options: [
                "Time of day — always 2x during rush hour",
                "Manual activation by Uber operations team",
                "Supply/demand ratio per geospatial cell falling below a threshold, computed every 5 minutes",
                "When more than 100 riders are waiting",
              ],
              correct: 2,
              explain: "Surge is computed algorithmically: if demand (ride requests) significantly exceeds supply (available drivers) in a cell, the multiplier kicks in. It auto-reduces as more drivers enter the zone (incentivized by the higher pay).",
            },
            {
              question: "A driver&apos;s app closes unexpectedly mid-trip. How does the system detect this?",
              options: [
                "The rider manually reports it to Uber support",
                "Location updates stop — after 60s TTL expires in Redis, the driver is marked offline",
                "GPS satellite directly notifies Uber servers",
                "The driver&apos;s phone battery level is monitored",
              ],
              correct: 1,
              explain: "Each driver entry in Redis has a 60-second TTL. Location updates renew the TTL. If the app crashes and updates stop, Redis auto-expires the key within 60 seconds. The system marks the driver offline and can re-dispatch the rider if needed.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
