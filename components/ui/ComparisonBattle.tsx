"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BattleSide {
  name: string;
  emoji?: string;
  color: string;
  bestFor: string;
}

export interface BattleFeature {
  label: string;
  a: string | number;
  b: string | number;
  /** who wins this row */
  winner?: "a" | "b" | "tie";
  /** if set, a & b are rendered as progress bars out of max */
  max?: number;
  unit?: string;
}

export function ComparisonBattle({
  left,
  right,
  features,
}: {
  left: BattleSide;
  right: BattleSide;
  features: BattleFeature[];
}) {
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-[var(--border-subtle)] p-5">
        <SideHeader side={left} align="left" />
        <div
          className="grid h-12 w-12 place-items-center rounded-full font-display text-sm font-extrabold"
          style={{
            background: "var(--bg-tertiary)",
            border: "2px solid var(--border-neon)",
            boxShadow: "0 0 20px -6px var(--neon-blue)",
          }}
        >
          VS
        </div>
        <SideHeader side={right} align="right" />
      </div>

      {/* Feature rows */}
      <div className="divide-y divide-[var(--border-subtle)]">
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-3"
          >
            <Cell value={f.a} max={f.max} unit={f.unit} color={left.color} win={f.winner === "a"} align="left" />
            <div className="mono w-24 text-center text-[0.6rem] uppercase tracking-wider text-ink-muted">
              {f.label}
            </div>
            <Cell value={f.b} max={f.max} unit={f.unit} color={right.color} win={f.winner === "b"} align="right" />
          </motion.div>
        ))}
      </div>

      {/* Best for */}
      <div className="grid grid-cols-2 gap-3 border-t border-[var(--border-subtle)] p-5">
        {[left, right].map((s) => (
          <div
            key={s.name}
            className="rounded-xl p-4"
            style={{ background: `${s.color}0f`, border: `1px solid ${s.color}40` }}
          >
            <div className="mono mb-1 text-[0.6rem] uppercase tracking-wider" style={{ color: s.color }}>
              Best for
            </div>
            <div className="text-sm text-ink-primary">{s.bestFor}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SideHeader({ side, align }: { side: BattleSide; align: "left" | "right" }) {
  return (
    <div className={cn("flex items-center gap-2", align === "right" && "flex-row-reverse text-right")}>
      {side.emoji && <span className="text-2xl">{side.emoji}</span>}
      <div>
        <div className="font-display text-lg font-bold" style={{ color: side.color }}>
          {side.name}
        </div>
      </div>
    </div>
  );
}

function Cell({
  value, max, unit, color, win, align,
}: {
  value: string | number; max?: number; unit?: string; color: string; win?: boolean; align: "left" | "right";
}) {
  const isNum = typeof value === "number" && max !== undefined;
  return (
    <div className={cn(align === "right" ? "text-right" : "text-left")}>
      <div className={cn("flex items-center gap-1.5", align === "right" && "flex-row-reverse")}>
        <span className="text-sm font-medium" style={{ color: win ? color : "var(--text-primary)" }}>
          {value}{unit && <span className="text-ink-muted">{unit}</span>}
        </span>
        {win && <Crown size={13} style={{ color }} />}
      </div>
      {isNum && (
        <div className={cn("mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5", align === "right" && "flex justify-end")}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.min(100, ((value as number) / (max as number)) * 100)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  );
}
