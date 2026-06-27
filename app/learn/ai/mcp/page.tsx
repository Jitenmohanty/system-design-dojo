"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";

// ---------- N×M vs N+M wiring demo ----------
function WiringDemo() {
  const [mcp, setMcp] = useState(false);
  const [apps, setApps] = useState(3);
  const [tools, setTools] = useState(4);

  const customLines = apps * tools;
  const mcpLines = apps + tools;

  const appY = (i: number) => ((i + 1) / (apps + 1)) * 100;
  const toolY = (i: number) => ((i + 1) / (tools + 1)) * 100;

  const Stepper = ({ label, val, set, min, max }: { label: string; val: number; set: (n: number) => void; min: number; max: number }) => (
    <div className="flex items-center gap-2">
      <span className="mono text-xs text-ink-secondary">{label}</span>
      <button onClick={() => set(Math.max(min, val - 1))} className="grid h-6 w-6 place-items-center rounded-md bg-bg-tertiary text-ink-secondary hover:text-white"><Minus size={12} /></button>
      <span className="mono w-4 text-center text-sm text-white">{val}</span>
      <button onClick={() => set(Math.min(max, val + 1))} className="grid h-6 w-6 place-items-center rounded-md bg-bg-tertiary text-ink-secondary hover:text-white"><Plus size={12} /></button>
    </div>
  );

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          <button onClick={() => setMcp(false)} className="chip transition" style={!mcp ? { borderColor: "var(--neon-red)", color: "var(--neon-red)", background: "rgba(255,51,102,0.1)" } : undefined}>❌ Without MCP</button>
          <button onClick={() => setMcp(true)} className="chip transition" style={mcp ? { borderColor: "var(--neon-green)", color: "var(--neon-green)", background: "rgba(0,255,136,0.1)" } : undefined}>🔌 With MCP</button>
        </div>
        <div className="flex gap-4">
          <Stepper label="apps" val={apps} set={setApps} min={1} max={5} />
          <Stepper label="tools" val={tools} set={setTools} min={1} max={6} />
        </div>
      </div>

      <div className="relative mt-4 h-64 rounded-xl border border-[var(--border-subtle)] bg-bg-primary/40">
        <svg className="absolute inset-0 h-full w-full">
          {!mcp
            ? Array.from({ length: apps }).flatMap((_, a) =>
                Array.from({ length: tools }).map((_, t) => (
                  <line key={`${a}-${t}`} x1="18%" y1={`${appY(a)}%`} x2="82%" y2={`${toolY(t)}%`} stroke="var(--neon-red)" strokeWidth={1} opacity={0.4} />
                ))
              )
            : [
                ...Array.from({ length: apps }).map((_, a) => (
                  <line key={`a${a}`} x1="18%" y1={`${appY(a)}%`} x2="50%" y2="50%" stroke="var(--neon-green)" strokeWidth={1.4} opacity={0.6} />
                )),
                ...Array.from({ length: tools }).map((_, t) => (
                  <line key={`t${t}`} x1="50%" y1="50%" x2="82%" y2={`${toolY(t)}%`} stroke="var(--neon-green)" strokeWidth={1.4} opacity={0.6} />
                )),
              ]}
        </svg>

        {/* apps */}
        {Array.from({ length: apps }).map((_, a) => (
          <div key={a} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg bg-bg-tertiary px-2 py-1 mono text-[0.6rem] text-neon-blue" style={{ left: "18%", top: `${appY(a)}%` }}>app{a + 1}</div>
        ))}
        {/* hub */}
        {mcp && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-neon-green bg-bg-tertiary px-2.5 py-1.5 mono text-[0.6rem] font-bold text-neon-green" style={{ boxShadow: "0 0 16px -3px var(--neon-green)" }}>MCP</motion.div>
        )}
        {/* tools */}
        {Array.from({ length: tools }).map((_, t) => (
          <div key={t} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg bg-bg-tertiary px-2 py-1 mono text-[0.6rem] text-neon-orange" style={{ left: "82%", top: `${toolY(t)}%` }}>tool{t + 1}</div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-ink-secondary">
          Connectors to build &amp; maintain:{" "}
          <span className="mono font-bold" style={{ color: mcp ? "var(--neon-green)" : "var(--neon-red)" }}>{mcp ? mcpLines : customLines}</span>
        </span>
        <span className="mono text-xs text-ink-muted">{mcp ? `${apps} + ${tools} = N+M` : `${apps} × ${tools} = N×M`}</span>
      </div>
      <p className="mt-2 text-xs text-ink-muted">
        Without a standard, every app needs a bespoke integration for every tool — the wiring explodes as{" "}
        <span className="mono">N×M</span>. MCP is a common plug: each app and each tool implements it once, so the cost
        grows as <span className="mono">N+M</span>. Add a tool and <em>every</em> MCP app can use it for free.
      </p>
    </div>
  );
}

export default function McpPage() {
  return (
    <ConceptPage
      slug="mcp"
      analogy={
        <FunnyAnalogy
          emoji="🔌"
          color="var(--neon-pink)"
          alternates={[
            { emoji: "🔋", text: "Before USB-C every device had its own charger drawer. One standard plug killed the tangle. MCP is that for AI-to-tool connections." },
            { emoji: "🧳", text: "Like a universal travel adapter: the agent (your laptop) plugs into any tool (any country's socket) through one standard interface." },
          ]}
        >
          You learned how an agent <em>calls</em> tools. But who writes all those integrations? Before MCP, every app
          built a custom connector to every data source and tool — an <strong className="text-neon-red">N×M</strong> mess.
          The <strong className="text-neon-pink">Model Context Protocol</strong> is an open standard — think{" "}
          <strong className="text-white">USB-C for AI</strong> — so any compliant app can plug into any compliant tool
          with no bespoke glue.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The problem it kills" title="The N×M integration explosion">
          <p className="mb-4 text-ink-secondary">
            Say you have a few AI apps and a few systems they need (GitHub, your database, Slack, the filesystem).
            Without a standard, that&apos;s a custom integration for <em>every pair</em> — and each new tool means re-wiring
            every app. Toggle MCP on and watch the spaghetti collapse into a hub.
          </p>
          <WiringDemo />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The shape" title="Hosts, clients, and servers">
          <p className="mb-4 text-ink-secondary">
            An MCP <strong className="text-white">host</strong> (your agent app) speaks the protocol to MCP{" "}
            <strong className="text-white">servers</strong> — small adapters that expose a tool or data source in the
            standard format. Write a server once; every MCP host can use it. Click a node.
          </p>
          <AnimatedDiagram
            height={320}
            nodes={[
              { id: "agent", type: "agent", label: "Agent (Host)", position: { x: 12, y: 50 }, status: "busy", info: "Your AI app. It speaks MCP, so it can discover and call any MCP server's tools without custom code per integration." },
              { id: "mcp", type: "gateway", label: "MCP", position: { x: 40, y: 50 }, status: "active", info: "The protocol layer. Standardizes how tools, resources, and prompts are described and invoked." },
              { id: "gh", type: "tool", label: "GitHub", position: { x: 72, y: 14 }, status: "active", info: "An MCP server wrapping GitHub. Exposes tools like create_issue, list_prs in the standard format." },
              { id: "db", type: "vector", label: "Postgres", position: { x: 72, y: 38 }, status: "active", info: "An MCP server over your database. Exposes query tools + resources (schemas) the agent can read." },
              { id: "fs", type: "tool", label: "Filesystem", position: { x: 72, y: 62 }, status: "active", info: "Local files as an MCP server: read/write/search, with the host controlling permissions." },
              { id: "slack", type: "tool", label: "Slack", position: { x: 72, y: 86 }, status: "active", info: "Post messages, read channels. Swap or add servers without touching the agent's code." },
            ]}
            edges={[
              { from: "agent", to: "mcp", animated: true, color: "var(--neon-pink)" },
              { from: "mcp", to: "gh", animated: true, color: "var(--neon-green)" },
              { from: "mcp", to: "db", animated: true, color: "var(--neon-green)" },
              { from: "mcp", to: "fs", animated: true, color: "var(--neon-green)" },
              { from: "mcp", to: "slack", animated: true, color: "var(--neon-green)" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="What a server exposes" title="Three things, one protocol">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { emoji: "🛠️", t: "Tools", d: "Actions the agent can invoke — create_issue, run_query, send_message. The verbs, in a standard schema." },
              { emoji: "📄", t: "Resources", d: "Read-only data the agent can pull into context — files, DB rows, docs. The nouns." },
              { emoji: "💬", t: "Prompts", d: "Reusable prompt templates the server offers, so common workflows are one click, not re-invented each time." },
            ].map((c) => (
              <div key={c.t} className="card p-4">
                <div className="text-xl">{c.emoji}</div>
                <div className="mt-1.5 font-display font-semibold text-white">{c.t}</div>
                <p className="mt-1 text-xs text-ink-secondary">{c.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-neon-orange/30 bg-neon-orange/5 p-3">
            <span className="text-lg">🛡️</span>
            <p className="text-sm text-ink-secondary">
              Security note: an MCP server is code with access to real systems, and tool results are untrusted input.
              Only connect servers you trust, scope their permissions, and keep the human-approval guardrails from the{" "}
              <span className="text-neon-pink">security</span> lesson on for anything destructive.
            </p>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="mcp"
          questions={[
            {
              question: "What core problem does MCP solve?",
              options: [
                "Making models bigger",
                "The N×M explosion of custom integrations between AI apps and tools/data",
                "Lowering temperature",
                "Tokenization",
              ],
              correct: 1,
              explain: "MCP is a shared standard, turning bespoke per-pair integrations (N×M) into plug-in connectors (N+M).",
            },
            {
              question: "The best one-liner for MCP is…",
              options: [
                "A faster GPU",
                "USB-C for AI — a universal way to plug agents into tools and data",
                "A new model architecture",
                "A vector database",
              ],
              correct: 1,
              explain: "It's an open protocol standardizing the agent↔tool connection, like a universal port.",
            },
            {
              question: "In MCP terms, what is a 'server'?",
              options: [
                "The LLM itself",
                "A small adapter that exposes a tool or data source in the standard MCP format",
                "The user's browser",
                "The embedding model",
              ],
              correct: 1,
              explain: "An MCP server wraps a tool/data source; any MCP host can then use it without custom code.",
            },
            {
              question: "Why is MCP a security consideration, not just convenience?",
              options: [
                "It isn't — it's purely cosmetic",
                "Servers have real system access and tool results are untrusted input, so trust, scoping, and approvals still matter",
                "It encrypts everything automatically",
                "It removes the need for guardrails",
              ],
              correct: 1,
              explain: "Plugging in a server grants real capability. Trust the source, scope permissions, keep approvals on.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
