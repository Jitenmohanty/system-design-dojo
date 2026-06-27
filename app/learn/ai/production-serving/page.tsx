"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Loader2, Trophy } from "lucide-react";
import Link from "next/link";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";

// ---------- Streaming vs blocking demo ----------
const WORDS = "Sure — here's a tight three-step plan to speed up your checkout flow.".split(" ");
const TTFT_STREAM = 300; // ms
const BLOCK_DONE = 2500; // ms
const PER_WORD = 90; // ms

function StreamingDemo() {
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (t >= BLOCK_DONE + 200) { setRunning(false); return; }
    const id = setTimeout(() => setT((x) => x + 100), 100);
    return () => clearTimeout(id);
  }, [running, t]);

  const run = () => { setT(0); setRunning(true); };
  const reset = () => { setT(0); setRunning(false); };

  const streamWords = t < TTFT_STREAM ? 0 : Math.min(WORDS.length, Math.floor((t - TTFT_STREAM) / PER_WORD));
  const blockingDone = t >= BLOCK_DONE;
  const started = t > 0;

  return (
    <div className="card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {/* blocking */}
        <div className="rounded-xl border border-neon-red/30 bg-neon-red/5 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-neon-red">⛔ Blocking</span>
            <span className="mono text-[0.65rem] text-ink-muted">first token: {started ? "2.5s" : "—"}</span>
          </div>
          <div className="mt-2 min-h-[72px] text-sm text-white">
            {!started ? <span className="text-ink-muted">—</span> : blockingDone ? WORDS.join(" ") : <span className="flex items-center gap-2 text-ink-muted"><Loader2 size={14} className="animate-spin" /> waiting for the whole reply…</span>}
          </div>
        </div>

        {/* streaming */}
        <div className="rounded-xl border border-neon-green/30 bg-neon-green/5 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-neon-green">⚡ Streaming</span>
            <span className="mono text-[0.65rem] text-ink-muted">first token: {started ? "0.3s" : "—"}</span>
          </div>
          <div className="mt-2 min-h-[72px] text-sm text-white">
            {!started ? <span className="text-ink-muted">—</span> : (
              <span>
                {WORDS.slice(0, streamWords).join(" ")}
                {streamWords < WORDS.length && <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="text-neon-green">▍</motion.span>}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={run} disabled={running} className="btn-neon justify-center"><Play size={14} /> Send the same request to both</button>
        <button onClick={reset} className="btn-ghost"><RotateCcw size={14} /> Reset</button>
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        The <em>total</em> time is identical — but streaming shows the first words almost instantly, so it <strong className="text-white">feels</strong> ~8× faster.
        Time-to-first-token (TTFT) is the latency users actually judge you on.
      </p>
    </div>
  );
}

export default function ProductionServingPage() {
  return (
    <ConceptPage
      slug="production-serving"
      analogy={
        <FunnyAnalogy
          emoji="🍽️"
          color="var(--neon-pink)"
          alternates={[
            { emoji: "🚰", text: "Streaming is a waiter bringing each dish as it's ready instead of making you stare at an empty table until everything's done." },
            { emoji: "💡", text: "Cost is a utility bill metered in tokens. Caching, batching, and right-sizing the model are how you stop overpaying." },
          ]}
        >
          A working prototype and a shippable product are different animals. In production three things decide whether
          users love it or leave: how <strong className="text-neon-green">fast</strong> it feels, how much it{" "}
          <strong className="text-neon-pink">costs</strong> per request, and how gracefully it handles scale. The good
          news: a handful of well-known techniques move all three at once.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="Latency that matters" title="Stream the answer — don't make them wait">
          <p className="mb-4 text-ink-secondary">
            LLMs generate token by token, so a long reply can take seconds. Make the user stare at a spinner and it
            feels broken. Stream the tokens as they&apos;re produced and the answer starts appearing almost immediately —
            same total time, wildly better experience. Run both and watch.
          </p>
          <StreamingDemo />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The serving path" title="Where requests go (and where you save)">
          <p className="mb-4 text-ink-secondary">
            A production LLM request rarely hits one model and stops. A router and caches sit in front to cut cost and
            latency. Click each node.
          </p>
          <AnimatedDiagram
            height={300}
            nodes={[
              { id: "user", type: "client", label: "Request", position: { x: 8, y: 50 }, status: "active", info: "Incoming user prompt. The cheapest, fastest token is the one you never generate." },
              { id: "cache", type: "cache", label: "Semantic cache", position: { x: 30, y: 50 }, status: "active", info: "Seen a similar question before? Return the cached answer instantly for ~$0. Huge win on repetitive traffic." },
              { id: "router", type: "loadbalancer", label: "Router", position: { x: 52, y: 50 }, status: "busy", info: "Classifies difficulty and routes: easy → small cheap model, hard → big strong model. Don't pay flagship prices for 'hello'." },
              { id: "small", type: "llm", label: "Small model", position: { x: 78, y: 24 }, status: "active", info: "Cheap & fast. Handles the easy majority — classification, short replies, routing." },
              { id: "big", type: "llm", label: "Strong model", position: { x: 78, y: 76 }, status: "active", info: "Expensive & smart. Reserved for the hard minority that actually needs it." },
              { id: "out", type: "client", label: "Stream out", position: { x: 95, y: 50 }, status: "active", info: "Tokens stream back to the user as they're generated — low time-to-first-token." },
            ]}
            edges={[
              { from: "user", to: "cache", animated: true },
              { from: "cache", to: "router", animated: true, color: "var(--neon-yellow)", label: "miss" },
              { from: "router", to: "small", animated: true, color: "var(--neon-green)", label: "easy" },
              { from: "router", to: "big", animated: true, color: "var(--neon-purple)", label: "hard" },
              { from: "small", to: "out", animated: true, color: "var(--neon-pink)" },
              { from: "big", to: "out", animated: true, color: "var(--neon-pink)" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The cost toolkit" title="Five levers on your bill">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: "🧠", t: "Prompt caching", d: "Reuse the processed prefix (system prompt, tools, docs) across calls. Cached input tokens are far cheaper and faster." },
              { emoji: "🚦", t: "Model routing", d: "Send easy requests to a small model, hard ones to the flagship. Most traffic is easy — most of your bill shouldn't be flagship." },
              { emoji: "🔁", t: "Semantic caching", d: "Cache answers to semantically similar questions. Repetitive queries return for near-zero cost and latency." },
              { emoji: "📦", t: "Batching", d: "Group many requests through the GPU together for big throughput gains. Great for offline/bulk jobs." },
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
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-neon-blue/30 bg-neon-blue/5 p-3">
            <span className="text-lg">💸</span>
            <p className="text-sm text-ink-secondary">
              The mental model: <strong className="text-white">cost ≈ tokens in + tokens out</strong>, and{" "}
              <strong className="text-white">latency ≈ tokens out</strong>. Every optimization is really about generating
              fewer tokens, reusing tokens, or generating them on a cheaper machine. Trim prompts, cache aggressively, and
              right-size the model.
            </p>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="🥋 Red belt earned" title="You made it to the end of the dojo">
          <div className="card neon-border p-6 text-center">
            <Trophy size={34} className="mx-auto text-neon-pink" />
            <p className="mt-3 text-ink-secondary">
              You went from <span className="mono text-neon-purple">&quot;what is a token?&quot;</span> to designing and{" "}
              <em>shipping</em> bounded, secure, fast AI agents. The whole stack: prediction → meaning → prompting →
              reasoning → structured output → retrieval → customization → multimodal → tools → MCP → the agent loop →
              memory → multi-agent → architecture → security → guardrails → production.
            </p>
            <p className="mt-3 text-sm text-neon-pink">That&apos;s the Red Belt. Now go build something real — fast, cheap, and on the rails. 🛡️⚡</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/learn/ai/agent-design" className="btn-ghost text-sm">Revisit: Design an Agent</Link>
              <Link href="/blog/when-to-use-an-ai-agent" className="btn-neon text-sm">Read: When to use an agent →</Link>
            </div>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="production-serving"
          questions={[
            {
              question: "Why stream tokens instead of returning the full reply at once?",
              options: [
                "It makes the total time shorter",
                "It slashes time-to-first-token, so the response feels far faster even though total time is the same",
                "It reduces token cost",
                "It improves accuracy",
              ],
              correct: 1,
              explain: "Streaming improves perceived latency: users see words immediately instead of staring at a spinner.",
            },
            {
              question: "What is model routing?",
              options: [
                "Load-balancing across identical models",
                "Sending easy requests to a small cheap model and hard ones to a strong expensive model",
                "Caching embeddings",
                "Encrypting traffic",
              ],
              correct: 1,
              explain: "Match the model to the difficulty. Most traffic is easy — don't pay flagship prices for it.",
            },
            {
              question: "Prompt caching saves money by…",
              options: [
                "Deleting old prompts",
                "Reusing the processed prefix (system prompt, tools, docs) across calls, so those input tokens are cheaper",
                "Lowering the temperature",
                "Skipping the model entirely",
              ],
              correct: 1,
              explain: "A cached prefix doesn't need reprocessing each call — cheaper and faster input tokens.",
            },
            {
              question: "Quick mental model for an LLM bill?",
              options: [
                "Cost depends only on the number of users",
                "Cost ≈ tokens in + tokens out; latency ≈ tokens out",
                "It's a flat monthly fee regardless of usage",
                "Cost ≈ temperature × users",
              ],
              correct: 1,
              explain: "Optimizing cost/latency is mostly about generating fewer tokens, reusing tokens, or using a cheaper model.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
