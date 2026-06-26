"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Check, Loader2 } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";

// ---------- Request lifecycle stepper ----------
const STAGES = [
  { who: "Planner", color: "var(--neon-purple)", text: "Decompose \"State of solid-state batteries?\" into 3 sub-questions." },
  { who: "Researcher", color: "var(--neon-blue)", text: "search() + fetch() each sub-question → 9 candidate sources." },
  { who: "Memory", color: "var(--neon-green)", text: "Chunk, embed & store findings in the working vector store." },
  { who: "Writer", color: "var(--neon-orange)", text: "Draft a structured report, citing retrieved chunks." },
  { who: "Critic", color: "var(--neon-pink)", text: "Verify each claim against its source; flag 1 unsupported line." },
  { who: "Planner", color: "var(--neon-purple)", text: "Gap found → dispatch one more targeted search, then re-draft." },
  { who: "Done", color: "var(--neon-green)", text: "Return a cited, fact-checked report. 4 tool calls, 2 loops." },
];

function LifecycleLab() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  const next = () => setStep((s) => Math.min(STAGES.length, s + 1));
  const reset = () => { setStep(0); setRunning(false); };
  const auto = () => {
    setRunning(true);
    setStep(0);
    let i = 0;
    const tick = () => {
      i += 1;
      setStep(i);
      if (i < STAGES.length) setTimeout(tick, 900);
      else setRunning(false);
    };
    setTimeout(tick, 500);
  };
  const atEnd = step >= STAGES.length;

  return (
    <div className="card p-5">
      <div className="space-y-2">
        {STAGES.map((s, i) => {
          const state = i < step ? "done" : i === step && running ? "active" : i === step && !running && !atEnd ? "next" : "pending";
          const shown = i < step;
          return (
            <motion.div
              key={i}
              animate={{ opacity: i <= step ? 1 : 0.35 }}
              className="flex items-start gap-3 rounded-lg border bg-bg-primary/40 p-2.5"
              style={{ borderColor: shown ? `${s.color}55` : "var(--border-subtle)" }}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full" style={{ background: shown ? s.color : "var(--bg-tertiary)", color: shown ? "#0a0a0f" : "var(--text-muted)" }}>
                {shown ? <Check size={13} strokeWidth={3} /> : state === "active" ? <Loader2 size={13} className="animate-spin" /> : i + 1}
              </span>
              <div>
                <div className="mono text-[0.62rem] uppercase tracking-wider" style={{ color: s.color }}>{s.who}</div>
                <div className="text-sm text-ink-secondary">{s.text}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-2">
        {!atEnd ? (
          <button onClick={next} disabled={running} className="btn-neon justify-center"><Play size={14} /> Next stage</button>
        ) : (
          <span className="chip" style={{ borderColor: "var(--neon-green)", color: "var(--neon-green)" }}>✓ report delivered</span>
        )}
        <button onClick={auto} disabled={running} className="btn-ghost">Auto-run</button>
        <button onClick={reset} className="btn-ghost"><RotateCcw size={14} /> Reset</button>
        <span className="ml-auto mono text-xs text-ink-muted">{Math.min(step, STAGES.length)}/{STAGES.length}</span>
      </div>
    </div>
  );
}

export default function AgentDesignPage() {
  return (
    <ConceptPage
      slug="agent-design"
      analogy={
        <FunnyAnalogy
          emoji="🏗️"
          color="var(--neon-pink)"
          alternates={[
            { emoji: "🕵️", text: "You're hiring a research assistant: they plan the investigation, dig up sources, write it up, and a skeptical editor checks their work before it ships." },
          ]}
        >
          Time to put it all together. We&apos;ll design a <strong className="text-neon-pink">deep-research agent</strong>:
          give it a question, and it autonomously plans, searches the web, reads &amp; remembers sources, writes a cited
          report, and <em>fact-checks itself</em> before answering. Every belt so far — LLMs, prompting, RAG, tools,
          memory, multi-agent — shows up as a box on this diagram.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="Step 1 · Scope" title="The brief & requirements">
          <p className="mb-4 text-ink-secondary">
            As with any system design, pin down what it must do before drawing boxes.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card p-4">
              <div className="font-display font-semibold text-neon-blue">Functional</div>
              <ul className="mt-2 space-y-1 text-sm text-ink-secondary">
                <li>· Take an open research question</li>
                <li>· Plan sub-questions &amp; search the web</li>
                <li>· Ground the answer in real sources (citations)</li>
                <li>· Self-check before returning</li>
              </ul>
            </div>
            <div className="card p-4">
              <div className="font-display font-semibold text-neon-orange">Non-functional</div>
              <ul className="mt-2 space-y-1 text-sm text-ink-secondary">
                <li>· Bounded: max steps &amp; max cost per run</li>
                <li>· Low hallucination (verify claims)</li>
                <li>· Observable: log every step &amp; tool call</li>
                <li>· Finish in a reasonable time / token budget</li>
              </ul>
            </div>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Step 2 · Architecture" title="The full agent, one diagram">
          <p className="mb-4 text-ink-secondary">
            A planner-led, multi-agent loop with web tools and a working vector memory. Click any node to see its job —
            and notice how each is a concept from an earlier lesson.
          </p>
          <AnimatedDiagram
            height={360}
            nodes={[
              { id: "user", type: "client", label: "Question", position: { x: 7, y: 50 }, status: "active", info: "An open-ended research question from the user." },
              { id: "orch", type: "agent", label: "Orchestrator", position: { x: 26, y: 50 }, status: "busy", info: "Runs the loop, holds the goal, routes work, and decides when the report is good enough to ship." },
              { id: "planner", type: "agent", label: "Planner", position: { x: 46, y: 20 }, status: "active", info: "Decomposes the question into focused sub-questions and a research plan. Re-plans when the critic finds gaps." },
              { id: "search", type: "tool", label: "Search/Fetch", position: { x: 70, y: 16 }, status: "idle", info: "Web search + page fetch tools. The agent's window onto live, post-training-cutoff information." },
              { id: "mem", type: "vector", label: "Working Memory", position: { x: 70, y: 50 }, status: "active", info: "Findings are chunked, embedded, and stored here so the writer can retrieve sources by relevance (RAG)." },
              { id: "writer", type: "agent", label: "Writer", position: { x: 46, y: 80 }, status: "active", info: "Drafts the structured report, pulling cited chunks from working memory." },
              { id: "critic", type: "agent", label: "Critic", position: { x: 70, y: 84 }, status: "active", info: "Checks each claim against its source. Unsupported claim → sends the agent back for one more search." },
              { id: "out", type: "client", label: "Report", position: { x: 93, y: 50 }, status: "active", info: "A cited, self-verified report — returned only after passing the critic." },
            ]}
            edges={[
              { from: "user", to: "orch", animated: true },
              { from: "orch", to: "planner", animated: true, color: "var(--neon-purple)" },
              { from: "planner", to: "search", animated: true, color: "var(--neon-blue)", label: "queries" },
              { from: "search", to: "mem", animated: true, color: "var(--neon-green)", label: "sources" },
              { from: "mem", to: "writer", animated: true, color: "var(--neon-green)", label: "retrieve" },
              { from: "writer", to: "critic", animated: true, color: "var(--neon-orange)", label: "draft" },
              { from: "critic", to: "orch", dashed: true, label: "gaps" },
              { from: "orch", to: "out", animated: true, color: "var(--neon-pink)", label: "ship" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Step 3 · Lifecycle" title="One request, end to end">
          <p className="mb-4 text-ink-secondary">
            Step through a single run. Watch the plan → research → write → critique → re-plan loop play out.
          </p>
          <LifecycleLab />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Step 4 · Decisions" title="The trade-offs you'll defend in an interview">
          <div className="space-y-3">
            {[
              { q: "Single agent or multi-agent?", a: "Multi here: planning, writing, and criticizing need different prompts/temperatures. But keep it minimal — each agent adds cost and latency." },
              { q: "How do you stop infinite loops?", a: "Hard caps: max iterations, max tool calls, and a token/cost budget. The orchestrator must be able to give up gracefully with a partial answer." },
              { q: "How do you fight hallucination?", a: "Ground every claim in retrieved sources, then run a critic pass that verifies claims against those sources before shipping." },
              { q: "Where does it get slow/expensive?", a: "Each loop is multiple LLM calls. Cache retrievals, use a cheaper model for routing/critique, and parallelize independent sub-questions." },
              { q: "How do you debug it in production?", a: "Trace everything: log each thought, tool call, and observation with a run ID. You can't fix what you can't replay." },
            ].map((d) => (
              <div key={d.q} className="card p-4">
                <div className="font-display font-semibold text-white">{d.q}</div>
                <p className="mt-1.5 text-sm text-ink-secondary">{d.a}</p>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="agent-design"
          questions={[
            {
              question: "In the deep-research agent, what is the Critic's role?",
              options: [
                "To write the report",
                "To verify claims against their sources and trigger more research if something is unsupported",
                "To embed documents",
                "To talk to the user",
              ],
              correct: 1,
              explain: "The critic is the self-check: verify claims, flag gaps, and loop back before shipping.",
            },
            {
              question: "Why is the working memory a vector store?",
              options: [
                "It's the only kind of database",
                "So the writer can retrieve the most relevant findings by similarity — RAG over the agent's own research",
                "To store the model weights",
                "For faster typing",
              ],
              correct: 1,
              explain: "Findings are embedded so the writer can pull the most relevant chunks when drafting — that's RAG.",
            },
            {
              question: "What's the cleanest way to prevent the agent from running forever?",
              options: [
                "Hope it stops",
                "Hard caps on iterations, tool calls, and cost/token budget, with a graceful give-up",
                "Increase the temperature",
                "Add more agents",
              ],
              correct: 1,
              explain: "Bounded autonomy: explicit limits plus a graceful partial answer when a limit is hit.",
            },
            {
              question: "Which design choice most directly reduces cost and latency?",
              options: [
                "Using the biggest model for every step",
                "Using a cheaper model for routing/critique and parallelizing independent sub-questions",
                "Disabling memory",
                "Removing citations",
              ],
              correct: 1,
              explain: "Right-size the model per role and parallelize independent work — big wins on cost and wall-clock time.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
