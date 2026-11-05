/**
 * Orbit date logic, shared by the page (build time) and the browser (live).
 * Pure functions — no DOM.
 */
import { BLOCKS, ITEMS, PHASES, SEASON, type PhaseKey } from '../data/orbit';

const DAY = 86_400_000;

/** Parse an ISO date as local noon (avoids DST/timezone edge cases). */
export function day(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!, 12);
}

export function iso(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${date.getFullYear()}-${m < 10 ? '0' : ''}${m}-${d < 10 ? '0' : ''}${d}`;
}

export function addDays(date: Date, n: number): Date {
  const r = new Date(date);
  r.setDate(r.getDate() + n);
  return r;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY);
}

/** "Today" for a night worker: before the rollover hour it is still yesterday. */
export function workday(now = new Date()): Date {
  const base = now.getHours() < SEASON.dayRolloverHour ? addDays(now, -1) : now;
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), 12);
}

export interface Week {
  n: number;
  /** Latin code: W00 … W12, YL for Yalda. */
  code: string;
  phase: PhaseKey;
  start: Date;
  end: Date;
}

export const WEEKS: Week[] = (() => {
  const weeks: Week[] = [];
  const phaseOf = (n: number) => PHASES.find((p) => p.weeks.includes(n))!.key;
  weeks.push({ n: 0, code: 'W00', phase: phaseOf(0), start: day(SEASON.start), end: addDays(day(SEASON.week1), -1) });
  for (let i = 1; i <= SEASON.weeks; i++) {
    const start = addDays(day(SEASON.week1), 7 * (i - 1));
    weeks.push({ n: i, code: `W${String(i).padStart(2, '0')}`, phase: phaseOf(i), start, end: addDays(start, 6) });
  }
  weeks.push({ n: 13, code: 'YL', phase: 'review', start: day(SEASON.reviewStart), end: day(SEASON.yalda) });
  return weeks;
})();

export function weekOf(date: Date): Week {
  if (date < WEEKS[0]!.start) return WEEKS[0]!;
  return WEEKS.find((w) => date >= w.start && date <= w.end) ?? WEEKS[WEEKS.length - 1]!;
}

export function daysOf(week: Week): Date[] {
  const out: Date[] = [];
  for (let d = new Date(week.start); d <= week.end; d = addDays(d, 1)) out.push(new Date(d));
  return out;
}

export function phaseRange(key: PhaseKey): { start: Date; end: Date } {
  const weeks = WEEKS.filter((w) => w.phase === key);
  return { start: weeks[0]!.start, end: weeks[weeks.length - 1]!.end };
}

/** Time progress through a range, 0…1. */
export function progressThrough(start: Date, end: Date, at: Date): number {
  const total = end.getTime() - start.getTime();
  if (total <= 0) return at >= end ? 1 : 0;
  return Math.min(1, Math.max(0, (at.getTime() - start.getTime()) / total));
}

export function seasonProgress(at: Date): number {
  return progressThrough(day(SEASON.start), day(SEASON.yalda), at);
}

export function daysToYalda(at: Date): number {
  return Math.max(0, daysBetween(at, day(SEASON.yalda)));
}

/** Blocks scheduled on a date: [] on floating days (Friday). */
export function blocksFor(date: Date) {
  const week = weekOf(date);
  const blocks = BLOCKS[date.getDay()] ?? [];
  // From week 9 the Tuesday first block moves to LoggingLife.
  if (date.getDay() === 2 && week.n >= 9 && blocks.length) {
    return [['ll'] as const, blocks[1]!];
  }
  return blocks;
}

export function itemsOfWeek(n: number) {
  return ITEMS.filter((i) => i.week === n);
}

export const PUBLICATIONS = ITEMS.filter((i) => i.id.startsWith('pub-'));
export const MILESTONES = ITEMS.filter((i) => i.due || i.tag);
