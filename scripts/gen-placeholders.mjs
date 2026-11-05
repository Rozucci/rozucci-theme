// Generate neutral placeholder media: flat grounds + simple geometry.
// Output: src/assets/placeholders/*.png (processed by astro:assets into
// AVIF/WebP at build). Run with `npm run placeholders`. No external assets.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'src', 'assets', 'placeholders');
mkdirSync(out, { recursive: true });

const C = {
  canvas: '#faf9f5',
  surface: '#f0eee6',
  raised: '#e8e6dc',
  line: '#d1cfc5',
  mid: '#b0aea5',
  muted: '#6b6a64',
  ink: '#141413',
  clay: '#d97757',
  olive: '#788c5d',
  sky: '#6a9bcc',
  stone: '#c2c1bf',
  bone: '#e4e3df',
  sage: '#6e8975',
  cap: '#262626',
};

const svg = (w, h, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}"/>${body}</svg>`;

const range = (n) => Array.from({ length: n }, (_, i) => i);

/** Each composition is a function of (w, h) → svg body. */
const COMPOSITIONS = {
  // Visual art — an event horizon: a disc and a thin ring.
  horizon: (w, h, c) =>
    `<circle cx="${w / 2}" cy="${h * 0.46}" r="${w * 0.27}" fill="${c.ink}"/>` +
    `<ellipse cx="${w / 2}" cy="${h * 0.46}" rx="${w * 0.42}" ry="${w * 0.06}" fill="none" stroke="${c.clay}" stroke-width="${w * 0.006}"/>`,
  // Video — a frame inside letterbox bars.
  frame: (w, h, c) =>
    `<rect y="0" width="${w}" height="${h * 0.18}" fill="${c.ink}"/>` +
    `<rect y="${h * 0.82}" width="${w}" height="${h * 0.18}" fill="${c.ink}"/>` +
    `<rect x="${w * 0.18}" y="${h * 0.34}" width="${w * 0.64}" height="${h * 0.32}" fill="none" stroke="${c.ink}" stroke-width="${w * 0.004}"/>` +
    `<rect x="${w * 0.58}" y="${h * 0.4}" width="${w * 0.12}" height="${h * 0.2}" fill="${c.clay}"/>`,
  // Web — a hairline grid with one filled cell.
  grid: (w, h, c) => {
    const cols = 6;
    const rows = Math.round((cols * h) / w);
    const cw = w / cols;
    const rh = h / rows;
    const lines =
      range(cols - 1).map((i) => `<rect x="${(i + 1) * cw}" width="${w * 0.002}" height="${h}" fill="${c.ink}"/>`).join('') +
      range(rows - 1).map((i) => `<rect y="${(i + 1) * rh}" height="${w * 0.002}" width="${w}" fill="${c.ink}"/>`).join('');
    return `<rect x="${cw * 2}" y="${rh * 1}" width="${cw}" height="${rh}" fill="${c.sky}"/>` + lines;
  },
  // Creative coding — dots on concentric orbits.
  orbit: (w, h, c) => {
    const cx = w / 2;
    const cy = h / 2;
    let body = '';
    range(5).forEach((ring) => {
      const r = w * (0.08 + ring * 0.075);
      const n = 6 + ring * 6;
      body += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c.mid}" stroke-width="${w * 0.0015}"/>`;
      range(n).forEach((i) => {
        const a = (i / n) * Math.PI * 2 + ring * 0.4;
        const filled = (i + ring) % 7 === 0;
        body += `<circle cx="${cx + Math.cos(a) * r}" cy="${cy + Math.sin(a) * r}" r="${w * (filled ? 0.012 : 0.006)}" fill="${filled ? c.clay : c.ink}"/>`;
      });
    });
    return body;
  },
  // Music — a waveform of vertical bars.
  wave: (w, h, c) => {
    const n = 48;
    const bw = (w * 0.8) / n;
    return range(n)
      .map((i) => {
        const t = i / (n - 1);
        const amp = Math.abs(Math.sin(t * Math.PI * 3.2) * Math.cos(t * Math.PI * 1.1));
        const bh = h * (0.06 + amp * 0.5);
        return `<rect x="${w * 0.1 + i * bw}" y="${h / 2 - bh / 2}" width="${bw * 0.5}" height="${bh}" fill="${i % 11 === 5 ? c.olive : c.ink}"/>`;
      })
      .join('');
  },
  // AI — nested squares, one offset.
  nested: (w, h, c) => {
    const s = Math.min(w, h);
    return (
      range(6)
        .map((i) => {
          const size = s * (0.7 - i * 0.11);
          return `<rect x="${(w - size) / 2}" y="${(h - size) / 2}" width="${size}" height="${size}" fill="none" stroke="${c.ink}" stroke-width="${s * 0.003}"/>`;
        })
        .join('') +
      `<rect x="${w / 2 + s * 0.08}" y="${h / 2 - s * 0.2}" width="${s * 0.12}" height="${s * 0.12}" fill="${c.sage}"/>`
    );
  },
};

/** name → [composition, ground] */
const PROJECTS = {
  'event-horizon': ['horizon', C.surface],
  'frame-arrives': ['frame', C.bone],
  'index-of-nights': ['grid', C.canvas],
  'orbit-field': ['orbit', C.raised],
  'low-frequency': ['wave', C.stone],
  'second-mind': ['nested', C.surface],
};

const SIZES = {
  cover: [1600, 2000], // 4:5
  wide: [2400, 1600], // 3:2
  detail: [1600, 1600], // 1:1
};

const jobs = [];
for (const [name, [comp, ground]] of Object.entries(PROJECTS)) {
  for (const [variant, [w, h]] of Object.entries(SIZES)) {
    const bg = variant === 'detail' ? C.ink : ground;
    const palette = variant === 'detail' ? { ...C, ink: C.canvas, mid: C.muted } : C;
    const body = COMPOSITIONS[comp](w, h, palette);
    const file = join(out, `${name}-${variant}.png`);
    jobs.push(
      sharp(Buffer.from(svg(w, h, body, bg)))
        .png({ compressionLevel: 9, palette: true })
        .toFile(file),
    );
  }
}

// Social / Open Graph card.
jobs.push(
  sharp(Buffer.from(svg(1200, 630, COMPOSITIONS.horizon(1200, 630, C), C.canvas)))
    .png({ compressionLevel: 9, palette: true })
    .toFile(join(out, 'og-default.png')),
);

await Promise.all(jobs);
console.log(`placeholders: ${jobs.length} images → src/assets/placeholders/`);
