import { desc, eq, max } from "drizzle-orm";
import { quoteMessages, quotes } from "@/db/schema";
import { getDb } from "@/lib/db";
import { emptyQuoteBody, type QuoteAttachment, type QuoteBody } from "@/lib/quote";

export async function nextQuoteNumber() {
  const [row] = await getDb()
    .select({ value: max(quotes.number) })
    .from(quotes);
  const current = row?.value ?? 10078;
  return Math.max(current, 10078) + 1;
}

export async function createQuote() {
  const number = await nextQuoteNumber();
  const [quote] = await getDb()
    .insert(quotes)
    .values({
      number,
      title: "New quote",
      body: emptyQuoteBody(),
    })
    .returning();
  return quote;
}

export async function getQuote(id: string) {
  const [quote] = await getDb().select().from(quotes).where(eq(quotes.id, id));
  return quote ?? null;
}

export async function listQuotes() {
  return getDb().select().from(quotes).orderBy(desc(quotes.updatedAt));
}

export async function listMessages(quoteId: string) {
  return getDb()
    .select()
    .from(quoteMessages)
    .where(eq(quoteMessages.quoteId, quoteId))
    .orderBy(quoteMessages.createdAt);
}

export async function addMessage(
  quoteId: string,
  role: "user" | "assistant",
  content: string,
  attachments: QuoteAttachment[] = []
) {
  await getDb()
    .insert(quoteMessages)
    .values({ quoteId, role, content, attachments });
}

export async function saveQuoteBody(
  id: string,
  body: QuoteBody,
  status = "ready"
) {
  const [quote] = await getDb()
    .update(quotes)
    .set({
      body,
      title: body.title || "New quote",
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      status,
      updatedAt: new Date(),
    })
    .where(eq(quotes.id, id))
    .returning();
  return quote;
}
