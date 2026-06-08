"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function FunnyAnalogy({
  emoji,
  children,
  alternates,
  color = "var(--neon-yellow)",
}: {
  emoji: string;
  children: React.ReactNode;
  alternates?: { emoji: string; text: React.ReactNode }[];
  color?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, rotate: -3 }}
      animate={{ opacity: 1, y: 0, rotate: -2 }}
      transition={{ type: "spring", stiffness: 220, damping: 14 }}
      className="relative my-6"
    >
      <div
        className="relative rounded-2xl bg-bg-secondary p-5 pl-6"
        style={{
          borderLeft: `4px solid ${color}`,
          boxShadow: `-6px 6px 0 -2px ${color}22, 0 10px 30px -15px ${color}55`,
        }}
      >
        <span
          className="absolute -left-4 -top-4 grid h-11 w-11 place-items-center rounded-full text-2xl"
          style={{ background: "var(--bg-tertiary)", border: `2px solid ${color}`, boxShadow: `0 0 18px -4px ${color}` }}
        >
          {emoji}
        </span>
        <div className="mono mb-1 text-[0.65rem] uppercase tracking-[0.25em]" style={{ color }}>
          Think of it like…
        </div>
        <div className="text-[1.02rem] leading-relaxed text-ink-primary">{children}</div>

        {alternates && alternates.length > 0 && (
          <>
            <button
              onClick={() => setOpen((o) => !o)}
              className="mt-3 inline-flex items-center gap-1 text-xs text-ink-secondary transition hover:text-white"
            >
              <ChevronDown size={13} className={open ? "rotate-180 transition" : "transition"} />
              {open ? "Fewer analogies" : `${alternates.length} more analogies`}
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-2">
                    {alternates.map((a, i) => (
                      <div key={i} className="flex gap-2 rounded-lg bg-bg-tertiary/60 p-2.5 text-sm text-ink-secondary">
                        <span className="text-lg leading-none">{a.emoji}</span>
                        <span>{a.text}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}
