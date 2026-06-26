"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// ---------- Context window budget visualizer ----------
const BUDGET = 8000; // tokens
const RESERVED = 900; // for the model's reply
const COST = { system: 300, tools: 1200, fewshot: 1000, rag: 2600, turn: 480 };

function ContextBudgetLab() {
  const [tools, setTools] = useState(false);
  const [fewshot, setFewshot] = useState(false);
  const [rag, setRag] = useState(true);
  const [turns, setTurns] = useState(3);

  const fixed = COST.system + (tools ? COST.tools : 0) + (fewshot ? COST.fewshot : 0) + (rag ? COST.rag : 0);
  const roomForHistory = BUDGET - RESERVED - fixed;
  const keptTurns = Math.max(0, Math.min(turns, Math.floor(roomForHistory / COST.turn)));
  const droppedTurns = turns - keptTurns;
  const historyTokens = keptTurns * COST.turn;
  const used = fixed + historyTokens;
  const overflowing = droppedTurns > 0;

  const segs = [
    { key: "system", label: "System prompt", tokens: COST.system, color: "var(--neon-blue)" },
    ...(tools ? [{ key: "tools", label: "Tool schemas", tokens: COST.tools, color: "var(--neon-orange)" }] : []),
    ...(fewshot ? [{ key: "fewshot", label: "Few-shot examples", tokens: COST.fewshot, color: "var(--neon-yellow)" }] : []),
    ...(rag ? [{ key: "rag", label: "Retrieved docs (RAG)", tokens: COST.rag, color: "var(--neon-green)" }] : []),
    { key: "history", label: `Chat history (${keptTurns} turns)`, tokens: historyTokens, color: "var(--neon-pink)" },
  ];

  const Toggle = ({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) => (
    <button
      onClick={() => set(!on)}
      className="chip transition"
      style={on ? { borderColor: "var(--neon-pink)", color: "var(--neon-pink)", background: "rgba(255,59,107,0.1)" } : undefined}
    >
      {on ? "✓ " : "+ "}{label}
    </button>
  );

  return (
    <div className="card p-5">
      {/* the budget bar */}
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="mono text-ink-secondary">context window · {BUDGET.toLocaleString()} tokens</span>
        <span className="mono font-bold" style={{ color: used > BUDGET - RESERVED ? "var(--neon-red)" : "var(--neon-green)" }}>
          {used.toLocaleString()} used
        </span>
      </div>
      <div className="flex h-9 w-full overflow-hidden rounded-lg bg-white/5">
        {segs.map((s) => (
          <motion.div
            key={s.key}
            className="h-full"
            initial={false}
            animate={{ width: `${(s.tokens / BUDGET) * 100}%` }}
            transition={{ type: "spring", stiffness: 140, damping: 20 }}
            style={{ background: s.color, opacity: 0.85 }}
            title={`${s.label}: ${s.tokens} tokens`}
          />
        ))}
        {/* reserved-for-reply ghost */}
        <div
          className="h-full border-l border-dashed border-white/30"
          style={{ width: `${(RESERVED / BUDGET) * 100}%`, background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 4px, transparent 4px, transparent 8px)" }}
          title="reserved for the reply"
        />
      </div>
      {/* legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {segs.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-ink-secondary">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            {s.label} <span className="mono text-ink-muted">{s.tokens}</span>
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-ink-muted">
          <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-white/40" /> reply buffer {RESERVED}
        </span>
      </div>

      {/* controls */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Toggle on={tools} set={setTools} label="Tools" />
        <Toggle on={fewshot} set={setFewshot} label="Few-shot" />
        <Toggle on={rag} set={setRag} label="RAG docs" />
        <span className="mx-1 h-5 w-px bg-white/10" />
        <button onClick={() => setTurns((t) => t + 1)} className="btn-ghost px-3 py-1.5 text-xs">
          <Plus size={13} /> Add chat turn
        </button>
        <button onClick={() => setTurns((t) => Math.max(0, t - 1))} className="btn-ghost px-3 py-1.5 text-xs" disabled={turns === 0}>
          <Trash2 size={13} /> Remove
        </button>
        <span className="mono text-xs text-ink-secondary">{turns} turns requested</span>
      </div>

      <AnimatePresence>
        {overflowing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-neon-red/40 bg-neon-red/5 p-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-neon-red" />
              <p className="text-sm text-ink-secondary">
                <span className="font-semibold text-neon-red">Overflow!</span> The oldest{" "}
                <span className="mono text-white">{droppedTurns}</span> turn{droppedTurns > 1 ? "s" : ""} got dropped to
                fit. This is why a long chat &quot;forgets&quot; how it started — and why dumping huge RAG results can quietly
                evict the actual conversation.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ROLES = [
  { role: "system", color: "var(--neon-blue)", desc: "The rules & persona. Set once, applies to everything. 'You are a terse senior engineer.'" },
  { role: "user", color: "var(--neon-pink)", desc: "What the human actually asked. The request the model must serve." },
  { role: "assistant", color: "var(--neon-green)", desc: "The model's own past replies — fed back in so the conversation has continuity." },
];

export default function PromptingContextPage() {
  return (
    <ConceptPage
      slug="prompting-context"
      analogy={
        <FunnyAnalogy
          emoji="🐠"
          color="var(--neon-pink)"
          alternates={[
            { emoji: "📋", text: "It's a contractor with total amnesia. Every request, you re-hand them the entire clipboard — the brief, the rules, and everything said so far." },
            { emoji: "🎬", text: "Like an actor who only knows the script pages in their hand. Off the page? They'll improvise (and maybe make it up)." },
          ]}
        >
          Here&apos;s the plot twist: the model has <strong className="text-neon-pink">no memory</strong>. Between two
          messages it forgets everything. The only thing it ever sees is the <strong className="text-neon-purple">context
          window</strong> — the chunk of text you hand it <em>this</em> turn. Prompting is the art of packing that limited
          window with exactly what it needs, and nothing that wastes space.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The mental model" title="The context window is the whole world">
          <p className="text-ink-secondary">
            Every API call is stateless. To continue a conversation, the app re-sends the <em>entire</em> relevant
            history each time. The model reads that text, predicts a reply, and forgets it all. So three things matter
            enormously: <strong className="text-white">what you put in</strong>, <strong className="text-white">how
            much fits</strong>, and <strong className="text-white">what gets cut when it doesn&apos;t</strong>.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Anatomy" title="The three roles in a prompt">
          <div className="grid gap-3 sm:grid-cols-3">
            {ROLES.map((r) => (
              <div key={r.role} className="card p-4" style={{ borderColor: `${r.color}40` }}>
                <span className="chip" style={{ borderColor: r.color, color: r.color }}>{r.role}</span>
                <p className="mt-2 text-sm text-ink-secondary">{r.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink-secondary">
            A chat is just this list, replayed and growing: <span className="mono text-neon-blue">system</span> →{" "}
            <span className="mono text-neon-pink">user</span> → <span className="mono text-neon-green">assistant</span> →{" "}
            <span className="mono text-neon-pink">user</span> → … The model can&apos;t tell the difference between &quot;real&quot;
            history and history you fabricated — which is exactly how few-shot examples trick it into a format.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Try it" title="Budget the window before it overflows">
          <p className="mb-4 text-ink-secondary">
            Everything competes for the same fixed budget: instructions, tool definitions, examples, retrieved
            documents, chat history, <em>and</em> room left over for the reply. Toggle pieces on and pile up chat
            turns — watch what gets evicted.
          </p>
          <ContextBudgetLab />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Pro moves" title="Prompting tactics that actually move the needle">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: "🎯", t: "Be specific about the output", d: "Ask for the format you want: JSON, a table, 3 bullets. Vague in, vague out." },
              { emoji: "📚", t: "Few-shot examples", d: "Show 2–3 input→output pairs. The model copies the pattern far better than it follows a description." },
              { emoji: "🪜", t: "Let it think step by step", d: "For reasoning, asking it to work through steps before answering measurably improves accuracy." },
              { emoji: "🧹", t: "Mind 'context rot'", d: "More context isn't always better. Irrelevant or stale text buried in a huge window degrades answers. Curate, don't hoard." },
            ].map((c) => (
              <div key={c.t} className="card p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{c.emoji}</span>
                  <span className="font-display font-semibold text-white">{c.t}</span>
                </div>
                <p className="mt-1.5 text-sm text-ink-secondary">{c.d}</p>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="prompting-context"
          questions={[
            {
              question: "Why does an app re-send the whole conversation on every API call?",
              options: [
                "To waste tokens on purpose",
                "Because the model is stateless — it only knows what's in the current context window",
                "For security",
                "To make the bill bigger",
              ],
              correct: 1,
              explain: "The model has no memory between calls. The context window is the only state it ever sees.",
            },
            {
              question: "Your chat 'forgets' how it started after many turns. Most likely cause?",
              options: [
                "A bug in the model",
                "Old turns were truncated to fit the context window",
                "The internet disconnected",
                "Temperature was too high",
              ],
              correct: 1,
              explain: "When history + everything else exceeds the window, the oldest turns get dropped to make room.",
            },
            {
              question: "What does the 'system' role do?",
              options: [
                "Stores the model's long-term memory",
                "Sets the persona and rules that apply to the whole conversation",
                "Runs background tasks",
                "Counts tokens",
              ],
              correct: 1,
              explain: "The system prompt sets behavior and constraints up front — it frames everything that follows.",
            },
            {
              question: "Which usually improves a tricky answer the most?",
              options: [
                "Cramming in as much unrelated context as possible",
                "Giving a couple of concrete few-shot examples of the desired output",
                "Using ALL CAPS",
                "Asking the same thing twice",
              ],
              correct: 1,
              explain: "Few-shot examples teach the pattern directly. More context isn't free — irrelevant text causes 'context rot'.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
