"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Hash, Sparkles } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// ---------- Tokenizer demo (approximate BPE) ----------
const TOKEN_COLORS = [
  "var(--neon-blue)", "var(--neon-green)", "var(--neon-purple)",
  "var(--neon-orange)", "var(--neon-pink)", "var(--neon-yellow)",
];

function tokenize(text: string): string[] {
  if (!text) return [];
  // split keeping whitespace + punctuation, then break long words into ~4-char chunks
  const raw = text.match(/\s+|[^\s\w]+|\w+/g) ?? [];
  const out: string[] = [];
  for (const piece of raw) {
    if (/^\w+$/.test(piece) && piece.length > 6) {
      for (let i = 0; i < piece.length; i += 4) out.push(piece.slice(i, i + 4));
    } else {
      out.push(piece);
    }
  }
  return out;
}

function TokenizerLab() {
  const [text, setText] = useState("Tokenization turns text into numbers!");
  const tokens = useMemo(() => tokenize(text), [text]);
  const visible = tokens.filter((t) => t.trim() !== "");

  return (
    <div className="card p-5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        className="field w-full resize-none"
        placeholder="Type anything…"
      />
      <div className="mt-4 flex flex-wrap gap-1 rounded-xl bg-bg-tertiary/50 p-3">
        {visible.length === 0 ? (
          <span className="text-sm text-ink-muted">Tokens will appear here…</span>
        ) : (
          tokens.map((tok, i) =>
            tok.trim() === "" ? (
              <span key={i} style={{ width: tok.length * 4 }} />
            ) : (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.012 }}
                className="rounded-md px-1.5 py-0.5 mono text-xs"
                style={{
                  background: `${TOKEN_COLORS[i % TOKEN_COLORS.length]}22`,
                  color: TOKEN_COLORS[i % TOKEN_COLORS.length],
                  border: `1px solid ${TOKEN_COLORS[i % TOKEN_COLORS.length]}55`,
                }}
              >
                {tok}
              </motion.span>
            )
          )
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5">
          <Hash size={14} className="text-neon-pink" />
          <span className="mono font-bold text-neon-pink">{visible.length}</span>
          <span className="text-ink-secondary">tokens</span>
        </span>
        <span className="text-ink-secondary">
          <span className="mono text-white">{text.length}</span> characters
        </span>
        <span className="text-ink-muted">
          ≈ <span className="mono">{visible.length ? (text.replace(/\s/g, "").length / visible.length).toFixed(1) : "0"}</span> chars/token
        </span>
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        Rule of thumb: ~4 characters ≈ 1 token in English. Common words are a single token; rare or long words get
        chopped into pieces. This is exactly how your API bill is counted — and how the context window fills up.
      </p>
    </div>
  );
}

// ---------- 2D embedding map ----------
type WordVec = { w: string; x: number; y: number; group: string };
const WORDS: WordVec[] = [
  { w: "king", x: 18, y: 22, group: "royalty" },
  { w: "queen", x: 24, y: 30, group: "royalty" },
  { w: "throne", x: 14, y: 34, group: "royalty" },
  { w: "dog", x: 74, y: 26, group: "animal" },
  { w: "cat", x: 80, y: 32, group: "animal" },
  { w: "puppy", x: 70, y: 18, group: "animal" },
  { w: "wolf", x: 86, y: 22, group: "animal" },
  { w: "python", x: 50, y: 76, group: "tech" },
  { w: "code", x: 42, y: 70, group: "tech" },
  { w: "server", x: 56, y: 82, group: "tech" },
  { w: "pizza", x: 28, y: 78, group: "food" },
  { w: "sushi", x: 22, y: 70, group: "food" },
  { w: "taco", x: 34, y: 84, group: "food" },
];

function dist(a: WordVec, b: WordVec) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function EmbeddingMap() {
  const [selected, setSelected] = useState<string>("king");
  const sel = WORDS.find((w) => w.w === selected)!;

  const ranked = useMemo(() => {
    const others = WORDS.filter((w) => w.w !== selected);
    const max = Math.max(...others.map((o) => dist(sel, o)));
    return others
      .map((o) => ({ ...o, sim: 1 - dist(sel, o) / (max + 1) }))
      .sort((a, b) => b.sim - a.sim);
  }, [selected, sel]);

  const nearestSet = new Set(ranked.slice(0, 3).map((r) => r.w));

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-bg-secondary/40" style={{ height: 320 }}>
        {/* connection lines to nearest */}
        <svg className="absolute inset-0 h-full w-full">
          {ranked.slice(0, 3).map((r) => (
            <line
              key={r.w}
              x1={`${sel.x}%`} y1={`${sel.y}%`} x2={`${r.x}%`} y2={`${r.y}%`}
              stroke="var(--neon-pink)" strokeWidth={1.4} strokeDasharray="4 4" opacity={0.5}
            />
          ))}
        </svg>
        {WORDS.map((w) => {
          const isSel = w.w === selected;
          const isNear = nearestSet.has(w.w);
          return (
            <button
              key={w.w}
              onClick={() => setSelected(w.w)}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 mono text-xs font-medium transition"
              style={{
                left: `${w.x}%`, top: `${w.y}%`,
                background: isSel ? "var(--neon-pink)" : isNear ? "rgba(255,59,107,0.18)" : "var(--bg-tertiary)",
                color: isSel ? "#0a0a0f" : isNear ? "var(--neon-pink)" : "var(--text-secondary)",
                border: `1px solid ${isSel || isNear ? "var(--neon-pink)" : "var(--border-subtle)"}`,
                boxShadow: isSel ? "0 0 16px -2px var(--neon-pink)" : undefined,
                zIndex: isSel ? 10 : 1,
              }}
            >
              {w.w}
            </button>
          );
        })}
        <span className="absolute bottom-2 right-3 mono text-[0.6rem] text-ink-muted">
          a 2-D toy view of a ~1000-D space
        </span>
      </div>

      <div className="card p-4">
        <div className="text-sm text-ink-secondary">
          Closest to <span className="mono font-bold text-neon-pink">{selected}</span>:
        </div>
        <div className="mt-3 space-y-1.5">
          {ranked.slice(0, 5).map((r) => (
            <div key={r.w} className="flex items-center gap-2">
              <span className="w-16 shrink-0 mono text-xs text-white">{r.w}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--neon-pink)" }}
                  initial={false}
                  animate={{ width: `${r.sim * 100}%` }}
                  transition={{ type: "spring", stiffness: 140, damping: 18 }}
                />
              </div>
              <span className="w-10 text-right mono text-[0.6rem] text-ink-muted">{r.sim.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          Click any word. Things that <em>mean</em> similar things sit close together — even though the model was
          never told what a king or a taco is. It learned geometry from usage.
        </p>
      </div>
    </div>
  );
}

export default function TokensEmbeddingsPage() {
  return (
    <ConceptPage
      slug="tokens-embeddings"
      analogy={
        <FunnyAnalogy
          emoji="🗺️"
          color="var(--neon-pink)"
          alternates={[
            { emoji: "🧱", text: "Tokens are Lego bricks: the model doesn't see letters or whole words, it sees a fixed set of reusable chunks it snaps together." },
            { emoji: "📍", text: "An embedding is a GPS coordinate for meaning. 'Paris' and 'France' live in the same neighborhood; 'Paris' and 'broccoli' are continents apart." },
          ]}
        >
          A model can&apos;t do math on the word <em>&quot;cat&quot;</em>. So we do two conversions: first chop text into{" "}
          <strong className="text-neon-pink">tokens</strong> (chunks of characters), then map each token to an{" "}
          <strong className="text-neon-purple">embedding</strong> — a long list of numbers that pins its{" "}
          <em>meaning</em> to a point in space. Words with similar meanings end up as neighbors.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="Step 1" title="Text becomes tokens">
          <p className="mb-4 text-ink-secondary">
            The model has a fixed vocabulary (often ~50k–200k tokens). Your text gets split into those chunks before
            anything else happens. Tokens are why the model &quot;sees&quot; <span className="mono text-neon-blue">straw</span>
            <span className="mono text-neon-green">berry</span> as two pieces and miscounts the r&apos;s — and why your bill
            and your context limit are measured in tokens, not words.
          </p>
          <TokenizerLab />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Step 2" title="Tokens become meaning (embeddings)">
          <p className="mb-4 text-ink-secondary">
            Each token is mapped to a vector — typically hundreds or thousands of numbers. The trick: the model
            arranges these vectors so that <strong className="text-white">distance = difference in meaning</strong>.
            This single idea powers semantic search, RAG, recommendations, and clustering.
          </p>
          <EmbeddingMap />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The payoff" title="Why embeddings are a superpower">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { emoji: "🔎", t: "Semantic search", d: "Search by meaning, not keywords. 'How do I reset my password?' finds a doc titled 'Account recovery'." },
              { emoji: "📐", t: "Cosine similarity", d: "Measure the angle between two vectors. Small angle = similar meaning. This is the math behind 'closest match'." },
              { emoji: "📚", t: "RAG fuel", d: "Embed your documents, embed the question, grab the nearest chunks. That's the whole retrieval half of RAG — next stop." },
            ].map((c) => (
              <div key={c.t} className="card p-4">
                <div className="text-xl">{c.emoji}</div>
                <div className="mt-1.5 font-display font-semibold text-white">{c.t}</div>
                <p className="mt-1 text-xs text-ink-secondary">{c.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-neon-purple/30 bg-neon-purple/5 p-3">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-neon-purple" />
            <p className="text-sm text-ink-secondary">
              Two different embeddings to keep straight: <strong className="text-white">token embeddings</strong> live{" "}
              inside the model. <strong className="text-white">Sentence/document embeddings</strong> are what you store
              in a vector database to search your own data. Same idea, different scale.
            </p>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="tokens-embeddings"
          questions={[
            {
              question: "Why is your LLM API bill measured in tokens, not words?",
              options: [
                "Tokens are random",
                "The model processes text as tokens, so that's the real unit of work",
                "Words are too hard to count",
                "It's just marketing",
              ],
              correct: 1,
              explain: "Everything the model reads and writes is tokens. ~4 characters ≈ 1 token in English.",
            },
            {
              question: "What does an embedding actually represent?",
              options: [
                "The spelling of a word",
                "A point in space that captures the word's meaning as numbers",
                "The token's position in the sentence",
                "A compressed image",
              ],
              correct: 1,
              explain: "An embedding is a vector — coordinates in 'meaning space' where similar meanings sit close together.",
            },
            {
              question: "Two embeddings have a very small cosine angle between them. That means…",
              options: [
                "They're spelled similarly",
                "They have similar meaning",
                "One is a typo of the other",
                "They're in different languages",
              ],
              correct: 1,
              explain: "Cosine similarity measures the angle between vectors — small angle means semantically close.",
            },
            {
              question: "How does an LLM 'know' that king and queen are related?",
              options: [
                "A human labeled them as related",
                "It learned from usage patterns that placed their vectors near each other",
                "They share letters",
                "It looks them up in a dictionary",
              ],
              correct: 1,
              explain: "Embeddings are learned from how words are used. Similar usage → nearby vectors, no manual labels needed.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
