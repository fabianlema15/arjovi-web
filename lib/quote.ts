export type QuoteAttachment = {
  mediaType: string;
  url: string;
  filename?: string;
};

export type QuoteLineItem = {
  description: string;
  labor: number;
  materials: number;
};

export type QuoteSection = {
  heading: string;
  items: string[];
};

export type QuoteBody = {
  customerName: string;
  customerEmail: string;
  title: string;
  projectScope: string;
  scopeOfWork: QuoteSection[];
  lineItems: QuoteLineItem[];
  duration: string;
  paymentTerms: string[];
  validityDays: number;
  notes: string[];
};

export function lineSubtotal(item: QuoteLineItem) {
  return roundMoney(item.labor + item.materials);
}

export function quoteTotals(items: QuoteLineItem[]) {
  const labor = roundMoney(items.reduce((sum, item) => sum + item.labor, 0));
  const materials = roundMoney(
    items.reduce((sum, item) => sum + item.materials, 0)
  );
  return {
    labor,
    materials,
    total: roundMoney(labor + materials),
  };
}

export function roundMoney(value: number) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function quotePayments(total: number) {
  const deposit = roundMoney(total * 0.25);
  return {
    deposit,
    remainder: roundMoney(total - deposit),
  };
}

export function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function emptyQuoteBody(): QuoteBody {
  return {
    customerName: "",
    customerEmail: "",
    title: "",
    projectScope: "",
    scopeOfWork: [],
    lineItems: [],
    duration: "",
    paymentTerms: [
      "25% deposit upon acceptance",
      "75% final payment upon completion",
    ],
    validityDays: 30,
    notes: [],
  };
}
