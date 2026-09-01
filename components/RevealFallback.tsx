"use client";

import { useEffect } from "react";

export function RevealFallback() {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const hasViewTimeline =
      typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()");

    if (reduceMotion || hasViewTimeline) {
      return;
    }

    const revealItems = document.querySelectorAll(
      ".features-grid > *, .section-head, .split > *, .service-card, .gallery-carousel, .contact-layout > *"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const el = entry.target as HTMLElement;
          const siblings = [...el.parentElement!.children].filter((child) =>
            [...revealItems].includes(child)
          );
          const index = Math.max(0, siblings.indexOf(el));
          el.style.transitionDelay = `${Math.min(index, 7) * 80}ms`;
          requestAnimationFrame(() => {
            el.classList.add("is-visible");
          });
          observer.unobserve(el);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );

    const frame = requestAnimationFrame(() => {
      revealItems.forEach((el) => observer.observe(el));
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return null;
}
