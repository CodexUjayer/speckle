"use client";

/**
 * Shared GSAP choreography for the in-flow sections: a restrained parallax
 * drift on full-bleed imagery and a quiet staggered reveal for content.
 * Everything is disabled under prefers-reduced-motion.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Attach cinematic scroll behaviour to a section. Returns a cleanup fn. */
export function cinematify(section: HTMLElement): () => void {
  if (prefersReducedMotion()) return () => undefined;

  const ctx = gsap.context(() => {
    const bg = section.querySelector<HTMLElement>("[data-parallax]");
    if (bg) {
      gsap.fromTo(
        bg,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );
    }
    const items = section.querySelectorAll<HTMLElement>("[data-reveal]");
    if (items.length) {
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.95,
          stagger: 0.09,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 60%",
          },
        },
      );
    }
  }, section);

  return () => ctx.revert();
}
