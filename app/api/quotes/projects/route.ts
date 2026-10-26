import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireQuoteCookie } from "@/lib/quote-auth";
import { createProject, listProjectsAdmin } from "@/lib/portfolio-db";

export async function GET() {
  try {
    await requireQuoteCookie();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await listProjectsAdmin();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  try {
    await requireQuoteCookie();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { title?: string };
  const project = await createProject(
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim()
      : "New project"
  );
  revalidatePath("/");
  revalidatePath("/quotes/projects");
  return NextResponse.json(project);
}
