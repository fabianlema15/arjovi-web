import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/quotes/ProjectEditor";
import { QuotesStaffNav } from "@/components/quotes/QuotesStaffNav";
import { getProjectAdmin } from "@/lib/portfolio-db";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectAdmin(id);
  if (!project) {
    notFound();
  }

  return (
    <main className="quotes-app">
      <QuotesStaffNav
        current="projects"
        crumb={project.title || "Project"}
      />
      <div className="quotes-list-wrap">
        <ProjectEditor
          project={{
            id: project.id,
            title: project.title,
            description: project.description,
            published: project.published,
            photos: project.photos,
          }}
        />
      </div>
    </main>
  );
}
