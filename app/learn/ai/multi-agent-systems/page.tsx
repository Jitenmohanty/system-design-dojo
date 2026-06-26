"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Search, BarChart3, PenLine, ShieldCheck } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";

// ---------- Fan-out / orchestration demo ----------
type Status = "idle" | "working" | "done";
const WORKERS = [
  { id: "research", label: "Researcher", icon: Search, color: "var(--neon-blue)", task: "Gather EV market data & sources", out: "12 sources, 2024 sales up 18% YoY" },
  { id: "analyst", label: "Analyst", icon: BarChart3, color: "var(--neon-green)", task: "Crunch numbers & spot trends", out: "Margins thin; China leads volume" },
  { id: "writer", label: "Writer", icon: PenLine, color: "var(--neon-purple)", task: "Draft the report sections", out: "5-section draft, 1,400 words" },
  { id: "critic", label: "Critic", icon: ShieldCheck, color: "var(--neon-orange)", task: "Fact-check & tighten", out: "2 claims flagged, fixed" },
];

function OrchestratorLab() {
  const [phase, setPhase] = useState(0); // 0 idle, 1 dispatch, 2 working, 3 done, 4 synthesized
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (phase >= 4) { setPlaying(false); return; }
    const id = setTimeout(() => setPhase((p) => p + 1), 1100);
    return () => clearTimeout(id);
  }, [playing, phase]);

  const statusOf = (): Status => {
    if (phase <= 1) return "idle";
    if (phase === 2) return "working";
    return "done";
  };

  const run = () => {
    if (phase >= 4) setPhase(0);
    setPlaying(true);
  };
  const reset = () => { setPhase(0); setPlaying(false); };

  return (
    <div className="card p-5">
      {/* orchestrator */}
      <div className="flex flex-col items-center">
        <div className="rounded-xl border-2 border-neon-pink px-4 py-2 text-center" style={{ background: "var(--bg-tertiary)" }}>
          <div className="mono text-[0.6rem] uppercase tracking-wider text-neon-pink">Orchestrator</div>
          <div className="text-sm font-semibold text-white">&quot;Write a market report on EVs&quot;</div>
        </div>
        <div className="h-4 w-px bg-white/15" />
      </div>

      {/* workers */}
      <div className="grid gap-3 sm:grid-cols-4">
        {WORKERS.map((w, i) => {
          const st = statusOf();
          const Icon = w.icon;
          return (
            <motion.div
              key={w.id}
              animate={{ opacity: phase >= 1 ? 1 : 0.4, y: 0 }}
              className="rounded-xl border bg-bg-primary/40 p-3"
              style={{ borderColor: st === "working" ? w.color : st === "done" ? `${w.color}` : "var(--border-subtle)" }}
            >
              <div className="flex items-center gap-1.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: `${w.color}1a`, color: w.color }}><Icon size={14} /></span>
                <span className="text-xs font-semibold text-white">{w.label}</span>
              </div>
              <p className="mt-2 text-[0.7rem] text-ink-secondary">{w.task}</p>
              <div className="mt-2 h-5">
                <AnimatePresence mode="wait">
                  {st === "working" && (
                    <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1">
                      {[0, 1, 2].map((d) => (
                        <motion.span key={d} className="h-1.5 w-1.5 rounded-full" style={{ background: w.color }}
                          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 + d * 0.15 }} />
                      ))}
                    </motion.div>
                  )}
                  {st === "done" && (
                    <motion.div key="d" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mono text-[0.62rem]" style={{ color: w.color }}>
                      ✓ {w.out}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* synthesis */}
      <div className="mt-3 flex flex-col items-center">
        <div className="h-4 w-px bg-white/15" />
        <motion.div
          animate={{ opacity: phase >= 4 ? 1 : 0.35, scale: phase >= 4 ? 1 : 0.97 }}
          className="w-full rounded-xl border p-3 text-center"
          style={{ borderColor: phase >= 4 ? "var(--neon-pink)" : "var(--border-subtle)" }}
        >
          {phase >= 4 ? (
            <span className="text-sm text-white">📄 Orchestrator merged all four outputs into one polished, fact-checked EV market report.</span>
          ) : (
            <span className="text-sm text-ink-muted">Synthesized result appears here once every specialist reports back.</span>
          )}
        </motion.div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={run} className="btn-neon justify-center"><Play size={14} /> Dispatch task</button>
        <button onClick={reset} className="btn-ghost"><RotateCcw size={14} /> Reset</button>
      </div>
    </div>
  );
}

export default function MultiAgentPage() {
  return (
    <ConceptPage
      slug="multi-agent-systems"
      analogy={
        <FunnyAnalogy
          emoji="🏢"
          color="var(--neon-pink)"
          alternates={[
            { emoji: "📰", text: "A newsroom: the editor (orchestrator) assigns stories to reporters (specialists), then stitches the issue together." },
            { emoji: "🍳", text: "A restaurant kitchen: head chef plates the dish, but the grill, sauté, and pastry stations each own their craft." },
          ]}
        >
          One agent juggling everything gets confused, bloats its context, and forgets instructions. Multi-agent
          systems split the work: an <strong className="text-neon-pink">orchestrator</strong> breaks a big goal into
          subtasks and hands each to a <strong className="text-white">specialist agent</strong> with its own focused
          prompt and tools. Then it merges the results. Divide, conquer, assemble.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="Why split up" title="One generalist vs a team of specialists">
          <p className="text-ink-secondary">
            A single agent with 20 tools and a 5-page prompt makes worse decisions than four agents that each do one
            thing well. Specialization keeps each prompt short and each context clean, lets you swap models per role
            (cheap model for routing, strong model for reasoning), and makes the system easier to test. The cost: more
            moving parts, more latency, and the orchestration itself becomes a design problem.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The shape" title="Orchestrator → workers → synthesis">
          <p className="mb-4 text-ink-secondary">
            The most common topology: a coordinator fans work out to specialists in parallel, collects their outputs,
            and synthesizes a final result. Click any node.
          </p>
          <AnimatedDiagram
            height={310}
            nodes={[
              { id: "user", type: "client", label: "Goal", position: { x: 9, y: 50 }, status: "active", info: "The big, fuzzy task: 'write a market report'." },
              { id: "orch", type: "agent", label: "Orchestrator", position: { x: 34, y: 50 }, status: "busy", info: "Plans the work, splits it into subtasks, routes each to the right specialist, and merges results." },
              { id: "r", type: "agent", label: "Researcher", position: { x: 64, y: 16 }, status: "active", info: "Specialist with search tools. Only job: gather sources and facts." },
              { id: "a", type: "agent", label: "Analyst", position: { x: 64, y: 50 }, status: "active", info: "Specialist for crunching data and finding trends. Clean prompt, focused tools." },
              { id: "w", type: "agent", label: "Writer", position: { x: 64, y: 84 }, status: "active", info: "Specialist for drafting prose from the research + analysis." },
              { id: "out", type: "client", label: "Report", position: { x: 91, y: 50 }, status: "active", info: "The synthesized, fact-checked deliverable returned to the user." },
            ]}
            edges={[
              { from: "user", to: "orch", animated: true },
              { from: "orch", to: "r", animated: true, color: "var(--neon-blue)", label: "subtask" },
              { from: "orch", to: "a", animated: true, color: "var(--neon-green)", label: "subtask" },
              { from: "orch", to: "w", animated: true, color: "var(--neon-purple)", label: "subtask" },
              { from: "r", to: "orch", dashed: true },
              { from: "a", to: "orch", dashed: true },
              { from: "w", to: "orch", dashed: true },
              { from: "orch", to: "out", animated: true, color: "var(--neon-pink)", label: "merge" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Try it" title="Dispatch a task to the team">
          <OrchestratorLab />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Patterns" title="Ways agents work together">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: "🌳", t: "Orchestrator–worker", d: "A coordinator delegates subtasks to specialists and synthesizes. The workhorse pattern (you just ran it)." },
              { emoji: "🔗", t: "Pipeline / handoff", d: "Output of agent A becomes input of agent B. Like a relay: research → write → edit → publish." },
              { emoji: "⚖️", t: "Debate / critique", d: "One agent proposes, another critiques. Adversarial review catches errors a single pass misses." },
              { emoji: "🗳️", t: "Voting / ensemble", d: "Run several agents on the same task and merge or vote on the best answer. More reliable, more expensive." },
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
          <p className="mt-4 text-sm text-ink-secondary">
            Warning: every extra agent multiplies cost, latency, and failure modes. Reach for multi-agent only when a
            single well-prompted agent genuinely can&apos;t cope — not because it sounds cool.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="multi-agent-systems"
          questions={[
            {
              question: "What is the orchestrator's main job?",
              options: [
                "To answer the question itself",
                "To split the goal into subtasks, route them to specialists, and merge the results",
                "To store embeddings",
                "To lower the temperature",
              ],
              correct: 1,
              explain: "The orchestrator plans, delegates, and synthesizes — it coordinates rather than doing all the work.",
            },
            {
              question: "Why use specialist agents instead of one agent with all the tools?",
              options: [
                "It's always cheaper",
                "Focused prompts and clean context make each agent more reliable and easier to test",
                "Specialists never make mistakes",
                "The law requires it",
              ],
              correct: 1,
              explain: "Narrow scope = shorter prompts, cleaner context, swappable models, and easier debugging.",
            },
            {
              question: "In a 'debate / critique' pattern, what's the benefit?",
              options: [
                "It's faster than one agent",
                "An adversarial critic catches errors a single pass would miss",
                "It uses fewer tokens",
                "It removes the need for tools",
              ],
              correct: 1,
              explain: "Propose-then-critique surfaces mistakes and weak reasoning that one straight pass tends to ship.",
            },
            {
              question: "What's the main downside of adding more agents?",
              options: [
                "Nothing — more is always better",
                "More cost, latency, and failure modes to coordinate",
                "The model gets dumber",
                "You lose access to tools",
              ],
              correct: 1,
              explain: "Each agent multiplies expense and complexity. Use multi-agent only when one agent truly can't cope.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
