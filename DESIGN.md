# Design notes

Kept out of the README — these are the working notes behind the visual language,
so anyone forking the prototype can understand *why* the choices were made.

## Palette (OKLCH)

Dark-first, with a light counterpart. A single accent — a warm champagne — and
one muted trace-teal. No blue. No purple. No gradient backgrounds.

| Token | Dark | Light |
|---|---|---|
| `--surface` | `oklch(14% 0.010 260)` | `oklch(98% 0.002 80)` |
| `--elev-1`  | `oklch(18% 0.012 260)` | `oklch(96% 0.003 80)` |
| `--elev-2`  | `oklch(22% 0.014 260)` | `oklch(94% 0.004 80)` |
| `--border`  | `oklch(28% 0.010 260)` | `oklch(88% 0.004 80)` |
| `--text`    | `oklch(96% 0 0)`       | `oklch(16% 0 0)` |
| `--muted`   | `oklch(68% 0.010 260)` | `oklch(46% 0.010 260)` |
| `--accent`  | `oklch(78% 0.120 90)`  | `oklch(62% 0.130 70)` |
| `--trace`   | `oklch(68% 0.080 200)` | `oklch(52% 0.090 200)` |

## Type

- **Body / UI**: Geist Sans — 14/16/20/28, weights 400/500/600.
- **Editorial accent**: Fraunces (variable) — reserved for the empty-state
  prompt and major section titles. Adds an editorial hand without slipping
  into SaaS-generic.
- **Numerals**: tabular-nums applied to every price, token count, and timestamp.

## Motion

- `spring(260, 28)` for any state transition.
- Durations 150 – 280ms. Never longer than 320ms.
- No stagger on initial mount.
- Respect `prefers-reduced-motion` — fall back to instant fades.

## Spacing

Strict 8pt grid. Allowed: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`. Card padding
is 20px. Gap between cards is 12px. Anything ad-hoc is a bug.

## Iconography

Lucide only. 16px, stroke 1.5. Never filled.

## Signature detail

A 1px champagne → transparent hairline under the app title tracks the active
agent. Hover a trace chip and the hairline highlights the span of that
sub-agent's work. Editorial, not gimmicky.
