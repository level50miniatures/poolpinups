// Dual-mode asset storage:
// - If BLOB_READ_WRITE_TOKEN is set → Vercel Blob (prod).
// - Else → local filesystem under public/ (dev).
//
// saveAsset(folder, filename, buffer) → returns a public URL string
//   Blob mode: full HTTPS URL like "https://....public.blob.vercel-storage.com/folder/filename-XYZ.png"
//   FS mode:   "/folder/filename" (Next.js serves /public statically at root)
//
// deleteAsset(urlOrPath) → no-op-safe (swallows not-found errors)
//
// isBlobMode() → bool helper.

import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";

export function isBlobMode() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function saveAsset(folder, filename, buffer) {
  if (isBlobMode()) {
    const { put } = await import("@vercel/blob");
    const key = `${folder}/${filename}`;
    const result = await put(key, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: guessContentType(filename),
    });
    return result.url;
  }

  // Filesystem mode
  const dir = join(process.cwd(), "public", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buffer);
  return `/${folder}/${filename}`;
}

export async function deleteAsset(urlOrPath) {
  if (!urlOrPath) return;

  if (isBlobMode() && /^https?:\/\//.test(urlOrPath)) {
    try {
      const { del } = await import("@vercel/blob");
      await del(urlOrPath);
    } catch (err) {
      // Swallow — Blob URL may already be gone.
      console.warn("[deleteAsset] Blob delete failed:", err?.message);
    }
    return;
  }

  // Filesystem mode (or a stored /path/ that came from a previous fs-mode save)
  if (urlOrPath.startsWith("/")) {
    const rel = urlOrPath.replace(/^\/+/, "");
    const abs = join(process.cwd(), "public", rel);
    try {
      await unlink(abs);
    } catch (err) {
      if (err?.code !== "ENOENT") {
        console.warn("[deleteAsset] FS unlink failed:", err?.message);
      }
    }
  }
}

function guessContentType(filename) {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "gif": return "image/gif";
    case "webp": return "image/webp";
    case "svg": return "image/svg+xml";
    case "mp3": return "audio/mpeg";
    case "wav": return "audio/wav";
    case "ogg": return "audio/ogg";
    case "m4a": return "audio/mp4";
    default: return "application/octet-stream";
  }
}
