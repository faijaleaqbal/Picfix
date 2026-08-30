"use client";

import { useEffect, useState } from "react";
import { CloudUpload, FileText, Trash2, X, FileImage } from "lucide-react";
import { PanelCta } from "@/components/site/panel-cta";
import {
  DownloadButton,
  LoadingIndicator,
  ProcessError,
} from "@/components/site/process-result";
import { DEFAULT_TIMEOUTS } from "@/lib/api";
import { formatBytes, validateUpload } from "@/lib/config";
import { cn } from "@/lib/utils";

const MAX_PDF_IMAGES = 20;

/**
 * Image→PDF composer.
 *
 * Wired to POST /api/image-to-pdf — multipart with the "images" field
 * REPEATED once per file (backend: createMultiUpload('images', 20)).
 * The backend sizes each page to its image; orientation/page-size/
 * margin settings are presentational until the backend supports them.
 */
export function ImageToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [orientation, setOrientation] = useState("Portrait");
  const [pageSize, setPageSize] = useState("A4");
  const [margin, setMargin] = useState("Small");
  const [fileError, setFileError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const addFiles = (incoming: File[]) => {
    setFileError(null);
    for (const f of incoming) {
      const err = validateUpload(f);
      if (err) {
        setFileError(err);
        return;
      }
    }
    setFiles((prev) => {
      const merged = [...prev];
      for (const f of incoming) {
        if (merged.length >= MAX_PDF_IMAGES) {
          setFileError(`Maximum ${MAX_PDF_IMAGES} images per PDF.`);
          break;
        }
        merged.push(f);
      }
      return merged;
    });
  };

  const run = async () => {
    if (files.length === 0) {
      setFileError("Add at least one image.");
      return;
    }
    setProcessing(true);
    setError(null);
    setErrorCode(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    try {
      const fd = new FormData();
      for (const f of files) fd.append("images", f);
      const { processImage } = await import("@/lib/api");
      const out = await processImage("/api/image-to-pdf", fd, {
        timeoutMs: DEFAULT_TIMEOUTS.pdfMs,
      });
      setResultUrl(URL.createObjectURL(out.blob));
      setResultSize(out.blob.size);
    } catch (err) {
      const { ApiError, TimeoutError } = await import("@/lib/api");
      if (err instanceof ApiError) {
        setErrorCode(err.code);
        setError(err.message);
      } else if (err instanceof TimeoutError) {
        setErrorCode("TIMEOUT");
        setError(err.message);
      } else {
        setErrorCode("UNKNOWN");
        setError("Couldn't reach the image server. Is the backend running?");
      }
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultUrl || !resultSize) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "combined.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <>
      {/* Left: Upload & Settings */}
      <div className="flex w-full flex-col gap-stack-lg lg:w-1/3">
        <div className="glass-panel flex flex-col gap-stack-md rounded-xl p-stack-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Image to PDF</h1>
            <p className="mt-2 font-body-md text-body-md text-text-secondary">
              Compile multiple images into a single document.
            </p>
          </div>
          <UploadZone onPick={addFiles} multiple />
        </div>

        <div className="glass-panel flex flex-col gap-stack-md rounded-xl p-stack-md">
          <h2 className="border-b border-border pb-2 font-headline-md text-headline-md text-primary">
            Settings
          </h2>

          {/* Orientation (presentational) */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-primary">Orientation</label>
            <div className="flex gap-2">
              {["Portrait", "Landscape"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setOrientation(option)}
                  className={cn(
                    "flex-1 rounded-md border p-2 text-center font-label-md text-label-md transition-colors",
                    orientation === option
                      ? "border-accent-lavender bg-muted text-primary"
                      : "border-border hover:border-text-secondary text-text-secondary"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Page Size (presentational — backend sizes pages to images) */}
          <div className="flex flex-col gap-2">
            <label htmlFor="pdf-page-size" className="font-label-md text-label-md text-primary">Page Size</label>
            <select
              id="pdf-page-size"
              value={pageSize}
              aria-label="Page size"
              onChange={(e) => setPageSize(e.target.value)}
              className="rounded-md border border-border bg-surface p-2 font-label-md text-label-md text-primary focus:border-accent-lavender focus:ring-2 focus:ring-accent-lavender"
            >
              <option>A4</option>
              <option>Letter</option>
              <option>Fit to image (used by backend)</option>
            </select>
          </div>

          {/* Margin (presentational) */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-primary">Margin</label>
            <div className="flex gap-2">
              {["None", "Small", "Large"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMargin(option)}
                  className={cn(
                    "flex-1 rounded-md border p-2 text-center font-label-md text-label-md transition-colors",
                    margin === option
                      ? "border-accent-lavender bg-muted text-primary"
                      : "border-border hover:border-text-secondary text-text-secondary"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <PanelCta
            label={processing ? "Generating…" : "Generate PDF"}
            icon={<FileText className="size-4" />}
            hint={files.length ? `${files.length} image(s) ready` : "Add images to compose your PDF"}
            disabled={files.length === 0 || processing}
            onClick={run}
          />
        </div>
      </div>

      {/* Right: File List View */}
      <div className="glass-panel flex flex-col rounded-xl p-stack-md lg:w-2/3">
        <div className="mb-stack-md flex items-center justify-between border-b border-border pb-2">
          <h2 className="font-headline-md text-headline-md text-primary">
            Selected Files ({files.length}/{MAX_PDF_IMAGES})
          </h2>
          <button
            type="button"
            onClick={() => {
              setFiles([]);
              setFileError(null);
            }}
            className="flex items-center gap-1 font-label-sm text-label-sm text-text-secondary transition-colors hover:text-error"
          >
            <Trash2 className="text-sm" />
            Clear All
          </button>
        </div>
        <div className="flex flex-grow flex-col gap-stack-sm overflow-y-auto pr-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="group flex items-center gap-4 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-accent-lavender"
            >
              <FileImage className="ml-2 shrink-0 text-text-secondary" />
              <div className="flex flex-grow flex-col">
                <span className="truncate font-label-md text-label-md text-primary">
                  {i + 1}. {file.name}
                </span>
                <span className="font-label-sm text-label-sm text-text-secondary">
                  {formatBytes(file.size)} · page {i + 1}
                </span>
              </div>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="p-2 text-text-secondary transition-colors hover:text-error"
              >
                <X className="size-5" />
              </button>
            </div>
          ))}
          {files.length === 0 ? (
            <p className="py-8 text-center font-body-md text-body-md text-text-secondary">
              No files selected — add images to compose your PDF.
            </p>
          ) : null}
        </div>

        {fileError ? (
          <p role="alert" className="mt-2 rounded-md border border-error/40 bg-error/10 px-3 py-2 font-label-sm text-label-sm text-error">
            {fileError}
          </p>
        ) : null}
        {processing ? <LoadingIndicator label="Building PDF…" className="mt-2" /> : null}
        {error ? <ProcessError message={error} code={errorCode} className="mt-2" /> : null}
        {resultUrl ? (
          <div className="mt-2 flex flex-col gap-stack-sm">
            <a
              href={resultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label-md text-label-md text-accent-lavender underline"
            >
              Preview PDF ({formatBytes(resultSize ?? 0)})
            </a>
            <DownloadButton onClick={download} label="Download PDF" />
          </div>
        ) : null}
      </div>
    </>
  );
}

/** Dashed upload tile used by the left column (real multi-file input). */
function UploadZone({
  onPick,
  multiple,
}: {
  onPick: (files: File[]) => void;
  multiple?: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload images"
      onClick={() => document.getElementById("pdf-upload-input")?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ")
          document.getElementById("pdf-upload-input")?.click();
      }}
      className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-stack-lg text-center transition-all hover:border-accent-lavender hover:bg-muted"
    >
      <CloudUpload className="mb-2 text-4xl text-text-secondary transition-colors group-hover:text-accent-lavender" />
      <span className="font-label-md text-label-md text-primary">
        Click to upload or drag images here
      </span>
      <span className="mt-1 font-label-sm text-label-sm text-text-secondary">
        Supports JPG, PNG, WEBP — up to {MAX_PDF_IMAGES} images
      </span>
      <input
        id="pdf-upload-input"
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onPick(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}
