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
        "group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed text-center transition-colors",
        dragOver
          ? "border-accent-lavender bg-accent-lavender/5"
          : "border-outline-variant bg-surface-container-low hover:border-accent-lavender",
        disabled && "cursor-not-allowed opacity-60",
        size === "lg" ? "min-h-[300px] p-stack-lg md:min-h-[400px]" : "min-h-[200px] p-stack-lg",
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
      {busy ? (
        <Loader2 className="mb-stack-sm size-10 animate-spin text-accent-lavender" />
      ) : (
        <CloudUpload
          className={cn(
            "mb-stack-sm text-text-secondary transition-colors group-hover:text-accent-lavender",
            size === "lg" ? "size-10" : "size-8"
          )}
        />
      )}
      <h3 className="mb-2 font-headline-md text-headline-md text-primary">
        {selectedName ? selectedName : title}
      </h3>
      <p className="mb-stack-md font-body-md text-body-md text-text-secondary">
        {selectedName ? "Click to replace this image" : description}
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          inputRef.current?.click();
        }}
        className="rounded-full border border-border bg-surface-variant px-6 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        {buttonLabel}
      </button>
      {hint ? (
        <p className="mt-stack-md font-label-sm text-label-sm text-text-secondary">
          {hint}
        </p>
      ) : null}
      <p className="mt-2 font-label-sm text-label-sm text-outline">
        Max {MAX_FILE_SIZE_MB} MB · JPG, PNG, WebP, GIF, TIFF, AVIF, HEIC, SVG
      </p>
      {shownError ? (
        <p
          role="alert"
          className="mt-3 max-w-md rounded-md border border-error/40 bg-error/10 px-3 py-2 font-label-sm text-label-sm text-error"
        >
          {shownError}
        </p>
      ) : null}
    </div>
  );
}
