"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProjectsNewButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function createProject() {
    setBusy(true);
    try {
      const response = await fetch("/api/quotes/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New project" }),
      });
      const payload = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !payload.id) {
        return;
      }
      router.push(`/quotes/projects/${payload.id}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className="btn btn-orange"
      type="button"
      disabled={busy}
      onClick={() => void createProject()}
    >
      {busy ? "Creating…" : "New project"}
    </button>
  );
}
