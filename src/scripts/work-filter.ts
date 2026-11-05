/**
 * Work index filter. Toggles cells by discipline; animates with GSAP Flip
 * (loaded on demand) when motion is enabled and allowed.
 */
import { site } from '../site.config';

export function initWorkFilter(): void {
  const bar = document.querySelector<HTMLElement>('[data-work-filters]');
  const grid = document.querySelector<HTMLElement>('[data-work-grid]');
  if (!bar || !grid) return;

  const items = [...grid.querySelectorAll<HTMLElement>('[data-flip-item]')];
  const status = document.querySelector<HTMLElement>('[data-work-status]');
  const buttons = [...bar.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const keys = buttons.map((b) => b.dataset.filter!);
  const nf = new Intl.NumberFormat(status?.dataset.lang === 'fa' ? 'fa-IR' : 'en');

  const apply = async (key: string, animate: boolean) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === key)));
    const toggle = () =>
      items.forEach((el) => el.classList.toggle('is-out', key !== 'all' && el.dataset.discipline !== key));

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
    if (key === 'all') url.searchParams.delete('d');
    else url.searchParams.set('d', key);
    history.replaceState(history.state, '', url);
  };

  bar.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('[data-filter]');
    if (btn) void apply(btn.dataset.filter!, true);
  });

  const initial = new URL(window.location.href).searchParams.get('d');
  if (initial && keys.includes(initial)) void apply(initial, false);
}
