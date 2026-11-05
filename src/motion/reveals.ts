/**
 * Scroll reveals — precise, calm, mechanical. Transform / opacity /
 * clip-path only.
 *   .section            top hairline draws in (scaleX via --draw)
 *   [data-cell-grid]    grid hairlines draw in (--cg-draw)
 *   [data-reveal=up]    fade + rise, batched with a small stagger
 *   [data-reveal=lines] headline lines (text.ts)
 *   [data-reveal=media] clip-path wipe upward + scale settle
 * Initial hidden states live in src/styles/motion.css under html.js.motion.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from './config';
import { revealLines } from './text';

gsap.registerPlugin(ScrollTrigger);

const START = 'top 88%';

/** Elements inside hidden panels are revealed instantly (no trigger). */
const inHidden = (el: Element) => !!el.closest('[hidden]');

export function initReveals(root: ParentNode = document): void {
  const out = motion.ease('out');

  root.querySelectorAll<HTMLElement>('.section:not(.section--flush)').forEach((el) => {
    gsap.fromTo(
      el,
      { '--draw': 0 },
      { '--draw': 1, duration: motion.dur('slower'), ease: out, scrollTrigger: { trigger: el, start: START, once: true } },
    );
  });

  root.querySelectorAll<HTMLElement>('[data-cell-grid]').forEach((el) => {
    if (inHidden(el)) return gsap.set(el, { '--cg-draw': 1 });
    gsap.fromTo(
      el,
      { '--cg-draw': 0 },
      { '--cg-draw': 1, duration: motion.dur('slower'), ease: out, scrollTrigger: { trigger: el, start: START, once: true } },
    );
  });

  const ups = [...root.querySelectorAll<HTMLElement>('[data-reveal="up"]')];
  gsap.set(ups.filter(inHidden), { opacity: 1, y: 0 });
  ScrollTrigger.batch(
    ups.filter((el) => !inHidden(el)),
    {
      start: START,
      once: true,
      onEnter: (batch) =>
        gsap.fromTo(
          batch,
          { opacity: 0, y: motion.px('distance') },
          { opacity: 1, y: 0, duration: motion.dur('slow'), ease: out, stagger: motion.stagger(), overwrite: true },
        ),
    },
  );

  root.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
    if (inHidden(el)) return gsap.set(el, { visibility: 'visible' });
    revealLines(el);
  });

  root.querySelectorAll<HTMLElement>('[data-reveal="media"]').forEach((fig) => {
    const frame = fig.querySelector<HTMLElement>('.media__frame');
    const img = fig.querySelector<HTMLElement>('img');
    if (!frame) return;
    if (inHidden(fig)) return gsap.set(frame, { clipPath: 'inset(0% 0% 0% 0%)' });
    const tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: START, once: true } });
    tl.fromTo(
      frame,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: motion.dur('slow'), ease: out },
    );
    if (img) {
      tl.fromTo(img, { scale: motion.settleScale() }, { scale: 1, duration: motion.dur('slower'), ease: out }, 0);
    }
  });
}

/** Reduced motion or motion off: show everything, no transitions. */
export function revealAllNow(): void {
  document.documentElement.classList.remove('motion');
}
