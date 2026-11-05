# WebGL hook (not used in v1)

WebGL is out of scope for v1. This folder is the reserved place for it.

How to add a WebGL layer later without touching components:

1. Put the renderer here (`src/motion/webgl/index.ts`), exporting
   `startWebGL(root: HTMLElement): () => void` that returns a cleanup function.
2. Mark hosts in markup with `data-webgl="<effect-name>"` (for example on a
   `MediaFrame`). Keep a normal image inside as the fallback.
3. In `src/motion/index.ts`, inside the `mm.add(...)` callback, call
   `startWebGL` for each host and return its cleanup with the others — the
   lifecycle then handles view transitions and reduced motion for free.
4. Add a `webgl` flag to `site.motion` in `src/site.config.ts` so it can be
   switched off in one place, and lazy-load the module (`await import()`) so
   pages without WebGL hosts pay nothing.
5. Read colours from CSS tokens (`getComputedStyle(...).getPropertyValue`)
   so a theme change also re-colours the canvas.
