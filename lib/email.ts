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

function projectLabel(title: string) {
  return title
    .replace(/^[\p{Extended_Pictographic}\uFE0F\u200D]+\s*/u, "")
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function quoteCustomerEmail(opts: {
  number: number;
  customerName: string;
  title: string;
}) {
  const firstName = opts.customerName.trim().split(/\s+/)[0];
  const hello = firstName ? `Hi ${firstName},` : "Hello,";
  const project = projectLabel(opts.title);
  const attached = project
    ? `I’ve attached a PDF with our quote for ${project}.`
    : "I’ve attached a PDF with our quote.";
  const paragraphs = [
    "Thank you for considering ARJOVI Solutions for your project.",
    attached,
    "Please take a look when you have a moment, and let me know if you have any questions or would like anything adjusted. I’m happy to walk through the details.",
  ];
  const signoff = [
    site.owner,
    site.legalName,
    site.phone,
    site.email,
  ];

  return {
    subject: `Quote #${opts.number} from ${site.legalName}`,
    text: [hello, "", ...paragraphs, "", ...signoff].join("\n"),
    html: [
      `<p>${escapeHtml(hello)}</p>`,
      ...paragraphs.map((line) => `<p>${escapeHtml(line)}</p>`),
      `<p>${signoff.map(escapeHtml).join("<br />")}</p>`,
    ].join(""),
  };
}
