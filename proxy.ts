import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { QUOTE_COOKIE, isQuoteSessionValid } from "@/lib/quote-session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/quotes/login" || pathname === "/api/quotes/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(QUOTE_COOKIE)?.value;
  if (await isQuoteSessionValid(token)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/quotes")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const login = new URL("/quotes/login", request.url);
  login.searchParams.set("from", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/quotes", "/quotes/:path*", "/api/quotes/:path*"],
};
