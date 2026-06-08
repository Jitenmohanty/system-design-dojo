"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComparePageShell, CompareSection } from "@/components/compare/ComparePageShell";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";

const BLUE = "var(--neon-blue)";
const ORANGE = "var(--neon-orange)";

const QUESTIONS = [
  { q: "Is your data highly relational (lots of joins)?", yes: "sql", no: "next" },
  { q: "Do you need flexible/changing schemas?", yes: "nosql", no: "next" },
  { q: "Do you need massive horizontal write scale?", yes: "nosql", no: "sql" },
];

function DecisionTree() {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<"sql" | "nosql" | null>(null);

  const answer = (ans: "yes" | "no") => {
    const node = QUESTIONS[step];
    const target = ans === "yes" ? node.yes : node.no;
    if (target === "sql" || target === "nosql") setResult(target);
    else if (step + 1 < QUESTIONS.length) setStep(step + 1);
    else setResult("sql");
  };
  const reset = () => { setStep(0); setResult(null); };

  return (
    <div className="card p-6 text-center">
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="r" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-4xl">{result === "sql" ? "🗄️" : "📦"}</div>
            <div className="mt-2 font-display text-2xl font-bold" style={{ color: result === "sql" ? BLUE : ORANGE }}>
              Go with {result === "sql" ? "SQL" : "NoSQL"}
            </div>
            <p className="mt-1 text-sm text-ink-secondary">
              {result === "sql" ? "Relational integrity and rich queries win here." : "Flexibility and scale-out win here."}
            </p>
            <button onClick={reset} className="btn-ghost mt-4">Start over</button>
          </motion.div>
        ) : (
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="mono text-xs text-ink-muted">Question {step + 1} of {QUESTIONS.length}</div>
            <p className="mt-2 text-lg text-white">{QUESTIONS[step].q}</p>
            <div className="mt-4 flex justify-center gap-3">
              <button onClick={() => answer("yes")} className="btn-neon">Yes</button>
              <button onClick={() => answer("no")} className="btn-ghost">No</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SchemaDemo() {
  const [added, setAdded] = useState(false);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card p-4">
        <div className="mono text-xs text-neon-blue">SQL — users table</div>
        <div className="mt-2 overflow-hidden rounded-lg border border-[var(--border-subtle)] mono text-xs">
          <div className="grid grid-cols-3 bg-bg-tertiary/60 px-2 py-1.5 text-ink-muted">
            <span>id</span><span>name</span><span>email{added && " · phone"}</span>
          </div>
          <div className="grid grid-cols-3 border-t border-[var(--border-subtle)] px-2 py-1.5">
            <span className="text-neon-blue">1</span><span>Neo</span><span className="truncate">neo@…{added && " · ⚠️"}</span>
          </div>
        </div>
        <AnimatePresence>
          {added && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
              <div className="mt-2 rounded-lg border border-neon-red/40 bg-neon-red/10 p-2 text-xs text-neon-red">
                ⚠️ ALTER TABLE migration required — every existing row needs the new column. Lock the table, run carefully.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="card p-4">
        <div className="mono text-xs text-neon-orange">NoSQL — users collection</div>
        <pre className="mt-2 rounded-lg border border-[var(--border-subtle)] bg-bg-tertiary/40 p-2 mono text-xs text-ink-primary">
{`{ "id": 1, "name": "Neo",
  "email": "neo@…"`}{added ? `,
  "phone": "+1…" }` : ` }`}
        </pre>
        <AnimatePresence>
          {added && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
              <div className="mt-2 rounded-lg border border-neon-green/40 bg-neon-green/10 p-2 text-xs text-neon-green">
                ✅ Just add the field to new docs. Old docs simply don&apos;t have it. No migration.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button onClick={() => setAdded((a) => !a)} className="btn-neon col-span-full justify-center">
        {added ? "↺ Reset" : "+ Add a 'phone' field"}
      </button>
    </div>
  );
}

export default function SqlVsNoSql() {
  return (
    <ComparePageShell
      emoji="🗄️"
      title={<><span style={{ color: BLUE }}>SQL</span> vs <span style={{ color: ORANGE }}>NoSQL</span></>}
      subtitle="The oldest database debate, settled (mostly) by your access patterns."
      verdict={
        <p>
          There&apos;s no universal winner. Choose <strong style={{ color: BLUE }}>SQL</strong> when your data is
          relational, you need transactions/ACID, and your schema is stable (banking, orders, inventory). Choose{" "}
          <strong style={{ color: ORANGE }}>NoSQL</strong> when you need flexible schemas, massive write throughput,
          or specific data models (documents, key-value, graphs). Many real systems use both — SQL for the source of
          truth, NoSQL for scale-out reads, caching, and search.
        </p>
      }
    >
      <CompareSection title="Round-by-round">
        <ComparisonBattle
          left={{ name: "SQL", emoji: "🗄️", color: BLUE, bestFor: "Relational data, transactions, complex queries, strong consistency." }}
          right={{ name: "NoSQL", emoji: "📦", color: ORANGE, bestFor: "Flexible schemas, horizontal scale, huge write volumes, varied data models." }}
          features={[
            { label: "Schema", a: "Rigid", b: "Flexible", winner: "tie" },
            { label: "Joins", a: "Native", b: "Manual", winner: "a" },
            { label: "ACID txns", a: "Strong", b: "Varies", winner: "a" },
            { label: "Horizontal scale", a: 6, b: 10, max: 10, winner: "b" },
            { label: "Write throughput", a: 6, b: 9, max: 10, winner: "b" },
            { label: "Query power", a: 10, b: 6, max: 10, winner: "a" },
            { label: "Consistency", a: 9, b: 6, max: 10, winner: "a" },
            { label: "Learning curve", a: "Familiar", b: "It depends", winner: "a" },
          ]}
        />
      </CompareSection>

      <CompareSection title="The schema-change test">
        <p className="mb-4 text-ink-secondary">Add a field to an existing record. Watch how each side reacts:</p>
        <SchemaDemo />
      </CompareSection>

      <CompareSection title="The four flavors of NoSQL">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { t: "Document", d: "JSON-like docs. MongoDB, Couchbase. Great for nested objects.", c: ORANGE },
            { t: "Key-Value", d: "Simple, blazing fast. Redis, DynamoDB. Great for caching & sessions.", c: "var(--neon-red)" },
            { t: "Column-Family", d: "Wide rows. Cassandra, HBase. Great for time-series at scale.", c: "var(--neon-purple)" },
            { t: "Graph", d: "Nodes & edges. Neo4j. Great for relationships & recommendations.", c: "var(--neon-green)" },
          ].map((x) => (
            <div key={x.t} className="card p-4">
              <div className="font-display font-semibold" style={{ color: x.c }}>{x.t}</div>
              <p className="mt-1 text-sm text-ink-secondary">{x.d}</p>
            </div>
          ))}
        </div>
      </CompareSection>

      <CompareSection title="Which should you use?">
        <DecisionTree />
      </CompareSection>
    </ComparePageShell>
  );
}
