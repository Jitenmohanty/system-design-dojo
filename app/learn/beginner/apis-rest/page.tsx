"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { cn } from "@/lib/utils";

type Method = "GET" | "POST" | "PUT" | "DELETE";

const METHOD_META: Record<Method, { color: string; desc: string; status: number; body?: string; response: string }> = {
  GET: { color: "var(--neon-blue)", desc: "Read the list of users", status: 200, response: '[\n  { "id": 1, "name": "Neo" },\n  { "id": 2, "name": "Trinity" }\n]' },
  POST: { color: "var(--neon-green)", desc: "Create a new user", status: 201, body: '{ "name": "Morpheus" }', response: '{ "id": 3, "name": "Morpheus" }' },
  PUT: { color: "var(--neon-yellow)", desc: "Replace user #2", status: 200, body: '{ "name": "Trinity Anderson" }', response: '{ "id": 2, "name": "Trinity Anderson" }' },
  DELETE: { color: "var(--neon-red)", desc: "Remove user #2", status: 204, response: "(no content — user deleted 💥)" },
};

const PATHS: Record<Method, string> = { GET: "/users", POST: "/users", PUT: "/users/2", DELETE: "/users/2" };

function RestPlayground() {
  const [method, setMethod] = useState<Method>("GET");
  const [sent, setSent] = useState(false);
  const meta = METHOD_META[method];

  const fire = (m: Method) => { setMethod(m); setSent(false); setTimeout(() => setSent(true), 50); };

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] bg-bg-tertiary/40 p-3">
        {(Object.keys(METHOD_META) as Method[]).map((m) => (
          <button
            key={m}
            onClick={() => fire(m)}
            className={cn("rounded-lg border px-3 py-1.5 mono text-xs font-bold transition")}
            style={{
              borderColor: method === m ? METHOD_META[m].color : "var(--border-subtle)",
              color: method === m ? METHOD_META[m].color : "var(--text-secondary)",
              background: method === m ? `${METHOD_META[m].color}1a` : "transparent",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid gap-px bg-[var(--border-subtle)] md:grid-cols-2">
        {/* request */}
        <div className="bg-bg-secondary p-4">
          <div className="mono text-[0.6rem] uppercase tracking-widest text-ink-muted">Request</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded px-2 py-0.5 mono text-xs font-bold text-bg-primary" style={{ background: meta.color }}>{method}</span>
            <span className="mono text-sm text-white">{PATHS[method]}</span>
          </div>
          <p className="mt-2 text-xs text-ink-secondary">{meta.desc}</p>
          {meta.body && (
            <pre className="mt-3 overflow-x-auto rounded-lg bg-bg-tertiary/60 p-3 mono text-xs text-ink-primary">
{`Content-Type: application/json

`}{meta.body}</pre>
          )}
        </div>

        {/* response */}
        <div className="bg-bg-secondary p-4">
          <div className="mono text-[0.6rem] uppercase tracking-widest text-ink-muted">Response</div>
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key={method} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded px-2 py-0.5 mono text-xs font-bold text-bg-primary" style={{ background: meta.color }}>
                    {meta.status}
                  </span>
                  <span className="mono text-xs text-ink-secondary">{meta.status < 205 ? "OK" : ""}</span>
                </div>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-bg-tertiary/60 p-3 mono text-xs text-neon-green">{meta.response}</pre>
              </motion.div>
            ) : (
              <p key="idle" className="mt-6 text-center text-xs text-ink-muted">Pick a method to send a request →</p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function ApisRestPage() {
  return (
    <ConceptPage
      slug="apis-rest"
      analogy={
        <FunnyAnalogy
          emoji="🧑‍🍳"
          color="var(--neon-orange)"
          alternates={[
            { emoji: "🏧", text: "An ATM exposes a few buttons (an API) so you never touch the bank's vault directly." },
            { emoji: "🔌", text: "A wall socket: a standard interface. You plug in without knowing how the power plant works." },
          ]}
        >
          An <strong className="text-neon-orange">API is like a waiter</strong>. You give your order to the
          waiter, who takes it to the kitchen and brings back your food. You never see the kitchen — and you
          don&apos;t need to.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The contract" title="What REST actually means">
          <p className="text-ink-secondary">
            REST is a set of conventions for building web APIs around <strong className="text-white">resources</strong>{" "}
            (like <span className="mono text-neon-blue">/users</span>) and the four HTTP verbs that act on them.
            It&apos;s wildly popular because it&apos;s simple, predictable, and rides on plain HTTP.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Playground" title="Send requests to a fake /users API">
          <RestPlayground />
          <p className="mt-3 text-sm text-ink-secondary">
            Notice the response codes change with intent: <span className="mono text-neon-green">201</span> for
            &ldquo;created&rdquo;, <span className="mono text-neon-red">204</span> for &ldquo;deleted, nothing to
            return&rdquo;.
          </p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The path" title="Where your request actually goes">
          <p className="mb-4 text-ink-secondary">
            <span className="mono text-neon-blue">GET /users</span> isn&apos;t magic — it travels a real path. An{" "}
            <strong className="text-neon-orange">API gateway</strong> is the single entry point that checks your
            auth token and rate limits, then routes to the right service, which reads from the database. Click each
            box to see its role.
          </p>
          <AnimatedDiagram
            height={320}
            nodes={[
              { id: "client", type: "client", label: "Client", position: { x: 8, y: 50 }, status: "active", info: "Your app or browser. Sends GET /users with an Authorization header." },
              { id: "gw", type: "gateway", label: "API Gateway", position: { x: 36, y: 50 }, status: "busy", info: "The front door for the API. Verifies the token, enforces rate limits, then forwards the request." },
              { id: "svc", type: "server", label: "Users Service", position: { x: 64, y: 50 }, status: "busy", info: "Owns the /users resource. Turns the REST call into a database query and shapes the JSON response." },
              { id: "db", type: "database", label: "Database", position: { x: 90, y: 50 }, status: "active", info: "Stores the user records. Returns rows the service serializes into JSON." },
            ]}
            edges={[
              { from: "client", to: "gw", animated: true, label: "GET /users" },
              { from: "gw", to: "svc", animated: true, color: "var(--neon-orange)", label: "route" },
              { from: "svc", to: "db", animated: true, color: "var(--neon-green)", label: "query → 200 + JSON" },
            ]}
          />
          <p className="mt-3 text-xs text-ink-muted">Tip: the URL is the contract (the resource), the HTTP verb is the intent, and the status code is the result — the gateway and service are just the machinery that honors that contract.</p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="The neighbors" title="REST vs GraphQL vs gRPC">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { t: "REST", c: "var(--neon-blue)", d: "Resources + HTTP verbs. Simple, cacheable, everywhere.", q: "The reliable default." },
              { t: "GraphQL", c: "var(--neon-purple)", d: "Ask for exactly the fields you want in one query.", q: "No more over-fetching." },
              { t: "gRPC", c: "var(--neon-green)", d: "Binary, super-fast, great for service-to-service.", q: "Speed demon, less browser-friendly." },
            ].map((x) => (
              <div key={x.t} className="card card-hover p-4">
                <div className="font-display text-lg font-bold" style={{ color: x.c }}>{x.t}</div>
                <p className="mt-1 text-sm text-ink-secondary">{x.d}</p>
                <p className="mt-2 mono text-xs text-ink-muted">{x.q}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-muted">We go deep on this in the Compare section. For now: REST is your bread and butter.</p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="apis-rest"
          questions={[
            {
              question: "In the waiter analogy, what's the 'kitchen'?",
              options: ["The API itself", "The backend/database doing the real work", "Your phone", "The internet"],
              correct: 1,
              explain: "The API (waiter) hides the kitchen (backend) — you interact with a clean interface.",
            },
            {
              question: "Which method best fits 'create a new resource'?",
              options: ["GET", "POST", "DELETE", "HEAD"],
              correct: 1,
              explain: "POST creates. A successful create usually returns 201 Created.",
            },
            {
              question: "A key advantage of GraphQL over REST is…",
              options: ["It's binary and fastest", "You fetch exactly the fields you need in one request", "It doesn't use the network", "It can't be cached"],
              correct: 1,
              explain: "GraphQL lets clients request precisely the data they want, avoiding over- and under-fetching.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
