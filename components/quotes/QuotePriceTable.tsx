"use client";

import { useState } from "react";
import { formatMoney, lineSubtotal, quoteTotals, type QuoteLineItem } from "@/lib/quote";

type Props = {
  items: QuoteLineItem[];
  onChange: (items: QuoteLineItem[]) => void;
  totalLabel?: string;
};

function parseMoney(text: string) {
  const trimmed = text.trim();
  if (trimmed === "") {
    return 0;
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) {
    return 0;
  }
  return n;
}

function MoneyInput({
  amount,
  onCommit,
}: {
  amount: number;
  onCommit: (value: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(amount === 0 ? "" : String(amount));

  return (
    <input
      type="text"
      inputMode="numeric"
      value={focused ? text : String(amount)}
      onFocus={() => {
        setFocused(true);
        setText(amount === 0 ? "" : String(amount));
      }}
      onChange={(event) => {
        const next = event.target.value.replace(/[^\d.]/g, "");
        setText(next);
        if (next.trim() !== "") {
          onCommit(parseMoney(next));
        }
      }}
      onBlur={() => {
        onCommit(parseMoney(text));
        setFocused(false);
      }}
    />
  );
}

export function QuotePriceTable({
  items,
  onChange,
  totalLabel = "Estimated Project Total",
}: Props) {
  const totals = quoteTotals(items);

  function updateDescription(index: number, value: string) {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, description: value } : item
      )
    );
  }

  function updateMoney(index: number, field: "labor" | "materials", value: number) {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  return (
    <div className="quote-table-wrap">
      <table className="quote-table quote-table-edit">
        <thead>
          <tr>
            <th>Task Description</th>
            <th>Labor</th>
            <th>Materials</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${item.description}-${index}`}>
              <td>
                <input
                  value={item.description}
                  onChange={(event) =>
                    updateDescription(index, event.target.value)
                  }
                />
              </td>
              <td>
                <MoneyInput
                  amount={item.labor}
                  onCommit={(value) => updateMoney(index, "labor", value)}
                />
              </td>
              <td>
                <MoneyInput
                  amount={item.materials}
                  onCommit={(value) => updateMoney(index, "materials", value)}
                />
              </td>
              <td>{formatMoney(lineSubtotal(item))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th>{totalLabel}</th>
            <th>{formatMoney(totals.labor)}</th>
            <th>{formatMoney(totals.materials)}</th>
            <th>{formatMoney(totals.total)}</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
