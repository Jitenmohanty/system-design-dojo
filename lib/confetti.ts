"use client";

import confetti from "canvas-confetti";

const NEON = ["#00d4ff", "#00ff88", "#ffd000", "#a855f7", "#ff3366"];

/** A quick burst — used for correct quiz answers. */
export function burst(x = 0.5, y = 0.5) {
  confetti({
    particleCount: 70,
    spread: 70,
    startVelocity: 38,
    origin: { x, y },
    colors: NEON,
    scalar: 0.9,
    disableForReducedMotion: true,
  });
}

/** A big celebration — used for belt promotions and quiz completion. */
export function celebrate() {
  const end = Date.now() + 1400;
  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 70,
      origin: { x: 0 },
      colors: NEON,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 70,
      origin: { x: 1 },
      colors: NEON,
      disableForReducedMotion: true,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
