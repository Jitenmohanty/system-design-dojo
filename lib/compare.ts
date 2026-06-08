export interface CompareMeta {
  slug: string;
  a: string;
  b: string;
  c?: string;
  emoji: string;
  blurb: string;
  colorA: string;
  colorB: string;
}

export const COMPARISONS: CompareMeta[] = [
  { slug: "sql-vs-nosql", a: "SQL", b: "NoSQL", emoji: "🗄️", blurb: "Strict schemas vs flexible documents.", colorA: "var(--neon-blue)", colorB: "var(--neon-orange)" },
  { slug: "monolith-vs-microservice", a: "Monolith", b: "Microservices", emoji: "🏗️", blurb: "One big app vs many small services.", colorA: "var(--neon-green)", colorB: "var(--neon-purple)" },
  { slug: "rest-vs-graphql-vs-grpc", a: "REST", b: "GraphQL", c: "gRPC", emoji: "🔌", blurb: "Three ways for services to talk.", colorA: "var(--neon-blue)", colorB: "var(--neon-purple)" },
  { slug: "redis-vs-memcached", a: "Redis", b: "Memcached", emoji: "⚡", blurb: "Two in-memory speed demons.", colorA: "var(--neon-red)", colorB: "var(--neon-green)" },
  { slug: "kafka-vs-rabbitmq", a: "Kafka", b: "RabbitMQ", emoji: "📨", blurb: "Log streaming vs smart broker.", colorA: "var(--neon-yellow)", colorB: "var(--neon-orange)" },
];
