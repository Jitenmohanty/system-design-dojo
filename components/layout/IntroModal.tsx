"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MousePointerClick, Trophy, Gamepad2, Search } from "lucide-react";
import { useProgress, setSeenIntro } from "@/lib/progress";

const TIPS = [
  { icon: MousePointerClick, title: "Everything is interactive", text: "Diagrams animate, simulations run live. Poke at them — that's the point." },
  { icon: Trophy, title: "Earn your belts", text: "Complete every concept in a level to rank up: White → Yellow → Green → Black." },
  { icon: Gamepad2, title: "Hit the Playground", text: "Standalone full-screen simulations with extended controls for the algorithm-curious." },
  { icon: Search, title: "Press N / P to navigate", text: "Jump to the next or previous concept with your keyboard. Search the sidebar anytime." },
];

export function IntroModal() {
  const { state, isClient } = useProgress();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isClient && !state.seenIntro) {
      const t = setTimeout(() => setOpen(true), 700);
      return () => clearTimeout(t);
    }
  }, [isClient, state.seenIntro]);

  const close = () => {
    setSeenIntro(true);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="card neon-border relative w-full max-w-lg p-7"
          >
            <button
              onClick={close}
              className="absolute right-4 top-4 text-ink-muted hover:text-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="mb-1 text-3xl">⚡🥋</div>
            <h2 className="font-display text-2xl font-bold text-white">
              Welcome to the <span className="neon-text">Dojo</span>
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">
              From &ldquo;what is a server?&rdquo; to &ldquo;design YouTube&rdquo; — here&apos;s how to train.
            </p>

            <div className="mt-5 space-y-3">
              {TIPS.map((t) => (
                <div key={t.title} className="flex gap-3 rounded-xl bg-bg-tertiary/50 p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-neon-blue/10 text-neon-blue">
                    <t.icon size={18} />
                  </span>
                  <div>
                    <div className="font-display text-sm font-semibold text-white">{t.title}</div>
                    <div className="text-xs text-ink-secondary">{t.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={close} className="btn-neon mt-6 w-full justify-center">
              Begin Training →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
