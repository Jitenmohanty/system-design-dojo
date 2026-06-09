"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";

type Fmt = "JSON" | "XML" | "YAML" | "Protobuf";

const SAMPLES: Record<Fmt, string> = {
  JSON: `{
  "id": 7,
  "name": "Neo",
  "belt": "black",
  "active": true
}`,
  XML: `<user>
  <id>7</id>
  <name>Neo</name>
  <belt>black</belt>
  <active>true</active>
</user>`,
  YAML: `id: 7
name: Neo
belt: black
active: true`,
  Protobuf: `// binary on the wire; schema:
message User {
  int32 id = 1;
  string name = 2;
  string belt = 3;
  bool active = 4;
}`,
};

const SIZES = [
  { name: "Protobuf", bytes: 18, color: "var(--neon-green)" },
  { name: "JSON", bytes: 62, color: "var(--neon-blue)" },
  { name: "YAML", bytes: 48, color: "var(--neon-yellow)" },
  { name: "XML", bytes: 104, color: "var(--neon-red)" },
];

const FMT_COLOR: Record<Fmt, string> = {
  JSON: "var(--neon-blue)", XML: "var(--neon-red)", YAML: "var(--neon-yellow)", Protobuf: "var(--neon-green)",
};

function FormatToggle() {
  const [fmt, setFmt] = useState<Fmt>("JSON");
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] bg-bg-tertiary/40 p-3">
        {(Object.keys(SAMPLES) as Fmt[]).map((f) => (
          <button
            key={f}
            onClick={() => setFmt(f)}
            className="rounded-lg border px-3 py-1.5 mono text-xs font-bold transition"
            style={{
              borderColor: fmt === f ? FMT_COLOR[f] : "var(--border-subtle)",
              color: fmt === f ? FMT_COLOR[f] : "var(--text-secondary)",
              background: fmt === f ? `${FMT_COLOR[f]}1a` : "transparent",
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.pre
          key={fmt}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="overflow-x-auto p-4 mono text-sm leading-relaxed"
          style={{ color: FMT_COLOR[fmt] }}
        >
          {SAMPLES[fmt]}
        </motion.pre>
      </AnimatePresence>
    </div>
  );
}

function JsonEditor() {
  const [name, setName] = useState("Neo");
  const [belt, setBelt] = useState("black");
  const [level, setLevel] = useState(7);
  const [active, setActive] = useState(true);

  const obj = useMemo(() => ({ name, belt, level, active }), [name, belt, level, active]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card space-y-3 p-4">
        <div className="mono text-[0.6rem] uppercase tracking-widest text-ink-muted">Edit values</div>
        {[
          { label: "name", el: <input value={name} onChange={(e) => setName(e.target.value)} className="field" /> },
          { label: "belt", el: (
            <select value={belt} onChange={(e) => setBelt(e.target.value)} className="field">
              {["white", "yellow", "green", "black"].map((b) => <option key={b}>{b}</option>)}
            </select>
          ) },
          { label: "level", el: <input type="range" min={1} max={10} value={level} onChange={(e) => setLevel(+e.target.value)} className="w-full accent-[var(--neon-blue)]" /> },
        ].map((f) => (
          <label key={f.label} className="block">
            <span className="mono text-xs text-neon-blue">{f.label}</span>
            <div className="mt-1">{f.el}</div>
          </label>
        ))}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[var(--neon-green)]" />
          <span className="mono text-xs text-neon-blue">active</span>
        </label>
      </div>

      <div className="card p-4">
        <div className="mono text-[0.6rem] uppercase tracking-widest text-ink-muted">Live JSON</div>
        <pre className="mt-2 overflow-x-auto mono text-sm">
          <span className="text-ink-muted">{"{"}</span>
          {Object.entries(obj).map(([k, v], i, arr) => (
            <motion.div key={k} layout className="pl-4">
              <span className="text-neon-purple">&quot;{k}&quot;</span>
              <span className="text-ink-muted">: </span>
              <motion.span
                key={String(v)}
                initial={{ color: "#fff" }}
                animate={{ color: typeof v === "string" ? "var(--neon-green)" : typeof v === "number" ? "var(--neon-yellow)" : "var(--neon-blue)" }}
              >
                {typeof v === "string" ? `"${v}"` : String(v)}
              </motion.span>
              {i < arr.length - 1 && <span className="text-ink-muted">,</span>}
            </motion.div>
          ))}
          <span className="text-ink-muted">{"}"}</span>
        </pre>
      </div>
    </div>
  );
}

export default function JsonFormatsPage() {
  return (
    <ConceptPage
      slug="json-data-formats"
      analogy={
        <FunnyAnalogy
          emoji="🔤"
          color="var(--neon-blue)"
          alternates={[
            { emoji: "🌐", text: "Like English at an international airport — a shared language so everyone understands." },
            { emoji: "📦", text: "A standard shipping container: any crane in any port can handle it." },
          ]}
        >
          JSON is the <strong className="text-neon-blue">universal translator</strong> for computers. Different
          systems, languages, and devices all agree to speak it — so a Python server and a JavaScript browser
          can understand each other perfectly.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="Same data, four outfits" title="JSON vs XML vs YAML vs Protobuf">
          <p className="text-ink-secondary">
            Here&apos;s one user profile written four ways. Toggle between them — notice they carry identical
            information, just dressed differently:
          </p>
          <div className="mt-4"><FormatToggle /></div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Size matters" title="Bytes on the wire">
          <p className="text-ink-secondary">
            Smaller payloads = faster transfers and lower cost. Protobuf is compact binary; XML is the chatty one.
          </p>
          <div className="card mt-4 p-4" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SIZES} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} unit="B" />
                <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} width={70} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any) => [`${v} bytes`, "size"]}
                />
                <Bar dataKey="bytes" radius={[0, 6, 6, 0]}>
                  {SIZES.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Why a format at all" title="Serialize → wire → deserialize">
          <p className="mb-4 text-ink-secondary">
            A format only exists because two computers can&apos;t share memory — they can only send{" "}
            <strong className="text-white">bytes</strong>. The sender <strong className="text-neon-blue">serializes</strong>{" "}
            its objects into text/binary, ships them across the network, and the receiver{" "}
            <strong className="text-neon-green">deserializes</strong> them back into objects. Both sides must agree
            on the format. Click each box.
          </p>
          <AnimatedDiagram
            height={300}
            nodes={[
              { id: "client", type: "client", label: "Client", position: { x: 10, y: 50 }, status: "busy", info: "Has an in-memory object { name: 'Neo' }. Serializes it to a JSON string before sending — bytes are all the network understands." },
              { id: "net", type: "gateway", label: "Network", position: { x: 50, y: 50 }, status: "active", info: "Carries raw bytes. The fewer bytes (Protobuf < JSON < XML), the faster and cheaper the trip." },
              { id: "server", type: "server", label: "Server", position: { x: 90, y: 50 }, status: "busy", info: "Receives the bytes and deserializes (parses) them back into an object it can work with. Same format on both ends = no garbled data." },
            ]}
            edges={[
              { from: "client", to: "net", animated: true, color: "var(--neon-blue)", label: "serialize →" },
              { from: "net", to: "server", animated: true, color: "var(--neon-green)", label: "→ deserialize" },
            ]}
          />
          <p className="mt-3 text-xs text-ink-muted">Tip: JSON wins for APIs because it&apos;s human-readable and every language can parse it. Protobuf wins inside high-traffic backends because those smaller bytes add up at scale.</p>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Hands on" title="Build a JSON object">
          <p className="text-ink-secondary">Change the inputs and watch the structure update live, with types color-coded:</p>
          <div className="mt-4"><JsonEditor /></div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="json-data-formats"
          questions={[
            {
              question: "Why is JSON so widely used for APIs?",
              options: ["It's the smallest possible format", "It's human-readable and supported everywhere", "It's binary and encrypted", "It only works in JavaScript"],
              correct: 1,
              explain: "JSON is readable, language-agnostic, and natively supported across the web.",
            },
            {
              question: "Which format is typically the smallest on the wire?",
              options: ["XML", "YAML", "Protobuf", "JSON"],
              correct: 2,
              explain: "Protobuf serializes to compact binary — great for high-throughput service-to-service calls.",
            },
            {
              question: "In JSON, how is a string value written?",
              options: ["In single quotes", "In double quotes", "With no quotes", "In backticks"],
              correct: 1,
              explain: 'JSON requires double quotes for both keys and string values: "name": "Neo".',
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
