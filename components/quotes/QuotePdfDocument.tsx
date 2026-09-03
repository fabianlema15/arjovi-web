import path from "node:path";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatMoney, quotePayments, quoteTotals, type QuoteBody } from "@/lib/quote";
import { site } from "@/lib/site";

function emojiSrc(name: string) {
  return path.join(process.cwd(), "public/assets/quote", `${name}.png`);
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
    lineHeight: 1.4,
  },
  brand: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: "#0c1a21",
    marginBottom: 4,
  },
  contact: { fontSize: 9, color: "#334", marginBottom: 1 },
  meta: { marginTop: 12, marginBottom: 12, fontSize: 10 },
  h1: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    marginBottom: 8,
    marginTop: 4,
  },
  h2Row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 6,
  },
  emoji: { width: 12, height: 12, marginRight: 5 },
  h2Text: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  p: { marginBottom: 6 },
  item: { marginLeft: 12, marginBottom: 2 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    paddingBottom: 4,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  row: { flexDirection: "row", paddingVertical: 3 },
  colDesc: { width: "46%" },
  colNum: { width: "18%", textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#222",
    marginTop: 6,
    paddingTop: 6,
    fontFamily: "Helvetica-Bold",
  },
  grand: { marginTop: 8, fontFamily: "Helvetica-Bold", fontSize: 12 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#666",
    textAlign: "center",
  },
});

function Heading({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.h2Row} wrap={false}>
      <Image src={emojiSrc(icon)} style={styles.emoji} />
      <Text style={styles.h2Text}>{label}</Text>
    </View>
  );
}

type Props = {
  number: number;
  date: string;
  body: QuoteBody;
};

export function QuotePdfDocument({ number, date, body }: Props) {
  const totals = quoteTotals(body.lineItems);
  const payments = quotePayments(totals.total);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.brand}>{site.legalName}</Text>
        <Text style={styles.contact}>{site.phone}</Text>
        <Text style={styles.contact}>{site.email}</Text>
        <Text style={styles.contact}>{site.url.replace("https://", "")}</Text>
        <View style={styles.meta}>
          <Text>Date: {date}</Text>
          <Text>Quote #: {number}</Text>
          <Text>To: {body.customerName || "Customer"}</Text>
        </View>
        <Text style={styles.h1}>
          {(body.title || "Project quote").replace(
            /^[\p{Extended_Pictographic}\uFE0F\u200D]+\s*/u,
            ""
          )}
        </Text>
        <Heading icon="scope" label="Project Scope" />
        {body.projectScope.split("\n").filter(Boolean).map((para) => (
          <Text key={para.slice(0, 24)} style={styles.p}>
            {para}
          </Text>
        ))}
        <Heading icon="work" label="Scope of Work" />
        {body.scopeOfWork.map((section, index) => (
          <View key={section.heading} wrap={false}>
            <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 6 }}>
              {index + 1}. {section.heading}
            </Text>
            {section.items.map((item) => (
              <Text key={item} style={styles.item}>
                - {item}
              </Text>
            ))}
          </View>
        ))}
        <Heading icon="cost" label="Estimated Cost Breakdown" />
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Task Description</Text>
          <Text style={styles.colNum}>Labor</Text>
          <Text style={styles.colNum}>Materials</Text>
          <Text style={styles.colNum}>Subtotal</Text>
        </View>
        {body.lineItems.map((item) => (
          <View key={item.description} style={styles.row}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colNum}>{formatMoney(item.labor)}</Text>
            <Text style={styles.colNum}>{formatMoney(item.materials)}</Text>
            <Text style={styles.colNum}>
              {formatMoney(item.labor + item.materials)}
            </Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.colDesc}>Estimated Project Total</Text>
          <Text style={styles.colNum}>{formatMoney(totals.labor)}</Text>
          <Text style={styles.colNum}>{formatMoney(totals.materials)}</Text>
          <Text style={styles.colNum}>{formatMoney(totals.total)}</Text>
        </View>
        <Text style={styles.grand}>
          Estimated Project Total: {formatMoney(totals.total)}
        </Text>
        {body.duration ? (
          <>
            <Heading icon="duration" label="Estimated Project Duration" />
            <Text style={styles.p}>{body.duration}</Text>
          </>
        ) : null}
        <Heading icon="payment" label="Payment Terms" />
        <Text style={styles.item}>
          - 25% deposit upon acceptance: {formatMoney(payments.deposit)}
        </Text>
        <Text style={styles.item}>
          - 75% final payment upon completion:{" "}
          {formatMoney(payments.remainder)}
        </Text>
        <Heading icon="validity" label="Quote Validity" />
        <Text style={styles.p}>
          This quote is valid for {body.validityDays || 30} days.
        </Text>
        <Heading icon="notes" label="Notes & Conditions" />
        {body.notes.map((note) => (
          <Text key={note} style={styles.item}>
            - {note}
          </Text>
        ))}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
