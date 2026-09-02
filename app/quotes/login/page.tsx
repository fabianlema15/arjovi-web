import type { Metadata } from "next";
import { QuotesLoginForm } from "@/components/quotes/QuotesLoginForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Quotes login | ${site.name}`,
  robots: { index: false, follow: false },
};

export default function QuotesLoginPage() {
  return (
    <main className="quotes-login">
      <article className="quotes-login-card">
        <h1>Quotes</h1>
        <p>Staff only. Estimates are not contracts.</p>
        <QuotesLoginForm />
      </article>
    </main>
  );
}
