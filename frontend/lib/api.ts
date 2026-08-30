/**
 * Shared backend API client.
 *
 * All tool pages go through `processImage()` — a single place that owns:
 *  - multipart FormData upload (fetch with AbortController timeout)
 *  - parsing the two response shapes the backend emits:
 *      * success → BINARY image/pdf (Content-Type: image/* | application/pdf)
 *      * error   → JSON { error: string, code: string }
 *  - surfacing binary metadata headers (X-Output-Size / X-Quality-Used /
 *    X-DPI) and the filename from Content-Disposition
 *  - friendly error mapping (no raw stack traces)
 *
 * The same logic is mirrored by /tmp/opencode/frontend-fetch-test.js for
 * headless end-to-end verification.
 */

import { API_BASE_URL } from "@/lib/config";

export interface ProcessingMeta {
  /** filename parsed from Content-Disposition, e.g. "photo-compressed.jpg" */
  filename: string;
  /** Content-Type of the binary response, e.g. image/jpeg */
  contentType: string;
  /** X-Output-Size header (bytes) if present */
  outputSize: number | null;
  /** X-Quality-Used header if present */
  qualityUsed: number | null;
  /** X-DPI header if present */
  dpi: number | null;
}

export interface ProcessImageResult extends ProcessingMeta {
  blob: Blob;
}

/** Error codes → friendly copy. Unknown codes fall back to server text. */
const ERROR_COPY: Record<string, string> = {
  INVALID_FILE_TYPE:
    "That file type isn't supported. Please upload an image (JPEG, PNG, WebP, GIF, TIFF, AVIF, HEIC or SVG).",
  FILE_TOO_LARGE: `Your image is too large. The maximum upload size is 15 MB.`,
  TOO_MANY_FILES: "Too many images selected. The limit is 20 images per PDF.",
  MISSING_FILE: "No image was uploaded — please select a file and try again.",
  MISSING_PARAM: "Some required settings are missing. Double-check the values and try again.",
  INVALID_PARAM: "One of the settings is invalid. Check the values and try again.",
  PRESET_NOT_FOUND: "That preset isn't available. Pick another size.",
  IMAGE_PROCESSING_FAILED:
    "We couldn't process this image — it may be corrupted or an unsupported format.",
  QUEUE_TIMEOUT:
    "The server is busy right now. Please wait a moment and try again.",
  AI_NOT_IMPLEMENTED:
    "This AI feature is coming soon — the AI service is not wired up yet.",
  NOT_FOUND: "That endpoint doesn't exist. It may have moved — please refresh.",
  INTERNAL_ERROR: "Something went wrong on our side. Please try again.",
};

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function friendlyError(code: string, serverMessage: string): string {
  const copy = ERROR_COPY[code];
  return copy ? `${copy} (${serverMessage})` : serverMessage;
}

/** Parse `attachment; filename="photo.jpg"` → `photo.jpg` */
export function filenameFromDisposition(disposition: string | null): string {
  if (!disposition) return "result";
  const m = /filename\*?=(?:UTF-8''|")?([^";]+)"?/i.exec(disposition);
  return m ? decodeURIComponent(m[1]) : "result";
}

export const DEFAULT_TIMEOUTS = {
  /** short ops: flip, rotate, grayscale, convert-format */
  shortMs: 20_000,
  /** resize / crop / social / passport */
  mediumMs: 30_000,
  /** compress — iterative quality search, up to 8 encodes */
  compressMs: 90_000,
  /** image-to-pdf */
  pdfMs: 60_000,
  /** AI jobs — submit + poll to completion (10s job timeout + queue wait) */
  aiMs: 120_000,
} as const;

export class TimeoutError extends Error {
  constructor() {
    super(
      "This is taking longer than expected — the image may be very large. Please try a smaller file."
    );
  }
}

/**
 * POST multipart form data to the backend, handle binary/JSON response.
 *
 * @param endpoint API path starting with /api, e.g. "/api/compress"
 * @param formData multipart form data (files + settings)
 * @param timeoutMs abort the request after this long
 */
export async function processImage(
  endpoint: string,
  formData: FormData,
  { timeoutMs = DEFAULT_TIMEOUTS.mediumMs }: { timeoutMs?: number } = {}
): Promise<ProcessImageResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new TimeoutError();
    }
    throw new Error(
      "Couldn't reach the image server. Is the backend running?"
    );
  } finally {
    clearTimeout(timer);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    // Error responses are always JSON: { error, code }
    let code = "INTERNAL_ERROR";
    let message = `Request failed (${response.status})`;
    if (contentType.includes("application/json")) {
      try {
        const body = await response.json();
        code = body.code || code;
        message = body.error || message;
      } catch {
        /* fall through with defaults */
      }
    }
    throw new ApiError(code, friendlyError(code, message));
  }

  // Success = binary payload (image/* or application/pdf).
  // (JSON can never be a success shape from processing endpoints, but the
  // AI /presets endpoints return JSON — those use fetchJson below.)
  const blob = await response.blob();
  if (blob.size === 0) {
    throw new ApiError(
      "INTERNAL_ERROR",
      "The server returned an empty result. Please try again."
    );
  }

  const outputSize = response.headers.get("x-output-size");
  const qualityUsed = response.headers.get("x-quality-used");
  const dpi = response.headers.get("x-dpi");

  return {
    blob,
    filename: filenameFromDisposition(
      response.headers.get("content-disposition")
    ),
    contentType: blob.type || contentType,
    outputSize: outputSize ? Number(outputSize) : null,
    qualityUsed: qualityUsed ? Number(qualityUsed) : null,
    dpi: dpi ? Number(dpi) : null,
  };
}

/**
 * Submit an AI job and poll it to completion.
 *
 * AI endpoints are asynchronous: POST returns 202 { jobId, status,
 * statusUrl }; then GET statusUrl until status is done/failed. On done
 * with a binary result, fetches resultUrl as a Blob. JSON jobs (OCR,
 * face-detect) return result inline in the status payload.
 */
export async function processAiJob(
  endpoint: string,
  formData: FormData,
  {
    timeoutMs = 90_000,
    pollIntervalMs = 1_000,
  }: { timeoutMs?: number; pollIntervalMs?: number } = {}
): Promise<AiJobResult> {
  const submit = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  });

  if (!submit.ok) {
    let code = "INTERNAL_ERROR";
    let message = `Request failed (${submit.status})`;
    try {
      const body = await submit.json();
      code = body.code || code;
      message = body.error || message;
    } catch {
      /* defaults */
    }
    throw new ApiError(code, friendlyError(code, message));
  }

  const accepted = (await submit.json()) as {
    jobId: string;
    status: string;
    statusUrl: string;
  };

  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (Date.now() > deadline) throw new TimeoutError();

    const statusRes = await fetch(`${API_BASE_URL}${accepted.statusUrl}`);
    if (!statusRes.ok) {
      // 404 JOB_NOT_FOUND: the job record expired — treat as failure
      throw new ApiError("JOB_NOT_FOUND", friendlyError("JOB_NOT_FOUND", "That job is no longer available. Please retry."));
    }
    const job = (await statusRes.json()) as {
      jobId: string;
      status: "queued" | "processing" | "done" | "failed";
      error?: string;
      code?: string;
      result?: unknown;
      resultUrl?: string;
    };

    if (job.status === "failed") {
      throw new ApiError(
        job.code || "AI_JOB_FAILED",
        friendlyError(job.code || "AI_JOB_FAILED", job.error || "AI processing failed.")
      );
    }

    if (job.status === "done") {
      if (job.resultUrl) {
        const blobRes = await fetch(`${API_BASE_URL}${job.resultUrl}`);
        if (!blobRes.ok) {
          throw new ApiError("RESULT_NOT_FOUND", friendlyError("RESULT_NOT_FOUND", "The result expired. Please retry."));
        }
        const blob = await blobRes.blob();
        return {
          blob,
          filename: filenameFromDisposition(blobRes.headers.get("content-disposition")),
          contentType: blob.type,
          outputSize: blob.size,
          qualityUsed: null,
          dpi: null,
          result: job.result ?? null,
        };
      }
      return {
        blob: new Blob(),
        filename: "result",
        contentType: "application/json",
        outputSize: null,
        qualityUsed: null,
        dpi: null,
        result: job.result ?? null,
      };
    }

    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
}

export interface AiJobResult extends ProcessImageResult {
  /** JSON payload for OCR/face-detect jobs (null for binary jobs) */
  result: unknown;
}

/** GET a JSON endpoint (e.g. /api/passport-photo/presets). */
export async function fetchJson<T>(endpoint: string, timeoutMs = 10_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new TimeoutError();
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Trigger a browser download of a processed blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
