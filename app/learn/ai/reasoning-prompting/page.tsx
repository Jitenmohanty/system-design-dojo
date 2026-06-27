"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";

// ---------- Direct vs Chain-of-Thought demo ----------
const STEPS = [
  "The cafe sold 3 boxes of 12 muffins = 36 muffins.",
  "They started the day with 50 muffins.",
  "50 − 36 = 14 muffins left… but 5 were burnt and thrown out.",
  "14 − 5 = 9 muffins remaining.",
];

function CoTDemo() {
  const [showReasoning, setShowReasoning] = useState(false);

  return (
    <div className="card p-5">
      <div className="rounded-xl bg-bg-tertiary/60 p-3 text-sm text-white">
        <span className="mono text-[0.65rem] uppercase tracking-wider text-neon-pink">Question</span>
        <p className="mt-1">A cafe starts with 50 muffins, sells 3 boxes of 12, then bins 5 burnt ones. How many are left?</p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => setShowReasoning(false)} className="chip transition" style={!showReasoning ? { borderColor: "var(--neon-red)", color: "var(--neon-red)", background: "rgba(255,51,102,0.1)" } : undefined}>⚡ Answer directly</button>
        <button onClick={() => setShowReasoning(true)} className="chip transition" style={showReasoning ? { borderColor: "var(--neon-green)", color: "var(--neon-green)", background: "rgba(0,255,136,0.1)" } : undefined}>🪜 Think step by step</button>
      </div>

      <div className="mt-3 min-h-[120px] rounded-xl border border-[var(--border-subtle)] bg-bg-primary/40 p-3">
        <AnimatePresence mode="wait">
          {!showReasoning ? (
            <motion.div key="direct" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="mono text-[0.65rem] uppercase tracking-wider text-neon-red">Direct answer (no reasoning)</span>
              <p className="mt-2 text-lg font-bold text-neon-red">&quot;14 muffins.&quot; ❌</p>
              <p className="mt-1 text-xs text-ink-muted">Blurted the first plausible number and forgot the burnt 5. Skipping the work is how models fumble multi-step problems.</p>
            </motion.div>
          ) : (
            <motion.div key="cot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="mono text-[0.65rem] uppercase tracking-wider text-neon-green">Chain of thought</span>
              <div className="mt-2 space-y-1.5">
                {STEPS.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.25 }} className="flex gap-2 text-sm text-ink-secondary">
                    <span className="mono text-neon-green">{i + 1}.</span> {s}
                  </motion.div>
                ))}
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: STEPS.length * 0.25 }} className="pt-1 text-lg font-bold text-neon-green">&quot;9 muffins.&quot; ✅</motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        Same model, same question. Writing the steps out gives it room to compute each piece instead of guessing the
        final number in one shot. Reasoning is just <em>more tokens spent thinking before answering</em>.
      </p>
    </div>
  );
}

export default function ReasoningPromptingPage() {
  return (
    <ConceptPage
      slug="reasoning-prompting"
      analogy={
        <FunnyAnalogy
          emoji="🧮"
          color="var(--neon-pink)"
          alternates={[
            { emoji: "✍️", text: "Like a math teacher demanding you 'show your work' — not to be annoying, but because writing the steps is what prevents the silly mistake." },
            { emoji: "🗺️", text: "Blurting an answer is guessing the destination. Reasoning is actually tracing the route — you catch the wrong turn before you arrive." },
          ]}
        >
          An LLM picks each token in a flash — great for trivia, terrible for anything multi-step. The fix is to make it
          <strong className="text-neon-pink"> think on paper</strong>: spend tokens reasoning through the problem before
          committing to an answer. &quot;Let&apos;s think step by step&quot; isn&apos;t a magic spell — it literally gives the model
          space to work, and it measurably boosts accuracy on math, logic, and planning.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The core idea" title="Tokens are the model's scratch paper">
          <p className="text-ink-secondary">
            Because the model generates one token at a time, every token it writes becomes context for the next. Force
            it to answer immediately and it has done zero computation. Let it narrate its reasoning first and each step
            builds on the last — it can carry intermediate results, catch contradictions, and arrive somewhere it could
            never reach in one jump. More thinking tokens = more compute spent on the problem.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Try it" title="Direct answer vs thinking it through">
          <CoTDemo />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The toolkit" title="Prompting techniques, ranked by muscle">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: "🪜", t: "Chain-of-Thought (CoT)", d: "Ask it to reason step by step before answering. The single highest-leverage trick for any multi-step problem." },
              { emoji: "🗳️", t: "Self-consistency", d: "Generate several independent reasoning paths and take the majority answer. Trades cost for reliability on hard problems." },
              { emoji: "🔄", t: "Reflection / self-critique", d: "Have the model review its own answer, find flaws, and revise. A cheap second pass that catches a lot of slips." },
              { emoji: "🌳", t: "Plan-and-Execute / ToT", d: "Make a plan first, then execute steps — or explore several branches (Tree of Thoughts) and keep the best. Structure for complex tasks." },
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
        <Section kicker="Structure for hard tasks" title="Plan first, then execute">
          <p className="mb-4 text-ink-secondary">
            For anything with several moving parts, a planner breaks the goal into ordered steps; each step is executed
            (often with tools); a synthesizer combines the results. This is also the backbone of an agent. Click a node.
          </p>
          <AnimatedDiagram
            height={300}
            nodes={[
              { id: "q", type: "client", label: "Goal", position: { x: 8, y: 50 }, status: "active", info: "A complex, multi-part task that would overwhelm a single straight-shot answer." },
              { id: "plan", type: "llm", label: "Planner", position: { x: 32, y: 50 }, status: "busy", info: "Decomposes the goal into an ordered list of smaller, concrete steps before any work is done." },
              { id: "s1", type: "llm", label: "Step 1", position: { x: 60, y: 20 }, status: "active", info: "Each step is solved on its own — with full reasoning, and tools if needed. Smaller scope = fewer mistakes." },
              { id: "s2", type: "llm", label: "Step 2", position: { x: 60, y: 50 }, status: "active", info: "Steps can depend on earlier results. The plan keeps the model oriented across the whole task." },
              { id: "s3", type: "llm", label: "Step 3", position: { x: 60, y: 80 }, status: "active", info: "Branches can be explored and scored (Tree of Thoughts), keeping only the most promising path." },
              { id: "ans", type: "client", label: "Answer", position: { x: 90, y: 50 }, status: "active", info: "A synthesizer stitches the step results into one coherent, checked final answer." },
            ]}
            edges={[
              { from: "q", to: "plan", animated: true },
              { from: "plan", to: "s1", animated: true, color: "var(--neon-purple)", label: "step" },
              { from: "plan", to: "s2", animated: true, color: "var(--neon-purple)" },
              { from: "plan", to: "s3", animated: true, color: "var(--neon-purple)" },
              { from: "s1", to: "ans", animated: true, color: "var(--neon-green)" },
              { from: "s2", to: "ans", animated: true, color: "var(--neon-green)" },
              { from: "s3", to: "ans", animated: true, color: "var(--neon-green)" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The new wave" title="Reasoning models: thinking built in">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card p-4">
              <div className="flex items-center gap-2 font-display font-semibold text-neon-blue"><Zap size={16} /> Standard model</div>
              <p className="mt-1.5 text-sm text-ink-secondary">Answers fast. You bolt on reasoning with prompting (&quot;think step by step&quot;). Cheaper and lower latency — perfect for most tasks.</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 font-display font-semibold text-neon-purple"><Brain size={16} /> Reasoning model</div>
              <p className="mt-1.5 text-sm text-ink-secondary">Trained to do a long internal &quot;thinking&quot; pass before answering. Stronger on math, code, and logic — but slower and pricier. Use it when the problem is genuinely hard.</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-secondary">
            Rule of thumb: <strong className="text-white">don&apos;t pay for reasoning you don&apos;t need.</strong> Reach for a
            thinking model on the hard 10% of tasks, not for &quot;summarize this email.&quot;
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="reasoning-prompting"
          questions={[
            {
              question: "Why does 'think step by step' improve accuracy on multi-step problems?",
              options: [
                "It makes the model bigger",
                "The reasoning tokens give the model space to compute each part instead of guessing the answer in one shot",
                "It lowers the temperature",
                "It searches the web",
              ],
              correct: 1,
              explain: "Each generated token becomes context for the next, so writing the steps lets it carry intermediate results.",
            },
            {
              question: "What does self-consistency do?",
              options: [
                "Asks the same question with higher temperature once",
                "Generates several reasoning paths and takes the majority answer",
                "Fine-tunes the model",
                "Removes the system prompt",
              ],
              correct: 1,
              explain: "Sample multiple independent chains of thought and vote — more reliable on hard problems, at higher cost.",
            },
            {
              question: "When should you use a dedicated 'reasoning' model over a standard one?",
              options: [
                "Always — they're strictly better",
                "For genuinely hard math/code/logic, accepting more latency and cost; not for simple tasks",
                "Only for summarization",
                "Never",
              ],
              correct: 1,
              explain: "Reasoning models trade speed and money for depth. Use them on the hard minority of tasks.",
            },
            {
              question: "What's the point of a 'plan-and-execute' structure?",
              options: [
                "To skip reasoning entirely",
                "Break a complex goal into ordered steps, solve each in smaller scope, then synthesize",
                "To use fewer tokens than a direct answer",
                "To avoid using tools",
              ],
              correct: 1,
              explain: "Planning first keeps the model oriented and shrinks each step's scope, reducing mistakes on complex tasks.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
