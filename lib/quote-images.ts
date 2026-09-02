import type { FileUIPart, ModelMessage, UIMessage } from "ai";
import type { QuoteAttachment } from "@/lib/quote";

export function fileParts(message: UIMessage): QuoteAttachment[] {
  return message.parts
    .filter((part): part is FileUIPart => part.type === "file")
    .filter((part) => part.mediaType.startsWith("image/"))
    .map((part) => ({
      mediaType: part.mediaType,
      url: part.url,
      filename: part.filename,
    }));
}

export function toEstimateMessages(
  history: {
    role: string;
    content: string;
    attachments?: QuoteAttachment[] | null;
  }[]
): ModelMessage[] {
  const messages: ModelMessage[] = [];
  for (const message of history) {
    const text = message.content.trim();
    const images = (message.attachments ?? []).filter((part) =>
      part.mediaType.startsWith("image/")
    );
    if (message.role === "assistant") {
      if (text) {
        messages.push({ role: "assistant", content: text });
      }
      continue;
    }
    if (images.length) {
      messages.push({
        role: "user",
        content: [
          ...(text ? [{ type: "text" as const, text }] : []),
          ...images.map((part) => ({
            type: "image" as const,
            image: part.url,
          })),
        ],
      });
      continue;
    }
    if (text) {
      messages.push({ role: "user", content: text });
    }
  }
  return messages;
}
