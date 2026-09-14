import {
  formatMoney,
  lineSubtotal,
  optionalWorkNote,
  quoteOptionalItems,
  quotePaymentLines,
  quoteTotals,
  type QuoteBody,
} from "@/lib/quote";
import { quoteHeadings } from "@/lib/quote-headings";
import { site } from "@/lib/site";

type Props = {
  number: number;
  date: string;
  revisedDate?: string;
  body: QuoteBody;
};

export function QuotePreview({ number, date, revisedDate, body }: Props) {
  const totals = quoteTotals(body.lineItems);
  const optionalItems = quoteOptionalItems(body);
  const optionalTotals = quoteTotals(optionalItems);
  const payments = quotePaymentLines(totals.total);

  return (
    <article className="quote-sheet">
      <header className="quote-sheet-brand">
        <strong>{site.legalName}</strong>
        <p>📞 {site.phone}</p>
        <p>✉️ {site.email}</p>
        <p>{site.url.replace("https://", "")}</p>
      </header>
      <p className="quote-sheet-meta">
        Date: {date}
        {revisedDate ? (
          <>
            <br />
            Revised: {revisedDate}
          </>
        ) : null}
        <br />
        Quote #: {number}
        <br />
        To: {body.customerName || "Customer"}
      </p>
      <h1>{body.title || "Project quote"}</h1>
      <h2>{quoteHeadings.scope}</h2>
      {body.projectScope.split("\n").filter(Boolean).map((para) => (
        <p key={para.slice(0, 40)}>{para}</p>
      ))}
      <h2>{quoteHeadings.work}</h2>
      <ol className="quote-scope">
        {body.scopeOfWork.map((section) => (
          <li key={section.heading}>
            <strong>{section.heading}</strong>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <h2>{quoteHeadings.cost}</h2>
      <div className="quote-table-wrap">
        <table className="quote-table">
          <thead>
            <tr>
              <th>Task Description</th>
              <th>Labor</th>
              <th>Materials</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {body.lineItems.map((item) => (
              <tr key={item.description}>
                <td>{item.description}</td>
                <td>{formatMoney(item.labor)}</td>
                <td>{formatMoney(item.materials)}</td>
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
      <p className="quote-grand">
        Estimated Project Total: {formatMoney(totals.total)}
      </p>
      {optionalItems.length ? (
        <>
          <h2>{quoteHeadings.optional}</h2>
          <p className="quote-optional-note">{optionalWorkNote}</p>
          <div className="quote-table-wrap">
            <table className="quote-table">
              <thead>
                <tr>
                  <th>Task Description</th>
                  <th>Labor</th>
                  <th>Materials</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {optionalItems.map((item) => (
                  <tr key={item.description}>
                    <td>{item.description}</td>
                    <td>{formatMoney(item.labor)}</td>
                    <td>{formatMoney(item.materials)}</td>
                    <td>{formatMoney(lineSubtotal(item))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Optional Work Total</th>
                  <th>{formatMoney(optionalTotals.labor)}</th>
                  <th>{formatMoney(optionalTotals.materials)}</th>
                  <th>{formatMoney(optionalTotals.total)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="quote-grand">
            Optional Work Total: {formatMoney(optionalTotals.total)}
          </p>
        </>
      ) : null}
      {body.duration ? (
        <>
          <h2>{quoteHeadings.duration}</h2>
          <p>{body.duration}</p>
        </>
      ) : null}
      <h2>{quoteHeadings.payment}</h2>
      <ul>
        {payments.map((line) => (
          <li key={line.label}>
            {line.label}: {formatMoney(line.amount)}
          </li>
        ))}
      </ul>
      {optionalItems.length ? (
        <p className="quote-optional-note">
          Payment amounts are based on the included project total.
        </p>
      ) : null}
      <h2>{quoteHeadings.validity}</h2>
      <p>This quote is valid for {body.validityDays || 30} days.</p>
      <h2>{quoteHeadings.notes}</h2>
      <ul>
        {body.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </article>
  );
}
