# Design system — a reusable instruction set

> This document is a working specification, not a mood board. It is written
> for future builders (human or AI) who will be asked to ship another
> product, prototype, or demo "in the same house style." Follow it as a
> contract. Every value here was earned through iteration; changing one
> tends to unravel the others.
>
> **Goal.** When someone says "make it feel like that other thing you built,"
> the builder reading this file should be able to reach the same level of
> finish on the first pass — no back-and-forth on palette, no twenty rounds
> on typography, no last-minute motion fixes. The prototype this system was
> extracted from went from empty directory to "CEO-ready demo" in a week,
> and the reason was that the visual contract never wavered.
>
> Apply this system regardless of domain — B2B dashboards, consumer flows,
> documentation sites, internal tools, landing pages. It is use-case
> agnostic.

---

## 0. Operating principles

Read these before anything else. Every concrete rule below flows from them.

1. **Restraint is the signature.** The default answer to "should we add a
   gradient / emoji / icon / accent here?" is *no*. One accent colour, one
   display typeface, one motion curve, one visible hairline. Surface is
   calm; content does the work.
2. **Editorial confidence, not app busyness.** Aim for the feel of a
   respected trade publication or a well-designed hardware product manual,
   not a SaaS dashboard. Wide margins, generous line-height, tabular
   numerals, deliberate silence between elements.
3. **Executive voice.** The reader is a senior operator who has seen every
   tool. They do not want to be impressed; they want to be respected.
   Never cute, never cheerleading, never apologetic. *Curate, arrange,
   secure, hold* — not *book, click, buy, grab*.
4. **Dark-first, not dark-skinned.** Build the dark theme first with warm
   near-blacks (hue ~260, low chroma) and a single warm champagne accent
   (hue ~85). Light is a parallel palette, not an inverted one.
5. **OKLCH for every colour.** Never write RGB or HSL. OKLCH keeps lightness
   perceptually uniform across hues, so accents at 80% L read with the same
   weight as surfaces at 18% L. This is the single technical decision that
   makes the whole system feel coherent.
6. **Show your work, quietly.** When the system is doing something, show
   it through a thin status chip, a breathing dot, a hairline. Never a
   spinner, never "Loading…", never a progress bar unless you genuinely
   know the percent.
7. **Progressive disclosure, not information firehose.** First render is a
   single prompt or a single card. Detail appears only when the user asks
   for it, via "+ more detail", a tab, a chip, an expander.
8. **Symmetry reads as serious. Asymmetry reads as toy.** Grids align.
   Columns match. When something must be off-grid, it is a deliberate
   editorial choice — never accidental.
9. **No AI-slop tells.** The moment the product shows any of the items in
   §17 (sparkle icons, purple→blue gradients, emoji garnishes, exclamation
   marks, generic "AI" copy), credibility collapses. Guard that list.
10. **Ship only what works end-to-end.** A half-wired feature with a
    polished card is worse than one less feature. Cut scope before
    lowering the finish bar.

---

## 1. The 30-second test

Before declaring any screen done, it must pass this:

- [ ] A stranger looking at a still screenshot for three seconds would
      describe it as *"a well-made product"* and not *"an AI-generated UI."*
- [ ] No emoji, no sparkle icons, no purple gradients, no neon.
- [ ] Exactly one chromatic accent in view. Everything else is neutral.
- [ ] Typography is not Inter-default. Numerals are tabular.
- [ ] Motion on any state change is under 300ms and uses a spring, not a
      linear ease.
- [ ] The empty / initial state is a single centred line, not a dashboard
      of zeros.
- [ ] Every piece of copy could appear in a trade publication without
      editing. No exclamation marks. No "Let's get started!"

If any checkbox fails, return to the relevant section below.

---

## 2. Colour system (OKLCH, dark-first)

All colour tokens live in a single CSS file (example: `src/styles/tokens.css`),
declared under `:root[data-theme="dark"]` and `:root[data-theme="light"]`. Never
hard-code colour in a component; always reference a token.

### 2.1 Dark palette (default)

| Token              | Value                               | Purpose                                  |
| ------------------ | ----------------------------------- | ---------------------------------------- |
| `--surface`        | `oklch(14% 0.010 260)`              | Page background — warm near-black        |
| `--surface-raised` | `oklch(17% 0.012 260)`              | Input fields, subtle lifts               |
| `--elev-1`         | `oklch(19% 0.012 260)`              | Panels, chat pane, cards                 |
| `--elev-2`         | `oklch(23% 0.014 260)`              | Nested surfaces, hover states            |
| `--border`         | `oklch(28% 0.012 260)`              | Hairline borders — *always 1px*          |
| `--border-strong`  | `oklch(36% 0.014 260)`              | Focus-within, hover                      |
| `--text`           | `oklch(96% 0 0)`                    | Primary text                             |
| `--text-muted`     | `oklch(68% 0.010 260)`              | Secondary text                           |
| `--text-subtle`    | `oklch(52% 0.010 260)`              | Metadata, timestamps, kickers            |
| `--accent`         | `oklch(80% 0.130 85)`               | The single warm champagne accent         |
| `--accent-soft`    | `oklch(80% 0.130 85 / 0.14)`        | Accent chip backgrounds                  |
| `--accent-hairline`| `oklch(80% 0.130 85 / 0.55)`        | The signature 1px champagne hairline     |
| `--trace`          | `oklch(72% 0.075 200)`              | Muted teal — secondary/info only         |
| `--trace-soft`     | `oklch(72% 0.075 200 / 0.14)`       | Trace chip backgrounds                   |
| `--danger`         | `oklch(68% 0.150 25)`               | Error, irreversible                      |
| `--success`        | `oklch(72% 0.110 160)`              | Completion, active/online state          |

### 2.2 Light palette (sibling, not inverse)

Light uses warm off-whites (hue ~80, very low chroma) and a slightly
darker, more saturated accent so it survives on a bright surface.

| Token              | Value                               |
| ------------------ | ----------------------------------- |
| `--surface`        | `oklch(98% 0.004 80)`               |
| `--surface-raised` | `oklch(99% 0.003 80)`               |
| `--elev-1`         | `oklch(96% 0.004 80)`               |
| `--elev-2`         | `oklch(93% 0.005 80)`               |
| `--border`         | `oklch(90% 0.006 80)`               |
| `--text`           | `oklch(18% 0.005 260)`              |
| `--text-muted`     | `oklch(42% 0.010 260)`              |
| `--accent`         | `oklch(58% 0.130 65)`               |
| `--trace`          | `oklch(48% 0.090 200)`              |

### 2.3 Rules

- **Exactly one accent hue in view.** The champagne (`oklch(80% 0.13 85)`)
  is load-bearing. The teal `--trace` is structurally secondary and used
  only for *informational* chrome (activity, system status). Never use
  both at equal weight.
- **Selection uses `--accent-soft`.** Not the browser default blue.
- **Focus rings use `--accent` at 2px with 2px offset.** No glow, no outline
  colour changes on hover.
- **Shadows are *inset highlights* + *deep diffuse drops*.** Never a hard
  drop shadow. Recipe:
  ```
  --shadow-1: 0 1px 0 oklch(100% 0 0 / 0.04) inset, 0 1px 2px oklch(0 0 0 / 0.4);
  --shadow-2: 0 1px 0 oklch(100% 0 0 / 0.06) inset, 0 6px 24px -8px oklch(0 0 0 / 0.6);
  --shadow-lift:0 1px 0 oklch(100% 0 0 / 0.08) inset, 0 18px 48px -16px oklch(0 0 0 / 0.7);
  ```
- **Gradients are near-invisible directional tints**, used at most twice in
  a product: the 1px champagne hairline, and a soft radial vignette on
  full-screen overtures. If a gradient is visible as a shape, delete it.

### 2.4 Forbidden colours

- Any purple (hue 270–310) at above 0.03 chroma.
- Any saturated blue (hue 220–260) as a *primary* accent. (Teal as
  secondary trace is fine.)
- Neon green (hue ~140, chroma >0.15). Use the desaturated success token.
- Any rainbow / multi-hue gradient. One hue per gradient, always.

---

## 3. Typography

Three typefaces. Each has exactly one job.

| Use                        | Typeface           | Where                                                 |
| -------------------------- | ------------------ | ----------------------------------------------------- |
| UI / body / controls       | **Geist**          | Everything by default                                 |
| Editorial display          | **Fraunces** (variable, opsz axis) | Empty-state prompt, hero wordmark, occasional section titles, italic taglines |
| Numerals / code / technical readouts | **Geist Mono** | Prices, token counts, timestamps, code blocks, telemetry labels |

### 3.1 Scale

Use these sizes and weights only. Do not introduce new ones.

| Name          | Size  | Weight | Use                                           |
| ------------- | ----- | ------ | --------------------------------------------- |
| `display-xl`  | 88px  | 500    | Hero wordmarks (editorial only)               |
| `display-lg`  | 58px  | 500    | Mobile hero                                   |
| `display-md`  | 32px  | 500    | Editorial section headers                     |
| `title`       | 20px  | 600    | Card titles                                   |
| `body-lg`     | 16px  | 400    | Long-form body                                |
| `body`        | 14px  | 400    | Default UI                                    |
| `label`       | 13px  | 500    | Buttons, meta labels                          |
| `micro`       | 11px  | 500    | Chips, activity ribbon, uppercase kickers     |
| `kicker`      | 10.5px| 500    | Tracked-out all-caps (`letter-spacing: 0.28em`) |

Line-height: body `1.55–1.6`, display `1.0–1.05`, micro `1.3`.

### 3.2 Font loading (non-negotiable)

Font loading jitter is the #1 destroyer of perceived polish. Follow this
exactly:

1. **Preload + `display=block`**, not `swap`. The `block` period is ~3s —
   plenty for a fast connection, and it avoids the mid-stream FOUT that
   jumps streaming text around. Example in `index.html`:
   ```html
   <link rel="preload" as="style" href="…display=block" />
   <link rel="stylesheet" href="…display=block" />
   ```
2. **Define a tuned fallback `@font-face`** so the system font used before
   Geist arrives has matching metrics. Prevents layout shift even when the
   block period ends:
   ```css
   @font-face {
     font-family: "GeistFallback";
     src: local("Inter"), local("Helvetica Neue"), local("Arial");
     size-adjust: 104%;
     ascent-override: 92%;
     descent-override: 22%;
     line-gap-override: 0%;
   }
   ```
3. **Apply on `html, body, #root`**, with the fallback after the primary:
   ```css
   font-family: var(--font-sans), "GeistFallback", system-ui, sans-serif;
   ```
4. **Never animate font-size or font-weight.** Streaming text must not jump.

### 3.3 Numerals

- Any UI showing prices, token counts, timestamps, durations, file sizes,
  percentages, or dashboard metrics **must** use tabular-nums. Add a
  `.numeric` utility:
  ```css
  .numeric, [data-numeric] {
    font-feature-settings: "tnum", "cv11";
    font-variant-numeric: tabular-nums;
  }
  ```
- For *command-centre* / telemetry contexts (dashboards, admin tools,
  status panels), prefer Geist **Mono** for the numeric itself and Geist
  Sans for the label beside it. This visual rhythm is what separates a
  serious system panel from a generic dashboard.

### 3.4 Display typeface — use sparingly

Fraunces earns its place only in three spots:

1. **Hero wordmark / product name** at display sizes.
2. **Empty-state prompt** — one single italicised line, centred:
   *"What shall we arrange?"*, *"What would you like to explore?"*, etc.
3. **Editorial long-form surfaces** — a printed-style dossier, a
   letter-formatted confirmation, a summary report cover.

In dashboards, forms, side panels, chat transcripts, tables, activity
feeds — **do not use Fraunces**. Use Geist. The user called this out
explicitly: editorial type in command-centre contexts reads as "artsy,"
not serious.

---

## 4. Motion

Motion is a language. Learn its three rules first.

### 4.1 The three rules

1. **Every state transition is a spring.** Curves are for easing *within*
   a spring, not for full transitions. Default spring:
   ```ts
   const spring = { type: 'spring', stiffness: 260, damping: 28, mass: 0.6 }
   ```
2. **Durations 150–280ms.** Never exceed 320ms except on one-shot theatrical
   moments (overture fade, dossier print preview fade). If something feels
   slow, the fix is almost never a shorter duration — it is removing
   stagger or reducing displacement distance (`y: 6` not `y: 24`).
3. **No stagger on initial page mount.** Page loads arrive as a single
   crossfade. Staggered entrance animations on first load read as
   performative. Stagger is for *in-context* reveals (opening an expander,
   a list populating after an action).

### 4.2 Named presets (copy verbatim)

```ts
import type { Transition, Variants } from 'motion/react'

export const spring: Transition = {
  type: 'spring', stiffness: 260, damping: 28, mass: 0.6,
}

export const quickOut: Transition = { duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }

export const fadeRise: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: spring },
  exit: { opacity: 0, y: -4, transition: quickOut },
}

export const fadeScale: Variants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: spring },
  exit: { opacity: 0, scale: 0.98, transition: quickOut },
}

export const chipEnter: Variants = {
  initial: { opacity: 0, y: 4, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { ...spring, stiffness: 320 } },
  exit: { opacity: 0, scale: 0.96, transition: quickOut },
}
```

### 4.3 The slow-beat cinematic

When staging a "tour", "under the hood", or demo walkthrough, deliberately
*slow* the rhythm to roughly 2–3× what feels snappy in production. Users
watching the demo must be able to follow each beat. A good rule:

- Arrival of a new card: 600–900ms.
- A data line drawing between two nodes: 900–1200ms.
- Dwell on a revealed state: 1500–2500ms before the next beat.

But these are *only* in theatrical contexts. Never in day-to-day UI.

### 4.4 Forbidden motion

- **Bounce overshoot beyond ~3%** on any scale. (`scale: 1.15 → 1` reads
  as a toy; `0.97 → 1` reads as precise.)
- **Stagger on page mount.** Silently offends.
- **Entrance translations greater than 8px.** Items should appear near
  where they'll rest.
- **Linear easing on human-scale transitions.** Linear is for spinners,
  which we do not ship.
- **Rotation animations for loading.** No pinwheels, no rotating icons.
- **Animating layout on streaming text.** Never put `layout` on an
  `AnimatePresence` child that contains live-streaming tokens — the
  measured height changes per token and the bubble jitters.

### 4.5 Reduced motion

Always respect it. A single global rule in the token file handles it:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. Spacing & grid

Strict 8pt scale. Allowed values only:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96`

| Context                        | Value |
| ------------------------------ | ----- |
| Card / panel inner padding     | 20px  |
| Gap between cards in a grid    | 12px  |
| Gap between chips              | 6–8px |
| Section vertical rhythm        | 40 or 48px |
| Page gutter on full overtures  | 24px minimum, 64px on large screens |
| Input field vertical padding   | 10–12px |
| Button height (sm / md)        | 32 / 40px |
| Chip height                    | 24px  |

**Card radii escalate by elevation:** `xs 6 · sm 8 · md 12 · lg 16 · xl 20 · 2xl 28`.
Chips and rounded-pills use `rounded-full`. Most panels are `rounded-[var(--radius-lg)]`
(16px). Dialog containers are 20–24px.

**Hairlines are always exactly 1px.** Never 2. `border: 1px solid var(--border)`.

---

## 6. Iconography

- **Library:** Lucide only. Do not mix icon sets.
- **Size:** 16px default. 12–14px in chips. Never larger than 20px except
  on hero marks.
- **Stroke:** `strokeWidth={1.5}`. Never filled.
- **Colour:** currentColor, inheriting from surrounding text. No coloured
  icons except inside an accent-tinted chip where the whole chip is one
  colour.
- **Decorative icon density:** zero. Icons accompany affordances
  (Send, Attach, Settings, Dismiss). They do not garnish headings.
- **Forbidden:** sparkles, stars, rockets, lightning bolts used as
  "AI" signifiers. If you need to signify intelligence, use the product's
  restraint to do it.

---

## 7. Voice & copywriting

The single highest-leverage quality signal. A perfect UI is destroyed by
cheerleader copy.

### 7.1 Tone

- **Observational, not instructional.** *"Three options — each with the
  same core access, but different hospitality."* Not: *"Here are 3
  amazing options we picked just for you!"*
- **Specific, not superlative.** *"Two hours of paddock access, Saturday
  afternoon."* Not: *"Incredible exclusive VIP experience!"*
- **Anticipatory, not transactional.** *"We'll hold the option for 48
  hours while you consider."* Not: *"Book now!"*

### 7.2 Preferred vocabulary

> arrange, curate, secure, hold, consider, prepare, assemble, source,
> surface, confirm, proceed, journey, dossier, bespoke

### 7.3 Forbidden vocabulary

> click, buy, book now, purchase, grab, unlock, AI-powered, smart,
> revolutionary, game-changer, seamless, effortless, delightful, awesome,
> amazing, VIP (as an adjective), let's, get started, you got this,
> we're on it

### 7.4 Punctuation

- **No exclamation marks.** Zero. Ever. In any copy. In any state.
- **Em dashes and mid-sentence pauses encouraged** — they give prose
  rhythm.
- **Sentence case**, not Title Case, on buttons and headings — except
  wordmarks and proper nouns.
- **Ellipses** appear only in ambient "thinking" states and are followed
  by nothing; never `"Loading..."`.

### 7.5 System messages

- **Errors:** plain statement of what broke and what to do.
  *"Couldn't reach the pricing service — we'll retry in a moment."*
  Never: *"Oops! Something went wrong 😕"*.
- **Empty states:** one line, centred, often in Fraunces italic.
  *"What shall we arrange?"*, *"Nothing to show yet — start a thread."*
- **Completion:** understated confirmation, not confetti.
  *"Held. You have 48 hours."*

---

## 8. Layout patterns

A small set of proven shells. Pick the one closest to the brief; don't
invent.

### 8.1 Dual-pane workspace (chat / canvas)

Best for agentic tools, deep-research UIs, copilots.

```
┌──────────────────────────────────────────────────────┐
│  Topbar · logo + status + ⌘K + settings              │
├──────────────┬───────────────────────────────────────┤
│              │   Activity ribbon (32px tall)         │
│   Chat       ├───────────────────────────────────────┤
│   (380px)    │                                       │
│              │   Living workspace (flex-1)           │
│              │                                       │
│              │                                       │
└──────────────┴───────────────────────────────────────┘
```

- Left pane fixed width `380px`, min `340px`.
- Right pane `flex-1`, contains the activity ribbon as its top strip and
  the artifact canvas below.
- Divider: `border-right: 1px solid var(--border)`. Never thicker.
- Each pane is independently scrollable; the shell never scrolls.

### 8.2 Overture / first-session curtain

Full-viewport centred composition, shown once per session (sessionStorage,
not localStorage — every demo starts fresh).

Structure, top to bottom, each separated by `space-y-10`:

1. **Ambient mark** — a 64–80px circular mark with 2–3 slow breathing rings.
2. **Kicker** — 10.5px uppercase, `letter-spacing: 0.36em`, muted, mono.
3. **Wordmark** — Fraunces, 88px on desktop, weight 500.
4. **Italic tagline** — Fraunces italic, 16–17px, muted.
5. **Champagne hairline** — 1px tall, 240px wide, drawn in 1.4s with scaleX.
6. **Capability words** — 4 uppercase all-caps, 11.5px, tracked 0.28em,
   separated by middots.
7. **CTA** — rounded-full pill, accent border, accent text, hover-bloom
   radial gradient appearing on hover only.
8. **Footer kicker** — 10.5px uppercase tracked, e.g. "press enter to begin"
   and, separately, "powered by …" at the viewport bottom.

Background: `radial-gradient` near-black with a faint warm bias in the
centre. Overlay a 0.04-opacity SVG noise texture and a bottom-edge vignette.

### 8.3 Editorial dossier / print-ready surface

For summaries, reports, contracts, "save as PDF" views. Uses a warm cream
paper tone, Fraunces for display, generous margins, and a print-safe
isolation rule.

- **Background:** `oklch(98% 0.006 82)` (cream).
- **Padding:** 48px minimum (`p-12`).
- **Hairlines between sections:** 1px `oklch(20% 0 0 / 0.15)`.
- **Print rule** in the global stylesheet:
  ```css
  @media print {
    body * { visibility: hidden; }
    #dossier-paper, #dossier-paper * { visibility: visible; }
    #dossier-paper {
      position: absolute !important;
      left: 0 !important; top: 0 !important;
      width: 100% !important; max-width: none !important;
      box-shadow: none !important;
      background: oklch(98% 0.004 82) !important;
    }
  }
  ```

### 8.4 Command-centre dashboard (Bloomberg-terminal density)

For telemetry, admin panels, observability tools.

- Use **Geist Mono for every numeric cell**.
- Row height 24–28px. Tabular-nums everywhere. No cell borders — use
  alternating row backgrounds at 0.02 opacity, or none at all.
- Heat cells use accent at variable alpha (`0.08 → 0.24`) — never a
  red-green ramp.
- Sparklines at 1px stroke, monochrome, trace or accent colour only.
- Column labels: 10.5px uppercase, tracked 0.18em, muted.

---

## 9. Component patterns

These are the atomic parts. Build them once, reuse relentlessly.

### 9.1 Button

Four variants: `primary`, `soft`, `ghost`, `outline`. Two sizes: `sm` (32px), `md` (40px).

- **primary:** `bg-[var(--accent)] text-[oklch(16%_0_0)]`, hover
  `brightness-[1.04]`, active `brightness-[0.98]`. Never shadowed aggressively —
  `--shadow-1` only.
- **soft:** `bg-elev-1 text-text`, hover `bg-elev-2`. The default workhorse.
- **ghost:** transparent, hover `bg-elev-1`. For toolbar buttons.
- **outline:** transparent with 1px border, hover strengthens border.

Transition: `transition-[background-color,color,box-shadow,filter] duration-150 ease-out`.

### 9.2 Chip

Rounded-full, 24px tall, 11px text, 2.5 horizontal padding. Tones: `neutral`,
`accent`, `trace`, `success`, `danger`. Accent chip background is
`--accent-soft`, border matching. Trace chip is the same recipe on
`--trace-soft`.

Interactive chips add `cursor-pointer hover:brightness-[1.1]`. Never change
colour or border on hover — only brightness.

### 9.3 Panel

Wrapped rounded-lg (16px) container with a 1px border, `--shadow-1`, and
`bg-elev-1` by default. Pad 20px. No nested panels — if you need inner
structure, use hairlines, not cards-in-cards.

### 9.4 Input / textarea

- Resting: `bg-surface-raised`, 1px border `--border`.
- Focus-within: border becomes `--border-strong`. Do **not** add a coloured
  focus ring on the input itself — the outer focus-visible ring is
  sufficient.
- Placeholder colour: `--text-subtle`. Never italic.

### 9.5 Dialog / sheet / popover

Use Radix primitives. Overlay is a 0.6 opacity near-black, *not* blurred by
default (blur is expensive and reads as generic). Dialog body is a
`rounded-2xl` panel on `--elev-1`, 24px padding, 1px border, `--shadow-lift`.

Close affordance: a 32px ghost button in the corner with an `X` icon. Never
a filled red button.

### 9.6 Activity ribbon / trace chips

A horizontal strip below the topbar or above the canvas. Height ~32px.
Left-anchored status pulse (see §10.2), remaining space scrolls right
with entering-and-exiting chips via `AnimatePresence + chipEnter`.

Each chip is 24px tall, 11px text, 12px icon, 2.5 horizontal padding. Use
`trace` tone for system events (loads, searches), `accent` tone for
*active* events (dispatches, writes), `neutral` for completions.

---

## 10. Interaction patterns

### 10.1 Command palette (`⌘K`)

Essential for any tool used by professionals. Raycast / Linear style:
centred modal, 640px wide max, `rounded-2xl`, single search input on top
with 44px height, then a list of actions grouped by heading. Keyboard
navigation is required: `↑↓` to move, `↵` to run, `esc` to close.

### 10.2 Live status indicator

A single 8px dot in the topbar. Three states:
- **Offline/idle:** `--border-strong`.
- **Online, resting:** `--success`.
- **Active / responding:** `--accent`, with a `ping` animation at 1.8s
  duration (not the default 1s — too busy).

Pair with a short label in uppercase kicker type: `standby`, `online`,
the active agent/subsystem name.

### 10.3 Refinement chips

Below any agent artifact, surface 3–5 one-tap refinement chips (*cheaper*,
*closer seats*, *earlier date*, *alternative destination*, *proceed*).
Each chip re-runs the relevant operation without the user having to
rewrite the prompt. This is what makes the product *feel* alive.

### 10.4 Progressive disclosure expanders

"+ more detail" lives at the bottom of a card. Opens an inline drawer
with a fadeScale transition. Never use accordion rows that all look the
same — one expander per context, appearing only when there is meaningful
extra detail.

### 10.5 Human-in-the-loop approvals

Model irreversible / high-stakes actions as an **approval card** in the
canvas rather than a modal. Two buttons: `Approve and proceed` (primary),
`Send back with notes` (soft). Never `Confirm` / `Cancel` — those are
transactional; these are *considered*.

---

## 11. Generative / dynamic UI (when applicable)

If the product has an LLM-driven or data-driven surface that emits visual
content (cards, comparisons, tables), use a typed protocol:

- Define a small catalogue of component types (e.g. `option_card_grid`,
  `itinerary`, `comparison_table`, `pricing_breakdown`, `refinement_chips`).
- Each type has a typed schema; the renderer is a single dispatcher that
  maps `kind` → component.
- **Never** render raw markdown into the canvas as the "generative UI."
  The contract is structured JSON → designed component.
- Each generated artifact carries a stable ID. On refinement, *replace*
  the artifact by ID — never stack a new one alongside.

---

## 12. Signature details (where finish lives)

These are the tiny, deliberate touches that make the product feel
hand-made.

- **Champagne hairline under the wordmark.** 1px tall, drawn with scaleX
  on mount. `linear-gradient(90deg, transparent, var(--accent-hairline) 20%, var(--accent-hairline) 80%, transparent)`.
- **1px grain overlay on large canvases.** SVG noise at 0.035 opacity,
  `mix-blend-mode: overlay`. Applied to main work areas, never to cards
  or modals.
- **Soft corner vignette on overtures.** Radial gradient at the
  viewport's bottom edge, fading to near-black.
- **Hover bloom on hero CTA.** A radial gradient pseudo-element behind
  the button, opacity 0 at rest, opacity 1 on hover, transitioned over
  500ms. Gives the button "warmth" without changing its colour.
- **Breathing circle marks.** 2–3 concentric 1px circles on the hero
  mark, each animating `scale 0.96 → 1.5` with opacity `0.18 → 0` over
  5.5s, offset by 1.6s per ring. Zero-CPU and deeply premium.

Use at most 2 of these per screen. All of them at once is a tell.

---

## 13. Data display details

- **Numbers aligned to their decimal point** in any column, via tabular-nums.
- **Currency symbols never styled smaller** than the number itself —
  they align to the baseline at the same size.
- **Time formats:** 24-hour where technical (logs, telemetry), 12-hour
  with small uppercase a.m./p.m. where user-facing.
- **Dates:** ISO `YYYY-MM-DD` in technical readouts; long-form
  *"Friday, 28 November"* in editorial copy. Never mix within the same
  surface.
- **Units:** always a thin space between number and unit (`42 ms`,
  `₹50 L`). Use `&thinsp;` or `margin-left: 2px` — never a regular space
  that can line-break.
- **Empty data cells** show an en-dash (`–`) at `text-subtle`, not `N/A`
  or `—` (em is too heavy).

---

## 14. Accessibility

Ship this, not as an afterthought:

- **Focus-visible rings** on every interactive element, as defined in §2.3.
- **Skip to main content** link at the top of the body, visible on focus.
- **Colour contrast:** text tokens are tuned for WCAG AA at body sizes.
  Verify any coloured chip text against its background — accent on
  `accent-soft` must hit 4.5:1.
- **Reduced motion** (§4.5) respected globally.
- **Reduced transparency**: if you use backdrop-blur anywhere, provide a
  solid-bg fallback via `@media (prefers-reduced-transparency)`.
- **Keyboard paths** for every mouse-driven flow: dialog escape, command
  palette, refinement chips as real buttons, approval card Tab-reachable.
- **`aria-label` on every icon-only button.** Always.
- **`aria-live="polite"` on streaming regions** so screen readers announce
  updates without interrupting.
- **`font-synthesis: none`** globally to prevent browsers from faking
  bold/italic from a weight not yet loaded.

---

## 15. Tech stack (reference, not mandate)

The exact stack that produces this output consistently:

- **Vite + React 19 + TypeScript** (strict).
- **Tailwind 4** (OKLCH-native, `@theme`/`@theme inline` blocks).
- **`motion/react`** v12 for motion.
- **Radix primitives** for unstyled accessible dialog / popover / slider /
  tabs / switch — never use a pre-styled component library.
- **Lucide-react** for icons.
- **`clsx` + `tailwind-merge`** (as a `cn()` helper) for class composition.
- **`zustand`** for app state; no Redux, no RTK.
- **Geist + Geist Mono + Fraunces** via Google Fonts with `display=block`
  and preload (see §3.2).

You can substitute pieces — but any substitute must meet the same
criteria: unstyled primitives, OKLCH-native tokens, no visual opinions
carried over from the library.

---

## 16. Build-order playbook

When starting a new project, build in this order. Don't skip.

1. **Tokens first.** The CSS token file is commit #1 after scaffolding.
   Copy §2 verbatim, adjust the accent hue if the brief demands a
   different warm (amber ~70, rose ~20, sage ~140 — always low chroma).
2. **Font loading pipeline.** `index.html` preload + `display=block` +
   `GeistFallback` @font-face. Verify on slow-3G throttle that no text
   jumps as fonts arrive.
3. **Primitives.** Button, Chip, Panel, Kbd, Input, Dialog wrapper. Each
   exported from `ui/components/`. Build these *before* any real screen.
4. **Motion presets.** Copy §4.2 verbatim.
5. **Shell.** The topbar + main layout. Empty. Confirm it looks calm and
   correct with *nothing in it*.
6. **Empty state.** The first screen a user sees. Must pass §1 before
   continuing.
7. **One real flow end-to-end**, thin. Do not build breadth. Build one
   vertical slice all the way through, including activity ribbon, one
   artifact type, one refinement, one approval, one dossier.
8. **Polish pass.** Only now — §12 details, micro-interactions, grain,
   hairlines.
9. **Second screen / second flow.** Reuse the same primitives.
10. **README + screenshots + demo script.**

Commit cadence: 12–20 small, logically-coherent commits. Not one squash
at the end. Commits should be readable in isolation.

---

## 17. Forbidden list (sacred)

Any of these appearing in a shipped screen invalidates the whole system.
Keep this list pinned; revisit before every review.

- [ ] Purple or violet accents of any kind
- [ ] Blue-to-purple or purple-to-pink gradients
- [ ] Sparkle / star / wand / magic / lightning icons as "AI" signifiers
- [ ] Emoji in UI copy (body, buttons, empty states, errors, headings)
- [ ] Exclamation marks in any copy
- [ ] "Loading…" text with an animated spinner
- [ ] Neon green, hot pink, saturated teal as primary colour
- [ ] Rainbow or multi-hue gradients
- [ ] Nested cards (a card inside a card with both having borders)
- [ ] Bouncy animations with >3% overshoot
- [ ] Linear easing on state transitions
- [ ] Staggered entrance animations on initial page mount
- [ ] Placeholder text that is instructional (*"Type your message…"* is
      forbidden; use the Fraunces italic prompt at empty state instead)
- [ ] Title Case on buttons
- [ ] Words: *seamless, effortless, delightful, revolutionary,
      AI-powered, smart, intelligent, magic, amazing, incredible*
- [ ] Cheerleader error states ("Oops!", "Something went wrong 😕")
- [ ] Generic icon packs mixed with Lucide (Heroicons, Phosphor, FontAwesome)
- [ ] Coloured text ordinary content — colour is reserved for accent,
      trace, danger, success; body text is always `--text` or `--text-muted`
- [ ] Drop shadows with hard offsets (`0 4px 0 black`)
- [ ] Border-radius values not on the token scale
- [ ] Spacing values not on the 8pt scale
- [ ] Font sizes not on the scale (§3.1)
- [ ] Font-weights other than 400 / 500 / 600 for UI, 500 / 600 for display
- [ ] Italic body text except in the empty-state prompt and editorial
      taglines
- [ ] `backdrop-blur-xl` on every modal by default — use sparingly, and
      only when there's real content behind it worth blurring

---

## 18. Self-review before shipping

Before calling *anything* "done":

1. Screenshot the screen. Open it in a second window. Does it pass §1?
2. Tab through every interactive element. Are focus rings visible and
   consistent?
3. Throttle to slow-3G. Reload. Does any text jump, resize, or swap
   typeface visibly?
4. Enable `prefers-reduced-motion`. Does the product still feel intentional
   (just quieter)?
5. Switch to the light theme. Do accents retain the same visual weight?
   If not, the light accent value in §2.2 needs adjusting *for this
   product* (usually lowering lightness or raising chroma).
6. Read every visible string aloud to yourself. Any of it sound like a
   marketing email? Rewrite.
7. Count the accent hits on screen. More than three? Remove some.
8. Count the emoji, sparkle icons, and exclamation marks. Must be zero.

---

## 19. One final principle

**The product is not a UI; it is a posture.** Every choice — the warm
champagne instead of neon, Fraunces italic instead of a bold sans-serif,
spring(260, 28) instead of `ease-in-out`, *"What shall we arrange?"* instead
of *"Try one of these prompts!"* — is a small statement about who the product
is for and how seriously it takes them.

Build like the person using the product has built things themselves, has
shipped real software, has been through twenty other AI-flavoured
prototypes this month, and will decide within three seconds whether this
one deserves their attention.

Respect them, and every rule above stops feeling like a constraint and
starts feeling like a craft.
