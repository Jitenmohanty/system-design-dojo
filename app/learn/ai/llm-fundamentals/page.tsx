"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, Sparkles, BookOpen, GraduationCap, ThumbsUp } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// ---------- Next-token predictor demo ----------
type Cand = { t: string; logit: number };
const SCENARIOS: { prompt: string; cands: Cand[] }[] = [
  {
    prompt: "The cat sat on the",
    cands: [
      { t: " mat", logit: 3.4 },
      { t: " floor", logit: 2.3 },
      { t: " sofa", logit: 1.6 },
      { t: " keyboard", logit: 0.7 },
      { t: " moon", logit: -0.6 },
    ],
  },
  {
    prompt: "import numpy as",
    cands: [
      { t: " np", logit: 5.1 },
      { t: " numpy", logit: 1.3 },
      { t: " n", logit: 0.6 },
      { t: " math", logit: -0.2 },
      { t: " pd", logit: -0.8 },
    ],
  },
  {
    prompt: "To be, or not to",
    cands: [
      { t: " be", logit: 4.8 },
      { t: " do", logit: 0.9 },
      { t: " say", logit: 0.3 },
      { t: " think", logit: -0.1 },
      { t: " sleep", logit: -0.7 },
    ],
  },
];

function softmax(logits: number[], temp: number): number[] {
  const t = Math.max(0.05, temp);
  const scaled = logits.map((l) => l / t);
  const max = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

function NextTokenLab() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [temp, setTemp] = useState(0.8);
  const [sampled, setSampled] = useState<string | null>(null);

  const scenario = SCENARIOS[scenarioIdx];
  const probs = useMemo(
    () => softmax(scenario.cands.map((c) => c.logit), temp),
    [scenario, temp]
  );

  const sample = () => {
    const r = Math.random();
    let acc = 0;
    for (let i = 0; i < probs.length; i++) {
      acc += probs[i];
      if (r <= acc) {
        setSampled(scenario.cands[i].t);
        return;
      }
    }
    setSampled(scenario.cands[probs.length - 1].t);
  };

  const tempLabel = temp < 0.4 ? "icy · deterministic" : temp < 1.1 ? "balanced" : "spicy · chaotic";
  const tempColor = temp < 0.4 ? "var(--neon-blue)" : temp < 1.1 ? "var(--neon-green)" : "var(--neon-red)";

  return (
    <div className="card p-5">
      {/* prompt chips */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.prompt}
            onClick={() => { setScenarioIdx(i); setSampled(null); }}
            className="chip transition"
            style={i === scenarioIdx ? { borderColor: "var(--neon-pink)", color: "var(--neon-pink)", background: "rgba(255,59,107,0.1)" } : undefined}
          >
            {s.prompt}…
          </button>
        ))}
      </div>

      {/* the running text */}
      <div className="rounded-xl bg-bg-tertiary/60 p-4 font-display text-lg leading-relaxed">
        <span className="text-white">{scenario.prompt}</span>
        <AnimatePresence mode="wait">
          {sampled ? (
            <motion.span
              key={sampled}
              initial={{ opacity: 0, scale: 0.6, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="font-bold"
              style={{ color: "var(--neon-pink)" }}
            >
              {sampled}
            </motion.span>
          ) : (
            <motion.span
              key="cursor"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-neon-pink"
            >
              ▍
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* probability bars */}
      <div className="mt-4 space-y-1.5">
        {scenario.cands.map((c, i) => {
          const p = probs[i];
          const isPick = sampled === c.t;
          return (
            <div key={c.t} className="flex items-center gap-3">
              <span className="w-24 shrink-0 mono text-xs text-ink-secondary">&quot;{c.t.trim()}&quot;</span>
              <div className="h-5 flex-1 overflow-hidden rounded-md bg-white/5">
                <motion.div
                  className="h-full rounded-md"
                  style={{ background: isPick ? "var(--neon-pink)" : "var(--neon-purple)", opacity: isPick ? 1 : 0.6 }}
                  initial={false}
                  animate={{ width: `${Math.max(2, p * 100)}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                />
              </div>
              <span className="w-12 shrink-0 text-right mono text-xs" style={{ color: isPick ? "var(--neon-pink)" : "var(--ink-muted)" }}>
                {(p * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* controls */}
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="mono text-ink-secondary">temperature</span>
            <span className="mono font-bold" style={{ color: tempColor }}>{temp.toFixed(2)} · {tempLabel}</span>
          </div>
          <input
            type="range" min={0.1} max={2} step={0.05} value={temp}
            onChange={(e) => setTemp(parseFloat(e.target.value))}
            className="w-full accent-[var(--neon-pink)]"
          />
        </div>
        <button onClick={sample} className="btn-neon shrink-0 justify-center">
          <Dices size={15} /> Sample a token
        </button>
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        Low temperature = always pick the top word (boring but reliable). High temperature = flatten the odds and roll the dice (creative, but it might say &quot;moon&quot;).
      </p>
    </div>
  );
}

export default function LLMFundamentalsPage() {
  return (
    <ConceptPage
      slug="llm-fundamentals"
      analogy={
        <FunnyAnalogy
          emoji="🧠"
          color="var(--neon-pink)"
          alternates={[
            { emoji: "📱", text: "It's your phone's autocomplete — if your phone had read the entire internet and never sleeps." },
            { emoji: "🎭", text: "An improv actor: hand it the start of a scene and it confidently continues, one word at a time, in character." },
          ]}
        >
          A Large Language Model is <strong className="text-neon-pink">fancy autocomplete with a PhD</strong>. It does
          exactly one thing: look at the text so far and guess the <em>next</em> word. Then it adds that word and guesses
          again. That&apos;s it. The magic is that &quot;guess the next word&quot; — done well enough, at enough scale — looks
          an awful lot like thinking.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The one trick" title="Predict the next token, forever">
          <p className="text-ink-secondary">
            An LLM never sees your whole question and &quot;answers&quot; it in one shot. It builds the answer{" "}
            <strong className="text-white">one token at a time</strong>, each token chosen from a probability
            distribution over its entire vocabulary. Feed the new token back in, repeat, and a paragraph appears.
            Everything else — reasoning, code, poems — is an emergent side effect of getting really, really good at
            this single guessing game.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Try it" title="Roll the dice on the next word">
          <NextTokenLab />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Where the smarts come from" title="How a model is born">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: BookOpen, title: "1 · Pre-training", color: "var(--neon-blue)", text: "Read a huge slice of the internet and learn to predict the next token. Costs millions of dollars and weeks of GPUs. Result: raw knowledge, zero manners." },
              { icon: GraduationCap, title: "2 · Fine-tuning", color: "var(--neon-purple)", text: "Show it thousands of example conversations so it learns the chat format and how to follow instructions instead of just rambling." },
              { icon: ThumbsUp, title: "3 · RLHF", color: "var(--neon-pink)", text: "Humans rank answers; the model is nudged toward the helpful, honest, harmless ones. This is the 'be a good assistant' polish." },
            ].map((s) => (
              <div key={s.title} className="card p-4" style={{ borderColor: `${s.color}33` }}>
                <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${s.color}1a`, color: s.color }}>
                  <s.icon size={18} />
                </span>
                <div className="mt-3 font-display font-bold text-white">{s.title}</div>
                <p className="mt-1 text-xs text-ink-secondary">{s.text}</p>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Reality check" title="What it is NOT">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: "🚫", t: "Not a database", d: "It doesn't 'look up' facts — it predicts plausible text. That's why it can confidently invent a citation. (We call that a hallucination.)" },
              { emoji: "🧮", t: "Not a calculator", d: "It pattern-matches math from training data. It can be wrong about 7,341 × 89 unless it's given a tool to actually compute it." },
              { emoji: "🕰️", t: "Not live", d: "Its knowledge is frozen at a training cutoff. It has no idea what happened yesterday unless you put it in the prompt." },
              { emoji: "🎲", t: "Not deterministic", d: "Same prompt, different answer — because it's sampling from a distribution. Temperature 0 makes it (mostly) repeatable." },
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
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-neon-pink/30 bg-neon-pink/5 p-3">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-neon-pink" />
            <p className="text-sm text-ink-secondary">
              Keep this in your pocket for the rest of the belt: every limitation above is a problem the agent
              stack <em>solves</em>. No live data? Give it <strong className="text-white">tools</strong>. No memory?
              Add <strong className="text-white">RAG</strong>. Can&apos;t do math? Let it <strong className="text-white">call a calculator</strong>.
            </p>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="llm-fundamentals"
          questions={[
            {
              question: "At its core, what does an LLM actually do?",
              options: [
                "Searches a database for the best matching answer",
                "Predicts the next token given the text so far, repeatedly",
                "Runs a fixed decision tree of if/else rules",
                "Compiles your prompt into machine code",
              ],
              correct: 1,
              explain: "It's next-token prediction on loop. Everything else is emergent behavior from doing that well.",
            },
            {
              question: "You crank temperature up to 1.8. What happens?",
              options: [
                "The model gets factually smarter",
                "Output becomes more random and creative (and more error-prone)",
                "The model responds faster",
                "Nothing — temperature only affects training",
              ],
              correct: 1,
              explain: "Higher temperature flattens the probability distribution, so less-likely tokens get picked more often.",
            },
            {
              question: "Why does an LLM sometimes invent a fake but convincing citation?",
              options: [
                "It's lying on purpose",
                "Its database is out of date",
                "It generates plausible-sounding text, not retrieved facts — so 'plausible' can be 'made up'",
                "Someone poisoned that exact answer",
              ],
              correct: 2,
              explain: "Hallucination is the flip side of generation: it optimizes for plausible, not true. Grounding it with RAG/tools fixes this.",
            },
            {
              question: "Which stage teaches a raw model to behave like a helpful assistant?",
              options: ["Pre-training", "Tokenization", "Fine-tuning + RLHF", "Embedding"],
              correct: 2,
              explain: "Pre-training gives raw knowledge; fine-tuning + RLHF align it to be a helpful, well-mannered chat assistant.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
