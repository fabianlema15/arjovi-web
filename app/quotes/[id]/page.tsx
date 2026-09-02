import { notFound } from "next/navigation";
import Link from "next/link";
import { QuoteWorkspace } from "@/components/quotes/QuoteWorkspace";
import { getQuote, listMessages } from "@/lib/quotes-db";
import { site } from "@/lib/site";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) {
    notFound();
  }
  const messages = await listMessages(id);

  return (
    <main className="quotes-app">
      <header className="quotes-nav">
        <p>
          <Link href="/quotes">{site.legalName}</Link>
          {" / "}
          Quote #{quote.number}
        </p>
        <form action="/api/quotes/logout" method="post">
          <button className="btn btn-ghost" type="submit">
            Log out
          </button>
        </form>
      </header>
      <QuoteWorkspace
        quote={{
          id: quote.id,
          number: quote.number,
          status: quote.status,
          createdAt: quote.createdAt.toISOString(),
          body: quote.body,
        }}
        messages={messages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
        }))}
      />
    </main>
  );
}
