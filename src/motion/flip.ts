/**
 * Flip transition for filtering a grid. Loaded on demand by the work index.
 * Durations and easing come from the CSS motion tokens.
 */
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { motion } from './config';

gsap.registerPlugin(Flip);

export function flipFilter(items: HTMLElement[], change: () => void): void {
  const state = Flip.getState(items, { props: 'opacity' });
  change();
  Flip.from(state, {
    duration: motion.dur('base'),
    ease: motion.ease('out'),
    absolute: true,
    nested: true,
    prune: true,
    onEnter: (els) =>
      gsap.fromTo(els, { opacity: 0, y: motion.px('nudge') }, { opacity: 1, y: 0, duration: motion.dur('base'), ease: motion.ease('out') }),
    onLeave: (els) => gsap.to(els, { opacity: 0, duration: motion.dur('fast'), ease: motion.ease('standard') }),
  });
}
