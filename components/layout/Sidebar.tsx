"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronDown, Check, Zap, X, Filter, Home, LayoutGrid, GitCompare, BookOpen,
} from "lucide-react";
import {
  LEVELS, LEVEL_ORDER, conceptsByLevel, conceptHref, CONCEPTS,
  TOPIC_LABELS, type Level, type Topic,
} from "@/lib/concepts";
import { useProgress, levelProgress, currentBelt } from "@/lib/progress";
import { cn, TOPIC_COLORS } from "@/lib/utils";
import { BeltBadge } from "./BeltBadge";

const ALL_TOPICS = Object.keys(TOPIC_LABELS) as Topic[];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { state, isClient } = useProgress();
  const [query, setQuery] = useState("");
  const [activeTopics, setActiveTopics] = useState<Topic[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [openLevels, setOpenLevels] = useState<Record<Level, boolean>>({
    beginner: true, intermediate: true, advanced: false, expert: false,
  });

  const belt = isClient ? currentBelt(state) : "white";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONCEPTS.filter((c) => {
      const matchesQ = !q || c.title.toLowerCase().includes(q) || c.blurb.toLowerCase().includes(q);
      const matchesT = activeTopics.length === 0 || c.topics.some((t) => activeTopics.includes(t));
      return matchesQ && matchesT;
    });
  }, [query, activeTopics]);

  const isFiltering = query.trim() !== "" || activeTopics.length > 0;

  const toggleTopic = (t: Topic) =>
    setActiveTopics((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-5 py-4">
        <Link href="/" onClick={onNavigate} className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple text-bg-primary">
            <Zap size={18} strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-bold leading-none">
            <span className="neon-text">DOJO</span>
            <span className="block text-[0.6rem] font-normal uppercase tracking-[0.3em] text-ink-muted">
              System Design
            </span>
          </span>
        </Link>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-bg-tertiary/60 px-3 py-2.5">
          <BeltBadge belt={belt} size="md" />
          {isClient && (
            <div className="text-right">
              <div className="font-display text-lg font-bold text-neon-green">
                {state.streakDays}🔥
            </div>
              <div className="mono text-[0.55rem] uppercase tracking-widest text-ink-muted">
                day streak
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-1.5 px-4 pt-3">
        {[
          { href: "/", label: "Home", icon: Home },
          { href: "/learn", label: "Map", icon: LayoutGrid },
          { href: "/playground", label: "Play", icon: Zap },
          { href: "/compare", label: "Compare", icon: GitCompare },
          { href: "/blog", label: "Blog", icon: BookOpen },
        ].map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[0.6rem] uppercase tracking-wider transition",
                active
                  ? "border-[var(--border-neon)] bg-neon-blue/10 text-neon-blue"
                  : "border-transparent text-ink-secondary hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Search */}
      <div className="px-4 pt-3">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts…"
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-bg-tertiary/60 py-2 pl-9 pr-9 text-sm text-white placeholder:text-ink-muted focus:border-[var(--border-neon)] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-white"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={cn(
            "mt-2 flex items-center gap-1.5 text-xs transition",
            activeTopics.length ? "text-neon-blue" : "text-ink-secondary hover:text-white"
          )}
        >
          <Filter size={13} />
          Filter by topic {activeTopics.length > 0 && `(${activeTopics.length})`}
        </button>
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 pt-2">
                {ALL_TOPICS.map((t) => {
                  const on = activeTopics.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTopic(t)}
                      className="chip transition"
                      style={{
                        borderColor: on ? TOPIC_COLORS[t] : undefined,
                        color: on ? TOPIC_COLORS[t] : undefined,
                        background: on ? `${TOPIC_COLORS[t]}1a` : undefined,
                      }}
                    >
                      {TOPIC_LABELS[t]}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Concept list */}
      <nav className="mt-3 flex-1 overflow-y-auto px-3 pb-6">
        {isFiltering ? (
          <div className="space-y-1 pt-1">
            <div className="px-2 pb-1 mono text-[0.6rem] uppercase tracking-widest text-ink-muted">
              {filtered.length} result{filtered.length !== 1 && "s"}
            </div>
            {filtered.map((c) => (
              <ConceptLink
                key={c.slug}
                href={conceptHref(c)}
                active={pathname === conceptHref(c)}
                done={isClient && state.completed.includes(c.slug)}
                emoji={c.emoji}
                title={c.title}
                onNavigate={onNavigate}
              />
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-4 text-center text-sm text-ink-muted">
                No concepts match. Try fewer filters 🤷
              </p>
            )}
          </div>
        ) : (
          LEVEL_ORDER.map((level) => {
            const meta = LEVELS[level];
            const concepts = conceptsByLevel(level);
            const prog = isClient ? levelProgress(state, level) : { done: 0, total: concepts.length, pct: 0 };
            const open = openLevels[level];
            return (
              <div key={level} className="mb-1">
                <button
                  onClick={() => setOpenLevels((o) => ({ ...o, [level]: !o[level] }))}
                  className="group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-white/5"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }}
                  />
                  <span className="flex-1">
                    <span className="font-display text-sm font-semibold text-white">{meta.name}</span>
                    <span className="ml-2 mono text-[0.6rem] text-ink-muted">{meta.beltLabel}</span>
                  </span>
                  <span className="mono text-[0.65rem] text-ink-secondary">{prog.done}/{prog.total}</span>
                  <ChevronDown
                    size={15}
                    className={cn("text-ink-muted transition-transform", open && "rotate-180")}
                  />
                </button>
                {/* progress bar */}
                <div className="mx-2 mb-1 h-1 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: meta.color }}
                    initial={false}
                    animate={{ width: `${prog.pct}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5 py-1 pl-3">
                        {concepts.map((c) => (
                          <ConceptLink
                            key={c.slug}
                            href={conceptHref(c)}
                            active={pathname === conceptHref(c)}
                            done={isClient && state.completed.includes(c.slug)}
                            emoji={c.emoji}
                            title={c.title}
                            onNavigate={onNavigate}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </nav>
    </div>
  );
}

function ConceptLink({
  href, active, done, emoji, title, onNavigate,
}: {
  href: string; active: boolean; done: boolean; emoji: string; title: string; onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition",
        active
          ? "bg-neon-blue/10 text-neon-blue"
          : "text-ink-secondary hover:bg-white/5 hover:text-white"
      )}
    >
      <span className="text-[0.95rem] leading-none">{emoji}</span>
      <span className="flex-1 truncate">{title}</span>
      {done && (
        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-neon-green/20 text-neon-green">
          <Check size={11} strokeWidth={3} />
        </span>
      )}
    </Link>
  );
}
