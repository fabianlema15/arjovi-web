import { NextResponse } from "next/server";
import { QUOTE_COOKIE } from "@/lib/quote-session";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/quotes/login", request.url), 303);
  response.cookies.set(QUOTE_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
