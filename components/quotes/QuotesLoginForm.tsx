"use client";

import { FormEvent, useState } from "react";

export function QuotesLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setError("");
    const response = await fetch("/api/quotes/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setSending(false);
    if (!response.ok) {
      setError("Wrong password.");
      return;
    }
    const next = new URLSearchParams(window.location.search).get("from");
    window.location.href = next?.startsWith("/quotes") ? next : "/quotes";
  }

  return (
    <form className="quotes-login-form" onSubmit={onSubmit}>
      <label>
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      <button className="btn btn-orange" type="submit" disabled={sending}>
        {sending ? "Opening…" : "Open quotes"}
      </button>
      {error ? <p className="form-status err">{error}</p> : null}
    </form>
  );
}
