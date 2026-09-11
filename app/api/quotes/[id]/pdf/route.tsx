import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { QuotePdfDocument } from "@/components/quotes/QuotePdfDocument";
import { requireQuoteCookie } from "@/lib/quote-auth";
import { getQuote } from "@/lib/quotes-db";
import { emptyQuoteBody, quoteWasEmailed } from "@/lib/quote";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireQuoteCookie();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote?.body?.lineItems.length) {
    return NextResponse.json(
      { error: "Draft a quote first." },
      { status: 400 }
    );
  }

  const body = quote.body ?? emptyQuoteBody();
  const date = quote.createdAt.toLocaleDateString("en-US");
  const revised = quoteWasEmailed(quote.status);
  const revisedDate = revised
    ? new Date(body.revisedAt ?? Date.now()).toLocaleDateString("en-US")
    : undefined;
  const buffer = await renderToBuffer(
    <QuotePdfDocument
      number={quote.number}
      date={date}
      revisedDate={revisedDate}
      body={body}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Quote_${quote.number}.pdf"`,
    },
  });
}
