export const QUOTE_COOKIE = "arjovi_quotes";
const DAY = 60 * 60 * 24;

function secret() {
  return process.env.QUOTE_AUTH_SECRET ?? process.env.QUOTE_PASSWORD ?? "";
}

function toBase64Url(bytes: ArrayBuffer) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );
  return toBase64Url(sig);
}

export async function createQuoteSession() {
  const exp = Date.now() + 30 * DAY * 1000;
  const payload = `quotes:${exp}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function isQuoteSessionValid(token: string | undefined) {
  if (!token || !secret()) {
    return false;
  }
  const split = token.lastIndexOf(".");
  if (split < 0) {
    return false;
  }
  const payload = token.slice(0, split);
  const signature = token.slice(split + 1);
  if (signature !== (await hmac(payload))) {
    return false;
  }
  const exp = Number(payload.split(":")[1]);
  return Number.isFinite(exp) && exp > Date.now();
}

export async function quotesPasswordMatches(password: string) {
  const expected = process.env.QUOTE_PASSWORD ?? "";
  return expected.length > 0 && password === expected;
}
