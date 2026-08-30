import type { Metadata, Viewport } from "next";
import { Barlow, Oswald } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} | Home Services in Otsego, MN`,
  description: site.description,
  icons: { icon: "/assets/brand/logo.png" },
  openGraph: {
    type: "website",
    url: site.url,
    title: site.name,
    description: site.description,
    images: ["/assets/brand/logo-horizontal.png"],
  },
  twitter: {
    card: "summary",
    title: site.name,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07090B" },
    { media: "(prefers-color-scheme: light)", color: "#F3F5F1" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: site.name,
  url: site.url,
  email: site.email,
  telephone: "+16128075426",
  image: `${site.url}/assets/brand/logo.png`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Otsego",
    addressRegion: "MN",
    addressCountry: "US",
  },
  areaServed: "Otsego, MN",
  priceRange: "$$",
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${oswald.variable} ${barlow.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
