import { z } from "zod";

export const quoteBodySchema = z.object({
  customerName: z.string(),
  customerEmail: z.string(),
  title: z
    .string()
    .describe(
      "Short job title starting with one fitting emoji, e.g. 🏠 Full Interior Painting"
    ),
  projectScope: z
    .string()
    .describe(
      "Copy the Project Scope from the chat/estimate. Keep rooms, sq ft, materials, colors, access, and assumptions. Do not invent a shorter or different job."
    ),
  scopeOfWork: z.array(
    z.object({
      heading: z.string(),
      items: z.array(z.string()),
    })
  ).describe(
    "Copy Scope of Work sections from the chat. Keep the same tasks, rooms, and materials. Do not drop discussed work."
  ),
  lineItems: z.array(
    z.object({
      description: z
        .string()
        .describe("Task name from the chat cost table"),
      labor: z.number().describe("Labor in USD, copied from the chat"),
      materials: z.number().describe("Materials in USD, copied from the chat"),
    })
  ),
  duration: z
    .string()
    .describe("Copy the duration from the chat, including working days"),
  paymentTerms: z
    .array(z.string())
    .describe("Always 25% deposit upon acceptance and 75% final payment. No dollar amounts."),
  validityDays: z.number().describe("Usually 30"),
  notes: z
    .array(z.string())
    .describe(
      "Copy relevant assumptions and exclusions from the chat. Do not invent unrelated notes."
    ),
});
