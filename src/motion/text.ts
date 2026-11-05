/**
 * Headline reveals: lines slide up out of a mask, one after another.
 *
 * Persian (any Arabic-script text) is NEVER split into characters — that
 * breaks letter joining. Only lines (and the words SplitText uses to find
 * them) are ever created, for every language.
 */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { motion } from './config';

gsap.registerPlugin(SplitText);

export function revealLines(el: HTMLElement): void {
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'rz-line',
    autoSplit: true,
    aria: 'auto',
    onSplit(self: SplitText) {
      gsap.set(el, { visibility: 'visible' });
      return gsap.from(self.lines, {
        yPercent: 110,
        duration: motion.dur('slow'),
        ease: motion.ease('out'),
        stagger: motion.stagger() * 1.5,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    },
  });
}
