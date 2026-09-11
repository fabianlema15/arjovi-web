import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { QuotePdfDocument } from "@/components/quotes/QuotePdfDocument";
import { quoteCustomerEmail } from "@/lib/email";
import { requireQuoteCookie } from "@/lib/quote-auth";
import { emptyQuoteBody, quoteIsRevised, quoteRevisionDate } from "@/lib/quote";
import { getQuote, saveQuoteBody } from "@/lib/quotes-db";
import { site } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireQuoteCookie();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not set" },
      { status: 500 }
    );
  }

  const { id } = await params;
  const quote = await getQuote(id);
  const body = quote?.body ?? emptyQuoteBody();
  if (!quote || !body.lineItems.length) {
    return NextResponse.json(
      { error: "Draft a quote first." },
      { status: 400 }
    );
  }

  const payload = (await request.json()) as { to?: string };
  const to = (payload.to ?? body.customerEmail).trim();
  if (!to.includes("@")) {
    return NextResponse.json(
      { error: "Customer email is required." },
      { status: 400 }
    );
  }

  const revised = quoteIsRevised(body);
  const date = quote.createdAt.toLocaleDateString("en-US");
  const pdf = await renderToBuffer(
    <QuotePdfDocument
      number={quote.number}
      date={date}
      revisedDate={quoteRevisionDate(body)}
      body={body}
    />
  );
  const message = quoteCustomerEmail({
    number: quote.number,
    customerName: body.customerName,
    title: body.title,
    revised,
  });
  const from =
    process.env.EMAIL_FROM ?? `${site.name} <beth.t@example.com>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: site.email,
    subject: message.subject,
    text: message.text,
    html: message.html,
    attachments: [
      {
        filename: `Quote_${quote.number}.pdf`,
        content: pdf,
      },
    ],
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  const saved = await saveQuoteBody(
    id,
    {
      ...body,
      customerEmail: to,
    },
    quoteIsRevised(body) ? "revised" : "sent"
  );
  revalidatePath("/quotes");
  revalidatePath(`/quotes/${id}`);

  return NextResponse.json({
    ok: true,
    status: saved.status,
    body: saved.body,
  });
}
