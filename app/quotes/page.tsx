import Link from "next/link";
import { QuotesNewButton } from "@/components/quotes/QuotesNewButton";
import { listQuotes } from "@/lib/quotes-db";
import { formatMoney, quoteTotals } from "@/lib/quote";
import { site } from "@/lib/site";

export default async function QuotesIndexPage() {
  const rows = await listQuotes();

  return (
    <main className="quotes-app">
      <header className="quotes-nav">
        <p>{site.legalName} quotes</p>
        <div className="quotes-nav-actions">
          <QuotesNewButton />
          <form action="/api/quotes/logout" method="post">
            <button className="btn btn-ghost" type="submit">
              Log out
            </button>
          </form>
        </div>
      </header>
      <div className="quotes-list-wrap">
        {rows.length === 0 ? (
          <p>No quotes yet. Create one and paste the job details.</p>
        ) : (
          <table className="quotes-list">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Title</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((quote) => {
                const total = quote.body
                  ? quoteTotals(quote.body.lineItems).total
                  : 0;
                return (
                  <tr key={quote.id}>
                    <td>
                      <Link href={`/quotes/${quote.id}`}>{quote.number}</Link>
                    </td>
                    <td>{quote.customerName || "—"}</td>
                    <td>
                      <Link href={`/quotes/${quote.id}`}>{quote.title}</Link>
                    </td>
                    <td>{total ? formatMoney(total) : "—"}</td>
                    <td>{quote.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
