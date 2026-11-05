# CLAUDE.md — rules for every session on Rozucci-Theme

Rozucci-Theme is a reusable Astro theme for **Rozucci** (rozucci.ir), the
solo creative brand of Shayan. First use: his bilingual portfolio. Later: an
online store. **The architecture is the product** — restyling the whole site
must only ever mean editing token/theme files.

See `PLAN.md` for assumptions and history, `README.md` for how-to guides.

## Communication

- Code, comments, commit messages, docs: **English**.
- Every message to Shayan: **Persian (Farsi)**, short, simple, clear sentences.
- After each phase or larger change: commit, push, then a short Persian summary
  (what was done / what to check / open decisions).

## Design language — "warm editorial grid"

Principles only, inspired by Anthropic, Mistral, Teenage Engineering, Aesop,
Le Labo. Never copy any brand's logo, name, fonts, illustrations or copy.

1. **Zero radius** everywhere (`--radius: 0`). Only NotchCard uses
   `--radius-card`.
2. **Hairlines, not shadows.** No `box-shadow`, no gradients, no blur, no
   `backdrop-filter`. Structure = 1px lines (`--line-width`).
3. **Collapsed, visible grid.** Use `CellGrid` for any grid of cells. Never
   draw double lines. Direct children of CellGrid must not use `::before` /
   `::after` on their root element — those are the grid's hairlines.
4. **Warm canvas + one ink + at most one accent per view.**
5. **Type duality:** large display face for headlines; small uppercase
   monospace for labels, metadata, prices.
6. **Text signs instead of icons:** `[+] ADD`, `→`, `(01)`, `/work`,
   `[ LABEL ]`. Navigation is text-only. Sections are numbered `(01)`.
7. Media carries the colour. Flat grounds, consistent aspect ratios
   (`MediaFrame` with a `ratio` token).

## Tokens (the most important rule)

- Three tiers: `src/styles/tokens/primitives.css` (raw values) →
  `src/styles/tokens/semantic.css` (roles) → `src/styles/themes/*.css`
  (a theme only remaps semantic roles under `[data-theme="name"]`).
- **Components read semantic tokens only.** No hex, rgb, px sizes, ms
  durations or easing curves outside the token files. Allowed literals in
  components: `0`, `1`, `100%`, `auto`, `none`, `inherit`, `currentColor`.
  Need a new value? Add a primitive, then a semantic role, then use the role.
- Colours: each role is one `light-dark(light, dark)` line in the theme file.
- Motion values (durations, easings) are CSS tokens; JS reads them through
  `src/motion/config.ts`. Never hardcode a duration or ease in JS.
- `src/site.config.ts` is the single config: name, locales, default locale,
  nav, socials, default theme, motion flags.

## CSS

- Plain CSS, custom properties, `@layer reset, tokens, base, layout,
  components, utilities` (declared once in `src/styles/global.css`).
- **Logical properties only**: `margin-inline`, `padding-block-start`,
  `inset-inline-end`, `border-inline-start`, `inline-size`, `text-align:
  start`… Never `left`/`right`/`margin-left`/`width`-for-direction in
  components. `transform-origin` for direction-aware draws uses
  `var(--origin-inline-start)`.
- Directional arrows go through `TextLink`/`Arrow` so they mirror in RTL.
- Visible `:focus-visible` states on everything interactive.

## Bilingual / RTL

- Locales `fa` (rtl, default) and `en` (ltr), configured in `site.config.ts`.
  Routes: default locale at `/`, the other under its prefix (`/en/`).
- Pages live in `src/pages/[...locale]/` and render both locales from one
  file. Projects are paired across locales by identical file names.
- UI strings only from `src/i18n/{fa,en}.ts` (typed — `en` defines the shape).
  No inline UI copy in components.
- Persian prose shows Persian digits via `num()`; codes, indices `(01)`,
  prices and routes stay Latin via `code()`.
- Wrap Latin runs inside Persian text with `<bdi>`.
- **Never apply letter-spacing to Persian** (`--label-tracking` is 0 under
  `:lang(fa)`). Never split Persian into characters.

## Motion — precise, calm, mechanical

- GSAP (ScrollTrigger, SplitText, Flip) + Lenis + Astro `ClientRouter`.
- Ease out only (`--ease-out` ≈ expo.out, `--ease-standard` ≈ power3.out).
  No bounce, no elastic, no overshoot.
- Initialise on `astro:page-load`; clean up on `astro:before-swap`
  (revert the gsap.matchMedia context: ScrollTriggers, SplitText, Lenis).
- Transform/opacity/clip-path only. No layout-property animation.
- `prefers-reduced-motion: reduce` → no Lenis, no parallax, no reveals.
- Lenis for wheel only; touch keeps native scroll.
- Content fully visible without JS. Hidden pre-reveal states only under
  `html.js.motion`.
- SplitText: lines (or words) only, never chars for `fa`.
- No scroll-jacking, no pinned horizontal sections in v1.

## Quality bar

- `npm run check` (astro check) and `npm run build`: zero errors, zero warnings
  we introduced.
- Lighthouse mobile: performance ≥ 90, accessibility ≥ 95, LCP < 2.5 s,
  CLS < 0.05. Home JS ≤ ~100 KB gzip.
- Semantic HTML, keyboard accessible, visible focus.
- Check both locales × both themes × light/dark after visual changes
  (`/styleguide` has the switchers).

## Commands

```bash
npm run dev           # local dev server
npm run check         # astro check (types + .astro diagnostics)
npm run build         # static build into dist/
npm run preview       # serve dist/
npm run fonts         # copy self-hosted fonts from node_modules → public/fonts
npm run placeholders  # regenerate placeholder media
```

## Git

- Work on the branch you were given; commit after each meaningful step with a
  clear English message; push with `git push -u origin <branch>`.
