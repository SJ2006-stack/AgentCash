# AgentCash Design System

Meridian Studio foundation for the AgentCash marketing site. Dark-first, fintech-meets-agent-control-plane — built for YC-grade landing pages on Next.js + Framer Motion.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 + shadcn (base-nova) |
| Motion | Framer Motion (`Reveal`, FAQ accordion) |
| Fonts | DM Sans (UI), JetBrains Mono (CLI) |
| Deploy | OpenNext / Cloudflare Workers |

No Vue in this repo — all marketing work lives in `apps/web`.

---

## Design direction

**Dark-first control plane.** Deep navy-black backgrounds (`#05080c`), emerald-teal accent for money/trust signals, glass surfaces with subtle grid overlays. Feels like Stripe docs meets Linear polish — not crypto-bro neon.

---

## Tokens

Source of truth: `src/styles/design-tokens.css` (imported by `globals.css`).

### Color

| Token | Role |
|-------|------|
| `--ac-bg` | Page background |
| `--ac-bg-elevated` | Raised surfaces |
| `--ac-fg` / `--ac-fg-muted` | Primary & secondary text |
| `--ac-accent` | CTAs, highlights, success |
| `--ac-surface-glass` | Card / panel fill |
| `--ac-border` | Dividers, inputs |

Legacy shadcn vars (`--background`, `--primary`, etc.) remain in `globals.css` for component compatibility.

### Typography

Utility classes in `@layer components`:

| Class | Use |
|-------|-----|
| `.ac-display` | Hero headline (fluid clamp) |
| `.ac-h1` – `.ac-h4` | Section titles & card headings |
| `.ac-body` / `.ac-body-lg` | Paragraph copy |
| `.ac-mono` | CLI snippets, code blocks |

Eyebrow labels: `<Eyebrow>` component or `--ac-text-eyebrow` token.

### Spacing & layout

| Token | Value |
|-------|-------|
| `--ac-container-max` | 1280px (`max-w-7xl`) |
| `--ac-section-y` | 5rem → 7rem (sm+) |
| Container padding | 1.5rem → 2rem |

Use `<Section>` + `<Container>` together — never raw max-width on sections.

### Motion

CSS variables pair with `src/lib/motion.ts`:

| Token | Framer equivalent |
|-------|-------------------|
| `--ac-motion-slow` (500ms) | `revealTransition.duration` |
| `--ac-ease-out` | `easeOut = [0.22, 1, 0.36, 1]` |

**Principles:**
- Viewport reveals via `<Reveal>` — once, 14px Y offset
- Honor `prefers-reduced-motion` everywhere
- No parallax, no infinite hero animations (except subtle pulse dots)
- Hover states: 150ms color/border transitions

---

## Primitives

| Component | Path | Purpose |
|-----------|------|---------|
| `Section` | `ui/Section.tsx` | Vertical rhythm + `SectionHeading` |
| `Container` | `ui/Container.tsx` | 1280px max, responsive padding |
| `Eyebrow` | `ui/Eyebrow.tsx` | Section labels, optional live dot |
| `GradientText` | `ui/GradientText.tsx` | Accent / cool / warm gradients |
| `GridBackground` | `ui/GridBackground.tsx` | Subtle 56px grid with radial mask |
| `Reveal` | `landing/Reveal.tsx` | Framer viewport animation |

Existing shadcn: `Button`, `Badge`, `Card`, `Separator`.

---

## YC landing structure

Current `page.tsx` scaffold:

```
SiteHeader (layout)     → Sticky nav, logo, 4 links, primary CTA
Hero (+ HeroVisual)     → Split layout, headline, dual CTAs, product mock
LogoStrip               → Social proof row (placeholder names)
ProblemSolution         → Problem vs solution narrative cards
Features (#platform)    → 3-col + featured bento card
HowItWorks              → 3-step flow with animated connectors
DeveloperSection        → CLI commands + animated terminal
GetStartedBand          → Pricing tiers / beta CTA
FAQ                     → Accordion (AnimatePresence)
FinalCTA                → Closing card band
SiteFooter              → Links, integrations, social
```

Legacy sections kept in repo but off the main page: `Roadmap`, `SocialRows`, `CliDemo`.

---

*Meridian Studio · Component 1 of 4*
