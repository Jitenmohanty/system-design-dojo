"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server, Database, Zap, Network, Monitor, ListOrdered, Globe, Shield, Skull, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NodeType =
  | "server" | "database" | "cache" | "loadbalancer"
  | "client" | "queue" | "cdn" | "gateway";

export type NodeStatus = "active" | "busy" | "down" | "idle";

export interface DiagramNode {
  id: string;
  type: NodeType;
  label: string;
  /** position as percentage 0..100 of the canvas */
  position: { x: number; y: number };
  status?: NodeStatus;
  info?: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  animated?: boolean;
  color?: string;
  label?: string;
  dashed?: boolean;
}

const TYPE_META: Record<NodeType, { icon: LucideIcon; color: string; label: string }> = {
  server: { icon: Server, color: "var(--neon-blue)", label: "Server" },
  database: { icon: Database, color: "var(--neon-green)", label: "Database" },
  cache: { icon: Zap, color: "var(--neon-yellow)", label: "Cache" },
  loadbalancer: { icon: Network, color: "var(--neon-purple)", label: "Load Balancer" },
  client: { icon: Monitor, color: "var(--neon-blue)", label: "Client" },
  queue: { icon: ListOrdered, color: "var(--neon-orange)", label: "Queue" },
  cdn: { icon: Globe, color: "var(--neon-purple)", label: "CDN" },
  gateway: { icon: Shield, color: "var(--neon-orange)", label: "Gateway" },
};

const STATUS_COLOR: Record<NodeStatus, string> = {
  active: "var(--neon-green)",
  busy: "var(--neon-yellow)",
  down: "#56566b",
  idle: "var(--text-secondary)",
};

export function AnimatedDiagram({
  nodes,
  edges,
  height = 380,
  speed = 1,
  className,
}: {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  height?: number;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: height });
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const nodeById = (id: string) => nodes.find((n) => n.id === id);
  const px = (n: DiagramNode) => ({
    x: (n.position.x / 100) * size.w,
    y: (n.position.y / 100) * size.h,
  });

  const dashDur = `${1 / speed}s`;

  return (
    <div
      ref={ref}
      className={cn("relative w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-bg-secondary/40", className)}
      style={{ height }}
      onClick={() => setSelected(null)}
    >
      {/* Edges */}
      <svg className="absolute inset-0 h-full w-full" width={size.w} height={size.h}>
        {edges.map((e, i) => {
          const a = nodeById(e.from);
          const b = nodeById(e.to);
          if (!a || !b) return null;
          const pa = px(a);
          const pb = px(b);
          const touched = hovered === e.from || hovered === e.to;
          const dimmed = hovered !== null && !touched;
          const color = e.color ?? "var(--neon-blue)";
          const isDown = a.status === "down" || b.status === "down";
          const mx = (pa.x + pb.x) / 2;
          const my = (pa.y + pb.y) / 2;
          return (
            <g key={i} style={{ opacity: dimmed ? 0.18 : 1, transition: "opacity .2s" }}>
              <line
                x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={isDown ? "#56566b" : color}
                strokeWidth={touched ? 2.6 : 1.6}
                strokeDasharray={e.animated || e.dashed ? "6 6" : undefined}
                strokeLinecap="round"
                style={
                  e.animated && !isDown
                    ? { animation: `flow-dash ${dashDur} linear infinite` }
                    : undefined
                }
                opacity={isDown ? 0.4 : 0.85}
              />
              {e.label && (
                <text
                  x={mx} y={my - 6}
                  textAnchor="middle"
                  className="mono"
                  fontSize="10"
                  fill={touched ? "#fff" : "var(--text-secondary)"}
                >
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((n) => {
        const meta = TYPE_META[n.type];
        const Icon = n.status === "down" ? Skull : meta.icon;
        const status = n.status ?? "idle";
        const color = n.status === "down" ? "#56566b" : meta.color;
        const isActive = status === "active";
        const touched = hovered === n.id;
        const dimmed = hovered !== null && !touched && !edges.some(
          (e) => (e.from === hovered && e.to === n.id) || (e.to === hovered && e.from === n.id)
        );
        return (
          <div
            key={n.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none"
            style={{
              left: `${n.position.x}%`,
              top: `${n.position.y}%`,
              opacity: dimmed ? 0.4 : 1,
              transition: "opacity .2s",
              zIndex: selected === n.id ? 20 : 5,
            }}
            onMouseEnter={() => setHovered(n.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={(ev) => {
              ev.stopPropagation();
              setSelected((s) => (s === n.id ? null : n.id));
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className="grid place-items-center rounded-xl border-2"
                style={{
                  width: 52, height: 52,
                  borderColor: color,
                  color,
                  background: "var(--bg-tertiary)",
                  boxShadow: isActive ? `0 0 18px -2px ${color}` : `0 0 0 0 transparent`,
                }}
                animate={
                  isActive
                    ? { boxShadow: [`0 0 8px -2px ${color}`, `0 0 22px 2px ${color}`, `0 0 8px -2px ${color}`] }
                    : status === "busy"
                    ? { scale: [1, 1.05, 1] }
                    : {}
                }
                transition={{ duration: 1.6 / speed, repeat: Infinity }}
                whileHover={{ scale: 1.08 }}
              >
                <Icon size={24} strokeWidth={1.8} />
              </motion.div>
              <span
                className="mono whitespace-nowrap rounded-md px-1.5 text-[0.65rem] font-medium"
                style={{ color: touched ? "#fff" : "var(--text-secondary)" }}
              >
                {n.label}
              </span>
            </div>

            <AnimatePresence>
              {selected === n.id && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="absolute left-1/2 top-full z-30 mt-2 w-48 -translate-x-1/2 rounded-xl border p-3 text-left"
                  style={{ borderColor: color, background: "var(--bg-elevated)", boxShadow: `0 0 24px -8px ${color}` }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR[status] }} />
                    <span className="mono text-[0.6rem] uppercase tracking-wider" style={{ color }}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-1 font-display text-sm font-semibold text-white">{n.label}</div>
                  {n.info && <p className="mt-1 text-xs text-ink-secondary">{n.info}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
