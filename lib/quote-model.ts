import { openai } from "@ai-sdk/openai";

// GPT-5.6 Terra: current balanced model (2026). Sol is the flagship and costs more.
export const quoteModel = openai.chat("gpt-5.6-terra");
