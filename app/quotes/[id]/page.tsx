import { notFound } from "next/navigation";
import { QuoteWorkspace } from "@/components/quotes/QuoteWorkspace";
import { QuotesStaffNav } from "@/components/quotes/QuotesStaffNav";
import { getQuote, listMessages } from "@/lib/quotes-db";

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
      <QuotesStaffNav current="quotes" crumb={`Quote #${quote.number}`} />
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
          attachments: message.attachments ?? [],
        }))}
      />
    </main>
  );
}
