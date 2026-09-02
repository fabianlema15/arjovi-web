import { cookies } from "next/headers";
import { QUOTE_COOKIE, isQuoteSessionValid } from "@/lib/quote-session";

export { QUOTE_COOKIE };

export async function requireQuoteCookie() {
  const store = await cookies();
  const ok = await isQuoteSessionValid(store.get(QUOTE_COOKIE)?.value);
  if (!ok) {
    throw new Error("Unauthorized");
  }
}
