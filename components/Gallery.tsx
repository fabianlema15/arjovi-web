"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gallery } from "@/lib/site";

type GalleryItem = (typeof gallery)[number];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Gallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<GalleryItem | null>(null);
  const [range, setRange] = useState({
    start: 1,
    end: Math.min(4, gallery.length),
    canPrev: false,
    canNext: gallery.length > 4,
  });

  const updateRange = useCallback(() => {
    const track = trackRef.current;
    const firstItem = track?.querySelector<HTMLElement>(".gallery-item");
    if (!track || !firstItem) {
      return;
    }

    const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    const stride = firstItem.getBoundingClientRect().width + gap;
    const index = stride > 0 ? Math.round(track.scrollLeft / stride) : 0;
    const visible =
      stride > 0 ? Math.max(1, Math.round((track.clientWidth + gap) / stride)) : 1;
    const start = Math.min(index + 1, gallery.length);
    const end = Math.min(index + visible, gallery.length);

    setRange({
      start,
      end,
      canPrev: track.scrollLeft > 4,
      canNext: track.scrollLeft + track.clientWidth < track.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    updateRange();
    track.addEventListener("scroll", updateRange, { passive: true });
    const observer = new ResizeObserver(updateRange);
    observer.observe(track);
    window.addEventListener("resize", updateRange);

    return () => {
      track.removeEventListener("scroll", updateRange);
      observer.disconnect();
      window.removeEventListener("resize", updateRange);
    };
  }, [updateRange]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (active && !dialog.open) {
      const x = window.scrollX;
      const y = window.scrollY;
      dialog.showModal();
      window.scrollTo({ left: x, top: y, behavior: "auto" });
      dialog.focus({ preventScroll: true });
    } else if (!active && dialog.open) {
      dialog.close();
    }
  }, [active]);

  useEffect(() => {
    if (!active) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }

      event.preventDefault();
      const step = event.key === "ArrowLeft" ? -1 : 1;
      setActive((current) => {
        if (!current) {
          return current;
        }

        const index = gallery.findIndex((item) => item.src === current.src);
        return gallery[(index + step + gallery.length) % gallery.length];
      });
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  function scrollPage(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    track.scrollBy({
      left: direction * track.clientWidth,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  const activeIndex = active
    ? gallery.findIndex((item) => item.src === active.src)
    : -1;

  function showAt(index: number) {
    setActive(gallery[(index + gallery.length) % gallery.length]);
  }

  return (
    <>
      <div
        className="gallery-carousel"
        aria-roledescription="carousel"
        aria-label="Recent project photos"
      >
        <div className="gallery-controls">
          <p className="gallery-status" aria-live="polite">
            {range.start === range.end
              ? `${range.start} of ${gallery.length}`
              : `${range.start}–${range.end} of ${gallery.length}`}
          </p>
          <button
            className="gallery-arrow"
            type="button"
            aria-label="Previous projects"
            disabled={!range.canPrev}
            onClick={() => scrollPage(-1)}
          >
            <Chevron direction="left" />
          </button>
          <button
            className="gallery-arrow"
            type="button"
            aria-label="Next projects"
            disabled={!range.canNext}
            onClick={() => scrollPage(1)}
          >
            <Chevron direction="right" />
          </button>
        </div>

        <div className="gallery-track" ref={trackRef}>
          {gallery.map((item, index) => (
            <button
              className="gallery-item"
              type="button"
              key={item.src}
              onClick={() => setActive(item)}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading={index < 4 ? "eager" : "lazy"}
              />
              <span>{item.caption}</span>
            </button>
          ))}
        </div>
      </div>

      <dialog
        className="lightbox"
        ref={dialogRef}
        aria-label="Image preview"
        onClose={() => setActive(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setActive(null);
          }
        }}
      >
        {active ? (
          <>
            <button
              className="lightbox-close"
              type="button"
              aria-label="Close"
              onClick={() => setActive(null)}
            >
              &times;
            </button>
            <button
              className="lightbox-arrow lightbox-prev"
              type="button"
              aria-label="Previous photo"
              onClick={() => showAt(activeIndex - 1)}
            >
              <Chevron direction="left" />
            </button>
            <img src={active.src} alt={active.alt} />
            <button
              className="lightbox-arrow lightbox-next"
              type="button"
              aria-label="Next photo"
              onClick={() => showAt(activeIndex + 1)}
            >
              <Chevron direction="right" />
            </button>
            <p className="lightbox-caption">{active.caption}</p>
          </>
        ) : null}
      </dialog>
    </>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {direction === "left" ? (
        <path
          d="M14.5 6.5 9 12l5.5 5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M9.5 6.5 15 12l-5.5 5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
