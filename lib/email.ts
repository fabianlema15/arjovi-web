import { Resend } from "resend";
import { site } from "@/lib/site";

type LeadEmail = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

export async function sendLeadEmail(lead: LeadEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const inbox = process.env.CONTACT_INBOX ?? site.email;
  const from =
    process.env.EMAIL_FROM ?? "Arjovi Solutions <beth.t@example.com>";

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: inbox,
    replyTo: lead.email,
    subject: `New website lead from ${lead.name}`,
    text: [
      "New message from the Arjovi Solutions website.",
      "",
      `Name: ${lead.name}`,
      `Phone: ${lead.phone}`,
      `Email: ${lead.email}`,
      "",
      lead.message,
    ].join("\n"),
  });

  if (error) {
    throw new Error(error.message);
  }
}
