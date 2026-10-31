"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PortfolioProjectAdmin } from "@/lib/portfolio";

type Props = {
  projects: PortfolioProjectAdmin[];
};

export function ProjectsSortableList({ projects: initial }: Props) {
  const router = useRouter();
  const [projects, setProjects] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  async function move(id: string, direction: -1 | 1) {
    const index = projects.findIndex((project) => project.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= projects.length) {
      return;
    }

    const next = [...projects];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    setProjects(next);
    setBusyId(id);
    setNotice("");

    try {
      const response = await fetch("/api/quotes/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: next.map((project) => project.id) }),
      });
      if (!response.ok) {
        setProjects(projects);
        setNotice("Could not update order.");
        return;
      }
      router.refresh();
    } catch {
      setProjects(projects);
      setNotice("Could not update order.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {notice ? <p className="quotes-notice">{notice}</p> : null}
      <p className="quotes-notice">
        Use the arrows to set the order shown on the website gallery.
      </p>
      <table className="quotes-list">
        <thead>
          <tr>
            <th>Order</th>
            <th>Project</th>
            <th>Photos</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => (
            <tr key={project.id}>
              <td>
                <div className="quotes-sort-controls">
                  <button
                    className="btn btn-ghost"
                    type="button"
                    aria-label={`Move ${project.title || "project"} up`}
                    disabled={index === 0 || busyId === project.id}
                    onClick={() => void move(project.id, -1)}
                  >
                    ↑
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    aria-label={`Move ${project.title || "project"} down`}
                    disabled={
                      index === projects.length - 1 || busyId === project.id
                    }
                    onClick={() => void move(project.id, 1)}
                  >
                    ↓
                  </button>
                </div>
              </td>
              <td>
                <Link href={`/quotes/projects/${project.id}`}>
                  {project.title || "Untitled"}
                </Link>
                {project.description ? (
                  <p className="quotes-notice">{project.description}</p>
                ) : null}
              </td>
              <td>{project.photoCount}</td>
              <td>{project.published ? "published" : "draft"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
