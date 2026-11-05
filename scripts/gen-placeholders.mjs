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

// ------------------------------------------------------------------------
// Product still lifes: a two-tone pastel set (wall + floor), one object, a
// flat hard shadow. Media carries the colour; the UI stays neutral.
// ------------------------------------------------------------------------
const P = {
  blush: '#efd6d2', blushFloor: '#e4c3be',
  sky: '#cfe0ea', skyFloor: '#b9d0dd',
  butter: '#f1e3b5', butterFloor: '#e6d297',
  mint: '#d3e4d4', mintFloor: '#bfd6c1',
  lilac: '#ddd5ea', lilacFloor: '#cbc0de',
  sand: '#e9dfd0', sandFloor: '#dccdb8',
  shadow: 'rgba(20,20,19,0.16)',
};

const set = (w, h, wall, floor, horizon = 0.72) =>
  `<rect width="${w}" height="${h * horizon}" fill="${wall}"/><rect y="${h * horizon}" width="${w}" height="${h * (1 - horizon)}" fill="${floor}"/>`;

const STILL = {
  // Framed print hanging on the wall.
  print: (w, h) => {
    const fw = w * 0.5, fh = fw * 1.25, x = (w - fw) / 2, y = h * 0.16;
    return set(w, h, P.blush, P.blushFloor) +
      `<rect x="${x + w * 0.03}" y="${y + w * 0.03}" width="${fw}" height="${fh}" fill="${P.shadow}"/>` +
      `<rect x="${x}" y="${y}" width="${fw}" height="${fh}" fill="${C.ink}"/>` +
      `<rect x="${x + fw * 0.04}" y="${y + fw * 0.04}" width="${fw * 0.92}" height="${fh - fw * 0.08}" fill="${C.canvas}"/>` +
      `<rect x="${x + fw * 0.16}" y="${y + fw * 0.16}" width="${fw * 0.68}" height="${fh - fw * 0.32}" fill="${C.surface}"/>` +
      `<circle cx="${w / 2}" cy="${y + fh * 0.48}" r="${fw * 0.17}" fill="${C.ink}"/>` +
      `<ellipse cx="${w / 2}" cy="${y + fh * 0.48}" rx="${fw * 0.27}" ry="${fw * 0.04}" fill="none" stroke="${C.clay}" stroke-width="${w * 0.004}"/>`;
  },
  // Canvas leaning against the wall.
  original: (w, h) => {
    const cw = w * 0.52, ch = cw * 1.3, x = w * 0.26, y = h * 0.72 - ch + h * 0.06;
    return set(w, h, P.sand, P.sandFloor) +
      `<polygon points="${x + cw},${y} ${x + cw + w * 0.035},${y + h * 0.01} ${x + cw + w * 0.035},${y + ch + h * 0.01} ${x + cw},${y + ch}" fill="${C.muted}"/>` +
      `<rect x="${x + w * 0.05}" y="${y + ch}" width="${cw}" height="${h * 0.035}" fill="${P.shadow}"/>` +
      `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="#1d2b3a"/>` +
      `<circle cx="${x + cw * 0.5}" cy="${y + ch * 0.45}" r="${cw * 0.24}" fill="#0e151d"/>` +
      `<circle cx="${x + cw * 0.5}" cy="${y + ch * 0.45}" r="${cw * 0.33}" fill="none" stroke="${C.clay}" stroke-width="${w * 0.005}"/>` +
      `<circle cx="${x + cw * 0.72}" cy="${y + ch * 0.2}" r="${cw * 0.025}" fill="${C.canvas}"/>`;
  },
  // A fan of colour-grade chips (LUT pack).
  preset: (w, h) => {
    const colors = ['#2b3a4a', '#6a9bcc', '#d97757', '#e6c27a', '#788c5d'];
    const cw = w * 0.3, ch = cw * 1.45, cx = w / 2, cy = h * 0.62;
    return set(w, h, P.sky, P.skyFloor, 0.66) +
      `<ellipse cx="${cx}" cy="${cy + ch * 0.45}" rx="${w * 0.3}" ry="${h * 0.025}" fill="${P.shadow}"/>` +
      colors.map((c, i) => {
        const a = (i - 2) * 11;
        return `<g transform="rotate(${a} ${cx} ${cy + ch * 0.4})"><rect x="${cx - cw / 2}" y="${cy - ch * 0.6}" width="${cw}" height="${ch}" fill="${C.canvas}"/><rect x="${cx - cw / 2 + cw * 0.08}" y="${cy - ch * 0.6 + cw * 0.08}" width="${cw * 0.84}" height="${ch * 0.62}" fill="${c}"/></g>`;
      }).join('');
  },
  // Vinyl record sliding out of its sleeve.
  sound: (w, h) => {
    const s = w * 0.5, x = w * 0.18, y = h * 0.24;
    return set(w, h, P.mint, P.mintFloor) +
      `<rect x="${x + w * 0.03}" y="${y + w * 0.03}" width="${s}" height="${s}" fill="${P.shadow}"/>` +
      `<circle cx="${x + s * 0.82}" cy="${y + s / 2}" r="${s * 0.47}" fill="${C.ink}"/>` +
      range(6).map((i) => `<circle cx="${x + s * 0.82}" cy="${y + s / 2}" r="${s * (0.2 + i * 0.045)}" fill="none" stroke="#2a2a28" stroke-width="${w * 0.0015}"/>`).join('') +
      `<circle cx="${x + s * 0.82}" cy="${y + s / 2}" r="${s * 0.12}" fill="${C.clay}"/>` +
      `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${C.stone}"/>` +
      `<rect x="${x + s * 0.1}" y="${y + s * 0.1}" width="${s * 0.8}" height="${s * 0.8}" fill="none" stroke="${C.ink}" stroke-width="${w * 0.002}"/>` +
      range(16).map((i) => `<rect x="${x + s * 0.18 + i * s * 0.04}" y="${y + s * 0.5 - s * (0.05 + Math.abs(Math.sin(i)) * 0.18) / 2}" width="${s * 0.018}" height="${s * (0.05 + Math.abs(Math.sin(i)) * 0.18)}" fill="${C.ink}"/>`).join('');
  },
  // Open notebook spread with a grid (template).
  template: (w, h) => {
    const bw = w * 0.7, bh = bw * 0.62, x = (w - bw) / 2, y = h * 0.5;
    const grid = range(8).map((i) => `<rect x="${x + bw * 0.55 + (i % 4) * bw * 0.095}" y="${y + bh * 0.14 + Math.floor(i / 4) * bh * 0.2}" width="${bw * 0.08}" height="${bh * 0.16}" fill="${i === 5 ? C.olive : C.surface}" stroke="${C.ink}" stroke-width="${w * 0.0015}"/>`).join('');
    return set(w, h, P.lilac, P.lilacFloor, 0.6) +
      `<rect x="${x + w * 0.025}" y="${y + w * 0.025}" width="${bw}" height="${bh}" fill="${P.shadow}"/>` +
      `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${C.canvas}"/>` +
      `<rect x="${x + bw / 2 - w * 0.001}" y="${y}" width="${w * 0.002}" height="${bh}" fill="${C.line}"/>` +
      range(7).map((i) => `<rect x="${x + bw * 0.07}" y="${y + bh * (0.16 + i * 0.1)}" width="${bw * (i % 3 === 0 ? 0.3 : 0.36)}" height="${w * 0.004}" fill="${C.mid}"/>`).join('') +
      grid;
  },
  // A zine, slightly turned, on a butter ground.
  zine: (w, h) => {
    const zw = w * 0.44, zh = zw * 1.35, cx = w / 2, cy = h * 0.5;
    return set(w, h, P.butter, P.butterFloor, 0.7) +
      `<g transform="rotate(-6 ${cx} ${cy})">` +
      `<rect x="${cx - zw / 2 + w * 0.03}" y="${cy - zh / 2 + w * 0.03}" width="${zw}" height="${zh}" fill="${P.shadow}"/>` +
      `<rect x="${cx - zw / 2}" y="${cy - zh / 2}" width="${zw}" height="${zh}" fill="${C.canvas}"/>` +
      range(5).map((i) => `<rect x="${cx - zw / 2 + (i + 1) * zw / 6}" y="${cy - zh / 2 + zh * 0.12}" width="${w * 0.0015}" height="${zh * 0.6}" fill="${C.ink}"/>`).join('') +
      range(4).map((i) => `<rect x="${cx - zw / 2 + zw / 6}" y="${cy - zh / 2 + zh * (0.12 + i * 0.2)}" width="${zw * 4 / 6}" height="${w * 0.0015}" fill="${C.ink}"/>`).join('') +
      `<rect x="${cx - zw / 2 + zw * 2 / 6}" y="${cy - zh / 2 + zh * 0.32}" width="${zw / 6}" height="${zh * 0.2}" fill="${C.sky}"/>` +
      `<rect x="${cx - zw / 2 + zw / 6}" y="${cy + zh * 0.36}" width="${zw * 0.4}" height="${zh * 0.025}" fill="${C.ink}"/>` +
      `</g>`;
  },
};

for (const [name, draw] of Object.entries(STILL)) {
  for (const [variant, [w, h]] of Object.entries({ main: [1600, 2000], alt: [1600, 1600] })) {
    jobs.push(
      sharp(Buffer.from(svg(w, h, draw(w, h), C.canvas)))
        .png({ compressionLevel: 9, palette: true })
        .toFile(join(out, `product-${name}-${variant}.png`)),
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
