import { NextResponse } from "next/server";
import { requireQuoteCookie } from "@/lib/quote-auth";
import { getPhotoData } from "@/lib/portfolio-db";
import { decodeImageData } from "@/lib/portfolio-image";

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
  const photo = await getPhotoData(id);
  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { bytes, contentType } = decodeImageData(photo.data, photo.mediaType);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
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
  const patch = (await request.json()) as { caption?: string };
  const { updatePhoto } = await import("@/lib/portfolio-db");
  const photo = await updatePhoto(id, {
    caption: typeof patch.caption === "string" ? patch.caption : undefined,
  });
  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(photo);
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
  const { deletePhoto } = await import("@/lib/portfolio-db");
  await deletePhoto(id);
  return NextResponse.json({ ok: true });
}
