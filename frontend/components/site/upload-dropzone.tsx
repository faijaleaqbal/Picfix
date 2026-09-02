"use client";

import { useRef, useState, type DragEvent } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_FILE_SIZE_MB, validateUpload } from "@/lib/config";

export interface UploadDropzoneProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  hint?: string;
  size?: "default" | "lg";
  className?: string;
  accept?: string;
  onFileSelected?: (file: File) => void;
  selectedName?: string | null;
  busy?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  onFilesSelected?: (files: File[]) => void;
  error?: string | null;
}

export const DEFAULT_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/tiff,image/avif,image/heic,image/heif,image/svg+xml,.jpg,.jpeg,.png,.webp,.gif,.tif,.tiff,.avif,.heic,.heif,.svg";

export function UploadDropzone({
  title = "Select Or Drag & Drop Images Here",
  description,
  buttonLabel = "Select Images",
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
      if (onFileSelected) onFileSelected(file);
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
        "group relative flex cursor-pointer flex-col items-center justify-center text-center transition-all duration-200 select-none",
        "w-full max-w-full overflow-hidden px-4 py-8 sm:px-6 sm:py-10",
        "rounded-md border-[3px] border-dashed",
        dragOver
          ? "border-[#4449A6] bg-[#eff0fa]"
          : "border-[#9da0d9] bg-white hover:border-[#4449A6] hover:bg-[#fafbfe]",
        disabled && "cursor-not-allowed opacity-60",
        size === "lg" ? "min-h-[260px] sm:min-h-[300px]" : "min-h-[170px]",
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
            e.target.value = "";
          }}
        />
      ) : null}

      {/* Title */}
      <p className="mb-2 text-base font-medium text-[#6e6e6e] sm:text-lg">
        {selectedName ? selectedName : title}
      </p>

      {description ? (
        <p className="mb-3 text-xs text-[#8a8ea6]">{description}</p>
      ) : null}

      {/* Action button - Pi7 Signature Teal */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          inputRef.current?.click();
        }}
        className="btnsel flex items-center justify-center gap-2"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin text-white" />
        ) : null}
        <span>{busy ? "Processing..." : selectedName ? "Change Image" : buttonLabel}</span>
      </button>

      {/* Support note */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-[#8a8ea6]">
        <span>Max {MAX_FILE_SIZE_MB} MB</span>
        <span>•</span>
        <span>JPG, PNG, WebP, GIF, TIFF, AVIF, HEIC, SVG</span>
      </div>

      {hint ? <p className="mt-2 text-xs text-[#6e7288]">{hint}</p> : null}

      {shownError ? (
        <div
          role="alert"
          onClick={(e) => e.stopPropagation()}
          className="mt-4 flex max-w-md flex-col items-center gap-2 rounded border border-[#d31b5a]/40 bg-[#ffebee] p-3 text-xs text-[#c62828]"
        >
          <span className="font-semibold">{shownError}</span>
          <button
            type="button"
            onClick={() => {
              setInternalError(null);
              inputRef.current?.click();
            }}
            className="rounded border border-[#c62828]/40 bg-white px-3 py-1 text-[11px] font-medium text-[#c62828] hover:bg-gray-50"
          >
            Try selecting again
          </button>
        </div>
      ) : null}
    </div>
  );
}
