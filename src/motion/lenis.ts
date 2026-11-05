/**
 * Lenis smooth scrolling, driven by the GSAP ticker and synced with
 * ScrollTrigger. Wheel only — touch keeps native scrolling (syncTouch off).
 * Destroyed before every view-transition swap and recreated after it.
 */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let lenis: Lenis | null = null;

const raf = (time: number) => lenis?.raf(time * 1000);

export function startLenis(): Lenis {
  stopLenis();
  lenis = new Lenis({
    autoRaf: false,
    smoothWheel: true,
    syncTouch: false,
    anchors: true,
    lerp: 0.12,
    // Never hijack scrolling inside horizontal strips or form controls.
    prevent: (node) => !!node.closest?.('.scroll-x, [data-gallery-track], input, textarea, select'),
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function stopLenis(): void {
  if (!lenis) return;
  gsap.ticker.remove(raf);
  lenis.destroy();
  lenis = null;
}

export function getLenis(): Lenis | null {
  return lenis;
}
