/**
 * Page transitions — the view-transition crossfade itself is CSS (motion.css);
 * this drives the thin line that wipes across the top while the next page
 * loads. The line element persists across swaps (transition:persist).
 */
import { gsap } from 'gsap';
import { motion } from './config';

let bound = false;

export function bindPageLine(): void {
  if (bound) return;
  bound = true;

  document.addEventListener('astro:before-preparation', () => {
    const line = document.querySelector<HTMLElement>('[data-page-line]');
    if (!line || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.killTweensOf(line);
    gsap.fromTo(line, { scaleX: 0, autoAlpha: 1 }, { scaleX: 0.7, duration: motion.dur('base'), ease: motion.ease('out') });
  });

  document.addEventListener('astro:after-swap', () => {
    const line = document.querySelector<HTMLElement>('[data-page-line]');
    if (!line) return;
    gsap.to(line, {
      scaleX: 1,
      duration: motion.dur('fast'),
      ease: motion.ease('standard'),
      onComplete: () => {
        gsap.to(line, { autoAlpha: 0, duration: motion.dur('fast'), ease: motion.ease('standard') });
      },
    });
  });
}
