import { site } from "@/lib/site";

export function GET() {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${site.name}`,
    `ORG:${site.name}`,
    "TEL;TYPE=CELL,VOICE:+16128075426",
    `EMAIL;TYPE=WORK:${site.email}`,
    `URL:${site.url}`,
    "ADR;TYPE=WORK:;;Otsego;MN;;;US",
    "END:VCARD",
    "",
  ].join("\r\n");

  return new Response(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="arjovi-solutions.vcf"',
    },
  });
}
