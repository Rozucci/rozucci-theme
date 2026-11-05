/**
 * Run a function on every page load — the initial one and every view
 * transition — whether or not the ClientRouter is enabled.
 */
export function onPageLoad(fn: () => void): void {
  const routed = document.querySelector('meta[name="astro-view-transitions-enabled"]');
  if (routed) {
    document.addEventListener('astro:page-load', fn);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

/** Run once before the current page is swapped out by a view transition. */
export function onBeforeSwap(fn: () => void): void {
  document.addEventListener('astro:before-swap', fn, { once: true });
}

/** localStorage that never throws (private mode, blocked storage). */
export const safeStorage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — state lasts for this page view */
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
