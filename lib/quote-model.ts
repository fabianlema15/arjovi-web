import { openai } from "@ai-sdk/openai";

// GPT-6.1 Sol: current Sol tier (near-Astra). Same input price as 5.6 Terra, cheaper output.
export const quoteModel = openai.chat("gpt-6.1-sol");
