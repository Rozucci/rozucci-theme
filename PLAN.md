# Rozucci-Theme — plan and working assumptions

This file records how the build brief is being interpreted, plus every
assumption made where the brief left room. It is updated when a decision
changes. Rules that every future session must follow live in `CLAUDE.md`.

## Goal

A reusable Astro theme for **Rozucci** (rozucci.ir). First use: Shayan's
bilingual (fa / en) portfolio. Later: possibly an online store. The
**architecture** is the deliverable — colours and fonts are placeholders and
must be swappable by editing one or two token files.

## Example content: the "Orbit" season dashboard

Shayan asked that the theme's showcase example be the task dashboard designed
in earlier sessions ("مدار پاییز ۱۴۰۵" — the Autumn 1405 season plan, from
1 Mehr to Yalda). It is built as a page of the theme at `/orbit` (fa) and
`/en/orbit` (en). It proves the design language works for app-like,
data-dense screens (useful for the future store), and it reuses CellGrid,
NotchCard, Label, hairline tables and the motion layer.

- Structure kept from the earlier designs: overview counters, the three
  four-week phases, this week's deliverables + deep-work block grid, the
  week-by-week season map with milestones, metrics, daily rhythm and the ten
  anti-failure rules.
- **Privacy:** personal and financial details from the earlier dashboards
  (instalments, loan balance, bank accounts, client names, insurance, health)
  are deliberately left out. The repository may be public and the site may be
  deployed to GitHub Pages. Client work appears as neutral labels
  ("client branding project").
- Ticks are stored in the visitor's browser (`localStorage`). No backend.
  Everything is readable without JavaScript.

## Phases

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | `PLAN.md`, `CLAUDE.md` | done |
| 1 | Scaffold, tokens, themes, fonts, base styles, `/styleguide` skeleton | done |
| 2 | Layout grid + components (CellGrid, NotchCard, …) | done |
| 3 | Pages, content collections, i18n, Orbit dashboard | done |
| 3b | Five more themes + customisation knobs + store kit (from Shayan's references) | done |
| 4 | Motion layer (GSAP, Lenis, view transitions) | done |
| 5 | QA + `README.md` guides | done |
| 6 | GitHub Actions → GitHub Pages | done |

## Assumptions

### Stack

1. **Astro 7.4.5** (latest stable at build time), static output, strict TS.
2. Astro 6+ requires the content config at **`src/content.config.ts`**
   (the old `src/content/config.ts` location now errors). Content files still
   live in `src/content/projects/{fa,en}/`.
3. **GSAP 3.15** (ScrollTrigger, SplitText, Flip), **Lenis 1.3**.
4. Plain CSS with `@layer reset, tokens, base, layout, components, utilities`.
   `tokens` has three sub-layers: `tokens.primitives`, `tokens.semantic`,
   `tokens.themes` — so themes always win over semantic defaults regardless
   of selector specificity.
5. No UI kit, no Tailwind, no CSS-in-JS. Component styles live in each
   `.astro` file inside `@layer components`.

### Routing and i18n

6. One page file per route, serving both locales, through a rest parameter:
   `src/pages/[...locale]/work/index.astro` builds `/work/` (default locale,
   no prefix) and `/en/work/`. The default locale comes from
   `src/site.config.ts`; changing it there swaps which language lives at `/`.
7. Projects are matched across languages by **file name**
   (`projects/fa/x.md` ↔ `projects/en/x.md`), so the language switcher can
   always land on the same project in the other language.
8. `404.astro` and `/styleguide` are single, non-localised pages. The 404 page
   is bilingual on one screen; the style guide is English (LTR) with a
   direction toggle to preview RTL.
9. Digits: Persian prose and values use Persian digits
   (`Intl.NumberFormat('fa-IR')`). Codes stay Latin: section indices `(01)`,
   week codes `W07`, prices, routes `/work`. Two helpers make the choice
   explicit: `num()` (localised) and `code()` (always Latin).
10. **Letter-spacing is disabled for Persian.** Tracking breaks Arabic-script
    joining, so `--label-tracking` resolves to `0` under `:lang(fa)`.
    Uppercase has no effect on Persian, which is fine.

### Design tokens

11. Light and dark values of each colour role are written once with the CSS
    `light-dark()` function, controlled by `color-scheme` on `<html>`
    (`light dark` = follow the OS; the theme toggle forces `light` or
    `dark`). This keeps one line per role, so changing `--color-accent` in a
    theme file changes it everywhere, in both modes. Browsers without
    `light-dark()` (Safari < 17.5, 2024) fall back to readable black-on-white.
12. Both themes (`ivory`, `bone`) ship light + dark values. The brief asked for
    a dark `ivory`; a dark `bone` (built from its "cap" colour) is added so the
    mode toggle never appears broken.
13. Theme and mode choices are applied by a tiny inline script in `<head>`
    before first paint (no flash), stored in `localStorage` (wrapped in
    try/catch; the site works without it).

### Fonts

14. Fonts are self-hosted from Fontsource packages, copied into
    `public/fonts/<family>/` by `npm run fonts` (committed, OFL licences
    included). All `@font-face` rules are in `src/styles/fonts.css`.
15. Instrument Serif has no Arabic-script glyphs. Every font stack ends with
    Vazirmatn, so Persian text in a "display" or "mono" role renders in
    Vazirmatn automatically while Latin runs keep their face.
16. `public/fonts/rozucci/` is reserved for the brand font. README explains the
    two-line switch.

### Media

17. Placeholder media are neutral generated compositions (flat colour + simple
    geometry). `npm run placeholders` renders them to PNG with `sharp` into
    `src/assets/placeholders/`, so `astro:assets` exercises the real pipeline
    (AVIF/WebP, responsive `srcset`). No stock photos, no third-party assets.

### Motion

18. All motion is opt-out via flags in `src/site.config.ts`.
19. Hide-before-reveal styles apply only under `html.js.motion`. The inline
    head script adds `.motion` only when flags allow it and the user has not
    asked for reduced motion; a 3 s safety timer removes it if the motion
    bundle never initialises, so content can never stay hidden.
20. Easing curves live once, as CSS `cubic-bezier()` tokens. GSAP reads them
    from CSS through `src/motion/config.ts` (small cubic-bezier solver), so
    CSS transitions and GSAP tweens use the identical curve.
21. CellGrid hairlines are drawn with pseudo-elements so they can "draw in"
    with a transform (borders cannot be scaled).

### Deployment

22. `site` is `https://rozucci.ir`. A `BASE_PATH` env var sets Astro's `base`
    for sub-path hosts (GitHub Pages project sites). All internal links go
    through one helper, so the base is respected everywhere.

### Added after the first brief

23. **Reference-driven themes.** Shayan shared five reference screens (a
    product page, an onboarding card grid, a catalog, a studio site, a
    fragrance product page). Only their *principles* were used, as five
    generic themes — `stone`, `sand`, `paper`, `studio`, `sage` — plus
    structural knobs in the token layer (boxed page, boxed grid, display
    face/case, emphasis, media filter, button style). No names, logos, copy or
    assets from those sites.
24. **Store kit** (demo): products collection, catalog, product page,
    browser-only cart. Checkout is deliberately not connected. Placeholder
    products follow the disciplines: prints, an original, LUTs, an album, a
    template, a zine.
25. Font roles are composed per language from `*-latin` pieces so a theme can
    change faces without breaking Persian (Vazirmatn always first in `fa`).
26. Performance: all CSS is inlined (no render-blocking requests), the
    Persian font is subset to the Arabic block, labels are 12px minimum, the
    language switcher shows Latin `FA` / `EN` (a Persian glyph would load the
    Persian font on every English page), Orbit's non-current weeks live in
    inert `<template>`s.
27. Preview deploys set `PUBLIC_NOINDEX=true` → every page gets `noindex`.
28. The repository had no commits and no `main` branch at the start, so the
    work lives on the session branch; a pull request needs a base branch.

## Open decisions (for Shayan)

- What the shop will really sell (the demo assumes prints, originals, presets,
  sound, templates) and in which currency (`site.config → store`).

- Should `/orbit` stay a showcase page, or become a private tool (noindex,
  removed from the nav) once the real portfolio content arrives?
- Final brand font files for `public/fonts/rozucci/`.
- Real project content and media.
