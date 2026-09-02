"use client";

import { DefaultChatTransport, type FileUIPart, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { QuotePreview } from "@/components/quotes/QuotePreview";
import { QuotePriceTable } from "@/components/quotes/QuotePriceTable";
import {
  emptyQuoteBody,
  type QuoteAttachment,
  type QuoteBody,
  type QuoteLineItem,
} from "@/lib/quote";

type SavedMessage = {
  id: string;
  role: string;
  content: string;
  attachments?: QuoteAttachment[];
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

const maxPhotos = 4;

function PhotoThumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <li>
      <img src={url} alt="" />
      <button type="button" aria-label="Remove photo" onClick={onRemove}>
        ×
      </button>
    </li>
  );
}

async function compressPhoto(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxEdge = 1600;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return file;
  }
  context.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.82)
  );
  if (!blob) {
    return file;
  }
  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
}

export function QuoteWorkspace({ quote, messages: saved }: Props) {
  const [body, setBody] = useState<QuoteBody>(quote.body ?? emptyQuoteBody());
  const [status, setStatus] = useState(quote.status);
  const [input, setInput] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [drafting, setDrafting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailTo, setEmailTo] = useState(quote.body?.customerEmail ?? "");
  const [notice, setNotice] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);

  const initialMessages = useMemo<UIMessage[]>(
    () =>
      saved.map((message) => ({
        id: message.id,
        role: message.role as UIMessage["role"],
        parts: [
          ...(message.content
            ? [{ type: "text" as const, text: message.content }]
            : []),
          ...(message.attachments ?? []).map(
            (file): FileUIPart => ({
              type: "file",
              mediaType: file.mediaType,
              url: file.url,
              filename: file.filename,
            })
          ),
        ],
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

  async function addPhotos(list: FileList | File[]) {
    const incoming = [...list].filter((file) => file.type.startsWith("image/"));
    const next = [...photos];
    for (const file of incoming) {
      if (next.length >= maxPhotos) {
        break;
      }
      next.push(await compressPhoto(file));
    }
    setPhotos(next);
  }

  async function onChat(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if ((!text && photos.length === 0) || busy) {
      return;
    }
    setInput("");
    const attached = photos;
    setPhotos([]);
    if (attached.length) {
      const transfer = new DataTransfer();
      attached.forEach((file) => transfer.items.add(file));
      await chat.sendMessage(
        text ? { text, files: transfer.files } : { files: transfer.files }
      );
      return;
    }
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
              Paste the job details or add a photo. The assistant will ask
              follow-ups, then click Draft quote.
            </p>
          ) : null}
          {chat.messages.map((message) => (
            <article
              key={message.id}
              className={`quotes-bubble ${message.role}`}
            >
              {message.parts.map((part, index) => {
                if (part.type === "text") {
                  return <p key={index}>{part.text}</p>;
                }
                if (part.type === "file" && part.mediaType.startsWith("image/")) {
                  return (
                    <img
                      key={index}
                      className="quotes-photo"
                      src={part.url}
                      alt={part.filename || "Job photo"}
                    />
                  );
                }
                return null;
              })}
            </article>
          ))}
        </div>
        <form
          className="quotes-composer"
          onSubmit={onChat}
          onPaste={(event) => {
            const files = [...event.clipboardData.files].filter((file) =>
              file.type.startsWith("image/")
            );
            if (files.length) {
              event.preventDefault();
              void addPhotos(files);
            }
          }}
        >
          {photos.length ? (
            <ul className="quotes-photo-list">
              {photos.map((file, index) => (
                <PhotoThumb
                  key={`${file.name}-${file.size}-${index}`}
                  file={file}
                  onRemove={() =>
                    setPhotos(photos.filter((_, item) => item !== index))
                  }
                />
              ))}
            </ul>
          ) : null}
          <textarea
            rows={3}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Job requirements, or add a photo…"
            disabled={busy}
          />
          <div className="quotes-composer-actions">
            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(event) => {
                if (event.target.files?.length) {
                  void addPhotos(event.target.files);
                }
                event.target.value = "";
              }}
            />
            <button
              className="btn btn-ghost"
              type="button"
              disabled={busy || photos.length >= maxPhotos}
              onClick={() => photoInput.current?.click()}
            >
              Add photo
            </button>
            <button
              className="btn btn-orange"
              type="submit"
              disabled={busy || (!input.trim() && photos.length === 0)}
            >
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
