"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";

// ---------- Decision picker ----------
type Rec = { title: string; color: string; why: string; gotcha: string };
const RECS: Record<string, Rec> = {
  prompting: { title: "Start with Prompting", color: "var(--neon-blue)", why: "A clearer prompt with a couple of few-shot examples fixes most format/tone problems instantly and for free.", gotcha: "If you keep piling on instructions and it still drifts, that's your signal to consider fine-tuning." },
  rag: { title: "Use RAG", color: "var(--neon-green)", why: "You have a knowledge gap. Retrieval injects the right facts at query time — fresh, citable, and editable without retraining.", gotcha: "Quality lives and dies by retrieval. Bad chunking or search = wrong context = wrong answer." },
  finetune: { title: "Fine-tune", color: "var(--neon-pink)", why: "You need a consistent specialized behavior/format at scale that prompting can't hold — or a smaller, cheaper model that punches above its weight.", gotcha: "Expensive to make and maintain; it bakes in behavior, not fresh facts. Re-do it when the model or task changes." },
  both: { title: "RAG + a little Fine-tuning", color: "var(--neon-purple)", why: "Knowledge AND behavior gaps: RAG supplies the facts, light fine-tuning locks in the house style/format.", gotcha: "Most teams overreach here. Try RAG + prompting first; add fine-tuning only if behavior still won't hold." },
};

function DecisionPicker() {
  const [gap, setGap] = useState<string | null>(null);
  const [behaviorHard, setBehaviorHard] = useState<boolean | null>(null);

  let rec: Rec | null = null;
  if (gap === "knowledge") rec = RECS.rag;
  else if (gap === "both") rec = RECS.both;
  else if (gap === "behavior" && behaviorHard === false) rec = RECS.prompting;
  else if (gap === "behavior" && behaviorHard === true) rec = RECS.finetune;

  const reset = () => { setGap(null); setBehaviorHard(null); };

  return (
    <div className="card p-5">
      <div className="mb-2 mono text-[0.65rem] uppercase tracking-widest text-ink-muted">Step 1</div>
      <p className="text-sm text-white">What kind of gap are you trying to close?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {[
          { k: "knowledge", label: "📚 Knowledge — it lacks facts (our docs, fresh data)" },
          { k: "behavior", label: "🎭 Behavior — wrong format, tone, or style" },
          { k: "both", label: "🔀 Both" },
        ].map((o) => (
          <button key={o.k} onClick={() => { setGap(o.k); setBehaviorHard(null); }} className="chip transition" style={gap === o.k ? { borderColor: "var(--neon-pink)", color: "var(--neon-pink)", background: "rgba(255,59,107,0.1)" } : undefined}>
            {o.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {gap === "behavior" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-4 mono text-[0.65rem] uppercase tracking-widest text-ink-muted">Step 2</div>
            <p className="text-sm text-white">Have you tried a better prompt + few-shot examples, and it still won&apos;t hold?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={() => setBehaviorHard(false)} className="chip transition" style={behaviorHard === false ? { borderColor: "var(--neon-blue)", color: "var(--neon-blue)", background: "rgba(0,212,255,0.1)" } : undefined}>Not yet — prompting might be enough</button>
              <button onClick={() => setBehaviorHard(true)} className="chip transition" style={behaviorHard === true ? { borderColor: "var(--neon-pink)", color: "var(--neon-pink)", background: "rgba(255,59,107,0.1)" } : undefined}>Yes — prompting isn&apos;t enough / need it cheap at scale</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rec && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-xl border p-4" style={{ borderColor: rec.color, background: `${rec.color}0d` }}>
            <div className="font-display text-lg font-bold" style={{ color: rec.color }}>✅ {rec.title}</div>
            <p className="mt-1.5 text-sm text-ink-secondary"><strong className="text-white">Why:</strong> {rec.why}</p>
            <p className="mt-1.5 text-sm text-ink-secondary"><strong className="text-white">Watch out:</strong> {rec.gotcha}</p>
            <button onClick={reset} className="btn-ghost mt-3 text-xs"><RotateCcw size={13} /> Start over</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ROWS = [
  { f: "What it changes", a: "The input you send", b: "The context (adds retrieved facts)", c: "The model's weights" },
  { f: "Best for", a: "Behavior, format, tone", b: "Knowledge, fresh & private data", c: "Consistent specialized skill at scale" },
  { f: "Cost & effort", a: "≈ free, instant", b: "Medium (build a pipeline)", c: "High (data + training + upkeep)" },
  { f: "Update facts by", a: "Editing the prompt", b: "Updating the index (no retrain)", c: "Re-training (slow)" },
  { f: "Gives citations?", a: "No", b: "Yes 🎯", c: "No" },
];

export default function FineTuningVsRagPage() {
  return (
    <ConceptPage
      slug="fine-tuning-vs-rag"
      analogy={
        <FunnyAnalogy
          emoji="🎓"
          color="var(--neon-pink)"
          alternates={[
            { emoji: "🗒️", text: "Prompting is a sticky note of instructions. RAG is handing them the right reference book. Fine-tuning is sending them to school for a semester." },
            { emoji: "🧑‍🍳", text: "Want a dish made your way? Tell the chef (prompt), give them your recipe card (RAG), or train them for months until it's muscle memory (fine-tune)." },
          ]}
        >
          &quot;The model isn&apos;t good enough&quot; has three very different fixes, and picking the wrong one wastes months.
          The trick is to diagnose the gap first: is it a <strong className="text-neon-green">knowledge</strong> problem
          (it doesn&apos;t <em>know</em> something) or a <strong className="text-neon-blue">behavior</strong> problem (it
          doesn&apos;t <em>act</em> the way you want)? Knowledge → RAG. Behavior → prompting, then fine-tuning.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The mental model" title="Three different levers on the same model">
          <p className="mb-4 text-ink-secondary">
            Each technique touches a different part of the system. Prompting shapes the <em>input</em>. RAG enriches the{" "}
            <em>context</em> with retrieved facts. Fine-tuning alters the <em>weights</em> themselves. Click each lever.
          </p>
          <AnimatedDiagram
            height={300}
            nodes={[
              { id: "prompt", type: "client", label: "Prompt", position: { x: 12, y: 20 }, status: "active", info: "PROMPTING: change the instructions & examples you send. Cheapest, instant, great for behavior/format. Always try this first." },
              { id: "rag", type: "vector", label: "Retrieved docs", position: { x: 12, y: 80 }, status: "active", info: "RAG: fetch relevant facts and add them to the context at query time. Fixes knowledge gaps; stays fresh; supports citations." },
              { id: "llm", type: "llm", label: "LLM", position: { x: 48, y: 50 }, status: "busy", info: "The model. Prompting & RAG feed its input; fine-tuning rewires the model itself." },
              { id: "weights", type: "tool", label: "Fine-tune weights", position: { x: 48, y: 92 }, status: "idle", info: "FINE-TUNING: retrain on examples so a behavior/skill is baked in. Powerful but expensive; bakes in behavior, not fresh facts." },
              { id: "out", type: "client", label: "Output", position: { x: 86, y: 50 }, status: "active", info: "Better output — via whichever lever actually matched your gap." },
            ]}
            edges={[
              { from: "prompt", to: "llm", animated: true, color: "var(--neon-blue)", label: "input" },
              { from: "rag", to: "llm", animated: true, color: "var(--neon-green)", label: "context" },
              { from: "weights", to: "llm", dashed: true, color: "var(--neon-pink)", label: "retrain" },
              { from: "llm", to: "out", animated: true, color: "var(--neon-purple)" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Try it" title="Diagnose your gap, get a recommendation">
          <DecisionPicker />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Side by side" title="The cheat sheet">
          <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-[var(--border-subtle)] bg-bg-tertiary/60 px-3 py-2 font-display text-xs uppercase tracking-wide text-ink-muted"> </th>
                  <th className="border-b border-[var(--border-subtle)] bg-bg-tertiary/60 px-3 py-2 font-display text-xs uppercase tracking-wide" style={{ color: "var(--neon-blue)" }}>Prompting</th>
                  <th className="border-b border-[var(--border-subtle)] bg-bg-tertiary/60 px-3 py-2 font-display text-xs uppercase tracking-wide" style={{ color: "var(--neon-green)" }}>RAG</th>
                  <th className="border-b border-[var(--border-subtle)] bg-bg-tertiary/60 px-3 py-2 font-display text-xs uppercase tracking-wide" style={{ color: "var(--neon-pink)" }}>Fine-tuning</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.f}>
                    <td className="border-t border-[var(--border-subtle)] px-3 py-2 font-medium text-white">{r.f}</td>
                    <td className="border-t border-[var(--border-subtle)] px-3 py-2 text-ink-secondary">{r.a}</td>
                    <td className="border-t border-[var(--border-subtle)] px-3 py-2 text-ink-secondary">{r.b}</td>
                    <td className="border-t border-[var(--border-subtle)] px-3 py-2 text-ink-secondary">{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-ink-secondary">
            The golden order: <strong className="text-neon-blue">prompt</strong> →{" "}
            <strong className="text-neon-green">RAG</strong> → <strong className="text-neon-pink">fine-tune</strong>.
            Climb the ladder only when the cheaper rung genuinely fails. Most &quot;we need to fine-tune&quot; instincts are
            solved by a better prompt or better retrieval.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="fine-tuning-vs-rag"
          questions={[
            {
              question: "Your bot needs to answer from your company's internal docs. Best first tool?",
              options: ["Fine-tuning", "RAG", "A higher temperature", "A bigger context window only"],
              correct: 1,
              explain: "That's a knowledge gap with private/fresh data — RAG injects the right docs at query time, no retraining.",
            },
            {
              question: "What does fine-tuning actually change?",
              options: [
                "The retrieved documents",
                "The model's weights — baking in a behavior or skill",
                "The prompt template",
                "The vector database",
              ],
              correct: 1,
              explain: "Fine-tuning retrains the model itself. It changes behavior/skill, not fresh knowledge.",
            },
            {
              question: "Which technique gives you citations and stays current without retraining?",
              options: ["Prompting", "RAG", "Fine-tuning", "None of them"],
              correct: 1,
              explain: "RAG retrieves real sources, so it can cite them and you update facts by re-indexing — no retrain.",
            },
            {
              question: "What's the recommended order to try these?",
              options: [
                "Fine-tune first, always",
                "Prompting → RAG → fine-tuning, climbing only when the cheaper option fails",
                "RAG → prompting → fine-tuning",
                "Whichever is most exciting",
              ],
              correct: 1,
              explain: "Start cheap and simple. Most 'we must fine-tune' problems are solved by better prompts or retrieval.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
