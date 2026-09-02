"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function QuotesNewButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    const response = await fetch("/api/quotes", { method: "POST" });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      return;
    }
    router.push(`/quotes/${payload.id}`);
  }

  return (
    <button className="btn btn-orange" type="button" onClick={() => void create()} disabled={busy}>
      {busy ? "Creating…" : "New quote"}
    </button>
  );
}
