import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { NextResponse } from "next/server";
import { openaiErrorMessage } from "@/lib/openai-error";
import { requireQuoteCookie } from "@/lib/quote-auth";
import { quoteModel } from "@/lib/quote-model";
import { quoteChatSystem } from "@/lib/quote-prompt";
import { addMessage, getQuote } from "@/lib/quotes-db";

export const runtime = "nodejs";

function messageText(message: UIMessage) {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

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

  const { messages }: { messages: UIMessage[] } = await request.json();
  const last = messages.at(-1);
  if (last?.role === "user") {
    const text = messageText(last);
    if (text) {
      await addMessage(id, "user", text);
    }
  }

  const result = streamText({
    model: quoteModel,
    system: quoteChatSystem,
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
    maxRetries: 0,
    async onFinish({ text }) {
      if (text.trim()) {
        await addMessage(id, "assistant", text.trim());
      }
    },
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => openaiErrorMessage(error),
  });
}
