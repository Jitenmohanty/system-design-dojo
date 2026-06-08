"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Activity, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SimMetric {
  label: string;
  value: string | number;
  color?: string;
  hint?: string;
}

export interface SimEvent {
  id: string | number;
  time: string;
  text: string;
  color?: string;
}

export const SPEEDS = [0.25, 0.5, 1, 2, 4];

export function SimulationWrapper({
  title = "Simulation",
  playing,
  onPlayPause,
  onReset,
  speed,
  onSpeed,
  metrics = [],
  events = [],
  controls,
  children,
  canvasHeight = 420,
}: {
  title?: string;
  playing: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  speed: number;
  onSpeed: (s: number) => void;
  metrics?: SimMetric[];
  events?: SimEvent[];
  controls?: React.ReactNode;
  children: React.ReactNode;
  canvasHeight?: number;
}) {
  return (
    <div className="card neon-border overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-bg-tertiary/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={cn("absolute inline-flex h-full w-full rounded-full", playing && "animate-ping bg-neon-green/70")} />
            <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", playing ? "bg-neon-green" : "bg-ink-muted")} />
          </span>
          <span className="mono text-xs font-semibold uppercase tracking-[0.25em] text-neon-green">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* speed segmented control */}
          <div className="flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-bg-primary/60 p-0.5">
            <Gauge size={13} className="ml-1 text-ink-muted" />
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => onSpeed(s)}
                className={cn(
                  "rounded-md px-2 py-1 mono text-[0.65rem] transition",
                  speed === s ? "bg-neon-blue/20 text-neon-blue" : "text-ink-muted hover:text-white"
                )}
              >
                {s}×
              </button>
            ))}
          </div>
          <button onClick={onReset} className="btn-ghost px-3 py-1.5 text-sm" aria-label="Reset">
            <RotateCcw size={15} />
          </button>
          <button onClick={onPlayPause} className="btn-neon px-4 py-1.5 text-sm">
            {playing ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Play</>}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[230px_1fr]">
        {/* Controls panel */}
        {controls && (
          <div className="border-b border-[var(--border-subtle)] bg-bg-secondary/40 p-4 lg:border-b-0 lg:border-r">
            {controls}
          </div>
        )}

        <div className="flex flex-col">
          {/* Canvas */}
          <div
            className="relative overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(0,212,255,0.06),transparent_60%)]"
            style={{ height: canvasHeight }}
          >
            {children}
          </div>

          {/* Metrics */}
          {metrics.length > 0 && (
            <div className="grid grid-cols-2 gap-px border-t border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-4">
              {metrics.map((m) => (
                <div key={m.label} className="bg-bg-secondary px-3 py-2.5">
                  <div className="mono text-[0.55rem] uppercase tracking-wider text-ink-muted">{m.label}</div>
                  <div className="font-display text-lg font-bold" style={{ color: m.color ?? "var(--text-primary)" }}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event log */}
      {events.length >= 0 && (
        <div className="border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5 px-4 pt-2 mono text-[0.6rem] uppercase tracking-widest text-ink-muted">
            <Activity size={11} /> Event log
          </div>
          <div className="max-h-32 overflow-y-auto px-4 py-2">
            {events.length === 0 ? (
              <p className="py-2 text-xs text-ink-muted">No events yet. Hit play ▶</p>
            ) : (
              <ul className="space-y-1">
                <AnimatePresence initial={false}>
                  {events.map((e) => (
                    <motion.li
                      key={e.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 mono text-[0.7rem]"
                    >
                      <span className="text-ink-muted">{e.time}</span>
                      <span style={{ color: e.color ?? "var(--text-secondary)" }}>{e.text}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
