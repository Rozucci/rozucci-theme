/**
 * Gentle parallax on media only: the inner layer of a MediaFrame
 * (data-parallax) drifts a few percent while the frame crosses the viewport.
 * The frame has extra bleed (--parallax-amount) so no edge ever shows.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from './config';

gsap.registerPlugin(ScrollTrigger);

export function initParallax(root: ParentNode = document): void {
  const travel = motion.parallax() * 100 * 0.8; // stay inside the bleed
  root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((inner) => {
    const frame = inner.closest('.media__frame') ?? inner;
    gsap.fromTo(
      inner,
      { yPercent: -travel / 2 },
      {
        yPercent: travel / 2,
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}
