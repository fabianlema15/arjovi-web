import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireQuoteCookie } from "@/lib/quote-auth";
import { createQuote } from "@/lib/quotes-db";

export async function POST() {
  try {
    await requireQuoteCookie();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quote = await createQuote();
  revalidatePath("/quotes");
  revalidatePath(`/quotes/${quote.id}`);
  return NextResponse.json({ id: quote.id, number: quote.number });
}
