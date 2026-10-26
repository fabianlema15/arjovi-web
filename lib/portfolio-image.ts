export function decodeImageData(data: string, mediaType: string) {
  const raw = data.includes(",") ? data.split(",", 2)[1] : data;
  const bytes = Buffer.from(raw, "base64");
  return {
    bytes,
    contentType: mediaType || "image/jpeg",
  };
}

export function stripDataUrl(dataUrl: string) {
  if (!dataUrl.includes(",")) {
    return dataUrl;
  }
  return dataUrl.split(",", 2)[1] ?? "";
}
