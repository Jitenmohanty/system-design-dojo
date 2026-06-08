"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Shield, Lock, Gauge, Zap, GitBranch, RefreshCw } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";

// --------------- Feature toggles ---------------
type Feature = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  desc: string;
  edgeLabel: string;
};

const FEATURES: Feature[] = [
  {
    id: "auth",
    label: "Authentication",
    icon: Lock,
    color: "var(--neon-green)",
    desc: "Every request is verified against your identity provider before it reaches a single backend. No token, no entry — bouncer energy.",
    edgeLabel: "JWT verified",
  },
  {
    id: "ratelimit",
    label: "Rate Limiting",
    icon: Gauge,
    color: "var(--neon-yellow)",
    desc: "Prevents any single client from hammering your backends. 100 req/s per user? After that, enjoy a 429 🥴.",
    edgeLabel: "100 req/s",
  },
  {
    id: "cache",
    label: "Caching",
    icon: Zap,
    color: "var(--neon-blue)",
    desc: "Frequently-read responses are cached at the gateway. Your DB doesn't even get asked — the gateway memo-izes it.",
    edgeLabel: "HIT cached",
  },
  {
    id: "routing",
    label: "Smart Routing",
    icon: GitBranch,
    color: "var(--neon-purple)",
    desc: "/users/* → User Service, /orders/* → Order Service, /search/* → Search Cluster. One URL, many destinations.",
    edgeLabel: "routed",
  },
  {
    id: "transform",
    label: "Transformation",
    icon: RefreshCw,
    color: "var(--neon-orange)",
    desc: "Gateway translates between REST, GraphQL, and gRPC. Mobile gets a slim JSON payload; internal services speak protobuf.",
    edgeLabel: "transformed",
  },
];

function FeatureToggles() {
  const [active, setActive] = useState<Set<string>>(new Set(["auth", "routing"]));

  const toggle = (id: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const activeFeatures = FEATURES.filter((f) => active.has(f.id));
  const currentFeature = activeFeatures[activeFeatures.length - 1] ?? null;

  return (
    <div className="space-y-4">
      {/* Toggle chips */}
      <div className="flex flex-wrap gap-2">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          const on = active.has(f.id);
          return (
            <motion.button
              key={f.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(f.id)}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                borderColor: on ? f.color : "var(--border-subtle)",
                color: on ? f.color : "var(--text-secondary)",
                background: on ? `${f.color}15` : "transparent",
                boxShadow: on ? `0 0 12px -4px ${f.color}` : "none",
              }}
            >
              <Icon size={13} />
              {f.label}
              <span
                className="ml-0.5 h-1.5 w-1.5 rounded-full"
                style={{ background: on ? f.color : "var(--text-secondary)" }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Explanation panel */}
      <AnimatePresence mode="wait">
        {currentFeature ? (
          <motion.div
            key={currentFeature.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border p-4 text-sm"
            style={{
              borderColor: `${currentFeature.color}40`,
              background: `${currentFeature.color}0a`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <currentFeature.icon size={15} style={{ color: currentFeature.color }} />
              <span className="font-semibold" style={{ color: currentFeature.color }}>
                {currentFeature.label}
              </span>
            </div>
            <p className="text-ink-secondary">{currentFeature.desc}</p>
            {active.size > 1 && (
              <p className="mt-2 text-xs text-ink-muted">
                + {active.size - 1} other feature{active.size > 2 ? "s" : ""} active
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-dashed border-[var(--border-subtle)] p-4 text-sm text-ink-muted text-center"
          >
            Enable at least one feature to see what the gateway does
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pipeline visualization */}
      {active.size > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-4"
        >
          <div className="mono mb-2 text-[0.6rem] uppercase tracking-widest text-ink-muted">
            Request pipeline (left to right)
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <div className="flex items-center gap-1 mono text-xs text-neon-blue">
              <Monitor size={13} /> Client
            </div>
            {FEATURES.filter((f) => active.has(f.id)).map((f) => (
              <div key={f.id} className="flex items-center gap-1">
                <span className="text-ink-muted">→</span>
                <span
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 mono text-[0.65rem]"
                  style={{ color: f.color, background: `${f.color}15` }}
                >
                  <f.icon size={10} />
                  {f.label}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <span className="text-ink-muted">→</span>
              <div className="mono text-xs text-neon-orange">Backend</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// --------------- Gateway patterns ---------------
const PATTERNS = [
  {
    name: "Backend for Frontend (BFF)",
    desc: "A dedicated gateway per client type — mobile gets slim payloads, web gets full data, IoT gets binary.",
    color: "var(--neon-purple)",
    emoji: "📱",
  },
  {
    name: "Service Aggregation",
    desc: "One request in → gateway fans out to 3 services → aggregates responses → one clean response back. Clients stay blissfully unaware of the mess behind the curtain.",
    color: "var(--neon-blue)",
    emoji: "🔀",
  },
  {
    name: "Protocol Translation",
    desc: "External clients speak REST. Internal services speak gRPC. Gateway translates. Nobody has to rewire their brains.",
    color: "var(--neon-green)",
    emoji: "🔄",
  },
];

export default function ApiGatewayPage() {
  return (
    <ConceptPage
      slug="api-gateway"
      analogy={
        <FunnyAnalogy
          emoji="🏨"
          color="var(--neon-orange)"
          alternates={[
            {
              emoji: "🛡️",
              text: "The TSA of your API — checks your ID, weighs your bags, and redirects you to the right gate before you see any actual server.",
            },
            {
              emoji: "📞",
              text: "A switchboard operator: one number, routes to whoever needs to pick up. 'Press 1 for Users, 2 for Orders, 3 for our existential crisis.'",
            },
          ]}
        >
          The API Gateway is the <strong className="text-neon-orange">front desk of a massive hotel</strong>.
          Guests (clients) don&apos;t wander the kitchen or housekeeping — they talk to the front desk.
          It checks their ID, handles requests, and dispatches the right staff. Your backends never see a random guest walk in.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The big picture" title="Clients → Gateway → Services">
          <p className="mb-4 text-ink-secondary">
            Without a gateway, every client needs to know every service&apos;s address, protocol, and auth scheme.
            With one, clients talk to a single endpoint and the gateway handles the chaos behind.
          </p>
          <AnimatedDiagram
            height={340}
            nodes={[
              { id: "mob", type: "client", label: "Mobile App", position: { x: 10, y: 20 }, status: "active", info: "iOS/Android client — sends REST requests." },
              { id: "web", type: "client", label: "Web App", position: { x: 10, y: 50 }, status: "active", info: "Browser SPA — same gateway, different payloads." },
              { id: "iot", type: "client", label: "IoT Device", position: { x: 10, y: 80 }, status: "active", info: "Low-power device — speaks MQTT, gateway translates." },
              { id: "gw", type: "gateway", label: "API Gateway", position: { x: 42, y: 50 }, status: "busy", info: "Auth • Rate Limit • Cache • Route • Transform" },
              { id: "us", type: "server", label: "User Service", position: { x: 75, y: 20 }, status: "active", info: "Handles /users/* routes." },
              { id: "os", type: "server", label: "Order Service", position: { x: 75, y: 50 }, status: "busy", info: "Handles /orders/* routes." },
              { id: "ss", type: "server", label: "Search Service", position: { x: 75, y: 80 }, status: "active", info: "Handles /search/* routes." },
            ]}
            edges={[
              { from: "mob", to: "gw", animated: true, color: "var(--neon-blue)" },
              { from: "web", to: "gw", animated: true, color: "var(--neon-blue)" },
              { from: "iot", to: "gw", animated: true, color: "var(--neon-blue)" },
              { from: "gw", to: "us", animated: true, color: "var(--neon-orange)", label: "/users" },
              { from: "gw", to: "os", animated: true, color: "var(--neon-orange)", label: "/orders" },
              { from: "gw", to: "ss", animated: true, color: "var(--neon-orange)", label: "/search" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Feature control panel" title="Toggle gateway capabilities">
          <p className="mb-4 text-ink-secondary">
            Click the chips to enable/disable gateway features. The pipeline updates in real time — just like configuring nginx or Kong.
          </p>
          <FeatureToggles />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Common patterns" title="Things a gateway does beyond routing">
          <div className="grid gap-3 sm:grid-cols-3">
            {PATTERNS.map((p) => (
              <motion.div
                key={p.name}
                whileHover={{ y: -3 }}
                className="card p-4"
                style={{ borderColor: `${p.color}30` }}
              >
                <div className="text-2xl mb-2">{p.emoji}</div>
                <div className="font-display font-semibold text-sm mb-1" style={{ color: p.color }}>
                  {p.name}
                </div>
                <p className="text-xs text-ink-secondary">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Real-world gateways" title="Who uses what">
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { name: "AWS API Gateway", use: "Serverless-native, Lambda integration", color: "var(--neon-orange)" },
              { name: "Kong", use: "Open-source, plugin ecosystem, self-hosted", color: "var(--neon-blue)" },
              { name: "NGINX", use: "Reverse proxy + gateway, ultra-performant", color: "var(--neon-green)" },
              { name: "Traefik", use: "Container-native, Kubernetes-friendly", color: "var(--neon-purple)" },
            ].map((gw) => (
              <div key={gw.name} className="card flex items-start gap-3 p-4">
                <Shield size={18} style={{ color: gw.color }} className="mt-0.5 shrink-0" />
                <div>
                  <div className="font-display font-semibold text-sm" style={{ color: gw.color }}>{gw.name}</div>
                  <div className="text-xs text-ink-secondary mt-0.5">{gw.use}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Gotchas" title="When a gateway bites back">
          <div className="card divide-y divide-[var(--border-subtle)]">
            {[
              { icon: "⚠️", title: "Single point of failure", body: "Run multiple gateway instances. If the gateway goes down, everything does — ironic for a reliability tool." },
              { icon: "🐌", title: "Added latency", body: "Auth, rate-limit checks, and transforms add ~1–5ms per hop. Worth it, but architect accordingly." },
              { icon: "🧩", title: "Logic creep", body: "Resist shoving business logic into the gateway. Routes and cross-cutting concerns only — or you&apos;ll have a monolith wearing a gateway costume." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 p-4">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div>
                  <div className="font-semibold text-sm text-white">{item.title}</div>
                  <p className="text-xs text-ink-secondary mt-0.5">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="api-gateway"
          questions={[
            {
              question: "What is the primary benefit of an API Gateway?",
              options: ["It stores all your data", "It provides a single entry point for all clients, hiding backend complexity", "It replaces your database", "It makes JavaScript faster"],
              correct: 1,
              explain: "A gateway centralizes cross-cutting concerns — auth, routing, rate limiting — behind one endpoint so backends stay simple.",
            },
            {
              question: "Which gateway feature would prevent a DDoS attack from overloading your backends?",
              options: ["Protocol Translation", "Service Aggregation", "Rate Limiting", "Caching"],
              correct: 2,
              explain: "Rate limiting throttles requests per client or IP before they reach backends — the virtual bouncer.",
            },
            {
              question: "What is a Backend for Frontend (BFF) pattern?",
              options: ["One database per service", "A dedicated gateway tailored for each type of client (mobile, web, IoT)", "A backup server for the frontend", "GraphQL vs REST"],
              correct: 1,
              explain: "BFF creates specialized gateway layers per client type so each gets exactly the data shape it needs.",
            },
            {
              question: "Why should you avoid putting business logic in an API Gateway?",
              options: ["Gateways can&apos;t run code", "It creates a distributed monolith and makes the gateway a bottleneck", "It&apos;s too expensive", "Business logic belongs in the database"],
              correct: 1,
              explain: "Gateways should handle cross-cutting concerns only. Business logic belongs in services — otherwise you&apos;ve rebuilt a monolith in disguise.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
