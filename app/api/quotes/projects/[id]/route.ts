import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireQuoteCookie } from "@/lib/quote-auth";
import {
  deleteProject,
  getProjectAdmin,
  updateProject,
} from "@/lib/portfolio-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireQuoteCookie();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const project = await getProjectAdmin(id);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(project);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireQuoteCookie();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const patch = (await request.json()) as {
    title?: string;
    description?: string;
    published?: boolean;
    sortOrder?: number;
  };
  const project = await updateProject(id, {
    title: typeof patch.title === "string" ? patch.title : undefined,
    description:
      typeof patch.description === "string" ? patch.description : undefined,
    published:
      typeof patch.published === "boolean" ? patch.published : undefined,
    sortOrder:
      typeof patch.sortOrder === "number" ? patch.sortOrder : undefined,
  });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  revalidatePath("/");
  revalidatePath("/quotes/projects");
  revalidatePath(`/quotes/projects/${id}`);
  return NextResponse.json(project);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireQuoteCookie();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await deleteProject(id);
  revalidatePath("/");
  revalidatePath("/quotes/projects");
  return NextResponse.json({ ok: true });
}
