import { NextResponse } from "next/server";
import { leads } from "@/db/schema";
import { getDb } from "@/lib/db";
import { sendLeadEmail } from "@/lib/email";

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

  let emailed = false;
  try {
    await sendLeadEmail({ name, phone, email, message });
    emailed = true;
  } catch (error) {
    console.error("contact email failed", error);
  }

  console.info("contact result", { stored, emailed });

  if (stored || emailed) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Send failed" }, { status: 502 });
}
