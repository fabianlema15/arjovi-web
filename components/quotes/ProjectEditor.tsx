"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Photo = {
  id: string;
  caption: string;
  src: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  published: boolean;
  photos: Photo[];
};

type Props = {
  project: Project;
};

const maxCaptionLength = 120;
const maxPhotos = 12;
const photoMaxBytes = 280_000;

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
}

async function compressPhoto(file: File) {
  const bitmap = await createImageBitmap(file);
  const edges = [1280, 1024, 800, 640];
  let best: Blob | null = null;

  for (const maxEdge of edges) {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      break;
    }
    context.drawImage(bitmap, 0, 0, width, height);
    for (const quality of [0.72, 0.6, 0.5, 0.4, 0.32]) {
      const blob = await canvasToJpeg(canvas, quality);
      if (!blob) {
        continue;
      }
      best = blob;
      if (blob.size <= photoMaxBytes) {
        bitmap.close();
        return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
          type: "image/jpeg",
        });
      }
    }
  }

  bitmap.close();
  if (!best) {
    return file;
  }
  return new File([best], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

export function ProjectEditor({ project: initial }: Props) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [published, setPublished] = useState(initial.published);
  const [photos, setPhotos] = useState(initial.photos);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");

  async function saveDetails(next?: {
    title?: string;
    description?: string;
    published?: boolean;
  }) {
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch(`/api/quotes/projects/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: next?.title ?? title,
          description: next?.description ?? description,
          published: next?.published ?? published,
        }),
      });
      if (!response.ok) {
        setNotice("Could not save project.");
        return;
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function addPhotos(list: FileList | File[]) {
    const incoming = [...list].filter((file) => file.type.startsWith("image/"));
    if (!incoming.length) {
      return;
    }
    setUploading(true);
    setNotice("");
    try {
      const added: Photo[] = [];
      for (const file of incoming) {
        if (photos.length + added.length >= maxPhotos) {
          break;
        }
        const compressed = await compressPhoto(file);
        const dataUrl = await fileToDataUrl(compressed);
        const response = await fetch(
          `/api/quotes/projects/${initial.id}/photos`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mediaType: compressed.type || "image/jpeg",
              data: dataUrl,
              caption: "",
            }),
          }
        );
        const payload = (await response.json()) as Photo & { error?: string };
        if (!response.ok) {
          setNotice(payload.error ?? "Could not upload photo.");
          break;
        }
        added.push({
          id: payload.id,
          caption: payload.caption,
          src: payload.src,
        });
      }
      if (added.length) {
        setPhotos([...photos, ...added]);
        router.refresh();
      } else if (photos.length >= maxPhotos) {
        setNotice(`You can add up to ${maxPhotos} photos per project.`);
      }
    } catch {
      setNotice("Could not upload photo.");
    } finally {
      setUploading(false);
    }
  }

  async function saveCaption(id: string, caption: string) {
    const response = await fetch(`/api/quotes/projects/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption }),
    });
    if (!response.ok) {
      setNotice("Could not save caption.");
    }
  }

  async function removePhoto(id: string) {
    const response = await fetch(`/api/quotes/projects/photos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setNotice("Could not remove photo.");
      return;
    }
    setPhotos(photos.filter((photo) => photo.id !== id));
    router.refresh();
  }

  async function removeProject() {
    if (!window.confirm("Delete this project and all its photos?")) {
      return;
    }
    const response = await fetch(`/api/quotes/projects/${initial.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setNotice("Could not delete project.");
      return;
    }
    router.push("/quotes/projects");
    router.refresh();
  }

  return (
    <div className="quotes-project-editor">
      <div className="quotes-project-fields">
        <label>
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => void saveDetails({ title })}
          />
        </label>
        <label>
          Short description
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onBlur={() => void saveDetails({ description })}
            placeholder="Shown with the project on the website"
          />
        </label>
        <label className="quotes-revised">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => {
              const next = event.target.checked;
              setPublished(next);
              void saveDetails({ published: next });
            }}
          />
          Published on website
        </label>
      </div>

      {notice ? <p className="quotes-notice">{notice}</p> : null}
      {saving ? <p className="quotes-notice">Saving…</p> : null}

      <h2 className="quotes-edit-heading">Photos</h2>
      <p className="quotes-notice">
        First photo is the gallery cover. Large images are compressed
        automatically (up to {maxPhotos}).
      </p>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          if (event.target.files?.length) {
            void addPhotos(event.target.files);
          }
          event.target.value = "";
        }}
      />
      {photos.length ? (
        <ul className="quotes-quote-photos">
          {photos.map((photo, index) => (
            <li key={photo.id}>
              <img
                src={photo.src}
                alt={photo.caption || `Photo ${index + 1}`}
              />
              {index === 0 ? (
                <p className="quotes-notice">Cover photo</p>
              ) : null}
              <input
                type="text"
                value={photo.caption}
                maxLength={maxCaptionLength}
                placeholder="Short description (optional)"
                onChange={(event) => {
                  const caption = event.target.value.slice(0, maxCaptionLength);
                  setPhotos(
                    photos.map((item) =>
                      item.id === photo.id ? { ...item, caption } : item
                    )
                  );
                }}
                onBlur={() => void saveCaption(photo.id, photo.caption)}
              />
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => void removePhoto(photo.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="quotes-project-actions">
        <button
          className="btn btn-ghost"
          type="button"
          disabled={uploading || photos.length >= maxPhotos}
          onClick={() => fileInput.current?.click()}
        >
          {uploading ? "Uploading…" : "Add photo"}
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => void removeProject()}
        >
          Delete project
        </button>
      </div>
    </div>
  );
}
