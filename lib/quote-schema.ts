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
    .describe("2-4 paragraph narrative of the project, sq ft, conditions, and what is included"),
  scopeOfWork: z.array(
    z.object({
      heading: z.string(),
      items: z.array(z.string()),
    })
  ),
  lineItems: z.array(
    z.object({
      description: z.string(),
      labor: z.number().describe("Labor in USD"),
      materials: z.number().describe("Materials in USD"),
    })
  ),
  duration: z.string().describe("Estimated working days"),
  paymentTerms: z
    .array(z.string())
    .describe(
      "40% deposit, 30% progress, 30% final — or 50%/50% for a small job"
    ),
  validityDays: z.number().describe("Usually 30"),
  notes: z
    .array(z.string())
    .describe("Only assumptions and exclusions that apply to this job"),
});
