"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Monitor, HardDrive, Network, Globe, Server, CheckCircle2 } from "lucide-react";
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

const STEPS = [
  { icon: Monitor, label: "Browser cache", note: "Have I looked this up recently?", ms: 1 },
  { icon: HardDrive, label: "OS cache", note: "Does my computer remember?", ms: 2 },
  { icon: Network, label: "DNS Resolver", note: "Your ISP's helpful librarian", ms: 8 },
  { icon: Globe, label: "Root server", note: "\"Ask the .com people →\"", ms: 30 },
  { icon: Server, label: "TLD server (.com)", note: "\"Ask dojo.com's nameserver →\"", ms: 24 },
  { icon: Server, label: "Authoritative server", note: "\"The IP is 142.250.80.46\"", ms: 18 },
];

function DnsFlow() {
  const [domain, setDomain] = useState("dojo.com");
  const [active, setActive] = useState(-1);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const run = () => {
    if (running) return;
    setRunning(true); setDone(false); setActive(-1);
    let i = 0;
    const tick = () => {
      setActive(i);
      i++;
      if (i <= STEPS.length) {
        setTimeout(tick, 650);
      } else {
        setTimeout(() => { setDone(true); setRunning(false); }, 400);
      }
    };
    tick();
  };

  const total = STEPS.reduce((a, s) => a + s.ms, 0);

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-bg-tertiary/50 px-3 py-2">
          <Search size={14} className="text-ink-muted" />
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1 bg-transparent mono text-sm text-neon-blue outline-none"
            placeholder="type any domain…"
          />
        </div>
        <button onClick={run} disabled={running} className="btn-neon text-sm disabled:opacity-50">
          {running ? "Resolving…" : "Resolve →"}
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {STEPS.map((s, i) => {
          const isActive = active === i;
          const passed = active > i || done;
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              animate={{
                borderColor: isActive ? "var(--neon-blue)" : passed ? "rgba(0,255,136,0.3)" : "var(--border-subtle)",
                scale: isActive ? 1.015 : 1,
              }}
              className="flex items-center gap-3 rounded-xl border bg-bg-tertiary/30 px-4 py-3"
            >
              <span
                className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-colors")}
                style={{
                  color: isActive ? "var(--neon-blue)" : passed ? "var(--neon-green)" : "var(--text-muted)",
                  background: isActive ? "rgba(0,212,255,0.12)" : passed ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.03)",
                  boxShadow: isActive ? "0 0 16px -4px var(--neon-blue)" : undefined,
                }}
              >
                {passed ? <CheckCircle2 size={20} /> : <Icon size={20} />}
              </span>
              <div className="flex-1">
                <div className="font-display text-sm font-semibold text-white">{s.label}</div>
                <div className="text-xs text-ink-secondary">{s.note}</div>
              </div>
              <span className="mono text-xs" style={{ color: passed || isActive ? "var(--neon-blue)" : "var(--text-muted)" }}>
                ~{s.ms}ms
              </span>
            </motion.div>
          );
        })}
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-neon-green/40 bg-neon-green/10 p-3 text-center text-sm"
        >
          <span className="text-neon-green">✅ Connected!</span>{" "}
          <span className="mono text-ink-secondary">{domain} → 142.250.80.46</span>{" "}
          <span className="text-ink-muted">in ~{total}ms (and cached for next time)</span>
        </motion.div>
      )}
    </div>
  );
}

export default function DnsPage() {
  return (
    <ConceptPage
      slug="dns-how-internet-works"
      analogy={
        <FunnyAnalogy
          emoji="📖"
          color="var(--neon-green)"
          alternates={[
            { emoji: "📇", text: "Saving a contact: you remember 'Mom', your phone remembers the number." },
            { emoji: "🗺️", text: "Asking for directions — you keep getting pointed to someone who knows more." },
          ]}
        >
          DNS is the <strong className="text-neon-green">phone book of the internet</strong>. You know{" "}
          <span className="mono text-neon-blue">google.com</span>, but computers need{" "}
          <span className="mono text-neon-yellow">142.250.80.46</span>. DNS does the lookup so you never have to.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The journey" title="What happens when you hit Enter">
          <p className="text-ink-secondary">
            Type a domain and your computer goes on a little scavenger hunt, asking a chain of servers
            &ldquo;who is this?&rdquo; — checking caches first (fast!) before bothering the big servers (slower).
            Watch it happen:
          </p>
          <div className="mt-4">
            <DnsFlow />
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Why it's fast" title="Caching at every layer">
          <p className="text-ink-secondary">
            Notice the first two steps take ~1ms? That&apos;s caching. Once a lookup happens, the answer is
            remembered for a while (its <strong className="text-neon-yellow">TTL</strong> — time to live) so the
            next visit skips the whole journey. Without caching, every click would crawl through root servers.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { t: "Hierarchy", d: "Root → TLD (.com) → Authoritative. Each knows who to ask next.", c: "var(--neon-blue)" },
              { t: "Caching", d: "Browser, OS, and resolver all remember recent answers.", c: "var(--neon-green)" },
              { t: "TTL", d: "How long an answer stays fresh before re-checking.", c: "var(--neon-yellow)" },
            ].map((x) => (
              <div key={x.t} className="card p-4">
                <div className="font-display font-semibold" style={{ color: x.c }}>{x.t}</div>
                <p className="mt-1 text-sm text-ink-secondary">{x.d}</p>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="dns-how-internet-works"
          questions={[
            {
              question: "What does DNS actually translate?",
              options: ["Passwords into tokens", "Domain names into IP addresses", "HTTP into HTTPS", "Files into folders"],
              correct: 1,
              explain: "DNS maps human-friendly names (dojo.com) to machine addresses (142.250.80.46).",
            },
            {
              question: "Why is the second visit to a site usually faster to resolve?",
              options: ["The internet warms up", "The answer is cached locally", "Servers like returning visitors", "DNS turns off"],
              correct: 1,
              explain: "Caching at the browser/OS/resolver means we skip the full lookup until the TTL expires.",
            },
            {
              question: "Which server is asked LAST in a fresh lookup?",
              options: ["Browser cache", "Root server", "Authoritative nameserver", "OS cache"],
              correct: 2,
              explain: "The authoritative nameserver holds the real answer — the IP for that exact domain.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
