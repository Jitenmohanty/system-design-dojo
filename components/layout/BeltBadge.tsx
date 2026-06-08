"use client";

import { motion } from "framer-motion";
import type { Belt } from "@/lib/concepts";
import { BELT_VISUALS } from "@/lib/utils";

export function BeltBadge({
  belt,
  size = "md",
  showLabel = true,
}: {
  belt: Belt;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  const v = BELT_VISUALS[belt];
  const dims = size === "sm" ? 26 : size === "lg" ? 56 : 38;

  return (
    <div className="flex items-center gap-2.5">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
        className="relative grid place-items-center rounded-xl"
        style={{
          width: dims,
          height: dims,
          background: `linear-gradient(135deg, ${v.color}, ${v.color}cc)`,
          boxShadow: `0 0 18px -4px ${v.glow}`,
        }}
      >
        {/* belt knot */}
        <div
          className="absolute h-[3px] w-full"
          style={{ background: "rgba(0,0,0,0.35)" }}
        />
        <div
          className="relative rounded-[3px]"
          style={{
            width: dims * 0.32,
            height: dims * 0.5,
            background: belt === "black" ? "#a855f7" : "rgba(0,0,0,0.4)",
            boxShadow: belt === "black" ? `0 0 10px ${v.glow}` : "none",
          }}
        />
      </motion.div>
      {showLabel && (
        <div className="leading-tight">
          <div
            className="font-display text-sm font-semibold"
            style={{ color: belt === "black" ? "#fff" : v.color }}
          >
            {v.label}
          </div>
          <div className="mono text-[0.6rem] uppercase tracking-widest text-ink-muted">
            Rank
          </div>
        </div>
      )}
    </div>
  );
}
