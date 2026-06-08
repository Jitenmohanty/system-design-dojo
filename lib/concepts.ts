// ============================================================
// SYSTEM DESIGN DOJO — Concept registry (single source of truth)
// Drives: sidebar, routing, navigation, progress, roadmap, search.
// ============================================================

export type Level = "beginner" | "intermediate" | "advanced" | "expert";

export type Belt = "white" | "yellow" | "green" | "black";

export type Topic =
  | "networking"
  | "databases"
  | "caching"
  | "scaling"
  | "distributed"
  | "architecture"
  | "api"
  | "case-study";

export interface Concept {
  slug: string;
  title: string;
  level: Level;
  topics: Topic[];
  minutes: number;
  emoji: string;
  blurb: string;
}

export interface LevelMeta {
  level: Level;
  belt: Belt;
  name: string;
  beltLabel: string;
  color: string; // css var
  tagline: string;
}

export const LEVELS: Record<Level, LevelMeta> = {
  beginner: {
    level: "beginner",
    belt: "white",
    name: "Beginner",
    beltLabel: "White Belt",
    color: "var(--belt-white)",
    tagline: "The fundamentals. What even is a server?",
  },
  intermediate: {
    level: "intermediate",
    belt: "yellow",
    name: "Intermediate",
    beltLabel: "Yellow Belt",
    color: "var(--belt-yellow)",
    tagline: "Scaling, balancing, queuing. The building blocks.",
  },
  advanced: {
    level: "advanced",
    belt: "green",
    name: "Advanced",
    beltLabel: "Green Belt",
    color: "var(--belt-green)",
    tagline: "Distributed systems and the dark arts.",
  },
  expert: {
    level: "expert",
    belt: "black",
    name: "Expert",
    beltLabel: "Black Belt",
    color: "var(--belt-black)",
    tagline: "Design real systems. Ace the interview.",
  },
};

export const LEVEL_ORDER: Level[] = ["beginner", "intermediate", "advanced", "expert"];

export const TOPIC_LABELS: Record<Topic, string> = {
  networking: "Networking",
  databases: "Databases",
  caching: "Caching",
  scaling: "Scaling",
  distributed: "Distributed",
  architecture: "Architecture",
  api: "API",
  "case-study": "Case Study",
};

export const CONCEPTS: Concept[] = [
  // ---------- BEGINNER · White Belt ----------
  {
    slug: "client-server",
    title: "Client–Server Model",
    level: "beginner",
    topics: ["networking"],
    minutes: 8,
    emoji: "🍽️",
    blurb: "You order, the kitchen cooks. The request/response cycle explained.",
  },
  {
    slug: "dns-how-internet-works",
    title: "DNS & How the Internet Works",
    level: "beginner",
    topics: ["networking"],
    minutes: 10,
    emoji: "📖",
    blurb: "The phone book of the internet — from google.com to an IP address.",
  },
  {
    slug: "apis-rest",
    title: "APIs & REST",
    level: "beginner",
    topics: ["api", "networking"],
    minutes: 9,
    emoji: "🧑‍🍳",
    blurb: "The waiter pattern: GET, POST, PUT, DELETE, and what they really do.",
  },
  {
    slug: "databases-101",
    title: "Databases 101",
    level: "beginner",
    topics: ["databases"],
    minutes: 10,
    emoji: "🗄️",
    blurb: "A giant spreadsheet a million people read at once. CRUD & indexes.",
  },
  {
    slug: "caching-basics",
    title: "Caching Basics",
    level: "beginner",
    topics: ["caching"],
    minutes: 8,
    emoji: "⚡",
    blurb: "Keep the remote on the armrest. Hits, misses, TTL, eviction.",
  },
  {
    slug: "json-data-formats",
    title: "JSON & Data Formats",
    level: "beginner",
    topics: ["api"],
    minutes: 8,
    emoji: "🔤",
    blurb: "The universal translator. JSON vs XML vs YAML vs Protobuf.",
  },

  // ---------- INTERMEDIATE · Yellow Belt ----------
  {
    slug: "load-balancing",
    title: "Load Balancing",
    level: "intermediate",
    topics: ["scaling", "networking"],
    minutes: 18,
    emoji: "⚖️",
    blurb: "FLAGSHIP simulation. 6 algorithms, live traffic, kill a server.",
  },
  {
    slug: "database-scaling",
    title: "Database Scaling",
    level: "intermediate",
    topics: ["databases", "scaling"],
    minutes: 12,
    emoji: "🐎",
    blurb: "Steroids for one horse vs buying more horses. Vertical vs horizontal.",
  },
  {
    slug: "caching-strategies",
    title: "Caching Strategies",
    level: "intermediate",
    topics: ["caching"],
    minutes: 12,
    emoji: "🗂️",
    blurb: "Write-through, write-behind, cache-aside & friends, animated.",
  },
  {
    slug: "message-queues",
    title: "Message Queues",
    level: "intermediate",
    topics: ["architecture", "scaling"],
    minutes: 13,
    emoji: "🎫",
    blurb: "The 'Now Serving #47' system. Producers, consumers, backpressure.",
  },
  {
    slug: "sql-vs-nosql",
    title: "SQL vs NoSQL",
    level: "intermediate",
    topics: ["databases"],
    minutes: 11,
    emoji: "🆚",
    blurb: "Strict schemas vs flexible documents. Pick your fighter.",
  },
  {
    slug: "api-gateway",
    title: "API Gateway",
    level: "intermediate",
    topics: ["api", "architecture"],
    minutes: 10,
    emoji: "🛡️",
    blurb: "The front desk of a massive hotel. Auth, routing, rate limiting.",
  },
  {
    slug: "cdn",
    title: "Content Delivery Networks",
    level: "intermediate",
    topics: ["networking", "caching", "scaling"],
    minutes: 10,
    emoji: "🌍",
    blurb: "Pizza shops everywhere vs one downtown. Edge caching the globe.",
  },
  {
    slug: "rate-limiting",
    title: "Rate Limiting",
    level: "intermediate",
    topics: ["api", "scaling"],
    minutes: 12,
    emoji: "🚦",
    blurb: "The bouncer at the club. Token bucket, leaky bucket & windows.",
  },

  // ---------- ADVANCED · Green Belt ----------
  {
    slug: "microservices",
    title: "Microservices",
    level: "advanced",
    topics: ["architecture", "distributed"],
    minutes: 15,
    emoji: "🧩",
    blurb: "Toolbox over Swiss army knife. Circuit breakers & cascading failure.",
  },
  {
    slug: "database-sharding",
    title: "Database Sharding",
    level: "advanced",
    topics: ["databases", "scaling", "distributed"],
    minutes: 13,
    emoji: "🔪",
    blurb: "Split the phonebook A–M / N–Z. Routing, hot shards, resharding.",
  },
  {
    slug: "consistent-hashing",
    title: "Consistent Hashing",
    level: "advanced",
    topics: ["distributed", "scaling"],
    minutes: 14,
    emoji: "💍",
    blurb: "The hash ring. Add a node, move 12% of keys — not 78%.",
  },
  {
    slug: "cap-theorem",
    title: "CAP Theorem",
    level: "advanced",
    topics: ["distributed", "databases"],
    minutes: 12,
    emoji: "🔺",
    blurb: "Sleep, social life, career — pick two. Partitions force a choice.",
  },
  {
    slug: "event-driven-architecture",
    title: "Event-Driven Architecture",
    level: "advanced",
    topics: ["architecture", "distributed"],
    minutes: 13,
    emoji: "📡",
    blurb: "Subscribe to the newspaper. Pub/Sub, Event Sourcing, CQRS.",
  },
  {
    slug: "distributed-systems",
    title: "Distributed Systems",
    level: "advanced",
    topics: ["distributed"],
    minutes: 14,
    emoji: "💥",
    blurb: "The disaster simulator. Partitions, clock drift, split brain.",
  },
  {
    slug: "replication",
    title: "Replication",
    level: "advanced",
    topics: ["databases", "distributed"],
    minutes: 13,
    emoji: "🖨️",
    blurb: "Photocopy the important docs. Leaders, followers, quorums, lag.",
  },
  {
    slug: "consensus-algorithms",
    title: "Consensus Algorithms",
    level: "advanced",
    topics: ["distributed"],
    minutes: 15,
    emoji: "🗳️",
    blurb: "Raft elects a leader. Paxos votes on everything (nobody knows how).",
  },

  // ---------- EXPERT · Black Belt ----------
  {
    slug: "design-youtube",
    title: "Design YouTube",
    level: "expert",
    topics: ["case-study", "scaling"],
    minutes: 20,
    emoji: "📺",
    blurb: "Upload, transcode, CDN, recommendations, view counter at scale.",
  },
  {
    slug: "design-twitter",
    title: "Design Twitter",
    level: "expert",
    topics: ["case-study", "scaling"],
    minutes: 20,
    emoji: "🐦",
    blurb: "Fan-out on write vs read. The celebrity problem, solved hybrid.",
  },
  {
    slug: "design-whatsapp",
    title: "Design WhatsApp",
    level: "expert",
    topics: ["case-study", "distributed"],
    minutes: 20,
    emoji: "💬",
    blurb: "WebSockets, ticks, store-and-forward, group fan-out, E2E keys.",
  },
  {
    slug: "design-uber",
    title: "Design Uber",
    level: "expert",
    topics: ["case-study", "distributed"],
    minutes: 20,
    emoji: "🚗",
    blurb: "Geospatial indexing with QuadTrees, matching, surge pricing.",
  },
  {
    slug: "design-url-shortener",
    title: "Design a URL Shortener",
    level: "expert",
    topics: ["case-study", "databases"],
    minutes: 15,
    emoji: "🔗",
    blurb: "Hash, collide, store, redirect. The classic warm-up question.",
  },
  {
    slug: "design-notification-system",
    title: "Design a Notification System",
    level: "expert",
    topics: ["case-study", "architecture"],
    minutes: 16,
    emoji: "🔔",
    blurb: "Push/SMS/email, priority queues, dedup, templates, rate limits.",
  },
  {
    slug: "design-rate-limiter",
    title: "Design a Distributed Rate Limiter",
    level: "expert",
    topics: ["case-study", "distributed"],
    minutes: 16,
    emoji: "🧮",
    blurb: "Shared state, race conditions, Redis atomics across nodes.",
  },
];

// ----------------- Derived helpers -----------------

export function conceptHref(c: Concept): string {
  return `/learn/${c.level}/${c.slug}`;
}

export function conceptsByLevel(level: Level): Concept[] {
  return CONCEPTS.filter((c) => c.level === level);
}

export function getConcept(slug: string): Concept | undefined {
  return CONCEPTS.find((c) => c.slug === slug);
}

/** Ordered flat list across all levels — used for next/prev navigation. */
export const ORDERED_CONCEPTS: Concept[] = LEVEL_ORDER.flatMap((lvl) =>
  conceptsByLevel(lvl)
);

export function getNeighbors(slug: string): {
  prev?: Concept;
  next?: Concept;
} {
  const idx = ORDERED_CONCEPTS.findIndex((c) => c.slug === slug);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? ORDERED_CONCEPTS[idx - 1] : undefined,
    next: idx < ORDERED_CONCEPTS.length - 1 ? ORDERED_CONCEPTS[idx + 1] : undefined,
  };
}

export const TOTAL_CONCEPTS = CONCEPTS.length;
