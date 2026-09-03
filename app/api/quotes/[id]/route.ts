import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { quotes } from "@/db/schema";
import { requireQuoteCookie } from "@/lib/quote-auth";
import { getDb } from "@/lib/db";
import { getQuote, saveQuoteBody } from "@/lib/quotes-db";
import type { QuoteBody, QuoteLineItem } from "@/lib/quote";
import { emptyQuoteBody } from "@/lib/quote";

type PatchBody = {
  customerName?: string;
  customerEmail?: string;
  title?: string;
  lineItems?: QuoteLineItem[];
  body?: QuoteBody;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireQuoteCookie();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const patch = (await request.json()) as PatchBody;
  const current = quote.body ?? emptyQuoteBody();
  const body: QuoteBody = {
    ...current,
    ...(patch.body ?? {}),
    customerName: patch.customerName ?? patch.body?.customerName ?? current.customerName,
    customerEmail:
      patch.customerEmail ?? patch.body?.customerEmail ?? current.customerEmail,
    title: patch.title ?? patch.body?.title ?? current.title,
    lineItems: patch.lineItems ?? patch.body?.lineItems ?? current.lineItems,
    pricesLocked:
      patch.body?.pricesLocked ??
      (patch.lineItems ? true : current.pricesLocked),
  };

  const saved = await saveQuoteBody(id, body, quote.status === "sent" ? "sent" : "ready");
  revalidatePath("/quotes");
  revalidatePath(`/quotes/${id}`);
  return NextResponse.json(saved);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireQuoteCookie();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await getDb().delete(quotes).where(eq(quotes.id, id));
  revalidatePath("/quotes");
  revalidatePath(`/quotes/${id}`);
  return NextResponse.json({ ok: true });
}
