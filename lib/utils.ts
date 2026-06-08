import type { Belt } from "./concepts";

/** Tiny classnames joiner (no dependency). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface BeltVisual {
  label: string;
  color: string; // hex
  glow: string;
  textColor: string;
}

export const BELT_VISUALS: Record<Belt, BeltVisual> = {
  white: { label: "White Belt", color: "#f5f5f5", glow: "rgba(245,245,245,0.5)", textColor: "#0a0a0f" },
  yellow: { label: "Yellow Belt", color: "#ffd000", glow: "rgba(255,208,0,0.6)", textColor: "#0a0a0f" },
  green: { label: "Green Belt", color: "#00ff88", glow: "rgba(0,255,136,0.6)", textColor: "#0a0a0f" },
  black: { label: "Black Belt", color: "#1c1c2e", glow: "rgba(168,85,247,0.7)", textColor: "#fff" },
};

export const TOPIC_COLORS: Record<string, string> = {
  networking: "var(--neon-blue)",
  databases: "var(--neon-green)",
  caching: "var(--neon-yellow)",
  scaling: "var(--neon-purple)",
  distributed: "var(--neon-red)",
  architecture: "var(--neon-orange)",
  api: "var(--neon-blue)",
  "case-study": "var(--neon-purple)",
};

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.round(n));
}
