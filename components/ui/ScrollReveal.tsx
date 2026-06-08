"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scaleIn";

const VARIANTS: Record<Variant, Variants> = {
  fadeUp: { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } },
  fadeIn: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  slideLeft: { hidden: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0 } },
  slideRight: { hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0 } },
  scaleIn: { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1 } },
};

/**
 * Reveals children on scroll-into-view. A short mount fallback guarantees the
 * content becomes visible even if the IntersectionObserver never fires
 * (e.g. headless rendering, odd viewport conditions) — no stuck-invisible sections.
 */
export function ScrollReveal({
  children,
  variant = "fadeUp",
  delay = 0,
  className,
  once = true,
  amount = 0.15,
}: {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className={className}
      variants={VARIANTS[variant]}
      initial="hidden"
      animate={shown ? "show" : undefined}
      whileInView="show"
      onViewportEnter={() => setShown(true)}
      viewport={{ once, amount }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Container that staggers its ScrollRevealItem children. */
export function ScrollRevealGroup({
  children,
  className,
  stagger = 0.08,
  once = true,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
  amount?: number;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={shown ? "show" : undefined}
      whileInView="show"
      onViewportEnter={() => setShown(true)}
      viewport={{ once, amount }}
      variants={{ show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollRevealItem({
  children,
  variant = "fadeUp",
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={VARIANTS[variant]}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
