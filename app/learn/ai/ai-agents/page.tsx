"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Wrench, Eye, Trophy } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { SimulationWrapper } from "@/components/simulations/SimulationWrapper";

type Phase = "thought" | "action" | "observation" | "final";
const TRACE: { type: Phase; text: string }[] = [
  { type: "thought", text: "Goal: book the cheapest NYC→Tokyo flight this Friday. First I need options." },
  { type: "action", text: 'search_flights("NYC", "HND", "Fri")' },
  { type: "observation", text: "3 flights found. Cheapest: ANA-7 at $812." },
  { type: "thought", text: "Before booking, is $812 within the user's budget?" },
  { type: "action", text: "get_budget()" },
  { type: "observation", text: "Budget = $1000. $812 fits ✅." },
  { type: "thought", text: "Cheapest option is in budget. Book ANA-7." },
  { type: "action", text: 'book_flight("ANA-7")' },
  { type: "observation", text: "Booked! Confirmation #X9F2." },
  { type: "final", text: "Done: booked ANA-7, NYC→Tokyo Friday, $812. Confirmation #X9F2." },
];

const PHASE_META: Record<Phase, { label: string; color: string; icon: typeof Brain }> = {
  thought: { label: "Think", color: "var(--neon-purple)", icon: Brain },
  action: { label: "Act", color: "var(--neon-orange)", icon: Wrench },
  observation: { label: "Observe", color: "var(--neon-green)", icon: Eye },
  final: { label: "Done", color: "var(--neon-pink)", icon: Trophy },
};

function AgentLoopSim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!playing) return;
    if (step >= TRACE.length) { setPlaying(false); return; }
    const id = setTimeout(() => setStep((s) => s + 1), 1500 / speed);
    return () => clearTimeout(id);
  }, [playing, step, speed]);

  const current = step > 0 ? TRACE[step - 1] : null;
  const activePhase: Phase = current ? current.type : "thought";
  const done = step >= TRACE.length;

  const reset = () => { setStep(0); setPlaying(false); };
  const playPause = () => {
    if (done) { setStep(0); setPlaying(true); return; }
    setPlaying((p) => !p);
  };

  const toolCalls = TRACE.slice(0, step).filter((t) => t.type === "action").length;
  const events = TRACE.slice(0, step).map((t, i) => ({
    id: i,
    time: `#${i + 1}`,
    text: `${PHASE_META[t.type].label}: ${t.text}`,
    color: PHASE_META[t.type].color,
  })).reverse();

  // ring nodes
  const RING: { phase: Phase; x: number; y: number }[] = [
    { phase: "thought", x: 50, y: 16 },
    { phase: "action", x: 84, y: 70 },
    { phase: "observation", x: 16, y: 70 },
  ];

  return (
    <SimulationWrapper
      title="ReAct Agent Loop"
      playing={playing}
      onPlayPause={playPause}
      onReset={reset}
      speed={speed}
      onSpeed={setSpeed}
      canvasHeight={340}
      metrics={[
        { label: "Step", value: `${Math.min(step, TRACE.length)}/${TRACE.length}` },
        { label: "Tool calls", value: toolCalls, color: "var(--neon-orange)" },
        { label: "~Tokens used", value: (step * 180).toLocaleString(), color: "var(--neon-blue)" },
        { label: "Status", value: done ? "solved" : playing ? "running" : "paused", color: done ? "var(--neon-green)" : "var(--neon-yellow)" },
      ]}
      events={events}
      controls={
        <div>
          <div className="mono text-[0.6rem] uppercase tracking-widest text-ink-muted">The task</div>
          <p className="mt-1 text-sm text-white">Book the cheapest NYC→Tokyo flight this Friday, within budget.</p>
          <div className="mt-4 mono text-[0.6rem] uppercase tracking-widest text-ink-muted">Tools</div>
          <ul className="mt-1 space-y-1 mono text-[0.7rem] text-ink-secondary">
            <li>· search_flights()</li>
            <li>· get_budget()</li>
            <li>· book_flight()</li>
          </ul>
          <p className="mt-4 text-xs text-ink-muted">Press play and watch it loop Think → Act → Observe until the goal is met — deciding its own next move each time.</p>
        </div>
      }
    >
      <div className="relative h-full w-full">
        {/* loop arrows */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 50 16 A 40 40 0 0 1 84 70" fill="none" stroke="var(--border-subtle)" strokeWidth="0.6" />
          <path d="M 84 70 A 40 40 0 0 1 16 70" fill="none" stroke="var(--border-subtle)" strokeWidth="0.6" />
          <path d="M 16 70 A 40 40 0 0 1 50 16" fill="none" stroke="var(--border-subtle)" strokeWidth="0.6" />
        </svg>

        {/* phase nodes */}
        {RING.map((r) => {
          const meta = PHASE_META[r.phase];
          const active = activePhase === r.phase && !done;
          const Icon = meta.icon;
          return (
            <div key={r.phase} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${r.x}%`, top: `${r.y}%` }}>
              <motion.div
                className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border-2"
                style={{ borderColor: meta.color, color: meta.color, background: "var(--bg-tertiary)" }}
                animate={active ? { scale: [1, 1.12, 1], boxShadow: [`0 0 8px -2px ${meta.color}`, `0 0 22px 2px ${meta.color}`, `0 0 8px -2px ${meta.color}`] } : { scale: 1 }}
                transition={{ duration: 1.2, repeat: active ? Infinity : 0 }}
              >
                <Icon size={22} />
              </motion.div>
              <div className="mt-1 mono text-[0.65rem]" style={{ color: active ? meta.color : "var(--text-muted)" }}>{meta.label}</div>
            </div>
          );
        })}

        {/* center readout */}
        <div className="absolute left-1/2 top-1/2 w-56 -translate-x-1/2 -translate-y-1/2">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-xl border bg-bg-elevated/90 p-3 text-center"
              style={{ borderColor: current ? PHASE_META[current.type].color : "var(--border-subtle)" }}
            >
              {current ? (
                <>
                  <div className="mono text-[0.6rem] uppercase tracking-wider" style={{ color: PHASE_META[current.type].color }}>
                    {PHASE_META[current.type].label}
                  </div>
                  <p className="mt-1 text-xs text-white">{current.text}</p>
                </>
              ) : (
                <p className="text-xs text-ink-muted">▶ Press play to start the loop</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SimulationWrapper>
  );
}

export default function AiAgentsPage() {
  return (
    <ConceptPage
      slug="ai-agents"
      analogy={
        <FunnyAnalogy
          emoji="🤖"
          color="var(--neon-pink)"
          alternates={[
            { emoji: "🧑‍💼", text: "A capable intern: give them a goal, not step-by-step instructions. They figure out the steps, use the tools, and check their own work." },
            { emoji: "🗺️", text: "A chatbot answers the question you asked. An agent is handed a destination and finds its own route there." },
          ]}
        >
          A chatbot replies once and stops. An <strong className="text-neon-pink">agent</strong> is an LLM put in a{" "}
          <strong className="text-white">loop</strong> with <strong className="text-neon-orange">tools</strong> and a{" "}
          <strong className="text-white">goal</strong>. It thinks about what to do, takes an action, observes the result,
          and decides the next move — over and over — until the goal is done. The model isn&apos;t just answering; it&apos;s{" "}
          <em>driving</em>.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The leap" title="From answer machine to autonomous worker">
          <p className="text-ink-secondary">
            Everything so far — LLMs, prompting, RAG, tools — were ingredients. The agent is the recipe. The defining
            move is the <strong className="text-white">loop</strong>: the model&apos;s output (a tool call) produces a result,
            that result becomes new input, and the model decides again. Nobody scripts the steps; the agent chooses them
            based on what it observes. That autonomy is the whole point — and the whole danger.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The pattern" title="ReAct: Reason + Act, on repeat">
          <p className="mb-4 text-ink-secondary">
            The most common agent pattern is dead simple: interleave <span className="text-neon-purple">Thought</span>{" "}
            (reason about what&apos;s needed), <span className="text-neon-orange">Action</span> (call a tool), and{" "}
            <span className="text-neon-green">Observation</span> (read the result). Repeat until the model decides it&apos;s
            finished. Press play and follow a real run.
          </p>
          <AgentLoopSim />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Anatomy" title="What's inside an agent">
          <p className="mb-4 text-ink-secondary">
            Strip away the hype and an agent is four parts wired into a loop. Click each node.
          </p>
          <AnimatedDiagram
            height={300}
            nodes={[
              { id: "goal", type: "client", label: "Goal", position: { x: 9, y: 50 }, status: "active", info: "What the user wants. The agent's north star for every decision in the loop." },
              { id: "brain", type: "agent", label: "Agent (LLM)", position: { x: 40, y: 50 }, status: "busy", info: "The reasoning core. Each turn it reads the state and decides: call a tool, or finish?" },
              { id: "tools", type: "tool", label: "Tools", position: { x: 72, y: 24 }, status: "idle", info: "Hands to act on the world: search, code execution, APIs, databases, sending messages." },
              { id: "memory", type: "vector", label: "Memory", position: { x: 72, y: 76 }, status: "active", info: "Scratchpad of recent steps + long-term recall. Lets the agent remember what it already tried." },
              { id: "answer", type: "client", label: "Result", position: { x: 94, y: 50 }, status: "active", info: "When the goal is satisfied, the agent stops looping and returns the result." },
            ]}
            edges={[
              { from: "goal", to: "brain", animated: true },
              { from: "brain", to: "tools", animated: true, color: "var(--neon-orange)", label: "act" },
              { from: "tools", to: "brain", animated: true, color: "var(--neon-green)", label: "observe" },
              { from: "brain", to: "memory", dashed: true, label: "read/write" },
              { from: "brain", to: "answer", animated: true, color: "var(--neon-pink)", label: "when done" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Know the difference" title="Workflow vs Agent">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card p-4" style={{ borderColor: "var(--neon-blue)33" }}>
              <div className="font-display font-semibold text-neon-blue">🔧 Workflow (you script the steps)</div>
              <p className="mt-1.5 text-sm text-ink-secondary">Fixed path: do A, then B, then C. Predictable, cheap, easy to debug. Use it when the steps are known in advance.</p>
            </div>
            <div className="card p-4" style={{ borderColor: "var(--neon-pink)33" }}>
              <div className="font-display font-semibold text-neon-pink">🤖 Agent (the model picks the steps)</div>
              <p className="mt-1.5 text-sm text-ink-secondary">Open-ended: the model decides the path at runtime. Flexible and powerful, but slower, pricier, and harder to control. Use it when the steps can&apos;t be known ahead of time.</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-secondary">
            The pro move: <strong className="text-white">use the least autonomy that solves the problem.</strong> Most
            &quot;agents&quot; in production are mostly workflows with one or two agentic steps where they&apos;re truly needed.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="ai-agents"
          questions={[
            {
              question: "What single thing most distinguishes an agent from a plain chatbot?",
              options: [
                "It uses a bigger model",
                "It runs in a loop, choosing its own next action based on observations, until a goal is met",
                "It speaks more politely",
                "It never uses tools",
              ],
              correct: 1,
              explain: "The loop + autonomy is the defining feature: observe, decide, act, repeat — no fixed script.",
            },
            {
              question: "In the ReAct pattern, what are the three repeating phases?",
              options: [
                "Read, Eval, Print",
                "Thought, Action, Observation",
                "Encode, Decode, Sample",
                "Plan, Build, Ship",
              ],
              correct: 1,
              explain: "ReAct interleaves reasoning (Thought), tool use (Action), and reading results (Observation).",
            },
            {
              question: "When should you prefer a fixed workflow over a full agent?",
              options: [
                "Never — agents are always better",
                "When the steps are known in advance; workflows are cheaper, faster, and easier to debug",
                "Only on weekends",
                "When you have no tools",
              ],
              correct: 1,
              explain: "Use the least autonomy that works. Known steps → workflow. Unknown steps → agent.",
            },
            {
              question: "An agent's loop turns one tool result into its next decision. Why is that powerful but risky?",
              options: [
                "It isn't risky at all",
                "Autonomy lets it handle open-ended tasks, but it can also loop forever, run up costs, or take wrong actions",
                "It makes the model read-only",
                "It disables the tools",
              ],
              correct: 1,
              explain: "Self-direction is the value and the hazard — which is why guardrails (last lesson) exist.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
