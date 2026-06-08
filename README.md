# ⚡ System Design Dojo

> From _"What is a server?"_ to _"Design YouTube"_ — learn system design with live simulations, animated diagrams, memes, and zero boring slides.

An interactive system design course built as a Next.js app. Concepts are organized into a **martial-arts belt progression** (White → Yellow → Green → Black), each one an interactive page with funny-but-accurate analogies, animated architecture diagrams, hands-on simulations, and a quiz. Your progress is tracked locally so you can level up at your own pace.

---

## ✨ Features

- **29 interactive concept pages** across 4 difficulty levels, from networking basics to full system-design case studies (Design YouTube, Twitter, Uber, WhatsApp, and more).
- **Live simulations** — watch traffic flow through a load balancer, kill servers and see requests reroute, flood a rate limiter, drain a message queue, and more.
- **Animated diagrams** — clickable architecture nodes (servers, databases, caches, queues, CDNs, gateways) with flowing request edges.
- **Versus Hub** — head-to-head technology comparisons (SQL vs NoSQL, Kafka vs RabbitMQ, REST vs GraphQL vs gRPC, Redis vs Memcached, Monolith vs Microservices).
- **Playground** — a hub of standalone, hands-on simulations to break things and learn why they broke.
- **Quizzes** — 3–5 question checks at the end of every concept.
- **Progress & belts** — completion tracking, quiz scores, and daily streaks persisted to `localStorage`; earn belts by finishing every concept in a level.
- **Cyberpunk-neon design system** — custom Tailwind theme, animated counters, scroll reveals, and confetti.

---

## 🧱 Tech Stack

| Layer        | Choice                                              |
| ------------ | --------------------------------------------------- |
| Framework    | [Next.js 14](https://nextjs.org) (App Router)       |
| Language     | TypeScript (strict)                                 |
| Styling      | [Tailwind CSS](https://tailwindcss.com)             |
| Animation    | [Framer Motion](https://www.framer.com/motion/)     |
| Charts       | [Recharts](https://recharts.org)                    |
| Icons        | [lucide-react](https://lucide.dev)                  |
| Effects      | [canvas-confetti](https://github.com/catdad/canvas-confetti) |
| Fonts        | Chakra Petch, Space Grotesk, JetBrains Mono (`next/font`) |

---

## 🚀 Getting Started

**Prerequisites:** Node.js 18.17+ (developed on Node 24).

```bash
# install dependencies
npm install

# start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

| Command         | What it does                          |
| --------------- | ------------------------------------- |
| `npm run dev`   | Start the development server          |
| `npm run build` | Build for production                  |
| `npm run start` | Serve the production build            |
| `npm run lint`  | Run ESLint (`next lint`)              |

---

## 📂 Project Structure

```
app/
  layout.tsx              # Root layout: fonts, metadata, AppShell
  page.tsx                # Landing page (hero, belt cards, testimonials)
  loading.tsx             # Route loading UI
  not-found.tsx           # 404 page
  learn/
    page.tsx              # Roadmap / all concepts
    beginner/<slug>/      # White belt concepts
    intermediate/<slug>/  # Yellow belt concepts
    advanced/<slug>/      # Green belt concepts
    expert/<slug>/        # Black belt case studies
  compare/
    page.tsx              # Versus Hub
    <a-vs-b>/page.tsx     # Individual comparison pages
  playground/
    page.tsx              # Simulation hub
    load-balancer/        # Full-screen load balancer sim

components/
  layout/                 # AppShell, Sidebar, TopBar, modals, effects
  ui/                     # ConceptPage, FunnyAnalogy, InteractiveQuiz,
                          # ComparisonBattle, ScrollReveal, AnimatedCounter
  diagrams/               # AnimatedDiagram
  simulations/            # SimulationWrapper, LoadBalancerSim
  compare/                # ComparePageShell

lib/
  concepts.ts             # Concept registry — single source of truth
                          # (drives sidebar, routing, nav, progress, roadmap)
  compare.ts              # Comparison registry
  progress.ts             # localStorage progress store + React hook
  confetti.ts             # Confetti helpers
  utils.ts                # cn(), belt visuals, shared helpers
```

---

## 🗺️ How It Works

- **`lib/concepts.ts` is the single source of truth.** It defines every concept (slug, title, level, topics, estimated minutes, emoji, blurb) and powers the sidebar, routing, next/prev navigation, the roadmap, and progress tracking. Each concept's route folder name must match its slug exactly.
- **Concept pages** wrap their content in `<ConceptPage slug="...">`, which derives the title, belt, duration, and navigation automatically and renders the scroll-progress bar and "Mark Complete" button.
- **Progress** (`lib/progress.ts`) is a tiny `localStorage`-backed pub/sub store exposed via the `useProgress()` hook, so the sidebar and top bar update live as you complete concepts and quizzes.

---

## ➕ Adding a Concept Page

See **[`BUILD_CONVENTIONS.md`](./BUILD_CONVENTIONS.md)** for the full house style. In short:

1. Register the concept in `lib/concepts.ts`.
2. Create `app/learn/<level>/<slug>/page.tsx` with the **exact** slug.
3. Start with `"use client";` and wrap everything in `<ConceptPage slug="<slug>" analogy={<FunnyAnalogy .../>}>`.
4. Structure the body with `<Section>`, wrap blocks in `<ScrollReveal>`, and include at least one interactive/animated element.
5. End with an `<InteractiveQuiz>` of 3–5 questions.
6. Be funny, be accurate, match the cyberpunk-neon tone — and **don't modify shared files.**

---

## 📦 Deployment

This is a standard Next.js app and deploys anywhere Next.js runs. The simplest path is [Vercel](https://vercel.com/new):

```bash
npm run build && npm run start
```

---

_Built in the Dojo · No real servers were harmed._
