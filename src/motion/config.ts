/**
 * Motion config — mirrors the CSS motion tokens into JS.
 *
 * Durations, easings, distances and stagger are defined ONCE in
 * src/styles/tokens/semantic.css. This module reads them from the computed
 * style of <html>, so GSAP tweens and CSS transitions always share the same
 * values. Easing tokens are CSS cubic-bezier() curves; they are turned into
 * GSAP ease functions with a small solver, so the curve is identical.
 */

type DurName = 'instant' | 'hover' | 'fast' | 'medium' | 'base' | 'slow' | 'slower';
type EaseName = 'out' | 'standard' | 'in-out' | 'linear';
type DistanceName = 'distance' | 'nudge';

const cache = new Map<string, unknown>();

function readVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function memo<T>(key: string, make: () => T): T {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key) as T;
}

/** "600ms" | "0.6s" → seconds */
function toSeconds(value: string, fallback: number): number {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return fallback;
  return value.endsWith('ms') ? n / 1000 : n;
}

/** "1.5rem" | "24px" → px */
function toPx(value: string, fallback: number): number {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return fallback;
  if (value.endsWith('rem') || value.endsWith('em')) {
    return n * parseFloat(getComputedStyle(document.documentElement).fontSize);
  }
  return n;
}

/**
 * cubic-bezier(x1, y1, x2, y2) → easing function t ∈ [0,1] → progress.
 * Newton–Raphson with a bisection fallback (same approach browsers use).
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveX = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) return t;
      const d = slopeX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    while (lo < hi) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-6) return t;
      if (x > v) lo = t;
      else hi = t;
      t = (hi - lo) / 2 + lo;
      if (hi - lo < 1e-6) break;
    }
    return t;
  };

  return (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : sampleY(solveX(t)));
}

function parseEase(value: string): (t: number) => number {
  const m = value.match(/cubic-bezier\(([^)]+)\)/);
  if (!m) return (t) => t;
  const [x1, y1, x2, y2] = m[1]!.split(',').map((v) => parseFloat(v));
  return cubicBezier(x1 ?? 0, y1 ?? 0, x2 ?? 1, y2 ?? 1);
}

export const motion = {
  /** Duration token in seconds: motion.dur('base') ← --dur-base */
  dur(name: DurName): number {
    return memo(`dur-${name}`, () => toSeconds(readVar(`--dur-${name}`), 0.6));
  },
  /** Easing token as a GSAP-compatible function ← --ease-<name> */
  ease(name: EaseName): (t: number) => number {
    return memo(`ease-${name}`, () => parseEase(readVar(`--ease-${name}`)));
  },
  /** Distance token in px ← --motion-distance / --motion-nudge */
  px(name: DistanceName): number {
    return memo(`px-${name}`, () => toPx(readVar(`--motion-${name}`), 16));
  },
  /** Stagger between items, seconds ← --stagger */
  stagger(): number {
    return memo('stagger', () => parseFloat(readVar('--stagger')) || 0.06);
  },
  /** Parallax travel as a fraction (0.06 = 6%) ← --parallax-amount */
  parallax(): number {
    return memo('parallax', () => (parseFloat(readVar('--parallax-amount')) || 6) / 100);
  },
  /** Starting scale for media reveals ← --media-settle-scale */
  settleScale(): number {
    return memo('settle', () => parseFloat(readVar('--media-settle-scale')) || 1.06);
  },
  /** Forget cached values (tokens may differ after a page swap). */
  reset(): void {
    cache.clear();
  },
};

export type Motion = typeof motion;
