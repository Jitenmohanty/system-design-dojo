"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Server as ServerIcon, Globe, Cog } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const ENDPOINTS: Record<string, { status: number; emoji: string; quip: string; body: string }> = {
  "/menu": { status: 200, emoji: "✅", quip: "200 OK — here's your data, chef's kiss.", body: '{ "items": ["pizza", "ramen", "tacos"] }' },
  "/profile": { status: 200, emoji: "✅", quip: "200 OK — logged in and looking good.", body: '{ "user": "you", "belt": "white" }' },
  "/secret": { status: 404, emoji: "💀", quip: "404 — that page is in another castle.", body: '{ "error": "Not Found" }' },
  "/explode": { status: 500, emoji: "🔥", quip: "500 — the server had a little breakdown. Same.", body: '{ "error": "Internal Server Error" }' },
};

const METHODS = [
  { m: "GET", desc: "read", emoji: "📖", color: "var(--neon-blue)" },
  { m: "POST", desc: "create", emoji: "✍️", color: "var(--neon-green)" },
  { m: "PUT", desc: "update", emoji: "♻️", color: "var(--neon-yellow)" },
  { m: "DELETE", desc: "destroy", emoji: "💥", color: "var(--neon-red)" },
];

function FakeBrowser() {
  const [url, setUrl] = useState("/menu");
  const [phase, setPhase] = useState<"idle" | "request" | "processing" | "response">("idle");
  const [result, setResult] = useState<(typeof ENDPOINTS)[string] | null>(null);

  const send = () => {
    const key = url.startsWith("/") ? url : "/" + url;
    const res = ENDPOINTS[key] ?? { status: 404, emoji: "💀", quip: "404 — never heard of it.", body: '{ "error": "Not Found" }' };
    setPhase("request");
    setResult(null);
    setTimeout(() => setPhase("processing"), 700);
    setTimeout(() => { setResult(res); setPhase("response"); }, 1600);
  };

  const statusColor = result ? (result.status < 300 ? "var(--neon-green)" : result.status < 500 ? "var(--neon-yellow)" : "var(--neon-red)") : "var(--neon-blue)";

  return (
    <div className="card overflow-hidden">
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-bg-tertiary/50 px-3 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-neon-red/70" />
          <span className="h-3 w-3 rounded-full bg-neon-yellow/70" />
          <span className="h-3 w-3 rounded-full bg-neon-green/70" />
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-bg-primary/70 px-3 py-1.5">
          <Globe size={13} className="text-ink-muted" />
          <span className="mono text-xs text-ink-muted">dojo.api</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="flex-1 bg-transparent mono text-xs text-neon-blue outline-none"
            placeholder="/menu"
          />
        </div>
        <button onClick={send} className="btn-neon px-3 py-1.5 text-xs">
          <Send size={13} /> Send
        </button>
      </div>

      {/* hint chips */}
      <div className="flex flex-wrap gap-1.5 px-3 pt-3">
        {Object.keys(ENDPOINTS).map((k) => (
          <button key={k} onClick={() => setUrl(k)} className="chip hover:text-white">{k}</button>
        ))}
      </div>

      {/* animation stage */}
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-6 py-8">
        {/* client */}
        <div className="flex flex-col items-center gap-2">
          <div className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-neon-blue text-neon-blue" style={{ background: "var(--bg-tertiary)" }}>
            <Globe size={28} />
          </div>
          <span className="mono text-xs text-ink-secondary">Client (You)</span>
        </div>

        {/* wire */}
        <div className="relative h-24 w-28 sm:w-40">
          <AnimatePresence>
            {phase === "request" && (
              <motion.div
                initial={{ left: "0%", opacity: 0 }}
                animate={{ left: "85%", opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute top-3 -translate-y-1/2"
              >
                <span className="rounded-full bg-neon-blue px-2 py-0.5 mono text-[0.6rem] font-bold text-bg-primary shadow-neon-blue">
                  GET {url}
                </span>
              </motion.div>
            )}
            {phase === "response" && result && (
              <motion.div
                initial={{ left: "85%", opacity: 0 }}
                animate={{ left: "0%", opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute bottom-3 translate-y-1/2"
              >
                <span className="rounded-full px-2 py-0.5 mono text-[0.6rem] font-bold text-bg-primary" style={{ background: statusColor }}>
                  {result.status} {result.emoji}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute left-0 right-0 top-3 h-px -translate-y-1/2 bg-gradient-to-r from-neon-blue/40 to-transparent" />
          <div className="absolute bottom-3 left-0 right-0 h-px translate-y-1/2 bg-gradient-to-l from-neon-green/40 to-transparent" />
        </div>

        {/* server */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-neon-purple text-neon-purple"
            style={{ background: "var(--bg-tertiary)" }}
            animate={phase === "processing" ? { rotate: 360 } : {}}
            transition={phase === "processing" ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
          >
            {phase === "processing" ? <Cog size={28} /> : <ServerIcon size={28} />}
          </motion.div>
          <span className="mono text-xs text-ink-secondary">Server</span>
        </div>
      </div>

      {/* response panel */}
      <div className="min-h-[88px] border-t border-[var(--border-subtle)] bg-bg-primary/40 p-4">
        <AnimatePresence mode="wait">
          {result && phase === "response" ? (
            <motion.div key="r" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2">
                <span className="rounded px-2 py-0.5 mono text-xs font-bold text-bg-primary" style={{ background: statusColor }}>
                  {result.status}
                </span>
                <span className="text-sm text-ink-secondary">{result.quip}</span>
              </div>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-bg-tertiary/60 p-3 mono text-xs text-neon-green">{result.body}</pre>
            </motion.div>
          ) : (
            <p key="i" className="py-4 text-center text-sm text-ink-muted">
              Pick an endpoint and hit <span className="text-neon-blue">Send</span> to watch the request/response cycle.
            </p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ClientServerPage() {
  return (
    <ConceptPage
      slug="client-server"
      analogy={
        <FunnyAnalogy
          emoji="🍽️"
          alternates={[
            { emoji: "📞", text: "Calling a pizza place: you (client) ask, they (server) make it and call you back." },
            { emoji: "🏧", text: "An ATM: you request cash, the bank's server checks your balance and responds." },
          ]}
        >
          You&apos;re the <strong className="text-neon-blue">client</strong> ordering food at a restaurant
          (the <strong className="text-neon-purple">server</strong>). You don&apos;t cook — you just ask
          and wait. The kitchen does the work and sends a plate back.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The big idea" title="Request → Response, forever">
          <p className="text-ink-secondary">
            Almost everything on the internet is two computers talking: a <strong className="text-neon-blue">client</strong>{" "}
            (your browser, phone, app) <em>asks</em> for something, and a <strong className="text-neon-purple">server</strong>{" "}
            (a powerful always-on computer) <em>answers</em>. That single back-and-forth is the
            request/response cycle, and it repeats billions of times a second across the planet.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Try it" title="A tiny browser you can poke">
          <FakeBrowser />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The verbs" title="HTTP methods, decoded">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {METHODS.map((m) => (
              <div key={m.m} className="card card-hover p-4 text-center" style={{ borderColor: `${m.color}40` }}>
                <div className="text-2xl">{m.emoji}</div>
                <div className="mt-2 font-display text-lg font-bold" style={{ color: m.color }}>{m.m}</div>
                <div className="mono text-xs text-ink-secondary">{m.desc}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink-secondary">
            Same destination, different intent. <span className="mono text-neon-blue">GET /menu</span> reads the menu;{" "}
            <span className="mono text-neon-green">POST /orders</span> places an order;{" "}
            <span className="mono text-neon-red">DELETE /orders/42</span> cancels it.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Status codes" title="What the numbers mean">
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { code: "2xx", label: "It worked", ex: "200 OK", color: "var(--neon-green)", emoji: "✅" },
              { code: "4xx", label: "You messed up", ex: "404 Not Found", color: "var(--neon-yellow)", emoji: "🤷" },
              { code: "5xx", label: "Server messed up", ex: "500 Error", color: "var(--neon-red)", emoji: "🔥" },
            ].map((s) => (
              <div key={s.code} className="card p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{s.emoji}</span>
                  <span className="font-display text-xl font-bold" style={{ color: s.color }}>{s.code}</span>
                </div>
                <div className="mt-1 text-sm text-white">{s.label}</div>
                <div className="mono text-xs text-ink-muted">{s.ex}</div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="client-server"
          questions={[
            {
              question: "In the restaurant analogy, who is the 'server'?",
              options: ["You, the hungry customer", "The kitchen that prepares and returns the food", "The menu", "The front door"],
              correct: 1,
              explain: "The server does the work and sends a response back — just like the kitchen.",
            },
            {
              question: "Which HTTP method would you use to READ data without changing anything?",
              options: ["POST", "DELETE", "GET", "PUT"],
              correct: 2,
              explain: "GET is the read verb. It should never modify server state.",
            },
            {
              question: "A 500 status code means…",
              options: ["Everything is fine", "You requested a page that doesn't exist", "The server hit an error on its end", "You need to log in"],
              correct: 2,
              explain: "5xx = the server's fault. 4xx (like 404) = the client's fault.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
