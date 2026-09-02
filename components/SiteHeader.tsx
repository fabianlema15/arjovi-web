"use client";

import { useState } from "react";
import { scrollToTop } from "@/lib/scroll";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <header className="site-header" id="top">
      <div className="container header-inner">
        <a
          className="brand"
          href="#top"
          aria-label="Arjovi Solutions home"
          onClick={scrollToTop}
        >
          <img
            className="brand-logo logo-light"
            src="/assets/brand/logo-horizontal.png"
            alt=""
            width={1024}
            height={378}
          />
          <img
            className="brand-logo logo-dark"
            src="/assets/brand/logo-dark.png"
            alt=""
            width={1494}
            height={589}
          />
        </a>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav
          className={`site-nav${open ? " open" : ""}`}
          id="site-nav"
          aria-label="Primary"
        >
          <a href="#about" onClick={close}>
            About
          </a>
          <a href="#services" onClick={close}>
            Services
          </a>
          <a href="#gallery" onClick={close}>
            Gallery
          </a>
          <a href="#contact" onClick={close}>
            Contact
          </a>
          <a className="btn btn-orange nav-cta" href="#contact" onClick={close}>
            Free Estimate
          </a>
        </nav>
      </div>
    </header>
  );
}
