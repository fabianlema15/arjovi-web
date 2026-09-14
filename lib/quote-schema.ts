import { z } from "zod";

const quoteLineSchema = z.object({
  description: z.string().describe("Task name from the chat cost table"),
  labor: z.number().describe("Labor in USD, copied from the chat"),
  materials: z.number().describe("Materials in USD, copied from the chat"),
});

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
      "Copy the Project Scope from the chat/estimate. Keep rooms, sq ft, materials, colors, access details that were stated, and exclusions. Do not invent a shorter or different job. Do not add assumptions or site-visit language."
    ),
  scopeOfWork: z.array(
    z.object({
      heading: z.string(),
      items: z.array(z.string()),
    })
  ).describe(
    "Copy Scope of Work sections from the chat. Keep the same tasks, rooms, and materials. Do not drop discussed work. Optional alternatives can be a separate Optional section."
  ),
  lineItems: z
    .array(quoteLineSchema)
    .describe("Included work only. This table is the project total."),
  optionalLineItems: z
    .array(quoteLineSchema)
    .describe(
      "Optional alternatives or add-ons. Empty if none. Do not duplicate these in lineItems. Not part of the project total."
    ),
  duration: z
    .string()
    .describe("Copy the duration from the chat, including working days"),
  paymentTerms: z
    .array(z.string())
    .describe(
      "Payment labels only, no dollar amounts. Under $1000: 100% upon completion. Otherwise 10% deposit and 90% final. Based on the included total only."
    ),
  validityDays: z.number().describe("Usually 30"),
  notes: z
    .array(z.string())
    .describe(
      "Copy relevant exclusions from the chat. If there is optional work, note that it is not included unless chosen, and whether it replaces included work. No assumptions, no site-visit language."
    ),
});
