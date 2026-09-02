export function openaiErrorMessage(error: unknown) {
  const text =
    error instanceof Error ? error.message : "The model request failed.";
  if (/insufficient_quota|credit_balance_exhausted|no credits/i.test(text)) {
    return "OpenAI has no credits left. Add billing at platform.openai.com, then try again.";
  }
  if (/timeout|abort|timed out/i.test(text)) {
    return "Draft timed out. Try again.";
  }
  return text;
}
