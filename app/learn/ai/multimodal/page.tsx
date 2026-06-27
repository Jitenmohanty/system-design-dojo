"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, Play, Image as ImageIcon } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";

// ---------- Diffusion (denoising) demo ----------
// A pixel-art heart the noise resolves into.
const ART = [
  ".XX...XX.",
  "XXXXXXXXX",
  "XXXXXXXXX",
  "XXXXXXXXX",
  ".XXXXXXX.",
  "..XXXXX..",
  "...XXX...",
  "....X....",
];
const COLS = ART[0].length;
const ROWS = ART.length;
const STEPS = 16;

// deterministic pseudo-noise per cell (no Math.random → no hydration mismatch).
// Rounded to 4 decimals so the server (Node) and client (browser) JS engines
// produce byte-identical style strings — full-precision Math.sin can differ in
// the last bits across engines and trip a hydration warning.
function noiseAt(i: number) {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return Math.round((v - Math.floor(v)) * 10000) / 10000; // 0..1, 4 dp
}

function DiffusionDemo() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (step >= STEPS) { setPlaying(false); return; }
    const id = setTimeout(() => setStep((s) => s + 1), 130);
    return () => clearTimeout(id);
  }, [playing, step]);

  const p = step / STEPS; // 0 = pure noise, 1 = clean image
  const cells = useMemo(() => {
    const out: { isTarget: boolean; n: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        out.push({ isTarget: ART[r][c] === "X", n: noiseAt(r * COLS + c) });
      }
    }
    return out;
  }, []);

  const play = () => { if (step >= STEPS) setStep(0); setPlaying(true); };

  return (
    <div className="card p-5">
      <div className="grid items-center gap-5 sm:grid-cols-[auto_1fr]">
        <div className="mx-auto rounded-xl bg-bg-primary/60 p-3" style={{ display: "grid", gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: 2, width: 200 }}>
          {cells.map((cell, i) => {
            // target cells fade IN; noise specks fade OUT
            const targetOpacity = cell.isTarget ? 0.15 + 0.85 * p : 0;
            const noiseOpacity = (1 - p) * cell.n;
            const showTarget = cell.isTarget && p > cell.n * 0.7; // resolves gradually
            return (
              <div key={i} className="aspect-square rounded-[2px]" style={{
                background: showTarget
                  ? `rgba(255,59,107,${targetOpacity})`
                  : `rgba(${Math.round(cell.n * 255)},${Math.round((1 - cell.n) * 200)},255,${noiseOpacity})`,
              }} />
            );
          })}
        </div>

        <div>
          <div className="rounded-lg bg-bg-tertiary/60 p-2.5 text-sm">
            <span className="mono text-[0.6rem] uppercase tracking-wider text-ink-muted">prompt</span>
            <p className="text-white">&quot;a glowing pink heart&quot; ❤️</p>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs">
              <span className="mono text-ink-secondary">denoising step</span>
              <span className="mono font-bold" style={{ color: p > 0.66 ? "var(--neon-pink)" : p > 0.33 ? "var(--neon-yellow)" : "var(--neon-blue)" }}>
                {step}/{STEPS} {step === 0 ? "· pure noise" : step >= STEPS ? "· done" : "· refining"}
              </span>
            </div>
            <input type="range" min={0} max={STEPS} step={1} value={step} onChange={(e) => { setPlaying(false); setStep(parseInt(e.target.value)); }} className="w-full accent-[var(--neon-pink)]" />
          </div>
          <button onClick={play} disabled={playing} className="btn-neon mt-3 justify-center"><Play size={14} /> Generate</button>
        </div>
      </div>
      <p className="mt-4 text-xs text-ink-muted">
        Image models start from pure random <strong className="text-white">noise</strong> and remove a little of it each
        step, nudged by your prompt, until a picture emerges. That&apos;s <strong className="text-neon-pink">diffusion</strong> —
        sculpting signal out of static. Drag the slider to scrub the process by hand.
      </p>
    </div>
  );
}

export default function MultimodalPage() {
  return (
    <ConceptPage
      slug="multimodal"
      analogy={
        <FunnyAnalogy
          emoji="👁️"
          color="var(--neon-pink)"
          alternates={[
            { emoji: "🧑‍🎨", text: "A sculptor starts with a rough block and chips away until a statue appears. Diffusion starts with noise and removes it until an image appears." },
            { emoji: "🌐", text: "Once images, audio, and text all become vectors in one shared space, the model can 'translate' between them — describe a photo, draw a sentence, caption a sound." },
          ]}
        >
          Text was just the start. <strong className="text-neon-pink">Multimodal</strong> models take in images, audio,
          even video — and some generate them too. The unlock is the same trick from earlier: <em>everything</em> becomes{" "}
          <strong className="text-neon-purple">tokens and embeddings</strong>. Once a photo and a sentence live in the
          same vector space, the model can reason across them as easily as it reads text.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The big idea" title="One space to rule them all">
          <p className="text-ink-secondary">
            A multimodal model doesn&apos;t have a separate &quot;eye brain&quot; and &quot;word brain.&quot; It runs each input through an
            encoder that maps it into the <strong className="text-white">same embedding space</strong> as text. A picture
            of a dog and the word &quot;dog&quot; land near each other. After that, understanding an image is just more context
            in the prompt — the model reasons over it the way it reasons over words.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="How understanding works" title="Everything funnels into one embedding space">
          <p className="mb-4 text-ink-secondary">
            Different encoders, one shared meaning space, one model. Click a node.
          </p>
          <AnimatedDiagram
            height={300}
            nodes={[
              { id: "img", type: "client", label: "🖼️ Image", position: { x: 9, y: 22 }, status: "active", info: "An image is split into patches and encoded into vectors — the visual equivalent of tokens." },
              { id: "aud", type: "client", label: "🔊 Audio", position: { x: 9, y: 50 }, status: "active", info: "Audio is turned into vectors too (e.g. via a spectrogram), so speech and sound become 'tokens'." },
              { id: "txt", type: "client", label: "📝 Text", position: { x: 9, y: 78 }, status: "active", info: "Text is tokenized and embedded as you saw in Tokens & Embeddings." },
              { id: "space", type: "vector", label: "Shared embeddings", position: { x: 42, y: 50 }, status: "busy", info: "All modalities are projected into ONE vector space, so a dog photo and the word 'dog' sit close together." },
              { id: "model", type: "llm", label: "Model", position: { x: 70, y: 50 }, status: "active", info: "Reasons over the mixed embeddings — text + image + audio — all as context in the same prompt." },
              { id: "out", type: "client", label: "Answer", position: { x: 92, y: 50 }, status: "active", info: "e.g. 'There are 3 dogs; the brown one is mid-jump' — visual reasoning expressed in text." },
            ]}
            edges={[
              { from: "img", to: "space", animated: true, color: "var(--neon-blue)" },
              { from: "aud", to: "space", animated: true, color: "var(--neon-orange)" },
              { from: "txt", to: "space", animated: true, color: "var(--neon-green)" },
              { from: "space", to: "model", animated: true, color: "var(--neon-purple)" },
              { from: "model", to: "out", animated: true, color: "var(--neon-pink)" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Try it" title="How an image is generated: diffusion">
          <DiffusionDemo />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The landscape" title="What multimodal unlocks">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: "🔎", t: "Vision understanding", d: "Read a chart, extract text from a receipt (OCR), describe a photo, debug a screenshot. Input = image, output = text." },
              { emoji: "🎨", t: "Image generation", d: "Diffusion models paint from a prompt by denoising. Text-to-image, inpainting, style transfer." },
              { emoji: "🗣️", t: "Speech in & out", d: "Transcription (audio→text) and natural text-to-speech (text→audio) power real-time voice agents." },
              { emoji: "🖥️", t: "Computer / browser use", d: "A model that 'sees' a screen can click and type — the basis of agents that operate real software." },
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
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-neon-purple/30 bg-neon-purple/5 p-3">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-neon-purple" />
            <p className="text-sm text-ink-secondary">
              Why agents care: vision turns the whole visual world into tool input. An agent that can <ImageIcon size={13} className="inline" /> see
              a screen, a PDF, or a dashboard can act on things that were never an API — that&apos;s how &quot;computer use&quot; agents work.
            </p>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="multimodal"
          questions={[
            {
              question: "How does a multimodal model handle an image and text together?",
              options: [
                "It has separate brains it switches between",
                "It encodes both into the same shared embedding space and reasons over them together",
                "It converts the image to text first with OCR only",
                "It can't — text and images are incompatible",
              ],
              correct: 1,
              explain: "Each modality is encoded into one shared vector space, so the model reasons across them as one context.",
            },
            {
              question: "In one sentence, how does diffusion generate an image?",
              options: [
                "It copies the closest image from training",
                "It starts from random noise and removes a bit each step, guided by the prompt, until an image emerges",
                "It draws pixel by pixel left to right",
                "It searches the web for a match",
              ],
              correct: 1,
              explain: "Diffusion iteratively denoises random static into a coherent image, steered by your prompt.",
            },
            {
              question: "Why is vision a big deal for AI agents specifically?",
              options: [
                "It makes them faster",
                "Seeing a screen/PDF/dashboard turns things that were never APIs into actionable input ('computer use')",
                "It reduces token cost",
                "It removes the need for tools",
              ],
              correct: 1,
              explain: "If an agent can see a UI, it can operate software directly — no API required. That's computer-use.",
            },
            {
              question: "What makes the 'one shared space' idea so powerful?",
              options: [
                "It compresses files",
                "Similar meanings across modalities land near each other, so the model can relate a photo to a word",
                "It speeds up training only",
                "It encrypts the data",
              ],
              correct: 1,
              explain: "A dog photo and the word 'dog' sit close in the shared space, enabling cross-modal reasoning.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
