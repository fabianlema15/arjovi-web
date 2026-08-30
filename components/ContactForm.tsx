"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle"
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          phone: data.get("phone"),
          email: data.get("email"),
          message: data.get("message"),
          honey: data.get("honey"),
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      form.reset();
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <input
        type="text"
        name="honey"
        className="hp"
        tabIndex={-1}
        autoComplete="off"
      />
      <label>
        Name
        <input type="text" name="name" autoComplete="name" required />
      </label>
      <label>
        Phone
        <input type="tel" name="phone" autoComplete="tel" required />
      </label>
      <label>
        Email
        <input type="email" name="email" autoComplete="email" required />
      </label>
      <label>
        Message
        <textarea name="message" rows={5} required />
      </label>
      <button className="btn btn-orange" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
      {status === "ok" ? (
        <p className="form-status ok" role="status">
          Thank you for contacting us. We will get back to you as soon as
          possible.
        </p>
      ) : null}
      {status === "err" ? (
        <p className="form-status err" role="status">
          Oops, there was an error sending your message. Please try again later,
          or call (612) 807-5426.
        </p>
      ) : null}
    </form>
  );
}
