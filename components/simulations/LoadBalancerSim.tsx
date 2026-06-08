"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip,
} from "recharts";
import { Skull, Plus, Minus, Cloud, Network } from "lucide-react";
import { SimulationWrapper, type SimMetric, type SimEvent } from "./SimulationWrapper";
import { cn, clamp } from "@/lib/utils";

// ------------------------------------------------------------
// Types & constants
// ------------------------------------------------------------
type Algo = "round-robin" | "least-connections" | "weighted" | "ip-hash" | "random" | "least-response";

const ALGOS: { id: Algo; label: string }[] = [
  { id: "round-robin", label: "Round Robin" },
  { id: "least-connections", label: "Least Connections" },
  { id: "weighted", label: "Weighted Round Robin" },
  { id: "ip-hash", label: "IP Hash" },
  { id: "random", label: "Random" },
  { id: "least-response", label: "Least Response Time" },
];

const SERVER_COLORS = ["#00d4ff", "#00ff88", "#ffd000", "#a855f7", "#ff8a3d", "#ff3366", "#4ade80", "#38bdf8"];
const CLIENT_IPS = ["10.0.0.1", "10.0.0.2", "10.0.0.3", "10.0.0.4", "10.0.0.5", "10.0.0.6"];

interface ServerState {
  id: number; name: string; color: string; alive: boolean; weight: number;
  load: number; connections: number; handled: number; responseTime: number;
}
interface Particle {
  id: number; ip: string; color: string; x: number; y: number;
  phase: "to-lb" | "to-server"; t: number; target: number; weight: number;
}

const SPAWN_CAP = 60; // max visual particles spawned per second
const MAX_PARTICLES = 160;

function serverX(i: number, n: number) {
  if (n === 1) return 0.5;
  return 0.1 + (0.8 * i) / (n - 1);
}
function hashIp(ip: string) {
  let h = 0;
  for (let i = 0; i < ip.length; i++) h = (h * 31 + ip.charCodeAt(i)) >>> 0;
  return h;
}

export function LoadBalancerSim() {
  // ---- refs (mutable engine state) ----
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const serversRef = useRef<ServerState[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const rrRef = useRef(0);
  const spawnAcc = useRef(0);
  const lastTs = useRef(0);
  const pidRef = useRef(0);
  const handledWindow = useRef(0); // requests handled since last metric sample
  const decisionRef = useRef<string>("");

  // ---- control state ----
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [algo, setAlgo] = useState<Algo>("round-robin");
  const [rps, setRps] = useState(60);
  const [count, setCount] = useState(4);

  // ---- view state ----
  const [view, setView] = useState<ServerState[]>([]);
  const [rpsSeries, setRpsSeries] = useState<{ t: number; v: number }[]>([]);
  const [rtSeries, setRtSeries] = useState<{ t: number; v: number }[]>([]);
  const [health, setHealth] = useState(100);
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [decision, setDecision] = useState("");

  // refs mirror controls for the rAF loop
  const playingR = useRef(playing); playingR.current = playing;
  const speedR = useRef(speed); speedR.current = speed;
  const algoR = useRef(algo); algoR.current = algo;
  const rpsR = useRef(rps); rpsR.current = rps;

  const pushEvent = useCallback((text: string, color?: string) => {
    setEvents((e) => [{ id: pidRef.current++, time: clockStr(), text, color }, ...e].slice(0, 40));
  }, []);

  // ---- (re)build servers when count changes ----
  const buildServers = useCallback((n: number) => {
    const prev = serversRef.current;
    const next: ServerState[] = Array.from({ length: n }, (_, i) => {
      const old = prev[i];
      return old ?? {
        id: i, name: `S${i + 1}`, color: SERVER_COLORS[i % SERVER_COLORS.length],
        alive: true, weight: 1, load: 0, connections: 0, handled: 0, responseTime: 25,
      };
    });
    serversRef.current = next;
    setView(next.map((s) => ({ ...s })));
  }, []);

  useEffect(() => { buildServers(count); }, [count, buildServers]);

  // ---- resize observer ----
  useEffect(() => {
    const el = stageRef.current;
    const cv = canvasRef.current;
    if (!el || !cv) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight;
      sizeRef.current = { w, h };
      const dpr = window.devicePixelRatio || 1;
      cv.width = w * dpr; cv.height = h * dpr;
      cv.style.width = w + "px"; cv.style.height = h + "px";
      const ctx = cv.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- assignment logic ----
  const pickServer = useCallback((ip: string): number => {
    const servers = serversRef.current;
    const alive = servers.filter((s) => s.alive);
    if (alive.length === 0) return -1;
    const a = algoR.current;
    let chosen: ServerState;
    if (a === "round-robin") {
      rrRef.current = (rrRef.current + 1) % alive.length;
      chosen = alive[rrRef.current];
      decisionRef.current = `Round Robin → ${chosen.name}`;
    } else if (a === "least-connections") {
      chosen = alive.reduce((m, s) => (s.connections < m.connections ? s : m), alive[0]);
      decisionRef.current = `Fewest conns → ${chosen.name} (${Math.round(chosen.connections)})`;
    } else if (a === "weighted") {
      // smooth weighted round robin
      let best = alive[0], total = 0;
      for (const s of alive) {
        (s as any)._cw = ((s as any)._cw ?? 0) + s.weight;
        total += s.weight;
        if ((s as any)._cw > (best as any)._cw) best = s;
      }
      (best as any)._cw -= total;
      chosen = best;
      decisionRef.current = `Weighted (w=${chosen.weight}) → ${chosen.name}`;
    } else if (a === "ip-hash") {
      const idx = hashIp(ip) % servers.length;
      chosen = servers[idx].alive ? servers[idx] : alive[hashIp(ip) % alive.length];
      decisionRef.current = `hash(${ip}) → ${chosen.name} (sticky)`;
    } else if (a === "random") {
      chosen = alive[Math.floor(Math.random() * alive.length)];
      decisionRef.current = `🎲 Random → ${chosen.name}`;
    } else {
      chosen = alive.reduce((m, s) => (s.responseTime < m.responseTime ? s : m), alive[0]);
      decisionRef.current = `Fastest → ${chosen.name} (${Math.round(chosen.responseTime)}ms)`;
    }
    return chosen.id;
  }, []);

  // ---- main animation loop ----
  useEffect(() => {
    let raf = 0;
    const loop = (ts: number) => {
      raf = requestAnimationFrame(loop);
      const cv = canvasRef.current;
      const ctx = cv?.getContext("2d");
      const { w, h } = sizeRef.current;
      if (!ctx || w === 0) { lastTs.current = ts; return; }
      let dt = (ts - lastTs.current) / 1000;
      lastTs.current = ts;
      if (dt > 0.1) dt = 0.1;
      const sp = speedR.current;
      const servers = serversRef.current;
      const n = servers.length;

      const cloud = { x: 0.5 * w, y: 0.12 * h };
      const lb = { x: 0.5 * w, y: 0.45 * h };
      const srvPt = (i: number) => ({ x: serverX(i, n) * w, y: 0.84 * h });

      if (playingR.current) {
        // spawn
        const visualRps = Math.min(rpsR.current, SPAWN_CAP);
        const wPer = Math.max(1, Math.round(rpsR.current / SPAWN_CAP));
        spawnAcc.current += visualRps * sp * dt;
        while (spawnAcc.current >= 1 && particlesRef.current.length < MAX_PARTICLES) {
          spawnAcc.current -= 1;
          const ip = CLIENT_IPS[Math.floor(Math.random() * CLIENT_IPS.length)];
          particlesRef.current.push({
            id: pidRef.current++, ip, color: "#8a8aa0",
            x: cloud.x + (Math.random() - 0.5) * 60, y: cloud.y,
            phase: "to-lb", t: 0, target: -1, weight: wPer,
          });
        }

        // update particles
        const survivors: Particle[] = [];
        for (const p of particlesRef.current) {
          p.t += dt * sp * 1.6;
          if (p.phase === "to-lb") {
            const from = { x: p.x, y: p.y };
            if (p.t >= 1) {
              // assign
              const sid = pickServer(p.ip);
              if (sid < 0) { continue; } // all dead — drop
              p.phase = "to-server"; p.t = 0; p.target = sid;
              const c = servers.find((s) => s.id === sid);
              p.color = c?.color ?? "#fff";
            } else {
              p.x = from.x + (lb.x - from.x) * 0; // recompute below via lerp from cloud
            }
          }
          if (p.phase === "to-server") {
            let tgt = servers.find((s) => s.id === p.target);
            if (tgt && !tgt.alive) {
              // reroute to an alive server
              const alive = servers.filter((s) => s.alive);
              if (alive.length) { tgt = alive[Math.floor(Math.random() * alive.length)]; p.target = tgt.id; p.color = tgt.color; }
            }
            if (!tgt) continue;
            if (p.t >= 1) {
              // arrived → register
              tgt.load += p.weight;
              tgt.connections += p.weight;
              tgt.handled += p.weight;
              handledWindow.current += p.weight;
              continue;
            }
          }
          survivors.push(p);
        }
        particlesRef.current = survivors;

        // server load decay & derived metrics
        for (const s of servers) {
          // connections drain proportional to capacity
          const cap = 18 * s.weight;
          const drain = (cap * 0.9) * dt; // serve ~cap/sec
          s.connections = Math.max(0, s.connections - drain);
          s.load = Math.max(0, s.load - drain);
          const cpu = clamp((s.connections / cap) * 100, 0, 100);
          (s as any)._cpu = cpu;
          // response time grows with load, explodes past 85%
          const base = 25;
          s.responseTime = base + cpu * 0.8 + (cpu > 85 ? (cpu - 85) * 14 : 0);
          if (!s.alive) { s.connections = 0; s.load = 0; s.responseTime = 0; }
        }
      }

      // ---- render canvas ----
      ctx.clearRect(0, 0, w, h);
      // faint guide lines cloud->lb and lb->servers
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      line(ctx, cloud.x, cloud.y, lb.x, lb.y);
      for (let i = 0; i < n; i++) {
        const s = servers[i];
        const pt = srvPt(i);
        ctx.strokeStyle = s.alive ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)";
        line(ctx, lb.x, lb.y, pt.x, pt.y);
      }
      // particles
      for (const p of particlesRef.current) {
        let px = p.x, py = p.y;
        if (p.phase === "to-lb") {
          px = lerp(cloud.x, lb.x, easeT(p.t));
          py = lerp(cloud.y, lb.y, easeT(p.t));
        } else {
          const tgt = servers.find((s) => s.id === p.target);
          const pt = tgt ? srvPt(servers.indexOf(tgt)) : lb;
          px = lerp(lb.x, pt.x, easeT(p.t));
          py = lerp(lb.y, pt.y, easeT(p.t));
        }
        p.x = px; p.y = py;
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color; ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [pickServer]);

  // ---- metric sampling (low frequency) ----
  useEffect(() => {
    let tick = 0;
    const iv = setInterval(() => {
      tick++;
      const servers = serversRef.current;
      setView(servers.map((s) => ({ ...s, ...(s as any) })));
      setDecision(decisionRef.current);
      // throughput
      const tp = handledWindow.current * 2; // sampled every 500ms → per sec
      handledWindow.current = 0;
      setRpsSeries((d) => [...d, { t: tick, v: Math.round(tp) }].slice(-30));
      const aliveServers = servers.filter((s) => s.alive);
      const avgRt = aliveServers.length ? aliveServers.reduce((a, s) => a + s.responseTime, 0) / aliveServers.length : 0;
      setRtSeries((d) => [...d, { t: tick, v: Math.round(avgRt) }].slice(-30));
      const avgCpu = aliveServers.length ? aliveServers.reduce((a, s) => a + ((s as any)._cpu ?? 0), 0) / aliveServers.length : 0;
      const aliveRatio = servers.length ? aliveServers.length / servers.length : 0;
      setHealth(Math.round(clamp(aliveRatio * 100 - avgCpu * 0.4, 0, 100)));
    }, 500);
    return () => clearInterval(iv);
  }, []);

  // ---- control handlers ----
  const kill = (id: number) => {
    const s = serversRef.current.find((x) => x.id === id);
    if (s) { s.alive = false; pushEvent(`💀 ${s.name} went down — traffic rerouting`, "var(--neon-red)"); setView(serversRef.current.map((x) => ({ ...x }))); }
  };
  const revive = (id: number) => {
    const s = serversRef.current.find((x) => x.id === id);
    if (s) { s.alive = true; s.responseTime = 25; pushEvent(`💚 ${s.name} revived — back in rotation`, "var(--neon-green)"); setView(serversRef.current.map((x) => ({ ...x }))); }
  };
  const setWeight = (id: number, w: number) => {
    const s = serversRef.current.find((x) => x.id === id);
    if (s) { s.weight = w; setView(serversRef.current.map((x) => ({ ...x }))); }
  };
  const reset = () => {
    particlesRef.current = []; rrRef.current = 0; spawnAcc.current = 0;
    serversRef.current.forEach((s) => { s.alive = true; s.load = 0; s.connections = 0; s.handled = 0; s.responseTime = 25; s.weight = 1; (s as any)._cw = 0; });
    setView(serversRef.current.map((s) => ({ ...s })));
    setRpsSeries([]); setRtSeries([]); setEvents([]); setHealth(100);
    pushEvent("↺ Simulation reset", "var(--neon-blue)");
  };

  const aliveCount = view.filter((s) => s.alive).length;
  const avgRt = view.filter((s) => s.alive).reduce((a, s, _, arr) => a + s.responseTime / arr.length, 0);

  const metrics: SimMetric[] = [
    { label: "Throughput", value: `${rpsSeries.at(-1)?.v ?? 0}/s`, color: "var(--neon-blue)" },
    { label: "Servers up", value: `${aliveCount}/${view.length}`, color: aliveCount === view.length ? "var(--neon-green)" : "var(--neon-red)" },
    { label: "Avg latency", value: `${Math.round(avgRt)}ms`, color: avgRt > 120 ? "var(--neon-red)" : "var(--neon-yellow)" },
    { label: "Health", value: `${health}%`, color: health > 70 ? "var(--neon-green)" : health > 40 ? "var(--neon-yellow)" : "var(--neon-red)" },
  ];

  const controls = (
    <div className="space-y-4">
      <div>
        <label className="mono text-[0.6rem] uppercase tracking-wider text-ink-muted">Algorithm</label>
        <select value={algo} onChange={(e) => { setAlgo(e.target.value as Algo); pushEvent(`Switched to ${e.target.options[e.target.selectedIndex].text}`, "var(--neon-purple)"); }} className="field mt-1">
          {ALGOS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>
      </div>

      <div>
        <label className="flex items-center justify-between mono text-[0.6rem] uppercase tracking-wider text-ink-muted">
          <span>Requests / sec</span><span className="text-neon-blue">{rps}</span>
        </label>
        <input type="range" min={1} max={500} value={rps} onChange={(e) => setRps(+e.target.value)} className="mt-1 w-full accent-[var(--neon-blue)]" />
      </div>

      <div>
        <label className="mono text-[0.6rem] uppercase tracking-wider text-ink-muted">Servers ({count})</label>
        <div className="mt-1 flex gap-2">
          <button onClick={() => setCount((c) => clamp(c - 1, 1, 8))} className="btn-ghost flex-1 justify-center py-1.5"><Minus size={14} /></button>
          <button onClick={() => setCount((c) => clamp(c + 1, 1, 8))} className="btn-ghost flex-1 justify-center py-1.5"><Plus size={14} /></button>
        </div>
      </div>

      {algo === "weighted" && (
        <div className="space-y-2">
          <label className="mono text-[0.6rem] uppercase tracking-wider text-ink-muted">Weights</label>
          {view.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <span className="mono text-xs" style={{ color: s.color }}>{s.name}</span>
              <input type="range" min={1} max={5} value={s.weight} onChange={(e) => setWeight(s.id, +e.target.value)} className="flex-1 accent-[var(--neon-purple)]" />
              <span className="mono text-xs text-ink-secondary">{s.weight}×</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <SimulationWrapper
        title="Load Balancer"
        playing={playing} onPlayPause={() => setPlaying((p) => !p)} onReset={reset}
        speed={speed} onSpeed={setSpeed}
        metrics={metrics} events={events} controls={controls} canvasHeight={460}
      >
        <div ref={stageRef} className="relative h-full w-full">
          <canvas ref={canvasRef} className="absolute inset-0" />

          {/* cloud */}
          <NodeChip x={50} y={12} label="Internet" color="var(--neon-blue)" icon={<Cloud size={22} />} />

          {/* load balancer */}
          <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: "50%", top: "45%" }}>
            <div className="flex flex-col items-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-neon-purple bg-bg-tertiary text-neon-purple shadow-neon-purple animate-pulse-glow">
                <Network size={28} />
              </div>
              <span className="mt-1 mono text-[0.65rem] font-semibold text-neon-purple">LOAD BALANCER</span>
              <span className="mono text-[0.6rem] text-ink-muted">{ALGOS.find((a) => a.id === algo)?.label}</span>
            </div>
          </div>

          {/* decision popup */}
          {decision && (
            <div className="absolute left-1/2 top-[58%] -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--border-subtle)] bg-bg-primary/80 px-2.5 py-1 mono text-[0.6rem] text-ink-secondary backdrop-blur">
              {decision}
            </div>
          )}

          {/* servers */}
          {view.map((s, i) => {
            const x = serverX(i, view.length) * 100;
            const cpu = (s as any)._cpu ?? 0;
            const cpuColor = !s.alive ? "#56566b" : cpu > 80 ? "var(--neon-red)" : cpu > 50 ? "var(--neon-yellow)" : "var(--neon-green)";
            return (
              <div key={s.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: "84%", width: 92 }}>
                <div
                  className={cn("rounded-xl border-2 bg-bg-tertiary/90 p-2 transition", !s.alive && "opacity-60")}
                  style={{ borderColor: s.alive ? s.color : "#56566b" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="mono text-xs font-bold" style={{ color: s.alive ? s.color : "#56566b" }}>
                      {s.alive ? s.name : <Skull size={13} />}
                    </span>
                    <span className="mono text-[0.55rem] text-ink-muted">{s.weight > 1 ? `${s.weight}×` : ""}</span>
                  </div>
                  {/* cpu bar */}
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full transition-all" style={{ width: `${cpu}%`, background: cpuColor }} />
                  </div>
                  <div className="mt-1 flex justify-between mono text-[0.5rem] text-ink-muted">
                    <span>{Math.round(s.connections)} conn</span>
                    <span>{Math.round(s.responseTime)}ms</span>
                  </div>
                  <div className="mono text-[0.5rem] text-ink-muted">{s.handled} reqs</div>
                  <button
                    onClick={() => (s.alive ? kill(s.id) : revive(s.id))}
                    className="mt-1 w-full rounded-md py-0.5 mono text-[0.55rem] transition"
                    style={{
                      background: s.alive ? "rgba(255,51,102,0.12)" : "rgba(0,255,136,0.12)",
                      color: s.alive ? "var(--neon-red)" : "var(--neon-green)",
                    }}
                  >
                    {s.alive ? "Kill" : "Revive"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </SimulationWrapper>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Throughput (req/s)" color="var(--neon-blue)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rpsSeries}>
              <XAxis dataKey="t" hide /><YAxis hide domain={[0, "dataMax + 20"]} />
              <Line type="monotone" dataKey="v" stroke="var(--neon-blue)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Requests per server" color="var(--neon-green)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={view.map((s) => ({ name: s.name, v: s.handled, color: s.alive ? s.color : "#56566b" }))}>
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
              <YAxis hide />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={tooltipStyle} />
              <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                {view.map((s) => <Cell key={s.id} fill={s.alive ? s.color : "#56566b"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Avg response time (ms)" color="var(--neon-yellow)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rtSeries}>
              <XAxis dataKey="t" hide /><YAxis hide domain={[0, "dataMax + 20"]} />
              <Line type="monotone" dataKey="v" stroke="var(--neon-yellow)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// helpers & small components
// ------------------------------------------------------------
function clockStr() {
  const d = new Date();
  return `${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function easeT(t: number) { const x = clamp(t, 0, 1); return x * x * (3 - 2 * x); }
function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}
const tooltipStyle = { background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 8, fontSize: 12 } as const;

function NodeChip({ x, y, label, color, icon }: { x: number; y: number; label: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 bg-bg-tertiary" style={{ borderColor: color, color }}>
        {icon}
      </div>
      <span className="mt-1 block mono text-[0.6rem]" style={{ color }}>{label}</span>
    </div>
  );
}

function ChartCard({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="mb-2 mono text-[0.6rem] uppercase tracking-widest" style={{ color }}>{title}</div>
      <div style={{ height: 120 }}>{children}</div>
    </div>
  );
}
