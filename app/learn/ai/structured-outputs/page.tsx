"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileJson, Check } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";

// ---------- Extraction demo ----------
const SAMPLES = [
  {
    text: "Book a table for 4 at 7pm tomorrow under Alex, somewhere quiet please.",
    fields: [
      { k: "intent", v: "create_reservation" },
      { k: "party_size", v: "4" },
      { k: "time", v: "19:00" },
      { k: "name", v: "Alex" },
      { k: "preference", v: "quiet" },
    ],
  },
  {
    text: "Ugh my order #8841 still hasn't shipped and I want a refund ASAP!!!",
    fields: [
      { k: "intent", v: "refund_request" },
      { k: "order_id", v: "8841" },
      { k: "sentiment", v: "angry" },
      { k: "priority", v: "high" },
    ],
  },
];

function ExtractionDemo() {
  const [idx, setIdx] = useState(0);
  const [extracted, setExtracted] = useState(false);
  const sample = SAMPLES[idx];

  const pick = (i: number) => { setIdx(i); setExtracted(false); };

  return (
    <div className="card p-5">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {SAMPLES.map((s, i) => (
          <button key={i} onClick={() => pick(i)} className="chip transition" style={i === idx ? { borderColor: "var(--neon-pink)", color: "var(--neon-pink)", background: "rgba(255,59,107,0.1)" } : undefined}>
            Example {i + 1}
          </button>
        ))}
      </div>

      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        {/* messy input */}
        <div className="rounded-xl bg-bg-tertiary/60 p-3">
          <span className="mono text-[0.6rem] uppercase tracking-wider text-ink-muted">Messy human text</span>
          <p className="mt-1 text-sm text-white">{sample.text}</p>
        </div>

        <div className="text-center text-ink-muted">→</div>

        {/* structured output */}
        <div className="rounded-xl border border-neon-green/30 bg-neon-green/5 p-3">
          <span className="mono text-[0.6rem] uppercase tracking-wider text-neon-green">Validated JSON</span>
          <div className="mt-1 min-h-[96px] mono text-xs">
            <AnimatePresence mode="wait">
              {extracted ? (
                <motion.div key="out" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <span className="text-ink-muted">{"{"}</span>
                  {sample.fields.map((f, i) => (
                    <motion.div key={f.k} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }} className="pl-3">
                      <span className="text-neon-purple">&quot;{f.k}&quot;</span>
                      <span className="text-ink-muted">: </span>
                      <span className="text-neon-green">&quot;{f.v}&quot;</span>
                      {i < sample.fields.length - 1 && <span className="text-ink-muted">,</span>}
                    </motion.div>
                  ))}
                  <span className="text-ink-muted">{"}"}</span>
                </motion.div>
              ) : (
                <motion.p key="empty" className="pt-6 text-center text-ink-muted">Hit extract →</motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <button onClick={() => setExtracted(true)} className="btn-neon mt-4 justify-center"><FileJson size={15} /> Extract to schema</button>
      <p className="mt-3 text-xs text-ink-muted">
        Same idea powers classification, data entry from emails/PDFs, and the <em>arguments</em> of every tool call.
        The model fills a predefined form instead of writing a paragraph you&apos;d have to parse with regex and prayer.
      </p>
    </div>
  );
}

export default function StructuredOutputsPage() {
  return (
    <ConceptPage
      slug="structured-outputs"
      analogy={
        <FunnyAnalogy
          emoji="📋"
          color="var(--neon-pink)"
          alternates={[
            { emoji: "🧾", text: "A blank page invites an essay. A form with labeled boxes gets you exactly the fields you need — no more, no less." },
            { emoji: "🔌", text: "Free text is a handshake between humans. JSON is the connector that snaps into the rest of your software." },
          ]}
        >
          Prose is lovely for humans and useless for code. The moment an LLM&apos;s output has to feed another
          program — a database, an API, the next step of an agent — you need it in a <strong className="text-neon-green">
          predictable shape</strong>. Structured outputs make the model fill a <strong className="text-neon-pink">schema</strong>
          (a typed form) instead of free-styling, so you can trust <span className="mono">result.party_size</span> exists
          and is a number.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The problem" title="&quot;Sure, here's your data!&quot; is not data">
          <p className="text-ink-secondary">
            Ask a plain model for JSON and it might wrap it in chatty text, use the wrong key, add a trailing comma, or
            return a number as a word. Your parser explodes in production. The whole point of structured outputs is to
            remove that gamble: constrain generation so the result is <em>guaranteed</em> to match a shape your code can
            rely on.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Try it" title="Messy text in, clean fields out">
          <ExtractionDemo />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="How it's enforced" title="The validate-and-retry loop">
          <p className="mb-4 text-ink-secondary">
            You pass a schema alongside the prompt. The model emits JSON; a validator checks it against the schema. If
            it&apos;s malformed or out of range, you reject and ask again — the model rarely makes the same mistake twice.
            Only valid data reaches your app. Click a node.
          </p>
          <AnimatedDiagram
            height={290}
            nodes={[
              { id: "prompt", type: "client", label: "Prompt + Schema", position: { x: 9, y: 50 }, status: "active", info: "You send the request AND a schema describing the exact shape (fields, types, allowed values) you want back." },
              { id: "llm", type: "llm", label: "LLM", position: { x: 38, y: 50 }, status: "busy", info: "Generates output constrained toward the schema — 'JSON mode' or constrained decoding keeps it on the rails." },
              { id: "valid", type: "gateway", label: "Validator", position: { x: 66, y: 50 }, status: "active", info: "Checks the JSON against the schema. Valid → pass it on. Invalid → bounce it back with the error." },
              { id: "app", type: "server", label: "Your app", position: { x: 91, y: 28 }, status: "active", info: "Receives data it can trust — typed, complete, parseable. No regex, no surprises." },
              { id: "retry", type: "llm", label: "Retry", position: { x: 66, y: 86 }, status: "idle", info: "On failure, re-ask with the validation error included. The model usually fixes it on attempt two." },
            ]}
            edges={[
              { from: "prompt", to: "llm", animated: true, label: "+ schema" },
              { from: "llm", to: "valid", animated: true, color: "var(--neon-purple)", label: "JSON" },
              { from: "valid", to: "app", animated: true, color: "var(--neon-green)", label: "valid ✓" },
              { from: "valid", to: "retry", dashed: true, color: "var(--neon-red)", label: "invalid" },
              { from: "retry", to: "llm", dashed: true },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Where you'll use it" title="It's everywhere once you look">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: "🏷️", t: "Classification & routing", d: "Force the output to one of a fixed set of labels (enum). No 'well, it could be either…' — just a clean category." },
              { emoji: "📤", t: "Extraction", d: "Pull fields out of emails, PDFs, or chat into typed records — the demo above. The death of manual data entry." },
              { emoji: "🛠️", t: "Tool arguments", d: "Every function call is structured output: the model fills the tool's parameter schema. Same machinery." },
              { emoji: "🧱", t: "UI generation", d: "Return a JSON spec your frontend renders into cards, forms, or charts — generative UI without free-text parsing." },
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
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-neon-green/30 bg-neon-green/5 p-3">
            <Check size={16} className="mt-0.5 shrink-0 text-neon-green" />
            <p className="text-sm text-ink-secondary">
              Tip: keep schemas <strong className="text-white">small and flat</strong>, name fields clearly, and use
              enums for fixed choices. The model follows a tight, well-described schema far more reliably than a sprawling nested one.
            </p>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="structured-outputs"
          questions={[
            {
              question: "Why ask an LLM for structured output instead of free text?",
              options: [
                "It's cheaper",
                "So another program can reliably consume it — guaranteed fields, types, and shape",
                "It uses fewer tokens always",
                "Free text is impossible",
              ],
              correct: 1,
              explain: "When output feeds code, you need a predictable shape you can parse and trust — that's the whole point.",
            },
            {
              question: "The model returns JSON that fails schema validation. What's the standard move?",
              options: [
                "Crash the app",
                "Reject it and re-ask with the validation error; the model usually fixes it",
                "Lower the temperature to 0 forever",
                "Switch to free text",
              ],
              correct: 1,
              explain: "Validate-and-retry: bounce invalid output back with the error, and it typically corrects on retry.",
            },
            {
              question: "Which of these is ALSO structured output under the hood?",
              options: [
                "A tool/function call's arguments",
                "The model's temperature",
                "The embedding dimension",
                "The context window size",
              ],
              correct: 0,
              explain: "Tool calls are structured output: the model fills the tool's parameter schema. Same mechanism.",
            },
            {
              question: "What makes a schema easy for the model to follow reliably?",
              options: [
                "Deeply nested with vague field names",
                "Small, flat, clearly-named fields with enums for fixed choices",
                "As many optional fields as possible",
                "No descriptions",
              ],
              correct: 1,
              explain: "Tight, well-described, flat schemas with enums get followed far more reliably than sprawling ones.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
