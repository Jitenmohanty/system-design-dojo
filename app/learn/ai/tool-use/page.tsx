"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Wrench, Cloud, Calculator, User, Bot } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";

// ---------- Tool-call loop simulator ----------
type Msg =
  | { kind: "user"; text: string }
  | { kind: "think"; text: string }
  | { kind: "call"; tool: string; args: string }
  | { kind: "result"; tool: string; text: string }
  | { kind: "final"; text: string };

const SCRIPT: Msg[] = [
  { kind: "user", text: "Is it warmer in Tokyo or Paris right now?" },
  { kind: "think", text: "I don't have live weather. I have a get_weather tool — let me call it for both cities." },
  { kind: "call", tool: "get_weather", args: '{ "city": "Tokyo" }' },
  { kind: "result", tool: "get_weather", text: '{ "city": "Tokyo", "tempC": 22 }' },
  { kind: "call", tool: "get_weather", args: '{ "city": "Paris" }' },
  { kind: "result", tool: "get_weather", text: '{ "city": "Paris", "tempC": 15 }' },
  { kind: "think", text: "Tokyo 22°C vs Paris 15°C. Tokyo is warmer by 7°C. I can answer now." },
  { kind: "final", text: "Tokyo is warmer right now — 22°C versus 15°C in Paris, a 7°C difference." },
];

function ToolLab() {
  const [step, setStep] = useState(0);
  const shown = SCRIPT.slice(0, step);

  const advance = () => setStep((s) => Math.min(SCRIPT.length, s + 1));
  const reset = () => setStep(0);
  const atEnd = step >= SCRIPT.length;

  return (
    <div className="card p-5">
      {/* available tools */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mono text-[0.65rem] uppercase tracking-widest text-ink-muted">Tools available:</span>
        <span className="chip inline-flex items-center gap-1" style={{ borderColor: "var(--neon-orange)", color: "var(--neon-orange)" }}><Cloud size={11} /> get_weather(city)</span>
        <span className="chip inline-flex items-center gap-1"><Calculator size={11} /> calculator(expr)</span>
      </div>

      {/* message log */}
      <div className="min-h-[220px] space-y-2.5">
        <AnimatePresence initial={false}>
          {shown.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {m.kind === "user" && (
                <div className="flex items-start gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-neon-pink/15 text-neon-pink"><User size={14} /></span>
                  <div className="rounded-xl rounded-tl-sm bg-bg-tertiary/70 px-3 py-2 text-sm text-white">{m.text}</div>
                </div>
              )}
              {m.kind === "think" && (
                <div className="flex items-start gap-2 pl-9">
                  <div className="rounded-lg border border-dashed border-neon-purple/40 bg-neon-purple/5 px-3 py-1.5 text-xs italic text-neon-purple">💭 {m.text}</div>
                </div>
              )}
              {m.kind === "call" && (
                <div className="flex items-start gap-2 pl-9">
                  <div className="w-full rounded-lg border border-neon-orange/40 bg-neon-orange/5 p-2.5">
                    <div className="flex items-center gap-1.5 mono text-[0.65rem] uppercase tracking-wider text-neon-orange"><Wrench size={11} /> tool call</div>
                    <pre className="mt-1 overflow-x-auto mono text-xs text-neon-orange">{m.tool}({m.args})</pre>
                  </div>
                </div>
              )}
              {m.kind === "result" && (
                <div className="flex items-start gap-2 pl-9">
                  <div className="w-full rounded-lg border border-neon-green/40 bg-neon-green/5 p-2.5">
                    <div className="mono text-[0.65rem] uppercase tracking-wider text-neon-green">↩ {m.tool} returned</div>
                    <pre className="mt-1 overflow-x-auto mono text-xs text-neon-green">{m.text}</pre>
                  </div>
                </div>
              )}
              {m.kind === "final" && (
                <div className="flex items-start gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-neon-green/15 text-neon-green"><Bot size={14} /></span>
                  <div className="rounded-xl rounded-tl-sm border border-neon-green/40 bg-neon-green/5 px-3 py-2 text-sm text-white">{m.text}</div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {step === 0 && <p className="pt-6 text-center text-sm text-ink-muted">Step through a real tool-use loop →</p>}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {!atEnd ? (
          <button onClick={advance} className="btn-neon justify-center"><Play size={15} /> Next step</button>
        ) : (
          <span className="chip" style={{ borderColor: "var(--neon-green)", color: "var(--neon-green)" }}>✓ loop complete</span>
        )}
        <button onClick={reset} className="btn-ghost"><RotateCcw size={14} /> Reset</button>
        <span className="ml-auto mono text-xs text-ink-muted">{step}/{SCRIPT.length}</span>
      </div>
    </div>
  );
}

export default function ToolUsePage() {
  return (
    <ConceptPage
      slug="tool-use"
      analogy={
        <FunnyAnalogy
          emoji="🧠"
          color="var(--neon-pink)"
          alternates={[
            { emoji: "👨‍🍳", text: "A chef who can phone suppliers: they don't grow the tomatoes, they know who to call and what to ask for." },
            { emoji: "📞", text: "Like a smart friend who, when stumped, says 'hang on, let me look that up' instead of guessing." },
          ]}
        >
          An LLM is a brain in a jar — it can <em>think</em> but it can&apos;t <em>do</em>. Tool use bolts on hands. You
          describe functions it&apos;s allowed to call (with a <strong className="text-neon-orange">schema</strong>); when the
          model needs one, it emits a structured <strong className="text-neon-pink">call</strong>; your code runs it and
          feeds the <strong className="text-neon-green">result</strong> back. Now it can check the weather, query a DB, send
          an email, or run code.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The key insight" title="The model doesn't run tools — it asks you to">
          <p className="text-ink-secondary">
            This trips everyone up at first: the LLM never executes anything. It just outputs a message that says
            &quot;I&apos;d like to call <span className="mono text-neon-orange">get_weather</span> with these arguments.&quot; Your
            application runs the actual function, then sends the result back into the conversation. The model reads it
            and either calls another tool or writes the final answer. It&apos;s a polite negotiation, not magic.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The loop" title="Think → call → observe → repeat">
          <p className="mb-4 text-ink-secondary">
            The model and your tools pass messages back and forth until the model is satisfied. Hover an edge to trace
            it; this loop is the literal heartbeat of an agent (next belt!).
          </p>
          <AnimatedDiagram
            height={290}
            nodes={[
              { id: "user", type: "client", label: "User", position: { x: 10, y: 50 }, status: "active", info: "Asks a question that needs real-world data or actions." },
              { id: "llm", type: "llm", label: "LLM", position: { x: 40, y: 50 }, status: "busy", info: "Decides whether it can answer directly or needs a tool. Emits a structured tool call if so." },
              { id: "runtime", type: "gateway", label: "Your code", position: { x: 68, y: 50 }, status: "active", info: "Receives the tool call, actually executes the function, and returns the result to the model." },
              { id: "weather", type: "tool", label: "get_weather", position: { x: 90, y: 28 }, status: "idle", info: "A real API call. Returns live data the model could never know on its own." },
              { id: "db", type: "tool", label: "query_db", position: { x: 90, y: 72 }, status: "idle", info: "Another tool — e.g. look up an order. Tools are just functions you expose with a schema." },
            ]}
            edges={[
              { from: "user", to: "llm", animated: true, label: "question" },
              { from: "llm", to: "runtime", animated: true, color: "var(--neon-orange)", label: "tool call" },
              { from: "runtime", to: "weather", animated: true, color: "var(--neon-orange)" },
              { from: "runtime", to: "db", dashed: true },
              { from: "runtime", to: "llm", animated: true, color: "var(--neon-green)", label: "result" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Try it" title="Step through a tool-use conversation">
          <ToolLab />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Designing tools" title="What makes a tool the model can actually use">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: "📝", t: "A crystal-clear schema", d: "Name, description, and typed parameters. The model picks tools by reading these — a vague description = wrong calls." },
              { emoji: "🎯", t: "One job each", d: "Narrow, single-purpose tools beat one mega-tool with 20 modes. Easier for the model to choose correctly." },
              { emoji: "🛡️", t: "Validate the arguments", d: "The model can hallucinate args. Validate and sanitize before executing — especially for anything destructive." },
              { emoji: "💬", t: "Useful, compact results", d: "Return structured data the model can reason over, but trim it — every result eats context budget." },
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
          slug="tool-use"
          questions={[
            {
              question: "When an LLM 'uses a tool', who actually executes the function?",
              options: [
                "The model runs it internally",
                "Your application code runs it and returns the result to the model",
                "The vector database",
                "Nobody — it's simulated",
              ],
              correct: 1,
              explain: "The model only emits a structured request. Your runtime executes it and feeds the result back.",
            },
            {
              question: "How does the model decide which tool to call?",
              options: [
                "Randomly",
                "By reading each tool's name, description, and parameter schema",
                "Alphabetical order",
                "It always calls the first one",
              ],
              correct: 1,
              explain: "Tool selection is driven by the schemas you provide. Clear descriptions = correct tool choices.",
            },
            {
              question: "Why validate tool arguments before executing?",
              options: [
                "It's required by law",
                "The model can hallucinate or malform arguments, and tools may do real/destructive things",
                "To slow things down",
                "Validation isn't needed",
              ],
              correct: 1,
              explain: "Generated args aren't trustworthy. Validate before doing anything with side effects.",
            },
            {
              question: "What turns a single tool call into a multi-step loop?",
              options: [
                "Feeding the tool result back so the model can decide to call another tool or finish",
                "Increasing temperature",
                "Adding more users",
                "Bigger embeddings",
              ],
              correct: 0,
              explain: "Observe → decide → act again. That feedback loop is exactly what makes an agent an agent.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
