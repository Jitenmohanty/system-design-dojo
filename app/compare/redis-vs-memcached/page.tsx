"use client";

import { ComparePageShell, CompareSection } from "@/components/compare/ComparePageShell";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";

const RED = "var(--neon-red)";
const GREEN = "var(--neon-green)";

export default function RedisVsMemcached() {
  return (
    <ComparePageShell
      emoji="⚡"
      title={<><span style={{ color: RED }}>Redis</span> vs <span style={{ color: GREEN }}>Memcached</span></>}
      subtitle="Two in-memory stores. One is a Swiss-army data structure server; the other is a ruthless cache."
      verdict={
        <p>
          Pick <strong style={{ color: RED }}>Redis</strong> for almost everything today: it does rich data types,
          persistence, pub/sub, replication, and clustering — a cache that&apos;s also a lightweight database. Pick{" "}
          <strong style={{ color: GREEN }}>Memcached</strong> when you want the simplest possible multi-threaded
          key→blob cache and you&apos;ll never need anything fancier. For most teams, Redis is the default.
        </p>
      }
    >
      <CompareSection title="Round-by-round">
        <ComparisonBattle
          left={{ name: "Redis", emoji: "🧰", color: RED, bestFor: "Rich data types, persistence, pub/sub, leaderboards, queues, rate limiting." }}
          right={{ name: "Memcached", emoji: "🗃️", color: GREEN, bestFor: "Dead-simple, multi-threaded, high-throughput key→value caching." }}
          features={[
            { label: "Data types", a: "Many", b: "Strings only", winner: "a" },
            { label: "Persistence", a: "RDB + AOF", b: "None", winner: "a" },
            { label: "Replication", a: "Yes", b: "No (client-side)", winner: "a" },
            { label: "Clustering", a: "Built-in", b: "Client sharding", winner: "a" },
            { label: "Multithreaded", a: "Mostly single", b: "Yes", winner: "b" },
            { label: "Raw simplicity", a: 7, b: 10, max: 10, winner: "b" },
            { label: "Memory efficiency", a: 8, b: 9, max: 10, winner: "b" },
            { label: "Versatility", a: 10, b: 4, max: 10, winner: "a" },
          ]}
        />
      </CompareSection>

      <CompareSection title="Redis data types you can't get in Memcached">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: "Strings", d: "Counters, caching, INCR for rate limiting." },
            { t: "Hashes", d: "Store objects field-by-field." },
            { t: "Lists", d: "Queues & stacks (LPUSH/RPOP)." },
            { t: "Sets / Sorted Sets", d: "Leaderboards, ranking, unique tracking." },
            { t: "Streams", d: "Append-only logs, consumer groups." },
            { t: "Pub/Sub", d: "Lightweight real-time messaging." },
          ].map((x) => (
            <div key={x.t} className="card p-4">
              <div className="font-display font-semibold" style={{ color: RED }}>{x.t}</div>
              <p className="mt-1 text-sm text-ink-secondary">{x.d}</p>
            </div>
          ))}
        </div>
      </CompareSection>

      <CompareSection title="When Memcached still shines">
        <div className="card p-5 text-sm text-ink-secondary">
          A huge, purely ephemeral cache of opaque blobs where multi-threaded throughput on a single big box matters,
          and you genuinely never need persistence, replication, or data structures. Simpler surface area = fewer
          ways to misuse it.
        </div>
      </CompareSection>
    </ComparePageShell>
  );
}
