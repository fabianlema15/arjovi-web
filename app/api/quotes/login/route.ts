import { NextResponse } from "next/server";
import {
  QUOTE_COOKIE,
  createQuoteSession,
  quotesPasswordMatches,
} from "@/lib/quote-session";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  if (!(await quotesPasswordMatches(body.password ?? ""))) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await createQuoteSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(QUOTE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
