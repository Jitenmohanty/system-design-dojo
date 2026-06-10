# Blog editorial plan

The blog's job is **not** to repeat the lessons. The interactive `/learn` pages already
teach the fundamentals better than prose can. The blog exists to do the two things those
pages *can't*:

1. **Pull SEO / discovery traffic** — long-form, prose-heavy articles that rank on search.
2. **Tell stories the interactive format can't** — outages, trade-offs, opinions, "how X scaled".

**Golden rule:** before writing a post, ask *"is this already a lesson?"* If yes, link to the
lesson instead of competing with it. Every post should link out to ≥1 lesson.

## Cadence over volume

A trickle of good posts that keeps going beats a one-time dump. Target ~1–2 posts/month.
Quality and accuracy first — especially numbers and company claims, which must be verified
before publishing.

## Categories

| Tag | Category | What it is |
|-----|----------|------------|
| `war-story` | Failure post-mortems | A thing broke; here's the mechanism and the fix. Narrative. |
| `case-study` | "How X scaled" | How a real system handles its hardest constraint. Needs verified facts. |
| `opinion` | Trade-off essays | Opinionated, "stop doing X / prefer Y". |
| `interview` | Interview guides | The angle candidates actually get tested on. |

## How to add a post

Drop an `.mdx` file in `content/blog/`. Copy the frontmatter from any existing post.
Use a language on fenced code (```` ```go ````) for syntax highlighting, and embed
`<AnimatedDiagram .../>` / `<Callout>` for visuals. It auto-appears on `/blog`.

## Roadmap

### Published (11)
- ✅ **The Thundering Herd** — cache stampede deep-dive · `caching` · → Caching Basics/Strategies
- ✅ **Read Replicas Lie** — replication-lag field guide · `databases` · → Replication / DB Scaling
- ✅ **Idempotency: the word that saves your payments** — `reliability` · → APIs / Message Queues
- ✅ **Stop reaching for microservices** — `opinion` · → Microservices
- ✅ **The 5 follow-ups every system design interview asks** — `interview` · → many lessons
- ✅ **The dual-write problem** — DB/cache drift · `war-story` · → Caching Strategies / Replication
- ✅ **Backpressure: when consumers can't keep up** · `war-story` · → Message Queues / Rate Limiting
- ✅ **How URL shorteners survive 100k redirects/sec** · `case-study` · → Design a URL Shortener
- ✅ **The 429 nobody plans for** — retry storms · `war-story` · → Rate Limiting / Thundering Herd
- ✅ **Hot partitions: when one shard does all the work** · `war-story` · → Sharding / Consistent Hashing
- ✅ **Exactly-once is a lie** · `opinion` · → Message Queues / Event-Driven / Idempotency

### Queued (next writing session)
- ⬜ **The CAP theorem in production: what AP and CP actually feel like** · `opinion` · → CAP Theorem
- ⬜ **Designing a news feed: fan-out-on-write vs fan-out-on-read** · `case-study` · → Design Twitter
- ⬜ **Connection pools: the resource you forget until it runs out** · `war-story` · → Database Scaling
- ⬜ **Heartbeats, timeouts, and how distributed systems detect death** · `war-story` · → Consensus / Distributed Systems
- ⬜ **Why your p99 latency is the only number that matters** · `opinion` · → Load Balancing
- ⬜ **Bloom filters: saying "definitely not here" for almost free** · `case-study` · → Caching Strategies

> Cross-linking note: the published war-stories now form a web (idempotency ↔ exactly-once ↔ dual-write; thundering-herd ↔ 429 ↔ hot-partitions). Keep linking new posts into this web — it boosts both SEO and time-on-site.
