import { NextResponse } from "next/server";
import { getPublishedPhotoData } from "@/lib/portfolio-db";
import { decodeImageData } from "@/lib/portfolio-image";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = await getPublishedPhotoData(id);
  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { bytes, contentType } = decodeImageData(photo.data, photo.mediaType);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
