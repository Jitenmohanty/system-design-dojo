"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// --------------- World Map CDN Demo ---------------

type Region = {
  id: string;
  label: string;
  x: number; // percent of container
  y: number;
  latencyNoCDN: number;
  latencyCDN: number;
};

const REGIONS: Region[] = [
  { id: "eu", label: "Europe", x: 50, y: 22, latencyNoCDN: 180, latencyCDN: 18 },
  { id: "ap", label: "Asia-Pacific", x: 80, y: 38, latencyNoCDN: 240, latencyCDN: 12 },
  { id: "sa", label: "S. America", x: 28, y: 72, latencyNoCDN: 160, latencyCDN: 20 },
  { id: "af", label: "Africa", x: 54, y: 58, latencyNoCDN: 210, latencyCDN: 22 },
  { id: "au", label: "Australia", x: 84, y: 74, latencyNoCDN: 280, latencyCDN: 15 },
];

// Origin server position (US East)
const ORIGIN = { x: 20, y: 38 };

// Edge server positions (near each region)
const EDGE_POSITIONS: Record<string, { x: number; y: number }> = {
  eu: { x: 48, y: 28 },
  ap: { x: 76, y: 34 },
  sa: { x: 26, y: 67 },
  af: { x: 54, y: 52 },
  au: { x: 82, y: 70 },
};

function latencyColor(ms: number): string {
  if (ms < 50) return "var(--neon-green)";
  if (ms < 150) return "var(--neon-yellow)";
  return "var(--neon-red)";
}

function WorldMapSim() {
  const [cdnEnabled, setCdnEnabled] = useState(false);
  const [animating, setAnimating] = useState(false);

  const toggleCDN = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCdnEnabled((v) => !v);
      setAnimating(false);
    }, 200);
  };

  return (
    <div className="card overflow-hidden">
      {/* Controls */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-bg-tertiary/40 px-5 py-3">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: cdnEnabled ? "var(--neon-green)" : "var(--neon-red)" }}
          />
          <span className="mono text-xs font-semibold uppercase tracking-widest"
            style={{ color: cdnEnabled ? "var(--neon-green)" : "var(--neon-red)" }}>
            CDN {cdnEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={toggleCDN}
          className="btn-neon text-sm"
          style={{ background: cdnEnabled ? "rgba(255,51,102,0.15)" : undefined,
            borderColor: cdnEnabled ? "var(--neon-red)" : undefined,
            color: cdnEnabled ? "var(--neon-red)" : undefined }}
        >
          {cdnEnabled ? "Disable CDN" : "Enable CDN ⚡"}
        </motion.button>
      </div>

      {/* Map canvas */}
      <div
        className="relative overflow-hidden bg-bg-secondary"
        style={{ height: 340 }}
      >
        {/* Globe outline - styled rectangle as world map */}
        <div
          className="absolute rounded-2xl"
          style={{
            inset: "16px 24px",
            background: "linear-gradient(135deg, rgba(0,212,255,0.04) 0%, rgba(168,85,247,0.04) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />

        {/* Decorative grid lines */}
        {[30, 50, 70].map((y) => (
          <div
            key={y}
            className="absolute left-6 right-6"
            style={{ top: `${y}%`, height: 1, background: "rgba(255,255,255,0.04)" }}
          />
        ))}
        {[25, 50, 75].map((x) => (
          <div
            key={x}
            className="absolute top-4 bottom-4"
            style={{ left: `${x}%`, width: 1, background: "rgba(255,255,255,0.04)" }}
          />
        ))}

        {/* SVG for arrows */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
          <defs>
            <marker id="arr-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="var(--neon-red)" />
            </marker>
            <marker id="arr-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="var(--neon-green)" />
            </marker>
            <marker id="arr-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="var(--neon-blue)" />
            </marker>
          </defs>

          {REGIONS.map((r) => {
            const rx = (r.x / 100) * 100; // svg uses % coords via viewBox trick
            const ry = (r.y / 100) * 100;
            const ox = ORIGIN.x;
            const oy = ORIGIN.y;
            const ex = (EDGE_POSITIONS[r.id].x / 100) * 100;
            const ey = (EDGE_POSITIONS[r.id].y / 100) * 100;

            if (cdnEnabled) {
              return (
                <g key={r.id}>
                  {/* Region → Edge (green) */}
                  <motion.line
                    key={`${r.id}-cdn`}
                    x1={`${rx}%`} y1={`${ry}%`}
                    x2={`${ex}%`} y2={`${ey}%`}
                    stroke="var(--neon-green)"
                    strokeWidth="1.5"
                    strokeDasharray="5 4"
                    markerEnd="url(#arr-green)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: 0.1 }}
                    style={{ animation: "flow-dash 1.2s linear infinite" }}
                  />
                  {/* Edge → Origin (blue, thin, dashed) */}
                  <motion.line
                    key={`${r.id}-origin`}
                    x1={`${ex}%`} y1={`${ey}%`}
                    x2={`${ox}%`} y2={`${oy}%`}
                    stroke="var(--neon-blue)"
                    strokeWidth="0.8"
                    strokeDasharray="3 6"
                    opacity={0.3}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: 0.2 }}
                  />
                </g>
              );
            } else {
              return (
                <motion.line
                  key={r.id}
                  x1={`${rx}%`} y1={`${ry}%`}
                  x2={`${ox}%`} y2={`${oy}%`}
                  stroke="var(--neon-red)"
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                  markerEnd="url(#arr-red)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.75 }}
                  style={{ animation: "flow-dash 1.8s linear infinite" }}
                />
              );
            }
          })}
        </svg>

        {/* Origin server */}
        <motion.div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
          style={{ left: `${ORIGIN.x}%`, top: `${ORIGIN.y}%` }}
          animate={{ boxShadow: ["0 0 8px var(--neon-blue)", "0 0 20px var(--neon-blue)", "0 0 8px var(--neon-blue)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div
            className="h-10 w-10 rounded-xl border-2 border-neon-blue bg-bg-tertiary grid place-items-center text-lg"
            style={{ boxShadow: "0 0 14px -4px var(--neon-blue)" }}
          >
            🖥️
          </div>
          <span className="mono text-[0.6rem] text-neon-blue whitespace-nowrap">Origin (US)</span>
        </motion.div>

        {/* Edge servers */}
        <AnimatePresence>
          {cdnEnabled && REGIONS.map((r) => {
            const ep = EDGE_POSITIONS[r.id];
            return (
              <motion.div
                key={`edge-${r.id}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                style={{ left: `${ep.x}%`, top: `${ep.y}%` }}
              >
                <div
                  className="h-8 w-8 rounded-lg border border-neon-green bg-bg-tertiary grid place-items-center text-sm"
                  style={{ boxShadow: "0 0 10px -3px var(--neon-green)" }}
                >
                  ⚡
                </div>
                <span className="mono text-[0.55rem] text-neon-green whitespace-nowrap">Edge</span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Region user nodes with latency */}
        {REGIONS.map((r) => {
          const latency = cdnEnabled ? r.latencyCDN : r.latencyNoCDN;
          const color = latencyColor(latency);
          return (
            <div
              key={r.id}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
              style={{ left: `${r.x}%`, top: `${r.y}%` }}
            >
              <div
                className="h-8 w-8 rounded-lg border-2 bg-bg-tertiary grid place-items-center text-sm"
                style={{ borderColor: color, boxShadow: `0 0 10px -3px ${color}` }}
              >
                👤
              </div>
              <span className="mono text-[0.55rem] text-ink-secondary">{r.label}</span>
              <motion.span
                key={`${r.id}-${cdnEnabled}`}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                className="mono text-[0.65rem] font-bold rounded-md px-1"
                style={{ color, background: `${color}15` }}
              >
                {latency}ms
              </motion.span>
            </div>
          );
        })}
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 border-t border-[var(--border-subtle)]">
        <div className="p-4 border-r border-[var(--border-subtle)]">
          <div className="mono text-[0.6rem] uppercase tracking-widest text-ink-muted mb-1">Avg latency</div>
          <motion.div
            key={cdnEnabled ? "cdn" : "nocDN"}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="font-display text-2xl font-extrabold"
            style={{ color: cdnEnabled ? "var(--neon-green)" : "var(--neon-red)" }}
          >
            {cdnEnabled
              ? `${Math.round(REGIONS.reduce((a, r) => a + r.latencyCDN, 0) / REGIONS.length)}ms`
              : `${Math.round(REGIONS.reduce((a, r) => a + r.latencyNoCDN, 0) / REGIONS.length)}ms`
            }
          </motion.div>
        </div>
        <div className="p-4">
          <div className="mono text-[0.6rem] uppercase tracking-widest text-ink-muted mb-1">Origin load</div>
          <div
            className="font-display text-2xl font-extrabold"
            style={{ color: cdnEnabled ? "var(--neon-green)" : "var(--neon-red)" }}
          >
            {cdnEnabled ? "~10%" : "100%"}
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            {cdnEnabled ? "Edge serves 90% of traffic" : "Every request hits origin"}
          </p>
        </div>
      </div>
    </div>
  );
}

// --------------- CDN concepts ---------------
const CDN_CONCEPTS = [
  { term: "PoP", full: "Point of Presence", desc: "A physical data center housing edge servers, strategically placed near population centers.", emoji: "📍", color: "var(--neon-blue)" },
  { term: "Cache Hit", full: "Served from edge", desc: "Edge already has the content. Lightning fast. No origin involved. This is the goal.", emoji: "⚡", color: "var(--neon-green)" },
  { term: "Cache Miss", full: "Origin fetched", desc: "Edge doesn&apos;t have it yet — fetches from origin, caches it, then serves future requests locally.", emoji: "🐌", color: "var(--neon-yellow)" },
  { term: "TTL", full: "Time To Live", desc: "How long the edge caches a file before re-validating with origin. Too long = stale content. Too short = pointless CDN.", emoji: "⏱️", color: "var(--neon-purple)" },
  { term: "Anycast", full: "IP routing trick", desc: "Same IP address, multiple physical servers. Network routes you to the nearest one automatically. Magic.", emoji: "🌐", color: "var(--neon-orange)" },
];

export default function CdnPage() {
  return (
    <ConceptPage
      slug="cdn"
      analogy={
        <FunnyAnalogy
          emoji="🍕"
          color="var(--neon-yellow)"
          alternates={[
            { emoji: "📦", text: "Amazon warehouses: they don&apos;t ship everything from Seattle. They pre-position inventory in 100 cities so delivery is same-day." },
            { emoji: "🏦", text: "ATMs: you don&apos;t fly to your bank&apos;s HQ to withdraw cash. ATMs (edge nodes) cached your money nearby." },
          ]}
        >
          One pizza place downtown vs a <strong className="text-neon-yellow">franchise on every block</strong>.
          Without a CDN, every user in Tokyo is ordering from a shop in New York.
          With a CDN, there&apos;s a freshly-stocked kitchen 5 minutes away. Same pizza, 10x faster delivery.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The problem" title="Geography is physics">
          <p className="text-ink-secondary">
            The speed of light in fiber is ~200,000 km/s. New York to Tokyo is ~11,000 km, so the round-trip
            floor is ~110ms — before any server processing. A CDN puts servers <em>inside</em> that distance.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "NY → SF (same country)", ms: "~40ms", bar: 10, color: "var(--neon-green)" },
              { label: "NY → London (Atlantic)", ms: "~80ms", bar: 25, color: "var(--neon-yellow)" },
              { label: "NY → Tokyo (Pacific)", ms: "~140ms", bar: 55, color: "var(--neon-red)" },
            ].map((item) => (
              <div key={item.label} className="card p-3">
                <div className="mono text-[0.65rem] text-ink-muted mb-1">{item.label}</div>
                <div className="font-display font-bold text-xl" style={{ color: item.color }}>{item.ms}</div>
                <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.bar}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Interactive demo" title="Enable CDN — watch latency collapse">
          <p className="mb-4 text-ink-secondary">
            Toggle the CDN and watch arrows reroute from one overwhelmed origin server to regional edge nodes.
            Latency numbers animate down. Origin load drops to ~10%.
          </p>
          <WorldMapSim />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Vocabulary" title="CDN jargon, decoded">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CDN_CONCEPTS.map((c) => (
              <motion.div
                key={c.term}
                whileHover={{ y: -2 }}
                className="card p-4"
                style={{ borderColor: `${c.color}25` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{c.emoji}</span>
                  <div>
                    <span className="font-display font-bold text-sm" style={{ color: c.color }}>{c.term}</span>
                    <div className="mono text-[0.6rem] text-ink-muted">{c.full}</div>
                  </div>
                </div>
                <p className="text-xs text-ink-secondary">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="What CDNs cache" title="Not everything belongs at the edge">
          <div className="card divide-y divide-[var(--border-subtle)]">
            {[
              { label: "Static assets (JS, CSS, images, fonts)", good: true, why: "Never changes per-user. Cache forever (with versioned filenames)." },
              { label: "Video & audio streams", good: true, why: "Huge files, many viewers. CDN removes massive origin bandwidth cost." },
              { label: "HTML pages (edge SSR)", good: true, why: "Frameworks like Next.js can push pre-rendered HTML to edges (ISR)." },
              { label: "Personalized content (cart, dashboard)", good: false, why: "User-specific — can&apos;t be cached without leaking data to wrong user 😱." },
              { label: "Real-time API responses", good: false, why: "Stale cached API data is worse than slow fresh data." },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-4">
                <span className="mt-0.5 text-sm shrink-0" style={{ color: item.good ? "var(--neon-green)" : "var(--neon-red)" }}>
                  {item.good ? "✓" : "✗"}
                </span>
                <div>
                  <div className="text-sm font-medium" style={{ color: item.good ? "var(--neon-green)" : "var(--neon-red)" }}>{item.label}</div>
                  <div className="text-xs text-ink-muted">{item.why}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="cdn"
          questions={[
            {
              question: "What is the primary purpose of a CDN?",
              options: ["To store user databases", "To serve content from servers physically closer to users", "To replace your origin server", "To encrypt all traffic"],
              correct: 1,
              explain: "CDNs reduce latency by caching and serving content from edge nodes near the user — geography is physics.",
            },
            {
              question: "A CDN cache miss means…",
              options: ["The edge has the content, serves it instantly", "The edge doesn&apos;t have the content and must fetch from origin", "The CDN is offline", "The file was deleted"],
              correct: 1,
              explain: "On a miss, the edge fetches from origin, caches the result, and future requests become hits.",
            },
            {
              question: "Which type of content should NOT be cached at the CDN edge?",
              options: ["JavaScript bundles", "Font files", "User-specific dashboard data", "Product images"],
              correct: 2,
              explain: "Personalized content must not be served from shared cache — you&apos;d leak one user&apos;s data to another.",
            },
            {
              question: "What does TTL control in a CDN?",
              options: ["How fast the edge server is", "How long the edge caches content before re-fetching from origin", "The number of edge servers", "The maximum file size"],
              correct: 1,
              explain: "TTL (Time To Live) balances freshness vs performance. Too long = stale, too short = defeats the purpose.",
            },
            {
              question: "Anycast routing means…",
              options: ["Using any random server", "The same IP address maps to multiple physical servers — traffic routes to the nearest one", "A special CDN protocol", "Encrypting all CDN traffic"],
              correct: 1,
              explain: "Anycast allows the same IP to exist on many machines. BGP routing directs each user to the geographically closest one.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
