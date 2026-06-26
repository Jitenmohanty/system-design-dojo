"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Check } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";

// ---------- Retrieval demo ----------
const CORPUS = [
  { id: 1, text: "Nimbus Pro refunds are processed within 5 business days to the original payment method.", tags: ["refund", "money", "days", "payment"] },
  { id: 2, text: "To reset your Nimbus password, click 'Forgot password' and check your email for a reset link.", tags: ["password", "reset", "login", "email"] },
  { id: 3, text: "The Nimbus free tier includes 3 projects and 1 GB of storage. Paid plans start at $12/month.", tags: ["pricing", "free", "tier", "storage", "plan"] },
  { id: 4, text: "Nimbus servers are hosted in the EU and data is encrypted at rest with AES-256.", tags: ["security", "encryption", "eu", "data"] },
  { id: 5, text: "You can export your Nimbus data anytime as JSON or CSV from Settings → Export.", tags: ["export", "data", "json", "csv", "settings"] },
];

const QUESTIONS = [
  { q: "How long do refunds take?", keys: ["refund", "days", "money"] },
  { q: "How do I reset my password?", keys: ["password", "reset", "login"] },
  { q: "What does the free plan include?", keys: ["free", "tier", "pricing", "plan"] },
];

function score(keys: string[], tags: string[]) {
  return keys.reduce((s, k) => s + (tags.includes(k) ? 1 : 0), 0);
}

function RagLab() {
  const [qIdx, setQIdx] = useState(0);
  const [phase, setPhase] = useState<"idle" | "embed" | "retrieve" | "answer">("idle");

  const question = QUESTIONS[qIdx];
  const ranked = useMemo(() => {
    return CORPUS
      .map((c) => ({ ...c, s: score(question.keys, c.tags) }))
      .sort((a, b) => b.s - a.s);
  }, [question]);
  const topK = ranked.filter((r) => r.s > 0).slice(0, 2);
  const topIds = new Set(topK.map((r) => r.id));

  const run = () => {
    setPhase("embed");
    setTimeout(() => setPhase("retrieve"), 800);
    setTimeout(() => setPhase("answer"), 1800);
  };

  const reset = (i: number) => { setQIdx(i); setPhase("idle"); };

  const answers: Record<number, string> = {
    0: "Refunds are processed within 5 business days to your original payment method.",
    1: "Click 'Forgot password', then check your email for a reset link.",
    2: "The free tier includes 3 projects and 1 GB of storage.",
  };

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-wrap gap-1.5">
        {QUESTIONS.map((qq, i) => (
          <button
            key={qq.q}
            onClick={() => reset(i)}
            className="chip transition"
            style={i === qIdx ? { borderColor: "var(--neon-pink)", color: "var(--neon-pink)", background: "rgba(255,59,107,0.1)" } : undefined}
          >
            {qq.q}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-bg-tertiary/60 p-3">
        <Search size={15} className="text-neon-pink" />
        <span className="flex-1 text-sm text-white">{question.q}</span>
        <button onClick={run} className="btn-neon px-3 py-1.5 text-xs">Run RAG</button>
      </div>

      {/* knowledge base */}
      <div className="mt-4">
        <div className="mb-2 mono text-[0.65rem] uppercase tracking-widest text-ink-muted">Knowledge base (your docs)</div>
        <div className="space-y-1.5">
          {ranked.map((c) => {
            const retrieved = (phase === "retrieve" || phase === "answer") && topIds.has(c.id);
            return (
              <motion.div
                key={c.id}
                animate={{
                  borderColor: retrieved ? "var(--neon-green)" : "var(--border-subtle)",
                  opacity: phase === "retrieve" || phase === "answer" ? (topIds.has(c.id) ? 1 : 0.4) : 1,
                }}
                className="flex items-start gap-2 rounded-lg border bg-bg-primary/40 p-2.5"
              >
                <FileText size={14} className="mt-0.5 shrink-0" style={{ color: retrieved ? "var(--neon-green)" : "var(--text-muted)" }} />
                <span className="flex-1 text-xs text-ink-secondary">{c.text}</span>
                {retrieved && (
                  <span className="chip shrink-0" style={{ borderColor: "var(--neon-green)", color: "var(--neon-green)" }}>
                    <Check size={10} /> top match
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* status / answer */}
      <div className="mt-4 min-h-[64px] rounded-xl border border-[var(--border-subtle)] bg-bg-primary/40 p-3">
        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.p key="i" className="text-sm text-ink-muted">Hit <span className="text-neon-pink">Run RAG</span> to embed the question, retrieve the closest docs, and answer grounded in them.</motion.p>
          )}
          {phase === "embed" && (
            <motion.p key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-neon-purple">🔢 Embedding the question into a vector…</motion.p>
          )}
          {phase === "retrieve" && (
            <motion.p key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-neon-green">📚 Retrieved the {topK.length} nearest chunks. Stuffing them into the prompt…</motion.p>
          )}
          {phase === "answer" && (
            <motion.div key="a" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <span className="chip" style={{ borderColor: "var(--neon-pink)", color: "var(--neon-pink)" }}>grounded answer</span>
              <p className="mt-2 text-sm text-white">{answers[qIdx]}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function RagPage() {
  return (
    <ConceptPage
      slug="rag"
      analogy={
        <FunnyAnalogy
          emoji="📖"
          color="var(--neon-pink)"
          alternates={[
            { emoji: "🧑‍⚖️", text: "Like a smart lawyer who doesn't memorize every case — they look up the relevant ones, then argue from the text in front of them." },
            { emoji: "🔖", text: "It's the difference between answering from memory and answering with the textbook open to the right page." },
          ]}
        >
          An LLM&apos;s knowledge is frozen and it has no clue about <em>your</em> private docs. RAG fixes both by turning a
          closed-book exam into an <strong className="text-neon-pink">open-book</strong> one: before answering, go{" "}
          <strong className="text-neon-green">retrieve</strong> the most relevant snippets from your data and paste them
          into the prompt. The model then answers from the page, not from vibes.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="Why it exists" title="The two problems RAG solves">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card p-4">
              <div className="font-display font-semibold text-white">🕰️ Stale & generic</div>
              <p className="mt-1.5 text-sm text-ink-secondary">The model&apos;s training is frozen and knows nothing about your company&apos;s docs, last week&apos;s tickets, or this user&apos;s data.</p>
            </div>
            <div className="card p-4">
              <div className="font-display font-semibold text-white">🤥 Hallucination</div>
              <p className="mt-1.5 text-sm text-ink-secondary">Ask about something it doesn&apos;t know and it invents a confident answer. Grounding it in real text gives it something true to copy from.</p>
            </div>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The pipeline" title="Two phases: index once, retrieve every time">
          <p className="mb-4 text-ink-secondary">
            <strong className="text-white">Offline (once):</strong> chop docs into chunks, embed each, store the vectors.{" "}
            <strong className="text-white">Online (per query):</strong> embed the question, find the nearest chunks, and
            hand them to the LLM with the question. Hover an edge to trace the flow; click a node for detail.
          </p>
          <AnimatedDiagram
            height={300}
            nodes={[
              { id: "user", type: "client", label: "Question", position: { x: 8, y: 50 }, status: "active", info: "The user's question — about data the model was never trained on." },
              { id: "embed", type: "llm", label: "Embed", position: { x: 30, y: 50 }, status: "busy", info: "An embedding model turns the question into a vector so it can be compared to stored chunks." },
              { id: "vdb", type: "vector", label: "Vector DB", position: { x: 52, y: 50 }, status: "active", info: "Stores your document chunks as vectors. Returns the top-k nearest neighbors to the query vector." },
              { id: "llm", type: "llm", label: "LLM", position: { x: 76, y: 30 }, status: "active", info: "Receives the question + retrieved chunks stuffed into its prompt, and writes a grounded answer." },
              { id: "ans", type: "client", label: "Answer", position: { x: 94, y: 60 }, status: "active", info: "An answer backed by your real documents — ideally with citations to the chunks used." },
            ]}
            edges={[
              { from: "user", to: "embed", animated: true, label: "text" },
              { from: "embed", to: "vdb", animated: true, color: "var(--neon-purple)", label: "vector" },
              { from: "vdb", to: "llm", animated: true, color: "var(--neon-green)", label: "top-k chunks" },
              { from: "user", to: "llm", dashed: true, label: "question" },
              { from: "llm", to: "ans", animated: true, color: "var(--neon-pink)" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Try it" title="Watch retrieval pick the right chunks">
          <RagLab />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Where it goes wrong" title="RAG failure modes (and fixes)">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: "🔪", t: "Bad chunking", d: "Chunks too big = noise; too small = lost context. Split on meaning (sections/paragraphs), with a little overlap." },
              { emoji: "🎯", t: "Wrong retrieval", d: "If the nearest chunk isn't the right one, the answer is doomed. Re-rankers and hybrid keyword+vector search help." },
              { emoji: "📏", t: "Too many chunks", d: "Stuffing 50 chunks blows the budget and buries the answer. Retrieve few, high-quality ones." },
              { emoji: "🔗", t: "No citations", d: "Always pass which chunk each claim came from so users (and you) can verify the answer is grounded." },
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
          slug="rag"
          questions={[
            {
              question: "What does the 'retrieval' in RAG actually retrieve?",
              options: [
                "A fresh copy of the model",
                "The most relevant chunks of your documents, found by vector similarity",
                "The user's password",
                "A random web page",
              ],
              correct: 1,
              explain: "Retrieval finds the nearest chunks to the question in your vector store, then feeds them to the LLM.",
            },
            {
              question: "Which step happens OFFLINE (once), not on every query?",
              options: [
                "Embedding the user's question",
                "Chunking and embedding your documents into the vector DB",
                "Generating the final answer",
                "Retrieving top-k chunks",
              ],
              correct: 1,
              explain: "Indexing your docs is done once up front. Per query you only embed the question, retrieve, and answer.",
            },
            {
              question: "Why does RAG reduce hallucination?",
              options: [
                "It makes the model bigger",
                "It gives the model real, relevant text to ground its answer in",
                "It lowers the temperature to 0",
                "It blocks the model from answering",
              ],
              correct: 1,
              explain: "With the right source text in context, the model copies from facts instead of inventing them.",
            },
            {
              question: "Your RAG answers are wrong even though the info exists in your docs. First thing to suspect?",
              options: [
                "The model is broken",
                "Retrieval is surfacing the wrong chunks (chunking/search quality)",
                "You need a bigger temperature",
                "The internet is down",
              ],
              correct: 1,
              explain: "If the right chunk never gets retrieved, the LLM can't use it. Fix chunking and retrieval quality first.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
