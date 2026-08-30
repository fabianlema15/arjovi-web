"use client";

import { useState } from "react";
import { gallery } from "@/lib/site";

export function Gallery() {
  const [active, setActive] = useState<(typeof gallery)[number] | null>(null);

  return (
    <>
      <div className="gallery-grid">
        {gallery.map((item) => (
          <button
            className="gallery-item"
            type="button"
            key={item.src}
            onClick={() => setActive(item)}
          >
            <img src={item.src} alt={item.alt} />
            <span>{item.caption}</span>
          </button>
        ))}
      </div>

      {active ? (
        <dialog
          className="lightbox"
          open
          aria-label="Image preview"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setActive(null);
            }
          }}
        >
          <button
            className="lightbox-close"
            type="button"
            aria-label="Close"
            onClick={() => setActive(null)}
          >
            &times;
          </button>
          <img src={active.src} alt={active.alt} />
          <p className="lightbox-caption">{active.caption}</p>
        </dialog>
      ) : null}
    </>
  );
}
