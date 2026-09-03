import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { openaiErrorMessage } from "@/lib/openai-error";
import { requireQuoteCookie } from "@/lib/quote-auth";
import { toEstimateMessages } from "@/lib/quote-images";
import { quoteModel } from "@/lib/quote-model";
import { quoteExtractSystem } from "@/lib/quote-prompt";
import { quoteBodySchema } from "@/lib/quote-schema";
import {
  emptyQuoteBody,
  keepLineItemPrices,
  type QuoteBody,
  type QuoteLineItem,
} from "@/lib/quote";
import { getQuote, listMessages, saveQuoteBody } from "@/lib/quotes-db";

export const runtime = "nodejs";
export const maxDuration = 120;

type DraftRequest = {
  keepPrices?: boolean;
  lineItems?: QuoteLineItem[];
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireQuoteCookie();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set" },
      { status: 500 }
    );
  }

  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const current = quote.body ?? emptyQuoteBody();
  let keepPrices = Boolean(current.pricesLocked);
  let editedItems = current.lineItems;
  try {
    const payload = (await request.json()) as DraftRequest;
    keepPrices = Boolean(payload.keepPrices || current.pricesLocked);
    if (payload.lineItems?.length) {
      editedItems = payload.lineItems;
    }
  } catch {
    // No JSON body — use the saved quote.
  }

  const history = await listMessages(id);
  if (history.length === 0) {
    return NextResponse.json(
      { error: "Add job details in the chat first." },
      { status: 400 }
    );
  }

  console.info("quote draft started", { id, messages: history.length });

  try {
    const { output } = await generateText({
      model: quoteModel,
      output: Output.object({
        name: "Quote",
        description: "Residential job estimate",
        schema: quoteBodySchema,
      }),
      system: quoteExtractSystem,
      messages: [
        ...toEstimateMessages(history),
        {
          role: "user",
          content: draftInstructions({
            quote: current,
            keepPrices,
            editedItems,
            customerName: quote.customerName || current.customerName,
            customerEmail: quote.customerEmail || current.customerEmail,
          }),
        },
      ],
      maxRetries: 0,
      timeout: 90_000,
    });

    const lineItems = keepPrices
      ? keepLineItemPrices(editedItems, output.lineItems)
      : output.lineItems;

    const body: QuoteBody = {
      ...output,
      customerName: output.customerName || current.customerName,
      customerEmail: output.customerEmail || current.customerEmail,
      validityDays: output.validityDays || 30,
      lineItems,
      pricesLocked: keepPrices,
    };

    const saved = await saveQuoteBody(id, body);
    console.info("quote draft saved", { id, number: saved.number });
    revalidatePath("/quotes");
    revalidatePath(`/quotes/${id}`);
    return NextResponse.json(saved);
  } catch (error) {
    console.error("quote draft failed", error);
    return NextResponse.json(
      { error: openaiErrorMessage(error) },
      { status: 502 }
    );
  }
}

function draftInstructions({
  quote,
  keepPrices,
  editedItems,
  customerName,
  customerEmail,
}: {
  quote: QuoteBody;
  keepPrices: boolean;
  editedItems: QuoteLineItem[];
  customerName: string;
  customerEmail: string;
}) {
  const parts = [
    "Fill the customer PDF schema from this conversation.",
    "Copy Project Scope, Scope of Work, duration, notes, and the cost table from the chat. Do not invent a different job.",
    `Current customer name: ${customerName}`,
    `Current customer email: ${customerEmail}`,
  ];
  if (quote.projectScope || quote.lineItems.length) {
    parts.push(
      `Current quote JSON — keep facts unless the chat corrected them:\n${JSON.stringify(
        {
          title: quote.title,
          projectScope: quote.projectScope,
          scopeOfWork: quote.scopeOfWork,
          duration: quote.duration,
          notes: quote.notes,
          lineItems: quote.lineItems,
        }
      )}`
    );
  }
  if (keepPrices && editedItems.length) {
    parts.push(
      `LOCKED PRICES — keep these labor and materials exactly. Rename tasks only if the chat did. Price only brand-new tasks not listed here:\n${JSON.stringify(
        editedItems
      )}`
    );
  }
  return parts.join("\n");
}
