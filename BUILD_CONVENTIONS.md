# System Design Dojo — Page Build Conventions (for contributors/agents)

You are adding **concept pages** to an existing Next.js 14 (App Router) + TypeScript + Tailwind app.
The design system, layout shell, progress system, and all reusable components ALREADY EXIST.
**Do not modify shared files.** Only create the `page.tsx` files you are assigned.

## Before you write: read these for the house style
- `app/learn/beginner/client-server/page.tsx` — canonical interactive concept page
- `app/learn/beginner/caching-basics/page.tsx` — split race + button-grid demo patterns
- `app/learn/intermediate/load-balancing/page.tsx` — uses AnimatedDiagram + ComparisonBattle
- `components/ui/ConceptPage.tsx`, `components/ui/FunnyAnalogy.tsx`,
  `components/ui/InteractiveQuiz.tsx`, `components/ui/ComparisonBattle.tsx`,
  `components/diagrams/AnimatedDiagram.tsx`, `components/simulations/SimulationWrapper.tsx`,
  `components/ui/ScrollReveal.tsx`, `lib/concepts.ts`, `lib/utils.ts`

## Every page MUST
1. Start with `"use client";`
2. Default-export a React component.
3. Wrap everything in `<ConceptPage slug="<EXACT-SLUG>" analogy={<FunnyAnalogy.../>}> ... </ConceptPage>`.
   The slug MUST exactly match the registry in `lib/concepts.ts` (the route folder name).
4. Use `<Section kicker="..." title="...">` (imported from ConceptPage) to structure the body.
5. Wrap major sections in `<ScrollReveal>`.
6. Include at least one **interactive or animated** element (build inline with framer-motion / useState,
   or reuse AnimatedDiagram / SimulationWrapper / ComparisonBattle).
7. End with an `<InteractiveQuiz slug="<SLUG>" questions={[...]} />` of 3–5 questions.
8. Be funny but accurate. Match the cyberpunk-neon tone.

## Imports (exact paths)
```ts
import { ConceptPage, Section } from "@/components/ui/ConceptPage";
import { FunnyAnalogy } from "@/components/ui/FunnyAnalogy";
import { InteractiveQuiz } from "@/components/ui/InteractiveQuiz";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ComparisonBattle } from "@/components/ui/ComparisonBattle";
import { AnimatedDiagram } from "@/components/diagrams/AnimatedDiagram";
import { SimulationWrapper } from "@/components/simulations/SimulationWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
// lucide-react icons as needed
```

## Component APIs

### ConceptPage / Section
`<ConceptPage slug analogy?>{children}</ConceptPage>` — derives title/belt/minutes/topics from the registry,
renders header, scroll progress bar, Mark Complete, and next/prev nav automatically. Do NOT add your own title/h1.
`<Section kicker?="EYEBROW" title="Heading">{children}</Section>`

### FunnyAnalogy
`<FunnyAnalogy emoji="🍽️" color="var(--neon-yellow)" alternates={[{emoji, text}]}>main analogy JSX</FunnyAnalogy>`

### InteractiveQuiz
`questions: { question: string; options: string[]; correct: number; explain: string }[]`

### ComparisonBattle
```
left/right: { name; emoji?; color; bestFor }
features: { label; a: string|number; b: string|number; winner?: "a"|"b"|"tie"; max?: number; unit?: string }[]
// if max is set and a/b are numbers, they render as animated progress bars.
```

### AnimatedDiagram
```
nodes: { id; type: "server"|"database"|"cache"|"loadbalancer"|"client"|"queue"|"cdn"|"gateway";
         label; position:{x,y}/*percent 0..100*/; status?:"active"|"busy"|"down"|"idle"; info? }[]
edges: { from; to; animated?; color?; label?; dashed? }[]
height?: number (default 380)
```
Nodes are clickable (tooltip from `info`), hovering highlights connected edges, `animated` edges flow.

### SimulationWrapper (controlled by parent state)
```
<SimulationWrapper
  title playing onPlayPause onReset speed onSpeed
  metrics={[{label, value, color?}]} events={[{id, time, text, color?}]}
  controls={<left panel JSX>} canvasHeight={420}>
  {canvas children}
</SimulationWrapper>
```
Parent owns playing/speed/metrics/events. SPEEDS available: [0.25,0.5,1,2,4].

## CSS utility classes available (globals.css)
`card`, `card-hover`, `chip`, `btn-neon`, `btn-ghost`, `neon-text`, `neon-border`, `glass`, `mono`, `field`,
`animate-float`, `animate-pulse-glow`, `animate-title-glow`.
Tailwind colors: `text-neon-blue|green|red|yellow|purple|orange`, `bg-bg-primary|secondary|tertiary|elevated`,
`text-ink-primary|secondary|muted`. CSS vars: `var(--neon-blue)` etc., `var(--border-subtle)`, `var(--border-neon)`.
Fonts: `font-display`, `font-body`, `font-mono` (or `mono` class).

## Gotchas (IMPORTANT — avoid build breaks)
- TypeScript strict. No unused imports/vars (they warn; keep clean anyway).
- Recharts v3: a `Tooltip` `formatter` must be typed `(v: any) => ...` (NOT `(v: number)`), or it fails the type check.
- Recharts `ResponsiveContainer` needs a parent with an explicit height (wrap in a div with `style={{height: N}}`).
- Escape apostrophes in JSX text as `&apos;` and quotes as `&ldquo;`/`&rdquo;` (react/no-unescaped-entities warns).
- Keep each interactive widget self-contained inside the page file (local components are fine).
- requestAnimationFrame loops: clean up in useEffect return.
- Do not use `Date.now()`-driven randomness that breaks SSR hydration mismatches in initial render;
  initialize random/time-based state inside effects or event handlers, not during render.
