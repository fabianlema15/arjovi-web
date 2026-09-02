"use client";

import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { FormEvent, useMemo, useState } from "react";
import { QuotePreview } from "@/components/quotes/QuotePreview";
import { QuotePriceTable } from "@/components/quotes/QuotePriceTable";
import {
  emptyQuoteBody,
  type QuoteBody,
  type QuoteLineItem,
} from "@/lib/quote";

type SavedMessage = {
  id: string;
  role: string;
  content: string;
};

type SavedQuote = {
  id: string;
  number: number;
  status: string;
  createdAt: string;
  body: QuoteBody | null;
};

type Props = {
  quote: SavedQuote;
  messages: SavedMessage[];
};

export function QuoteWorkspace({ quote, messages: saved }: Props) {
  const [body, setBody] = useState<QuoteBody>(quote.body ?? emptyQuoteBody());
  const [status, setStatus] = useState(quote.status);
  const [input, setInput] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailTo, setEmailTo] = useState(quote.body?.customerEmail ?? "");
  const [notice, setNotice] = useState("");

  const initialMessages = useMemo<UIMessage[]>(
    () =>
      saved.map((message) => ({
        id: message.id,
        role: message.role as UIMessage["role"],
        parts: [{ type: "text" as const, text: message.content }],
      })),
    [saved]
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/quotes/${quote.id}/chat`,
      }),
    [quote.id]
  );

  const chat = useChat({
    messages: initialMessages,
    transport,
    onError(error) {
      setNotice(
        /insufficient_quota|credit_balance_exhausted|no credits/i.test(
          error.message
        )
          ? "OpenAI has no credits left. Add billing at platform.openai.com, then try again."
          : error.message
      );
    },
  });

  const date = new Date(quote.createdAt).toLocaleDateString("en-US");
  const busy = chat.status === "streaming" || chat.status === "submitted";

  async function onChat(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) {
      return;
    }
    setInput("");
    await chat.sendMessage({ text });
  }

  async function draftQuote() {
    setDrafting(true);
    setNotice("");
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 110_000);
    try {
      const response = await fetch(`/api/quotes/${quote.id}/draft`, {
        method: "POST",
        signal: controller.signal,
      });
      const payload = (await response.json()) as {
        error?: string;
        body?: QuoteBody;
        status?: string;
      };
      if (!response.ok) {
        setNotice(payload.error ?? "Could not draft quote.");
        return;
      }
      if (payload.body) {
        setBody(payload.body);
        setEmailTo(payload.body.customerEmail ?? "");
      }
      setStatus(payload.status ?? "ready");
      setNotice("Quote drafted. Edit prices if needed, then download or send.");
    } catch (error) {
      setNotice(
        error instanceof DOMException && error.name === "AbortError"
          ? "Draft timed out. Try again."
          : "Could not draft quote."
      );
    } finally {
      window.clearTimeout(timer);
      setDrafting(false);
    }
  }

  async function persist(next: QuoteBody) {
    setBody(next);
    setSaving(true);
    await fetch(`/api/quotes/${quote.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: next, lineItems: next.lineItems }),
    });
    setSaving(false);
  }

  function onLineItems(items: QuoteLineItem[]) {
    void persist({ ...body, lineItems: items });
  }

  async function sendEmail() {
    setNotice("");
    const response = await fetch(`/api/quotes/${quote.id}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: emailTo }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setNotice(payload.error ?? "Send failed.");
      return;
    }
    setStatus("sent");
    setNotice("Quote emailed.");
  }

  return (
    <div className="quotes-workspace">
      <section className="quotes-chat" aria-label="Quote chat">
        <div className="quotes-thread">
          {chat.messages.length === 0 ? (
            <p className="quotes-empty">
              Paste the job details. The assistant will ask follow-ups, then
              click Draft quote.
            </p>
          ) : null}
          {chat.messages.map((message) => (
            <article
              key={message.id}
              className={`quotes-bubble ${message.role}`}
            >
              {message.parts.map((part, index) =>
                part.type === "text" ? (
                  <p key={index}>{part.text}</p>
                ) : null
              )}
            </article>
          ))}
        </div>
        <form className="quotes-composer" onSubmit={onChat}>
          <textarea
            rows={3}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Job requirements…"
            disabled={busy}
          />
          <div className="quotes-composer-actions">
            <button className="btn btn-orange" type="submit" disabled={busy}>
              {busy ? "Thinking…" : "Send"}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => void draftQuote()}
              disabled={drafting || busy}
            >
              {drafting ? "Drafting…" : "Draft quote"}
            </button>
          </div>
        </form>
      </section>

      <section className="quotes-doc" aria-label="Quote document">
        <div className="quotes-toolbar">
          <label>
            Customer
            <input
              value={body.customerName}
              onChange={(event) =>
                setBody({ ...body, customerName: event.target.value })
              }
              onBlur={() => void persist(body)}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={emailTo}
              onChange={(event) => {
                setEmailTo(event.target.value);
                setBody({ ...body, customerEmail: event.target.value });
              }}
              onBlur={() =>
                void persist({ ...body, customerEmail: emailTo })
              }
            />
          </label>
          <a className="btn btn-ghost" href={`/api/quotes/${quote.id}/pdf`}>
            Download PDF
          </a>
          <button
            className="btn btn-orange"
            type="button"
            onClick={() => void sendEmail()}
          >
            Email quote
          </button>
        </div>
        {notice ? <p className="quotes-notice">{notice}</p> : null}
        {saving ? <p className="quotes-notice">Saving prices…</p> : null}
        <p className="quotes-status">Status: {status}</p>
        {body.lineItems.length ? (
          <>
            <h2 className="quotes-edit-heading">Edit prices</h2>
            <QuotePriceTable items={body.lineItems} onChange={onLineItems} />
            <QuotePreview number={quote.number} date={date} body={body} />
          </>
        ) : (
          <p className="quotes-empty">No quote document yet.</p>
        )}
      </section>
    </div>
  );
}
