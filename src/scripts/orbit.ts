/**
 * Orbit dashboard — browser side.
 *
 * Moves "now" to the real date, restores ticks from localStorage and keeps
 * every counter, bar and status in sync. All markup already exists (rendered
 * at build time); this file only toggles state, so the page works and reads
 * fine without it.
 */
import { ITEMS, PHASES, TARGETS } from '../data/orbit';
import {
  MILESTONES,
  PUBLICATIONS,
  WEEKS,
  blocksFor,
  daysOf,
  daysToYalda,
  day,
  iso,
  phaseRange,
  progressThrough,
  seasonProgress,
  weekOf,
  workday,
} from '../lib/orbit';
import { safeStorage } from './lifecycle';

const KEY = 'rz-orbit-1405';

interface State {
  items: Record<string, boolean>;
  blocks: Record<string, boolean>;
}

export function initOrbit(): void {
  const root = document.querySelector<HTMLElement>('[data-orbit]');
  if (!root) return;

  const lang = root.dataset.lang ?? 'en';
  const locale = (root.dataset.locale ?? 'en') as 'fa' | 'en';
  const dateTag = lang.startsWith('fa') ? 'fa-IR-u-ca-persian' : lang;
  const nf = new Intl.NumberFormat(lang);
  const pf = new Intl.NumberFormat(lang, { style: 'percent', maximumFractionDigits: 0 });
  const df = new Intl.DateTimeFormat(dateTag, { weekday: 'long', day: 'numeric', month: 'long' });
  const dm = new Intl.DateTimeFormat(dateTag, { day: 'numeric', month: 'long' });

  const today = workday();
  const todayIso = iso(today);
  const current = weekOf(today);
  let shown = current.n;

  const state: State = safeStorage.get<State>(KEY, { items: {}, blocks: {} });
  state.items ??= {};
  state.blocks ??= {};

  const $ = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel);
  const $$ = <T extends Element = HTMLElement>(sel: string) => [...root.querySelectorAll<T>(sel)];
  const setText = (sel: string, text: string) => {
    const el = $(sel);
    if (el) el.textContent = text;
  };

  /* ---------------- items ---------------- */
  const syncItems = () => {
    $$<HTMLInputElement>('input[data-item]').forEach((input) => {
      input.checked = !!state.items[input.dataset.item!];
    });
  };

  root.addEventListener('change', (e) => {
    const input = (e.target as Element).closest<HTMLInputElement>('input[data-item]');
    if (!input) return;
    state.items[input.dataset.item!] = input.checked;
    safeStorage.set(KEY, state);
    syncItems();
    update();
  });

  /* ---------------- blocks ---------------- */
  const syncBlocks = () => {
    $$<HTMLButtonElement>('button[data-block]').forEach((btn) => {
      const key = btn.dataset.block!;
      const dateKey = key.split(':')[0]!;
      btn.setAttribute('aria-pressed', String(!!state.blocks[key]));
      btn.disabled = dateKey > todayIso;
    });
    $$<HTMLTableRowElement>('tr[data-day]').forEach((row) => {
      row.classList.toggle('is-today', row.dataset.day === todayIso);
    });
  };

  root.addEventListener('click', (e) => {
    const target = e.target as Element;
    const block = target.closest<HTMLButtonElement>('button[data-block]');
    if (block && !block.disabled) {
      const key = block.dataset.block!;
      state.blocks[key] = !state.blocks[key];
      safeStorage.set(KEY, state);
      syncBlocks();
      update();
      return;
    }
    const step = target.closest<HTMLButtonElement>('[data-week-step]');
    if (step) {
      showWeek(shown + Number(step.dataset.weekStep));
      return;
    }
    if (target.closest('[data-orbit-reset]')) {
      state.items = {};
      state.blocks = {};
      safeStorage.remove(KEY);
      syncItems();
      syncBlocks();
      update();
    }
  });

  /* ---------------- week navigator ---------------- */
  const showWeek = (n: number) => {
    shown = Math.max(0, Math.min(WEEKS.length - 1, n));
    $$('[data-week-panel]').forEach((panel) => {
      panel.hidden = Number(panel.dataset.weekPanel) !== shown;
    });
    setText('[data-week-nav-code]', WEEKS[shown]!.code);
    const [prev, next] = $$<HTMLButtonElement>('[data-week-step]');
    if (prev) prev.disabled = shown === 0;
    if (next) next.disabled = shown === WEEKS.length - 1;
  };

  /* ---------------- counters ---------------- */
  const update = () => {
    const done = ITEMS.filter((i) => state.items[i.id]).length;
    const pubs = PUBLICATIONS.filter((i) => state.items[i.id]).length;

    // Deep-work blocks scheduled up to today in the current week.
    let blocksDone = 0;
    let blocksTotal = 0;
    daysOf(current).forEach((d) => {
      const n = blocksFor(d).length;
      blocksTotal += n;
      for (let b = 1; b <= n; b++) if (state.blocks[`${iso(d)}:b${b}`]) blocksDone++;
    });
    const blockRatio = blocksTotal ? blocksDone / blocksTotal : 0;

    setText('[data-stat="days"]', nf.format(daysToYalda(today)));
    setText('[data-today]', df.format(today));
    setText('[data-stat="week-code"]', current.code);
    setText(
      '[data-stat="week-name"]',
      current.n === 13 ? root.dataset.labelYalda ?? '' : `${root.dataset.labelWeek} ${nf.format(current.n)}`,
    );
    const phase = PHASES.find((p) => p.key === current.phase)!;
    const range = phaseRange(current.phase);
    setText('[data-stat="phase"]', phase.name[locale]);
    setText('[data-stat="phase-range"]', `${dm.format(range.start)} — ${dm.format(range.end)}`);
    setText('[data-stat="done"]', nf.format(done));
    setText('[data-stat="pubs"]', nf.format(pubs));
    setText('[data-stat="pubs-2"]', nf.format(pubs));
    setText('[data-stat="done-pct"]', pf.format(done / ITEMS.length));
    setText('[data-stat="blocks-pct"]', pf.format(blockRatio));
    setText('[data-stat="season-pct"]', pf.format(seasonProgress(today)));
    setText(
      '[data-stat="blocks-status"]',
      blockRatio >= TARGETS.blocksWeekly
        ? root.dataset.labelOnTrack ?? ''
        : blockRatio >= TARGETS.blocksWarn
          ? root.dataset.labelClose ?? ''
          : root.dataset.labelLighten ?? '',
    );

    const seasonBar = $('[data-stat-bar="season"]');
    seasonBar?.style.setProperty('--p', String(seasonProgress(today)));

    // Phase cards: dot position follows time.
    $$('[data-phase-card]').forEach((card) => {
      const p = progressThrough(day(card.dataset.start!), day(card.dataset.end!), today);
      card.style.setProperty('--notch-progress', String(p));
    });

    // Week rows: done count, bar, "now" marker.
    WEEKS.forEach((w) => {
      const items = ITEMS.filter((i) => i.week === w.n);
      const d = items.filter((i) => state.items[i.id]).length;
      setText(`[data-week-done="${w.n}"]`, nf.format(d));
      $(`[data-week-bar="${w.n}"]`)?.style.setProperty('--p', String(items.length ? d / items.length : 0));
      const row = $(`[data-week-row="${w.n}"]`);
      if (row) row.toggleAttribute('data-now', w.n === current.n);
    });

    // Milestones.
    MILESTONES.forEach((m) => {
      const cell = $(`[data-milestone-status="${m.id}"]`);
      if (!cell) return;
      const isDone = !!state.items[m.id];
      cell.querySelector<HTMLElement>('[data-when="open"]')!.hidden = isDone;
      cell.querySelector<HTMLElement>('[data-when="done"]')!.hidden = !isDone;
    });
  };

  syncItems();
  syncBlocks();
  showWeek(current.n);
  update();
}
