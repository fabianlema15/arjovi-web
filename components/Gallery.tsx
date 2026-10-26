"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PortfolioProjectPublic } from "@/lib/portfolio";

type Props = {
  projects: PortfolioProjectPublic[];
};

type ActiveView = {
  projectId: string;
  photoIndex: number;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Gallery({ projects }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<ActiveView | null>(null);
  const [range, setRange] = useState({
    start: 1,
    end: Math.min(4, projects.length),
    canPrev: false,
    canNext: projects.length > 4,
  });

  const updateRange = useCallback(() => {
    const track = trackRef.current;
    const firstItem = track?.querySelector<HTMLElement>(".gallery-item");
    if (!track || !firstItem) {
      return;
    }

    const gap =
      Number.parseFloat(
        getComputedStyle(track).columnGap || getComputedStyle(track).gap
      ) || 0;
    const stride = firstItem.getBoundingClientRect().width + gap;
    const index = stride > 0 ? Math.round(track.scrollLeft / stride) : 0;
    const visible =
      stride > 0
        ? Math.max(1, Math.round((track.clientWidth + gap) / stride))
        : 1;
    const start = Math.min(index + 1, Math.max(projects.length, 1));
    const end = Math.min(index + visible, projects.length);

    setRange({
      start,
      end,
      canPrev: track.scrollLeft > 4,
      canNext: track.scrollLeft + track.clientWidth < track.scrollWidth - 4,
    });
  }, [projects.length]);

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

  const activeProject = active
    ? projects.find((project) => project.id === active.projectId)
    : null;
  const activePhotos = activeProject?.photos ?? [];
  const activePhoto =
    active && activePhotos.length
      ? activePhotos[
          ((active.photoIndex % activePhotos.length) + activePhotos.length) %
            activePhotos.length
        ]
      : null;

  useEffect(() => {
    if (!active || activePhotos.length < 2) {
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
        const project = projects.find((item) => item.id === current.projectId);
        const count = project?.photos.length ?? 0;
        if (count < 2) {
          return current;
        }
        return {
          projectId: current.projectId,
          photoIndex: (current.photoIndex + step + count) % count,
        };
      });
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, activePhotos.length, projects]);

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

  function openProject(projectId: string) {
    setActive({ projectId, photoIndex: 0 });
  }

  function showAt(index: number) {
    if (!activeProject) {
      return;
    }
    const count = activeProject.photos.length;
    setActive({
      projectId: activeProject.id,
      photoIndex: (index + count) % count,
    });
  }

  if (!projects.length) {
    return (
      <p className="gallery-empty">
        Project photos will appear here soon.
      </p>
    );
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
              ? `${range.start} of ${projects.length}`
              : `${range.start}–${range.end} of ${projects.length}`}
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
          {projects.map((project, index) => (
            <button
              className="gallery-item"
              type="button"
              key={project.id}
              onClick={() => openProject(project.id)}
            >
              {project.coverSrc ? (
                <img
                  src={project.coverSrc}
                  alt={project.title}
                  loading={index < 4 ? "eager" : "lazy"}
                />
              ) : null}
              <span>{project.title}</span>
            </button>
          ))}
        </div>
      </div>

      <dialog
        className="lightbox"
        ref={dialogRef}
        aria-label="Project photos"
        onClose={() => setActive(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setActive(null);
          }
        }}
      >
        {activeProject && activePhoto ? (
          <>
            <button
              className="lightbox-close"
              type="button"
              aria-label="Close"
              onClick={() => setActive(null)}
            >
              &times;
            </button>
            {activePhotos.length > 1 ? (
              <button
                className="lightbox-arrow lightbox-prev"
                type="button"
                aria-label="Previous photo"
                onClick={() => showAt((active?.photoIndex ?? 0) - 1)}
              >
                <Chevron direction="left" />
              </button>
            ) : null}
            <img
              src={activePhoto.src}
              alt={activePhoto.caption || activeProject.title}
            />
            {activePhotos.length > 1 ? (
              <button
                className="lightbox-arrow lightbox-next"
                type="button"
                aria-label="Next photo"
                onClick={() => showAt((active?.photoIndex ?? 0) + 1)}
              >
                <Chevron direction="right" />
              </button>
            ) : null}
            <div className="lightbox-caption">
              <strong>{activeProject.title}</strong>
              {activeProject.description ? (
                <p>{activeProject.description}</p>
              ) : null}
              {activePhoto.caption ? <p>{activePhoto.caption}</p> : null}
            </div>
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
