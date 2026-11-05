/**
 * Motion lifecycle.
 *
 *   astro:page-load   → init: Lenis, reveals, parallax, cursor (per flags)
 *   astro:before-swap → cleanup: revert the matchMedia context (kills every
 *                       ScrollTrigger, reverts SplitText), destroy Lenis
 *
 * Every feature can be switched off in src/site.config.ts → motion.
 * prefers-reduced-motion: no Lenis, no parallax, no reveals, no cursor.
 * Hook for WebGL later: see src/motion/webgl/README.md.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { site } from '../site.config';
import { motion } from './config';
import { startLenis, stopLenis } from './lenis';
import { initReveals, revealAllNow } from './reveals';
import { initParallax } from './parallax';
import { initCursor } from './cursor';
import { bindPageLine } from './transitions';

gsap.registerPlugin(ScrollTrigger);

type MotionWindow = Window & { __rzMotionReady?: boolean; __rzMotionTimer?: number };
const w = window as MotionWindow;
const flags = site.motion;

let mm: gsap.MatchMedia | null = null;

function init() {
  cleanup();
  motion.reset();
  mm = gsap.matchMedia();
  mm.add(
    {
      reduce: '(prefers-reduced-motion: reduce)',
      fine: '(hover: hover) and (pointer: fine)',
    },
    (ctx) => {
      const { reduce, fine } = ctx.conditions as { reduce: boolean; fine: boolean };
      if (reduce) {
        revealAllNow();
        return;
      }
      if (flags.smoothScroll && fine) startLenis();
      if (flags.reveals) initReveals();
      else revealAllNow();
      if (flags.parallax) initParallax();
      const stopCursor = flags.cursorLabel && fine ? initCursor() : () => {};
      return () => {
        stopCursor();
        stopLenis();
      };
    },
  );
  // Fonts change line breaks and heights: recalc trigger positions once.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  w.__rzMotionReady = true;
  clearTimeout(w.__rzMotionTimer);
}

function cleanup() {
  mm?.revert();
  mm = null;
  stopLenis();
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

if (flags.pageTransitions) bindPageLine();

if (document.querySelector('meta[name="astro-view-transitions-enabled"]')) {
  document.addEventListener('astro:page-load', init);
  document.addEventListener('astro:before-swap', cleanup);
} else {
  init();
}
