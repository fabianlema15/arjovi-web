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
  pricesLocked?: boolean;
  revisedAt?: string;
};

export function quoteWasEmailed(status: string) {
  return status === "sent" || status === "revised";
}

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

export function roundDollars(value: number) {
  return Math.round(Number(value) || 0);
}

export function quotePaymentLines(total: number) {
  const whole = roundDollars(total);
  if (whole < 1000) {
    return [{ label: "100% upon completion", amount: whole }];
  }
  const deposit = roundDollars(whole * 0.1);
  return [
    { label: "10% deposit upon acceptance", amount: deposit },
    { label: "90% final payment upon completion", amount: whole - deposit },
  ];
}

export function formatMoney(value: number) {
  return roundDollars(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function lineKey(description: string) {
  return description.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function keepLineItemPrices(
  previous: QuoteLineItem[],
  next: QuoteLineItem[]
) {
  if (!previous.length) {
    return next;
  }

  const used = new Set<number>();
  const assigned: (QuoteLineItem | null)[] = next.map(() => null);

  next.forEach((item, index) => {
    const want = lineKey(item.description);
    const match = previous.findIndex(
      (prior, priorIndex) =>
        !used.has(priorIndex) && lineKey(prior.description) === want
    );
    if (match < 0) {
      return;
    }
    used.add(match);
    assigned[index] = {
      ...item,
      labor: previous[match].labor,
      materials: previous[match].materials,
    };
  });

  if (previous.length === next.length) {
    next.forEach((item, index) => {
      if (assigned[index]) {
        return;
      }
      const match = previous.findIndex((_, priorIndex) => !used.has(priorIndex));
      if (match < 0) {
        return;
      }
      used.add(match);
      assigned[index] = {
        ...item,
        labor: previous[match].labor,
        materials: previous[match].materials,
      };
    });
  }

  return next.map((item, index) => assigned[index] ?? item);
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
      "10% deposit upon acceptance",
      "90% final payment upon completion",
    ],
    validityDays: 30,
    notes: [],
  };
}
