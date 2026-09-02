import type { Metadata } from "next";
import { services, site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Card | ${site.name}`,
  description: `${site.name} digital card — ${site.location}.`,
  robots: { index: false, follow: false },
  openGraph: {
    title: site.name,
    description: site.description,
    url: `${site.url}/card`,
    images: ["/assets/brand/logo-horizontal.png"],
  },
};

export default function CardPage() {
  return (
    <main className="card-page">
      <article className="digital-card">
        <img
          className="card-logo logo-light"
          src="/assets/brand/logo-horizontal.png"
          alt=""
          width={1024}
          height={378}
        />
        <img
          className="card-logo logo-dark"
          src="/assets/brand/logo-dark.png"
          alt={site.name}
          width={1494}
          height={589}
        />
        <p className="card-place">{site.location}</p>
        <ul className="card-services">
          {services.map((service) => (
            <li key={service.title}>{service.title}</li>
          ))}
        </ul>
        <div className="card-actions">
          <a className="btn btn-orange" href={site.phoneHref}>
            Call {site.phone}
          </a>
          <a className="btn btn-ghost" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <a className="btn btn-ghost" href={site.url}>
            www.arjovi.com
          </a>
          <a className="btn btn-ghost" href="/card/vcard">
            Save contact
          </a>
        </div>
      </article>
    </main>
  );
}
