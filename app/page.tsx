import { ContactForm } from "@/components/ContactForm";
import { Gallery } from "@/components/Gallery";
import { RevealFallback } from "@/components/RevealFallback";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { services, site } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <section className="hero">
          <div className="hero-media" aria-hidden="true">
            <img
              src="/assets/services/landscaping.jpg"
              alt=""
              width={1920}
              height={1280}
            />
          </div>
          <div className="container hero-content">
            <p className="eyebrow">Otsego, Minnesota</p>
            <h1>Home and outdoor solutions you can count on.</h1>
            <p className="hero-lead">
              Painting, landscaping, hardscaping, demolition, and handyman
              work — done with care, and built on relationships with every
              customer.
            </p>
            <div className="hero-actions">
              <a className="btn btn-orange" href="#contact">
                Get a Free Estimate
              </a>
              <a className="btn btn-ghost" href={site.phoneHref}>
                Call {site.phone}
              </a>
            </div>
          </div>
        </section>

        <section className="features" id="features" aria-label="Why choose us">
          <div className="container features-grid">
            <article className="feature-card">
              <span className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <path
                    d="M6 16.5 13 23 26 9"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h2>Free Estimate</h2>
              <p>Get a quote for free</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon green" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <path
                    d="M16 5 19.2 12.1 27 13l-5.6 5.4L22.8 27 16 22.8 9.2 27l1.4-8.6L5 13l7.8-.9L16 5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h2>Best quality</h2>
              <p>We guarantee your full satisfaction</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <circle
                    cx="16"
                    cy="16"
                    r="10.5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M16 10.5v11M12.5 13.5h5.2a2.3 2.3 0 0 1 0 4.6h-3.4a2.3 2.3 0 0 0 0 4.6H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <h2>Competitive pricing</h2>
              <p>The best value for money</p>
            </article>
          </div>
        </section>

        <section className="section" id="about">
          <div className="container split">
            <div>
              <p className="eyebrow">About</p>
              <h2>Quality service, personal connection.</h2>
            </div>
            <p className="lede">
              We&apos;re the best in our field, and it&apos;s all thanks to the
              incredible relationships we&apos;ve formed with our clients.
              Unlike our competitors, we&apos;re invested in developing a
              personal connection with each and every one of our customers, by
              providing quality service. Get in touch with us when you&apos;re
              ready to learn more; we can&apos;t wait to meet you!
            </p>
          </div>
        </section>

        <section className="section section-alt" id="services">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Our services</p>
              <h2>From curb appeal to winter-ready.</h2>
            </div>
            <div className="service-grid">
              {services.map((service) => (
                <article className="service-card" key={service.title}>
                  <img
                    src={service.image}
                    alt={service.alt}
                    width={640}
                    height={420}
                  />
                  <div className="service-body">
                    <h3>{service.title}</h3>
                    <p>{service.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="gallery">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Gallery</p>
              <h2>Recent work.</h2>
            </div>
            <Gallery />
          </div>
        </section>

        <section className="section section-alt" id="contact">
          <div className="container contact-layout">
            <div className="contact-copy">
              <p className="eyebrow">Contact us</p>
              <h2>Ready when you are.</h2>
              <p className="lede">
                We&apos;re here to help! Send any questions you have over to us.
                We look forward to hearing from you.
              </p>
              <ul className="contact-list">
                <li>
                  <span>Phone</span>
                  <a href={site.phoneHref}>{site.phone}</a>
                </li>
                <li>
                  <span>Email</span>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </li>
                <li>
                  <span>Location</span>
                  <span>{site.location}</span>
                </li>
              </ul>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <SiteFooter />
      <RevealFallback />
    </>
  );
}
