"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComparePageShell, CompareSection } from "@/components/compare/ComparePageShell";

const COLORS = { REST: "var(--neon-blue)", GraphQL: "var(--neon-purple)", gRPC: "var(--neon-green)" } as const;
type Tech = keyof typeof COLORS;

const MATRIX: { label: string; rest: string; graphql: string; grpc: string }[] = [
  { label: "Transport", rest: "HTTP/1.1 + JSON", graphql: "HTTP + JSON", grpc: "HTTP/2 + Protobuf" },
  { label: "Data fetching", rest: "Fixed per endpoint", graphql: "Exactly what you ask", grpc: "Fixed per method" },
  { label: "Over-fetching", rest: "Common", graphql: "Solved", grpc: "Minimal" },
  { label: "Payload size", rest: "Medium", graphql: "Small–Medium", grpc: "Tiny (binary)" },
  { label: "Browser support", rest: "Native", graphql: "Native", grpc: "Needs gRPC-Web" },
  { label: "Streaming", rest: "Limited", graphql: "Subscriptions", grpc: "Bidirectional" },
  { label: "Caching", rest: "Easy (HTTP)", graphql: "Harder", grpc: "Manual" },
  { label: "Best for", rest: "Public APIs, CRUD", graphql: "Rich clients, mobile", grpc: "Internal microservices" },
];

const EXAMPLES: Record<Tech, { req: string; res: string }> = {
  REST: {
    req: "GET /users/7\nGET /users/7/posts",
    res: '{ "id": 7, "name": "Neo",\n  "email": "...", "bio": "...",\n  "avatar": "...", /* +20 fields */ }',
  },
  GraphQL: {
    req: "query {\n  user(id: 7) { name posts { title } }\n}",
    res: '{ "user": {\n  "name": "Neo",\n  "posts": [{ "title": "..." }]\n} }',
  },
  gRPC: {
    req: "rpc GetUser(UserReq) returns (User)\n// binary on the wire (HTTP/2)",
    res: "User { id: 7, name: 'Neo' }\n// ~3x smaller than JSON",
  },
};

function ExampleTabs() {
  const [tech, setTech] = useState<Tech>("REST");
  return (
    <div className="card overflow-hidden">
      <div className="flex border-b border-[var(--border-subtle)]">
        {(Object.keys(COLORS) as Tech[]).map((t) => (
          <button
            key={t}
            onClick={() => setTech(t)}
            className="flex-1 py-3 mono text-sm font-bold transition"
            style={{
              color: tech === t ? COLORS[t] : "var(--text-secondary)",
              borderBottom: tech === t ? `2px solid ${COLORS[t]}` : "2px solid transparent",
              background: tech === t ? `${COLORS[t]}0f` : "transparent",
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tech} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid gap-px bg-[var(--border-subtle)] md:grid-cols-2">
          <div className="bg-bg-secondary p-4">
            <div className="mono text-[0.6rem] uppercase tracking-widest text-ink-muted">Request</div>
            <pre className="mt-2 whitespace-pre-wrap mono text-xs" style={{ color: COLORS[tech] }}>{EXAMPLES[tech].req}</pre>
          </div>
          <div className="bg-bg-secondary p-4">
            <div className="mono text-[0.6rem] uppercase tracking-widest text-ink-muted">Response</div>
            <pre className="mt-2 whitespace-pre-wrap mono text-xs text-ink-primary">{EXAMPLES[tech].res}</pre>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function RestGraphqlGrpc() {
  return (
    <ComparePageShell
      emoji="🔌"
      title={<><span style={{ color: COLORS.REST }}>REST</span> · <span style={{ color: COLORS.GraphQL }}>GraphQL</span> · <span style={{ color: COLORS.gRPC }}>gRPC</span></>}
      subtitle="Three ways for clients and services to talk. They're not really competitors — they're tools for different jobs."
      verdict={
        <p>
          Use <strong style={{ color: COLORS.REST }}>REST</strong> for public, cacheable, CRUD-style APIs — it&apos;s
          universal and dead simple. Use <strong style={{ color: COLORS.GraphQL }}>GraphQL</strong> when diverse
          clients (especially mobile) need to fetch exactly the fields they want without N round-trips. Use{" "}
          <strong style={{ color: COLORS.gRPC }}>gRPC</strong> for high-throughput internal service-to-service calls
          where binary speed and streaming matter. Many systems use all three at once.
        </p>
      }
    >
      <CompareSection title="The feature matrix">
        <div className="card overflow-hidden">
          <div className="grid grid-cols-4 gap-px bg-[var(--border-subtle)]">
            <div className="bg-bg-tertiary/60 p-3 mono text-[0.6rem] uppercase tracking-wider text-ink-muted">Feature</div>
            {(["REST", "GraphQL", "gRPC"] as Tech[]).map((t) => (
              <div key={t} className="bg-bg-tertiary/60 p-3 font-display text-sm font-bold" style={{ color: COLORS[t] }}>{t}</div>
            ))}
            {MATRIX.map((row) => (
              <FragmentRow key={row.label} row={row} />
            ))}
          </div>
        </div>
      </CompareSection>

      <CompareSection title="Same data, three styles">
        <ExampleTabs />
        <p className="mt-3 text-sm text-ink-muted">
          REST needs two calls and over-fetches; GraphQL gets exactly the shape in one query; gRPC ships compact binary.
        </p>
      </CompareSection>

      <CompareSection title="Reach for…">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { t: "REST" as Tech, use: "A public API, webhooks, CRUD resources, anything that benefits from HTTP caching." },
            { t: "GraphQL" as Tech, use: "Mobile/SPA clients with varied data needs, aggregating many backends, rapid frontend iteration." },
            { t: "gRPC" as Tech, use: "Internal microservices, low-latency RPC, real-time streaming, polyglot backends." },
          ].map((x) => (
            <div key={x.t} className="card p-4">
              <div className="font-display font-bold" style={{ color: COLORS[x.t] }}>{x.t}</div>
              <p className="mt-1 text-sm text-ink-secondary">{x.use}</p>
            </div>
          ))}
        </div>
      </CompareSection>
    </ComparePageShell>
  );
}

function FragmentRow({ row }: { row: { label: string; rest: string; graphql: string; grpc: string } }) {
  return (
    <>
      <div className="bg-bg-secondary p-3 text-xs text-ink-secondary">{row.label}</div>
      <div className="bg-bg-secondary p-3 text-xs text-ink-primary">{row.rest}</div>
      <div className="bg-bg-secondary p-3 text-xs text-ink-primary">{row.graphql}</div>
      <div className="bg-bg-secondary p-3 text-xs text-ink-primary">{row.grpc}</div>
    </>
  );
}
