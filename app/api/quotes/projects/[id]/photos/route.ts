import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireQuoteCookie } from "@/lib/quote-auth";
import { addPhoto, getProjectAdmin } from "@/lib/portfolio-db";
import { stripDataUrl } from "@/lib/portfolio-image";

type PhotoBody = {
  caption?: string;
  mediaType?: string;
  data?: string;
};

export async function POST(
  request: Request,
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

  const body = (await request.json()) as PhotoBody;
  if (!body.data || typeof body.data !== "string") {
    return NextResponse.json({ error: "Missing image data." }, { status: 400 });
  }

  const mediaType =
    typeof body.mediaType === "string" && body.mediaType.startsWith("image/")
      ? body.mediaType
      : "image/jpeg";
  const data = stripDataUrl(body.data);
  if (!data) {
    return NextResponse.json({ error: "Invalid image data." }, { status: 400 });
  }

  const photo = await addPhoto(id, {
    caption: typeof body.caption === "string" ? body.caption : "",
    mediaType,
    data,
  });
  revalidatePath("/");
  revalidatePath(`/quotes/projects/${id}`);
  return NextResponse.json(photo);
}
