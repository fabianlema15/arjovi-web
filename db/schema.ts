import { jsonb, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { QuoteAttachment, QuoteBody } from "@/lib/quote";

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: integer("number").notNull().unique(),
  status: text("status").notNull().default("draft"),
  customerName: text("customer_name").notNull().default(""),
  customerEmail: text("customer_email").notNull().default(""),
  title: text("title").notNull().default("New quote"),
  body: jsonb("body").$type<QuoteBody | null>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const quoteMessages = pgTable("quote_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  quoteId: uuid("quote_id")
    .notNull()
    .references(() => quotes.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  attachments: jsonb("attachments").$type<QuoteAttachment[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
