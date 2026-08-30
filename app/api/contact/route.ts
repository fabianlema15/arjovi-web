import { NextResponse } from "next/server";
import { leads } from "@/db/schema";
import { getDb } from "@/lib/db";

type ContactBody = {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  honey?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ContactBody;

  if (body.honey) {
    return NextResponse.json({ ok: true });
  }

  const name = body.name?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !phone || !email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (process.env.DATABASE_URL) {
    await getDb().insert(leads).values({ name, phone, email, message });
  }

  const inbox = process.env.CONTACT_INBOX ?? "fabianlema@arjovi.com";
  const response = await fetch(`https://formsubmit.co/ajax/${inbox}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name,
      phone,
      email,
      message,
      _subject: "New message from Arjovi Solutions website",
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Send failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
