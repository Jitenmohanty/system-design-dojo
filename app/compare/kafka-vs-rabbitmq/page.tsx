"use client";

import { ComparePageShell, CompareSection } from "@/components/compare/ComparePageShell";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";

const YELLOW = "var(--neon-yellow)";
const ORANGE = "var(--neon-orange)";

export default function KafkaVsRabbitMQ() {
  return (
    <ComparePageShell
      emoji="📨"
      title={<><span style={{ color: YELLOW }}>Kafka</span> vs <span style={{ color: ORANGE }}>RabbitMQ</span></>}
      subtitle="A durable distributed log vs a flexible smart message broker. Different shapes for different jobs."
      verdict={
        <p>
          <strong style={{ color: YELLOW }}>Kafka</strong> is a distributed, append-only commit log: insane
          throughput, messages retained and replayable, consumers track their own offset. Reach for it for event
          streaming, analytics pipelines, and log aggregation. <strong style={{ color: ORANGE }}>RabbitMQ</strong> is
          a traditional broker with flexible routing (exchanges, queues), per-message acks, and priorities — great
          for task queues and complex routing where messages are consumed once and gone. Rule of thumb: streaming &
          replay → Kafka; task queues & routing → RabbitMQ.
        </p>
      }
    >
      <CompareSection title="Round-by-round">
        <ComparisonBattle
          left={{ name: "Kafka", emoji: "🪵", color: YELLOW, bestFor: "Event streaming, log aggregation, analytics, replayable high-volume pipelines." }}
          right={{ name: "RabbitMQ", emoji: "🐰", color: ORANGE, bestFor: "Task queues, complex routing, per-message priority, request/reply patterns." }}
          features={[
            { label: "Model", a: "Append-only log", b: "Smart broker", winner: "tie" },
            { label: "Throughput", a: 10, b: 6, max: 10, winner: "a" },
            { label: "Message replay", a: "Yes", b: "No (consumed)", winner: "a" },
            { label: "Ordering", a: "Per-partition", b: "Per-queue", winner: "a" },
            { label: "Routing flexibility", a: 5, b: 10, max: 10, winner: "b" },
            { label: "Priority queues", a: "No", b: "Yes", winner: "b" },
            { label: "Retention", a: "Time/size based", b: "Until acked", winner: "a" },
            { label: "Setup simplicity", a: 5, b: 8, max: 10, winner: "b" },
          ]}
        />
      </CompareSection>

      <CompareSection title="The mental model">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="card p-4">
            <div className="font-display font-semibold" style={{ color: YELLOW }}>Kafka = a log everyone reads</div>
            <p className="mt-1 text-sm text-ink-secondary">
              Producers append to partitions. Each consumer group tracks its own offset, so the same event can be
              read by analytics, billing, and search independently — and re-read after a bug fix.
            </p>
          </div>
          <div className="card p-4">
            <div className="font-display font-semibold" style={{ color: ORANGE }}>RabbitMQ = a post office</div>
            <p className="mt-1 text-sm text-ink-secondary">
              Producers publish to exchanges; rules route messages into queues; workers pull and ack. Once a worker
              processes a message, it&apos;s gone. Perfect for &ldquo;do this job exactly once&rdquo;.
            </p>
          </div>
        </div>
      </CompareSection>

      <CompareSection title="Use-case scenarios">
        <div className="space-y-2 text-sm">
          {[
            { s: "Ingesting 1M IoT events/sec for a dashboard", w: "Kafka", c: YELLOW },
            { s: "Distributing image-resize jobs to workers", w: "RabbitMQ", c: ORANGE },
            { s: "Replaying a week of events after a bug fix", w: "Kafka", c: YELLOW },
            { s: "Priority handling: VIP orders before normal", w: "RabbitMQ", c: ORANGE },
            { s: "Feeding the same stream to 5 different teams", w: "Kafka", c: YELLOW },
          ].map((x) => (
            <div key={x.s} className="card flex items-center justify-between p-3">
              <span className="text-ink-secondary">{x.s}</span>
              <span className="chip shrink-0" style={{ color: x.c, borderColor: x.c }}>→ {x.w}</span>
            </div>
          ))}
        </div>
      </CompareSection>
    </ComparePageShell>
  );
}
