# Rozucci Theme

A reusable, bilingual (Persian / English) Astro theme for **Rozucci**
(rozucci.ir) — a "warm editorial grid": hairlines instead of shadows, a
visible collapsed grid, a large display face next to small uppercase mono
labels, text signs instead of icons, and media that carries the colour.

The **architecture** is the product: the whole look changes by editing token
and theme files — never components. Seven themes ship to prove it.

- Portfolio: home, work index (filterable), project pages, about, contact
- **Orbit** (`/orbit`): the Autumn 1405 season dashboard — the theme's working
  example of a dense, app-like screen
- **Store kit** (`/shop`, `/cart`): catalog, product page and a browser-only
  cart, ready for a real commerce backend later
- `/styleguide` (noindex): every token, the themes side by side, all
  components, motion demos, theme / mode / direction switchers

Stack: Astro 7 (static, TypeScript) · plain CSS with custom properties and
`@layer` · GSAP 3 (ScrollTrigger, SplitText, Flip) · Lenis · Astro view
transitions · content collections · `astro:assets` (AVIF / WebP).

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run check      # types + .astro diagnostics
npm run build      # static site in dist/
npm run preview    # serve dist/
```

Node 22.23+ (Astro 7 requirement).

## Where things live

```
src/
  site.config.ts          ← the one config: name, locales, nav, socials,
                            themes, store, announcement, motion flags
  styles/
    tokens/primitives.css ← raw values (colour ramps, sizes, durations…)
    tokens/semantic.css   ← roles components use + theme knobs
    themes/*.css          ← one file per theme: remaps roles + knobs
    fonts.css             ← every @font-face
    global.css            ← layer order + imports
  components/             ← CellGrid, NotchCard, ProjectCard, ProductCard…
  layouts/                ← BaseLayout, ProjectLayout
  pages/[...locale]/      ← each page once; builds / (fa) and /en/
  content/projects/{fa,en}/  content/products/{fa,en}/
  data/orbit.ts           ← Orbit dashboard data (bilingual)
  i18n/{fa,en}.ts         ← UI strings (en defines the shape)
  motion/                 ← config, lenis, reveals, text, parallax, cursor,
                            flip, transitions, index (lifecycle), webgl/
  scripts/                ← small browser modules (filter, cart, orbit)
public/fonts/             ← self-hosted fonts (+ rozucci/ slot)
scripts/                  ← font copy/subset, placeholder generator
```

Rules for anyone (or any AI session) editing the theme: `CLAUDE.md`.
Decisions and history: `PLAN.md`.

---

## Guides

### Change colours

Colours are **roles**, defined once per theme in `src/styles/themes/<name>.css`:

```css
--color-accent: light-dark(var(--p-clay-500), var(--p-clay-500));
/*                         ↑ light mode        ↑ dark mode        */
```

1. Pick the theme file (default: `ivory.css`).
2. Change the role's value — use a primitive from
   `src/styles/tokens/primitives.css`, or add a new primitive there first.
3. Done: every component reading that role updates, in both modes.

`--color-accent-ink` (accent used as small text) and `--color-focus` are
derived from `--color-accent` with `color-mix()`, so the accent really is one
line. Try it live in `/styleguide` → *(06) Accent proof*.

Main roles: `--color-ground` (outside a boxed page), `--color-canvas`,
`--color-surface`, `--color-surface-2`, `--color-ink`, `--color-ink-muted`
(AA text), `--color-ink-subtle` (decorative only), `--color-line`,
`--color-line-strong`, `--color-accent`, `--color-on-accent`, `--color-media`,
`--color-notch-*`.

### Change fonts (and switch to the Rozucci brand font)

Fonts have three layers:

1. **Files** in `public/fonts/<family>/` (copied from Fontsource by
   `npm run fonts`; the Persian file is subset by `npm run fonts:subset`).
2. **`@font-face`** rules — all in `src/styles/fonts.css`.
3. **Roles** — `--font-display-latin`, `--font-text-latin`,
   `--font-mono-latin`, `--font-fa`, `--font-brand` in
   `src/styles/tokens/semantic.css` (a theme may override the `*-latin`
   pieces). Persian always puts `--font-fa` first.

**Switch to Rozucci:**

1. Upload the files, e.g. `public/fonts/rozucci/Rozucci-Regular.woff2`
   (woff2; add more weights if you have them).
2. In `src/styles/fonts.css`, uncomment the *Brand: Rozucci* block and fix the
   file names / weights.
3. In `src/styles/tokens/primitives.css` set
   `--p-font-brand: 'Rozucci';` → the wordmark (header + footer) uses it.
4. Optional — use it for all Latin headlines too: in
   `src/styles/tokens/semantic.css` set
   `--font-display-latin: var(--p-font-brand), var(--p-font-system-serif);`
5. Optional — preload it: add its path to `preloads` in
   `src/components/HeadMeta.astro`.

### Add a project

1. Add images to `src/assets/` (any size; Astro makes AVIF/WebP and srcsets).
2. Create the same file name in both folders:
   `src/content/projects/fa/my-project.md` and
   `src/content/projects/en/my-project.md`.
3. Front matter (copy an existing file):

```yaml
title: "Project title"
summary: "One line."
discipline: web            # visual-art | video | web | creative-coding | music | ai
year: 2026
tools: ["Astro", "GSAP"]
role: "Design and development"
cover: ../../../assets/my-project/cover.jpg
coverAlt: "Describe the image."
media:
  - src: ../../../assets/my-project/wide.jpg
    alt: "…"
    ratio: landscape         # square | portrait | landscape | wide | cinema
    caption: "…"
    wide: true               # spans both columns
credits:
  - role: "Code"
    name: "Shayan"
order: 7
featured: false
```

The body is Markdown. The page appears at `/work/my-project/` and
`/en/work/my-project/`, and the language switcher links them.

### Add a product (store demo)

Same pattern in `src/content/products/{fa,en}/<slug>.md` with `category`
(`print | original | preset | sound | template`), `price`, optional
`variants` (`id`, `label`, `price`), `images` and `details`. Currency and
shipping text: `site.config.ts → store`. Turn the store off with
`store.enabled: false` (removes the nav item and the header cart).

### Add a theme

1. Copy `src/styles/themes/ivory.css` to `src/styles/themes/<name>.css` and
   change the selector to `[data-theme='<name>']` (drop the `:root,` line —
   only the default theme keeps it).
2. Remap the colour roles. Add primitives to `primitives.css` if needed.
3. Optional: flip customisation knobs (table below).
4. Import it in `src/styles/global.css` and add `'<name>'` to `themes` (and
   the `ThemeName` type) in `src/site.config.ts`.
5. Check it in `/styleguide` → *(10) Themes*, and site-wide with the footer's
   `[ theme ]` button. Make default with `defaultTheme`.

**Customisation knobs** (set them in a theme file):

| Knob | Default | Effect |
| --- | --- | --- |
| `--frame-inset`, `--frame-border-block` | `0` | > 0 floats the page as a box on `--color-ground` (see `stone`) |
| `--cell-gap`, `--cell-border`, `--cell-rule`, `--cell-grid-pad` | collapsed | boxed cells with gaps instead of shared hairlines (see `sand`) |
| `--font-display-latin`, `--font-text-latin`, `--font-mono-latin` | Instrument Serif / Inter / Roboto Mono | faces per role (see `sage`: all mono) |
| `--weight-display-latin`, `--tracking-display-latin`, `--leading-*-latin` | — | display style |
| `--display-transform` | `none` | `uppercase` headlines (see `stone`, `sand`, `studio`) |
| `--label-transform`, `--label-tracking-latin` | `uppercase`, `0.08em` | label style |
| `--em-style`, `--em-color` | `italic`, `inherit` | `<em>` inside headlines (see `paper`) |
| `--media-filter`, `--media-filter-hover` | `none` | e.g. grayscale media that regains colour on hover (see `studio`) |
| `--button-bg`, `--button-ink`, `--button-border`, `--button-hover-*` | filled ink | outline buttons (see `studio`) |
| `--radius-card`, `--notch-w`, `--notch-h`, `--notch-gap`, `--notch-media-ratio` | 18px, … | NotchCard shape |

Shipped themes: `ivory` (default), `bone`, `stone`, `sand`, `paper`,
`studio`, `sage` — each with light and dark values.

### Turn motion features off

`src/site.config.ts`:

```ts
motion: {
  smoothScroll: true,     // Lenis (wheel only, desktop pointers)
  reveals: true,          // hairline draws, line-by-line headlines, media wipes, rise
  parallax: true,         // media drift
  pageTransitions: true,  // view transitions + top line wipe
  cursorLabel: true,      // desktop "[ VIEW ]" label
  flipFilter: true,       // animated work/shop filtering
}
```

Set any flag to `false`. Visitors with *reduce motion* get no smooth
scrolling, reveals, parallax or cursor label regardless. Durations and easings
are tokens (`--dur-*`, `--ease-*` in `semantic.css`); GSAP reads the same
values through `src/motion/config.ts`. WebGL: see `src/motion/webgl/README.md`.

### Languages

`site.config.ts → locales` and `defaultLocale` (served at `/`; the other at
`/<code>/`). UI strings: `src/i18n/en.ts` (defines the shape) and `fa.ts`.
Persian shows Persian digits (`num()`); codes, indices, prices stay Latin
(`code()`, `formatPrice()`).

### The Orbit dashboard

Data: `src/data/orbit.ts` (season dates, phases, deliverables, deep-work
blocks, rhythm, rules — bilingual). Ticks are stored in the visitor's browser
only. Personal and financial items from the private dashboard are left out on
purpose; keep it that way if the repository is public.

### Connect a store backend

The cart (`src/scripts/cart.ts`) keeps lines in `localStorage` and checkout is
disabled on purpose. To sell for real, keep the components and replace
`cart.add / setQty / remove` with calls to a commerce API (a hosted cart such
as Snipcart or Shopify's Storefront API, or your own), and point the checkout
button at the provider. Product data can stay in the content collection or be
fetched at build time.

### Offline package (open with a double-click)

```bash
npm run offline
```

Writes `dist-offline/`: the whole site with relative links and every page's
scripts inlined, so `index.html` opens straight from the disk (no server, no
internet). View transitions are off in this build; everything else works.

### Deploy

`npm run build` writes a fully static site to `dist/` — upload it to any
static host (Netlify, Cloudflare Pages, Vercel, a plain web server).

- **Sub-path hosting** (e.g. `https://user.github.io/rozucci-theme/`):
  build with `BASE_PATH=/rozucci-theme/ npm run build`. All links, fonts and
  assets respect the base.
- **Canonical / hreflang URLs** use `site.url` (`https://rozucci.ir`);
  override with `SITE_URL=https://… npm run build`.
- **GitHub Pages:** `.github/workflows/deploy.yml` builds and deploys on every
  push to `main`. Enable it once: repository *Settings → Pages → Source:
  GitHub Actions*.

---

## Quality (Lighthouse mobile, local build)

| Page | Perf | A11y | Best pr. | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| `/` (fa) | 99–100 | 100 | 100 | 100 | 1.5–1.8 s | 0.001 |
| `/en/` | 98–100 | 100 | 100 | 100 | 1.6–2.3 s | 0.002 |
| `/work/` | 99 | 100 | 100 | 100 | 1.9 s | 0.001 |
| project page | 95–100 | 100 | 100 | 100 | 1.6–2.5 s | 0 |
| `/orbit/` | 96–98 | 100 | 100 | 100 | 2.1–2.5 s | 0.001 |
| `/en/shop/` | 99 | 100 | 100 | 100 | 1.8 s | 0 |
| product page | 98–99 | 100 | 100 | 100 | 1.6–2.2 s | 0.001 |

(Cart and style guide are `noindex`, so their SEO score is lower by design.)
Home page JavaScript: ~61 KB gzip (Flip and page scripts load only where
used). CSS is inlined (~9 KB gzip) so nothing blocks first paint.

## Licences

Fonts: SIL Open Font License (licence files next to each font in
`public/fonts/`). Placeholder media are generated by
`scripts/gen-placeholders.mjs` — no stock or third-party assets.
