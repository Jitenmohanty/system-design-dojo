"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Check, ChevronRight, Circle } from "lucide-react";
import { LEVELS, getConcept, type Level } from "@/lib/concepts";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const { state, toggleComplete, isClient } = useProgress();

  // Parse /learn/<level>/<slug>
  const parts = pathname.split("/").filter(Boolean);
  const isConcept = parts[0] === "learn" && parts.length === 3;
  const level = isConcept ? (parts[1] as Level) : null;
  const slug = isConcept ? parts[2] : null;
  const concept = slug ? getConcept(slug) : undefined;
  const done = isClient && slug ? state.completed.includes(slug) : false;

  const crumbs: { label: string; href?: string }[] = [{ label: "Dojo", href: "/" }];
  if (parts[0] === "learn") {
    crumbs.push({ label: "Learn", href: "/learn" });
    if (level && LEVELS[level]) crumbs.push({ label: LEVELS[level].name, href: `/learn` });
    if (concept) crumbs.push({ label: concept.title });
  } else if (parts[0] === "playground") {
    crumbs.push({ label: "Playground" });
  } else if (parts[0] === "compare") {
    crumbs.push({ label: "Compare" });
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--border-subtle)] bg-bg-primary/80 px-4 backdrop-blur-xl">
      <button
        onClick={onMenu}
        className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border-subtle)] text-ink-secondary hover:text-white lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <nav className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5 truncate">
            {i > 0 && <ChevronRight size={13} className="shrink-0 text-ink-muted" />}
            {c.href ? (
              <Link
                href={c.href}
                className="truncate text-sm text-ink-secondary transition hover:text-white"
              >
                {c.label}
              </Link>
            ) : (
              <span className="truncate text-sm font-medium text-white">{c.label}</span>
            )}
          </span>
        ))}
      </nav>

      {isConcept && slug && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleComplete(slug)}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
            done
              ? "border-neon-green/40 bg-neon-green/10 text-neon-green"
              : "border-[var(--border-subtle)] text-ink-secondary hover:border-[var(--border-neon)] hover:text-white"
          )}
        >
          {done ? <Check size={15} strokeWidth={3} /> : <Circle size={15} />}
          <span className="hidden sm:inline">{done ? "Completed" : "Mark Complete"}</span>
        </motion.button>
      )}
    </header>
  );
}
