"use client";

// ============================================================
// SYSTEM DESIGN DOJO — localStorage progress system
// Tracks: completed concepts, quiz scores, streak days, current belt.
// Reactive via a tiny pub/sub so the sidebar/topbar update live.
// ============================================================

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import {
  CONCEPTS,
  LEVEL_ORDER,
  conceptsByLevel,
  getConcept,
  type Belt,
  type Level,
} from "./concepts";

const STORAGE_KEY = "sdd-progress-v1";

export interface ProgressState {
  completed: string[]; // concept slugs
  quizScores: Record<string, number>; // slug -> best % (0..100)
  streakDays: number;
  lastVisit: string | null; // ISO date (yyyy-mm-dd)
  visited: string[]; // slugs ever opened
  seenIntro: boolean;
}

const DEFAULT_STATE: ProgressState = {
  completed: [],
  quizScores: {},
  streakDays: 0,
  lastVisit: null,
  visited: [],
  seenIntro: false,
};

// ---------------- core store ----------------

let memoryState: ProgressState = DEFAULT_STATE;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): ProgressState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...(JSON.parse(raw) as ProgressState) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function write(state: ProgressState) {
  memoryState = state;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }
  listeners.forEach((l) => l());
}

function ensureHydrated() {
  if (!hydrated && typeof window !== "undefined") {
    memoryState = read();
    hydrated = true;
  }
}

function subscribe(cb: () => void) {
  ensureHydrated();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): ProgressState {
  ensureHydrated();
  return memoryState;
}

function getServerSnapshot(): ProgressState {
  return DEFAULT_STATE;
}

// ---------------- mutations ----------------

function todayISO(): string {
  // Local date as yyyy-mm-dd
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

export function markComplete(slug: string) {
  const s = getSnapshot();
  if (s.completed.includes(slug)) return;
  write({ ...s, completed: [...s.completed, slug] });
}

export function toggleComplete(slug: string) {
  const s = getSnapshot();
  const has = s.completed.includes(slug);
  write({
    ...s,
    completed: has ? s.completed.filter((x) => x !== slug) : [...s.completed, slug],
  });
}

export function recordQuiz(slug: string, scorePct: number) {
  const s = getSnapshot();
  const best = Math.max(s.quizScores[slug] ?? 0, Math.round(scorePct));
  write({ ...s, quizScores: { ...s.quizScores, [slug]: best } });
}

export function markVisited(slug: string) {
  const s = getSnapshot();
  if (s.visited.includes(slug)) return;
  write({ ...s, visited: [...s.visited, slug] });
}

export function setSeenIntro(v: boolean) {
  write({ ...getSnapshot(), seenIntro: v });
}

/** Call once on app load to roll the streak. */
export function touchStreak() {
  const s = getSnapshot();
  const today = todayISO();
  if (s.lastVisit === today) return;

  let streak = s.streakDays;
  if (s.lastVisit) {
    const prev = new Date(s.lastVisit + "T00:00:00");
    const now = new Date(today + "T00:00:00");
    const diffDays = Math.round((now.getTime() - prev.getTime()) / 86_400_000);
    streak = diffDays === 1 ? streak + 1 : 1;
  } else {
    streak = 1;
  }
  write({ ...s, streakDays: streak, lastVisit: today });
}

export function resetProgress() {
  write({ ...DEFAULT_STATE });
}

// ---------------- derived ----------------

export function isLevelComplete(state: ProgressState, level: Level): boolean {
  const slugs = conceptsByLevel(level).map((c) => c.slug);
  return slugs.length > 0 && slugs.every((s) => state.completed.includes(s));
}

export function levelProgress(state: ProgressState, level: Level): {
  done: number;
  total: number;
  pct: number;
} {
  const slugs = conceptsByLevel(level).map((c) => c.slug);
  const done = slugs.filter((s) => state.completed.includes(s)).length;
  const total = slugs.length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

/** Highest belt earned: complete all concepts in a level to earn its belt. */
export function currentBelt(state: ProgressState): Belt {
  let belt: Belt = "white";
  for (const level of LEVEL_ORDER) {
    if (isLevelComplete(state, level)) {
      belt = level === "beginner" ? "yellow"
        : level === "intermediate" ? "green"
        : level === "advanced" ? "black"
        : "black";
    } else {
      break;
    }
  }
  return belt;
}

export function overallProgress(state: ProgressState): {
  done: number;
  total: number;
  pct: number;
} {
  const total = CONCEPTS.length;
  const done = state.completed.filter((s) => getConcept(s)).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

// ---------------- React hook ----------------

export function useProgress() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  return {
    state,
    isClient,
    markComplete: useCallback((s: string) => markComplete(s), []),
    toggleComplete: useCallback((s: string) => toggleComplete(s), []),
    recordQuiz: useCallback((s: string, p: number) => recordQuiz(s, p), []),
    markVisited: useCallback((s: string) => markVisited(s), []),
    resetProgress: useCallback(() => resetProgress(), []),
    isCompleted: useCallback((s: string) => state.completed.includes(s), [state]),
  };
}
