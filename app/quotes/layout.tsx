import type { Metadata } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: `Quotes | ${site.name}`,
  robots: { index: false, follow: false },
};

export default function QuotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
