"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Pencil, Trash2, Zap, Snail } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

interface Row { id: number; name: string; belt: string; flash?: "green" | "blue" | "yellow" | "red" }

const NAMES = ["Neo", "Trinity", "Morpheus", "Cypher", "Tank", "Dozer", "Switch", "Mouse"];
const BELTS = ["white", "yellow", "green", "black"];

function CrudTable() {
  const [rows, setRows] = useState<Row[]>([
    { id: 1, name: "Neo", belt: "black" },
    { id: 2, name: "Trinity", belt: "green" },
    { id: 3, name: "Morpheus", belt: "black" },
  ]);
  const [nextId, setNextId] = useState(4);

  const flash = (id: number, color: Row["flash"]) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, flash: color } : r)));
  const clearFlash = (id: number) =>
    setTimeout(() => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, flash: undefined } : r))), 900);

  const insert = () => {
    const r: Row = { id: nextId, name: NAMES[nextId % NAMES.length], belt: BELTS[nextId % BELTS.length], flash: "green" };
    setRows((rs) => [...rs, r]);
    setNextId((n) => n + 1);
    clearFlash(r.id);
  };
  const select = () => { rows.forEach((r) => flash(r.id, "blue")); rows.forEach((r) => clearFlash(r.id)); };
  const update = () => {
    if (!rows.length) return;
    const target = rows[Math.floor(rows.length / 2)];
    flash(target.id, "yellow");
    setRows((rs) => rs.map((r) => (r.id === target.id ? { ...r, belt: BELTS[(BELTS.indexOf(r.belt) + 1) % BELTS.length] } : r)));
    clearFlash(target.id);
  };
  const del = () => {
    if (!rows.length) return;
    const target = rows[rows.length - 1];
    flash(target.id, "red");
    setTimeout(() => setRows((rs) => rs.filter((r) => r.id !== target.id)), 500);
  };

  const flashColor = (f?: Row["flash"]) =>
    f === "green" ? "rgba(0,255,136,0.15)" : f === "blue" ? "rgba(0,212,255,0.15)" : f === "yellow" ? "rgba(255,208,0,0.15)" : f === "red" ? "rgba(255,51,102,0.15)" : "transparent";

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] bg-bg-tertiary/40 p-3">
        <button onClick={insert} className="btn-ghost px-3 py-1.5 text-sm" style={{ color: "var(--neon-green)" }}><Plus size={14} /> INSERT</button>
        <button onClick={select} className="btn-ghost px-3 py-1.5 text-sm" style={{ color: "var(--neon-blue)" }}><Search size={14} /> SELECT</button>
        <button onClick={update} className="btn-ghost px-3 py-1.5 text-sm" style={{ color: "var(--neon-yellow)" }}><Pencil size={14} /> UPDATE</button>
        <button onClick={del} className="btn-ghost px-3 py-1.5 text-sm" style={{ color: "var(--neon-red)" }}><Trash2 size={14} /> DELETE</button>
      </div>

      <div className="p-4">
        <div className="mono text-[0.6rem] uppercase tracking-widest text-ink-muted">Table: users</div>
        <div className="mt-2 overflow-hidden rounded-lg border border-[var(--border-subtle)]">
          <div className="grid grid-cols-[60px_1fr_1fr] bg-bg-tertiary/60 px-3 py-2 mono text-[0.65rem] uppercase tracking-wider text-ink-muted">
            <span>id 🔑</span><span>name</span><span>belt</span>
          </div>
          <AnimatePresence>
            {rows.map((r) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0, backgroundColor: flashColor(r.flash) }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-[60px_1fr_1fr] items-center border-t border-[var(--border-subtle)] px-3 py-2.5 text-sm"
              >
                <span className="mono text-neon-blue">{r.id}</span>
                <span className="text-white">{r.name}</span>
                <span className="mono text-xs text-ink-secondary">{r.belt}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {rows.length === 0 && <div className="px-3 py-4 text-center text-sm text-ink-muted">Empty table. Try INSERT 👆</div>}
        </div>
      </div>
    </div>
  );
}

function IndexDemo() {
  const [mode, setMode] = useState<"scan" | "index" | null>(null);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        { key: "scan", icon: Snail, title: "Without an index", color: "var(--neon-red)", steps: "Scan all 1,000,000 rows one by one 🐌", time: "~900ms" },
        { key: "index", icon: Zap, title: "With an index", color: "var(--neon-green)", steps: "Jump straight to the row ⚡", time: "~2ms" },
      ].map((x) => {
        const on = mode === x.key;
        const Icon = x.icon;
        return (
          <button
            key={x.key}
            onClick={() => setMode(x.key as "scan" | "index")}
            className={cn("card card-hover p-5 text-left transition")}
            style={{ borderColor: on ? x.color : undefined }}
          >
            <div className="flex items-center gap-2">
              <Icon size={20} style={{ color: x.color }} />
              <span className="font-display font-semibold text-white">{x.title}</span>
            </div>
            <p className="mt-2 text-sm text-ink-secondary">{x.steps}</p>
            {/* mini bar */}
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full"
                style={{ background: x.color }}
                initial={{ width: 0 }}
                animate={{ width: on ? (x.key === "scan" ? "100%" : "8%") : "0%" }}
                transition={{ duration: x.key === "scan" ? 1.3 : 0.3 }}
              />
            </div>
            <div className="mt-1.5 mono text-xs" style={{ color: x.color }}>{x.time}</div>
          </button>
        );
      })}
    </div>
  );
}

export default function Databases101Page() {
  return (
    <ConceptPage
      slug="databases-101"
      analogy={
        <FunnyAnalogy
          emoji="🗄️"
          color="var(--neon-green)"
          alternates={[
            { emoji: "📚", text: "A library: tables are shelves, rows are books, the index is the catalog that finds a book fast." },
            { emoji: "🧾", text: "A giant receipt book where every transaction is a numbered line you can look up." },
          ]}
        >
          A database is a <strong className="text-neon-green">massive Excel spreadsheet</strong> that a million
          people read at the same time without crashing… usually 😅. It stores data in tables of rows and
          columns, and lets you query it fast.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="CRUD" title="The four things you do to data">
          <p className="text-ink-secondary">
            Create, Read, Update, Delete — that&apos;s it. Every app is mostly CRUD wearing a fancy outfit.
            Push the buttons and watch the rows react:
          </p>
          <div className="mt-4"><CrudTable /></div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The magic trick" title="Indexes: from 🐌 to ⚡">
          <p className="text-ink-secondary">
            An index is like the index at the back of a book. Without it, the database reads <em>every single row</em>{" "}
            to find a match. With it, it jumps straight there. Click to compare:
          </p>
          <div className="mt-4"><IndexDemo /></div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Vocabulary" title="The core pieces">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { t: "Table", d: "A collection of rows about one thing (users, orders…).", c: "var(--neon-blue)" },
              { t: "Row", d: "A single record — one user, one order.", c: "var(--neon-green)" },
              { t: "Primary Key", d: "The unique id 🔑 that identifies each row.", c: "var(--neon-yellow)" },
              { t: "Index", d: "A lookup structure that makes searches blazing fast.", c: "var(--neon-purple)" },
            ].map((x) => (
              <div key={x.t} className="card p-4">
                <div className="font-display font-semibold" style={{ color: x.c }}>{x.t}</div>
                <p className="mt-1 text-sm text-ink-secondary">{x.d}</p>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="databases-101"
          questions={[
            {
              question: "What does the 'R' in CRUD stand for?",
              options: ["Remove", "Read", "Render", "Refresh"],
              correct: 1,
              explain: "Create, Read, Update, Delete. Read = SELECT in SQL.",
            },
            {
              question: "Why does an index make queries faster?",
              options: ["It compresses the data", "It lets the DB jump to rows instead of scanning all of them", "It deletes old rows", "It adds more servers"],
              correct: 1,
              explain: "Like a book's index, it avoids a full table scan of every row.",
            },
            {
              question: "A primary key must be…",
              options: ["A number", "Unique for each row", "The first column", "Encrypted"],
              correct: 1,
              explain: "The primary key uniquely identifies each row — no two rows share it.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
