"use client";

import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { LoadBalancerSim } from "@/components/simulations/LoadBalancerSim";

const ALGO_CARDS = [
  { name: "Round Robin", pro: "Dead simple, even spread", con: "Ignores server load & power", color: "var(--neon-blue)" },
  { name: "Least Connections", pro: "Adapts to real-time load", con: "Needs connection tracking", color: "var(--neon-green)" },
  { name: "Weighted RR", pro: "Respects beefier servers", con: "Manual weight tuning", color: "var(--neon-purple)" },
  { name: "IP Hash", pro: "Sticky sessions for free", con: "Uneven if IPs cluster", color: "var(--neon-orange)" },
  { name: "Random", pro: "Zero state, scales great", con: "Unlucky streaks happen", color: "var(--neon-yellow)" },
  { name: "Least Response", pro: "Routes to the fastest", con: "Probing overhead", color: "var(--neon-red)" },
];

export default function LoadBalancingPage() {
  return (
    <ConceptPage
      slug="load-balancing"
      analogy={
        <FunnyAnalogy
          emoji="⚖️"
          color="var(--neon-purple)"
          alternates={[
            { emoji: "🛂", text: "Airport security opening more lanes when lines get long — and closing them when quiet." },
            { emoji: "📞", text: "A call center routing you to whichever agent is free (or best for your issue)." },
          ]}
        >
          A load balancer is the <strong className="text-neon-purple">host at a busy restaurant</strong>,
          deciding which table (server) gets the next customer (request) — keeping any one table from getting
          slammed while others sit empty.
        </FunnyAnalogy>
      }
    >
      <ScrollReveal>
        <Section kicker="The shape of it" title="Where the balancer sits">
          <p className="mb-4 text-ink-secondary">
            Clients never talk to your servers directly. They hit the load balancer, which spreads the work
            across a pool of identical servers — which in turn share the databases.
          </p>
          <AnimatedDiagram
            height={300}
            nodes={[
              { id: "c1", type: "client", label: "Clients", position: { x: 12, y: 50 }, status: "active" },
              { id: "lb", type: "loadbalancer", label: "Load Balancer", position: { x: 38, y: 50 }, status: "active", info: "Distributes incoming requests across the server pool." },
              { id: "s1", type: "server", label: "S1", position: { x: 64, y: 22 }, status: "busy" },
              { id: "s2", type: "server", label: "S2", position: { x: 64, y: 50 }, status: "busy" },
              { id: "s3", type: "server", label: "S3", position: { x: 64, y: 78 }, status: "busy" },
              { id: "db", type: "database", label: "DB", position: { x: 88, y: 50 }, status: "active" },
            ]}
            edges={[
              { from: "c1", to: "lb", animated: true },
              { from: "lb", to: "s1", animated: true, color: "var(--neon-purple)" },
              { from: "lb", to: "s2", animated: true, color: "var(--neon-purple)" },
              { from: "lb", to: "s3", animated: true, color: "var(--neon-purple)" },
              { from: "s1", to: "db" }, { from: "s2", to: "db" }, { from: "s3", to: "db" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="★ The main event" title="Live load balancer simulation">
          <p className="mb-4 text-ink-secondary">
            Switch algorithms, crank the request rate, and <strong className="text-neon-red">kill a server</strong>{" "}
            to watch traffic reroute in real time. Try IP Hash and notice the same clients stick to the same
            server; try Weighted and watch the heavy servers soak up more load.
          </p>
          <LoadBalancerSim />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Head to head" title="Two classics, compared">
          <ComparisonBattle
            left={{ name: "Round Robin", emoji: "🔄", color: "var(--neon-blue)", bestFor: "Uniform servers and stateless, short requests where simplicity wins." }}
            right={{ name: "Least Connections", emoji: "📊", color: "var(--neon-orange)", bestFor: "Long-lived or uneven requests where real-time load matters." }}
            features={[
              { label: "Fairness", a: 7, b: 9, max: 10, winner: "b" },
              { label: "Complexity", a: "Low", b: "Medium", winner: "a" },
              { label: "Adapts to load", a: "No", b: "Yes", winner: "b" },
              { label: "State needed", a: "None", b: "Conn counts", winner: "a" },
              { label: "Speed", a: 10, b: 8, max: 10, winner: "a" },
            ]}
          />
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Cheat sheet" title="All six at a glance">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALGO_CARDS.map((a) => (
              <div key={a.name} className="card p-4">
                <div className="font-display font-semibold" style={{ color: a.color }}>{a.name}</div>
                <div className="mt-2 text-sm text-neon-green">✓ {a.pro}</div>
                <div className="text-sm text-neon-red">✗ {a.con}</div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section kicker="Decision tree" title="When to use what">
          <div className="card space-y-2 p-5 text-sm">
            <p className="text-ink-secondary">🤔 Need <strong className="text-white">sticky sessions</strong> (same user → same server)? → <span className="text-neon-orange">IP Hash</span></p>
            <p className="text-ink-secondary">🤔 Servers have <strong className="text-white">different specs</strong>? → <span className="text-neon-purple">Weighted Round Robin</span></p>
            <p className="text-ink-secondary">🤔 Requests <strong className="text-white">vary wildly</strong> in duration? → <span className="text-neon-green">Least Connections / Least Response Time</span></p>
            <p className="text-ink-secondary">🤔 Identical servers, short requests, want <strong className="text-white">simple</strong>? → <span className="text-neon-blue">Round Robin</span></p>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <InteractiveQuiz
          slug="load-balancing"
          questions={[
            {
              question: "Which algorithm guarantees the same client lands on the same server?",
              options: ["Round Robin", "Random", "IP Hash", "Least Connections"],
              correct: 2,
              explain: "IP Hash maps a client's IP to a fixed server — giving 'sticky' sessions.",
            },
            {
              question: "A server is killed during heavy traffic. What should a good load balancer do?",
              options: ["Crash too", "Reroute its traffic to the remaining healthy servers", "Queue everything forever", "Email you"],
              correct: 1,
              explain: "Health checks + rerouting keep the system available when a node dies.",
            },
            {
              question: "Why pick Least Connections over Round Robin?",
              options: ["It's simpler", "Requests vary in duration, so raw rotation overloads some servers", "It needs no state", "It's always faster"],
              correct: 1,
              explain: "When request durations differ, tracking active connections balances real load better.",
            },
            {
              question: "Weighted Round Robin is most useful when…",
              options: ["All servers are identical", "Some servers are more powerful than others", "You have exactly one server", "Sessions must be sticky"],
              correct: 1,
              explain: "Weights let beefier servers take a proportionally larger share of traffic.",
            },
            {
              question: "What does the 'health' metric drop indicate in the sim?",
              options: ["More servers added", "Lower latency", "Servers down and/or CPU saturating", "Faster responses"],
              correct: 2,
              explain: "Health falls as servers die or CPU climbs — your early warning of trouble.",
            },
          ]}
        />
      </ScrollReveal>
    </ConceptPage>
  );
}
