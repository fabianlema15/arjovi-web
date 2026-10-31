import { ProjectsNewButton } from "@/components/quotes/ProjectsNewButton";
import { ProjectsSortableList } from "@/components/quotes/ProjectsSortableList";
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
          <ProjectsSortableList projects={projects} />
        )}
      </div>
    </main>
  );
}
