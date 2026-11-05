/**
 * Generic grid filter (work index, shop). Toggles items by key; animates with
 * GSAP Flip (loaded on demand) when motion is enabled and allowed. A query
 * parameter (bar's data-param) preselects and records the active filter.
 */
import { site } from '../site.config';

export function initFilter(): void {
  const bar = document.querySelector<HTMLElement>('[data-filter-bar]');
  const grid = document.querySelector<HTMLElement>('[data-filter-grid]');
  if (!bar || !grid) return;

  const param = bar.dataset.param ?? 'f';
  const items = [...grid.querySelectorAll<HTMLElement>('[data-filter-item]')];
  const status = document.querySelector<HTMLElement>('[data-filter-status]');
  const buttons = [...bar.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const keys = buttons.map((b) => b.dataset.filter!);
  const nf = new Intl.NumberFormat(status?.dataset.lang === 'fa' ? 'fa-IR' : 'en');

  const apply = async (key: string, animate: boolean) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === key)));
    const toggle = () =>
      items.forEach((el) => el.classList.toggle('is-out', key !== 'all' && el.dataset.filterKey !== key));

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (animate && site.motion.flipFilter && !reduce) {
      const { flipFilter } = await import('../motion/flip');
      flipFilter(items, toggle);
    } else {
      toggle();
    }

    const visible = items.filter((el) => !el.classList.contains('is-out')).length;
    if (status) status.textContent = `${nf.format(visible)} ${status.dataset.label ?? ''}`;

    const url = new URL(window.location.href);
    if (key === 'all') url.searchParams.delete(param);
    else url.searchParams.set(param, key);
    history.replaceState(history.state, '', url);
  };

  bar.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('[data-filter]');
    if (btn) void apply(btn.dataset.filter!, true);
  });

  const initial = new URL(window.location.href).searchParams.get(param);
  if (initial && keys.includes(initial)) void apply(initial, false);
}
