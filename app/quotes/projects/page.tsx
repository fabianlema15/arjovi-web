import Link from "next/link";
import { ProjectsNewButton } from "@/components/quotes/ProjectsNewButton";
import { QuotesStaffNav } from "@/components/quotes/QuotesStaffNav";
import { listProjectsAdmin } from "@/lib/portfolio-db";

export default async function ProjectsIndexPage() {
  const projects = await listProjectsAdmin();

  return (
    <main className="quotes-app">
      <QuotesStaffNav current="projects" />
      <div className="quotes-list-wrap">
        <div className="quotes-project-toolbar">
          <p className="quotes-notice">
            Projects appear on the website gallery. One tile per project; the
            first photo is the cover.
          </p>
          <ProjectsNewButton />
        </div>
        {projects.length === 0 ? (
          <p>No projects yet. Create one and upload photos.</p>
        ) : (
          <table className="quotes-list">
            <thead>
              <tr>
                <th>Project</th>
                <th>Photos</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
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
        )}
      </div>
    </main>
  );
}
