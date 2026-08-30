/**
 * Frontend runtime config (client-safe).
 *
 * NEXT_PUBLIC_* vars are inlined by Next.js at build/dev time.
 * Convention: NEXT_PUBLIC_API_URL points at the API ROOT *without*
 * the /api prefix — e.g. http://localhost:4000 — and endpoints are
 * passed as "/api/..." paths. This keeps production flexible when the
 * API is mounted under a domain or behind a same-origin proxy.
 *
 * Set in .env.local (dev) / .env.production (deploy).
 */

/** Base URL of the backend, no trailing slash, no /api prefix. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

/**
 * Max upload size in bytes. Must match the backend MAX_FILE_SIZE
 * (default 15MB). Client-side validation shows a friendly message
 * before wasting an upload.
 */
export const MAX_FILE_SIZE_BYTES = Number(
  process.env.NEXT_PUBLIC_MAX_FILE_SIZE_BYTES || 15728640
);

export const MAX_FILE_SIZE_MB = Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024));

/** MIME / extension whitelist mirroring backend src/middleware/upload.js */
export const ALLOWED_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "tif",
  "tiff",
  "avif",
  "heic",
  "heif",
  "svg",
];

export function hasAllowedImageExtension(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Client-side pre-upload validation (size + type).
 * Returns an error string, or null when the file is acceptable.
 */
export function validateUpload(file: File): string | null {
  if (!file) return "No file selected.";
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large (${formatBytes(
      file.size
    )}). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`;
  }
  const isImageMime = file.type.startsWith("image/");
  if (!isImageMime && !hasAllowedImageExtension(file.name)) {
    return `"${file.name}" is not a supported image. Allowed: JPEG, PNG, WebP, GIF, TIFF, AVIF, HEIC, SVG.`;
  }
  return null;
}

export function formatBytes(bytes: number, fractionDigits = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(fractionDigits)} MB`;
}
