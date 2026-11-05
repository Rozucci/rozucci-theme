import { defineConfig } from 'astro/config';
import { site } from './src/site.config';

/**
 * BASE_PATH lets the same build run under a sub-path, e.g. GitHub Pages
 * project sites (`/rozucci-theme/`). Leave unset for a root deploy.
 */
const base = process.env.BASE_PATH ?? '/';
const siteUrl = process.env.SITE_URL ?? site.url;

export default defineConfig({
  site: siteUrl,
  base,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // All CSS is inlined: no render-blocking stylesheet requests (the whole
    // theme is ~9 KB gzip), which keeps first paint and LCP fast on mobile.
    inlineStylesheets: 'always',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  image: {
    // Placeholder media are generated PNGs; astro:assets emits AVIF/WebP.
    responsiveStyles: false,
  },
  devToolbar: { enabled: false },
});
