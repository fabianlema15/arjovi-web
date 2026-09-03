import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { openaiErrorMessage } from "@/lib/openai-error";
import { requireQuoteCookie } from "@/lib/quote-auth";
import { toEstimateMessages } from "@/lib/quote-images";
import { quoteModel } from "@/lib/quote-model";
import { quoteEstimateSystem, quoteExtractSystem } from "@/lib/quote-prompt";
import { quoteBodySchema } from "@/lib/quote-schema";
import { getQuote, listMessages, saveQuoteBody } from "@/lib/quotes-db";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(
  _request: Request,
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

  const history = await listMessages(id);
  if (history.length === 0) {
    return NextResponse.json(
      { error: "Add job details in the chat first." },
      { status: 400 }
    );
  }

  console.info("quote draft started", { id, messages: history.length });

  try {
    const { text: estimate } = await generateText({
      model: quoteModel,
      system: quoteEstimateSystem,
      messages: [
        ...toEstimateMessages(history),
        {
          role: "user",
          content: `Write the full professional estimate now.\nCurrent customer name: ${quote.customerName}\nCurrent customer email: ${quote.customerEmail}`,
        },
      ],
      maxRetries: 0,
      timeout: 60_000,
    });

    const { output } = await generateText({
      model: quoteModel,
      output: Output.object({
        name: "Quote",
        description: "Residential job estimate",
        schema: quoteBodySchema,
      }),
      system: quoteExtractSystem,
      prompt: estimate,
      maxRetries: 0,
      timeout: 45_000,
    });

    const saved = await saveQuoteBody(id, {
      ...output,
      validityDays: output.validityDays || 30,
    });
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
