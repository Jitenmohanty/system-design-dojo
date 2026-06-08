"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Compass } from "lucide-react";

const JOKES = [
  "404: This page got fanned-out on write but never reached your timeline.",
  "404: Cache miss. And the database doesn't have it either. 💀",
  "404: This route was sharded into oblivion.",
  "404: The load balancer routed you to a server that doesn't exist.",
];

export default function NotFound() {
  // pick a deterministic-ish joke without breaking hydration
  const joke = JOKES[0];
  return (
    <div className="grid min-h-[80vh] place-items-center px-6 text-center">
      <div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="font-display text-8xl font-extrabold neon-text animate-title-glow sm:text-9xl"
        >
          404
        </motion.div>
        <p className="mx-auto mt-4 max-w-md text-balance text-lg text-ink-secondary">{joke}</p>
        <p className="mt-1 mono text-xs text-ink-muted">
          Other jokes are available, but they also 404&apos;d.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-neon"><Home size={16} /> Back to base</Link>
          <Link href="/learn" className="btn-ghost"><Compass size={16} /> View the roadmap</Link>
        </div>
      </div>
    </div>
  );
}
