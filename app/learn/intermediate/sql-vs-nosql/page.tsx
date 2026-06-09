"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";

// --------------- SQL Schema Demo ---------------
const SQL_INITIAL_ROWS = [
  { id: 1, name: "Alice", email: "alice@dojo.io" },
  { id: 2, name: "Bob", email: "bob@dojo.io" },
  { id: 3, name: "Carol", email: "carol@dojo.io" },
];

type SqlRow = { id: number; name: string; email: string; twitter?: string };
type NoSqlDoc = { _id: string; name: string; email: string; [key: string]: unknown };

const NOSQL_INITIAL_DOCS: NoSqlDoc[] = [
  { _id: "u1", name: "Alice", email: "alice@dojo.io", age: 28 },
  { _id: "u2", name: "Bob", email: "bob@dojo.io", job: "Engineer" },
  { _id: "u3", name: "Carol", email: "carol@dojo.io", tags: ["admin", "vip"] },
];

function SplitSchemaDemo() {
  const [sqlRows, setSqlRows] = useState<SqlRow[]>(SQL_INITIAL_ROWS);
  const [noDocs, setNoDocs] = useState<NoSqlDoc[]>(NOSQL_INITIAL_DOCS);
  const [sqlAlert, setSqlAlert] = useState(false);
  const [sqlMigrating, setSqlMigrating] = useState(false);
  const [sqlDone, setSqlDone] = useState(false);

  const addField = () => {
    // SQL: show migration drama
    setSqlAlert(true);
    setSqlMigrating(false);
    setSqlDone(false);

    // NoSQL: instantly add field
    setNoDocs((docs) =>
      docs.map((d) => ({ ...d, twitter: `@${(d.name as string).toLowerCase()}` }))
    );
  };

  const confirmMigration = () => {
    setSqlAlert(false);
    setSqlMigrating(true);
    setTimeout(() => {
      setSqlRows((rows) =>
        rows.map((r) => ({ ...r, twitter: `@${r.name.toLowerCase()}` }))
      );
      setSqlMigrating(false);
      setSqlDone(true);
    }, 1800);
  };

  const reset = () => {
    setSqlRows(SQL_INITIAL_ROWS);
    setNoDocs(NOSQL_INITIAL_DOCS);
    setSqlAlert(false);
    setSqlMigrating(false);
    setSqlDone(false);
  };

  const hasTwitterSQL = sqlRows.some((r) => "twitter" in r);
  const hasTwitterNoSQL = Object.keys(noDocs[0]).includes("twitter");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={addField}
          disabled={hasTwitterSQL && hasTwitterNoSQL}
          className="btn-neon gap-2"
        >
          <Plus size={15} /> Add &ldquo;twitter&rdquo; field
        </button>
        {(hasTwitterSQL || hasTwitterNoSQL || sqlAlert) && (
          <button onClick={reset} className="btn-ghost text-sm">
            Reset
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* SQL Side */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-bg-tertiary/60 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-neon-blue" />
            <span className="mono text-xs font-semibold text-neon-blue">SQL · users table</span>
          </div>

          <AnimatePresence>
            {sqlAlert && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-3 border-b border-neon-yellow/30 bg-neon-yellow/10 p-3">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-neon-yellow" />
                  <div className="text-xs">
                    <p className="font-semibold text-neon-yellow">Migration required!</p>
                    <p className="mt-0.5 text-ink-secondary">
                      ALTER TABLE users ADD COLUMN twitter VARCHAR(50);
                      <br />
                      This will lock the table for ~3 minutes on production 🙃
                    </p>
                    <button
                      onClick={confirmMigration}
                      className="mt-2 rounded-lg border border-neon-yellow/50 px-3 py-1 text-xs text-neon-yellow hover:bg-neon-yellow/10"
                    >
                      Run migration
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {sqlMigrating && (
            <div className="border-b border-neon-yellow/30 bg-bg-tertiary/40 px-4 py-2">
              <div className="flex items-center gap-2 text-xs text-neon-yellow">
                <motion.div
                  className="h-3 w-3 rounded-full border-2 border-neon-yellow border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                Running migration... locking table...
              </div>
            </div>
          )}

          {sqlDone && (
            <div className="flex items-center gap-2 border-b border-neon-green/30 bg-neon-green/10 px-4 py-2">
              <CheckCircle size={14} className="text-neon-green" />
              <span className="text-xs text-neon-green">Migration complete. Table unlocked.</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full mono text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-bg-tertiary/40">
                  <th className="px-3 py-2 text-left text-ink-muted">id</th>
                  <th className="px-3 py-2 text-left text-ink-muted">name</th>
                  <th className="px-3 py-2 text-left text-ink-muted">email</th>
                  <AnimatePresence>
                    {hasTwitterSQL && (
                      <motion.th
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        className="px-3 py-2 text-left text-neon-green"
                      >
                        twitter
                      </motion.th>
                    )}
                  </AnimatePresence>
                </tr>
              </thead>
              <tbody>
                {sqlRows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border-subtle)]/50">
                    <td className="px-3 py-2 text-ink-muted">{row.id}</td>
                    <td className="px-3 py-2 text-white">{row.name}</td>
                    <td className="px-3 py-2 text-ink-secondary">{row.email}</td>
                    {hasTwitterSQL && (
                      <motion.td
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-3 py-2 text-neon-green"
                      >
                        {row.twitter ?? <span className="text-ink-muted">NULL</span>}
                      </motion.td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* NoSQL Side */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-bg-tertiary/60 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-neon-orange" />
            <span className="mono text-xs font-semibold text-neon-orange">NoSQL · users collection</span>
          </div>
          <div className="space-y-2 p-4">
            {noDocs.map((doc) => (
              <motion.div
                key={doc._id as string}
                layout
                className="rounded-xl border border-[var(--border-subtle)] bg-bg-tertiary/40 p-3 mono text-xs"
              >
                <span className="text-neon-orange">{"{"}</span>
                <div className="ml-4 space-y-0.5">
                  {Object.entries(doc).map(([k, v]) => (
                    <motion.div
                      key={k}
                      initial={k === "twitter" ? { opacity: 0, x: -8 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      className={k === "twitter" && hasTwitterNoSQL ? "text-neon-green" : ""}
                    >
                      <span className="text-neon-blue">&quot;{k}&quot;</span>
                      <span className="text-ink-muted">: </span>
                      <span className="text-neon-yellow">
                        {JSON.stringify(v)}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <span className="text-neon-orange">{"}"}</span>
              </motion.div>
            ))}
          </div>
          {hasTwitterNoSQL && !hasTwitterSQL && (
            <div className="flex items-center gap-2 border-t border-neon-green/30 bg-neon-green/10 px-4 py-2">
              <CheckCircle size={14} className="text-neon-green" />
              <span className="text-xs text-neon-green">Added instantly — no migration needed!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --------------- Decision Tree ---------------
type Question = {
  text: string;
  yes: string | "SQL" | "NoSQL";
  no: string | "SQL" | "NoSQL";
};

const TREE: Record<string, Question> = {
  start: { text: "Do you need complex JOINs across related tables?", yes: "SQL", no: "q2" },
  q2: { text: "Is your schema flexible / evolving rapidly?", yes: "NoSQL", no: "q3" },
  q3: { text: "Do you need ACID transactions (banking, orders)?", yes: "SQL", no: "q4" },
  q4: { text: "Massive horizontal scale (millions of writes/sec)?", yes: "NoSQL", no: "SQL" },
};

function DecisionTree() {
  const [node, setNode] = useState<string>("start");
  const [path, setPath] = useState<string[]>([]);
  const result = node === "SQL" || node === "NoSQL" ? node : null;

  const choose = (answer: string) => {
    const q = TREE[node];
    if (!q) return;
    const next = answer === "yes" ? q.yes : q.no;
    setPath((p) => [...p, `${q.text} → ${answer}`]);
    setNode(next);
  };

  const restart = () => { setNode("start"); setPath([]); };

  return (
    <div className="card p-5">
      <div className="mono mb-3 text-[0.65rem] uppercase tracking-[0.25em] text-neon-purple">
        Interactive Decision Tree
      </div>

      {path.length > 0 && (
        <div className="mb-4 space-y-1">
          {path.map((p, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-ink-muted">
              <ChevronRight size={13} className="mt-0.5 shrink-0 text-neon-purple/60" />
              {p}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl p-5 text-center"
            style={{
              background: result === "SQL" ? "rgba(0,212,255,0.08)" : "rgba(255,140,0,0.08)",
              border: `2px solid ${result === "SQL" ? "var(--neon-blue)" : "var(--neon-orange)"}40`,
            }}
          >
            <div className="text-3xl mb-2">{result === "SQL" ? "🗃️" : "📄"}</div>
            <div
              className="font-display text-2xl font-extrabold"
              style={{ color: result === "SQL" ? "var(--neon-blue)" : "var(--neon-orange)" }}
            >
              Go with {result}
            </div>
            <p className="mt-1 text-sm text-ink-secondary">
              {result === "SQL"
                ? "Relational data, strict schema, and ACID compliance — SQL is your friend."
                : "Flexible schema, horizontal scale, and document-style data — NoSQL has you covered."}
            </p>
            <button onClick={restart} className="btn-ghost mt-3 text-sm">
              Start over
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={node}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <p className="mb-4 text-white">{TREE[node]?.text}</p>
            <div className="flex gap-3">
              <button
                onClick={() => choose("yes")}
                className="flex-1 rounded-xl border border-neon-green/40 bg-neon-green/10 py-2 text-sm text-neon-green hover:bg-neon-green/20 transition"
              >
                ✓ Yes
              </button>
              <button
                onClick={() => choose("no")}
                className="flex-1 rounded-xl border border-neon-red/40 bg-neon-red/10 py-2 text-sm text-neon-red hover:bg-neon-red/20 transition"
              >
                ✗ No
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --------------- DB Type Cards ---------------
const DB_TYPES = [
  {
    type: "Document",
    emoji: "📄",
    example: "MongoDB, Firestore",
    color: "var(--neon-orange)",
    desc: "JSON-like docs, flexible schema. Great for catalogs, user profiles, CMS.",
  },
  {
    type: "Key-Value",
    emoji: "🔑",
    example: "Redis, DynamoDB",
    color: "var(--neon-yellow)",
    desc: "Ultra-fast lookups by key. Sessions, caches, feature flags.",
  },
  {
    type: "Column-Family",
    emoji: "📊",
    example: "Cassandra, HBase",
    color: "var(--neon-purple)",
    desc: "Columns grouped into families. Time-series, IoT, analytics at scale.",
  },
  {
    type: "Graph",
    emoji: "🕸️",
    example: "Neo4j, Neptune",
    color: "var(--neon-green)",
    desc: "Nodes & edges. Social networks, fraud detection, recommendations.",
  },
];

export default function SqlVsNoSqlPage() {
  return (
    <ConceptPage
      slug="sql-vs-nosql"
      analogy={
        <FunnyAnalogy
          emoji="🗂️"
          color="var(--neon-blue)"
          alternates={[
            {
              emoji: "📋",
              text: "SQL is a spreadsheet enforced by the government. NoSQL is a sticky note on your monitor — anything goes.",
            },
            {
              emoji: "🧱",
              text: "SQL = LEGO bricks (fixed shapes, snap perfectly). NoSQL = Play-Doh (anything goes, usually looks like chaos).",
            },
          ]}
        >
          SQL is a <strong className="text-neon-blue">picky German engineer</strong> who insists every
          screw be a specific size before assembly. NoSQL is a <strong className="text-neon-orange">
          startup founder</strong> who yells &ldquo;ship it, we&apos;ll figure out the schema later!&rdquo;
          Both are right — depending on the project.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The face-off" title="SQL vs NoSQL — the battle">
          <ComparisonBattle
            left={{ name: "SQL", emoji: "🗃️", color: "var(--neon-blue)", bestFor: "Complex relations, ACID transactions, strict schema — banking, e-commerce, ERPs." }}
            right={{ name: "NoSQL", emoji: "📄", color: "var(--neon-orange)", bestFor: "Flexible schema, horizontal scale, fast iteration — social, IoT, real-time feeds." }}
            features={[
              { label: "Schema", a: "Rigid", b: "Flexible", winner: "b" },
              { label: "ACID", a: "Full", b: "Partial", winner: "a" },
              { label: "Horizontal scale", a: 4, b: 9, max: 10, winner: "b" },
              { label: "Query power", a: 9, b: 5, max: 10, winner: "a" },
              { label: "Write speed", a: 6, b: 9, max: 10, winner: "b" },
              { label: "JOINs", a: "Native", b: "Manual", winner: "a" },
              { label: "Maturity", a: "50 years", b: "15 years", winner: "a" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="See it live" title="Add a field — feel the pain (or joy)">
          <p className="mb-4 text-ink-secondary">
            Hit &ldquo;Add twitter field&rdquo; and watch how each database type handles a schema change.
            SQL needs a migration; NoSQL doesn&apos;t even notice.
          </p>
          <SplitSchemaDemo />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The shape of scale" title="Why they grow differently">
          <p className="mb-4 text-ink-secondary">
            The deepest difference isn&apos;t syntax — it&apos;s <em>topology</em>.{" "}
            <strong className="text-neon-green">SQL</strong> centralizes: one primary with read replicas, so it can
            JOIN and guarantee ACID. <strong className="text-neon-purple">NoSQL</strong> spreads data across many
            equal nodes by a shard key — near-infinite scale, but no cross-node joins. Click each box.
          </p>
          <AnimatedDiagram
            height={360}
            nodes={[
              { id: "app", type: "server", label: "App", position: { x: 8, y: 50 }, status: "busy", info: "The same app could use either. The choice is about how the data layer underneath it grows." },
              { id: "sqlp", type: "database", label: "SQL Primary", position: { x: 42, y: 20 }, status: "active", info: "One authoritative node. Enforces a schema, foreign keys, JOINs, and ACID transactions. Scales UP (bigger box)." },
              { id: "sqlr", type: "database", label: "Read Replica", position: { x: 74, y: 20 }, status: "active", info: "Adds read capacity, but writes still funnel through the single primary — the eventual ceiling." },
              { id: "n1", type: "database", label: "Shard A–H", position: { x: 42, y: 80 }, status: "active", info: "NoSQL node owning keys A–H. No schema enforced; each document/row self-contained (no joins needed)." },
              { id: "n2", type: "database", label: "Shard I–P", position: { x: 61, y: 80 }, status: "active", info: "Another equal node. Writes scale because they spread across shards — add nodes to add capacity." },
              { id: "n3", type: "database", label: "Shard Q–Z", position: { x: 80, y: 80 }, status: "active", info: "Scales OUT to hundreds of nodes. Trade-off: no cross-shard JOINs and usually eventual consistency." },
            ]}
            edges={[
              { from: "app", to: "sqlp", animated: true, color: "var(--neon-green)", label: "JOINs · ACID" },
              { from: "sqlp", to: "sqlr", dashed: true, label: "replicate" },
              { from: "app", to: "n1", animated: true, color: "var(--neon-purple)", label: "shard by key" },
              { from: "app", to: "n2", animated: true, color: "var(--neon-purple)" },
              { from: "app", to: "n3", animated: true, color: "var(--neon-purple)" },
            ]}
          />
          <p className="mt-3 text-xs text-ink-muted">Tip: pick SQL when relationships and correctness matter (orders, payments); pick NoSQL when scale and flexible shape matter more than joins (feeds, logs, sessions).</p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Pick your weapon" title="Decision tree">
          <DecisionTree />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="NoSQL flavors" title="Four database types, decoded">
          <div className="grid gap-3 sm:grid-cols-2">
            {DB_TYPES.map((db) => (
              <motion.div
                key={db.type}
                whileHover={{ scale: 1.02 }}
                className="card p-4"
                style={{ borderColor: `${db.color}30` }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{db.emoji}</span>
                  <div>
                    <div className="font-display font-bold" style={{ color: db.color }}>
                      {db.type}
                    </div>
                    <div className="mono text-[0.65rem] text-ink-muted">{db.example}</div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-ink-secondary">{db.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="sql-vs-nosql"
          questions={[
            {
              question: "Which property does SQL guarantee that most NoSQL databases sacrifice for speed?",
              options: ["Horizontal scaling", "ACID transactions", "Flexible schema", "Key-value lookups"],
              correct: 1,
              explain: "SQL databases guarantee Atomicity, Consistency, Isolation, and Durability. Most NoSQL trades some of this for scale and speed.",
            },
            {
              question: "You&apos;re building a social network with evolving user profiles. Which is better?",
              options: ["SQL — for strict schemas", "NoSQL — for flexible documents", "Spreadsheets", "Just use localStorage"],
              correct: 1,
              explain: "Flexible, evolving schemas are NoSQL&apos;s home turf. Profiles can have wildly different fields per user.",
            },
            {
              question: "Which NoSQL type is best for detecting fraud patterns in a financial network?",
              options: ["Key-Value (Redis)", "Column-Family (Cassandra)", "Graph (Neo4j)", "Document (MongoDB)"],
              correct: 2,
              explain: "Graph databases model relationships natively — perfect for traversing connections to find suspicious patterns.",
            },
            {
              question: "Adding a new column to a SQL table in production can be dangerous because…",
              options: ["SQL doesn&apos;t support new columns", "It may require a table lock and long-running migration", "NoSQL will block it", "It always deletes existing data"],
              correct: 1,
              explain: "ALTER TABLE on large tables can lock writes for minutes or hours — use tools like gh-ost or pt-online-schema-change in production.",
            },
            {
              question: "Which type of NoSQL is Redis?",
              options: ["Document", "Column-Family", "Graph", "Key-Value"],
              correct: 3,
              explain: "Redis is the king of key-value stores — blazing fast in-memory lookups with optional persistence.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
