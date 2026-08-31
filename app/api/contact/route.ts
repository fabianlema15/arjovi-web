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

  let stored = false;
  if (process.env.DATABASE_URL) {
    try {
      await getDb().insert(leads).values({ name, phone, email, message });
      stored = true;
    } catch (error) {
      console.error("contact insert failed", error);
      return NextResponse.json({ error: "Could not save message" }, { status: 502 });
    }
  }

  const inbox = process.env.CONTACT_INBOX ?? "fabianlema@arjovi.com";
  try {
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
        _captcha: "false",
        _subject: "New message from Arjovi Solutions website",
      }),
    });
    const payload = (await response.json()) as { success?: boolean | string };
    const emailed =
      response.ok && payload.success !== false && payload.success !== "false";
    if (!emailed) {
      console.error("contact email failed", response.status, payload);
    }
    if (stored || emailed) {
      return NextResponse.json({ ok: true });
    }
  } catch (error) {
    console.error("contact email failed", error);
    if (stored) {
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ error: "Send failed" }, { status: 502 });
}
