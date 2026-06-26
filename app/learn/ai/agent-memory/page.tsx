"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, RotateCcw, StickyNote, Archive, Sparkles } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// ---------- Memory demo ----------
type Turn = { text: string; fact?: { k: string; v: string }; recall?: string };
const TURNS: Turn[] = [
  { text: "Hey, I'm Alex 👋", fact: { k: "name", v: "Alex" } },
  { text: "Heads up — I'm allergic to peanuts.", fact: { k: "allergy", v: "peanuts" } },
  { text: "I live in Berlin, by the way.", fact: { k: "city", v: "Berlin" } },
  { text: "What's a good workout split?" },
  { text: "Recommend something fun for the weekend." },
  { text: "Suggest a dinner recipe — anything I should skip?", recall: "allergy" },
];

const SHORT_TERM_CAP = 4;

function MemoryLab() {
  const [step, setStep] = useState(0);

  const sent = TURNS.slice(0, step);
  const shortTerm = sent.slice(-SHORT_TERM_CAP);
  const longTerm = useMemo(() => {
    const facts: { k: string; v: string }[] = [];
    sent.forEach((t) => { if (t.fact) facts.push(t.fact); });
    return facts;
  }, [sent]);

  const lastTurn = step > 0 ? TURNS[step - 1] : null;
  const recalledFact = lastTurn?.recall ? longTerm.find((f) => f.k === lastTurn.recall) : undefined;
  const droppedFromShortTerm = sent.length - shortTerm.length;

  const next = () => setStep((s) => Math.min(TURNS.length, s + 1));
  const reset = () => setStep(0);
  const atEnd = step >= TURNS.length;

  return (
    <div className="card p-5">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* short-term */}
        <div className="rounded-xl border border-neon-yellow/30 bg-neon-yellow/5 p-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-neon-yellow">
            <StickyNote size={15} /> Short-term (context window)
          </div>
          <p className="mt-0.5 text-[0.7rem] text-ink-muted">Last {SHORT_TERM_CAP} turns only — older ones fall off.</p>
          <div className="mt-2 space-y-1.5">
            <AnimatePresence initial={false}>
              {shortTerm.map((t) => (
                <motion.div
                  key={t.text}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg bg-bg-tertiary/70 px-2.5 py-1.5 text-xs text-white"
                >
                  {t.text}
                </motion.div>
              ))}
            </AnimatePresence>
            {shortTerm.length === 0 && <p className="py-3 text-center text-xs text-ink-muted">empty</p>}
          </div>
          {droppedFromShortTerm > 0 && (
            <p className="mt-2 text-[0.7rem] text-neon-red">⤵ {droppedFromShortTerm} older turn{droppedFromShortTerm > 1 ? "s" : ""} scrolled out of the window</p>
          )}
        </div>

        {/* long-term */}
        <div className="rounded-xl border border-neon-green/30 bg-neon-green/5 p-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-neon-green">
            <Archive size={15} /> Long-term (vector memory)
          </div>
          <p className="mt-0.5 text-[0.7rem] text-ink-muted">Facts extracted &amp; saved forever — recalled on demand.</p>
          <div className="mt-2 space-y-1.5">
            <AnimatePresence initial={false}>
              {longTerm.map((f) => (
                <motion.div
                  key={f.k}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 rounded-lg bg-bg-tertiary/70 px-2.5 py-1.5"
                  style={{ outline: recalledFact?.k === f.k ? "1.5px solid var(--neon-pink)" : undefined }}
                >
                  <span className="mono text-[0.6rem] uppercase tracking-wider text-ink-muted">{f.k}</span>
                  <span className="text-xs text-white">{f.v}</span>
                  {recalledFact?.k === f.k && <span className="ml-auto chip" style={{ borderColor: "var(--neon-pink)", color: "var(--neon-pink)" }}>recalled</span>}
                </motion.div>
              ))}
            </AnimatePresence>
            {longTerm.length === 0 && <p className="py-3 text-center text-xs text-ink-muted">nothing saved yet</p>}
          </div>
        </div>
      </div>

      {/* latest exchange */}
      <div className="mt-4 min-h-[58px] rounded-xl border border-[var(--border-subtle)] bg-bg-primary/40 p-3">
        <AnimatePresence mode="wait">
          {lastTurn ? (
            <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-sm text-white">🧑 {lastTurn.text}</div>
              {recalledFact && (
                <div className="mt-1.5 text-sm text-neon-pink">🤖 Got it — I&apos;ll avoid {recalledFact.v}, Alex. (Pulled from long-term memory, even though that turn left the window!)</div>
              )}
              {lastTurn.fact && (
                <div className="mt-1.5 text-xs text-neon-green">💾 Saved to long-term: {lastTurn.fact.k} = {lastTurn.fact.v}</div>
              )}
            </motion.div>
          ) : (
            <p className="text-sm text-ink-muted">Send messages one at a time. Watch facts persist to long-term as the early turns drop out of short-term.</p>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {!atEnd ? (
          <button onClick={next} className="btn-neon justify-center"><Send size={14} /> Send next message</button>
        ) : (
          <span className="chip" style={{ borderColor: "var(--neon-pink)", color: "var(--neon-pink)" }}>✓ recalled a fact from outside the window</span>
        )}
        <button onClick={reset} className="btn-ghost"><RotateCcw size={14} /> Reset</button>
        <span className="ml-auto mono text-xs text-ink-muted">{step}/{TURNS.length}</span>
      </div>
    </div>
  );
}

export default function AgentMemoryPage() {
  return (
    <ConceptPage
      slug="agent-memory"
      analogy={
        <FunnyAnalogy
          emoji="🧠"
          color="var(--neon-pink)"
          alternates={[
            { emoji: "🗒️", text: "Short-term memory is the sticky note on your monitor. Long-term is the filing cabinet you walk to when the note isn't enough." },
            { emoji: "🎬", text: "Like Memento: the agent's working memory wipes constantly, so important facts get tattooed somewhere permanent (the vector store)." },
          ]}
        >
          The context window is the agent&apos;s <strong className="text-neon-yellow">short-term memory</strong> — fast, but
          tiny and constantly overwritten. To remember across a long task (or across sessions), the agent writes
          important facts to a <strong className="text-neon-green">long-term store</strong> — usually a vector DB — and
          retrieves them by similarity when relevant. Beating the model&apos;s amnesia is half of agent engineering.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The problem" title="Goldfish brain, big ambitions">
          <p className="text-ink-secondary">
            An agent solving a long task takes dozens of steps — easily blowing past the context window. If it only had
            short-term memory, it would forget step 1 by step 20, repeat work, and lose the user&apos;s constraints. The fix
            is a memory hierarchy: keep the hot, recent stuff in context; offload the rest to storage and pull it back
            when needed.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Try it" title="Watch a fact survive the window">
          <MemoryLab />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The toolkit" title="Four kinds of memory">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: "📝", t: "Working memory", c: "var(--neon-yellow)", d: "The current context window: the scratchpad of recent thoughts, tool results, and the live task. Fast, small, volatile." },
              { emoji: "📚", t: "Episodic / semantic", c: "var(--neon-green)", d: "Facts & past events saved to a vector store, retrieved by similarity. 'What did the user tell me last week?'" },
              { emoji: "🗜️", t: "Summarization", c: "var(--neon-blue)", d: "When history gets long, compress old turns into a short summary to free up budget while keeping the gist." },
              { emoji: "📐", t: "Procedural", c: "var(--neon-purple)", d: "Learned skills & instructions — reusable procedures or prompt snippets the agent pulls in for known task types." },
            ].map((c) => (
              <div key={c.t} className="card p-4" style={{ borderColor: `${c.c}33` }}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{c.emoji}</span>
                  <span className="font-display font-semibold" style={{ color: c.c }}>{c.t}</span>
                </div>
                <p className="mt-1.5 text-sm text-ink-secondary">{c.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-neon-pink/30 bg-neon-pink/5 p-3">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-neon-pink" />
            <p className="text-sm text-ink-secondary">
              Notice it&apos;s the same machinery as <strong className="text-white">RAG</strong> — embed, store, retrieve by
              similarity. Long-term memory <em>is</em> RAG pointed at the agent&apos;s own history instead of a document corpus.
            </p>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="agent-memory"
          questions={[
            {
              question: "Why can't an agent just keep everything in its context window?",
              options: [
                "The window is unlimited",
                "The window is finite — long tasks overflow it, so older info gets dropped",
                "Context windows are illegal",
                "It would be too fast",
              ],
              correct: 1,
              explain: "Working memory is small and volatile. Long tasks need offloading to long-term storage.",
            },
            {
              question: "How does long-term agent memory typically work under the hood?",
              options: [
                "It prints everything to a log file",
                "Embed facts, store the vectors, and retrieve them by similarity when relevant — i.e. RAG",
                "It retrains the model",
                "It uses a bigger temperature",
              ],
              correct: 1,
              explain: "Long-term memory is RAG aimed at the agent's own history: embed, store, retrieve by similarity.",
            },
            {
              question: "What is 'summarization memory' for?",
              options: [
                "Making answers shorter for the user",
                "Compressing old conversation turns to free context budget while keeping the gist",
                "Translating to another language",
                "Counting tokens",
              ],
              correct: 1,
              explain: "Rolling summaries shrink long histories so the window doesn't overflow but key context survives.",
            },
            {
              question: "A fact the user mentioned 30 turns ago still gets used correctly. Most likely because…",
              options: [
                "The model memorized it during training",
                "It was saved to long-term memory and retrieved when relevant",
                "Luck",
                "The context window is infinite",
              ],
              correct: 1,
              explain: "If it scrolled out of the window, only long-term memory + retrieval can bring it back.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
