# AgentCash landing — YC design partner roast log

_Cycle 1 — harsh pass on `/` (Coming Soon scaffold)_

## Roasts

1. **Ghost nav** — Header links to `#platform`, `#how-it-works`, `#get-started` that do not exist on the page. Feels like a broken template, not a deliberate launch surface.
2. **No primary CTA** — Hero ends at copy + dock. YC landings give one obvious action (waitlist, docs, or star repo) above the fold.
3. **Marquee lacks context** — Testimonials scroll with no eyebrow (“Builders on AgentCash”) so social proof reads as decorative noise.
4. **Footer oversells** — Four columns of product/legal links to sections that are not on this page; erodes trust on a “coming soon” story.
5. **Generic GitHub** — Dock and header point at `https://github.com`, not a real org/repo — instant “placeholder startup” signal.
6. **Hero is static except typer** — Eyebrow, subcopy, and CTA block do not enter with motion; only the typer animates, so the fold feels half-finished.
7. **Scroll progress is invisible** — Page is ~one viewport tall; progress bar never moves — wasted chrome unless the layout invites scroll.
8. **Review cards are dense** — Long quotes in narrow cards fight the marquee; hard to skim while scrolling.

## Fixed (cycle 1)

- [x] Ghost nav → Docs, Status, Contact + waitlist CTA in header
- [x] Primary CTA → Join waitlist + Read the docs in `ComingSoonHero`
- [x] Marquee context → “Builders shipping with AgentCash” eyebrow
- [x] Footer oversells → compact footer with real links only
- [x] Generic GitHub → dock uses Waitlist + Status instead of github.com
- [x] Hero static → staggered Framer entrance on hero block
- [x] Review density → `line-clamp-4` on quotes; faster marquee timing

---

_Cycle 2 — second pass_

## Roasts

1. **Page does not scroll** — Single viewport + short footer means scroll progress and sticky header polish never show; feels like a slide, not a site.
2. **Dock duplicates Docs** — Nav already has Docs; social strip should differentiate (waitlist/status only — partially fixed, but Home is redundant on `/`).
3. **Marquee edge fade uses wrong stop** — Gradient masks can band on wide screens; needs softer multi-stop fade.
4. **No trust strip** — YC pages often show “x402 · USDC · Base · open source” as a pill row under CTAs.
5. **Color typer cursor on rotate** — Good, but hero headline could use subtle letter-spacing tighten on mobile.
6. **Dock magnification on touch** — Magnification is mouse-only; touch users get dead icons with no tap feedback.

## Fixed (cycle 2)

- [x] Page scroll → `min-h-[120dvh]` on main for scroll progress + header behavior
- [x] Dock dedupe → removed Home; Docs + Waitlist + Status only
- [x] Marquee fades → softer multi-stop edge gradients
- [x] Trust strip → x402 / USDC / CLI / BYOK pills under hero
- [x] Mobile headline tracking → tighter on small screens
- [x] Dock touch + a11y motion → `active:scale-95`, `disableMagnification` when reduced motion; scroll bar hidden when reduced motion

---

_Cycle 3 — motion / CSS pass_

## Roasts

1. **Marquee may not animate** — `motion-safe:` utilities were used without a Tailwind variant; tracks looked static.
2. **`ac-eyebrow` was a ghost class** — Used in JSX but not defined in CSS (only inline colors).
3. **Dock/marquee pop-in missing** — Social proof and dock appeared abruptly after hero animation.

## Fixed (cycle 3)

- [x] Marquee → restored `animate-marquee` + `flex-nowrap` + hover pause
- [x] `.ac-eyebrow` token class in `globals.css` `@layer components`
- [x] `MarqueeReveal` + `DockReveal` viewport/ delayed entrance
- [x] Review cards → subtle hover lift

---

## Loop summary (~8 min)

| Cycles | Focus |
|--------|--------|
| 1 | Critic roasts → nav/CTA/footer/marquee label/hero motion |
| 2 | Scroll height, trust pills, dock dedupe, edge fades |
| 3 | Marquee CSS fix (`animate-marquee`), `.ac-eyebrow`, reveal wrappers |
| 4 | a11y hover guards, metadata, exports |
| 5 | Hero grid backdrop, header motion a11y, appear typer without cursor |

**Build:** `npm run build -w web` passes at end of loop.
