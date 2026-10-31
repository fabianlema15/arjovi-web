import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireQuoteCookie } from "@/lib/quote-auth";
import { reorderProjects } from "@/lib/portfolio-db";

export async function POST(request: Request) {
  try {
    await requireQuoteCookie();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { orderedIds?: unknown };
  if (
    !Array.isArray(body.orderedIds) ||
    !body.orderedIds.every((id) => typeof id === "string")
  ) {
    return NextResponse.json(
      { error: "orderedIds must be a string array." },
      { status: 400 }
    );
  }

  const projects = await reorderProjects(body.orderedIds);
  revalidatePath("/");
  revalidatePath("/quotes/projects");
  return NextResponse.json(projects);
}
