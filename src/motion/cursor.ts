/**
 * Desktop-only cursor label — "[ VIEW ]" follows the pointer over elements
 * with data-cursor. Hidden from assistive tech; never shown on touch.
 */
import { gsap } from 'gsap';
import { motion } from './config';

export function initCursor(): () => void {
  const label = document.querySelector<HTMLElement>('[data-cursor-label]');
  if (!label) return () => {};

  gsap.set(label, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.9 });
  const x = gsap.quickTo(label, 'x', { duration: motion.dur('medium'), ease: motion.ease('out') });
  const y = gsap.quickTo(label, 'y', { duration: motion.dur('medium'), ease: motion.ease('out') });
  let active = false;

  const show = (on: boolean) => {
    if (on === active) return;
    active = on;
    gsap.to(label, {
      autoAlpha: on ? 1 : 0,
      scale: on ? 1 : 0.9,
      duration: motion.dur('fast'),
      ease: motion.ease('standard'),
      overwrite: 'auto',
    });
  };

  const move = (e: PointerEvent) => {
    x(e.clientX);
    y(e.clientY);
    show(!!(e.target as Element | null)?.closest?.('[data-cursor]'));
  };
  const leave = () => show(false);

  window.addEventListener('pointermove', move, { passive: true });
  document.documentElement.addEventListener('pointerleave', leave);
  return () => {
    window.removeEventListener('pointermove', move);
    document.documentElement.removeEventListener('pointerleave', leave);
    gsap.killTweensOf(label);
  };
}
