"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LEVEL_ORDER, LEVELS, getConcept, getNeighbors, conceptHref, type Level,
} from "@/lib/concepts";
import { useProgress, touchStreak, isLevelComplete } from "@/lib/progress";
import { celebrate } from "@/lib/confetti";
import { BeltBadge } from "./BeltBadge";
import { BELT_VISUALS } from "@/lib/utils";

const LEVEL_TO_BELT = {
  beginner: "yellow", intermediate: "green", advanced: "black", expert: "black",
} as const;

export function GlobalEffects() {
  const { state, isClient } = useProgress();
  const router = useRouter();
  const pathname = usePathname();
  const [promo, setPromo] = useState<Level | null>(null);
  const prevDone = useRef<Set<Level> | null>(null);

  // streak on mount
  useEffect(() => { touchStreak(); }, []);

  // belt promotion detection
  useEffect(() => {
    if (!isClient) return;
    const nowDone = new Set<Level>(LEVEL_ORDER.filter((l) => isLevelComplete(state, l)));
    if (prevDone.current === null) {
      prevDone.current = nowDone; // baseline; don't celebrate on first load
      return;
    }
    for (const l of LEVEL_ORDER) {
      if (nowDone.has(l) && !prevDone.current.has(l)) {
        setPromo(l);
        celebrate();
        break;
      }
    }
    prevDone.current = nowDone;
  }, [state, isClient]);

  // keyboard nav N / P
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      const parts = pathname.split("/").filter(Boolean);
      if (parts[0] !== "learn" || parts.length !== 3) return;
      const slug = parts[2];
      if (!getConcept(slug)) return;
      const { prev, next } = getNeighbors(slug);
      if ((e.key === "n" || e.key === "N") && next) router.push(conceptHref(next));
      if ((e.key === "p" || e.key === "P") && prev) router.push(conceptHref(prev));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pathname, router]);

  const belt = promo ? BELT_VISUALS[LEVEL_TO_BELT[promo]] : null;

  return (
    <AnimatePresence>
      {promo && belt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] grid place-items-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => setPromo(null)}
        >
          <motion.div
            initial={{ scale: 0.7, rotate: -6, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
            onClick={(e) => e.stopPropagation()}
            className="card relative max-w-md p-10 text-center"
            style={{ boxShadow: `0 0 60px -10px ${belt.glow}` }}
          >
            <div className="mb-3 text-5xl">🥋✨</div>
            <div className="mono text-xs uppercase tracking-[0.3em] text-ink-muted">
              Rank up
            </div>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-white">
              {LEVELS[promo].name} mastered!
            </h2>
            <p className="mt-2 text-sm text-ink-secondary">
              You&apos;ve earned the <strong style={{ color: belt.color }}>{belt.label}</strong>.
              The next dan awaits.
            </p>
            <div className="mt-6 flex justify-center">
              <BeltBadge belt={LEVEL_TO_BELT[promo]} size="lg" showLabel={false} />
            </div>
            <button onClick={() => setPromo(null)} className="btn-neon mt-7 w-full justify-center">
              Continue training →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
