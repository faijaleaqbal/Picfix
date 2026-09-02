"use client";

/**
 * Shared processing-status UI used by every wired tool page:
 *  - ProcessError  : red banner (friendly message + backend code)
 *  - AiPending     : "AI features coming soon" panel for 501 stubs
 *  - BeforeAfter   : two-up original/result preview from object URLs
 *  - ResultMeta    : size/quality/dpi chips from X-* response headers
 *  - DownloadButton: saves the result blob via <a download>
 */

import type { ReactNode } from "react";
import { Download, ImageIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/config";
import type { ProcessImageResult } from "@/lib/api";

export function ProcessError({
  message,
  code,
  className,
  onRetry,
}: {
  message: string;
  code?: string | null;
  className?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-error/40 bg-error/10 p-4 text-left shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-label-md text-sm font-semibold text-error">{message}</p>
        {code ? (
          <span className="rounded bg-error/20 px-1.5 py-0.5 font-mono text-[10px] text-error shrink-0">
            {code}
          </span>
        ) : null}
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 w-fit rounded-full border border-error/40 bg-surface px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-muted"
        >
          Try Again
        </button>
      ) : null}
    </div>
  );
}

/** Alias for ProcessError for consistent design language */
export const ErrorState = ProcessError;

export function AiPending({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-accent-lavender/40 bg-accent-lavender/10 p-stack-md",
        className
      )}
    >
      <Sparkles className="size-5 shrink-0 text-accent-lavender" />
      <div>
        <p className="font-label-md text-label-md text-primary">
          Picfix AI features coming soon
        </p>
        <p className="font-label-sm text-label-sm text-text-secondary">
          This AI enhancement model is being finalized and will be available shortly.
        </p>
      </div>
    </div>
  );
}

export function LoadingIndicator({
  label = "Processing image…",
  sublabel = "Applying changes, please wait a moment",
  className,
}: {
  label?: string;
  sublabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-surface-container p-4 shadow-sm",
        className
      )}
    >
      <span
        aria-hidden
        className="size-5 shrink-0 animate-spin rounded-full border-2 border-accent-lavender border-t-transparent"
      />
      <div className="min-w-0 flex-1 text-left">
        <p className="font-label-md text-sm font-semibold text-primary">{label}</p>
        {sublabel ? (
          <p className="truncate text-xs text-text-secondary">{sublabel}</p>
        ) : null}
      </div>
    </div>
  );
}

/** Alias for LoadingIndicator */
export const LoadingState = LoadingIndicator;

export function EmptyState({
  title = "No image selected",
  description = "Upload an image from your device to begin editing.",
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-container-low p-8 text-center",
        className
      )}
    >
      <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-surface-container-high text-text-secondary">
        <ImageIcon className="size-6 text-accent-lavender" />
      </div>
      <h4 className="font-label-md text-base font-semibold text-primary">{title}</h4>
      <p className="mt-1 max-w-sm text-xs text-text-secondary">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function BeforeAfter({
  originalUrl,
  resultUrl,
  resultLabel = "Result",
  beforeLabel = "Original",
  className,
}: {
  originalUrl: string | null;
  resultUrl: string | null;
  beforeLabel?: string;
  resultLabel?: string;
  className?: string;
}) {
  const one = originalUrl && !resultUrl;
  return (
    <div
      className={cn(
        "grid gap-stack-sm",
        one ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2",
        className
      )}
    >
      {originalUrl ? (
        <figure className="relative flex min-h-[200px] items-center justify-center overflow-hidden rounded border border-[#d9dcea] bg-[#fafbfe] p-2">
          <figcaption className="absolute left-2 top-2 z-10 rounded bg-[#4956a5] px-2 py-0.5 text-xs font-bold text-white shadow-sm">
            {beforeLabel}
          </figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalUrl}
            alt="Original upload"
            className="max-h-[420px] w-auto max-w-full rounded object-contain"
          />
        </figure>
      ) : null}
      {resultUrl ? (
        <figure className="relative flex min-h-[200px] items-center justify-center overflow-hidden rounded border border-[#d9dcea] bg-[#fafbfe] p-2">
          <figcaption className="absolute left-2 top-2 z-10 rounded bg-[#047e73] px-2 py-0.5 text-xs font-bold text-white shadow-sm">
            {resultLabel}
          </figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resultUrl}
            alt="Processed result"
            className="max-h-[420px] w-auto max-w-full rounded object-contain"
          />
        </figure>
      ) : null}
    </div>
  );
}

export function ResultMeta({
  result,
  originalSize,
  className,
}: {
  result: ProcessImageResult;
  originalSize?: number | null;
  className?: string;
}) {
  const savedBytes = originalSize && originalSize > result.blob.size ? originalSize - result.blob.size : 0;
  const savedPercent = originalSize && savedBytes > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 text-sm",
        className
      )}
    >
      {originalSize ? (
        <span className="text-gray-500">
          Original: <span className="line-through">{formatBytes(originalSize)}</span>
        </span>
      ) : null}
      <span className="font-bold text-[#2b2f52]">
        Result: {formatBytes(result.blob.size)}
      </span>
      {savedPercent > 0 ? (
        <span className="rounded-full bg-[#e6f5ec] px-2.5 py-0.5 text-xs font-bold text-[#1d7a44]">
          {savedPercent}% Saved
        </span>
      ) : null}
      {result.qualityUsed != null ? (
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          Quality: {result.qualityUsed}
        </span>
      ) : null}
      {result.dpi != null ? (
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          DPI: {result.dpi}
        </span>
      ) : null}
    </div>
  );
}

export function DownloadButton({
  onClick,
  label = "Download Result",
  disabled = false,
  className,
  icon,
}: {
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex min-h-[44px] w-full items-center justify-center gap-2 rounded bg-[#047e73] px-6 py-2.5 font-bold text-white shadow transition-all hover:bg-[#036960] active:scale-98 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {icon ?? <Download className="size-4" />}
      {label}
    </button>
  );
}

export function EmptyResultNotice() {
  return (
    <div className="flex items-center gap-2 font-label-sm text-label-sm text-outline">
      <ImageIcon className="size-4" />
      Upload an image, adjust the settings, then run the tool.
    </div>
  );
}

/**
 * Standardized result preview card wrapping BeforeAfter, ResultMeta, and Download
 */
export function ResultCard({
  result,
  originalUrl,
  resultUrl,
  originalSize,
  downloadLabel = "Download Processed Image",
  onDownload,
  onReset,
  className,
}: {
  result: ProcessImageResult;
  originalUrl: string | null;
  resultUrl: string | null;
  originalSize?: number | null;
  downloadLabel?: string;
  onDownload: () => void;
  onReset?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h4 className="font-label-md text-sm font-bold text-primary">Processed Result</h4>
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-text-secondary hover:text-primary transition-colors"
          >
            Clear & Reset
          </button>
        ) : null}
      </div>

      <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} />

      <ResultMeta result={result} originalSize={originalSize} />

      <DownloadButton onClick={onDownload} label={downloadLabel} />
    </div>
  );
}
