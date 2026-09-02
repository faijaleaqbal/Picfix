"use client";

import { useRef, useState, type DragEvent } from "react";
import { CloudUpload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MAX_FILE_SIZE_MB,
  validateUpload,
} from "@/lib/config";

export interface UploadDropzoneProps {
  /** Main headline inside the drop zone */
  title?: string;
  /** Helper copy under the headline */
  description?: string;
  /** Label of the inner select button */
  buttonLabel?: string;
  /** File-type hint shown under the button */
  hint?: string;
  /** Larger (workspace) presentation used by canvas-style pages */
  size?: "default" | "lg";
  className?: string;
  /**
   * File-picker accept attribute. Defaults to every type the backend
   * allows (jpeg, png, webp, gif, tiff, avif, heic, svg).
   */
  accept?: string;
  /** When provided, the zone becomes a real controlled file input. */
  onFileSelected?: (file: File) => void;
  /** Currently selected file name (shows a small chip in the zone). */
  selectedName?: string | null;
  /** Show a spinner in place of the icon (during processing). */
  busy?: boolean;
  /** Disable interaction while a request is in flight. */
  disabled?: boolean;
  /** Allow selecting multiple files (image-to-pdf). */
  multiple?: boolean;
  onFilesSelected?: (files: File[]) => void;
  /** Validation error to display under the zone (overrides internal). */
  error?: string | null;
}

export const DEFAULT_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/tiff,image/avif,image/heic,image/heif,image/svg+xml,.jpg,.jpeg,.png,.webp,.gif,.tif,.tiff,.avif,.heic,.heif,.svg";

/**
 * Shared upload drop zone card used by every tool page.
 *
 * Behavior mode: pass `onFileSelected` to make this a REAL file input
 * with client-side validation (15MB cap + image-type check) — errors are
 * shown inline before any upload happens. Without callbacks it stays a
 * presentational element (legacy mock pages).
 */
export function UploadDropzone({
  title = "Drag & Drop Image Here",
  description = "or click to browse from your device",
  buttonLabel = "Select Image",
  hint,
  size = "default",
  className,
  accept = DEFAULT_ACCEPT,
  onFileSelected,
  onFilesSelected,
  selectedName,
  busy = false,
  disabled = false,
  multiple = false,
  error,
}: UploadDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const interactive = Boolean(onFileSelected || onFilesSelected);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    if (onFilesSelected) {
      const invalid = files.find((f) => validateUpload(f));
      if (invalid) {
        setInternalError(validateUpload(invalid)!);
        return;
      }
      setInternalError(null);
      onFilesSelected(files);
      return;
    }
    const file = files[0];
    const err = validateUpload(file);
    if (err) {
      setInternalError(err);
      if (onFileSelected) onFileSelected(file); // let page show error too
      return;
    }
    setInternalError(null);
    if (onFileSelected) onFileSelected(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (!interactive || disabled) return;
    handleFiles(e.dataTransfer?.files ?? null);
  };

  const shownError = error ?? internalError;

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive && !disabled ? 0 : undefined}
      aria-label="Upload image"
      onClick={() => {
        if (interactive && !disabled) inputRef.current?.click();
      }}
      onKeyDown={(e) => {
        if (interactive && !disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-all duration-200 select-none",
        "w-full max-w-full overflow-hidden px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12",
        dragOver
          ? "border-accent-lavender bg-accent-lavender/10 ring-4 ring-accent-lavender/20"
          : "border-border bg-surface-container-low hover:border-accent-lavender hover:bg-surface-container",
        disabled && "cursor-not-allowed opacity-60",
        size === "lg" ? "min-h-[260px] sm:min-h-[340px] md:min-h-[400px]" : "min-h-[200px] sm:min-h-[240px]",
        className
      )}
    >
      {interactive ? (
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = ""; // allow re-selecting the same file
          }}
        />
      ) : null}

      {/* Icon / Spinner */}
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-surface-container-high transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
        {busy ? (
          <Loader2 className="size-7 animate-spin text-accent-lavender" />
        ) : (
          <CloudUpload className="size-7 text-accent-lavender" />
        )}
      </div>

      {/* Title */}
      <h3 className="mb-1 max-w-full truncate px-2 font-headline-md text-base sm:text-lg md:text-xl font-bold text-primary">
        {selectedName ? selectedName : title}
      </h3>

      {/* Helper text */}
      <p className="mb-5 max-w-md px-2 text-xs sm:text-sm text-text-secondary">
        {selectedName ? "Tap to replace with another image" : description}
      </p>

      {/* Touch-friendly Action button */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          inputRef.current?.click();
        }}
        className="flex min-h-[44px] items-center justify-center rounded-full bg-primary px-6 py-2.5 font-label-md text-sm font-semibold text-on-primary shadow-sm transition-transform hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Processing..." : buttonLabel}
      </button>

      {/* Formats & Limit badges */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 px-2 text-[11px] text-text-secondary">
        <span className="rounded-md bg-surface-container-high px-2 py-0.5 font-medium text-accent-lavender">
          Max {MAX_FILE_SIZE_MB} MB
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="text-outline">
          JPG, PNG, WebP, GIF, TIFF, AVIF, HEIC, SVG
        </span>
      </div>

      {hint ? (
        <p className="mt-2 text-xs text-text-secondary">
          {hint}
        </p>
      ) : null}

      {/* Error state with retry option */}
      {shownError ? (
        <div
          role="alert"
          onClick={(e) => e.stopPropagation()}
          className="mt-4 flex max-w-md flex-col items-center gap-2 rounded-xl border border-error/40 bg-error/10 p-3 text-xs text-error"
        >
          <span className="font-semibold">{shownError}</span>
          <button
            type="button"
            onClick={() => {
              setInternalError(null);
              inputRef.current?.click();
            }}
            className="rounded-full border border-error/40 bg-surface px-3 py-1 text-[11px] font-medium text-primary hover:bg-muted"
          >
            Try selecting again
          </button>
        </div>
      ) : null}
    </div>
  );
}
