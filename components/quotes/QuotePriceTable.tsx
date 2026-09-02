"use client";

import { formatMoney, lineSubtotal, quoteTotals, type QuoteLineItem } from "@/lib/quote";

type Props = {
  items: QuoteLineItem[];
  onChange: (items: QuoteLineItem[]) => void;
};

export function QuotePriceTable({ items, onChange }: Props) {
  const totals = quoteTotals(items);

  function update(index: number, field: "labor" | "materials" | "description", value: string) {
    const next = items.map((item, itemIndex) => {
      if (itemIndex !== index) {
        return item;
      }
      if (field === "description") {
        return { ...item, description: value };
      }
      return { ...item, [field]: Number(value) || 0 };
    });
    onChange(next);
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
                    update(index, "description", event.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={item.labor}
                  onChange={(event) => update(index, "labor", event.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={item.materials}
                  onChange={(event) =>
                    update(index, "materials", event.target.value)
                  }
                />
              </td>
              <td>{formatMoney(lineSubtotal(item))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th>Estimated Project Total</th>
            <th>{formatMoney(totals.labor)}</th>
            <th>{formatMoney(totals.materials)}</th>
            <th>{formatMoney(totals.total)}</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
